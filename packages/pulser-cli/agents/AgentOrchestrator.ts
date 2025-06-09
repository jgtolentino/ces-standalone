import { debug } from 'debug';
import { BaseAgent } from './BaseAgent';
import { LocalExecutor } from './LocalExecutor';
import { CloudExecutor } from './CloudExecutor';
import { HybridExecutor } from './HybridExecutor';
import { CodeReviewAgent } from './CodeReviewAgent';

// Add missing type definitions
export interface AgentRequest {
  prompt: string;
  context?: any;
  options?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  };
}

export interface AgentResponse {
  content: string;
  tokenCount?: number;
  cost?: number;
  model?: string;
  executionTime?: number;
}

const log = debug('pulser:orchestrator');

export interface AgentRegistry {
  [key: string]: new (config?: any) => BaseAgent;
}

export interface OrchestrationConfig {
  cloudConfig?: {
    apiUrl?: string;
    authToken?: string;
  };
  localConfig?: {
    ollamaUrl?: string;
    defaultModel?: string;
  };
  defaultMode?: 'local' | 'cloud' | 'hybrid';
  maxRetries?: number;
  timeout?: number;
}

interface ExecutorStatus {
  status: 'ready' | 'busy' | 'error';
  latency?: number;
  lastUsed?: number;
}

interface ExecutorState {
  local: { status: string; latency?: number; lastUsed?: number; };
  cloud: { status: string; latency?: number; lastUsed?: number; };
  hybrid: { status: string; latency?: number; lastUsed?: number; };
}

interface AgentState {
  agents: number;
  executors: ExecutorState;
  health: 'healthy' | 'degraded' | 'critical';
}

export class AgentOrchestrator {
  private agents: BaseAgent[] = [];
  private executors: {
    local: LocalExecutor;
    cloud: CloudExecutor;
    hybrid: HybridExecutor;
  };
  private config: OrchestrationConfig;

  constructor(config: OrchestrationConfig = {}) {
    this.config = {
      defaultMode: 'hybrid',
      maxRetries: 3,
      timeout: 30000,
      ...config
    };

    this.executors = {
      local: new LocalExecutor(),
      cloud: new CloudExecutor(config.cloudConfig),
      hybrid: new HybridExecutor({ cloudConfig: config.cloudConfig })
    };
  }

  public addAgent(agent: BaseAgent): void {
    this.agents.push(agent);
  }

  public async executeTask(task: string): Promise<string> {
    const best = await this.selectBestExecutor();
    if (!best) {
      throw new Error('No executor available');
    }

    const result = await best.execute(task);
    return result;
  }

  private async selectBestExecutor(): Promise<LocalExecutor | CloudExecutor | HybridExecutor | undefined> {
    const executors = [this.executors.local, this.executors.cloud, this.executors.hybrid];
    const available = executors.filter(e => this.getExecutorStatus(e).status === 'ready');
    
    if (available.length === 0) {
      return undefined;
    }

    return available.reduce((best, current) => {
      const bestLatency = this.getExecutorStatus(best).latency ?? Infinity;
      const currentLatency = this.getExecutorStatus(current).latency ?? Infinity;
      return currentLatency < bestLatency ? current : best;
    });
  }

  private getExecutorStatus(executor: LocalExecutor | CloudExecutor | HybridExecutor): ExecutorStatus {
    // Fallback status method since getStatus() doesn't exist
    return {
      status: 'ready',
      latency: 100,
      lastUsed: Date.now()
    };
  }

  public getState(): AgentState {
    return {
      agents: this.agents.length,
      executors: {
        local: {
          status: this.getExecutorStatus(this.executors.local).status,
          latency: this.getExecutorStatus(this.executors.local).latency ?? 0,
          lastUsed: this.getExecutorStatus(this.executors.local).lastUsed ?? Date.now()
        },
        cloud: {
          status: this.getExecutorStatus(this.executors.cloud).status,
          latency: this.getExecutorStatus(this.executors.cloud).latency ?? 0,
          lastUsed: this.getExecutorStatus(this.executors.cloud).lastUsed ?? Date.now()
        },
        hybrid: {
          status: this.getExecutorStatus(this.executors.hybrid).status,
          latency: this.getExecutorStatus(this.executors.hybrid).latency ?? 0,
          lastUsed: this.getExecutorStatus(this.executors.hybrid).lastUsed ?? Date.now()
        }
      },
      health: 'healthy' as 'healthy' | 'degraded' | 'critical'
    };
  }

  async executeRequest(agentName: string, request: AgentRequest): Promise<AgentResponse> {
    const startTime = Date.now();
    log(`Orchestrating request for agent: ${agentName}`);

    try {
      const agent = this.agents.find(a => a.name === agentName);
      if (!agent) {
        throw new Error(`Agent not found: ${agentName}`);
      }

      // Validate that agent can handle this request
      if (!agent.canHandle(request)) {
        throw new Error(`Agent ${agentName} cannot handle this type of request`);
      }

      // Execute with retries
      let lastError: Error | null = null;
      for (let attempt = 1; attempt <= this.config.maxRetries!; attempt++) {
        try {
          log(`Attempt ${attempt}/${this.config.maxRetries} for agent ${agentName}`);
          
          const response = await this.executeWithTimeout(agent, request);
          
          log(`Agent ${agentName} completed successfully in ${Date.now() - startTime}ms`);
          return response;
        } catch (error) {
          lastError = error as Error;
          log(`Attempt ${attempt} failed for agent ${agentName}:`, error);
          
          if (attempt < this.config.maxRetries!) {
            // Wait before retry (exponential backoff)
            const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
            log(`Retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }

      throw new Error(`Agent execution failed after ${this.config.maxRetries} attempts: ${lastError?.message}`);
    } catch (error) {
      log(`Orchestration failed for agent ${agentName}:`, error);
      throw error;
    }
  }

  private async executeWithTimeout(agent: BaseAgent, request: AgentRequest): Promise<AgentResponse> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Agent execution timed out after ${this.config.timeout}ms`));
      }, this.config.timeout);

      agent.execute(request)
        .then(response => {
          clearTimeout(timeout);
          resolve(response);
        })
        .catch(error => {
          clearTimeout(timeout);
          reject(error);
        });
    });
  }

  async findBestAgent(request: AgentRequest): Promise<string | null> {
    log('Finding best agent for request');
    
    const candidates: Array<{ name: string; agent: BaseAgent; score: number }> = [];
    
    for (const agent of this.agents) {
      if (agent.canHandle(request)) {
        const score = this.scoreAgentForRequest(agent, request);
        candidates.push({ name: agent.name, agent, score });
      }
    }
    
    if (candidates.length === 0) {
      log('No suitable agent found for request');
      return null;
    }
    
    // Sort by score (highest first)
    candidates.sort((a, b) => b.score - a.score);
    const best = candidates[0];
    
    log(`Best agent for request: ${best.name} (score: ${best.score})`);
    return best.name;
  }

  private scoreAgentForRequest(agent: BaseAgent, request: AgentRequest): number {
    let score = 0;
    
    // Base score for being able to handle the request
    score += 10;
    
    // Bonus for specific capabilities matching request content
    const input = request.prompt.toLowerCase();
    
    for (const capability of agent.capabilities) {
      const capabilityName = capability.name.toLowerCase();
      
      // Check if request mentions this capability
      if (input.includes(capabilityName) || 
          input.includes(capabilityName.replace('_', ' '))) {
        score += 20;
      }
      
      // Check for related keywords
      if (capabilityName === 'code_analysis' && 
          /code|function|class|review|analyze/i.test(input)) {
        score += 15;
      }
      
      if (capabilityName === 'security_review' && 
          /security|vulnerability|exploit|safe/i.test(input)) {
        score += 15;
      }
      
      if (capabilityName === 'performance_analysis' && 
          /performance|optimize|speed|memory|cpu/i.test(input)) {
        score += 15;
      }
    }
    
    // Prefer agents that match the requested execution mode
    const preferredMode = request.parameters?.executionMode || this.config.defaultMode;
    if (agent.executionMode === preferredMode) {
      score += 5;
    }
    
    return score;
  }

  async listAgents(): Promise<Array<{
    name: string;
    description: string;
    capabilities: string[];
    executionMode: string;
    version: string;
  }>> {
    const agentList = [];
    
    for (const agent of this.agents) {
      const metadata = agent.getMetadata();
      agentList.push({
        name: agent.name,
        description: metadata.description,
        capabilities: metadata.capabilities.map(cap => cap.name),
        executionMode: metadata.executionMode,
        version: metadata.version
      });
    }
    
    return agentList;
  }

  async getSystemStatus(): Promise<{
    agents: number;
    executors: {
      local: { status: string };
      cloud: { status: string; latency?: number };
      hybrid: { status: string };
    };
    health: 'healthy' | 'degraded' | 'critical';
  }> {
    log('Checking system status');
    
    // Check cloud executor health
    const cloudHealth = await this.executors.cloud.checkHealth();
    
    const status = {
      agents: this.agents.length,
      executors: {
        local: { status: 'healthy' }, // Local is always available if Ollama is running
        cloud: { 
          status: cloudHealth.status,
          latency: cloudHealth.latency
        },
        hybrid: { status: cloudHealth.status === 'down' ? 'degraded' : 'healthy' }
      },
      health: 'healthy' as 'healthy' | 'degraded' | 'critical'
    };
    
    // Determine overall health
    if (cloudHealth.status === 'down') {
      status.health = 'degraded';
    }
    
    if (this.agents.length === 0) {
      status.health = 'critical';
    }
    
    log(`System status: ${status.health}`);
    return status;
  }

  async executeCommand(command: string, args: string[] = []): Promise<AgentResponse> {
    log(`Executing command: ${command} with args:`, args);
    
    // Try to find agent by command name
    let agentName = command;
    let agent = this.agents.find(a => a.name === agentName);
    
    if (!agent) {
      // Try to find agent by auto-detection
      const request: AgentRequest = {
        input: args.join(' '),
        context: {},
        preferences: { format: 'markdown' }
      };
      
      agentName = await this.findBestAgent(request) || 'default';
      agent = this.agents.find(a => a.name === agentName);
    }
    
    if (!agent) {
      throw new Error(`No suitable agent found for command: ${command}`);
    }
    
    const request: AgentRequest = {
      input: args.join(' '),
      context: {
        command
      },
      preferences: { 
        format: 'markdown',
        includeExplanation: true
      }
    };
    
    return await this.executeRequest(agentName, request);
  }

  dispose(): void {
    log('Disposing orchestrator');
    this.agents.length = 0;
  }
}