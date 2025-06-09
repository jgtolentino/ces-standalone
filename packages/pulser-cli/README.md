# Pulser CLI - AI Agent System

A unified AI orchestration CLI that intelligently routes between local (Ollama) and cloud execution for optimal cost, privacy, and performance.

## 🤖 Agent Architecture

The Pulser CLI features a modular agent system with hybrid execution capabilities:

### Core Components

- **BaseAgent**: Abstract foundation for all agents
- **AgentOrchestrator**: Manages agent lifecycle and execution
- **LocalExecutor**: Privacy-first local execution via Ollama
- **CloudExecutor**: High-capability cloud execution via Pulser API
- **HybridExecutor**: Intelligent routing between local and cloud

### Execution Modes

1. **Local Mode**: Private, cost-free execution using Ollama
   - Best for: Simple queries, privacy-sensitive code
   - Requirements: Ollama running locally

2. **Cloud Mode**: Advanced capabilities via Pulser API
   - Best for: Complex analysis, comprehensive reviews
   - Requirements: PULSER_API_TOKEN

3. **Hybrid Mode** (Recommended): Intelligent routing
   - Combines local speed with cloud capabilities
   - Automatic fallback and cost optimization

## 🚀 Quick Start

### Installation

```bash
# Install dependencies
npm install

# Global installation
npm run install-global

# Run demo
npm run demo
```

### Environment Setup

```bash
# Optional: For cloud features
export PULSER_API_TOKEN="your-token"
export PULSER_API_URL="https://api.pulser.ai"

# Optional: Custom Ollama endpoint
export OLLAMA_HOST="http://localhost:11434"
```

### Basic Usage

```bash
# Code review with hybrid execution
pulser codereview app.js

# Review code directly
pulser codereview --code "function test(){}"

# Force local execution
pulser codereview app.js --mode local

# Interactive chat
pulser chat

# System status
pulser status

# List agents
pulser agents list
```

## 🎯 Available Agents

### CodeReview Agent

Comprehensive code analysis with security, performance, and best practices review.

**Capabilities:**
- Code quality analysis
- Security vulnerability detection
- Performance optimization suggestions
- Best practices compliance

**Usage:**
```bash
pulser codereview myfile.js
pulser codereview --code "function example(){}"
pulser review --format json --verbose
```

### Future Agents (Planned)

- **ExplainAgent**: Code explanation and documentation
- **FixAgent**: Automated code fixing and optimization
- **TestAgent**: Test generation and validation
- **RefactorAgent**: Code refactoring suggestions

## 🔧 Configuration

### CLI Configuration File

Location: `config/pulser-cli.yaml`

```yaml
execution_modes:
  local:
    enabled: true
    provider: "ollama"
    models:
      - "tinyllama:latest"
      - "codellama:7b-code"
  
  cloud:
    enabled: true
    provider: "pulser"
    models:
      - "gpt-4-turbo"
      - "claude-3-sonnet"
  
  hybrid:
    enabled: true
    routing_strategy: "intelligent"
    cost_threshold: 0.10
    latency_threshold: 2000

routing_rules:
  code_review:
    complexity_threshold: "medium"
    prefer_cloud_for: ["security", "comprehensive"]
  
  simple_queries:
    max_tokens: 500
    prefer_local: true
```

### Routing Intelligence

The system automatically routes requests based on:

- **Content complexity**: Simple vs. complex analysis
- **Input size**: Token count and file size
- **Service availability**: Local/cloud health status
- **Cost sensitivity**: Budget optimization
- **Privacy requirements**: Local-only processing

## 🔍 Hybrid Execution Strategies

### 1. Local-First
Try local execution first, fallback to cloud if quality is insufficient.

### 2. Parallel Analysis
Run both local and cloud simultaneously, merge results.

### 3. Cloud with Local Summary
Comprehensive cloud analysis with local summary generation.

### 4. Adaptive
Real-time strategy selection based on current conditions.

### 5. Local Fallback
Local-only execution when cloud is unavailable.

## 📊 Monitoring & Observability

### Execution Metadata

Every response includes detailed metadata:

```json
{
  "metadata": {
    "agent": "codereview",
    "executionMode": "hybrid",
    "model": "hybrid(tinyllama,gpt-4-turbo)",
    "confidence": 0.92,
    "executionTime": 1450,
    "tokenCount": 2847,
    "cost": 0.0234,
    "strategy": "parallel-analysis"
  }
}
```

### System Health

```bash
pulser status
```

Displays:
- Overall system health
- Agent availability
- Executor status (local/cloud/hybrid)
- Service latency and costs

## 🧪 Development & Testing

### Running the Demo

```bash
npm run demo
```

The demo showcases:
- System health check
- Agent capabilities
- Code review demonstration
- Auto-selection examples
- Performance metrics

### Local Development

```bash
# Watch mode
npm run dev

# Type checking
npm run typecheck

# Linting
npm run lint

# Tests
npm run test
```

### Creating Custom Agents

Extend the `BaseAgent` class:

```typescript
import { BaseAgent, AgentRequest, AgentResponse, ExecutionPlan } from './BaseAgent.js';

export class MyCustomAgent extends BaseAgent {
  readonly name = 'custom';
  readonly description = 'My custom agent';
  readonly version = '1.0.0';
  readonly executionMode = 'hybrid';

  readonly capabilities = [
    {
      name: 'custom_analysis',
      description: 'Custom analysis capability',
      inputTypes: ['text', 'code'],
      outputTypes: ['markdown', 'json']
    }
  ];

  protected async executeLocal(plan: ExecutionPlan): Promise<AgentResponse> {
    // Local implementation
  }

  protected async executeCloud(plan: ExecutionPlan): Promise<AgentResponse> {
    // Cloud implementation
  }

  protected async executeHybrid(plan: ExecutionPlan): Promise<AgentResponse> {
    // Hybrid implementation
  }
}
```

Register the agent:

```typescript
import { AgentOrchestrator } from './AgentOrchestrator.js';
import { MyCustomAgent } from './MyCustomAgent.js';

const orchestrator = new AgentOrchestrator();
orchestrator.registerAgent('custom', new MyCustomAgent());
```

## 🔒 Security & Privacy

### Privacy-First Design

- **Local execution**: Sensitive code never leaves your machine
- **Privacy mode**: Force local-only processing
- **No data retention**: Local processing without external logging

### Security Features

- **Input validation**: All requests validated before processing
- **Error isolation**: Agent failures don't crash the system
- **Token management**: Secure API token handling
- **Network security**: HTTPS-only cloud communication

## 🚦 Error Handling

### Graceful Degradation

- Cloud failure → Local fallback
- Local failure → Cloud fallback
- Agent failure → Error isolation
- Network issues → Retry with exponential backoff

### Error Types

- **Agent not found**: Unknown agent requested
- **Execution timeout**: Request exceeded time limit
- **Service unavailable**: Executor not responding
- **Invalid input**: Request validation failed

## 📈 Performance Optimization

### Intelligent Caching

- Response caching for repeated queries
- Model prediction caching
- Configuration caching

### Cost Optimization

- Automatic model selection based on complexity
- Cost-aware routing decisions
- Token usage optimization

### Latency Optimization

- Parallel execution when beneficial
- Local-first for simple queries
- Smart prefetching and warming

## 🎯 Roadmap

### Version 4.1 (Planned)
- [ ] Additional built-in agents (explain, fix, test)
- [ ] Enhanced caching layer
- [ ] Plugin system for third-party agents
- [ ] Real-time collaboration features

### Version 4.2 (Planned)
- [ ] Multi-model ensemble execution
- [ ] Advanced cost budgeting
- [ ] Team workspace integration
- [ ] Custom model fine-tuning

### Version 5.0 (Future)
- [ ] Visual agent workflow builder
- [ ] Distributed execution across teams
- [ ] Advanced analytics and insights
- [ ] Enterprise SSO integration

## 📚 API Reference

### AgentOrchestrator

Primary interface for agent management and execution.

```typescript
class AgentOrchestrator {
  async executeRequest(agentName: string, request: AgentRequest): Promise<AgentResponse>
  async findBestAgent(request: AgentRequest): Promise<string | null>
  async listAgents(): Promise<AgentMetadata[]>
  async getSystemStatus(): Promise<SystemStatus>
  registerAgent(name: string, agent: BaseAgent): void
}
```

### BaseAgent

Abstract base class for all agents.

```typescript
abstract class BaseAgent {
  abstract readonly name: string;
  abstract readonly description: string;
  abstract readonly capabilities: AgentCapability[];
  abstract readonly executionMode: 'local' | 'cloud' | 'hybrid';
  
  async execute(request: AgentRequest): Promise<AgentResponse>
  canHandle(request: AgentRequest): boolean
  getMetadata(): AgentMetadata
}
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details on:

- Code standards
- Testing requirements
- Agent development guidelines
- Submission process

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🆘 Support

- **Documentation**: [docs.pulser.ai](https://docs.pulser.ai)
- **Issues**: [GitHub Issues](https://github.com/ai-agency/pulser-cli/issues)
- **Discord**: [Join our community](https://discord.gg/pulser)
- **Email**: support@pulser.ai

---

**Pulser CLI** - Local-first AI with cloud intelligence. Built with ❤️ for developers.