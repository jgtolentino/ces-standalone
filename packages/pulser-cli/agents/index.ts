// Agent System Exports
export { BaseAgent } from './BaseAgent.js';
export type { 
  AgentCapability, 
  AgentRequest, 
  AgentResponse, 
  ExecutionPlan,
  ExecutionContext
} from './BaseAgent.js';

// Executors
export { LocalExecutor } from './LocalExecutor.js';
export { CloudExecutor } from './CloudExecutor.js';
export { HybridExecutor } from './HybridExecutor.js';
export type { HybridStrategy } from './HybridExecutor.js';

// Export type guards
export function isAgentResponse(obj: any): obj is AgentResponse {
  return obj && 
         typeof obj.content === 'string' &&
         obj.metadata &&
         typeof obj.metadata.agent === 'string' &&
         typeof obj.metadata.executionMode === 'string' &&
         typeof obj.metadata.confidence === 'number';
}

export function isAgentRequest(obj: any): obj is AgentRequest {
  return obj && typeof obj.input === 'string';
}