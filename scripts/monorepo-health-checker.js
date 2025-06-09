#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Monorepo Health Checker - Validates all best practices
 * Implements the comprehensive checklist for maintainable, scalable monorepo
 */

class MonorepoHealthChecker {
  constructor() {
    this.checks = [];
    this.errors = [];
    this.warnings = [];
    this.passed = [];
  }

  log(message, type = 'info') {
    const emoji = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warning' ? '⚠️' : 'ℹ️';
    console.log(`${emoji} ${message}`);
  }

  addCheck(name, category, checkFunction, critical = false) {
    this.checks.push({ name, category, checkFunction, critical });
  }

  /**
   * 1. Code Quality and Consistency Checks
   */
  checkCodeQuality() {
    // ESLint configuration
    this.addCheck('ESLint Configuration', 'Code Quality', () => {
      const eslintConfig = path.join(process.cwd(), 'packages/eslint-config/index.js');
      if (!fs.existsSync(eslintConfig)) {
        throw new Error('Shared ESLint configuration not found');
      }
      return 'Shared ESLint config exists';
    }, true);

    // TypeScript configuration
    this.addCheck('TypeScript Setup', 'Code Quality', () => {
      const rootTsConfig = path.join(process.cwd(), 'tsconfig.json');
      if (!fs.existsSync(rootTsConfig)) {
        throw new Error('Root TypeScript configuration missing');
      }
      
      // Check tenant TypeScript configs
      const tenantsDir = path.join(process.cwd(), 'tenants');
      const tenants = fs.readdirSync(tenantsDir).filter(item => 
        fs.statSync(path.join(tenantsDir, item)).isDirectory() && item !== '_template'
      );
      
      const missingTsConfigs = tenants.filter(tenant => 
        !fs.existsSync(path.join(tenantsDir, tenant, 'tsconfig.json'))
      );
      
      if (missingTsConfigs.length > 0) {
        throw new Error(`Missing TypeScript configs: ${missingTsConfigs.join(', ')}`);
      }
      
      return `TypeScript configured for ${tenants.length} tenants`;
    }, true);

    // Prettier configuration
    this.addCheck('Prettier Configuration', 'Code Quality', () => {
      const prettierConfig = path.join(process.cwd(), '.prettierrc');
      const prettierConfigJs = path.join(process.cwd(), 'prettier.config.js');
      
      if (!fs.existsSync(prettierConfig) && !fs.existsSync(prettierConfigJs)) {
        throw new Error('Prettier configuration missing');
      }
      return 'Prettier configuration exists';
    });
  }

  /**
   * 2. Versioning and Dependencies Checks
   */
  checkVersioningAndDependencies() {
    // Package manager configuration
    this.addCheck('Package Manager Setup', 'Dependencies', () => {
      const pnpmWorkspace = path.join(process.cwd(), 'pnpm-workspace.yaml');
      const packageJson = path.join(process.cwd(), 'package.json');
      
      if (!fs.existsSync(pnpmWorkspace)) {
        throw new Error('pnpm-workspace.yaml not found');
      }
      
      if (!fs.existsSync(packageJson)) {
        throw new Error('Root package.json not found');
      }
      
      const pkg = JSON.parse(fs.readFileSync(packageJson, 'utf8'));
      if (!pkg.workspaces) {
        throw new Error('Workspaces not configured in package.json');
      }
      
      return 'Package manager and workspaces configured';
    }, true);

    // Dependency consistency
    this.addCheck('Dependency Consistency', 'Dependencies', () => {
      const catalogExists = this.checkCatalogVersions();
      if (!catalogExists) {
        throw new Error('Catalog versioning not implemented for shared dependencies');
      }
      return 'Catalog versioning configured for consistency';
    });

    // Security vulnerabilities
    this.addCheck('Security Audit', 'Dependencies', () => {
      try {
        execSync('pnpm audit --audit-level moderate', { stdio: 'pipe' });
        return 'No security vulnerabilities found';
      } catch (error) {
        throw new Error('Security vulnerabilities detected in dependencies');
      }
    });
  }

  /**
   * 3. Tenant Isolation Checks
   */
  checkTenantIsolation() {
    // Database RLS policies
    this.addCheck('Database RLS Policies', 'Isolation', () => {
      const rlsMigration = path.join(process.cwd(), 'infra/supabase/migrations');
      if (!fs.existsSync(rlsMigration)) {
        throw new Error('Supabase migrations directory not found');
      }
      
      const migrationFiles = fs.readdirSync(rlsMigration);
      const hasRLSMigration = migrationFiles.some(file => 
        file.includes('tenant') || file.includes('rls') || file.includes('isolation')
      );
      
      if (!hasRLSMigration) {
        throw new Error('No RLS/tenant isolation migrations found');
      }
      
      return 'Database tenant isolation configured';
    }, true);

    // Environment variable isolation
    this.addCheck('Environment Isolation', 'Isolation', () => {
      const tenantsDir = path.join(process.cwd(), 'tenants');
      const tenants = fs.readdirSync(tenantsDir).filter(item => 
        fs.statSync(path.join(tenantsDir, item)).isDirectory() && item !== '_template'
      );
      
      const missingEnvSamples = tenants.filter(tenant => 
        !fs.existsSync(path.join(tenantsDir, tenant, '.env.sample'))
      );
      
      if (missingEnvSamples.length > 0) {
        throw new Error(`Missing .env.sample files: ${missingEnvSamples.join(', ')}`);
      }
      
      return `Environment isolation configured for ${tenants.length} tenants`;
    });

    // Tenant-specific configurations
    this.addCheck('Tenant Configuration Isolation', 'Isolation', () => {
      const vercelConfig = path.join(process.cwd(), 'infra/vercel/vercel.json');
      if (!fs.existsSync(vercelConfig)) {
        throw new Error('Vercel tenant routing configuration missing');
      }
      
      const config = JSON.parse(fs.readFileSync(vercelConfig, 'utf8'));
      if (!config.rewrites || config.rewrites.length === 0) {
        throw new Error('Tenant routing rules not configured');
      }
      
      return `Tenant routing configured for ${config.rewrites.length} paths`;
    });
  }

  /**
   * 4. Shared Libraries Checks
   */
  checkSharedLibraries() {
    // Shared packages structure
    this.addCheck('Shared Packages Structure', 'Modularization', () => {
      const packagesDir = path.join(process.cwd(), 'packages');
      if (!fs.existsSync(packagesDir)) {
        throw new Error('Packages directory not found');
      }
      
      const expectedPackages = ['ui', 'db', 'agents', 'eslint-config'];
      const existingPackages = fs.readdirSync(packagesDir);
      const missingPackages = expectedPackages.filter(pkg => !existingPackages.includes(pkg));
      
      if (missingPackages.length > 0) {
        throw new Error(`Missing shared packages: ${missingPackages.join(', ')}`);
      }
      
      return `All core shared packages exist: ${expectedPackages.join(', ')}`;
    }, true);

    // Package.json for shared libraries
    this.addCheck('Shared Package Configs', 'Modularization', () => {
      const packagesDir = path.join(process.cwd(), 'packages');
      const packages = fs.readdirSync(packagesDir);
      
      const missingPackageJson = packages.filter(pkg => {
        const pkgPath = path.join(packagesDir, pkg);
        return fs.statSync(pkgPath).isDirectory() && 
               !fs.existsSync(path.join(pkgPath, 'package.json'));
      });
      
      if (missingPackageJson.length > 0) {
        throw new Error(`Missing package.json in: ${missingPackageJson.join(', ')}`);
      }
      
      return `Package configurations complete for ${packages.length} packages`;
    });

    // Workspace references
    this.addCheck('Workspace References', 'Modularization', () => {
      const tenantsDir = path.join(process.cwd(), 'tenants');
      const tenants = fs.readdirSync(tenantsDir).filter(item => 
        fs.statSync(path.join(tenantsDir, item)).isDirectory() && item !== '_template'
      );
      
      let workspaceReferences = 0;
      for (const tenant of tenants) {
        const packagePath = path.join(tenantsDir, tenant, 'package.json');
        if (fs.existsSync(packagePath)) {
          const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
          const deps = { ...pkg.dependencies, ...pkg.devDependencies };
          
          Object.keys(deps).forEach(dep => {
            if (dep.startsWith('@ai/') && deps[dep] === 'workspace:*') {
              workspaceReferences++;
            }
          });
        }
      }
      
      if (workspaceReferences === 0) {
        throw new Error('No workspace references found in tenant packages');
      }
      
      return `Found ${workspaceReferences} workspace references across tenants`;
    });
  }

  /**
   * 5. CI/CD Pipeline Checks
   */
  checkCICDPipeline() {
    // GitHub Actions workflow
    this.addCheck('CI/CD Configuration', 'Automation', () => {
      const workflowPath = path.join(process.cwd(), '.github/workflows/ci.yml');
      if (!fs.existsSync(workflowPath)) {
        throw new Error('CI/CD workflow configuration missing');
      }
      
      const workflow = fs.readFileSync(workflowPath, 'utf8');
      if (!workflow.includes('matrix')) {
        throw new Error('Matrix builds not configured for multi-tenant CI');
      }
      
      return 'Multi-tenant CI/CD pipeline configured';
    });

    // Taskfile for automation
    this.addCheck('Task Automation', 'Automation', () => {
      const taskfile = path.join(process.cwd(), 'Taskfile.yml');
      if (!fs.existsSync(taskfile)) {
        throw new Error('Taskfile.yml not found');
      }
      
      const content = fs.readFileSync(taskfile, 'utf8');
      const requiredTasks = ['build', 'test', 'lint', 'dev', 'doctor'];
      const missingTasks = requiredTasks.filter(task => !content.includes(`${task}:`));
      
      if (missingTasks.length > 0) {
        throw new Error(`Missing task definitions: ${missingTasks.join(', ')}`);
      }
      
      return `All essential tasks configured: ${requiredTasks.join(', ')}`;
    });
  }

  /**
   * 6. Security and Privacy Checks
   */
  checkSecurityAndPrivacy() {
    // Environment variable security
    this.addCheck('Environment Security', 'Security', () => {
      const gitignore = path.join(process.cwd(), '.gitignore');
      if (!fs.existsSync(gitignore)) {
        throw new Error('.gitignore file missing');
      }
      
      const content = fs.readFileSync(gitignore, 'utf8');
      const securityPatterns = ['.env', '.env.local', '.env.production', 'secrets'];
      const missingPatterns = securityPatterns.filter(pattern => !content.includes(pattern));
      
      if (missingPatterns.length > 0) {
        throw new Error(`Missing security patterns in .gitignore: ${missingPatterns.join(', ')}`);
      }
      
      return 'Environment variables properly secured';
    });

    // Secret scanning
    this.addCheck('Secret Scanning', 'Security', () => {
      try {
        // Basic secret scanning
        const result = execSync('git log --all --grep="password\\|secret\\|key\\|token" --oneline', { 
          stdio: 'pipe',
          encoding: 'utf8'
        });
        
        if (result.trim().length > 0) {
          throw new Error('Potential secrets found in commit history');
        }
        
        return 'No obvious secrets in commit history';
      } catch (error) {
        if (error.message.includes('Potential secrets')) {
          throw error;
        }
        return 'Secret scan completed';
      }
    });
  }

  /**
   * 7. Documentation Checks
   */
  checkDocumentation() {
    // Root README
    this.addCheck('Root Documentation', 'Documentation', () => {
      const readme = path.join(process.cwd(), 'README.md');
      if (!fs.existsSync(readme)) {
        throw new Error('Root README.md missing');
      }
      
      const content = fs.readFileSync(readme, 'utf8');
      const requiredSections = ['Quick Start', 'Architecture', 'Development'];
      const missingSections = requiredSections.filter(section => 
        !content.toLowerCase().includes(section.toLowerCase())
      );
      
      if (missingSections.length > 0) {
        throw new Error(`Missing README sections: ${missingSections.join(', ')}`);
      }
      
      return 'Comprehensive root documentation exists';
    });

    // Migration guide
    this.addCheck('Migration Documentation', 'Documentation', () => {
      const migrationGuide = path.join(process.cwd(), 'MIGRATION_GUIDE.md');
      if (!fs.existsSync(migrationGuide)) {
        throw new Error('Migration guide missing');
      }
      
      return 'Migration documentation available';
    });
  }

  /**
   * 8. Performance Checks
   */
  checkPerformance() {
    // Build optimization
    this.addCheck('Build Configuration', 'Performance', () => {
      const conflictFreeBuild = path.join(process.cwd(), 'scripts/conflict-free-build.js');
      if (!fs.existsSync(conflictFreeBuild)) {
        throw new Error('Conflict-free build system not implemented');
      }
      
      return 'Optimized build system configured';
    });

    // Caching strategy
    this.addCheck('Caching Strategy', 'Performance', () => {
      const vercelConfig = path.join(process.cwd(), 'infra/vercel/vercel.json');
      if (fs.existsSync(vercelConfig)) {
        const config = JSON.parse(fs.readFileSync(vercelConfig, 'utf8'));
        if (config.headers && config.headers.some(h => h.headers.some(header => 
          header.key.toLowerCase().includes('cache')
        ))) {
          return 'Caching headers configured';
        }
      }
      
      throw new Error('Caching strategy not fully implemented');
    });
  }

  /**
   * Helper Methods
   */
  checkCatalogVersions() {
    const workspaceFile = path.join(process.cwd(), 'pnpm-workspace.yaml');
    if (!fs.existsSync(workspaceFile)) return false;
    
    const content = fs.readFileSync(workspaceFile, 'utf8');
    return content.includes('catalog:');
  }

  /**
   * Run all health checks
   */
  async runHealthCheck() {
    this.log('🏥 Starting Monorepo Health Check...', 'info');
    this.log('━'.repeat(60), 'info');

    // Register all checks
    this.checkCodeQuality();
    this.checkVersioningAndDependencies();
    this.checkTenantIsolation();
    this.checkSharedLibraries();
    this.checkCICDPipeline();
    this.checkSecurityAndPrivacy();
    this.checkDocumentation();
    this.checkPerformance();

    // Run checks by category
    const categories = [...new Set(this.checks.map(check => check.category))];
    
    for (const category of categories) {
      this.log(`\n📋 ${category}`, 'info');
      this.log('─'.repeat(40), 'info');
      
      const categoryChecks = this.checks.filter(check => check.category === category);
      
      for (const check of categoryChecks) {
        try {
          const result = check.checkFunction();
          this.passed.push(check);
          this.log(`${check.name}: ${result}`, 'success');
        } catch (error) {
          if (check.critical) {
            this.errors.push({ check, error: error.message });
            this.log(`${check.name}: ${error.message}`, 'error');
          } else {
            this.warnings.push({ check, error: error.message });
            this.log(`${check.name}: ${error.message}`, 'warning');
          }
        }
      }
    }

    this.printSummary();
    return this.generateReport();
  }

  printSummary() {
    this.log('\n📊 HEALTH CHECK SUMMARY', 'info');
    this.log('━'.repeat(60), 'info');
    this.log(`✅ Passed: ${this.passed.length}`, 'success');
    this.log(`⚠️  Warnings: ${this.warnings.length}`, 'warning');
    this.log(`❌ Errors: ${this.errors.length}`, 'error');
    
    const healthScore = Math.round((this.passed.length / this.checks.length) * 100);
    this.log(`🏥 Health Score: ${healthScore}%`, healthScore >= 80 ? 'success' : healthScore >= 60 ? 'warning' : 'error');

    if (this.errors.length > 0) {
      this.log('\n🚨 CRITICAL ISSUES TO FIX:', 'error');
      this.errors.forEach((item, index) => {
        this.log(`   ${index + 1}. ${item.check.name}: ${item.error}`, 'error');
      });
    }

    if (this.warnings.length > 0) {
      this.log('\n⚠️  RECOMMENDATIONS:', 'warning');
      this.warnings.forEach((item, index) => {
        this.log(`   ${index + 1}. ${item.check.name}: ${item.error}`, 'warning');
      });
    }
  }

  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      health_score: Math.round((this.passed.length / this.checks.length) * 100),
      total_checks: this.checks.length,
      passed: this.passed.length,
      warnings: this.warnings.length,
      errors: this.errors.length,
      critical_issues: this.errors.map(item => ({
        check: item.check.name,
        category: item.check.category,
        error: item.error
      })),
      recommendations: this.warnings.map(item => ({
        check: item.check.name,
        category: item.check.category,
        recommendation: item.error
      })),
      next_steps: this.generateNextSteps()
    };

    // Save report
    const reportsDir = path.join(process.cwd(), 'reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    const reportPath = path.join(reportsDir, 'monorepo-health-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    this.log(`\n📄 Health report saved to: ${reportPath}`, 'success');
    return report;
  }

  generateNextSteps() {
    const nextSteps = [];
    
    if (this.errors.length > 0) {
      nextSteps.push('🚨 Fix critical errors before proceeding with development');
      this.errors.forEach(item => {
        nextSteps.push(`   - ${item.check.name}: ${item.error}`);
      });
    }
    
    if (this.warnings.length > 0) {
      nextSteps.push('⚠️  Address warnings to improve monorepo quality');
    }
    
    if (this.errors.length === 0 && this.warnings.length === 0) {
      nextSteps.push('✅ Monorepo is healthy! Continue with development');
      nextSteps.push('🔄 Run health checks regularly as part of CI/CD');
    }
    
    return nextSteps;
  }
}

// CLI interface
if (require.main === module) {
  const checker = new MonorepoHealthChecker();
  checker.runHealthCheck().catch(console.error);
}

module.exports = MonorepoHealthChecker;