import { BaseAgent, AgentCapability, AgentRequest, AgentResponse, ExecutionPlan } from './BaseAgent.js';
import * as fs from 'fs-extra';
import * as path from 'path';
import { debug } from 'debug';

const log = debug('pulser:agent:codereview');

export class CodeReviewAgent extends BaseAgent {
  readonly name = 'codereview';
  readonly description = 'Comprehensive code review with security analysis, best practices, and improvement suggestions';
  readonly version = '1.0.0';
  readonly executionMode = 'hybrid';

  readonly capabilities: AgentCapability[] = [
    {
      name: 'code_analysis',
      description: 'Analyze code quality, structure, and patterns',
      inputTypes: ['code', 'file'],
      outputTypes: ['markdown', 'json']
    },
    {
      name: 'security_review',
      description: 'Identify security vulnerabilities and risks',
      inputTypes: ['code', 'file'],
      outputTypes: ['markdown', 'json']
    },
    {
      name: 'performance_analysis',
      description: 'Analyze code performance and optimization opportunities',
      inputTypes: ['code', 'file'],
      outputTypes: ['markdown', 'json']
    },
    {
      name: 'best_practices',
      description: 'Review adherence to coding best practices and conventions',
      inputTypes: ['code', 'file'],
      outputTypes: ['markdown', 'json']
    }
  ];

  protected async executeLocal(plan: ExecutionPlan): Promise<AgentResponse> {
    log('Executing code review locally');
    
    const request = plan.parameters.request as AgentRequest;
    const code = await this.extractCode(request);
    
    // Use local Ollama for code review
    const prompt = this.buildCodeReviewPrompt(code, request);
    
    try {
      const review = await this.callOllama(prompt, 'codellama:7b-code');
      const structuredReview = this.parseLocalReview(review, code);
      
      return this.createResponse(
        structuredReview,
        'local',
        0.85,
        'codellama:7b-code'
      );
    } catch (error) {
      throw new Error(`Local code review failed: ${error.message}`);
    }
  }

  protected async executeCloud(plan: ExecutionPlan): Promise<AgentResponse> {
    log('Executing code review in cloud');
    
    const request = plan.parameters.request as AgentRequest;
    const code = await this.extractCode(request);
    
    try {
      // Use cloud pipeline for comprehensive analysis
      const review = await this.callPulserPipeline('code-review-comprehensive', {
        code,
        language: this.detectLanguage(code),
        context: request.context,
        analysisDepth: 'comprehensive'
      });
      
      return this.createResponse(
        review,
        'cloud',
        0.95,
        'gpt-4-code-review'
      );
    } catch (error) {
      throw new Error(`Cloud code review failed: ${error.message}`);
    }
  }

  protected async executeHybrid(plan: ExecutionPlan): Promise<AgentResponse> {
    log('Executing hybrid code review');
    
    const request = plan.parameters.request as AgentRequest;
    const code = await this.extractCode(request);
    
    // Start with local analysis for quick feedback
    const localPrompt = this.buildQuickAnalysisPrompt(code);
    let quickAnalysis = '';
    
    try {
      quickAnalysis = await this.callOllama(localPrompt, 'tinyllama:latest');
    } catch (error) {
      log('Local quick analysis failed, proceeding with cloud only');
    }
    
    // Use cloud for comprehensive analysis
    try {
      const comprehensiveReview = await this.callPulserPipeline('code-review-comprehensive', {
        code,
        language: this.detectLanguage(code),
        context: request.context,
        quickAnalysis,
        analysisDepth: 'comprehensive'
      });
      
      const hybridReview = this.combineAnalysis(quickAnalysis, comprehensiveReview);
      
      return this.createResponse(
        hybridReview,
        'hybrid',
        0.92,
        'hybrid-analysis'
      );
    } catch (error) {
      // Fallback to local if cloud fails
      if (quickAnalysis) {
        return this.createResponse(
          this.formatLocalFallback(quickAnalysis),
          'hybrid',
          0.75,
          'local-fallback'
        );
      }
      throw new Error(`Hybrid code review failed: ${error.message}`);
    }
  }

  private async extractCode(request: AgentRequest): Promise<string> {
    // If files are provided, read them
    if (request.context?.files?.length) {
      const file = request.context.files[0];
      try {
        return await fs.readFile(file, 'utf8');
      } catch (error) {
        throw new Error(`Cannot read file ${file}: ${error.message}`);
      }
    }
    
    // Otherwise use the input directly
    return request.input;
  }

  private detectLanguage(code: string): string {
    // Simple language detection based on patterns
    if (code.includes('function') && code.includes('=>')) return 'javascript';
    if (code.includes('def ') && code.includes(':')) return 'python';
    if (code.includes('public class') && code.includes('{')) return 'java';
    if (code.includes('#include') || code.includes('int main')) return 'c++';
    if (code.includes('const') && code.includes(': ')) return 'typescript';
    if (code.includes('fn ') && code.includes('->')) return 'rust';
    if (code.includes('func ') && code.includes('{')) return 'go';
    if (code.includes('<') && code.includes('/>')) return 'jsx';
    
    return 'unknown';
  }

  private buildCodeReviewPrompt(code: string, request: AgentRequest): string {
    const language = this.detectLanguage(code);
    
    return `Please perform a comprehensive code review of the following ${language} code.

Analyze for:
1. **Code Quality**: Readability, maintainability, structure
2. **Security**: Potential vulnerabilities, input validation, authentication issues  
3. **Performance**: Optimization opportunities, algorithmic efficiency
4. **Best Practices**: Language conventions, design patterns, documentation
5. **Bugs**: Logic errors, edge cases, potential runtime issues

Code to review:
\`\`\`${language}
${code}
\`\`\`

Please provide:
- Overall assessment score (1-10)
- Critical issues (security, bugs)
- Improvement suggestions with specific examples
- Positive aspects worth highlighting

Format as structured markdown.`;
  }

  private buildQuickAnalysisPrompt(code: string): string {
    const language = this.detectLanguage(code);
    
    return `Quick code analysis for ${language} code. Identify:
1. Critical bugs or security issues
2. Major performance problems
3. Code quality score (1-10)

Code:
\`\`\`${language}
${code}
\`\`\`

Keep response concise and focused on critical issues only.`;
  }

  private parseLocalReview(review: string, code: string): string {
    // Structure the local review output
    const language = this.detectLanguage(code);
    const timestamp = new Date().toISOString();
    
    return `# Code Review Report

**Language:** ${language}  
**Timestamp:** ${timestamp}  
**Analysis Mode:** Local (Ollama)  

## Review Analysis

${review}

## Code Metrics
- **Lines of Code:** ${code.split('\n').length}
- **Estimated Complexity:** ${this.estimateComplexity(code)}
- **Analysis Confidence:** 85%

---
*Generated by Pulser CLI CodeReview Agent (Local Mode)*`;
  }

  private combineAnalysis(quickAnalysis: string, comprehensiveReview: string): string {
    return `# Comprehensive Code Review Report

## Quick Analysis Summary
${quickAnalysis}

---

## Detailed Analysis
${comprehensiveReview}

---
*Generated by Pulser CLI CodeReview Agent (Hybrid Mode)*`;
  }

  private formatLocalFallback(quickAnalysis: string): string {
    return `# Code Review Report (Local Fallback)

## Analysis
${quickAnalysis}

⚠️ **Note:** This is a local-only analysis due to cloud service unavailability. 
For comprehensive security and performance analysis, retry when cloud services are available.

---
*Generated by Pulser CLI CodeReview Agent (Local Fallback)*`;
  }

  private estimateComplexity(code: string): string {
    const lines = code.split('\n').length;
    const functions = (code.match(/function|def |fn |func /g) || []).length;
    const conditions = (code.match(/if |switch |case |while |for /g) || []).length;
    
    const complexity = functions * 2 + conditions * 1.5 + lines * 0.1;
    
    if (complexity < 10) return 'Low';
    if (complexity < 30) return 'Medium';
    if (complexity < 60) return 'High';
    return 'Very High';
  }

  // CLI Integration methods
  async reviewFile(filePath: string, options: any = {}): Promise<AgentResponse> {
    const request: AgentRequest = {
      input: '',
      context: {
        files: [filePath],
        language: options.language
      },
      parameters: options,
      preferences: {
        format: options.format || 'markdown',
        verbose: options.verbose || false,
        includeExplanation: true
      }
    };

    return this.execute(request);
  }

  async reviewCode(code: string, language?: string, options: any = {}): Promise<AgentResponse> {
    const request: AgentRequest = {
      input: code,
      context: {
        language: language || this.detectLanguage(code)
      },
      parameters: options,
      preferences: {
        format: options.format || 'markdown',
        verbose: options.verbose || false,
        includeExplanation: true
      }
    };

    return this.execute(request);
  }

  getUsageExample(): string {
    return `
Examples:
  pulser codereview app.js                    # Review a file
  pulser codereview --code "function test(){}" # Review code directly
  pulser codereview app.js --format json     # JSON output
  pulser codereview app.js --verbose         # Detailed analysis
`;
  }
}