#!/usr/bin/env bash
set -e

OLD=/Users/tbwa/Documents/GitHub/ai-agency/app
NEW=/Users/tbwa/Documents/GitHub/repro/apps/analytics

echo "🔄 Copying page routes …"
mkdir -p $NEW/app/{trends,products,consumers,retailbot,ai-assist,vibe}
cp $OLD/page.tsx                       $NEW/app/page.tsx
cp $OLD/trends/page.tsx                $NEW/app/trends/page.tsx
cp $OLD/products/page.tsx              $NEW/app/products/page.tsx
cp $OLD/consumers/page.tsx             $NEW/app/consumers/page.tsx
cp $OLD/retailbot/page.tsx             $NEW/app/retailbot/page.tsx
cp $OLD/ai-assist/page.tsx             $NEW/app/ai-assist/page.tsx
cp $OLD/vibe/page.tsx                  $NEW/app/vibe/page.tsx

echo "🔄 Copying components …"
mkdir -p $NEW/components/{charts,ai}
cp $OLD/../components/charts/Heatmap.tsx  $NEW/components/charts/
cp $OLD/../components/charts/Treemap.tsx  $NEW/components/charts/
cp $OLD/../components/ai/AIAssistant.tsx  $NEW/components/ai/
cp $OLD/../components/ai/VibeTestBot.tsx  $NEW/components/ai/

echo "🔄 Copying API routes …"
mkdir -p $NEW/app/api/{analytics,ai-assist,retailbot/chat}
cp $OLD/api/analytics/route.ts           $NEW/app/api/analytics/route.ts
cp $OLD/api/ai-assist/route.ts           $NEW/app/api/ai-assist/route.ts
cp $OLD/api/retailbot/chat/route.ts      $NEW/app/api/retailbot/chat/route.ts

echo "✨ Done. All v4 UI dropped into clean v2 layout."
