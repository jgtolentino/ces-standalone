#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Smart Integration - Based on analysis results, create optimal integration plan
 */

class SmartIntegration {
  constructor() {
    this.analysisFile = path.join(__dirname, '../reports/integration-analysis.json');
    this.analysis = null;
  }

  log(message, type = 'info') {
    const emoji = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warning' ? '⚠️' : 'ℹ️';
    console.log(`${emoji} ${message}`);
  }

  loadAnalysis() {
    if (!fs.existsSync(this.analysisFile)) {
      throw new Error('Integration analysis not found. Run integration-analyzer.js first.');
    }
    
    this.analysis = JSON.parse(fs.readFileSync(this.analysisFile, 'utf8'));
    this.log(`📊 Loaded analysis with ${this.analysis.summary.total_projects} projects`);
  }

  /**
   * Create integration roadmap based on analysis
   */
  createIntegrationRoadmap() {
    this.log('🗺️ Creating smart integration roadmap...');
    
    const roadmap = {
      immediate: [],
      short_term: [],
      long_term: []
    };

    // Immediate: Consolidate shared dependencies (high impact)
    if (this.analysis.integration_opportunities?.shared_dependencies?.length > 0) {
      roadmap.immediate.push({
        task: 'consolidate_dependencies',
        title: 'Consolidate Shared Dependencies',
        priority: 'high',
        effort: '4-6 hours',
        impact: 'Reduces bundle size and version conflicts',
        dependencies: this.analysis.integration_opportunities.shared_dependencies.slice(0, 10)
      });
    }

    // Short-term: Standardize on React/Next.js
    const reactProjects = Object.entries(this.analysis.projects)
      .filter(([name, project]) => project.type === 'React')
      .map(([name]) => name);

    if (reactProjects.length >= 3) {
      roadmap.short_term.push({
        task: 'standardize_framework',
        title: 'Standardize on React/Next.js',
        priority: 'medium',
        effort: '2-3 days',
        impact: 'Unified development experience',
        projects: reactProjects
      });
    }

    // Long-term: API consolidation
    if (this.analysis.integration_opportunities?.common_apis?.length > 0) {
      roadmap.long_term.push({
        task: 'consolidate_apis',
        title: 'Consolidate Common APIs',
        priority: 'medium',
        effort: '1-2 weeks',
        impact: 'Reduced code duplication and better consistency',
        patterns: this.analysis.integration_opportunities.common_apis.slice(0, 5)
      });
    }

    return roadmap;
  }

  /**
   * Generate smart migration order based on complexity and dependencies
   */
  generateMigrationOrder() {
    this.log('🔄 Generating optimal migration order...');
    
    const projects = Object.entries(this.analysis.projects);
    
    // Sort by complexity (low first) and dependency count
    const migrationOrder = projects
      .map(([name, project]) => ({
        name,
        complexity: this.getComplexityScore(project),
        dependencies: Object.keys(project.dependencies?.runtime || {}).length,
        apis: (project.apis || []).length,
        type: project.type
      }))
      .sort((a, b) => {
        // Prioritize simpler projects first
        if (a.complexity !== b.complexity) {
          return a.complexity - b.complexity;
        }
        // Then by fewer dependencies
        return a.dependencies - b.dependencies;
      });

    return migrationOrder;
  }

  /**
   * Get numeric complexity score
   */
  getComplexityScore(project) {
    const scores = { low: 1, medium: 2, high: 3 };
    const complexity = this.analysis.migration_plan?.phase2?.tasks
      ?.find(task => task.project === project.name)?.complexity || 'medium';
    return scores[complexity] || 2;
  }

  /**
   * Create shared packages extraction plan
   */
  createSharedPackagesExtractionPlan() {
    this.log('📦 Creating shared packages extraction plan...');
    
    const sharedDeps = this.analysis.integration_opportunities?.shared_dependencies || [];
    const envVars = this.analysis.integration_opportunities?.env_consolidation || [];
    
    const extractionPlan = {
      ui_components: {
        candidates: this.findUIComponents(),
        target_package: '@ai/ui',
        effort: '8-12 hours'
      },
      shared_utilities: {
        candidates: this.findSharedUtilities(),
        target_package: '@ai/utils',
        effort: '4-6 hours'
      },
      database_clients: {
        candidates: this.findDatabaseClients(),
        target_package: '@ai/db',
        effort: '6-8 hours'
      },
      environment_config: {
        candidates: envVars.slice(0, 10),
        target_package: '@ai/config',
        effort: '2-4 hours'
      }
    };

    return extractionPlan;
  }

  /**
   * Find UI components across projects
   */
  findUIComponents() {
    const uiComponents = [];
    
    Object.entries(this.analysis.projects).forEach(([projectName, project]) => {
      const deps = project.dependencies?.runtime || {};
      
      // Look for UI-related dependencies
      Object.keys(deps).forEach(dep => {
        if (dep.includes('radix') || dep.includes('ui') || dep.includes('component')) {
          uiComponents.push({
            project: projectName,
            dependency: dep,
            version: deps[dep]
          });
        }
      });
    });

    return uiComponents;
  }

  /**
   * Find shared utilities
   */
  findSharedUtilities() {
    const utilities = [];
    const commonUtils = ['clsx', 'class-variance-authority', 'tailwind-merge', 'zod', 'date-fns'];
    
    Object.entries(this.analysis.projects).forEach(([projectName, project]) => {
      const deps = project.dependencies?.runtime || {};
      
      commonUtils.forEach(util => {
        if (deps[util]) {
          utilities.push({
            project: projectName,
            utility: util,
            version: deps[util]
          });
        }
      });
    });

    return utilities;
  }

  /**
   * Find database clients
   */
  findDatabaseClients() {
    const dbClients = [];
    const dbRelated = ['supabase', 'drizzle', 'postgres', 'prisma'];
    
    Object.entries(this.analysis.projects).forEach(([projectName, project]) => {
      const deps = project.dependencies?.runtime || {};
      
      Object.keys(deps).forEach(dep => {
        if (dbRelated.some(db => dep.toLowerCase().includes(db))) {
          dbClients.push({
            project: projectName,
            client: dep,
            version: deps[dep]
          });
        }
      });
    });

    return dbClients;
  }

  /**
   * Generate step-by-step integration guide
   */
  generateIntegrationGuide() {
    this.log('📋 Generating step-by-step integration guide...');
    
    const roadmap = this.createIntegrationRoadmap();
    const migrationOrder = this.generateMigrationOrder();
    const extractionPlan = this.createSharedPackagesExtractionPlan();

    const guide = {
      overview: {
        total_projects: this.analysis.summary.total_projects,
        estimated_total_effort: '3-4 weeks',
        risk_level: 'medium',
        success_factors: [
          'Gradual migration approach',
          'Shared packages first',
          'Comprehensive testing at each step',
          'Rollback plan for each phase'
        ]
      },
      
      pre_migration: {
        title: 'Pre-Migration Setup',
        duration: '1-2 days',
        tasks: [
          'Backup all existing projects',
          'Set up monorepo structure',
          'Create shared packages',
          'Configure build system',
          'Set up CI/CD pipeline'
        ]
      },

      phase1: {
        title: 'Foundation & Shared Packages',
        duration: '3-5 days',
        tasks: roadmap.immediate.concat([
          {
            task: 'setup_shared_packages',
            title: 'Extract Shared Packages',
            details: extractionPlan
          }
        ])
      },

      phase2: {
        title: 'Project Migration',
        duration: '1-2 weeks',
        tasks: migrationOrder.map(project => ({
          task: 'migrate_project',
          project: project.name,
          complexity: project.complexity,
          dependencies: project.dependencies,
          estimated_effort: this.getEstimatedEffort(project)
        }))
      },

      phase3: {
        title: 'Integration & Optimization',
        duration: '3-5 days',
        tasks: roadmap.short_term.concat(roadmap.long_term)
      },

      validation: {
        title: 'Testing & Validation',
        duration: '2-3 days',
        tasks: [
          'Run all project builds',
          'Test shared package imports',
          'Validate CI/CD pipeline',
          'Performance testing',
          'Documentation updates'
        ]
      }
    };

    return guide;
  }

  /**
   * Get estimated effort for project migration
   */
  getEstimatedEffort(project) {
    const baseEffort = {
      1: '4-6 hours',    // low complexity
      2: '8-12 hours',   // medium complexity  
      3: '16-24 hours'   // high complexity
    };

    return baseEffort[project.complexity] || '8-12 hours';
  }

  /**
   * Generate monorepo preparation commands
   */
  generatePreparationCommands() {
    this.log('⚙️ Generating preparation commands...');
    
    const commands = {
      backup: [
        '# 1. Backup existing projects',
        'mkdir -p backups/$(date +%Y-%m-%d)',
        'cp -r ../campaign-insight-accelerator backups/$(date +%Y-%m-%d)/',
        'cp -r ../retail-insights-dashboard-ph backups/$(date +%Y-%m-%d)/',
        'cp -r ../Scout\\ Dashboard backups/$(date +%Y-%m-%d)/',
        'cp -r ../InsightPulseAI_SKR backups/$(date +%Y-%m-%d)/'
      ],
      
      setup: [
        '# 2. Initialize workspace',
        'pnpm install',
        'task doctor',
        '# Verify monorepo structure is working'
      ],
      
      shared_packages: [
        '# 3. Build shared packages first',
        'pnpm --filter "./packages/*" build',
        '# Verify shared packages work'
      ],
      
      first_migration: [
        '# 4. Start with simplest project first',
        `task create:tenant TENANT=${this.getSimplestProject()}`,
        '# Copy files manually for safety',
        'task build:tenant TENANT=' + this.getSimplestProject(),
        '# Verify it works before proceeding'
      ]
    };

    return commands;
  }

  /**
   * Get simplest project to migrate first
   */
  getSimplestProject() {
    const migrationOrder = this.generateMigrationOrder();
    return migrationOrder[0]?.name || 'ces';
  }

  /**
   * Generate integration report
   */
  generateIntegrationReport() {
    const roadmap = this.createIntegrationRoadmap();
    const guide = this.generateIntegrationGuide();
    const commands = this.generatePreparationCommands();
    
    const report = {
      timestamp: new Date().toISOString(),
      source_analysis: this.analysisFile,
      roadmap,
      integration_guide: guide,
      preparation_commands: commands,
      recommendations: {
        start_with: this.getSimplestProject(),
        biggest_wins: roadmap.immediate,
        risk_mitigation: [
          'Migrate one project at a time',
          'Keep original projects until monorepo is validated',
          'Test shared packages independently',
          'Gradual rollout to production'
        ]
      }
    };

    // Save report
    const reportPath = path.join(__dirname, '../reports/smart-integration-plan.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    this.log(`📄 Smart integration plan saved to: ${reportPath}`, 'success');
    return report;
  }

  /**
   * Print actionable summary
   */
  printActionableSummary(report) {
    console.log('\n🎯 SMART INTEGRATION PLAN');
    console.log('=' .repeat(50));
    console.log(`📊 Total Projects: ${this.analysis.summary.total_projects}`);
    console.log(`⏱️  Estimated Effort: ${report.integration_guide.overview.estimated_total_effort}`);
    console.log(`🚦 Risk Level: ${report.integration_guide.overview.risk_level}`);
    
    console.log('\n🚀 NEXT STEPS:');
    console.log(`   1. Start with: ${report.recommendations.start_with}`);
    console.log(`   2. Backup everything first`);
    console.log(`   3. Build shared packages`);
    console.log(`   4. Migrate projects one by one`);
    
    console.log('\n💡 IMMEDIATE WINS:');
    report.roadmap.immediate.forEach((item, index) => {
      console.log(`   ${index + 1}. ${item.title} (${item.effort})`);
    });

    console.log('\n⚠️  RISK MITIGATION:');
    report.recommendations.risk_mitigation.forEach((risk, index) => {
      console.log(`   ${index + 1}. ${risk}`);
    });

    console.log('\n🔧 PREPARATION COMMANDS:');
    console.log('   Run: node scripts/smart-integration.js --commands');
  }

  /**
   * Run smart integration analysis
   */
  async runSmartIntegration() {
    try {
      this.loadAnalysis();
      const report = this.generateIntegrationReport();
      this.printActionableSummary(report);
      
      return report;
    } catch (error) {
      this.log(`❌ Smart integration failed: ${error.message}`, 'error');
      throw error;
    }
  }
}

// CLI interface
if (require.main === module) {
  const integration = new SmartIntegration();
  
  if (process.argv.includes('--commands')) {
    integration.loadAnalysis();
    const commands = integration.generatePreparationCommands();
    
    console.log('\n🔧 PREPARATION COMMANDS:\n');
    Object.entries(commands).forEach(([phase, cmds]) => {
      console.log(cmds.join('\n'));
      console.log('');
    });
  } else {
    integration.runSmartIntegration().catch(console.error);
  }
}

module.exports = SmartIntegration;