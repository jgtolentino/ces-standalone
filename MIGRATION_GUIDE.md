# 🚀 Safe Migration Guide - No Conflicts, No Hijacking

This guide ensures **zero conflicts** when migrating your existing **Pulser, CES, Scout** projects into the AI Agency monorepo.

## ⚡ Quick Migration (Automated)

```bash
# Navigate to the monorepo
cd /Users/tbwa/Documents/GitHub/ai-agency

# Install dependencies first
pnpm install

# Run automated migration (with backups)
task migrate:all

# Verify everything works
task doctor
```

## 🛡️ Manual Migration (Step-by-Step)

### Step 1: Backup Everything
```bash
# The migration script automatically creates backups, but you can also:
cp -r ../campaign-insight-accelerator ./backups/ces-backup
cp -r ../retail-insights-dashboard-ph ./backups/scout-backup
cp -r ../InsightPulseAI_SKR ./backups/pulser-backup
```

### Step 2: Migrate CES Project
```bash
# Create CES tenant
task migrate:ces

# Copy your CES files manually (safe approach)
cp -r ../campaign-insight-accelerator/src tenants/ces/
cp -r ../campaign-insight-accelerator/components tenants/ces/
cp -r ../campaign-insight-accelerator/lib tenants/ces/

# Test CES build
task build:tenant TENANT=ces
```

### Step 3: Migrate Scout Project
```bash
# Create Scout tenant
task migrate:scout

# Copy your Scout files manually
cp -r ../retail-insights-dashboard-ph/src tenants/scout/
cp -r ../retail-insights-dashboard-ph/components tenants/scout/
cp -r ../retail-insights-dashboard-ph/supabase tenants/scout/

# Test Scout build
task build:tenant TENANT=scout
```

### Step 4: Migrate Pulser Configurations
```bash
# Copy Pulser configs to infra
cp -r ../InsightPulseAI_SKR/agents infra/pulser/
cp -r ../InsightPulseAI_SKR/pipelines infra/pulser/
cp ../InsightPulseAI_SKR/*.yaml infra/pulser/
```

## 🔧 Conflict-Free Development

### No Port Conflicts
```bash
# Each tenant gets auto-assigned ports
task dev:tenant TENANT=ces    # Runs on port 3001
task dev:tenant TENANT=scout  # Runs on port 3002

# Or start all with automatic port assignment
task dev
```

### No Build Conflicts
```bash
# Sequential builds with dependency resolution
task build:tenant TENANT=ces
task build:tenant TENANT=scout

# Or build all safely
task build
```

### No Dependency Conflicts
The system automatically:
- ✅ **Resolves version conflicts** using catalog versions
- ✅ **Isolates builds** with separate lock files
- ✅ **Prevents hijacking** with build locks
- ✅ **Backs up configurations** before changes

## 🎯 Verification Steps

### Check Everything Works
```bash
# 1. Health check
task doctor

# 2. List all tenants
task list:tenants

# 3. Test CES
task dev:tenant TENANT=ces
# Visit: http://localhost:3001

# 4. Test Scout  
task dev:tenant TENANT=scout
# Visit: http://localhost:3002

# 5. Run scans
task pulser:scan
task pulser:costs
```

### Verify No Conflicts
```bash
# Check for duplicate dependencies
node scripts/scan-duplicates.js

# Check for port conflicts
lsof -i :3000-3010

# Check build status
ls -la tenants/*/dist
ls -la tenants/*/.next
```

## 🔄 Parallel Development Workflow

### Multiple Developers
```bash
# Developer A works on CES
cd tenants/ces
pnpm dev --port 3001

# Developer B works on Scout  
cd tenants/scout
pnpm dev --port 3002

# Developer C works on shared components
cd packages/ui
pnpm dev --watch
```

### No Conflicts Guaranteed
- ✅ **Separate ports** for each tenant
- ✅ **Isolated builds** with unique build IDs
- ✅ **Independent deployments** 
- ✅ **Shared packages** update automatically

## 🚨 Troubleshooting

### Build Fails?
```bash
# Clean and rebuild
task clean
pnpm install
task build:tenant TENANT=your-tenant
```

### Port Conflicts?
```bash
# Kill conflicting processes
lsof -ti:3000 | xargs kill -9

# Or let the system auto-assign ports
task dev:tenant TENANT=your-tenant
```

### Dependency Issues?
```bash
# Reset to catalog versions
node scripts/conflict-free-build.js build your-tenant

# Or manually fix package.json
vim tenants/your-tenant/package.json
# Change versions to "catalog:"
```

### Migration Failed?
```bash
# Restore from backup
cp -r backups/backup-[timestamp]/your-project ./tenants/your-tenant/

# Or start fresh
rm -rf tenants/your-tenant
task create:tenant TENANT=your-tenant
# Manually copy files
```

## 📋 Migration Checklist

### Before Migration
- [ ] Backup all existing projects
- [ ] Check current working state of projects
- [ ] Note any custom configurations
- [ ] Document any special dependencies

### During Migration
- [ ] Run `task migrate:all` or manual steps
- [ ] Verify each tenant builds successfully
- [ ] Test development servers start
- [ ] Check for port conflicts
- [ ] Validate no build errors

### After Migration
- [ ] Run `task doctor` - all checks pass
- [ ] All tenants accessible via browser
- [ ] Shared packages work correctly
- [ ] Pulser pipelines functional
- [ ] No duplicate code detected
- [ ] CI/CD pipeline works

## 🎉 Success Indicators

You'll know migration succeeded when:
- ✅ `task doctor` passes all checks
- ✅ `task list:tenants` shows your projects
- ✅ `task dev:tenant TENANT=ces` starts without errors
- ✅ `task dev:tenant TENANT=scout` starts without errors
- ✅ Both tenants accessible in browser
- ✅ `task build` completes successfully
- ✅ No conflicts in development

## 📞 Support

If migration fails:
1. **Check logs** in `scripts/safe-migrate.js` output
2. **Restore backups** from `backups/` directory  
3. **Try manual migration** step-by-step
4. **Use conflict-free build** system
5. **Contact team** with specific error messages

---

**🚀 Ready to migrate?** Start with: `task migrate:all`