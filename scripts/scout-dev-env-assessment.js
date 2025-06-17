#!/usr/bin/env node
/**
 * Scout Dev Environment Assessment Script
 * Phase 0: AI-Native Development Environment Readiness
 * 
 * This script implements the Scout Dev Environment Assessment Agent
 * to validate development environment readiness for AI-native work.
 */

const { execSync } = require('child_process');
const { existsSync, readFileSync, writeFileSync, mkdirSync } = require('fs');
const { join } = require('path');

class ScoutDevEnvironmentAssessor {
  constructor() {
    this.results = [];
    this.criticalIssues = [];
    this.actionItems = [];
    console.log('🔍 Scout Dev Environment Assessment Starting...\n');
  }

  /**
   * Main assessment execution
   */
  async runAssessment() {
    console.log('📋 Running comprehensive environment assessment...\n');

    // Phase 1: Development Environment
    await this.assessDevelopmentEnvironment();
    
    // Phase 2: AI-Native Stack
    await this.assessAINativeStack();
    
    // Phase 3: Required Assets
    await this.assessRequiredAssets();
    
    // Phase 4: Agent Ecosystem
    await this.assessAgentEcosystem();

    // Generate final report
    return this.generateReport();
  }

  /**
   * Phase 1: Development Environment Assessment
   */
  async assessDevelopmentEnvironment() {
    console.log('🔧 Phase 1: Development Environment Assessment');
    
    const issues = [];
    const recommendations = [];
    let score = 0;
    const maxScore = 25;

    try {
      // Node.js version check
      const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
      const nodeVersionNum = parseFloat(nodeVersion.replace('v', ''));
      
      if (nodeVersionNum >= 18.0) {
        score += 5;
        console.log(`  ✅ Node.js version: ${nodeVersion}`);
      } else {
        issues.push(`Node.js version ${nodeVersion} is below required 18.0.0`);
        recommendations.push('Update Node.js to version 18.0.0 or higher');
        console.log(`  ❌ Node.js version: ${nodeVersion} (requires >=18.0.0)`);
      }

      // Package manager check
      try {
        const pnpmVersion = execSync('pnpm --version', { encoding: 'utf8' }).trim();
        score += 3;
        console.log(`  ✅ pnpm version: ${pnpmVersion}`);
      } catch {
        try {
          const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
          score += 2;
          console.log(`  ⚠️  npm version: ${npmVersion} (pnpm recommended)`);
          recommendations.push('Consider using pnpm for better performance');
        } catch {
          issues.push('No package manager found');
          recommendations.push('Install pnpm or npm');
          console.log(`  ❌ No package manager found`);
        }
      }

      // TypeScript check
      try {
        const tscVersion = execSync('npx tsc --version', { encoding: 'utf8' }).trim();
        score += 4;
        console.log(`  ✅ TypeScript: ${tscVersion}`);
      } catch {
        issues.push('TypeScript not found or not configured');
        recommendations.push('Install and configure TypeScript');
        console.log(`  ❌ TypeScript not found`);
      }

      // Next.js check
      if (existsSync('next.config.js') || existsSync('next.config.ts')) {
        score += 4;
        console.log(`  ✅ Next.js configuration found`);
      } else {
        issues.push('Next.js configuration not found');
        recommendations.push('Ensure Next.js is properly configured');
        console.log(`  ❌ Next.js configuration not found`);
      }

      // Git repository check
      if (existsSync('.git')) {
        score += 3;
        console.log(`  ✅ Git repository initialized`);
      } else {
        issues.push('Git repository not initialized');
        recommendations.push('Initialize Git repository');
        console.log(`  ❌ Git repository not found`);
      }

      // Package.json check
      if (existsSync('package.json')) {
        score += 3;
        console.log(`  ✅ package.json found`);
        
        // Check for essential dependencies
        const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
        const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
        
        if (deps.next) {
          score += 2;
          console.log(`  ✅ Next.js dependency found`);
        } else {
          issues.push('Next.js dependency not found in package.json');
        }

        if (deps.typescript) {
          score += 1;
          console.log(`  ✅ TypeScript dependency found`);
        }
      } else {
        issues.push('package.json not found');
        recommendations.push('Initialize npm project with package.json');
        console.log(`  ❌ package.json not found`);
      }

    } catch (error) {
      issues.push(`Development environment check failed: ${error.message}`);
      console.log(`  ❌ Assessment error: ${error.message}`);
    }

    const status = this.getStatus(score, maxScore);
    this.results.push({
      category: 'Development Environment',
      score,
      maxScore,
      issues,
      recommendations,
      status
    });

    console.log(`  📊 Score: ${score}/${maxScore} (${status})\n`);
  }

  /**
   * Phase 2: AI-Native Stack Assessment
   */
  async assessAINativeStack() {
    console.log('🤖 Phase 2: AI-Native Stack Assessment');
    
    const issues = [];
    const recommendations = [];
    let score = 0;
    const maxScore = 30;

    // Environment variables check
    const envFiles = ['.env.local', '.env', '.env.example'];
    let envFound = false;
    
    for (const envFile of envFiles) {
      if (existsSync(envFile)) {
        envFound = true;
        score += 3;
        console.log(`  ✅ Environment file found: ${envFile}`);
        
        const envContent = readFileSync(envFile, 'utf8');
        
        // Check for AI API keys
        if (envContent.includes('AZURE_OPENAI') || envContent.includes('OPENAI_API_KEY')) {
          score += 5;
          console.log(`  ✅ Azure OpenAI configuration found`);
        } else {
          issues.push('Azure OpenAI API key not configured');
          recommendations.push('Add AZURE_OPENAI_API_KEY to environment variables');
        }

        if (envContent.includes('ANTHROPIC') || envContent.includes('CLAUDE')) {
          score += 5;
          console.log(`  ✅ Anthropic Claude configuration found`);
        } else {
          issues.push('Anthropic Claude API key not configured');
          recommendations.push('Add ANTHROPIC_API_KEY to environment variables');
        }

        break;
      }
    }

    if (!envFound) {
      issues.push('No environment configuration files found');
      recommendations.push('Create .env.local file with required API keys');
      console.log(`  ❌ No environment files found`);
    }

    // SKR Framework check
    if (existsSync('skr')) {
      score += 4;
      console.log(`  ✅ SKR framework directory found`);
      
      const skrFiles = ['agent-orchestration.yaml', 'template-library.yaml', 'quality-gates.yaml', 'utilization-metrics.yaml'];
      let skrScore = 0;
      
      for (const file of skrFiles) {
        if (existsSync(join('skr', file))) {
          skrScore += 1;
          console.log(`    ✅ ${file} found`);
        } else {
          issues.push(`SKR file missing: ${file}`);
        }
      }
      
      score += skrScore;
    } else {
      issues.push('SKR framework not found');
      recommendations.push('Initialize SKR framework with agent orchestration files');
      console.log(`  ❌ SKR framework not found`);
    }

    // Agent templates check
    if (existsSync('agents')) {
      score += 3;
      console.log(`  ✅ Agents directory found`);
      
      const agentFiles = ['dash.yaml', 'manong.yaml', 'caca_qa_checklist.yaml', 'scout-dev-env.yaml'];
      let agentScore = 0;
      
      for (const file of agentFiles) {
        if (existsSync(join('agents', file))) {
          agentScore += 1;
          console.log(`    ✅ ${file} found`);
        }
      }
      
      score += Math.min(agentScore, 4);
    } else {
      issues.push('Agents directory not found');
      recommendations.push('Create agents directory with agent templates');
      console.log(`  ❌ Agents directory not found`);
    }

    // MCP Protocol check (look for MCP-related configurations)
    if (existsSync('.pulserrc') || existsSync('pulser')) {
      score += 3;
      console.log(`  ✅ MCP/Pulser configuration found`);
    } else {
      issues.push('MCP protocol configuration not found');
      recommendations.push('Configure MCP protocol for agent communication');
      console.log(`  ❌ MCP protocol configuration not found`);
    }

    const status = this.getStatus(score, maxScore);
    this.results.push({
      category: 'AI-Native Stack',
      score,
      maxScore,
      issues,
      recommendations,
      status
    });

    console.log(`  📊 Score: ${score}/${maxScore} (${status})\n`);
  }

  /**
   * Phase 3: Required Assets Assessment
   */
  async assessRequiredAssets() {
    console.log('📦 Phase 3: Required Assets Assessment');
    
    const issues = [];
    const recommendations = [];
    let score = 0;
    const maxScore = 20;

    // Database configuration check
    if (existsSync('.env.local') || existsSync('.env')) {
      const envFile = existsSync('.env.local') ? '.env.local' : '.env';
      const envContent = readFileSync(envFile, 'utf8');
      
      if (envContent.includes('SUPABASE') || envContent.includes('DATABASE_URL')) {
        score += 5;
        console.log(`  ✅ Database configuration found`);
      } else {
        issues.push('Database configuration not found');
        recommendations.push('Add database connection strings to environment variables');
        console.log(`  ❌ Database configuration not found`);
      }
    }

    // Component library check
    const componentDirs = ['components', 'components/ui', 'components/charts'];
    let componentScore = 0;
    
    for (const dir of componentDirs) {
      if (existsSync(dir)) {
        componentScore += 2;
        console.log(`  ✅ ${dir} directory found`);
      }
    }
    
    score += Math.min(componentScore, 6);

    // API routes check
    if (existsSync('app/api') || existsSync('pages/api')) {
      score += 3;
      console.log(`  ✅ API routes directory found`);
    } else {
      issues.push('API routes directory not found');
      recommendations.push('Create API routes structure');
      console.log(`  ❌ API routes directory not found`);
    }

    // Configuration files check
    const configFiles = ['next.config.js', 'tailwind.config.ts', 'tsconfig.json'];
    let configScore = 0;
    
    for (const file of configFiles) {
      if (existsSync(file)) {
        configScore += 1;
        console.log(`  ✅ ${file} found`);
      } else {
        issues.push(`Configuration file missing: ${file}`);
      }
    }
    
    score += Math.min(configScore, 3);

    // Deployment configuration check
    const deployFiles = ['vercel.json', 'deployment.yaml', '.github/workflows'];
    let deployScore = 0;
    
    for (const file of deployFiles) {
      if (existsSync(file)) {
        deployScore += 1;
        console.log(`  ✅ ${file} found`);
      }
    }
    
    score += Math.min(deployScore, 3);

    const status = this.getStatus(score, maxScore);
    this.results.push({
      category: 'Required Assets',
      score,
      maxScore,
      issues,
      recommendations,
      status
    });

    console.log(`  📊 Score: ${score}/${maxScore} (${status})\n`);
  }

  /**
   * Phase 4: Agent Ecosystem Assessment
   */
  async assessAgentEcosystem() {
    console.log('🤝 Phase 4: Agent Ecosystem Assessment');
    
    const issues = [];
    const recommendations = [];
    let score = 0;
    const maxScore = 25;

    // Agent configuration files check
    const agentFiles = [
      'agents/dash.yaml',
      'agents/manong.yaml',
      'agents/caca_qa_checklist.yaml',
      'agents/scout-dev-env.yaml',
      'agents/keykey.yaml',
      'agents/repo.yaml'
    ];

    let agentScore = 0;
    for (const file of agentFiles) {
      if (existsSync(file)) {
        agentScore += 3;
        console.log(`  ✅ ${file} found`);
      } else {
        issues.push(`Agent configuration missing: ${file}`);
      }
    }
    
    score += Math.min(agentScore, 15);

    // Agent orchestration check
    if (existsSync('lib/agent-orchestrator.ts')) {
      score += 3;
      console.log(`  ✅ Agent orchestrator found`);
    } else {
      issues.push('Agent orchestrator not found');
      recommendations.push('Implement agent orchestration system');
      console.log(`  ❌ Agent orchestrator not found`);
    }

    // Quality gates check
    if (existsSync('skr/quality-gates.yaml')) {
      score += 3;
      console.log(`  ✅ Quality gates configuration found`);
    } else {
      issues.push('Quality gates not configured');
      recommendations.push('Configure quality gates for agent validation');
      console.log(`  ❌ Quality gates not found`);
    }

    // Template library check
    if (existsSync('skr/template-library.yaml')) {
      score += 2;
      console.log(`  ✅ Template library found`);
    } else {
      issues.push('Template library not found');
      recommendations.push('Create template library for reusable patterns');
      console.log(`  ❌ Template library not found`);
    }

    // Utilization metrics check
    if (existsSync('skr/utilization-metrics.yaml')) {
      score += 2;
      console.log(`  ✅ Utilization metrics configuration found`);
    } else {
      issues.push('Utilization metrics not configured');
      recommendations.push('Configure utilization metrics for monitoring');
      console.log(`  ❌ Utilization metrics not found`);
    }

    const status = this.getStatus(score, maxScore);
    this.results.push({
      category: 'Agent Ecosystem',
      score,
      maxScore,
      issues,
      recommendations,
      status
    });

    console.log(`  📊 Score: ${score}/${maxScore} (${status})\n`);
  }

  /**
   * Generate comprehensive assessment report
   */
  generateReport() {
    const totalScore = this.results.reduce((sum, result) => sum + result.score, 0);
    const totalMaxScore = this.results.reduce((sum, result) => sum + result.maxScore, 0);
    const percentage = Math.round((totalScore / totalMaxScore) * 100);
    
    // Collect all critical issues
    this.criticalIssues = this.results
      .filter(result => result.status === 'critical_issues')
      .reduce((acc, result) => acc.concat(result.issues), []);

    // Collect all action items
    this.actionItems = this.results
      .reduce((acc, result) => acc.concat(result.recommendations), []);

    const overallStatus = this.getOverallStatus(percentage);
    
    const assessment = {
      overallScore: totalScore,
      maxScore: totalMaxScore,
      status: overallStatus,
      timestamp: new Date().toISOString(),
      categories: this.results,
      criticalIssues: this.criticalIssues,
      actionItems: this.actionItems,
      nextSteps: this.generateNextSteps(overallStatus)
    };

    // Generate and save report
    this.saveReport(assessment);
    this.displaySummary(assessment);

    return assessment;
  }

  /**
   * Get status based on score percentage
   */
  getStatus(score, maxScore) {
    const percentage = (score / maxScore) * 100;
    
    if (percentage >= 90) return 'excellent';
    if (percentage >= 75) return 'good';
    if (percentage >= 50) return 'needs_improvement';
    return 'critical_issues';
  }

  /**
   * Get overall status
   */
  getOverallStatus(percentage) {
    if (percentage >= 90) return 'Excellent - Ready for Production';
    if (percentage >= 75) return 'Good - Minor Issues to Address';
    if (percentage >= 50) return 'Needs Improvement - Several Issues Found';
    return 'Critical Issues - Immediate Attention Required';
  }

  /**
   * Generate next steps based on assessment
   */
  generateNextSteps(status) {
    const steps = [];
    
    if (status.includes('Critical')) {
      steps.push('Address all critical issues immediately');
      steps.push('Run assessment again after fixes');
      steps.push('Consider pausing development until issues resolved');
    } else if (status.includes('Needs Improvement')) {
      steps.push('Prioritize high-impact recommendations');
      steps.push('Set up missing configurations');
      steps.push('Schedule follow-up assessment in 1 week');
    } else if (status.includes('Good')) {
      steps.push('Address remaining minor issues');
      steps.push('Optimize performance and configurations');
      steps.push('Schedule regular assessments');
    } else {
      steps.push('Maintain current excellent standards');
      steps.push('Monitor for any degradation');
      steps.push('Share best practices with team');
    }
    
    return steps;
  }

  /**
   * Save assessment report to file
   */
  saveReport(assessment) {
    const reportPath = 'reports/scout-dev-env-assessment.json';
    
    // Ensure reports directory exists
    if (!existsSync('reports')) {
      mkdirSync('reports', { recursive: true });
    }
    
    writeFileSync(reportPath, JSON.stringify(assessment, null, 2));
    console.log(`📄 Assessment report saved to: ${reportPath}`);
  }

  /**
   * Display assessment summary
   */
  displaySummary(assessment) {
    const percentage = Math.round((assessment.overallScore / assessment.maxScore) * 100);
    
    console.log('\n' + '='.repeat(60));
    console.log('🔍 SCOUT DEV ENVIRONMENT ASSESSMENT SUMMARY');
    console.log('='.repeat(60));
    console.log(`📊 Overall Score: ${assessment.overallScore}/${assessment.maxScore} (${percentage}%)`);
    console.log(`🎯 Status: ${assessment.status}`);
    console.log(`📅 Assessment Date: ${new Date(assessment.timestamp).toLocaleString()}`);
    
    console.log('\n📋 Category Breakdown:');
    assessment.categories.forEach(category => {
      const categoryPercentage = Math.round((category.score / category.maxScore) * 100);
      const statusIcon = this.getStatusIcon(category.status);
      console.log(`  ${statusIcon} ${category.category}: ${category.score}/${category.maxScore} (${categoryPercentage}%)`);
    });
    
    if (assessment.criticalIssues.length > 0) {
      console.log('\n⚠️  Critical Issues:');
      assessment.criticalIssues.forEach(issue => {
        console.log(`  ❌ ${issue}`);
      });
    }
    
    console.log('\n🚀 Next Steps:');
    assessment.nextSteps.forEach((step, index) => {
      console.log(`  ${index + 1}. ${step}`);
    });
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ Assessment Complete!');
    console.log('='.repeat(60));
  }

  /**
   * Get status icon for display
   */
  getStatusIcon(status) {
    switch (status) {
      case 'excellent': return '🟢';
      case 'good': return '🟡';
      case 'needs_improvement': return '🟠';
      case 'critical_issues': return '🔴';
      default: return '⚪';
    }
  }
}

/**
 * Main execution
 */
async function main() {
  try {
    const assessor = new ScoutDevEnvironmentAssessor();
    const assessment = await assessor.runAssessment();
    
    // Exit with appropriate code based on assessment
    const percentage = Math.round((assessment.overallScore / assessment.maxScore) * 100);
    
    if (percentage >= 75) {
      process.exit(0); // Success
    } else if (percentage >= 50) {
      process.exit(1); // Warning
    } else {
      process.exit(2); // Critical issues
    }
    
  } catch (error) {
    console.error('❌ Assessment failed:', error.message);
    process.exit(3); // Error
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { ScoutDevEnvironmentAssessor };
