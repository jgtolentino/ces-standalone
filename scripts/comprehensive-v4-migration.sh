#!/usr/bin/env bash
set -e

# Comprehensive V4 UI Migration Script
# Based on the detailed migration checklist provided

SOURCE_DIR="/Users/tbwa/Documents/GitHub/ai-agency"
DEST_DIR="/Users/tbwa/Documents/GitHub/repro"

echo "🚀 Starting Comprehensive V4 UI Migration..."
echo "📂 Source: $SOURCE_DIR"
echo "📂 Destination: $DEST_DIR"

# Step 1: Navigate to destination and create branch
cd "$DEST_DIR"
echo "📍 Current directory: $(pwd)"

echo "🌿 Creating feature branch..."
git switch -c feature/legacy-port || git checkout feature/legacy-port

# Step 2: Create the apps/analytics structure
echo "🏗️  Creating apps/analytics structure..."
mkdir -p apps/analytics/{app,components,api}
mkdir -p apps/analytics/app/{trends,products,consumers,retailbot,ai-assist,vibe}
mkdir -p apps/analytics/components/{dashboard,charts,analytics,ui}
mkdir -p apps/analytics/api/{analytics,ai-assist,retailbot}

# Step 3: Create packages structure for shared components
echo "📦 Creating packages structure..."
mkdir -p packages/{charts,ui,agents}/src

# Step 4: Copy page directories
echo "🔄 Copying page routes..."

# Main dashboard page
if [ -f "$SOURCE_DIR/app/page.tsx" ]; then
    cp "$SOURCE_DIR/app/page.tsx" apps/analytics/app/page.tsx
    echo "✓ Copied main dashboard page"
fi

# Copy each page directory
for page in trends products consumers retailbot ai-assist vibe; do
    if [ -d "$SOURCE_DIR/app/$page" ]; then
        cp -r "$SOURCE_DIR/app/$page"/* apps/analytics/app/$page/
        echo "✓ Copied /$page page"
    fi
done

# Step 5: Copy shared components
echo "🔄 Copying shared components..."

# Dashboard components
if [ -d "$SOURCE_DIR/components/dashboard" ]; then
    cp -r "$SOURCE_DIR/components/dashboard"/* apps/analytics/components/dashboard/
    echo "✓ Copied dashboard components"
fi

# KPI components
if [ -f "$SOURCE_DIR/components/KpiCard.tsx" ]; then
    cp "$SOURCE_DIR/components/KpiCard.tsx" apps/analytics/components/
    echo "✓ Copied KpiCard component"
fi

# Overview and other main components
for comp in Overview.tsx Trends.tsx Consumers.tsx ProductMix.tsx; do
    if [ -f "$SOURCE_DIR/components/$comp" ]; then
        cp "$SOURCE_DIR/components/$comp" apps/analytics/components/
        echo "✓ Copied $comp"
    fi
done

# Step 6: Move chart components to packages workspace
echo "📊 Moving chart components to packages/charts..."
if [ -d "$SOURCE_DIR/components/charts" ]; then
    cp -r "$SOURCE_DIR/components/charts"/* packages/charts/src/
    echo "✓ Moved chart components to workspace"
fi

# Step 7: Copy UI components to packages workspace
echo "🎨 Copying UI components to packages/ui..."
if [ -d "$SOURCE_DIR/components/ui" ]; then
    cp -r "$SOURCE_DIR/components/ui"/* packages/ui/src/
    echo "✓ Copied UI components to workspace"
fi

# Step 8: Copy API handlers
echo "🔌 Copying API routes..."

# Analytics API
if [ -f "$SOURCE_DIR/app/api/analytics/route.ts" ]; then
    cp "$SOURCE_DIR/app/api/analytics/route.ts" apps/analytics/api/analytics/route.ts
    echo "✓ Copied analytics API"
fi

# AI Assist API
if [ -f "$SOURCE_DIR/app/api/ai-assist/route.ts" ]; then
    cp "$SOURCE_DIR/app/api/ai-assist/route.ts" apps/analytics/api/ai-assist/route.ts
    echo "✓ Copied ai-assist API"
fi

# RetailBot API
if [ -d "$SOURCE_DIR/app/api/retailbot" ]; then
    cp -r "$SOURCE_DIR/app/api/retailbot"/* apps/analytics/api/retailbot/
    echo "✓ Copied retailbot API"
fi

# Step 9: Copy essential lib files
echo "📚 Copying essential library files..."
mkdir -p apps/analytics/lib

for lib_file in database.ts dal.ts types.ts utils.ts; do
    if [ -f "$SOURCE_DIR/lib/$lib_file" ]; then
        cp "$SOURCE_DIR/lib/$lib_file" apps/analytics/lib/
        echo "✓ Copied lib/$lib_file"
    fi
done

# Step 10: Create package.json files for workspaces
echo "📄 Creating package.json files for workspaces..."

# Charts package
cat > packages/charts/package.json << 'EOF'
{
  "name": "@scout/charts",
  "version": "0.1.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "dependencies": {
    "recharts": "^2.8.0",
    "d3": "^7.8.5",
    "react": "^18.2.0",
    "@types/d3": "^7.4.0"
  }
}
EOF

# UI package
cat > packages/ui/package.json << 'EOF'
{
  "name": "@scout/ui",
  "version": "0.1.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "dependencies": {
    "react": "^18.2.0",
    "@radix-ui/react-tabs": "^1.0.4",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0"
  }
}
EOF

# Analytics app package
cat > apps/analytics/package.json << 'EOF'
{
  "name": "@scout/analytics",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@scout/charts": "workspace:*",
    "@scout/ui": "workspace:*",
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "recharts": "^2.8.0",
    "framer-motion": "^10.16.0",
    "@tanstack/react-query": "^5.0.0"
  }
}
EOF

echo "✅ Migration structure complete!"
echo ""
echo "🔧 Next steps needed:"
echo "1. Fix import paths (components/charts -> @scout/charts)"
echo "2. Add dynamic exports to API routes"
echo "3. Update workspace configuration"
echo "4. Run lint and test"
echo ""
echo "📁 Structure created:"
echo "  apps/analytics/app/ - All page routes"
echo "  apps/analytics/components/ - App-specific components"
echo "  packages/charts/src/ - Shared chart components"
echo "  packages/ui/src/ - Shared UI components"
echo "  apps/analytics/api/ - API routes"
