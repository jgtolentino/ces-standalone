import { debug } from 'debug';
import { PulserRouter, CLIRequest, ExecutionPlan } from './PulserRouter.js';
import { SessionManager } from './SessionManager.js';
import { LocalExecutor } from '../agents/LocalExecutor.js';
import { CloudExecutor } from '../agents/CloudExecutor.js';
import { HybridExecutor } from '../agents/HybridExecutor.js';

const log = debug('pulser:orchestrator');

export interface ExecutionResponse {
  content: string;
  plan: ExecutionPlan;
  metadata: {
    executionTime: number;
    tokenCount?: number;
    cost?: number;
    model?: string;
    cacheHit?: boolean;
  };
}

export class CLIOrchestrator {
  private router: PulserRouter;
  private sessionManager: SessionManager;
  private localExecutor: LocalExecutor;
  private cloudExecutor: CloudExecutor;
  private hybridExecutor: HybridExecutor;

  constructor(router: PulserRouter, sessionManager: SessionManager) {
    this.router = router;
    this.sessionManager = sessionManager;
    this.localExecutor = new LocalExecutor();
    this.cloudExecutor = new CloudExecutor();
    this.hybridExecutor = new HybridExecutor();
  }

  async execute(request: CLIRequest): Promise<ExecutionResponse> {
    const startTime = Date.now();
    log('Executing request:', { command: request.command, mode: request.mode });

    try {
      // Route the request to determine execution plan
      const plan = await this.router.route(request);
      log('Execution plan generated:', plan);

      // Execute based on the plan
      const response = await this.executeWithPlan(request, plan);
      
      const executionTime = Date.now() - startTime;
      
      const result: ExecutionResponse = {
        content: response.content,
        plan,
        metadata: {
          executionTime,
          ...(response.tokenCount !== undefined && { tokenCount: response.tokenCount }),
          ...(response.cost !== undefined && { cost: response.cost }),
          ...(response.model !== undefined && { model: response.model }),
          ...(response.cacheHit !== undefined && { cacheHit: response.cacheHit })
        }
      };

      log('Request executed successfully:', {
        mode: plan.mode,
        executionTime,
        tokenCount: response.tokenCount
      });

      return result;

    } catch (error) {
      log('Request execution failed:', error);
      
      // Try fallback execution if primary plan fails
      if (request.mode !== 'local') {
        log('Attempting fallback to local execution');
        try {
          const fallbackPlan: ExecutionPlan = {
            mode: 'local',
            agent: 'chat',
            routing: {
              reason: 'Fallback after primary execution failed',
              confidence: 0.5
            }
          };

          const fallbackResponse = await this.executeWithPlan(request, fallbackPlan);
          const executionTime = Date.now() - startTime;

          return {
            content: fallbackResponse.content + '\n\n_Note: Response generated using local fallback due to cloud service unavailability._',
            plan: fallbackPlan,
            metadata: {
              executionTime,
              ...(fallbackResponse.tokenCount !== undefined && { tokenCount: fallbackResponse.tokenCount }),
              ...(fallbackResponse.cost !== undefined && { cost: fallbackResponse.cost }),
              ...(fallbackResponse.model !== undefined && { model: fallbackResponse.model })
            }
          };
        } catch (fallbackError) {
          log('Fallback execution also failed:', fallbackError);
        }
      }

      throw new Error(`Execution failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async executeWithPlan(request: CLIRequest, plan: ExecutionPlan): Promise<{
    content: string;
    tokenCount?: number;
    cost?: number;
    model?: string;
    cacheHit?: boolean;
  }> {
    
    // Prepare execution context
    const context = await this.prepareExecutionContext(request, plan);
    
    switch (plan.mode) {
      case 'local':
        return this.localExecutor.execute(context);
        
      case 'cloud':
        return this.cloudExecutor.execute(context);
        
      case 'hybrid':
        return this.hybridExecutor.execute(context);
        
      default:
        throw new Error(`Unsupported execution mode: ${plan.mode}`);
    }
  }

  private async prepareExecutionContext(request: CLIRequest, plan: ExecutionPlan): Promise<any> {
    const context = {
      request,
      plan,
      session: null as any,
      history: [] as any[]
    };

    // Load session context if available
    if (request.sessionId) {
      try {
        context.session = await this.sessionManager.resumeSession(request.sessionId);
        context.history = context.session.messages.slice(-10); // Last 10 messages for context
      } catch (error) {
        log('Failed to load session context:', error);
        // Continue without session context
      }
    }

    return context;
  }

  async executeAgent(agentName: string, parameters: any, mode?: string): Promise<ExecutionResponse> {
    const request: CLIRequest = {
      input: JSON.stringify(parameters),
      command: agentName,
      agent: agentName,
      mode: mode as any || 'hybrid'
    };

    return this.execute(request);
  }

  async executePipeline(pipelineName: string, parameters: any, tenant?: string): Promise<ExecutionResponse> {
    const request: CLIRequest = {
      input: JSON.stringify(parameters),
      command: 'pipeline',
      mode: 'cloud',
      ...(tenant && { tenant })
    };

    // Override the routing to force pipeline execution
    const plan: ExecutionPlan = {
      mode: 'cloud',
      agent: 'pipeline',
      pipeline: pipelineName,
      parameters,
      routing: {
        reason: 'Explicit pipeline execution request',
        confidence: 1.0
      }
    };

    const context = await this.prepareExecutionContext(request, plan);
    const response = await this.cloudExecutor.execute(context);

    return {
      content: response.content,
      plan,
      metadata: {
        executionTime: 0, // Will be set by caller
        ...(response.tokenCount !== undefined && { tokenCount: response.tokenCount }),
        ...(response.cost !== undefined && { cost: response.cost }),
        ...(response.model !== undefined && { model: response.model })
      }
    };
  }

  async getSystemHealth(): Promise<{
    overall: 'healthy' | 'degraded' | 'unhealthy';
    local: boolean;
    cloud: boolean;
    capabilities: any;
  }> {
    try {
      const capabilities = await this.router.assessCapabilities();
      
      const local = capabilities.local.available && capabilities.local.healthy;
      const cloud = capabilities.cloud.available && capabilities.cloud.healthy;
      
      let overall: 'healthy' | 'degraded' | 'unhealthy';
      if (local && cloud) {
        overall = 'healthy';
      } else if (local || cloud) {
        overall = 'degraded';
      } else {
        overall = 'unhealthy';
      }

      return {
        overall,
        local,
        cloud,
        capabilities
      };
    } catch (error) {
      log('Health check failed:', error);
      return {
        overall: 'unhealthy',
        local: false,
        cloud: false,
        capabilities: null
      };
    }
  }

  async getCostEstimate(request: CLIRequest): Promise<{
    local: number;
    cloud: number;
    recommended: {
      mode: string;
      cost: number;
      savings: number;
    };
  }> {
    // Simplified cost estimation
    const inputTokens = request.input.split(' ').length * 1.3; // Rough token estimate
    
    const localCost = 0; // Local execution is free (hardware cost not included)
    const cloudCost = inputTokens * 0.0001; // $0.0001 per token estimate
    
    const savings = cloudCost - localCost;
    const recommendedMode = savings > 0.001 ? 'local' : 'cloud'; // Recommend local if savings > $0.001
    
    return {
      local: localCost,
      cloud: cloudCost,
      recommended: {
        mode: recommendedMode,
        cost: recommendedMode === 'local' ? localCost : cloudCost,
        savings: Math.max(0, savings)
      }
    };
  }

  async optimizeRequest(request: CLIRequest): Promise<CLIRequest> {
    // Request optimization logic
    const optimized = { ...request };
    
    // Optimize input for better performance
    if (optimized.input.length > 4000) {
      log('Long input detected, considering summarization');
      // Could implement input summarization here
    }
    
    // Set optimal parameters based on request type
    if (!optimized.preferences) {
      optimized.preferences = {};
    }
    
    // Auto-detect if request should be cost-sensitive
    const isSimpleQuery = optimized.input.length < 100 && 
                          !optimized.input.includes('analyze') && 
                          !optimized.input.includes('complex');
    
    if (isSimpleQuery) {
      optimized.preferences.costSensitive = true;
    }
    
    return optimized;
  }
}