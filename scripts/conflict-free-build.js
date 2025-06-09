#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Conflict-Free Build System
 * Ensures no port conflicts, dependency conflicts, or build hijacking
 */

class ConflictFreeBuild {
  constructor() {
    this.usedPorts = new Set();
    this.basePorts = {
      ces: 3001,
      scout: 3002,
      acme: 3003,
      template: 3000
    };
    this.buildLocks = new Map();
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const emoji = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warning' ? '⚠️' : 'ℹ️';
    console.log(`${emoji} [${timestamp}] ${message}`);
  }

  findAvailablePort(preferredPort) {
    let port = preferredPort;
    while (this.usedPorts.has(port) || this.isPortInUse(port)) {
      port++;
    }
    this.usedPorts.add(port);
    return port;
  }

  isPortInUse(port) {
    try {
      execSync(`lsof -ti:${port}`, { stdio: 'ignore' });
      return true;
    } catch {
      return false;
    }
  }

  async acquireBuildLock(tenant) {
    const lockFile = path.join(__dirname, `../temp/build-${tenant}.lock`);
    
    if (fs.existsSync(lockFile)) {
      const lockTime = fs.statSync(lockFile).mtime;
      const now = new Date();
      const lockAge = (now - lockTime) / 1000;
      
      // If lock is older than 10 minutes, consider it stale
      if (lockAge > 600) {
        fs.unlinkSync(lockFile);
        this.log(`Removed stale lock for ${tenant}`, 'warning');
      } else {
        throw new Error(`Build already in progress for ${tenant}`);
      }
    }

    // Create temp directory if it doesn't exist
    const tempDir = path.dirname(lockFile);
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Create lock file
    fs.writeFileSync(lockFile, JSON.stringify({
      tenant,
      pid: process.pid,
      startTime: new Date().toISOString()
    }));

    this.buildLocks.set(tenant, lockFile);
    this.log(`Acquired build lock for ${tenant}`);
  }

  releaseBuildLock(tenant) {
    const lockFile = this.buildLocks.get(tenant);
    if (lockFile && fs.existsSync(lockFile)) {
      fs.unlinkSync(lockFile);
      this.buildLocks.delete(tenant);
      this.log(`Released build lock for ${tenant}`);
    }
  }

  async checkDependencyConflicts(tenant) {
    const tenantPath = path.join(__dirname, '../tenants', tenant);
    const packagePath = path.join(tenantPath, 'package.json');

    if (!fs.existsSync(packagePath)) {
      throw new Error(`package.json not found for tenant ${tenant}`);
    }

    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    const conflicts = [];

    // Check for known conflicting dependencies
    const conflictingDeps = [
      { name: 'react', versions: ['16.x', '17.x'] },
      { name: 'next', versions: ['12.x', '13.x'] },
      { name: 'typescript', versions: ['4.x'] }
    ];

    for (const dep of conflictingDeps) {
      const deps = packageJson.dependencies || {};
      const devDeps = packageJson.devDependencies || {};
      
      if (deps[dep.name] || devDeps[dep.name]) {
        const version = deps[dep.name] || devDeps[dep.name];
        if (dep.versions.some(v => version.includes(v.split('.')[0]))) {
          conflicts.push(`${dep.name}@${version} may conflict with workspace catalog`);
        }
      }
    }

    if (conflicts.length > 0) {
      this.log(`Dependency conflicts found for ${tenant}:`, 'warning');
      conflicts.forEach(conflict => this.log(`  - ${conflict}`, 'warning'));
    }

    return conflicts;
  }

  async buildTenantSafely(tenant) {
    try {
      this.log(`Starting safe build for tenant: ${tenant}`);
      
      // Step 1: Acquire build lock
      await this.acquireBuildLock(tenant);
      
      // Step 2: Check for dependency conflicts
      const conflicts = await this.checkDependencyConflicts(tenant);
      if (conflicts.length > 0) {
        this.log('Attempting to resolve dependency conflicts...', 'warning');
        await this.resolveDependencyConflicts(tenant, conflicts);
      }
      
      // Step 3: Clean previous build
      const tenantPath = path.join(__dirname, '../tenants', tenant);
      const cleanDirs = ['.next', 'dist', 'build', 'node_modules/.cache'];
      
      for (const dir of cleanDirs) {
        const fullPath = path.join(tenantPath, dir);
        if (fs.existsSync(fullPath)) {
          execSync(`rm -rf "${fullPath}"`, { stdio: 'ignore' });
        }
      }
      
      // Step 4: Install dependencies in isolation
      this.log(`Installing dependencies for ${tenant}...`);
      execSync('pnpm install --frozen-lockfile', {
        cwd: tenantPath,
        stdio: 'pipe'
      });
      
      // Step 5: Build with isolated environment
      const buildEnv = {
        ...process.env,
        NODE_ENV: 'production',
        TENANT_SLUG: tenant,
        PORT: this.findAvailablePort(this.basePorts[tenant] || 3000),
        BUILD_ID: `${tenant}-${Date.now()}`
      };

      this.log(`Building ${tenant} on port ${buildEnv.PORT}...`);
      execSync('pnpm build', {
        cwd: tenantPath,
        env: buildEnv,
        stdio: 'pipe'
      });
      
      this.log(`✅ Build completed successfully for ${tenant}`, 'success');
      
    } catch (error) {
      this.log(`❌ Build failed for ${tenant}: ${error.message}`, 'error');
      throw error;
    } finally {
      this.releaseBuildLock(tenant);
    }
  }

  async resolveDependencyConflicts(tenant, conflicts) {
    const tenantPath = path.join(__dirname, '../tenants', tenant);
    const packagePath = path.join(tenantPath, 'package.json');
    
    // Create backup
    const backupPath = `${packagePath}.backup.${Date.now()}`;
    execSync(`cp "${packagePath}" "${backupPath}"`);
    
    try {
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      
      // Update conflicting dependencies to use catalog versions
      const catalogDeps = {
        'react': 'catalog:',
        'react-dom': 'catalog:',
        'next': 'catalog:',
        'typescript': 'catalog:',
        '@types/react': 'catalog:',
        '@types/react-dom': 'catalog:',
        '@types/node': 'catalog:'
      };

      // Update dependencies
      if (packageJson.dependencies) {
        for (const [dep, version] of Object.entries(catalogDeps)) {
          if (packageJson.dependencies[dep]) {
            packageJson.dependencies[dep] = version;
          }
        }
      }

      // Update devDependencies
      if (packageJson.devDependencies) {
        for (const [dep, version] of Object.entries(catalogDeps)) {
          if (packageJson.devDependencies[dep]) {
            packageJson.devDependencies[dep] = version;
          }
        }
      }

      // Write updated package.json
      fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
      this.log(`Updated package.json for ${tenant} to resolve conflicts`);
      
    } catch (error) {
      // Restore backup on error
      execSync(`cp "${backupPath}" "${packagePath}"`);
      throw error;
    }
  }

  async buildAllTenantsSafely() {
    const tenantsDir = path.join(__dirname, '../tenants');
    const tenants = fs.readdirSync(tenantsDir)
      .filter(item => {
        const itemPath = path.join(tenantsDir, item);
        return fs.statSync(itemPath).isDirectory() && 
               item !== '_template' &&
               fs.existsSync(path.join(itemPath, 'package.json'));
      });

    this.log(`Found ${tenants.length} tenants to build: ${tenants.join(', ')}`);

    // Build tenants sequentially to avoid conflicts
    for (const tenant of tenants) {
      try {
        await this.buildTenantSafely(tenant);
        
        // Wait a bit between builds to avoid resource conflicts
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        this.log(`Skipping ${tenant} due to build failure`, 'warning');
        continue;
      }
    }

    this.log(`🎉 All tenant builds completed!`, 'success');
  }

  async startDevSafely(tenant) {
    try {
      const port = this.findAvailablePort(this.basePorts[tenant] || 3000);
      const tenantPath = path.join(__dirname, '../tenants', tenant);

      this.log(`Starting ${tenant} development server on port ${port}...`);

      const devEnv = {
        ...process.env,
        PORT: port,
        TENANT_SLUG: tenant,
        NODE_ENV: 'development'
      };

      // Start dev server in background
      const child = execSync(`pnpm dev --port ${port}`, {
        cwd: tenantPath,
        env: devEnv,
        stdio: 'inherit',
        detached: true
      });

      this.log(`✅ ${tenant} started on http://localhost:${port}`, 'success');
      
    } catch (error) {
      this.log(`Failed to start ${tenant}: ${error.message}`, 'error');
    }
  }
}

// CLI handling
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const tenant = args[1];

  const builder = new ConflictFreeBuild();

  try {
    switch (command) {
      case 'build':
        if (tenant) {
          await builder.buildTenantSafely(tenant);
        } else {
          await builder.buildAllTenantsSafely();
        }
        break;
        
      case 'dev':
        if (tenant) {
          await builder.startDevSafely(tenant);
        } else {
          console.log('Usage: node conflict-free-build.js dev <tenant>');
        }
        break;
        
      default:
        console.log('Usage:');
        console.log('  node conflict-free-build.js build [tenant]');
        console.log('  node conflict-free-build.js dev <tenant>');
    }
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = ConflictFreeBuild;