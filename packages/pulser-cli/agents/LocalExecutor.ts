import { debug } from 'debug';

const log = debug('pulser:executor:local');

export interface ExecutionContext {
  request: any;
  plan: any;
  session?: any;
  history?: any[];
}

export class LocalExecutor {
  async execute(context: ExecutionContext): Promise<{
    content: string;
    tokenCount?: number;
    cost?: number;
    model?: string;
    cacheHit?: boolean;
  }> {
    log('Executing request locally via Ollama');
    
    try {
      const { request, plan } = context;
      const model = plan.model || 'tinyllama:latest';
      const prompt = this.buildPrompt(request, context);
      
      const response = await this.callOllama(prompt, model);
      
      return {
        content: response,
        model,
        cost: 0, // Local execution is free
        tokenCount: this.estimateTokens(prompt + response),
        cacheHit: false
      };
    } catch (error) {
      log('Local execution failed:', error);
      throw new Error(`Local execution failed: ${error.message}`);
    }
  }

  private buildPrompt(request: any, context: ExecutionContext): string {
    let prompt = '';
    
    // Add conversation history for context
    if (context.history && context.history.length > 0) {
      prompt += 'Previous conversation:\n';
      context.history.slice(-5).forEach(msg => {
        prompt += `${msg.role}: ${msg.content}\n`;
      });
      prompt += '\n';
    }
    
    // Add the current request
    if (request.command && request.command !== 'chat') {
      prompt += `Task: ${request.command}\n`;
    }
    
    prompt += `User: ${request.input}\n`;
    prompt += 'Assistant: ';
    
    return prompt;
  }

  private async callOllama(prompt: string, model: string): Promise<string> {
    try {
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          prompt,
          stream: false,
          options: {
            temperature: 0.7,
            num_predict: 2048
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      return data.response || 'No response from model';
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        throw new Error('Ollama service not running. Please start Ollama with: ollama serve');
      }
      throw error;
    }
  }

  private estimateTokens(text: string): number {
    // Rough token estimation (1 token ≈ 4 characters)
    return Math.ceil(text.length / 4);
  }
}