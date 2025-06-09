#!/bin/bash

# Pulser AI - Local Development with SWA CLI
# Usage: ./scripts/dev-local.sh

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo_green() { echo -e "${GREEN}$1${NC}"; }
echo_yellow() { echo -e "${YELLOW}$1${NC}"; }
echo_blue() { echo -e "${BLUE}$1${NC}"; }

echo_blue "🚀 Starting Pulser AI Local Development Environment"
echo_blue "=================================================="

# Check if SWA CLI is installed
if ! command -v swa &> /dev/null; then
    echo_yellow "⚠️  Azure Static Web Apps CLI not found. Installing..."
    npm install -g @azure/static-web-apps-cli
    echo_green "✅ SWA CLI installed"
fi

# Navigate to the Next.js app directory
cd "$(dirname "$0")/../tenants/frontend_agentgpt/next"

echo_yellow "📦 Installing dependencies..."
if [ ! -d "node_modules" ]; then
    npm install
    echo_green "✅ Dependencies installed"
else
    echo_green "✅ Dependencies already installed"
fi

echo_yellow "🔧 Generating Prisma client..."
npx prisma generate
echo_green "✅ Prisma client generated"

echo_yellow "🌐 Starting local development server..."
echo ""
echo_blue "🎯 Development URLs:"
echo "   • Local App: http://localhost:4280"
echo "   • Next.js Dev: http://localhost:3000"
echo "   • SWA Emulator: http://localhost:4280"
echo ""
echo_yellow "🔧 Available Features:"
echo "   • Hot reload"
echo "   • Authentication testing"
echo "   • API functions (if configured)"
echo "   • Environment variables"
echo "   • Static routing"
echo ""
echo_yellow "⏹️  Press Ctrl+C to stop"
echo ""

# Start SWA CLI with the Next.js app
swa start --config pulser-ai --verbose

echo_green "✨ Development server stopped"