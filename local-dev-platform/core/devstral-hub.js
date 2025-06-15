const { Ollama } = require('ollama');
const fs = require('fs').promises;
const path = require('path');
const WS = require('ws');
const EventEmitter = require('events');

class DevstralHub extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.ollama = new Ollama({ 
      host: options.ollamaHost || 'http://localhost:11434' 
    });
    
    this.config = {
      port: options.port || 3001,
      model: options.model || 'devstral:latest',
      maxContext: options.maxContext || 131072,
      timeout: options.timeout || 60000,
      ...options
    };
    
    this.modules = {};
    this.sessions = new Map();
    this.wss = null;
    
    this.init();
  }

  async init() {
    console.log('🚀 Initializing Devstral Hub...');
    
    try {
      // Initialize WebSocket server
      this.wss = new WS.Server({ port: this.config.port });
      console.log(`📡 WebSocket server running on port ${this.config.port}`);
      
      // Load reverse engineered modules
      await this.loadModules();
      
      // Setup WebSocket handlers
      this.setupWebSocketHandlers();
      
      // Test Devstral connection
      await this.testDevstralConnection();
      
      console.log('✅ Devstral Hub initialized successfully');
      this.emit('ready');
      
    } catch (error) {
      console.error('❌ Failed to initialize Devstral Hub:', error);
      this.emit('error', error);
    }
  }

  async loadModules() {
    console.log('📦 Loading reverse engineered modules...');
    
    // Load Lovable.dev component factory
    const ComponentFactory = require('../lib/lovable/component-factory');
    this.modules.lovable = new ComponentFactory();
    this.modules.lovable.setAIEngine(this.executeAI.bind(this));
    
    // Load Bolt.new prototype engine
    const PrototypeEngine = require('../lib/bolt/prototype-engine');
    this.modules.bolt = new PrototypeEngine();
    this.modules.bolt.setCodeGenerator(this.generateCode.bind(this));
    
    // Load Replit collaboration server
    const CollabServer = require('../lib/replit/collab-server');
    this.modules.replit = new CollabServer(this.wss);
    
    // Load Rork workflow orchestrator
    const WorkflowOrchestrator = require('../lib/rork/workflow-orchestrator');
    this.modules.rork = new WorkflowOrchestrator();
    this.modules.rork.setExecutionHandler(this.executeWorkflow.bind(this));
    
    console.log('✅ All modules loaded successfully');
  }

  setupWebSocketHandlers() {
    this.wss.on('connection', (ws, req) => {
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      this.sessions.set(sessionId, {
        ws,
        connected: new Date(),
        lastActivity: new Date(),
        metadata: {
          userAgent: req.headers['user-agent'],
          ip: req.socket.remoteAddress
        }
      });
      
      console.log(`👤 New client connected: ${sessionId}`);
      
      ws.on('message', async (data) => {
        try {
          const message = JSON.parse(data);
          await this.handleMessage(sessionId, message);
        } catch (error) {
          console.error('📨 Message handling error:', error);
          this.sendToClient(sessionId, {
            type: 'error',
            error: error.message
          });
        }
      });
      
      ws.on('close', () => {
        console.log(`👋 Client disconnected: ${sessionId}`);
        this.sessions.delete(sessionId);
      });
      
      // Send welcome message
      this.sendToClient(sessionId, {
        type: 'welcome',
        sessionId,
        capabilities: Object.keys(this.modules),
        timestamp: new Date().toISOString()
      });
    });
  }

  async handleMessage(sessionId, message) {
    const session = this.sessions.get(sessionId);
    if (!session) return;
    
    session.lastActivity = new Date();
    
    console.log(`📨 Received message from ${sessionId}:`, message.type);
    
    switch (message.type) {
      case 'lovable.create-component':
        const component = await this.modules.lovable.createComponent(
          message.data.type,
          message.data.props
        );
        this.sendToClient(sessionId, {
          type: 'lovable.component-created',
          data: component,
          requestId: message.requestId
        });
        break;
        
      case 'bolt.create-project':
        const project = await this.modules.bolt.createProject(
          message.data.template,
          message.data.options
        );
        this.sendToClient(sessionId, {
          type: 'bolt.project-created',
          data: project,
          requestId: message.requestId
        });
        break;
        
      case 'rork.run-workflow':
        const result = await this.modules.rork.runWorkflow(
          message.data.name,
          message.data.input
        );
        this.sendToClient(sessionId, {
          type: 'rork.workflow-completed',
          data: result,
          requestId: message.requestId
        });
        break;
        
      case 'ai.chat':
        const response = await this.executeAI(
          message.data.prompt,
          message.data.context
        );
        this.sendToClient(sessionId, {
          type: 'ai.response',
          data: { response },
          requestId: message.requestId
        });
        break;
        
      default:
        console.warn(`❓ Unknown message type: ${message.type}`);
    }
  }

  sendToClient(sessionId, message) {
    const session = this.sessions.get(sessionId);
    if (session && session.ws.readyState === WS.OPEN) {
      session.ws.send(JSON.stringify(message));
    }
  }

  broadcast(message, excludeSession = null) {
    this.sessions.forEach((session, sessionId) => {
      if (sessionId !== excludeSession && session.ws.readyState === WS.OPEN) {
        session.ws.send(JSON.stringify(message));
      }
    });
  }

  async executeAI(prompt, context = {}) {
    try {
      console.log('🧠 Executing AI prompt...');
      
      const messages = [
        {
          role: 'system',
          content: 'You are Devstral, an advanced coding assistant integrated into a local development platform. Provide precise, practical responses for development tasks.'
        },
        {
          role: 'user',
          content: prompt
        }
      ];
      
      if (context.history) {
        messages.splice(1, 0, ...context.history);
      }
      
      const response = await this.ollama.chat({
        model: this.config.model,
        messages,
        options: {
          num_ctx: this.config.maxContext,
          temperature: context.temperature || 0.7,
          top_p: context.top_p || 0.9
        }
      });
      
      return response.message.content;
      
    } catch (error) {
      console.error('🚨 AI execution error:', error);
      throw new Error(`AI execution failed: ${error.message}`);
    }
  }

  async generateCode(specs) {
    const prompt = `Generate ${specs.language || 'JavaScript'} code based on these specifications:

Language: ${specs.language || 'JavaScript'}
Framework: ${specs.framework || 'None'}
Dependencies: ${specs.dependencies ? specs.dependencies.join(', ') : 'None'}
Features: ${specs.features ? specs.features.join(', ') : 'Basic functionality'}
Style: ${specs.styling || 'CSS'}

Requirements:
${JSON.stringify(specs, null, 2)}

Generate clean, well-commented, production-ready code. Include necessary imports and exports.`;

    return this.executeAI(prompt, { temperature: 0.3 });
  }

  async executeWorkflow(workflow) {
    console.log(`🔄 Executing workflow: ${workflow.type}`);
    
    switch (workflow.type) {
      case 'ai':
        return this.executeAI(workflow.prompt, workflow.context);
        
      case 'file-operation':
        return this.executeFileOperation(workflow.operation, workflow.params);
        
      case 'api-call':
        return this.executeApiCall(workflow.url, workflow.options);
        
      default:
        throw new Error(`Unknown workflow type: ${workflow.type}`);
    }
  }

  async executeFileOperation(operation, params) {
    // Secure file operations within sandbox
    const safePath = this.getSafePath(params.path);
    
    switch (operation) {
      case 'read':
        return fs.readFile(safePath, 'utf8');
        
      case 'write':
        await fs.mkdir(path.dirname(safePath), { recursive: true });
        return fs.writeFile(safePath, params.content);
        
      case 'list':
        return fs.readdir(safePath);
        
      default:
        throw new Error(`Unknown file operation: ${operation}`);
    }
  }

  getSafePath(inputPath) {
    const basePath = path.join(__dirname, '../sandbox');
    const safePath = path.resolve(basePath, inputPath);
    
    if (!safePath.startsWith(basePath)) {
      throw new Error('Path traversal not allowed');
    }
    
    return safePath;
  }

  async testDevstralConnection() {
    try {
      const models = await this.ollama.list();
      const hasDevstral = models.models.some(model => 
        model.name.includes('devstral')
      );
      
      if (!hasDevstral) {
        console.warn('⚠️  Devstral model not found, using available model');
        this.config.model = models.models[0]?.name || 'llama2';
      }
      
      // Test basic functionality
      const testResponse = await this.executeAI('Hello, are you working?');
      console.log('✅ Devstral connection test successful');
      
      return true;
    } catch (error) {
      console.error('❌ Devstral connection test failed:', error);
      throw error;
    }
  }

  getStatus() {
    return {
      status: 'running',
      model: this.config.model,
      sessions: this.sessions.size,
      modules: Object.keys(this.modules),
      uptime: process.uptime(),
      memory: process.memoryUsage()
    };
  }

  async shutdown() {
    console.log('🛑 Shutting down Devstral Hub...');
    
    // Close WebSocket server
    if (this.wss) {
      this.wss.close();
    }
    
    // Clear sessions
    this.sessions.clear();
    
    console.log('✅ Devstral Hub shutdown complete');
  }
}

module.exports = DevstralHub;