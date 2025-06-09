import { debug } from 'debug';
import * as yaml from 'yaml';
import * as fs from 'fs-extra';
import * as path from 'path';

const log = debug('pulser:router');

export interface CLIRequest {
  input: string;
  command?: string;
  agent?: string;
  mode?: 'local' | 'cloud' | 'hybrid';
  tenant?: string;
  sessionId?: string;
  preferences?: RequestPreferences;
  context?: RequestContext;
}

export interface RequestPreferences {
  costSensitive?: boolean;
  latencyPriority?: 'low' | 'medium' | 'high';
  privacyMode?: boolean;
  verbose?: boolean;
}

export interface RequestContext {
  files?: string[];
  codeLanguage?: string;
  projectType?: string;
  previousMessages?: Array<{ role: string; content: string }>;
}

export interface RequestClassification {
  complexity: 'simple' | 'medium' | 'complex';
  dataAccess: {
    requiresTenantData: boolean;
    sensitivityLevel: 'low' | 'medium' | 'high';
  };
  performance: {
    latencyRequirement: 'low' | 'medium' | 'high';
    qualityRequirement: 'low' | 'medium' | 'high';
  };
  privacy: {
    containsSensitiveData: boolean;
    requiresLocalProcessing: boolean;
  };
}

export interface ExecutionPlan {
  mode: 'local' | 'cloud' | 'hybrid';
  agent: string;
  pipeline?: string;
  model?: string;
  parameters?: Record<string, any>;
  routing: {
    reason: string;
    confidence: number;
    fallbackPlan?: ExecutionPlan;
  };
}

export interface SystemCapabilities {
  local: {
    available: boolean;
    models: string[];
    healthy: boolean;
    responseTime: number;
  };
  cloud: {
    available: boolean;
    tenants: string[];
    healthy: boolean;
    responseTime: number;
  };
}

export class PulserRouter {
  private config: any;
  private capabilities: SystemCapabilities | null = null;

  constructor(configPath?: string) {
    this.loadConfig(configPath);
  }

  private loadConfig(configPath?: string): void {
    const defaultPath = path.join(__dirname, '../config/pulser-cli.yaml');
    const targetPath = configPath || defaultPath;
    
    try {
      const configContent = fs.readFileSync(targetPath, 'utf8');
      this.config = yaml.parse(configContent);
      log('Configuration loaded successfully');
    } catch (error) {
      log('Failed to load configuration, using defaults');
      this.config = this.getDefaultConfig();
    }
  }

  private getDefaultConfig(): any {
    return {
      execution_modes: {
        local: { enabled: true, provider: 'ollama' },
        cloud: { enabled: true, provider: 'pulser' },
        hybrid: { enabled: true, routing_strategy: 'intelligent' }
      },
      cli: { default_mode: 'hybrid' },
      agents: { builtin: {} },
      routing: { strategy: 'intelligent', rules: [] }
    };
  }

  async route(request: CLIRequest): Promise<ExecutionPlan> {
    log('Routing request:', { command: request.command, agent: request.agent });

    // Assess current system capabilities
    this.capabilities = await this.assessCapabilities();
    
    // Classify the request
    const classification = await this.classifyRequest(request);
    
    // Evaluate constraints
    const constraints = await this.evaluateConstraints(request);
    
    // Generate execution plan
    const plan = await this.generateExecutionPlan({
      request,
      classification,
      capabilities: this.capabilities,
      constraints
    });

    log('Generated execution plan:', plan);
    return plan;
  }

  private async assessCapabilities(): Promise<SystemCapabilities> {
    const [localCapabilities, cloudCapabilities] = await Promise.all([
      this.assessLocalCapabilities(),
      this.assessCloudCapabilities()
    ]);

    return {
      local: localCapabilities,
      cloud: cloudCapabilities
    };
  }

  private async assessLocalCapabilities(): Promise<SystemCapabilities['local']> {
    try {
      const ollamaUrl = this.config.execution_modes?.local?.endpoint || 'http://localhost:11434';
      const start = Date.now();
      
      const response = await fetch(`${ollamaUrl}/api/tags`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });

      if (!response.ok) {
        throw new Error(`Ollama not responding: ${response.status}`);
      }

      const data = await response.json();
      const responseTime = Date.now() - start;

      return {
        available: true,
        models: data.models?.map((m: any) => m.name) || [],
        healthy: responseTime < 2000,
        responseTime
      };
    } catch (error) {
      log('Local capabilities assessment failed:', error);
      return {
        available: false,
        models: [],
        healthy: false,
        responseTime: -1
      };
    }
  }

  private async assessCloudCapabilities(): Promise<SystemCapabilities['cloud']> {
    try {
      const apiUrl = this.config.execution_modes?.cloud?.api_url || 'http://localhost:3001/api';
      const start = Date.now();
      
      const response = await fetch(`${apiUrl}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });

      if (!response.ok) {
        throw new Error(`Cloud API not responding: ${response.status}`);
      }

      const data = await response.json();
      const responseTime = Date.now() - start;

      return {
        available: true,
        tenants: data.tenants || [],
        healthy: responseTime < 3000,
        responseTime
      };
    } catch (error) {
      log('Cloud capabilities assessment failed:', error);
      return {
        available: false,
        tenants: [],
        healthy: false,
        responseTime: -1
      };
    }
  }

  private async classifyRequest(request: CLIRequest): Promise<RequestClassification> {
    const input = request.input.toLowerCase();
    
    // Analyze complexity
    const complexity = this.analyzeComplexity(request);
    
    // Analyze data access requirements
    const dataAccess = this.analyzeDataRequirements(request);
    
    // Analyze performance requirements
    const performance = this.analyzePerformanceNeeds(request);
    
    // Analyze privacy requirements
    const privacy = this.analyzePrivacyRequirements(request);

    return {
      complexity,
      dataAccess,
      performance,
      privacy
    };
  }

  private analyzeComplexity(request: CLIRequest): 'simple' | 'medium' | 'complex' {
    const input = request.input;
    const wordCount = input.split(' ').length;
    
    // Simple: Basic queries, short inputs
    if (wordCount <= 10 && this.isSimpleQuery(input)) {
      return 'simple';
    }
    
    // Complex: Multi-step analysis, cross-tenant queries
    if (wordCount > 50 || this.isComplexQuery(input)) {
      return 'complex';
    }
    
    return 'medium';
  }

  private isSimpleQuery(input: string): boolean {
    const simplePatterns = [
      /^explain\s+\w+/i,
      /^what\s+is\s+\w+/i,
      /^how\s+to\s+\w+/i,
      /^fix\s+\w+/i
    ];
    
    return simplePatterns.some(pattern => pattern.test(input));
  }

  private isComplexQuery(input: string): boolean {
    const complexPatterns = [
      /analyze.*across.*tenants/i,
      /compare.*campaigns/i,
      /generate.*comprehensive/i,
      /optimize.*strategy/i
    ];
    
    return complexPatterns.some(pattern => pattern.test(input));
  }

  private analyzeDataRequirements(request: CLIRequest): RequestClassification['dataAccess'] {
    const input = request.input.toLowerCase();
    const hasTenant = !!request.tenant;
    
    const tenantDataPatterns = [
      /sales.*data/i,
      /campaign.*performance/i,
      /customer.*analytics/i,
      /scout.*insights/i,
      /ces.*score/i
    ];
    
    const requiresTenantData = hasTenant || tenantDataPatterns.some(pattern => pattern.test(input));
    
    const sensitivityLevel = this.determineSensitivityLevel(input);
    
    return {
      requiresTenantData,
      sensitivityLevel
    };
  }

  private determineSensitivityLevel(input: string): 'low' | 'medium' | 'high' {
    const highSensitivityPatterns = [
      /private.*key/i,
      /password/i,
      /secret/i,
      /token/i,
      /customer.*data/i
    ];
    
    const mediumSensitivityPatterns = [
      /sales.*data/i,
      /revenue/i,
      /campaign.*data/i
    ];
    
    if (highSensitivityPatterns.some(pattern => pattern.test(input))) {
      return 'high';
    }
    
    if (mediumSensitivityPatterns.some(pattern => pattern.test(input))) {
      return 'medium';
    }
    
    return 'low';
  }

  private analyzePerformanceNeeds(request: CLIRequest): RequestClassification['performance'] {
    const isInteractive = !!request.sessionId;
    const isCodeRelated = /code|fix|explain|test/i.test(request.input);
    
    return {
      latencyRequirement: isInteractive ? 'high' : 'medium',
      qualityRequirement: isCodeRelated ? 'high' : 'medium'
    };
  }

  private analyzePrivacyRequirements(request: CLIRequest): RequestClassification['privacy'] {
    const input = request.input.toLowerCase();
    const preferences = request.preferences;
    
    const sensitivePatterns = this.config.security?.local_only_patterns || [];
    const containsSensitiveData = sensitivePatterns.some((pattern: string) => 
      new RegExp(pattern, 'i').test(input)
    );
    
    const requiresLocalProcessing = containsSensitiveData || 
                                   preferences?.privacyMode || 
                                   false;
    
    return {
      containsSensitiveData,
      requiresLocalProcessing
    };
  }

  private async evaluateConstraints(request: CLIRequest): Promise<any> {
    return {
      userPreferences: request.preferences || {},
      systemLimits: {
        maxTokens: this.config.cli?.max_tokens || 2048,
        timeout: this.config.cli?.timeout || 30000
      },
      resourceAvailability: this.capabilities
    };
  }

  private async generateExecutionPlan(context: {
    request: CLIRequest;
    classification: RequestClassification;
    capabilities: SystemCapabilities;
    constraints: any;
  }): Promise<ExecutionPlan> {
    
    const { request, classification, capabilities, constraints } = context;
    
    // Apply routing rules from configuration
    const rules = this.config.routing?.rules || [];
    for (const rule of rules) {
      if (this.evaluateRoutingRule(rule, context)) {
        return this.createPlanFromRule(rule, context);
      }
    }
    
    // Fallback to intelligent routing
    return this.intelligentRouting(context);
  }

  private evaluateRoutingRule(rule: any, context: any): boolean {
    const { classification, capabilities } = context;
    const condition = rule.condition;
    
    // Simple condition evaluation
    if (condition.includes('simple_query') && classification.complexity === 'simple') {
      return true;
    }
    
    if (condition.includes('local_available') && capabilities.local.available) {
      return true;
    }
    
    if (condition.includes('tenant_data_required') && classification.dataAccess.requiresTenantData) {
      return true;
    }
    
    if (condition.includes('privacy_sensitive') && classification.privacy.requiresLocalProcessing) {
      return true;
    }
    
    return false;
  }

  private createPlanFromRule(rule: any, context: any): ExecutionPlan {
    const { request } = context;
    
    const mode = rule.action === 'execute_local' ? 'local' :
                 rule.action === 'execute_cloud' ? 'cloud' : 'hybrid';
    
    return {
      mode,
      agent: this.selectAgent(request, mode),
      model: this.selectModel(mode),
      parameters: {},
      routing: {
        reason: `Rule-based routing: ${rule.condition}`,
        confidence: rule.priority / 100 || 0.8
      }
    };
  }

  private intelligentRouting(context: {
    request: CLIRequest;
    classification: RequestClassification;
    capabilities: SystemCapabilities;
    constraints: any;
  }): ExecutionPlan {
    
    const { request, classification, capabilities } = context;
    
    // Cost-benefit analysis
    const costAnalysis = this.analyzeCost(context);
    const qualityAnalysis = this.analyzeQuality(context);
    
    // Decision logic
    if (classification.privacy.requiresLocalProcessing || !capabilities.cloud.available) {
      return this.createLocalPlan(request, 'Privacy requirements or cloud unavailable');
    }
    
    if (!capabilities.local.available) {
      return this.createCloudPlan(request, 'Local unavailable');
    }
    
    if (costAnalysis.localSavings > 0.6 && qualityAnalysis.qualityDifference < 0.1) {
      return this.createLocalPlan(request, 'Cost-optimized routing');
    }
    
    if (classification.dataAccess.requiresTenantData) {
      return this.createCloudPlan(request, 'Tenant data access required');
    }
    
    // Default to hybrid
    return this.createHybridPlan(request, 'Intelligent routing decision');
  }

  private analyzeCost(context: any): { localSavings: number; cloudCost: number } {
    // Simplified cost analysis
    return {
      localSavings: 0.8, // 80% savings with local
      cloudCost: 1.0
    };
  }

  private analyzeQuality(context: any): { qualityDifference: number } {
    const { classification } = context;
    
    // Simple quality heuristic
    const qualityDifference = classification.complexity === 'complex' ? 0.3 : 0.05;
    
    return { qualityDifference };
  }

  private createLocalPlan(request: CLIRequest, reason: string): ExecutionPlan {
    return {
      mode: 'local',
      agent: this.selectAgent(request, 'local'),
      model: this.selectModel('local'),
      parameters: {},
      routing: {
        reason,
        confidence: 0.9
      }
    };
  }

  private createCloudPlan(request: CLIRequest, reason: string): ExecutionPlan {
    return {
      mode: 'cloud',
      agent: this.selectAgent(request, 'cloud'),
      pipeline: this.selectPipeline(request),
      parameters: {},
      routing: {
        reason,
        confidence: 0.8
      }
    };
  }

  private createHybridPlan(request: CLIRequest, reason: string): ExecutionPlan {
    return {
      mode: 'hybrid',
      agent: this.selectAgent(request, 'hybrid'),
      model: this.selectModel('local'),
      pipeline: this.selectPipeline(request),
      parameters: {},
      routing: {
        reason,
        confidence: 0.85,
        fallbackPlan: this.createLocalPlan(request, 'Hybrid fallback')
      }
    };
  }

  private selectAgent(request: CLIRequest, mode: string): string {
    // If agent specified in request, use it
    if (request.agent) {
      return request.agent;
    }
    
    // Detect agent from command or input
    const input = request.input.toLowerCase();
    if (input.includes('explain') || request.command === 'explain') {
      return 'explain';
    }
    if (input.includes('fix') || request.command === 'fix') {
      return 'fix';
    }
    if (input.includes('test') || request.command === 'test') {
      return 'test';
    }
    
    // Default to chat agent
    return 'chat';
  }

  private selectModel(mode: string): string {
    const models = this.config.execution_modes?.[mode]?.models;
    return models?.default || models?.fast || 'tinyllama:latest';
  }

  private selectPipeline(request: CLIRequest): string | undefined {
    const input = request.input.toLowerCase();
    
    if (input.includes('campaign') || request.tenant === 'ces') {
      return 'campaign-analysis';
    }
    if (input.includes('retail') || input.includes('scout') || request.tenant === 'scout') {
      return 'retail-insights';
    }
    if (input.includes('chat') || request.tenant === 'tbwa-chat') {
      return 'chat-orchestration';
    }
    
    return 'general-orchestration';
  }
}