import { readFileSync } from 'fs';
import { join } from 'path';

interface Agent {
  name: string;
  role: string;
  status: 'active' | 'ready' | 'executing' | 'completed' | 'failed';
  phases: string[];
  dependencies?: string[];
  config?: any;
}

interface OrchestrationPhase {
  order: number;
  agents: string[];
  execution: 'parallel' | 'sequential' | 'single';
  validation?: string;
  dependencies?: string[];
}

interface AgentExecutionResult {
  agent: string;
  status: 'success' | 'failure' | 'warning';
  duration: number;
  output?: any;
  errors?: string[];
}

class AgentOrchestrator {
  private agents: Map<string, Agent> = new Map();
  private phases: Map<string, OrchestrationPhase> = new Map();
  private executionHistory: AgentExecutionResult[] = [];
  
  constructor() {
    this.loadAgentRegistry();
    this.loadOrchestrationConfig();
  }

  private loadAgentRegistry() {
    try {
      const orchestratorPath = join(process.cwd(), 'packages/agents/orchestrator.yaml');
      const orchestratorConfig = this.parseYamlFile(orchestratorPath);
      
      // Load core agents
      orchestratorConfig.agent_registry.core_agents.forEach((agent: Agent) => {
        this.agents.set(agent.name, { ...agent, status: 'active' });
      });
      
      // Load acceleration agents
      orchestratorConfig.agent_registry.acceleration_agents.forEach((agent: Agent) => {
        this.agents.set(agent.name, { ...agent, status: 'ready' });
      });
      
      console.log(`Loaded ${this.agents.size} agents into registry`);
    } catch (error) {
      console.error('Failed to load agent registry:', error);
    }
  }

  private loadOrchestrationConfig() {
    try {
      const orchestratorPath = join(process.cwd(), 'packages/agents/orchestrator.yaml');
      const orchestratorConfig = this.parseYamlFile(orchestratorPath);
      
      // Load deployment sequence
      Object.entries(orchestratorConfig.deployment_sequence).forEach(([phaseKey, phase]: [string, any]) => {
        this.phases.set(phaseKey, phase as OrchestrationPhase);
      });
      
      console.log(`Loaded ${this.phases.size} orchestration phases`);
    } catch (error) {
      console.error('Failed to load orchestration config:', error);
    }
  }

  private parseYamlFile(filePath: string): any {
    // Simple YAML parser for agent configs (in production, use proper YAML library)
    const content = readFileSync(filePath, 'utf-8');
    // This is a simplified parser - in production use js-yaml or similar
    return JSON.parse(content.replace(/^#.*$/gm, '').replace(/\n/g, ' '));
  }

  async executePhase(phaseId: string): Promise<AgentExecutionResult[]> {
    const phase = this.phases.get(phaseId);
    if (!phase) {
      throw new Error(`Phase ${phaseId} not found`);
    }

    console.log(`🚀 Executing Phase: ${phaseId}`);
    console.log(`Agents: ${phase.agents.join(', ')}`);
    console.log(`Execution Mode: ${phase.execution}`);

    const results: AgentExecutionResult[] = [];

    try {
      if (phase.execution === 'parallel') {
        // Execute agents in parallel
        const promises = phase.agents.map(agentName => this.executeAgent(agentName));
        const parallelResults = await Promise.allSettled(promises);
        
        parallelResults.forEach((result, index) => {
          const agentName = phase.agents[index];
          if (result.status === 'fulfilled') {
            results.push(result.value);
          } else {
            results.push({
              agent: agentName,
              status: 'failure',
              duration: 0,
              errors: [result.reason.message]
            });
          }
        });
      } else {
        // Execute agents sequentially
        for (const agentName of phase.agents) {
          const result = await this.executeAgent(agentName);
          results.push(result);
          
          // Stop on failure in sequential mode
          if (result.status === 'failure') {
            console.error(`❌ Agent ${agentName} failed, stopping phase execution`);
            break;
          }
        }
      }

      // Run validation if specified
      if (phase.validation) {
        console.log(`🔍 Running validation with ${phase.validation}`);
        const validationResult = await this.executeAgent(phase.validation);
        results.push(validationResult);
      }

      this.executionHistory.push(...results);
      return results;

    } catch (error) {
      console.error(`❌ Phase ${phaseId} execution failed:`, error);
      throw error;
    }
  }

  async executeAgent(agentName: string): Promise<AgentExecutionResult> {
    const agent = this.agents.get(agentName);
    if (!agent) {
      throw new Error(`Agent ${agentName} not found in registry`);
    }

    const startTime = Date.now();
    console.log(`🤖 Executing Agent: ${agentName} (${agent.role})`);

    try {
      // Update agent status
      agent.status = 'executing';
      this.agents.set(agentName, agent);

      // Check dependencies
      if (agent.dependencies) {
        const dependencyCheck = await this.checkDependencies(agent.dependencies);
        if (!dependencyCheck.success) {
          throw new Error(`Dependencies not met: ${dependencyCheck.missing.join(', ')}`);
        }
      }

      // Simulate agent execution (in production, this would call the actual agent)
      const executionResult = await this.simulateAgentExecution(agentName, agent);

      const duration = Date.now() - startTime;
      
      // Update agent status
      agent.status = executionResult.success ? 'completed' : 'failed';
      this.agents.set(agentName, agent);

      const result: AgentExecutionResult = {
        agent: agentName,
        status: executionResult.success ? 'success' : 'failure',
        duration,
        output: executionResult.output,
        errors: executionResult.errors
      };

      console.log(`✅ Agent ${agentName} completed in ${duration}ms`);
      return result;

    } catch (error) {
      const duration = Date.now() - startTime;
      agent.status = 'failed';
      this.agents.set(agentName, agent);

      console.error(`❌ Agent ${agentName} failed:`, error);
      
      return {
        agent: agentName,
        status: 'failure',
        duration,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  async checkDependencies(dependencies: string[]): Promise<{ success: boolean; missing: string[] }> {
    const missing: string[] = [];
    
    for (const dep of dependencies) {
      // Check if dependency is available (simplified check)
      const available = await this.isDependencyAvailable(dep);
      if (!available) {
        missing.push(dep);
      }
    }

    return {
      success: missing.length === 0,
      missing
    };
  }

  private async isDependencyAvailable(dependency: string): Promise<boolean> {
    // Simplified dependency checking
    const availableDependencies = [
      'rag_memory_engine',
      'campaign_database',
      'database_layer',
      'rag_memory_system',
      'database_metadata',
      'schema_repository'
    ];
    
    return availableDependencies.includes(dependency);
  }

  private async simulateAgentExecution(agentName: string, agent: Agent): Promise<{ success: boolean; output?: any; errors?: string[] }> {
    // Simulate realistic execution time
    const executionTime = Math.random() * 2000 + 500; // 500ms to 2.5s
    await new Promise(resolve => setTimeout(resolve, executionTime));

    // Simulate success/failure (95% success rate)
    const success = Math.random() > 0.05;

    if (success) {
      return {
        success: true,
        output: {
          message: `${agentName} executed successfully`,
          timestamp: new Date().toISOString(),
          phase: agent.phases[0]
        }
      };
    } else {
      return {
        success: false,
        errors: [`Simulated execution failure for ${agentName}`]
      };
    }
  }

  getAgentStatus(agentName: string): Agent | undefined {
    return this.agents.get(agentName);
  }

  getAllAgents(): Agent[] {
    return Array.from(this.agents.values());
  }

  getExecutionHistory(): AgentExecutionResult[] {
    return this.executionHistory;
  }

  async executeAcceleratedDeployment(): Promise<void> {
    console.log('🚀 Starting Accelerated Deployment Sequence');
    
    try {
      // Phase 1: D3 Acceleration
      console.log('\n📍 Phase 1: D3 Acceleration (Parallel Execution)');
      const d3Results = await this.executePhase('phase_1_d3');
      const d3Success = d3Results.every(r => r.status === 'success');
      
      if (!d3Success) {
        throw new Error('D3 phase failed, aborting deployment');
      }

      // Phase 2: G1 Deployment
      console.log('\n📍 Phase 2: G1 Deployment (Sequential Execution)');
      const g1Results = await this.executePhase('phase_2_g1');
      const g1Success = g1Results.every(r => r.status === 'success');
      
      if (!g1Success) {
        console.warn('⚠️ G1 phase had issues, but D3 completed successfully');
      }

      console.log('\n✅ Accelerated Deployment Complete!');
      this.printExecutionSummary();

    } catch (error) {
      console.error('\n❌ Accelerated Deployment Failed:', error);
      this.printExecutionSummary();
      throw error;
    }
  }

  private printExecutionSummary(): void {
    console.log('\n📊 Execution Summary:');
    console.log('═'.repeat(50));
    
    const agentSummary = new Map<string, number>();
    this.executionHistory.forEach(result => {
      agentSummary.set(result.status, (agentSummary.get(result.status) || 0) + 1);
    });

    console.log(`Total Executions: ${this.executionHistory.length}`);
    console.log(`Successful: ${agentSummary.get('success') || 0}`);
    console.log(`Failed: ${agentSummary.get('failure') || 0}`);
    console.log(`Warnings: ${agentSummary.get('warning') || 0}`);
    
    const totalDuration = this.executionHistory.reduce((sum, r) => sum + r.duration, 0);
    console.log(`Total Duration: ${(totalDuration / 1000).toFixed(2)}s`);
    
    console.log('\nAgent Status:');
    this.agents.forEach((agent, name) => {
      const statusIcon = agent.status === 'completed' ? '✅' : 
                        agent.status === 'failed' ? '❌' : 
                        agent.status === 'executing' ? '⚡' : '⏳';
      console.log(`  ${statusIcon} ${name}: ${agent.status}`);
    });
  }
}

export default AgentOrchestrator;