#!/usr/bin/env node
/**
 * Deployment Verification System
 * Prevents deployment of tenants with mock data, missing configs, or build errors
 * 
 * Usage: node scripts/deployment-verification.js <tenant>
 * Example: node scripts/deployment-verification.js ces
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class DeploymentVerifier {
  constructor(tenant) {
    this.tenant = tenant;
    this.tenantPath = path.join(__dirname, '..', 'tenants', tenant);
    this.errors = [];
    this.warnings = [];
  }

  async verify() {
    console.log(`🔍 Verifying deployment for tenant: ${this.tenant}`);
    console.log('=' + '='.repeat(50));

    // Run all verification checks
    this.checkTenantExists();
    this.checkForMockData();
    this.checkDatabaseConfiguration();
    this.checkEnvironmentVariables();
    this.checkBuildProcess();
    this.checkRequiredFiles();
    this.checkApiEndpoints();

    // Report results
    this.generateReport();
    return this.errors.length === 0;
  }

  checkTenantExists() {
    console.log('📁 Checking tenant exists...');
    
    if (!fs.existsSync(this.tenantPath)) {
      this.errors.push(`Tenant directory not found: ${this.tenantPath}`);
      return;
    }

    const packageJsonPath = path.join(this.tenantPath, 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
      this.errors.push(`package.json not found in ${this.tenant}`);
    } else {
      console.log('  ✅ Tenant directory and package.json exist');
    }
  }

  checkForMockData() {
    console.log('🚨 Checking for mock data...');
    
    const mockDataPatterns = [
      'mockCampaigns',
      'mockMetrics', 
      'mockData',
      'hardcoded',
      'TODO',
      'FIXME',
      '// Mock',
      '/* Mock'
    ];

    const filePatterns = ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'];
    let foundMockData = false;

    for (const pattern of filePatterns) {
      try {
        const files = this.findFiles(this.tenantPath, pattern);
        
        for (const file of files) {
          const content = fs.readFileSync(file, 'utf8');
          
          for (const mockPattern of mockDataPatterns) {
            if (content.includes(mockPattern)) {
              this.errors.push(`Mock data found in ${file}: contains "${mockPattern}"`);
              foundMockData = true;
            }
          }

          // Check for comments indicating mock data
          const mockComments = content.match(/\/\/.*mock.*|\/\*.*mock.*\*\//gi);
          if (mockComments) {
            this.errors.push(`Mock data comments found in ${file}: ${mockComments.join(', ')}`);
            foundMockData = true;
          }
        }
      } catch (error) {
        this.warnings.push(`Could not check files with pattern ${pattern}: ${error.message}`);
      }
    }

    if (!foundMockData) {
      console.log('  ✅ No mock data found');
    }
  }

  checkDatabaseConfiguration() {
    console.log('🛢️ Checking database configuration...');

    const dbConfigChecks = {
      ces: () => {
        // CES should use Azure PostgreSQL
        if (!process.env.CES_AZURE_POSTGRES_URL) {
          this.errors.push('CES_AZURE_POSTGRES_URL environment variable required for CES tenant');
          return false;
        }
        return true;
      },
      'retail-insights': () => {
        // Retail insights should use Supabase
        if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
          this.errors.push('SUPABASE_URL and SUPABASE_ANON_KEY required for retail-insights tenant');
          return false;
        }
        return true;
      },
      scout: () => {
        if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
          this.errors.push('SUPABASE_URL and SUPABASE_ANON_KEY required for scout tenant');
          return false;
        }
        return true;
      },
      'tbwa-chat': () => {
        if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
          this.errors.push('SUPABASE_URL and SUPABASE_ANON_KEY required for tbwa-chat tenant');
          return false;
        }
        return true;
      }
    };

    const checker = dbConfigChecks[this.tenant];
    if (checker) {
      if (checker()) {
        console.log('  ✅ Database configuration valid');
      }
    } else {
      this.warnings.push(`No database configuration checker defined for tenant: ${this.tenant}`);
    }
  }

  checkEnvironmentVariables() {
    console.log('🔧 Checking environment variables...');

    const requiredEnvVars = [
      'AZURE_OPENAI_API_KEY',
      'AZURE_OPENAI_ENDPOINT',
      'AZURE_OPENAI_DEPLOYMENT_NAME'
    ];

    let missing = [];
    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        missing.push(envVar);
      }
    }

    if (missing.length > 0) {
      this.errors.push(`Missing required environment variables: ${missing.join(', ')}`);
    } else {
      console.log('  ✅ Required environment variables present');
    }
  }

  checkBuildProcess() {
    console.log('🔨 Checking build process...');

    try {
      const originalDir = process.cwd();
      process.chdir(this.tenantPath);

      // Check if package.json has build script
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      if (!packageJson.scripts || !packageJson.scripts.build) {
        this.warnings.push('No build script found in package.json');
        return;
      }

      // Try to run build
      execSync('npm run build', { stdio: 'pipe' });
      console.log('  ✅ Build process successful');

      process.chdir(originalDir);
    } catch (error) {
      this.errors.push(`Build failed: ${error.message}`);
      process.chdir(process.cwd());
    }
  }

  checkRequiredFiles() {
    console.log('📄 Checking required files...');

    const requiredFiles = [
      'app/layout.tsx',
      'app/page.tsx'
    ];

    let missingFiles = [];
    for (const file of requiredFiles) {
      const filePath = path.join(this.tenantPath, file);
      if (!fs.existsSync(filePath)) {
        missingFiles.push(file);
      }
    }

    if (missingFiles.length > 0) {
      this.errors.push(`Missing required files: ${missingFiles.join(', ')}`);
    } else {
      console.log('  ✅ Required files present');
    }
  }

  checkApiEndpoints() {
    console.log('🌐 Checking API endpoints...');

    const apiPath = path.join(this.tenantPath, 'app', 'api');
    
    if (!fs.existsSync(apiPath)) {
      this.warnings.push('No API directory found - tenant may not have backend functionality');
      return;
    }

    const apiFiles = this.findFiles(apiPath, '**/*.ts');
    
    if (apiFiles.length === 0) {
      this.warnings.push('No API route files found');
    } else {
      console.log(`  ✅ Found ${apiFiles.length} API endpoint(s)`);
      
      // Check each API file for proper structure
      for (const file of apiFiles) {
        const content = fs.readFileSync(file, 'utf8');
        
        // Check for proper Next.js API route exports
        if (!content.includes('export async function') && !content.includes('export default')) {
          this.warnings.push(`API file may have invalid structure: ${file}`);
        }
        
        // Check for database calls instead of mock data
        if (content.includes('executeQuery') || content.includes('supabase') || content.includes('prisma')) {
          // Good - using real database
        } else if (content.includes('mock') || content.includes('hardcoded')) {
          this.errors.push(`API endpoint still using mock data: ${file}`);
        }
      }
    }
  }

  findFiles(directory, pattern) {
    // Simple file finder - in production would use glob
    const files = [];
    
    function walkDir(dir) {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          walkDir(fullPath);
        } else if (stat.isFile()) {
          // Simple pattern matching
          if (pattern.includes('*.ts') && item.endsWith('.ts')) {
            files.push(fullPath);
          } else if (pattern.includes('*.tsx') && item.endsWith('.tsx')) {
            files.push(fullPath);
          } else if (pattern.includes('*.js') && item.endsWith('.js')) {
            files.push(fullPath);
          } else if (pattern.includes('*.jsx') && item.endsWith('.jsx')) {
            files.push(fullPath);
          }
        }
      }
    }
    
    walkDir(directory);
    return files;
  }

  generateReport() {
    console.log('\n📊 DEPLOYMENT VERIFICATION REPORT');
    console.log('=' + '='.repeat(50));
    
    if (this.errors.length === 0 && this.warnings.length === 0) {
      console.log('🎉 ✅ DEPLOYMENT APPROVED - No issues found');
      console.log(`   Tenant ${this.tenant} is ready for production deployment`);
      return;
    }

    if (this.errors.length > 0) {
      console.log(`❌ DEPLOYMENT BLOCKED - ${this.errors.length} error(s) found:`);
      this.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`);
      });
    }

    if (this.warnings.length > 0) {
      console.log(`\n⚠️  ${this.warnings.length} warning(s):`);
      this.warnings.forEach((warning, index) => {
        console.log(`   ${index + 1}. ${warning}`);
      });
    }

    if (this.errors.length > 0) {
      console.log('\n🚫 DEPLOYMENT REJECTED');
      console.log('   Fix all errors before attempting deployment');
    } else {
      console.log('\n⚠️  DEPLOYMENT APPROVED WITH WARNINGS');
      console.log('   Consider addressing warnings for optimal deployment');
    }
  }
}

// CLI execution
async function main() {
  const tenant = process.argv[2];
  
  if (!tenant) {
    console.error('Usage: node deployment-verification.js <tenant>');
    console.error('Example: node deployment-verification.js ces');
    process.exit(1);
  }

  const verifier = new DeploymentVerifier(tenant);
  const isValid = await verifier.verify();
  
  process.exit(isValid ? 0 : 1);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { DeploymentVerifier };