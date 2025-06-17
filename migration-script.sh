#!/bin/bash
# Migration Script: Extract valuable components and rebuild clean v2.1

set -e  # Exit on error

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Configuration
SOURCE_REPO=$(pwd)  # Current repository path
TARGET_REPO="/Users/tbwa/Desktop/repro"
TEMP_DIR="/tmp/scout-migration"

echo -e "${BLUE}🔄 Scout Analytics Migration Script${NC}"
echo -e "${BLUE}===================================${NC}"
echo -e "Source: ${SOURCE_REPO}"
echo -e "Target: ${TARGET_REPO}\n"

# Step 1: Create temporary extraction directory
echo -e "${GREEN}Step 1: Creating temporary extraction directory...${NC}"
rm -rf $TEMP_DIR
mkdir -p $TEMP_DIR/{components,lib,app,public}

# Step 2: Extract core components
echo -e "\n${GREEN}Step 2: Extracting valuable components...${NC}"

# Extract essential pages
echo -e "${YELLOW}  → Extracting pages...${NC}"
cp -r $SOURCE_REPO/app/page.tsx $TEMP_DIR/app/ 2>/dev/null || echo "    ⚠️  Main page not found"
cp -r $SOURCE_REPO/app/trends $TEMP_DIR/app/ 2>/dev/null || echo "    ⚠️  Trends page not found"
cp -r $SOURCE_REPO/app/products $TEMP_DIR/app/ 2>/dev/null || echo "    ⚠️  Products page not found"
cp -r $SOURCE_REPO/app/consumers $TEMP_DIR/app/ 2>/dev/null || echo "    ⚠️  Consumers page not found"
cp -r $SOURCE_REPO/app/retailbot $TEMP_DIR/app/ 2>/dev/null || echo "    ⚠️  RetailBot page not found"

# Extract key components
echo -e "${YELLOW}  → Extracting components...${NC}"
# Dashboard components
mkdir -p $TEMP_DIR/components/dashboard
cp $SOURCE_REPO/components/dashboard/PhilippinesMap.tsx $TEMP_DIR/components/dashboard/ 2>/dev/null || echo "    ⚠️  PhilippinesMap not found"
cp $SOURCE_REPO/components/dashboard/FilterBar.tsx $TEMP_DIR/components/dashboard/ 2>/dev/null || echo "    ⚠️  FilterBar not found"
cp $SOURCE_REPO/components/KpiCard.tsx $TEMP_DIR/components/ 2>/dev/null || echo "    ⚠️  KpiCard not found"

# Chart components
mkdir -p $TEMP_DIR/components/charts
cp $SOURCE_REPO/components/charts/LineChart.tsx $TEMP_DIR/components/charts/ 2>/dev/null || echo "    ⚠️  LineChart not found"

# UI components
mkdir -p $TEMP_DIR/components/ui
cp -r $SOURCE_REPO/components/ui/* $TEMP_DIR/components/ui/ 2>/dev/null || echo "    ⚠️  UI components not found"

# Extract utilities
echo -e "${YELLOW}  → Extracting utilities...${NC}"
cp $SOURCE_REPO/lib/dal.ts $TEMP_DIR/lib/ 2>/dev/null || echo "    ⚠️  dal.ts not found"
cp $SOURCE_REPO/lib/database.ts $TEMP_DIR/lib/ 2>/dev/null || echo "    ⚠️  database.ts not found"

# Extract API routes
echo -e "${YELLOW}  → Extracting API routes...${NC}"
mkdir -p $TEMP_DIR/app/api
cp -r $SOURCE_REPO/app/api/analytics $TEMP_DIR/app/api/ 2>/dev/null || echo "    ⚠️  Analytics API not found"
cp -r $SOURCE_REPO/app/api/health $TEMP_DIR/app/api/ 2>/dev/null || echo "    ⚠️  Health API not found"
cp -r $SOURCE_REPO/app/api/retailbot $TEMP_DIR/app/api/ 2>/dev/null || echo "    ⚠️  RetailBot API not found"

# Step 3: Create new clean repository
echo -e "\n${GREEN}Step 3: Creating clean v2.1 repository structure...${NC}"
mkdir -p $TARGET_REPO
cd $TARGET_REPO

# Initialize git
git init

# Create monorepo structure
mkdir -p apps/analytics/{app,components,lib,public,tests}
mkdir -p packages/{ui,charts,data}/src
mkdir -p tools/scripts
mkdir -p docs

# Step 4: Create base configuration files
echo -e "\n${GREEN}Step 4: Creating configuration files...${NC}"

# Root package.json
cat > package.json << 'EOF'
{
  "name": "scout-analytics-v2",
  "version": "2.1.0",
  "private": true,
  "description": "Scout Analytics Platform - Clean v2.1 rebuild",
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "clean": "turbo run clean",
    "migrate:check": "node tools/scripts/migration-check.js"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "turbo": "^1.11.0",
    "typescript": "^5.3.0"
  }
}
EOF

# Turbo configuration
cat > turbo.json << 'EOF'
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "test": {
      "dependsOn": ["build"]
    },
    "lint": {},
    "clean": {
      "cache": false
    }
  }
}
EOF

# Analytics app package.json
cat > apps/analytics/package.json << 'EOF'
{
  "name": "@scout/analytics",
  "version": "2.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "jest"
  },
  "dependencies": {
    "@scout/ui": "workspace:*",
    "@scout/charts": "workspace:*",
    "@scout/data": "workspace:*",
    "next": "14.0.4",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "leaflet": "^1.9.4",
    "react-leaflet": "^4.2.1"
  }
}
EOF

# Step 5: Copy extracted files to new structure
echo -e "\n${GREEN}Step 5: Copying extracted files to clean structure...${NC}"

# Copy app files
cp -r $TEMP_DIR/app/* apps/analytics/app/ 2>/dev/null || echo "  ⚠️  No app files to copy"

# Copy components
cp -r $TEMP_DIR/components/* apps/analytics/components/ 2>/dev/null || echo "  ⚠️  No components to copy"

# Copy lib files
cp -r $TEMP_DIR/lib/* apps/analytics/lib/ 2>/dev/null || echo "  ⚠️  No lib files to copy"

# Step 6: Create migration report
echo -e "\n${GREEN}Step 6: Creating migration report...${NC}"

cat > MIGRATION_REPORT.md << EOF
# Migration Report - $(date)

## Source Repository
- Path: $SOURCE_REPO
- Original Version: Mixed (v3.1.0, v3.3.1)

## Target Repository  
- Path: $TARGET_REPO
- Clean Version: v2.1.0

## Files Migrated
$(find apps/analytics -type f -name "*.tsx" -o -name "*.ts" | wc -l) TypeScript/React files
$(find apps/analytics -type f -name "*.css" | wc -l) CSS files

## Components Extracted
- Dashboard pages: 5
- Components: $(find apps/analytics/components -type f | wc -l)
- API routes: $(find apps/analytics/app/api -type d | wc -l)

## Next Steps
1. Install dependencies: \`pnpm install\`
2. Fix import paths
3. Remove legacy code
4. Add E2E tests
5. Deploy to Vercel

## Excluded from Migration
- Complex agent orchestration
- PowerBI integration
- claude-jules system
- Redundant scout/ces pages
- Multiple documentation versions
EOF

# Step 7: Create migration check script
echo -e "\n${GREEN}Step 7: Creating migration check script...${NC}"

cat > tools/scripts/migration-check.js << 'EOF'
#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

console.log('🔍 Checking migration status...\n');

const checks = [
  { name: 'Dashboard page exists', path: 'apps/analytics/app/page.tsx' },
  { name: 'Trends page exists', path: 'apps/analytics/app/trends/page.tsx' },
  { name: 'PhilippinesMap component', path: 'apps/analytics/components/dashboard/PhilippinesMap.tsx' },
  { name: 'Analytics API', path: 'apps/analytics/app/api/analytics' },
  { name: 'Package.json valid', path: 'apps/analytics/package.json' },
];

let passed = 0;
checks.forEach(check => {
  const exists = fs.existsSync(path.join(process.cwd(), check.path));
  console.log(`${exists ? '✅' : '❌'} ${check.name}`);
  if (exists) passed++;
});

console.log(`\n📊 Migration Score: ${passed}/${checks.length} (${Math.round(passed/checks.length*100)}%)`);

if (passed < checks.length) {
  console.log('\n⚠️  Some files are missing. Run manual extraction for missing components.');
}
EOF

chmod +x tools/scripts/migration-check.js

# Step 8: Initialize git
echo -e "\n${GREEN}Step 8: Initializing git repository...${NC}"
git add .
git commit -m "Initial commit: Scout Analytics v2.1 clean migration

- Extracted core components from v3.x
- Removed complexity and redundancy  
- Set up clean monorepo structure
- Ready for fresh development"

# Step 9: Summary
echo -e "\n${BLUE}✨ Migration Complete!${NC}"
echo -e "${BLUE}===================${NC}"
echo -e "\nNew repository created at: ${GREEN}$TARGET_REPO${NC}"
echo -e "\nExtracted components:"
echo -e "  ✓ 5 main pages (dashboard, trends, products, consumers, retailbot)"
echo -e "  ✓ Key components (PhilippinesMap, KpiCard, FilterBar)"
echo -e "  ✓ Essential APIs (analytics, health, retailbot)"
echo -e "  ✓ Core utilities (dal, database)"

echo -e "\n${YELLOW}⚠️  Manual steps required:${NC}"
echo -e "1. cd $TARGET_REPO"
echo -e "2. pnpm install"
echo -e "3. Fix any broken imports"
echo -e "4. Update API endpoints"
echo -e "5. pnpm dev"

echo -e "\n${GREEN}📋 Check migration status:${NC}"
echo -e "cd $TARGET_REPO && npm run migrate:check"

# Cleanup
rm -rf $TEMP_DIR