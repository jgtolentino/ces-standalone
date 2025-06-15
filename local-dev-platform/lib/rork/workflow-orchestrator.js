const EventEmitter = require('events');
const fs = require('fs').promises;
const path = require('path');

class WorkflowOrchestrator extends EventEmitter {
  constructor() {
    super();
    
    this.workflows = new Map();
    this.executions = new Map();
    this.templates = new Map();
    this.executeHandler = null;
    
    // Load Rork.ai style workflow templates
    this.loadWorkflowTemplates();
  }

  setExecutionHandler(handler) {
    this.executeHandler = handler;
  }

  loadWorkflowTemplates() {
    console.log('🔄 Loading Rork.ai style workflow templates...');
    
    // Code Generation Workflows
    this.templates.set('code-generation', {
      name: 'Code Generation Pipeline',
      description: 'Generate complete applications from specifications',
      steps: [
        {
          id: 'analyze-requirements',
          name: 'Analyze Requirements',
          type: 'ai',
          prompt: 'Analyze these requirements and create a technical specification: {{input.requirements}}',
          outputVar: 'specification'
        },
        {
          id: 'design-architecture',
          name: 'Design Architecture',
          type: 'ai',
          prompt: 'Design the software architecture for: {{specification}}',
          outputVar: 'architecture'
        },
        {
          id: 'generate-code',
          name: 'Generate Code',
          type: 'ai',
          prompt: 'Generate complete code based on: {{architecture}}',
          outputVar: 'code'
        },
        {
          id: 'create-tests',
          name: 'Create Tests',
          type: 'ai',
          prompt: 'Generate comprehensive tests for: {{code}}',
          outputVar: 'tests'
        }
      ]
    });

    // Component Factory Workflow
    this.templates.set('component-factory', {
      name: 'Component Factory',
      description: 'Generate UI components with variations',
      steps: [
        {
          id: 'design-component',
          name: 'Design Component',
          type: 'ai',
          prompt: 'Design a {{input.type}} component with these requirements: {{input.requirements}}',
          outputVar: 'design'
        },
        {
          id: 'generate-variants',
          name: 'Generate Variants',
          type: 'ai',
          prompt: 'Create 3 variants of this component design: {{design}}',
          outputVar: 'variants'
        },
        {
          id: 'implement-component',
          name: 'Implement Component',
          type: 'ai',
          prompt: 'Implement the component in React with TypeScript: {{design}}',
          outputVar: 'implementation'
        },
        {
          id: 'generate-stories',
          name: 'Generate Storybook Stories',
          type: 'ai',
          prompt: 'Create Storybook stories for: {{implementation}}',
          outputVar: 'stories'
        }
      ]
    });

    // API Development Workflow
    this.templates.set('api-development', {
      name: 'API Development Pipeline',
      description: 'Generate complete REST APIs with documentation',
      steps: [
        {
          id: 'design-api',
          name: 'Design API',
          type: 'ai',
          prompt: 'Design a REST API for: {{input.domain}}. Include endpoints, methods, and data models.',
          outputVar: 'apiDesign'
        },
        {
          id: 'generate-openapi',
          name: 'Generate OpenAPI Spec',
          type: 'ai',
          prompt: 'Create OpenAPI 3.0 specification for: {{apiDesign}}',
          outputVar: 'openApiSpec'
        },
        {
          id: 'implement-server',
          name: 'Implement Server',
          type: 'ai',
          prompt: 'Implement Express.js server based on: {{openApiSpec}}',
          outputVar: 'serverCode'
        },
        {
          id: 'generate-client',
          name: 'Generate Client',
          type: 'ai',
          prompt: 'Generate TypeScript client SDK for: {{openApiSpec}}',
          outputVar: 'clientCode'
        },
        {
          id: 'create-documentation',
          name: 'Create Documentation',
          type: 'ai',
          prompt: 'Create comprehensive API documentation for: {{openApiSpec}}',
          outputVar: 'documentation'
        }
      ]
    });

    // Testing Automation Workflow
    this.templates.set('test-automation', {
      name: 'Test Automation Suite',
      description: 'Generate comprehensive test suites',
      steps: [
        {
          id: 'analyze-code',
          name: 'Analyze Code',
          type: 'ai',
          prompt: 'Analyze this code for testing requirements: {{input.code}}',
          outputVar: 'testPlan'
        },
        {
          id: 'unit-tests',
          name: 'Generate Unit Tests',
          type: 'ai',
          prompt: 'Create unit tests based on: {{testPlan}}',
          outputVar: 'unitTests'
        },
        {
          id: 'integration-tests',
          name: 'Generate Integration Tests',
          type: 'ai',
          prompt: 'Create integration tests for: {{testPlan}}',
          outputVar: 'integrationTests'
        },
        {
          id: 'e2e-tests',
          name: 'Generate E2E Tests',
          type: 'ai',
          prompt: 'Create end-to-end tests using Playwright for: {{testPlan}}',
          outputVar: 'e2eTests'
        }
      ]
    });

    // Deployment Workflow
    this.templates.set('deployment-pipeline', {
      name: 'Deployment Pipeline',
      description: 'Create complete CI/CD pipeline',
      steps: [
        {
          id: 'analyze-project',
          name: 'Analyze Project',
          type: 'ai',
          prompt: 'Analyze project structure and determine deployment strategy: {{input.projectStructure}}',
          outputVar: 'deploymentStrategy'
        },
        {
          id: 'dockerfile',
          name: 'Generate Dockerfile',
          type: 'ai',
          prompt: 'Create optimized Dockerfile for: {{deploymentStrategy}}',
          outputVar: 'dockerfile'
        },
        {
          id: 'github-actions',
          name: 'GitHub Actions Workflow',
          type: 'ai',
          prompt: 'Create GitHub Actions CI/CD workflow for: {{deploymentStrategy}}',
          outputVar: 'githubActions'
        },
        {
          id: 'kubernetes-manifests',
          name: 'Kubernetes Manifests',
          type: 'ai',
          prompt: 'Generate Kubernetes manifests for: {{deploymentStrategy}}',
          outputVar: 'kubernetesManifests'
        }
      ]
    });

    console.log(`✅ Loaded ${this.templates.size} workflow templates`);
  }

  registerWorkflow(name, steps, metadata = {}) {
    console.log(`📝 Registering workflow: ${name}`);
    
    const workflow = {
      id: `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      steps,
      metadata: {
        created: new Date(),
        ...metadata
      },
      executions: 0
    };
    
    this.workflows.set(name, workflow);
    return workflow.id;
  }

  async runWorkflow(name, input, options = {}) {
    console.log(`🚀 Running workflow: ${name}`);
    
    const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      // Get workflow (from registered or templates)
      let workflow = this.workflows.get(name) || this.templates.get(name);
      
      if (!workflow) {
        throw new Error(`Workflow '${name}' not found`);
      }
      
      // Create execution context
      const execution = {
        id: executionId,
        workflowName: name,
        input,
        options,
        startTime: new Date(),
        status: 'running',
        steps: [],
        context: { input },
        results: {},
        logs: []
      };
      
      this.executions.set(executionId, execution);
      this.emit('execution-started', execution);
      
      // Execute workflow steps
      let context = { input };
      
      for (let i = 0; i < workflow.steps.length; i++) {
        const step = workflow.steps[i];
        
        execution.logs.push(`Starting step ${i + 1}: ${step.name}`);
        console.log(`📋 Step ${i + 1}/${workflow.steps.length}: ${step.name}`);
        
        try {
          const stepResult = await this.executeStep(step, context, execution);
          
          // Store result in context
          if (step.outputVar) {
            context[step.outputVar] = stepResult;
            execution.results[step.outputVar] = stepResult;
          }
          
          execution.steps.push({
            ...step,
            status: 'completed',
            result: stepResult,
            completedAt: new Date()
          });
          
          execution.logs.push(`Completed step ${i + 1}: ${step.name}`);
          this.emit('step-completed', { execution, step, result: stepResult });
          
        } catch (error) {
          execution.logs.push(`Failed step ${i + 1}: ${error.message}`);
          execution.steps.push({
            ...step,
            status: 'failed',
            error: error.message,
            failedAt: new Date()
          });
          
          this.emit('step-failed', { execution, step, error });
          
          if (!options.continueOnError) {
            throw error;
          }
        }
      }
      
      // Complete execution
      execution.status = 'completed';
      execution.endTime = new Date();
      execution.duration = execution.endTime - execution.startTime;
      
      console.log(`✅ Workflow completed: ${name} (${execution.duration}ms)`);
      this.emit('execution-completed', execution);
      
      // Increment workflow execution count
      if (this.workflows.has(name)) {
        this.workflows.get(name).executions++;
      }
      
      return {
        executionId,
        results: execution.results,
        context,
        duration: execution.duration,
        steps: execution.steps.length
      };
      
    } catch (error) {
      console.error(`❌ Workflow failed: ${name}`, error);
      
      const execution = this.executions.get(executionId);
      if (execution) {
        execution.status = 'failed';
        execution.error = error.message;
        execution.endTime = new Date();
        execution.duration = execution.endTime - execution.startTime;
      }
      
      this.emit('execution-failed', { execution, error });
      throw error;
    }
  }

  async executeStep(step, context, execution) {
    console.log(`🔧 Executing step: ${step.name} (${step.type})`);
    
    const startTime = Date.now();
    
    try {
      let result;
      
      switch (step.type) {
        case 'ai':
          result = await this.executeAIStep(step, context);
          break;
          
        case 'file-operation':
          result = await this.executeFileStep(step, context);
          break;
          
        case 'api-call':
          result = await this.executeApiStep(step, context);
          break;
          
        case 'transform':
          result = await this.executeTransformStep(step, context);
          break;
          
        case 'condition':
          result = await this.executeConditionStep(step, context);
          break;
          
        case 'parallel':
          result = await this.executeParallelStep(step, context);
          break;
          
        default:
          // Delegate to external handler
          if (this.executeHandler) {
            result = await this.executeHandler({
              type: step.type,
              ...step,
              context
            });
          } else {
            throw new Error(`Unknown step type: ${step.type}`);
          }
      }
      
      const duration = Date.now() - startTime;
      console.log(`✅ Step completed: ${step.name} (${duration}ms)`);
      
      return result;
      
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`❌ Step failed: ${step.name} (${duration}ms)`, error);
      throw error;
    }
  }

  async executeAIStep(step, context) {
    if (!this.executeHandler) {
      throw new Error('AI execution handler not set');
    }
    
    // Template replacement in prompt
    const prompt = this.replaceTemplateVars(step.prompt, context);
    
    return await this.executeHandler({
      type: 'ai',
      prompt,
      context: step.context || {}
    });
  }

  async executeFileStep(step, context) {
    const { operation, path: filePath, content } = step;
    const resolvedPath = this.replaceTemplateVars(filePath, context);
    
    switch (operation) {
      case 'read':
        return await fs.readFile(resolvedPath, 'utf8');
        
      case 'write':
        const resolvedContent = this.replaceTemplateVars(content, context);
        await fs.mkdir(path.dirname(resolvedPath), { recursive: true });
        await fs.writeFile(resolvedPath, resolvedContent);
        return { path: resolvedPath, size: resolvedContent.length };
        
      case 'list':
        return await fs.readdir(resolvedPath);
        
      case 'exists':
        try {
          await fs.access(resolvedPath);
          return true;
        } catch {
          return false;
        }
        
      default:
        throw new Error(`Unknown file operation: ${operation}`);
    }
  }

  async executeApiStep(step, context) {
    const { url, method = 'GET', headers = {}, data } = step;
    const resolvedUrl = this.replaceTemplateVars(url, context);
    
    const response = await fetch(resolvedUrl, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      body: data ? JSON.stringify(this.replaceTemplateVars(data, context)) : undefined
    });
    
    if (!response.ok) {
      throw new Error(`API call failed: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  }

  async executeTransformStep(step, context) {
    const { transformation, input: inputVar } = step;
    const inputData = context[inputVar];
    
    // Execute transformation function
    if (typeof transformation === 'function') {
      return transformation(inputData, context);
    }
    
    // Execute transformation string (eval - use with caution)
    if (typeof transformation === 'string') {
      const func = new Function('input', 'context', `return ${transformation}`);
      return func(inputData, context);
    }
    
    throw new Error('Invalid transformation');
  }

  async executeConditionStep(step, context) {
    const { condition, trueBranch, falseBranch } = step;
    
    // Evaluate condition
    const conditionResult = this.evaluateCondition(condition, context);
    
    // Execute appropriate branch
    const branch = conditionResult ? trueBranch : falseBranch;
    if (branch) {
      return await this.executeStep(branch, context);
    }
    
    return conditionResult;
  }

  async executeParallelStep(step, context) {
    const { steps } = step;
    
    // Execute all steps in parallel
    const promises = steps.map(parallelStep => 
      this.executeStep(parallelStep, context)
    );
    
    return await Promise.all(promises);
  }

  replaceTemplateVars(template, context) {
    if (typeof template !== 'string') return template;
    
    return template.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
      const value = this.getNestedValue(context, path.trim());
      return value !== undefined ? value : match;
    });
  }

  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  evaluateCondition(condition, context) {
    // Simple condition evaluation (enhance for production)
    if (typeof condition === 'string') {
      // Replace template variables and evaluate
      const resolvedCondition = this.replaceTemplateVars(condition, context);
      return new Function('context', `with(context) { return ${resolvedCondition}; }`)(context);
    }
    
    if (typeof condition === 'function') {
      return condition(context);
    }
    
    return !!condition;
  }

  getExecution(executionId) {
    return this.executions.get(executionId);
  }

  getWorkflowStats() {
    return {
      totalWorkflows: this.workflows.size + this.templates.size,
      registeredWorkflows: this.workflows.size,
      templateWorkflows: this.templates.size,
      totalExecutions: this.executions.size,
      activeExecutions: Array.from(this.executions.values())
        .filter(e => e.status === 'running').length
    };
  }

  getWorkflowTemplates() {
    return Array.from(this.templates.values());
  }

  getRegisteredWorkflows() {
    return Array.from(this.workflows.values());
  }
}

module.exports = WorkflowOrchestrator;