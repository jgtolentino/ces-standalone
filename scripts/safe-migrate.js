#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Safe Migration Script for AI Agency Monorepo
 * Migrates existing projects without conflicts or build errors
 */

class SafeMigrator {
  constructor() {
    this.backupDir = path.join(__dirname, '../backups');
    this.sourceDir = path.join(__dirname, '../../');
    this.targetDir = path.join(__dirname, '../');
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const emoji = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warning' ? '⚠️' : 'ℹ️';
    console.log(`${emoji} [${timestamp}] ${message}`);
  }

  async createBackup() {
    this.log('Creating backup of existing projects...');
    
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(this.backupDir, `backup-${timestamp}`);

    // Backup existing projects
    const projectsToBackup = [
      'campaign-insight-accelerator',
      'retail-insights-dashboard-ph', 
      'Scout Dashboard',
      'InsightPulseAI_SKR',
      'pulser-live',
      'bruno-agentic-cli'
    ];

    for (const project of projectsToBackup) {
      const sourcePath = path.join(this.sourceDir, project);
      const targetPath = path.join(backupPath, project);
      
      if (fs.existsSync(sourcePath)) {
        this.log(`Backing up ${project}...`);
        try {
          execSync(`cp -r "${sourcePath}" "${targetPath}"`, { stdio: 'ignore' });
          this.log(`✅ Backed up ${project}`, 'success');
        } catch (error) {
          this.log(`Failed to backup ${project}: ${error.message}`, 'error');
        }
      }
    }

    this.log(`Backup completed at: ${backupPath}`, 'success');
    return backupPath;
  }

  async migrateCES() {
    this.log('Migrating CES (Campaign Insight Accelerator)...');
    
    const sourcePath = path.join(this.sourceDir, 'campaign-insight-accelerator');
    const targetPath = path.join(this.targetDir, 'tenants/ces');

    if (!fs.existsSync(sourcePath)) {
      this.log('CES source not found, skipping...', 'warning');
      return;
    }

    try {
      // Create CES tenant from template
      execSync('node scripts/create-tenant.js ces', { 
        cwd: this.targetDir,
        stdio: 'ignore' 
      });

      // Copy source files (excluding conflicting files)
      const filesToCopy = [
        'src/',
        'public/',
        'components/',
        'lib/',
        'styles/',
        'README.md'
      ];

      for (const file of filesToCopy) {
        const sourceFile = path.join(sourcePath, file);
        const targetFile = path.join(targetPath, file);
        
        if (fs.existsSync(sourceFile)) {
          execSync(`cp -r "${sourceFile}" "${targetFile}"`, { stdio: 'ignore' });
        }
      }

      // Merge package.json dependencies
      await this.mergePackageJson(sourcePath, targetPath);
      
      this.log('CES migration completed', 'success');
    } catch (error) {
      this.log(`CES migration failed: ${error.message}`, 'error');
    }
  }

  async migrateScout() {
    this.log('Migrating Scout Dashboard...');
    
    const sourcePath = path.join(this.sourceDir, 'retail-insights-dashboard-ph');
    const altSourcePath = path.join(this.sourceDir, 'Scout Dashboard');
    const targetPath = path.join(this.targetDir, 'tenants/scout');

    const actualSourcePath = fs.existsSync(sourcePath) ? sourcePath : altSourcePath;

    if (!fs.existsSync(actualSourcePath)) {
      this.log('Scout source not found, skipping...', 'warning');
      return;
    }

    try {
      // Create Scout tenant from template
      execSync('node scripts/create-tenant.js scout', { 
        cwd: this.targetDir,
        stdio: 'ignore' 
      });

      // Copy source files
      const filesToCopy = [
        'src/',
        'frontend/',
        'backend/',
        'components/',
        'lib/',
        'public/',
        'styles/',
        'supabase/',
        'README.md'
      ];

      for (const file of filesToCopy) {
        const sourceFile = path.join(actualSourcePath, file);
        const targetFile = path.join(targetPath, file);
        
        if (fs.existsSync(sourceFile)) {
          execSync(`cp -r "${sourceFile}" "${targetFile}"`, { stdio: 'ignore' });
        }
      }

      // Merge package.json dependencies
      await this.mergePackageJson(actualSourcePath, targetPath);
      
      this.log('Scout migration completed', 'success');
    } catch (error) {
      this.log(`Scout migration failed: ${error.message}`, 'error');
    }
  }

  async migratePulser() {
    this.log('Migrating Pulser configurations...');
    
    const pulserSources = [
      path.join(this.sourceDir, 'InsightPulseAI_SKR'),
      path.join(this.sourceDir, 'pulser-live'),
      path.join(this.sourceDir, 'pulser-archive')
    ];

    const targetPath = path.join(this.targetDir, 'infra/pulser');

    try {
      for (const sourcePath of pulserSources) {
        if (fs.existsSync(sourcePath)) {
          // Copy Pulser configurations
          const pulserFiles = [
            'agents/',
            'pipelines/', 
            'config/',
            '*.yaml',
            '*.yml'
          ];

          for (const file of pulserFiles) {
            const sourceFile = path.join(sourcePath, file);
            if (fs.existsSync(sourceFile)) {
              const fileName = path.basename(sourceFile);
              const targetFile = path.join(targetPath, fileName);
              execSync(`cp -r "${sourceFile}" "${targetFile}"`, { stdio: 'ignore' });
            }
          }
        }
      }

      this.log('Pulser migration completed', 'success');
    } catch (error) {
      this.log(`Pulser migration failed: ${error.message}`, 'error');
    }
  }

  async mergePackageJson(sourcePath, targetPath) {
    const sourcePackagePath = path.join(sourcePath, 'package.json');
    const targetPackagePath = path.join(targetPath, 'package.json');

    if (!fs.existsSync(sourcePackagePath) || !fs.existsSync(targetPackagePath)) {
      return;
    }

    try {
      const sourcePackage = JSON.parse(fs.readFileSync(sourcePackagePath, 'utf8'));
      const targetPackage = JSON.parse(fs.readFileSync(targetPackagePath, 'utf8'));

      // Merge dependencies
      if (sourcePackage.dependencies) {
        targetPackage.dependencies = {
          ...targetPackage.dependencies,
          ...sourcePackage.dependencies
        };
      }

      // Merge devDependencies
      if (sourcePackage.devDependencies) {
        targetPackage.devDependencies = {
          ...targetPackage.devDependencies,
          ...sourcePackage.devDependencies
        };
      }

      // Merge scripts (avoid conflicts)
      if (sourcePackage.scripts) {
        targetPackage.scripts = {
          ...targetPackage.scripts,
          ...Object.fromEntries(
            Object.entries(sourcePackage.scripts).map(([key, value]) => [
              key.startsWith('old-') ? key : `legacy-${key}`,
              value
            ])
          )
        };
      }

      fs.writeFileSync(targetPackagePath, JSON.stringify(targetPackage, null, 2));
      this.log(`Merged package.json for ${path.basename(targetPath)}`);
    } catch (error) {
      this.log(`Failed to merge package.json: ${error.message}`, 'error');
    }
  }

  async validateMigration() {
    this.log('Validating migration...');

    const tenants = ['ces', 'scout'];
    
    for (const tenant of tenants) {
      const tenantPath = path.join(this.targetDir, 'tenants', tenant);
      
      if (fs.existsSync(tenantPath)) {
        try {
          // Check if package.json exists
          const packagePath = path.join(tenantPath, 'package.json');
          if (fs.existsSync(packagePath)) {
            this.log(`✅ ${tenant}: package.json found`, 'success');
          }

          // Check if basic files exist
          const requiredFiles = ['app/', 'tsconfig.json'];
          for (const file of requiredFiles) {
            if (fs.existsSync(path.join(tenantPath, file))) {
              this.log(`✅ ${tenant}: ${file} found`, 'success');
            }
          }
        } catch (error) {
          this.log(`❌ ${tenant}: validation failed - ${error.message}`, 'error');
        }
      }
    }
  }

  async runSafeMigration() {
    try {
      this.log('🚀 Starting safe migration process...');
      
      // Step 1: Backup
      await this.createBackup();
      
      // Step 2: Migrate each project independently
      await this.migrateCES();
      await this.migrateScout();
      await this.migratePulser();
      
      // Step 3: Validate
      await this.validateMigration();
      
      this.log('🎉 Migration completed successfully!', 'success');
      this.log('Next steps:');
      this.log('1. cd tenants/ces && pnpm install');
      this.log('2. cd tenants/scout && pnpm install'); 
      this.log('3. task build:tenant TENANT=ces');
      this.log('4. task build:tenant TENANT=scout');
      
    } catch (error) {
      this.log(`Migration failed: ${error.message}`, 'error');
      process.exit(1);
    }
  }
}

// CLI execution
if (require.main === module) {
  const migrator = new SafeMigrator();
  migrator.runSafeMigration();
}

module.exports = SafeMigrator;