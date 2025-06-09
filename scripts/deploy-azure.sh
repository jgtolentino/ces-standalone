#!/bin/bash

# Pulser AI - Azure App Service Deployment Script
# Usage: ./scripts/deploy-azure.sh

set -e

echo "🚀 Deploying Pulser AI to Azure App Service..."

# Configuration
RESOURCE_GROUP="Pulser"
APP_SERVICE_PLAN="PulserAppServicePlan"
APP_NAME="pulser-ai-agent"
LOCATION="East US"
SKU="B2"  # Basic tier with more memory
DOCKER_IMAGE="pulserai/agent:latest"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo_green() {
    echo -e "${GREEN}$1${NC}"
}

echo_yellow() {
    echo -e "${YELLOW}$1${NC}"
}

echo_red() {
    echo -e "${RED}$1${NC}"
}

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    echo_red "❌ Azure CLI is not installed. Please install it first."
    exit 1
fi

# Login check
if ! az account show &> /dev/null; then
    echo_yellow "🔐 Please login to Azure..."
    az login
fi

echo_green "✅ Azure CLI authenticated"

# Create resource group if it doesn't exist
echo_yellow "📦 Creating resource group..."
az group create \
    --name $RESOURCE_GROUP \
    --location "$LOCATION" \
    --output none

echo_green "✅ Resource group ready"

# Create App Service Plan if it doesn't exist
echo_yellow "🏗️ Creating App Service Plan..."
az appservice plan create \
    --name $APP_SERVICE_PLAN \
    --resource-group $RESOURCE_GROUP \
    --location "$LOCATION" \
    --sku $SKU \
    --is-linux \
    --output none

echo_green "✅ App Service Plan ready"

# Create Web App for Containers
echo_yellow "🌐 Creating Web App..."
az webapp create \
    --name $APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --plan $APP_SERVICE_PLAN \
    --deployment-container-image-name $DOCKER_IMAGE \
    --output none

echo_green "✅ Web App created"

# Configure environment variables
echo_yellow "🔧 Setting environment variables..."

# Core Pulser Configuration
az webapp config appsettings set \
    --name $APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --settings \
    PULSER_VERSION="4.0.0" \
    PULSER_MODE="production" \
    PULSER_ORCHESTRATOR="true" \
    PULSER_TENANT="ces" \
    TENANT_ID="ces" \
    NODE_ENV="production" \
    NEXT_PUBLIC_VERCEL_ENV="production" \
    NEXT_PUBLIC_MAX_LOOPS="100" \
    NEXT_PUBLIC_BACKEND_URL="https://$APP_NAME.azurewebsites.net" \
    MCP_ENABLED="true" \
    MCP_SERVER_PORT="3001" \
    WEBSITES_PORT="3000" \
    --output none

echo_green "✅ Environment variables configured"

# Configure container settings
echo_yellow "🐳 Configuring container settings..."
az webapp config container set \
    --name $APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --docker-custom-image-name $DOCKER_IMAGE \
    --docker-registry-server-url "https://index.docker.io/v1/" \
    --output none

echo_green "✅ Container settings configured"

# Enable logging
echo_yellow "📋 Enabling application logging..."
az webapp log config \
    --name $APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --application-logging filesystem \
    --detailed-error-messages true \
    --failed-request-tracing true \
    --web-server-logging filesystem \
    --output none

echo_green "✅ Logging enabled"

# Get the URL
APP_URL="https://$APP_NAME.azurewebsites.net"

echo_green "🎉 Deployment completed!"
echo ""
echo_yellow "📋 Deployment Summary:"
echo "   • App Name: $APP_NAME"
echo "   • Resource Group: $RESOURCE_GROUP"
echo "   • URL: $APP_URL"
echo "   • Status: $(az webapp show --name $APP_NAME --resource-group $RESOURCE_GROUP --query state -o tsv)"
echo ""
echo_yellow "🔧 Next Steps:"
echo "   1. Set required secrets (NEXTAUTH_SECRET, DATABASE_URL, API keys)"
echo "   2. Configure custom domain (optional)"
echo "   3. Set up Azure Key Vault for secure secret management"
echo ""
echo_yellow "💡 Quick Commands:"
echo "   • View logs: az webapp log tail --name $APP_NAME --resource-group $RESOURCE_GROUP"
echo "   • Restart app: az webapp restart --name $APP_NAME --resource-group $RESOURCE_GROUP"
echo "   • View URL: open $APP_URL"
echo ""

# Open the app in browser (macOS)
if command -v open &> /dev/null; then
    read -p "🌐 Open app in browser? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        open $APP_URL
    fi
fi

echo_green "✨ Azure deployment script completed!"