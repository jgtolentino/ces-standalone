#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Integration Analyzer - Better understand existing projects before migration
 * Analyzes dependencies, APIs, shared code, and integration points
 */

class IntegrationAnalyzer {
  constructor() {
    this.sourceDir = path.join(__dirname, '../../');
    this.results = {
      projects: {},
      dependencies: {},
      apis: {},
      shared_code: {},
      integration_points: {},
      conflicts: []
    };
  }

  log(message, type = 'info') {
    const emoji = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warning' ? '⚠️' : 'ℹ️';
    console.log(`${emoji} ${message}`);
  }

  /**
   * Analyze existing projects structure
   */
  async analyzeProjects() {
    this.log('🔍 Analyzing existing projects...');
    
    const projects = [
      'campaign-insight-accelerator',
      'retail-insights-dashboard-ph',
      'Scout Dashboard',
      'InsightPulseAI_SKR',
      'pulser-live',
      'bruno-agentic-cli',
      '360',
      'client',
      'frontend'
    ];

    for (const project of projects) {
      const projectPath = path.join(this.sourceDir, project);
      if (fs.existsSync(projectPath)) {
        await this.analyzeProject(project, projectPath);
      }
    }
  }

  /**
   * Analyze individual project
   */
  async analyzeProject(name, projectPath) {
    const analysis = {
      name,
      path: projectPath,
      type: this.detectProjectType(projectPath),
      dependencies: {},
      apis: [],
      configs: {},
      shared_files: [],
      database_usage: [],
      env_vars: []
    };

    // Analyze package.json
    const packagePath = path.join(projectPath, 'package.json');
    if (fs.existsSync(packagePath)) {
      try {
        const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        analysis.dependencies = {
          runtime: packageJson.dependencies || {},
          dev: packageJson.devDependencies || {},
          scripts: packageJson.scripts || {}
        };
      } catch (error) {
        this.log(`Warning: Could not parse package.json for ${name}`, 'warning');
      }
    }

    // Look for API endpoints
    analysis.apis = this.findAPIEndpoints(projectPath);
    
    // Find config files
    analysis.configs = this.findConfigFiles(projectPath);
    
    // Find environment variables
    analysis.env_vars = this.findEnvVariables(projectPath);
    
    // Look for database usage
    analysis.database_usage = this.findDatabaseUsage(projectPath);

    this.results.projects[name] = analysis;
    this.log(`📊 Analyzed ${name}: ${analysis.type}`);
  }

  /**
   * Detect project type
   */
  detectProjectType(projectPath) {
    const indicators = {
      'Next.js': ['next.config.js', 'next.config.ts'],
      'React': ['src/App.jsx', 'src/App.tsx'],
      'Vite': ['vite.config.js', 'vite.config.ts'],
      'Node.js': ['server.js', 'index.js'],
      'Python': ['main.py', 'app.py', 'requirements.txt'],
      'Pulser': ['*.yaml', '*.yml'],
      'CLI': ['bin/', 'cli/']
    };

    for (const [type, files] of Object.entries(indicators)) {
      if (files.some(file => {
        if (file.includes('*')) {
          // Glob pattern
          const pattern = file.replace('*', '');
          return this.findFilesWithPattern(projectPath, pattern).length > 0;
        }
        return fs.existsSync(path.join(projectPath, file));
      })) {
        return type;
      }
    }

    return 'Unknown';
  }

  /**
   * Find API endpoints in project
   */
  findAPIEndpoints(projectPath) {
    const endpoints = [];
    const apiPatterns = [
      /app\.get\(['"`]([^'"`]+)['"`]/g,
      /app\.post\(['"`]([^'"`]+)['"`]/g,
      /router\.get\(['"`]([^'"`]+)['"`]/g,
      /export.*async.*function.*\(/g,
      /\/api\/[^\s'"]+/g
    ];

    try {
      this.walkFiles(projectPath, (filePath) => {
        if (filePath.match(/\.(js|ts|jsx|tsx)$/)) {
          const content = fs.readFileSync(filePath, 'utf8');
          
          apiPatterns.forEach(pattern => {
            let match;
            while ((match = pattern.exec(content)) !== null) {
              endpoints.push({
                file: path.relative(projectPath, filePath),
                endpoint: match[1] || match[0],
                line: this.getLineNumber(content, match.index)
              });
            }
          });
        }
      });
    } catch (error) {
      // Ignore errors for now
    }

    return endpoints;
  }

  /**
   * Find configuration files
   */
  findConfigFiles(projectPath) {
    const configs = {};
    const configFiles = [
      'next.config.js',
      'vite.config.js',
      'tailwind.config.js',
      'tsconfig.json',
      '.env',
      '.env.local',
      '.env.example',
      'vercel.json',
      'supabase/config.toml',
      'docker-compose.yml',
      'Dockerfile'
    ];

    configFiles.forEach(configFile => {
      const configPath = path.join(projectPath, configFile);
      if (fs.existsSync(configPath)) {
        configs[configFile] = {
          path: configPath,
          size: fs.statSync(configPath).size
        };
      }
    });

    return configs;
  }

  /**
   * Find environment variables
   */
  findEnvVariables(projectPath) {
    const envVars = new Set();
    
    try {
      this.walkFiles(projectPath, (filePath) => {
        if (filePath.match(/\.(js|ts|jsx|tsx|env)$/)) {
          const content = fs.readFileSync(filePath, 'utf8');
          
          // Find process.env usage
          const envMatches = content.match(/process\.env\.([A-Z_][A-Z0-9_]*)/g);
          if (envMatches) {
            envMatches.forEach(match => {
              const varName = match.replace('process.env.', '');
              envVars.add(varName);
            });
          }

          // Find .env file variables
          if (filePath.includes('.env')) {
            const lines = content.split('\n');
            lines.forEach(line => {
              const match = line.match(/^([A-Z_][A-Z0-9_]*)=/);
              if (match) {
                envVars.add(match[1]);
              }
            });
          }
        }
      });
    } catch (error) {
      // Ignore errors
    }

    return Array.from(envVars);
  }

  /**
   * Find database usage patterns
   */
  findDatabaseUsage(projectPath) {
    const dbUsage = [];
    const dbPatterns = [
      /supabase/gi,
      /createClient/g,
      /\.from\(['"`]([^'"`]+)['"`]\)/g,
      /SELECT.*FROM/gi,
      /INSERT.*INTO/gi,
      /UPDATE.*SET/gi,
      /DELETE.*FROM/gi
    ];

    try {
      this.walkFiles(projectPath, (filePath) => {
        if (filePath.match(/\.(js|ts|jsx|tsx|sql)$/)) {
          const content = fs.readFileSync(filePath, 'utf8');
          
          dbPatterns.forEach(pattern => {
            const matches = content.match(pattern);
            if (matches) {
              dbUsage.push({
                file: path.relative(projectPath, filePath),
                pattern: pattern.toString(),
                count: matches.length
              });
            }
          });
        }
      });
    } catch (error) {
      // Ignore errors
    }

    return dbUsage;
  }

  /**
   * Analyze integration opportunities
   */
  analyzeIntegrationOpportunities() {
    this.log('🔗 Analyzing integration opportunities...');
    
    const opportunities = {
      shared_dependencies: this.findSharedDependencies(),
      common_apis: this.findCommonAPIs(),
      env_consolidation: this.findEnvConsolidationOpportunities(),
      database_overlap: this.findDatabaseOverlap()
    };

    this.results.integration_points = opportunities;
    return opportunities;
  }

  /**
   * Find shared dependencies across projects
   */
  findSharedDependencies() {
    const depCounts = {};
    
    Object.values(this.results.projects).forEach(project => {
      const allDeps = {
        ...(project.dependencies?.runtime || {}),
        ...(project.dependencies?.dev || {})
      };
      
      Object.keys(allDeps).forEach(dep => {
        depCounts[dep] = (depCounts[dep] || 0) + 1;
      });
    });

    // Return dependencies used by 2+ projects
    return Object.entries(depCounts)
      .filter(([dep, count]) => count >= 2)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 20);
  }

  /**
   * Find common API patterns
   */
  findCommonAPIs() {
    const apiPatterns = {};
    
    Object.values(this.results.projects).forEach(project => {
      project.apis.forEach(api => {
        const pattern = api.endpoint.replace(/\/\d+/g, '/:id').replace(/\/[a-f0-9-]{36}/g, '/:uuid');
        apiPatterns[pattern] = (apiPatterns[pattern] || 0) + 1;
      });
    });

    return Object.entries(apiPatterns)
      .filter(([pattern, count]) => count >= 2)
      .sort(([,a], [,b]) => b - a);
  }

  /**
   * Find environment consolidation opportunities
   */
  findEnvConsolidationOpportunities() {
    const envCounts = {};
    
    Object.values(this.results.projects).forEach(project => {
      project.env_vars.forEach(envVar => {
        envCounts[envVar] = (envCounts[envVar] || 0) + 1;
      });
    });

    return Object.entries(envCounts)
      .filter(([env, count]) => count >= 2)
      .sort(([,a], [,b]) => b - a);
  }

  /**
   * Find database overlap and patterns
   */
  findDatabaseOverlap() {
    const dbPatterns = {};
    
    Object.values(this.results.projects).forEach(project => {
      project.database_usage.forEach(usage => {
        const key = usage.pattern;
        dbPatterns[key] = (dbPatterns[key] || 0) + 1;
      });
    });

    return Object.entries(dbPatterns)
      .filter(([pattern, count]) => count >= 2)
      .sort(([,a], [,b]) => b - a);
  }

  /**
   * Generate integration recommendations
   */
  generateRecommendations() {
    this.log('💡 Generating integration recommendations...');
    
    const recommendations = [];
    const opportunities = this.results.integration_points;

    // Shared dependencies recommendation
    if (opportunities.shared_dependencies.length > 0) {
      recommendations.push({
        type: 'dependency_consolidation',
        priority: 'high',
        title: 'Consolidate Shared Dependencies',
        description: `${opportunities.shared_dependencies.length} dependencies are used across multiple projects`,
        action: 'Move to packages/ with workspace references',
        affected_projects: opportunities.shared_dependencies.slice(0, 5).map(([dep]) => dep)
      });
    }

    // Common APIs recommendation
    if (opportunities.common_apis.length > 0) {
      recommendations.push({
        type: 'api_consolidation',
        priority: 'medium',
        title: 'Consolidate Common APIs',
        description: `${opportunities.common_apis.length} API patterns are duplicated`,
        action: 'Create shared API package or use tenant-scoped routes',
        patterns: opportunities.common_apis.slice(0, 3).map(([pattern]) => pattern)
      });
    }

    // Environment variables recommendation
    if (opportunities.env_consolidation.length > 0) {
      recommendations.push({
        type: 'env_consolidation',
        priority: 'medium',
        title: 'Consolidate Environment Variables',
        description: `${opportunities.env_consolidation.length} env vars are duplicated`,
        action: 'Use tenant-scoped environment configuration',
        variables: opportunities.env_consolidation.slice(0, 5).map(([env]) => env)
      });
    }

    // Project type recommendations
    const projectTypes = Object.values(this.results.projects).reduce((acc, project) => {
      acc[project.type] = (acc[project.type] || 0) + 1;
      return acc;
    }, {});

    if (projectTypes['Next.js'] >= 2) {
      recommendations.push({
        type: 'framework_standardization',
        priority: 'low',
        title: 'Standardize on Next.js',
        description: `${projectTypes['Next.js']} projects already use Next.js`,
        action: 'Consider migrating other React projects to Next.js for consistency'
      });
    }

    return recommendations;
  }

  /**
   * Generate migration plan
   */
  generateMigrationPlan() {
    this.log('📋 Generating migration plan...');
    
    const plan = {
      phase1: {
        title: 'Setup Monorepo Foundation',
        tasks: [
          'Initialize workspace configuration',
          'Setup shared packages structure',
          'Configure build system'
        ]
      },
      phase2: {
        title: 'Migrate Core Projects',
        tasks: []
      },
      phase3: {
        title: 'Integration and Optimization',
        tasks: [
          'Consolidate shared dependencies',
          'Implement common APIs',
          'Setup CI/CD pipelines'
        ]
      }
    };

    // Add project-specific migration tasks
    Object.entries(this.results.projects).forEach(([name, project]) => {
      const complexity = this.assessMigrationComplexity(project);
      plan.phase2.tasks.push({
        project: name,
        complexity,
        dependencies: Object.keys(project.dependencies?.runtime || {}).length,
        apis: (project.apis || []).length,
        estimated_effort: this.estimateEffort(complexity, project)
      });
    });

    return plan;
  }

  /**
   * Assess migration complexity
   */
  assessMigrationComplexity(project) {
    let score = 0;
    
    // Dependency complexity
    const depCount = Object.keys(project.dependencies?.runtime || {}).length;
    score += Math.min(depCount / 10, 3);
    
    // API complexity
    score += Math.min((project.apis || []).length / 5, 2);
    
    // Config complexity
    score += Object.keys(project.configs || {}).length * 0.5;
    
    // Database usage
    score += (project.database_usage || []).length * 0.5;

    if (score < 2) return 'low';
    if (score < 5) return 'medium';
    return 'high';
  }

  /**
   * Estimate migration effort
   */
  estimateEffort(complexity, project) {
    const baseHours = {
      low: 4,
      medium: 8,
      high: 16
    };
    
    let hours = baseHours[complexity] || 8;
    
    // Add time for specific complexities
    if ((project.database_usage || []).length > 5) hours += 4;
    if ((project.apis || []).length > 10) hours += 4;
    if (Object.keys(project.configs || {}).length > 5) hours += 2;
    
    return `${hours}-${hours + 4} hours`;
  }

  /**
   * Generate report
   */
  generateReport() {
    const recommendations = this.generateRecommendations();
    const migrationPlan = this.generateMigrationPlan();
    
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total_projects: Object.keys(this.results.projects).length,
        project_types: this.getProjectTypesSummary(),
        shared_dependencies: this.results.integration_points.shared_dependencies?.length || 0,
        common_apis: this.results.integration_points.common_apis?.length || 0
      },
      projects: this.results.projects,
      integration_opportunities: this.results.integration_points,
      recommendations,
      migration_plan: migrationPlan
    };

    return report;
  }

  /**
   * Get project types summary
   */
  getProjectTypesSummary() {
    return Object.values(this.results.projects).reduce((acc, project) => {
      acc[project.type] = (acc[project.type] || 0) + 1;
      return acc;
    }, {});
  }

  /**
   * Helper: Walk files recursively
   */
  walkFiles(dir, callback) {
    if (!fs.existsSync(dir)) return;
    
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
        this.walkFiles(filePath, callback);
      } else if (stat.isFile()) {
        callback(filePath);
      }
    }
  }

  /**
   * Helper: Find files with pattern
   */
  findFilesWithPattern(dir, pattern) {
    const results = [];
    try {
      this.walkFiles(dir, (filePath) => {
        if (filePath.includes(pattern)) {
          results.push(filePath);
        }
      });
    } catch (error) {
      // Ignore errors
    }
    return results;
  }

  /**
   * Helper: Get line number from index
   */
  getLineNumber(content, index) {
    return content.substring(0, index).split('\n').length;
  }

  /**
   * Run complete analysis
   */
  async runCompleteAnalysis() {
    try {
      this.log('🚀 Starting complete integration analysis...');
      
      await this.analyzeProjects();
      this.analyzeIntegrationOpportunities();
      
      const report = this.generateReport();
      
      // Save report
      const reportPath = path.join(__dirname, '../reports/integration-analysis.json');
      const reportsDir = path.dirname(reportPath);
      if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
      }
      
      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
      
      this.log(`📄 Integration analysis complete! Report saved to: ${reportPath}`, 'success');
      this.printSummary(report);
      
      return report;
      
    } catch (error) {
      this.log(`❌ Analysis failed: ${error.message}`, 'error');
      throw error;
    }
  }

  /**
   * Print summary to console
   */
  printSummary(report) {
    console.log('\n📊 INTEGRATION ANALYSIS SUMMARY');
    console.log('=' .repeat(50));
    console.log(`🗂️  Total Projects: ${report.summary.total_projects}`);
    console.log(`🔗 Shared Dependencies: ${report.summary.shared_dependencies}`);
    console.log(`🌐 Common APIs: ${report.summary.common_apis}`);
    
    console.log('\n📋 PROJECT TYPES:');
    Object.entries(report.summary.project_types).forEach(([type, count]) => {
      console.log(`   ${type}: ${count}`);
    });

    console.log('\n💡 TOP RECOMMENDATIONS:');
    report.recommendations.slice(0, 3).forEach((rec, index) => {
      console.log(`   ${index + 1}. ${rec.title} (${rec.priority})`);
      console.log(`      ${rec.description}`);
    });

    console.log('\n📅 MIGRATION EFFORT:');
    report.migration_plan.phase2.tasks.forEach(task => {
      if (typeof task === 'object') {
        console.log(`   ${task.project}: ${task.complexity} complexity (${task.estimated_effort})`);
      }
    });
  }
}

// CLI interface
if (require.main === module) {
  const analyzer = new IntegrationAnalyzer();
  analyzer.runCompleteAnalysis().catch(console.error);
}

module.exports = IntegrationAnalyzer;