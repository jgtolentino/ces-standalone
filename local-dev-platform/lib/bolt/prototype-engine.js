const path = require('path');
const fs = require('fs').promises;
const archiver = require('archiver');

class PrototypeEngine {
  constructor() {
    this.templates = new Map();
    this.projects = new Map();
    this.generateCode = null;
    
    // Load Bolt.new style templates
    this.loadTemplates();
  }

  setCodeGenerator(genFunc) {
    this.generateCode = genFunc;
  }

  loadTemplates() {
    // Bolt.new style rapid prototyping templates
    this.templates.set('vanilla-js', {
      name: 'Vanilla JavaScript',
      description: 'Pure HTML, CSS, and JavaScript',
      files: {
        'index.html': this.getVanillaHTMLTemplate(),
        'style.css': this.getVanillaCSSTemplate(),
        'script.js': this.getVanillaJSTemplate(),
        'package.json': this.getVanillaPackageJson()
      },
      dependencies: [],
      buildCommand: null,
      devCommand: 'python -m http.server 8000'
    });

    this.templates.set('react', {
      name: 'React Application',
      description: 'Modern React with Vite',
      files: {
        'package.json': this.getReactPackageJson(),
        'vite.config.js': this.getViteConfig(),
        'index.html': this.getReactHTMLTemplate(),
        'src/main.jsx': this.getReactMainTemplate(),
        'src/App.jsx': this.getReactAppTemplate(),
        'src/index.css': this.getReactCSSTemplate()
      },
      dependencies: ['react', 'react-dom', 'vite', '@vitejs/plugin-react'],
      buildCommand: 'npm run build',
      devCommand: 'npm run dev'
    });

    this.templates.set('nextjs', {
      name: 'Next.js Application',
      description: 'Full-stack React with Next.js',
      files: {
        'package.json': this.getNextPackageJson(),
        'next.config.js': this.getNextConfig(),
        'app/layout.tsx': this.getNextLayoutTemplate(),
        'app/page.tsx': this.getNextPageTemplate(),
        'app/globals.css': this.getNextCSSTemplate(),
        'tailwind.config.js': this.getTailwindConfig()
      },
      dependencies: ['next', 'react', 'react-dom', 'tailwindcss', 'typescript'],
      buildCommand: 'npm run build',
      devCommand: 'npm run dev'
    });

    this.templates.set('vue', {
      name: 'Vue.js Application',
      description: 'Vue 3 with Vite',
      files: {
        'package.json': this.getVuePackageJson(),
        'vite.config.js': this.getVueViteConfig(),
        'index.html': this.getVueHTMLTemplate(),
        'src/main.js': this.getVueMainTemplate(),
        'src/App.vue': this.getVueAppTemplate(),
        'src/style.css': this.getVueCSSTemplate()
      },
      dependencies: ['vue', 'vite', '@vitejs/plugin-vue'],
      buildCommand: 'npm run build',
      devCommand: 'npm run dev'
    });

    this.templates.set('express', {
      name: 'Express.js API',
      description: 'Node.js REST API with Express',
      files: {
        'package.json': this.getExpressPackageJson(),
        'server.js': this.getExpressServerTemplate(),
        'routes/api.js': this.getExpressRoutesTemplate(),
        '.env.example': this.getExpressEnvTemplate(),
        'middleware/cors.js': this.getExpressMiddlewareTemplate()
      },
      dependencies: ['express', 'cors', 'dotenv', 'nodemon'],
      buildCommand: null,
      devCommand: 'npm run dev'
    });
  }

  async createProject(template, options = {}) {
    console.log(`⚡ Creating Bolt.new style project: ${template}`);
    
    const projectId = `bolt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const templateConfig = this.templates.get(template);
    
    if (!templateConfig) {
      throw new Error(`Template '${template}' not found`);
    }
    
    try {
      const project = {
        id: projectId,
        name: options.name || `${template}-project`,
        template,
        description: options.description || templateConfig.description,
        created: new Date(),
        files: new Map(),
        dependencies: [...templateConfig.dependencies],
        scripts: {
          dev: templateConfig.devCommand,
          build: templateConfig.buildCommand,
          start: 'npm start'
        },
        features: options.features || [],
        customizations: options.customizations || {}
      };
      
      // Generate base files from template
      for (const [filePath, content] of Object.entries(templateConfig.files)) {
        project.files.set(filePath, {
          path: filePath,
          content: typeof content === 'function' ? content(options) : content,
          type: this.getFileType(filePath),
          generated: false
        });
      }
      
      // Add custom features using AI
      if (options.features && options.features.length > 0) {
        await this.addFeatures(project, options.features);
      }
      
      // Apply customizations
      if (options.customizations) {
        await this.applyCustomizations(project, options.customizations);
      }
      
      this.projects.set(projectId, project);
      
      console.log(`✅ Created project: ${projectId}`);
      return {
        ...project,
        files: Array.from(project.files.values()),
        downloadUrl: `/api/projects/${projectId}/download`,
        previewUrl: `/api/projects/${projectId}/preview`
      };
      
    } catch (error) {
      console.error(`❌ Failed to create project:`, error);
      throw new Error(`Project creation failed: ${error.message}`);
    }
  }

  async addFeatures(project, features) {
    console.log(`🔧 Adding features: ${features.join(', ')}`);
    
    for (const feature of features) {
      await this.addFeature(project, feature);
    }
  }

  async addFeature(project, feature) {
    const specs = {
      language: this.getProjectLanguage(project.template),
      framework: project.template,
      feature: feature,
      existing_files: Array.from(project.files.keys()),
      project_structure: this.analyzeProjectStructure(project)
    };
    
    const prompt = `Add the "${feature}" feature to this ${project.template} project:

Project Structure:
${Array.from(project.files.keys()).join('\n')}

Requirements:
- Feature: ${feature}
- Framework: ${project.template}
- Language: ${specs.language}
- Integration: Seamless with existing code
- Best Practices: Follow framework conventions
- Styling: Match existing UI patterns

Generate the necessary files and modifications. For each file, specify:
1. File path
2. Complete file content
3. Whether it's new or modifying existing

Focus on clean, production-ready code with proper error handling.`;

    const response = await this.generateCode({ ...specs, prompt });
    
    // Parse the AI response and add/modify files
    const generatedFiles = this.parseGeneratedFiles(response);
    
    for (const file of generatedFiles) {
      project.files.set(file.path, {
        path: file.path,
        content: file.content,
        type: this.getFileType(file.path),
        generated: true,
        feature: feature
      });
      
      // Add to dependencies if needed
      if (file.dependencies) {
        project.dependencies.push(...file.dependencies);
      }
    }
  }

  async applyCustomizations(project, customizations) {
    console.log(`🎨 Applying customizations...`);
    
    if (customizations.styling) {
      await this.customizeStyling(project, customizations.styling);
    }
    
    if (customizations.layout) {
      await this.customizeLayout(project, customizations.layout);
    }
    
    if (customizations.functionality) {
      await this.customizeFunctionality(project, customizations.functionality);
    }
  }

  parseGeneratedFiles(response) {
    // Parse AI response for file structure
    // This would include sophisticated parsing logic
    const files = [];
    
    // Simple regex-based parsing (would be more sophisticated in production)
    const fileMatches = response.match(/```(\w+)\s*\n([\s\S]*?)```/g) || [];
    
    fileMatches.forEach((match, index) => {
      const lines = match.split('\n');
      const firstLine = lines[0];
      const content = lines.slice(1, -1).join('\n');
      
      // Extract file path from comment or assume based on index
      const pathMatch = response.match(/(?:File:|Path:|\/\/\s*)([^\n]+\.(?:js|jsx|ts|tsx|css|html|json))/);
      const path = pathMatch ? pathMatch[1] : `generated_file_${index}.js`;
      
      files.push({
        path: path.trim(),
        content: content,
        type: this.getFileType(path)
      });
    });
    
    return files;
  }

  getFileType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const typeMap = {
      '.js': 'javascript',
      '.jsx': 'react',
      '.ts': 'typescript',
      '.tsx': 'react-typescript',
      '.vue': 'vue',
      '.css': 'stylesheet',
      '.html': 'markup',
      '.json': 'json',
      '.md': 'markdown'
    };
    return typeMap[ext] || 'text';
  }

  getProjectLanguage(template) {
    const languageMap = {
      'vanilla-js': 'JavaScript',
      'react': 'JavaScript/JSX',
      'nextjs': 'TypeScript/TSX',
      'vue': 'JavaScript/Vue',
      'express': 'JavaScript/Node.js'
    };
    return languageMap[template] || 'JavaScript';
  }

  analyzeProjectStructure(project) {
    const structure = {
      components: [],
      pages: [],
      api: [],
      assets: [],
      config: []
    };
    
    project.files.forEach((file, path) => {
      if (path.includes('component')) structure.components.push(path);
      if (path.includes('page') || path.includes('route')) structure.pages.push(path);
      if (path.includes('api')) structure.api.push(path);
      if (path.includes('asset') || path.includes('public')) structure.assets.push(path);
      if (path.includes('config')) structure.config.push(path);
    });
    
    return structure;
  }

  async downloadProject(projectId) {
    const project = this.projects.get(projectId);
    if (!project) {
      throw new Error('Project not found');
    }
    
    // Create zip archive
    const archive = archiver('zip', { zlib: { level: 9 } });
    
    // Add all project files
    project.files.forEach((file, path) => {
      archive.append(file.content, { name: path });
    });
    
    await archive.finalize();
    return archive;
  }

  // Template methods for different frameworks
  getVanillaHTMLTemplate() {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vanilla JS App</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div id="app">
        <h1>Hello, World!</h1>
        <p>Your vanilla JavaScript app is ready.</p>
    </div>
    <script src="script.js"></script>
</body>
</html>`;
  }

  getVanillaCSSTemplate() {
    return `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    line-height: 1.6;
    color: #333;
    background: #f4f4f4;
}

#app {
    max-width: 800px;
    margin: 2rem auto;
    padding: 2rem;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

h1 {
    color: #2c3e50;
    margin-bottom: 1rem;
}`;
  }

  getVanillaJSTemplate() {
    return `// Vanilla JavaScript App
document.addEventListener('DOMContentLoaded', function() {
    console.log('App initialized');
    
    // Add your JavaScript here
    const app = document.getElementById('app');
    
    // Example: Add click handler
    app.addEventListener('click', function(e) {
        if (e.target.tagName === 'BUTTON') {
            console.log('Button clicked:', e.target.textContent);
        }
    });
});`;
  }

  getVanillaPackageJson() {
    return JSON.stringify({
      name: 'vanilla-js-app',
      version: '1.0.0',
      description: 'A vanilla JavaScript application',
      main: 'index.html',
      scripts: {
        start: 'python -m http.server 8000',
        dev: 'python -m http.server 8000'
      }
    }, null, 2);
  }

  // More template methods would be implemented here...
  // (React, Next.js, Vue, Express templates)

  getProject(projectId) {
    return this.projects.get(projectId);
  }

  getAllProjects() {
    return Array.from(this.projects.values());
  }

  deleteProject(projectId) {
    return this.projects.delete(projectId);
  }
}

module.exports = PrototypeEngine;