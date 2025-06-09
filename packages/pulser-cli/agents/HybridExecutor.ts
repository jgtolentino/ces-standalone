import { debug } from 'debug';
import { LocalExecutor, ExecutionContext } from './LocalExecutor.js';
import { CloudExecutor } from './CloudExecutor.js';

const log = debug('pulser:executor:hybrid');

export interface HybridStrategy {
  name: string;
  description: string;
  execute: (context: ExecutionContext, local: LocalExecutor, cloud: CloudExecutor) => Promise<any>;
}

export class HybridExecutor {
  private localExecutor: LocalExecutor;
  private cloudExecutor: CloudExecutor;
  private strategies: Map<string, HybridStrategy>;

  constructor(config: { cloudConfig?: any } = {}) {
    this.localExecutor = new LocalExecutor();
    this.cloudExecutor = new CloudExecutor(config.cloudConfig);
    this.strategies = new Map();
    
    this.initializeStrategies();
  }

  async execute(context: ExecutionContext): Promise<{
    content: string;
    tokenCount?: number;
    cost?: number;
    model?: string;
    cacheHit?: boolean;
    strategy?: string;
  }> {
    log('Executing hybrid request with intelligent routing');
    
    try {
      const { request, plan } = context;
      const strategy = plan.strategy || await this.selectStrategy(context);
      
      log(`Using hybrid strategy: ${strategy}`);
      
      const hybridStrategy = this.strategies.get(strategy);
      if (!hybridStrategy) {
        throw new Error(`Unknown hybrid strategy: ${strategy}`);
      }

      const result = await hybridStrategy.execute(context, this.localExecutor, this.cloudExecutor);
      
      return {
        ...result,
        strategy
      };
    } catch (error) {
      log('Hybrid execution failed:', error);
      throw new Error(`Hybrid execution failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async selectStrategy(context: ExecutionContext): Promise<string> {
    const { request, plan } = context;
    
    // Check cloud availability first
    const cloudHealth = await this.cloudExecutor.checkHealth();
    if (cloudHealth.status === 'down') {
      log('Cloud service unavailable, falling back to local-only');
      return 'local-fallback';
    }

    // Analyze request complexity
    const complexity = this.analyzeComplexity(request);
    const inputLength = (request.input || '').length;
    const hasFiles = request.context?.files?.length > 0;
    
    // Strategy selection logic
    if (complexity === 'simple' && inputLength < 500 && !hasFiles) {
      return 'local-first';
    }
    
    if (complexity === 'medium' || (inputLength >= 500 && inputLength < 2000)) {
      return 'parallel-analysis';
    }
    
    if (complexity === 'complex' || inputLength >= 2000 || hasFiles) {
      return 'cloud-with-local-summary';
    }
    
    return 'adaptive';
  }

  private analyzeComplexity(request: any): 'simple' | 'medium' | 'complex' {
    const input = request.input || '';
    const hasCode = /function|class|import|const|def |if |for |while /i.test(input);
    const hasMultipleQuestions = (input.match(/\?/g) || []).length > 1;
    const hasFiles = request.context?.files?.length > 0;
    const wordCount = input.split(/\s+/).length;
    
    if (hasFiles || wordCount > 200 || (hasCode && wordCount > 50)) {
      return 'complex';
    }
    
    if (hasCode || hasMultipleQuestions || wordCount > 50) {
      return 'medium';
    }
    
    return 'simple';
  }

  private initializeStrategies(): void {
    // Strategy 1: Local-first with cloud backup
    this.strategies.set('local-first', {
      name: 'Local-first',
      description: 'Try local execution first, fallback to cloud if needed',
      execute: async (context, local, cloud) => {
        try {
          const localResult = await local.execute(context);
          
          // Validate local result quality
          if (this.isGoodLocalResult(localResult, context)) {
            return localResult;
          }
          
          log('Local result quality insufficient, trying cloud');
          return await cloud.execute(context);
        } catch (error) {
          log('Local execution failed, falling back to cloud');
          return await cloud.execute(context);
        }
      }
    });

    // Strategy 2: Parallel analysis and merge
    this.strategies.set('parallel-analysis', {
      name: 'Parallel Analysis',
      description: 'Run both local and cloud, then merge insights',
      execute: async (context, local, cloud) => {
        const [localResult, cloudResult] = await Promise.allSettled([
          local.execute(context),
          cloud.execute(context)
        ]);

        if (localResult.status === 'fulfilled' && cloudResult.status === 'fulfilled') {
          return this.mergeResults(localResult.value, cloudResult.value);
        }
        
        if (cloudResult.status === 'fulfilled') {
          return cloudResult.value;
        }
        
        if (localResult.status === 'fulfilled') {
          return localResult.value;
        }
        
        throw new Error('Both local and cloud execution failed');
      }
    });

    // Strategy 3: Cloud-primary with local summary
    this.strategies.set('cloud-with-local-summary', {
      name: 'Cloud with Local Summary',
      description: 'Use cloud for comprehensive analysis, local for quick summary',
      execute: async (context, local, cloud) => {
        try {
          const cloudResult = await cloud.execute(context);
          
          // Generate local summary of cloud result
          const summaryContext = {
            ...context,
            request: {
              ...context.request,
              input: `Provide a concise summary of this analysis:\n\n${cloudResult.content}`
            }
          };
          
          try {
            const localSummary = await local.execute(summaryContext);
            return {
              ...cloudResult,
              content: cloudResult.content + '\n\n## Quick Summary\n' + localSummary.content,
              tokenCount: (cloudResult.tokenCount || 0) + (localSummary.tokenCount || 0)
            };
          } catch (summaryError) {
            log('Local summary failed, returning cloud result only');
            return cloudResult;
          }
        } catch (cloudError) {
          log('Cloud execution failed, falling back to local');
          return await local.execute(context);
        }
      }
    });

    // Strategy 4: Adaptive based on context
    this.strategies.set('adaptive', {
      name: 'Adaptive',
      description: 'Dynamically choose approach based on real-time conditions',
      execute: async (context, local, cloud) => {
        const cloudHealth = await cloud.checkHealth();
        const estimatedCost = await cloud.estimateCost(context.request);
        
        // If cost is high and cloud is slow, prefer local
        if (estimatedCost > 0.10 && cloudHealth.latency && cloudHealth.latency > 2000) {
          log('High cost and latency detected, preferring local execution');
          try {
            return await local.execute(context);
          } catch (error) {
            log('Local fallback failed, using cloud despite cost/latency');
            return await cloud.execute(context);
          }
        }
        
        // If cloud is healthy and fast, use cloud
        if (cloudHealth.status === 'healthy' && cloudHealth.latency && cloudHealth.latency < 1000) {
          return await cloud.execute(context);
        }
        
        // Default to parallel execution
        return await this.strategies.get('parallel-analysis')!.execute(context, local, cloud);
      }
    });

    // Strategy 5: Local fallback only
    this.strategies.set('local-fallback', {
      name: 'Local Fallback',
      description: 'Local execution only when cloud is unavailable',
      execute: async (context, local, cloud) => {
        const result = await local.execute(context);
        return {
          ...result,
          content: result.content + '\n\n⚠️ **Note:** This analysis was performed locally due to cloud service unavailability.'
        };
      }
    });
  }

  private isGoodLocalResult(result: any, context: ExecutionContext): boolean {
    const content = result.content || '';
    const input = context.request.input || '';
    
    // Basic quality checks
    if (content.length < 50) return false;
    if (content.includes('I don\'t know') || content.includes('I cannot')) return false;
    if (content.length < input.length * 0.5) return false; // Response should be substantial
    
    // Check for code-specific quality if input contains code
    if (this.hasCode(input)) {
      const hasCodeAnalysis = /analysis|review|issue|improvement|suggestion/i.test(content);
      return hasCodeAnalysis;
    }
    
    return true;
  }

  private hasCode(text: string): boolean {
    return /function|class|import|const|def |if |for |while |\{|\}/i.test(text);
  }

  private mergeResults(localResult: any, cloudResult: any): any {
    const combinedContent = `# Comprehensive Analysis

## Local Analysis
${localResult.content}

## Cloud Analysis
${cloudResult.content}

## Summary
This analysis combines local (fast, private) and cloud (comprehensive) perspectives for a complete review.`;

    return {
      content: combinedContent,
      tokenCount: (localResult.tokenCount || 0) + (cloudResult.tokenCount || 0),
      cost: cloudResult.cost || 0,
      model: `hybrid(${localResult.model},${cloudResult.model})`,
      cacheHit: localResult.cacheHit && cloudResult.cacheHit
    };
  }

  getAvailableStrategies(): Array<{ name: string; description: string }> {
    return Array.from(this.strategies.values()).map(strategy => ({
      name: strategy.name,
      description: strategy.description
    }));
  }

  async getRecommendedStrategy(context: ExecutionContext): Promise<string> {
    return await this.selectStrategy(context);
  }
}