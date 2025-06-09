import { debug } from 'debug';

const log = debug('pulser:executor:cloud');

export interface ExecutionContext {
  request: any;
  plan: any;
  session?: any;
  history?: any[];
}

export class CloudExecutor {
  private pulserApiUrl: string;
  private authToken?: string;

  constructor(config: { apiUrl?: string; authToken?: string } = {}) {
    this.pulserApiUrl = config.apiUrl || 'https://api.pulser.ai';
    this.authToken = config.authToken || process.env.PULSER_API_TOKEN;
  }

  async execute(context: ExecutionContext): Promise<{
    content: string;
    tokenCount?: number;
    cost?: number;
    model?: string;
    cacheHit?: boolean;
  }> {
    log('Executing request via Pulser cloud pipeline');
    
    try {
      const { request, plan } = context;
      const pipeline = plan.pipeline || 'default-chat';
      const model = plan.model || 'gpt-4-turbo';
      
      const payload = {
        pipeline,
        model,
        input: request.input,
        context: request.context,
        parameters: plan.parameters || {},
        session: context.session,
        history: context.history?.slice(-10) // Last 10 messages for context
      };

      const response = await this.callPulserAPI(payload);
      
      return {
        content: response.content,
        model: response.model,
        cost: response.cost || 0,
        tokenCount: response.tokenCount,
        cacheHit: response.cacheHit || false
      };
    } catch (error) {
      log('Cloud execution failed:', error);
      throw new Error(`Cloud execution failed: ${error.message}`);
    }
  }

  private async callPulserAPI(payload: any): Promise<any> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'Pulser-CLI/4.0.0'
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    try {
      const response = await fetch(`${this.pulserApiUrl}/v1/pipeline/execute`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Pulser API error: ${response.status} - ${errorBody}`);
      }

      const data = await response.json();
      
      if (!data.content) {
        throw new Error('Invalid response from Pulser API: missing content');
      }

      return data;
    } catch (error) {
      if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        throw new Error(`Cannot connect to Pulser API at ${this.pulserApiUrl}. Check your network connection and API URL.`);
      }
      
      if (error.message.includes('401')) {
        throw new Error('Authentication failed. Please check your PULSER_API_TOKEN.');
      }
      
      throw error;
    }
  }

  async estimateCost(request: any, model: string = 'gpt-4-turbo'): Promise<number> {
    try {
      const response = await fetch(`${this.pulserApiUrl}/v1/cost/estimate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.authToken ? `Bearer ${this.authToken}` : undefined
        }.filter(Boolean),
        body: JSON.stringify({
          model,
          input: request.input,
          context: request.context
        })
      });

      if (response.ok) {
        const data = await response.json();
        return data.estimatedCost || 0;
      }
    } catch (error) {
      log('Cost estimation failed:', error);
    }
    
    // Fallback cost estimation based on input length
    const inputLength = (request.input || '').length;
    const contextLength = JSON.stringify(request.context || {}).length;
    const totalChars = inputLength + contextLength;
    
    // Rough estimation: $0.01 per 1K characters for GPT-4
    return Math.max((totalChars / 1000) * 0.01, 0.001);
  }

  async checkHealth(): Promise<{ status: 'healthy' | 'degraded' | 'down'; latency?: number }> {
    const startTime = Date.now();
    
    try {
      const response = await fetch(`${this.pulserApiUrl}/v1/health`, {
        method: 'GET',
        headers: {
          'Authorization': this.authToken ? `Bearer ${this.authToken}` : undefined
        }.filter(Boolean)
      });

      const latency = Date.now() - startTime;

      if (response.ok) {
        return { status: 'healthy', latency };
      } else if (response.status >= 500) {
        return { status: 'down', latency };
      } else {
        return { status: 'degraded', latency };
      }
    } catch (error) {
      return { status: 'down', latency: Date.now() - startTime };
    }
  }

  getAvailableModels(): string[] {
    return [
      'gpt-4-turbo',
      'gpt-4',
      'gpt-3.5-turbo',
      'claude-3-sonnet',
      'claude-3-haiku',
      'gemini-pro',
      'llama-2-70b',
      'code-davinci-002'
    ];
  }

  getAvailablePipelines(): string[] {
    return [
      'default-chat',
      'code-review-comprehensive',
      'code-generation',
      'code-explanation',
      'bug-analysis',
      'performance-optimization',
      'security-audit',
      'documentation-generation',
      'test-generation',
      'refactoring-suggestions'
    ];
  }
}