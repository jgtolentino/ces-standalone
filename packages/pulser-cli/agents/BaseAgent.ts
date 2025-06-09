import { debug } from 'debug';

const log = debug('pulser:agent');

export interface AgentCapability {
  name: string;
  description: string;
  inputTypes: string[];
  outputTypes: string[];
}

export interface AgentRequest {
  input: string;
  context?: {
    files?: string[];
    language?: string;
    framework?: string;
    sessionHistory?: Array<{ role: string; content: string }>;
    tenant?: string;
  };
  parameters?: Record<string, any>;
  preferences?: {
    verbose?: boolean;
    format?: 'json' | 'markdown' | 'text';
    includeExplanation?: boolean;
  };
}

export interface AgentResponse {
  content: string;
  metadata: {
    agent: string;
    executionMode: 'local' | 'cloud' | 'hybrid';
    model?: string;
    confidence: number;
    executionTime: number;
    tokenCount?: number;
    cost?: number;
  };
  artifacts?: {
    type: 'code' | 'diagram' | 'data' | 'config';
    content: string;
    filename?: string;
  }[];
}

export interface ExecutionPlan {
  mode: 'local' | 'cloud' | 'hybrid';
  model?: string;
  pipeline?: string;
  parameters: Record<string, any>;
}

export interface ExecutionContext {
  request: AgentRequest;
  plan: ExecutionPlan;
  session?: any;
  history?: any[];
}

export abstract class BaseAgent {
  abstract readonly name: string;
  abstract readonly description: string;
  abstract readonly capabilities: AgentCapability[];
  abstract readonly executionMode: 'local' | 'cloud' | 'hybrid';
  abstract readonly version: string;

  protected config: any;

  constructor(config?: any) {
    this.config = config || {};
  }

  async execute(request: AgentRequest): Promise<AgentResponse> {
    const startTime = Date.now();
    log(`Executing agent ${this.name} with mode ${this.executionMode}`);

    try {
      // Validate request
      await this.validateRequest(request);

      // Prepare execution context
      const context = await this.prepareContext(request);

      // Plan execution
      const plan = await this.planExecution(context);

      // Execute based on mode
      let response: AgentResponse;
      switch (this.executionMode) {
        case 'local':
          response = await this.executeLocal(plan);
          break;
        case 'cloud':
          response = await this.executeCloud(plan);
          break;
        case 'hybrid':
          response = await this.executeHybrid(plan);
          break;
        default:
          throw new Error(`Unsupported execution mode: ${this.executionMode}`);
      }

      // Add execution metadata
      response.metadata = {
        ...response.metadata,
        executionTime: Date.now() - startTime
      };

      log(`Agent ${this.name} completed successfully in ${response.metadata.executionTime}ms`);
      return response;

    } catch (error) {
      log(`Agent ${this.name} execution failed:`, error);
      throw new Error(`Agent execution failed: ${error.message}`);
    }
  }

  protected async validateRequest(request: AgentRequest): Promise<void> {
    if (!request.input || request.input.trim().length === 0) {
      throw new Error('Request input is required');
    }

    // Validate against agent capabilities
    const hasValidCapability = this.capabilities.some(cap =>
      cap.inputTypes.some(type => this.isValidInputType(request, type))
    );

    if (!hasValidCapability) {
      throw new Error(`Request input type not supported by agent ${this.name}`);
    }
  }

  protected isValidInputType(request: AgentRequest, inputType: string): boolean {
    switch (inputType) {
      case 'text':
        return typeof request.input === 'string';
      case 'code':
        return this.looksLikeCode(request.input);
      case 'file':
        return !!request.context?.files?.length;
      case 'natural_language':
        return this.looksLikeNaturalLanguage(request.input);
      default:
        return true;
    }
  }

  protected looksLikeCode(input: string): boolean {
    const codePatterns = [
      /function\s+\w+\s*\(/,
      /class\s+\w+/,
      /import\s+.*from/,
      /const\s+\w+\s*=/,
      /def\s+\w+\s*\(/,
      /public\s+class/,
      /<\w+.*>/,
      /\{\s*\w+.*\}/
    ];
    return codePatterns.some(pattern => pattern.test(input));
  }

  protected looksLikeNaturalLanguage(input: string): boolean {
    const words = input.split(/\s+/);
    const hasCommonWords = ['the', 'and', 'or', 'but', 'with', 'for', 'to', 'a', 'an']
      .some(word => words.includes(word));
    return hasCommonWords && words.length > 3;
  }

  protected async prepareContext(request: AgentRequest): Promise<ExecutionContext> {
    return {
      request,
      plan: await this.planExecution({ request } as ExecutionContext),
      session: null,
      history: []
    };
  }

  protected async planExecution(context: ExecutionContext): Promise<ExecutionPlan> {
    return {
      mode: this.executionMode,
      parameters: context.request.parameters || {}
    };
  }

  // Abstract methods to be implemented by concrete agents
  protected abstract executeLocal(plan: ExecutionPlan): Promise<AgentResponse>;
  protected abstract executeCloud(plan: ExecutionPlan): Promise<AgentResponse>;
  protected abstract executeHybrid(plan: ExecutionPlan): Promise<AgentResponse>;

  // Utility methods for concrete agents
  protected createResponse(
    content: string,
    mode: 'local' | 'cloud' | 'hybrid',
    confidence: number = 0.8,
    model?: string
  ): AgentResponse {
    return {
      content,
      metadata: {
        agent: this.name,
        executionMode: mode,
        model,
        confidence,
        executionTime: 0 // Will be set by execute()
      }
    };
  }

  protected async callOllama(prompt: string, model: string = 'tinyllama:latest'): Promise<string> {
    try {
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          prompt,
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status}`);
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      throw new Error(`Ollama execution failed: ${error.message}`);
    }
  }

  protected async callPulserPipeline(pipeline: string, data: any): Promise<string> {
    try {
      const response = await fetch('http://localhost:3001/api/pipeline/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pipeline,
          data
        })
      });

      if (!response.ok) {
        throw new Error(`Pulser API error: ${response.status}`);
      }

      const result = await response.json();
      return result.content;
    } catch (error) {
      throw new Error(`Pulser pipeline execution failed: ${error.message}`);
    }
  }

  // Agent metadata and discovery
  getMetadata() {
    return {
      name: this.name,
      description: this.description,
      capabilities: this.capabilities,
      executionMode: this.executionMode,
      version: this.version
    };
  }

  canHandle(request: AgentRequest): boolean {
    try {
      // Simple capability check
      return this.capabilities.some(cap =>
        cap.inputTypes.some(type => this.isValidInputType(request, type))
      );
    } catch {
      return false;
    }
  }

  getUsageExample(): string {
    return `pulser ${this.name} "<your input>"`;
  }
}