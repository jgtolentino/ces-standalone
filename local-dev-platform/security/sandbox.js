const { NodeVM } = require('vm2');
const fs = require('fs').promises;
const path = require('path');

class SecuritySandbox {
  constructor(options = {}) {
    this.config = {
      timeout: options.timeout || 5000,
      allowAsync: options.allowAsync || true,
      allowEval: options.allowEval || false,
      allowWasm: options.allowWasm || false,
      ...options
    };
    
    this.safePaths = [
      path.join(__dirname, '../sandbox'),
      path.join(__dirname, '../templates'),
      path.join(__dirname, '../temp')
    ];
    
    this.allowedModules = [
      'path',
      'crypto',
      'util',
      'events',
      'stream',
      'url',
      'querystring',
      'buffer'
    ];
    
    this.blockedPatterns = [
      /require\s*\(\s*['"`]child_process['"`]\s*\)/,
      /require\s*\(\s*['"`]fs['"`]\s*\)/,
      /require\s*\(\s*['"`]net['"`]\s*\)/,
      /require\s*\(\s*['"`]http['"`]\s*\)/,
      /require\s*\(\s*['"`]https['"`]\s*\)/,
      /process\.exit/,
      /process\.kill/,
      /eval\s*\(/,
      /Function\s*\(/,
      /setTimeout\s*\(/,
      /setInterval\s*\(/
    ];
  }

  async executeCode(code, context = {}) {
    console.log('🛡️  Executing code in security sandbox...');
    
    try {
      // Pre-execution security checks
      this.validateCode(code);
      
      // Create secure VM
      const vm = new NodeVM({
        console: 'redirect',
        sandbox: {
          ...context,
          // Safe utilities
          Math,
          Date,
          JSON,
          String,
          Number,
          Boolean,
          Array,
          Object,
          RegExp,
          Promise
        },
        require: {
          external: false,
          builtin: this.allowedModules,
          root: this.safePaths,
          mock: {
            fs: this.createSecureFS(),
            path: path,
            crypto: require('crypto')
          }
        },
        timeout: this.config.timeout,
        eval: this.config.allowEval,
        wasm: this.config.allowWasm
      });
      
      // Redirect console for logging
      const logs = [];
      vm.on('console.log', (data) => {
        logs.push({ level: 'log', message: data });
      });
      vm.on('console.error', (data) => {
        logs.push({ level: 'error', message: data });
      });
      vm.on('console.warn', (data) => {
        logs.push({ level: 'warn', message: data });
      });
      
      // Execute code
      const startTime = Date.now();
      const result = vm.run(code, 'sandbox.js');
      const executionTime = Date.now() - startTime;
      
      console.log(`✅ Code executed successfully in ${executionTime}ms`);
      
      return {
        success: true,
        result,
        logs,
        executionTime,
        memoryUsage: process.memoryUsage()
      };
      
    } catch (error) {
      console.error('❌ Sandbox execution error:', error);
      
      return {
        success: false,
        error: error.message,
        logs: [],
        executionTime: 0
      };
    }
  }

  validateCode(code) {
    console.log('🔍 Validating code for security threats...');
    
    // Check for blocked patterns
    for (const pattern of this.blockedPatterns) {
      if (pattern.test(code)) {
        throw new Error(`Security violation: Blocked pattern detected - ${pattern}`);
      }
    }
    
    // Check for suspicious imports
    const requireMatches = code.match(/require\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g);
    if (requireMatches) {
      for (const match of requireMatches) {
        const module = match.match(/['"`]([^'"`]+)['"`]/)[1];
        if (!this.allowedModules.includes(module) && !module.startsWith('./')) {
          throw new Error(`Security violation: Unauthorized module access - ${module}`);
        }
      }
    }
    
    // Check for file system access outside safe paths
    const fileMatches = code.match(/['"](\/[^'"]*|[A-Za-z]:[^'"]*)['"]/g);
    if (fileMatches) {
      for (const match of fileMatches) {
        const filePath = match.slice(1, -1);
        if (path.isAbsolute(filePath) && !this.isPathSafe(filePath)) {
          throw new Error(`Security violation: Unauthorized file path - ${filePath}`);
        }
      }
    }
    
    console.log('✅ Code validation passed');
  }

  createSecureFS() {
    const self = this;
    
    return {
      async readFile(filePath, encoding = 'utf8') {
        const safePath = self.getSafePath(filePath);
        return await fs.readFile(safePath, encoding);
      },
      
      async writeFile(filePath, content) {
        const safePath = self.getSafePath(filePath);
        await fs.mkdir(path.dirname(safePath), { recursive: true });
        return await fs.writeFile(safePath, content);
      },
      
      async readdir(dirPath) {
        const safePath = self.getSafePath(dirPath);
        return await fs.readdir(safePath);
      },
      
      async stat(filePath) {
        const safePath = self.getSafePath(filePath);
        return await fs.stat(safePath);
      },
      
      async mkdir(dirPath, options) {
        const safePath = self.getSafePath(dirPath);
        return await fs.mkdir(safePath, options);
      },
      
      // Synchronous versions
      readFileSync(filePath, encoding = 'utf8') {
        throw new Error('Synchronous file operations not allowed in sandbox');
      },
      
      writeFileSync() {
        throw new Error('Synchronous file operations not allowed in sandbox');
      }
    };
  }

  getSafePath(inputPath) {
    // Resolve path and check if it's within safe directories
    const resolvedPath = path.resolve(this.safePaths[0], inputPath);
    
    if (!this.isPathSafe(resolvedPath)) {
      throw new Error(`Access denied: Path outside sandbox - ${inputPath}`);
    }
    
    return resolvedPath;
  }

  isPathSafe(filePath) {
    const resolvedPath = path.resolve(filePath);
    return this.safePaths.some(safePath => 
      resolvedPath.startsWith(path.resolve(safePath))
    );
  }

  async executeWorkflow(workflowCode, input) {
    console.log('🔄 Executing workflow in sandbox...');
    
    const sandboxCode = `
      const workflow = ${workflowCode};
      const input = ${JSON.stringify(input)};
      
      async function runWorkflow() {
        if (typeof workflow === 'function') {
          return await workflow(input);
        } else if (workflow && workflow.execute) {
          return await workflow.execute(input);
        } else {
          throw new Error('Invalid workflow: must be function or object with execute method');
        }
      }
      
      runWorkflow();
    `;
    
    return await this.executeCode(sandboxCode);
  }

  async executeComponent(componentCode, props = {}) {
    console.log('🎨 Executing component generation in sandbox...');
    
    const sandboxCode = `
      const React = {
        createElement: (type, props, ...children) => ({
          type,
          props: { ...props, children: children.length === 1 ? children[0] : children },
          key: props && props.key || null
        }),
        Fragment: 'Fragment'
      };
      
      const props = ${JSON.stringify(props)};
      
      ${componentCode}
      
      // Return component result
      if (typeof Component === 'function') {
        Component(props);
      } else if (typeof module !== 'undefined' && module.exports) {
        module.exports;
      } else {
        'Component code executed successfully';
      }
    `;
    
    return await this.executeCode(sandboxCode);
  }

  async testSecurity() {
    console.log('🧪 Running security sandbox tests...');
    
    const tests = [
      {
        name: 'File system access outside sandbox',
        code: 'require("fs").readFileSync("/etc/passwd")',
        shouldFail: true
      },
      {
        name: 'Process manipulation',
        code: 'process.exit(1)',
        shouldFail: true
      },
      {
        name: 'Network access',
        code: 'require("http").createServer()',
        shouldFail: true
      },
      {
        name: 'Child process',
        code: 'require("child_process").exec("ls")',
        shouldFail: true
      },
      {
        name: 'Eval usage',
        code: 'eval("console.log(\\"exploit\\")")',
        shouldFail: true
      },
      {
        name: 'Safe math operations',
        code: 'Math.random() * 100',
        shouldFail: false
      },
      {
        name: 'Safe string operations',
        code: '"Hello ".concat("World")',
        shouldFail: false
      }
    ];
    
    const results = [];
    
    for (const test of tests) {
      try {
        const result = await this.executeCode(test.code);
        
        results.push({
          name: test.name,
          passed: test.shouldFail ? !result.success : result.success,
          expected: test.shouldFail ? 'failure' : 'success',
          actual: result.success ? 'success' : 'failure',
          error: result.error
        });
        
      } catch (error) {
        results.push({
          name: test.name,
          passed: test.shouldFail,
          expected: test.shouldFail ? 'failure' : 'success',
          actual: 'failure',
          error: error.message
        });
      }
    }
    
    const passedTests = results.filter(r => r.passed).length;
    const totalTests = results.length;
    
    console.log(`🧪 Security tests: ${passedTests}/${totalTests} passed`);
    
    return {
      passed: passedTests,
      total: totalTests,
      success: passedTests === totalTests,
      results
    };
  }

  getStats() {
    return {
      safePaths: this.safePaths,
      allowedModules: this.allowedModules,
      config: this.config,
      blockedPatterns: this.blockedPatterns.length
    };
  }
}

module.exports = SecuritySandbox;