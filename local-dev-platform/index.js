#!/usr/bin/env node

const DevstralHub = require('./core/devstral-hub');
const SecuritySandbox = require('./security/sandbox');
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;

class LocalDevPlatform {
  constructor(options = {}) {
    this.config = {
      port: options.port || 3000,
      wsPort: options.wsPort || 3001,
      ollamaHost: options.ollamaHost || 'http://localhost:11434',
      model: options.model || 'devstral:latest',
      sandboxEnabled: options.sandboxEnabled !== false,
      ...options
    };
    
    this.hub = null;
    this.sandbox = null;
    this.app = null;
    this.server = null;
  }

  async start() {
    console.log('🚀 Starting Local Development Platform...');
    console.log(`📊 Config: Port ${this.config.port}, WS Port ${this.config.wsPort}, Model ${this.config.model}`);
    
    try {
      // Initialize security sandbox
      if (this.config.sandboxEnabled) {
        this.sandbox = new SecuritySandbox();
        console.log('🛡️  Security sandbox initialized');
        
        // Run security tests
        const testResults = await this.sandbox.testSecurity();
        if (!testResults.success) {
          console.warn('⚠️  Some security tests failed, but continuing...');
        }
      }
      
      // Initialize Devstral Hub
      this.hub = new DevstralHub({
        port: this.config.wsPort,
        model: this.config.model,
        ollamaHost: this.config.ollamaHost
      });
      
      // Wait for hub to be ready
      await new Promise((resolve, reject) => {
        this.hub.once('ready', resolve);
        this.hub.once('error', reject);
      });
      
      // Create Express app
      this.app = express();
      this.setupMiddleware();
      this.setupRoutes();
      
      // Start HTTP server
      this.server = this.app.listen(this.config.port, () => {
        console.log(`🌐 HTTP server running on port ${this.config.port}`);
        console.log(`📡 WebSocket server running on port ${this.config.wsPort}`);
        console.log(`✨ Platform ready! Visit http://localhost:${this.config.port}`);
      });
      
      // Handle graceful shutdown
      this.setupGracefulShutdown();
      
    } catch (error) {
      console.error('❌ Failed to start platform:', error);
      process.exit(1);
    }
  }

  setupMiddleware() {
    this.app.use(cors());
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.static(path.join(__dirname, 'public')));
    
    // Request logging
    this.app.use((req, res, next) => {
      console.log(`${req.method} ${req.path}`);
      next();
    });
  }

  setupRoutes() {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        platform: 'Local Dev Platform',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        components: {
          devstralHub: this.hub ? 'running' : 'stopped',
          sandbox: this.sandbox ? 'enabled' : 'disabled'
        }
      });
    });

    // Platform status
    this.app.get('/api/status', (req, res) => {
      const status = {
        platform: this.getStatus(),
        hub: this.hub ? this.hub.getStatus() : null,
        sandbox: this.sandbox ? this.sandbox.getStats() : null
      };
      res.json(status);
    });

    // Lovable.dev Component Factory Routes
    this.app.post('/api/lovable/component', async (req, res) => {
      try {
        const { type, props } = req.body;
        const component = await this.hub.modules.lovable.createComponent(type, props);
        res.json({ success: true, component });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    this.app.post('/api/lovable/project', async (req, res) => {
      try {
        const { name, components } = req.body;
        const project = await this.hub.modules.lovable.createProject(name, components);
        res.json({ success: true, project });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Bolt.new Prototype Engine Routes
    this.app.post('/api/bolt/project', async (req, res) => {
      try {
        const { template, options } = req.body;
        const project = await this.hub.modules.bolt.createProject(template, options);
        res.json({ success: true, project });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    this.app.get('/api/bolt/templates', (req, res) => {
      const templates = Array.from(this.hub.modules.bolt.templates.entries()).map(([key, value]) => ({
        id: key,
        ...value
      }));
      res.json({ templates });
    });

    // Rork Workflow Routes
    this.app.post('/api/rork/workflow/run', async (req, res) => {
      try {
        const { name, input, options } = req.body;
        const result = await this.hub.modules.rork.runWorkflow(name, input, options);
        res.json({ success: true, result });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    this.app.get('/api/rork/workflows', (req, res) => {
      const workflows = {
        templates: this.hub.modules.rork.getWorkflowTemplates(),
        registered: this.hub.modules.rork.getRegisteredWorkflows(),
        stats: this.hub.modules.rork.getWorkflowStats()
      };
      res.json(workflows);
    });

    this.app.post('/api/rork/workflow/register', async (req, res) => {
      try {
        const { name, steps, metadata } = req.body;
        const id = this.hub.modules.rork.registerWorkflow(name, steps, metadata);
        res.json({ success: true, id });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Replit Collaboration Routes
    this.app.get('/api/replit/stats', (req, res) => {
      const stats = this.hub.modules.replit.getStats();
      res.json(stats);
    });

    this.app.get('/api/replit/room/:roomId', (req, res) => {
      const roomInfo = this.hub.modules.replit.getRoomInfo(req.params.roomId);
      if (roomInfo) {
        res.json(roomInfo);
      } else {
        res.status(404).json({ error: 'Room not found' });
      }
    });

    // AI Chat Routes
    this.app.post('/api/ai/chat', async (req, res) => {
      try {
        const { prompt, context } = req.body;
        const response = await this.hub.executeAI(prompt, context);
        res.json({ success: true, response });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Code Generation Routes
    this.app.post('/api/ai/generate', async (req, res) => {
      try {
        const specs = req.body;
        const code = await this.hub.generateCode(specs);
        res.json({ success: true, code });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Sandbox Routes (if enabled)
    if (this.sandbox) {
      this.app.post('/api/sandbox/execute', async (req, res) => {
        try {
          const { code, context } = req.body;
          const result = await this.sandbox.executeCode(code, context);
          res.json(result);
        } catch (error) {
          res.status(500).json({ success: false, error: error.message });
        }
      });

      this.app.post('/api/sandbox/workflow', async (req, res) => {
        try {
          const { workflowCode, input } = req.body;
          const result = await this.sandbox.executeWorkflow(workflowCode, input);
          res.json(result);
        } catch (error) {
          res.status(500).json({ success: false, error: error.message });
        }
      });
    }

    // File Management Routes
    this.app.get('/api/files/*', async (req, res) => {
      try {
        const filePath = req.params[0];
        const safePath = path.join(__dirname, 'sandbox', filePath);
        
        // Security check
        if (!safePath.startsWith(path.join(__dirname, 'sandbox'))) {
          return res.status(403).json({ error: 'Access denied' });
        }
        
        const content = await fs.readFile(safePath, 'utf8');
        res.json({ content });
      } catch (error) {
        res.status(404).json({ error: 'File not found' });
      }
    });

    this.app.post('/api/files/*', async (req, res) => {
      try {
        const filePath = req.params[0];
        const { content } = req.body;
        const safePath = path.join(__dirname, 'sandbox', filePath);
        
        // Security check
        if (!safePath.startsWith(path.join(__dirname, 'sandbox'))) {
          return res.status(403).json({ error: 'Access denied' });
        }
        
        await fs.mkdir(path.dirname(safePath), { recursive: true });
        await fs.writeFile(safePath, content);
        res.json({ success: true });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Demo/Dashboard Route
    this.app.get('/', (req, res) => {
      res.send(this.getDashboardHTML());
    });

    // Catch-all for SPA routing
    this.app.get('*', (req, res) => {
      res.status(404).json({ error: 'Endpoint not found' });
    });
  }

  getDashboardHTML() {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Local Development Platform</title>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
            .container { max-width: 1200px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 40px; }
            .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
            .card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .card h3 { margin-top: 0; color: #333; }
            .status { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
            .status.running { background: #d4edda; color: #155724; }
            .status.stopped { background: #f8d7da; color: #721c24; }
            button { background: #007bff; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; }
            button:hover { background: #0056b3; }
            pre { background: #f8f9fa; padding: 10px; border-radius: 4px; overflow-x: auto; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🚀 Local Development Platform</h1>
                <p>Reverse engineered capabilities of Rork AI, Lovable.dev, Bolt.new, and Replit running locally with Devstral</p>
                <span class="status running">Platform Running</span>
            </div>
            
            <div class="cards">
                <div class="card">
                    <h3>🎨 Lovable.dev Component Factory</h3>
                    <p>Generate React components with shadcn/ui styling patterns</p>
                    <button onclick="testLovable()">Create Sample Component</button>
                    <pre id="lovable-result"></pre>
                </div>
                
                <div class="card">
                    <h3>⚡ Bolt.new Prototype Engine</h3>
                    <p>Rapid prototyping with multiple framework templates</p>
                    <button onclick="testBolt()">Create Sample Project</button>
                    <pre id="bolt-result"></pre>
                </div>
                
                <div class="card">
                    <h3>👥 Replit Collaboration</h3>
                    <p>Real-time collaborative editing with WebSocket</p>
                    <button onclick="testReplit()">Join Collaboration Room</button>
                    <pre id="replit-result"></pre>
                </div>
                
                <div class="card">
                    <h3>🔄 Rork Workflow Orchestration</h3>
                    <p>AI-powered workflow automation and execution</p>
                    <button onclick="testRork()">Run Sample Workflow</button>
                    <pre id="rork-result"></pre>
                </div>
                
                <div class="card">
                    <h3>🧠 Devstral AI Hub</h3>
                    <p>Direct access to local Devstral model for coding tasks</p>
                    <button onclick="testAI()">Ask Devstral</button>
                    <pre id="ai-result"></pre>
                </div>
                
                <div class="card">
                    <h3>🛡️ Security Sandbox</h3>
                    <p>Safe code execution environment with security controls</p>
                    <button onclick="testSandbox()">Test Sandbox Security</button>
                    <pre id="sandbox-result"></pre>
                </div>
            </div>
            
            <div style="margin-top: 40px; text-align: center;">
                <h3>🔗 WebSocket Connection</h3>
                <span id="ws-status" class="status stopped">Disconnected</span>
                <button onclick="connectWebSocket()">Connect to WebSocket</button>
            </div>
        </div>

        <script>
            let ws = null;
            
            async function testLovable() {
                document.getElementById('lovable-result').textContent = 'Creating component...';
                try {
                    const response = await fetch('/api/lovable/component', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            type: 'button',
                            props: { variant: 'primary', size: 'lg', children: 'Click me!' }
                        })
                    });
                    const result = await response.json();
                    document.getElementById('lovable-result').textContent = JSON.stringify(result, null, 2);
                } catch (error) {
                    document.getElementById('lovable-result').textContent = 'Error: ' + error.message;
                }
            }
            
            async function testBolt() {
                document.getElementById('bolt-result').textContent = 'Creating project...';
                try {
                    const response = await fetch('/api/bolt/project', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            template: 'react',
                            options: {
                                name: 'sample-app',
                                features: ['routing', 'state-management']
                            }
                        })
                    });
                    const result = await response.json();
                    document.getElementById('bolt-result').textContent = JSON.stringify(result, null, 2);
                } catch (error) {
                    document.getElementById('bolt-result').textContent = 'Error: ' + error.message;
                }
            }
            
            async function testReplit() {
                document.getElementById('replit-result').textContent = 'Connecting to collaboration...';
                connectWebSocket();
                document.getElementById('replit-result').textContent = 'WebSocket connection initiated for collaboration';
            }
            
            async function testRork() {
                document.getElementById('rork-result').textContent = 'Running workflow...';
                try {
                    const response = await fetch('/api/rork/workflow/run', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            name: 'component-factory',
                            input: { type: 'card', requirements: 'A modern card component for displaying product information' }
                        })
                    });
                    const result = await response.json();
                    document.getElementById('rork-result').textContent = JSON.stringify(result, null, 2);
                } catch (error) {
                    document.getElementById('rork-result').textContent = 'Error: ' + error.message;
                }
            }
            
            async function testAI() {
                document.getElementById('ai-result').textContent = 'Asking Devstral...';
                try {
                    const response = await fetch('/api/ai/chat', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            prompt: 'Create a TypeScript interface for a User with id, name, email, and optional avatar fields'
                        })
                    });
                    const result = await response.json();
                    document.getElementById('ai-result').textContent = result.response;
                } catch (error) {
                    document.getElementById('ai-result').textContent = 'Error: ' + error.message;
                }
            }
            
            async function testSandbox() {
                document.getElementById('sandbox-result').textContent = 'Testing sandbox security...';
                try {
                    const response = await fetch('/api/sandbox/execute', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            code: 'const result = Math.random() * 100; console.log("Random number:", result); result;'
                        })
                    });
                    const result = await response.json();
                    document.getElementById('sandbox-result').textContent = JSON.stringify(result, null, 2);
                } catch (error) {
                    document.getElementById('sandbox-result').textContent = 'Error: ' + error.message;
                }
            }
            
            function connectWebSocket() {
                if (ws && ws.readyState === WebSocket.OPEN) return;
                
                ws = new WebSocket('ws://localhost:${this.config.wsPort}');
                
                ws.onopen = () => {
                    document.getElementById('ws-status').textContent = 'Connected';
                    document.getElementById('ws-status').className = 'status running';
                };
                
                ws.onclose = () => {
                    document.getElementById('ws-status').textContent = 'Disconnected';
                    document.getElementById('ws-status').className = 'status stopped';
                };
                
                ws.onmessage = (event) => {
                    console.log('WebSocket message:', JSON.parse(event.data));
                };
            }
            
            // Auto-connect WebSocket on load
            setTimeout(connectWebSocket, 1000);
        </script>
    </body>
    </html>
    `;
  }

  getStatus() {
    return {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      platform: process.platform,
      nodeVersion: process.version,
      config: this.config
    };
  }

  setupGracefulShutdown() {
    const shutdown = async (signal) => {
      console.log(`\\n🛑 Received ${signal}, shutting down gracefully...`);
      
      if (this.server) {
        this.server.close();
      }
      
      if (this.hub) {
        await this.hub.shutdown();
      }
      
      console.log('✅ Platform shutdown complete');
      process.exit(0);
    };
    
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  }
}

// CLI Entry Point
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {};
  
  // Parse command line arguments
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace('--', '');
    const value = args[i + 1];
    
    if (value && !value.startsWith('--')) {
      options[key] = isNaN(value) ? value : parseInt(value);
    }
  }
  
  console.log('🏗️  Initializing Local Development Platform...');
  
  const platform = new LocalDevPlatform(options);
  platform.start().catch(console.error);
}

module.exports = LocalDevPlatform;