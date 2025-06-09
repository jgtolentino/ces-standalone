#!/bin/bash

# Pulser AI - Test Production Deployment Locally
# Usage: ./scripts/test-deployment.sh

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo_green() { echo -e "${GREEN}$1${NC}"; }
echo_yellow() { echo -e "${YELLOW}$1${NC}"; }
echo_blue() { echo -e "${BLUE}$1${NC}"; }
echo_red() { echo -e "${RED}$1${NC}"; }

echo_blue "🧪 Testing Pulser AI Production Deployment"
echo_blue "=========================================="

# Production URL
PROD_URL="https://orange-island-0d4b0310f.6.azurestaticapps.net"

echo_yellow "🌐 Testing production deployment at: $PROD_URL"

# Test 1: Basic connectivity
echo_yellow "1️⃣  Testing basic connectivity..."
if curl -f -s "$PROD_URL" > /dev/null; then
    echo_green "   ✅ Site is reachable"
else
    echo_red "   ❌ Site is not reachable"
    exit 1
fi

# Test 2: Check for Pulser AI branding
echo_yellow "2️⃣  Checking for Pulser AI branding..."
if curl -s "$PROD_URL" | grep -q "Pulser AI"; then
    echo_green "   ✅ Pulser AI branding found"
else
    echo_yellow "   ⚠️  Pulser AI branding not found (may still be building)"
fi

# Test 3: Check for AgentGPT integration
echo_yellow "3️⃣  Testing agent interface..."
if curl -f -s "$PROD_URL/agent" > /dev/null; then
    echo_green "   ✅ Agent interface accessible"
else
    echo_yellow "   ⚠️  Agent interface not yet accessible (may still be building)"
fi

# Test 4: Check response time
echo_yellow "4️⃣  Testing response time..."
RESPONSE_TIME=$(curl -o /dev/null -s -w "%{time_total}" "$PROD_URL")
echo_green "   ⏱️  Response time: ${RESPONSE_TIME}s"

# Test 5: Check for HTTPS
echo_yellow "5️⃣  Verifying HTTPS..."
if curl -s "$PROD_URL" | head -1 | grep -q "200"; then
    echo_green "   ✅ HTTPS working correctly"
else
    echo_red "   ❌ HTTPS issue detected"
fi

# Test 6: Check build status via GitHub
echo_yellow "6️⃣  Checking GitHub Actions build status..."
cd "$(dirname "$0")/.."
if command -v gh &> /dev/null; then
    BUILD_STATUS=$(gh run list --limit 1 --json status,conclusion --jq '.[0].conclusion')
    if [ "$BUILD_STATUS" = "success" ]; then
        echo_green "   ✅ Latest GitHub Actions build: SUCCESS"
    elif [ "$BUILD_STATUS" = "failure" ]; then
        echo_red "   ❌ Latest GitHub Actions build: FAILED"
    else
        echo_yellow "   ⏳ Latest GitHub Actions build: IN PROGRESS"
    fi
else
    echo_yellow "   ⚠️  GitHub CLI not available, skipping build check"
fi

echo ""
echo_blue "📋 Deployment Test Summary"
echo_blue "=========================="
echo_yellow "🌐 Production URL: $PROD_URL"
echo_yellow "📊 Response Time: ${RESPONSE_TIME}s"

# Final recommendation
if curl -f -s "$PROD_URL" > /dev/null; then
    echo_green "✅ Deployment appears to be working!"
    echo_yellow "💡 Next steps:"
    echo "   • Visit $PROD_URL to see your live app"
    echo "   • Test the agent interface at $PROD_URL/agent"
    echo "   • Configure custom domain (optional)"
    echo "   • Set up monitoring and alerts"
else
    echo_red "❌ Deployment needs attention"
    echo_yellow "🔧 Troubleshooting:"
    echo "   • Check GitHub Actions for build errors"
    echo "   • Verify environment variables"
    echo "   • Check Azure Static Web Apps logs"
fi

echo ""
echo_yellow "🔍 Useful commands:"
echo "   • Check logs: gh run view --log"
echo "   • Restart build: git commit --allow-empty -m 'trigger build' && git push"
echo "   • SWA status: az staticwebapp show --name pulser-ai-static --resource-group Pulser"

echo_green "✨ Deployment test completed!"