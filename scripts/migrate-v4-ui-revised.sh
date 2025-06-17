#!/usr/bin/env bash
set -e

OLD=/Users/tbwa/Documents/GitHub/ai-agency/app
NEW=/Users/tbwa/Documents/GitHub/repro/apps/analytics

echo "🔄 Copying page routes …"
mkdir -p $NEW/app/{trends,products,consumers,retailbot,ai-assist,vibe}

# Copy pages that exist
if [ -f "$OLD/page.tsx" ]; then
    cp $OLD/page.tsx $NEW/app/page.tsx
    echo "✓ Copied main page"
fi

if [ -f "$OLD/trends/page.tsx" ]; then
    cp $OLD/trends/page.tsx $NEW/app/trends/page.tsx
    echo "✓ Copied trends page"
fi

if [ -f "$OLD/products/page.tsx" ]; then
    cp $OLD/products/page.tsx $NEW/app/products/page.tsx
    echo "✓ Copied products page"
fi

if [ -f "$OLD/consumers/page.tsx" ]; then
    cp $OLD/consumers/page.tsx $NEW/app/consumers/page.tsx
    echo "✓ Copied consumers page"
fi

if [ -f "$OLD/retailbot/page.tsx" ]; then
    cp $OLD/retailbot/page.tsx $NEW/app/retailbot/page.tsx
    echo "✓ Copied retailbot page"
fi

if [ -f "$OLD/ai-assist/page.tsx" ]; then
    cp $OLD/ai-assist/page.tsx $NEW/app/ai-assist/page.tsx
    echo "✓ Copied ai-assist page"
fi

if [ -f "$OLD/vibe/page.tsx" ]; then
    cp $OLD/vibe/page.tsx $NEW/app/vibe/page.tsx
    echo "✓ Copied vibe page"
fi

echo "🔄 Copying components …"
mkdir -p $NEW/components/charts

# Copy chart components that exist
if [ -f "$OLD/../components/charts/Heatmap.tsx" ]; then
    cp $OLD/../components/charts/Heatmap.tsx $NEW/components/charts/
    echo "✓ Copied Heatmap component"
fi

# Copy other chart components if they exist
if [ -f "$OLD/../components/charts/LineChart.tsx" ]; then
    cp $OLD/../components/charts/LineChart.tsx $NEW/components/charts/
    echo "✓ Copied LineChart component"
fi

if [ -f "$OLD/../components/charts/StackedBar.tsx" ]; then
    cp $OLD/../components/charts/StackedBar.tsx $NEW/components/charts/
    echo "✓ Copied StackedBar component"
fi

echo "🔄 Copying API routes …"
mkdir -p $NEW/app/api/{analytics,retailbot}

# Copy API routes that exist
if [ -f "$OLD/api/analytics/route.ts" ]; then
    cp $OLD/api/analytics/route.ts $NEW/app/api/analytics/route.ts
    echo "✓ Copied analytics API route"
fi

if [ -d "$OLD/api/retailbot" ]; then
    cp -r $OLD/api/retailbot $NEW/app/api/
    echo "✓ Copied retailbot API routes"
fi

echo "✨ Done. All available v4 UI components copied to clean v2 layout."
