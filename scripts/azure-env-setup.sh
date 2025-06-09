#!/bin/bash

# Pulser AI - Azure Environment Variables Setup
# Usage: ./scripts/azure-env-setup.sh

set -e

# Configuration
RESOURCE_GROUP="Pulser"
APP_NAME="pulser-ai-agent"
KEY_VAULT_NAME="pulser-keyvault"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo_green() { echo -e "${GREEN}$1${NC}"; }
echo_yellow() { echo -e "${YELLOW}$1${NC}"; }
echo_red() { echo -e "${RED}$1${NC}"; }
echo_blue() { echo -e "${BLUE}$1${NC}"; }

echo_blue "🔧 Setting up Azure Environment Variables for Pulser AI"
echo_blue "======================================================"

# Check if we're logged in to Azure
if ! az account show &> /dev/null; then
    echo_yellow "🔐 Please login to Azure..."
    az login
fi

echo_green "✅ Azure CLI authenticated"

# Create Key Vault for sensitive secrets
echo_yellow "🔐 Creating Azure Key Vault..."
az keyvault create \
    --name $KEY_VAULT_NAME \
    --resource-group $RESOURCE_GROUP \
    --location "East US" \
    --enable-soft-delete true \
    --retention-days 7 \
    --output none \
    2>/dev/null || echo "Key Vault may already exist"

echo_green "✅ Key Vault ready"

# Function to set app setting
set_app_setting() {
    local key=$1
    local value=$2
    echo_yellow "Setting $key..."
    az webapp config appsettings set \
        --name $APP_NAME \
        --resource-group $RESOURCE_GROUP \
        --settings "$key=$value" \
        --output none
}

# Function to prompt for secret and store in Key Vault
set_secret() {
    local key=$1
    local description=$2
    local default_value=$3
    
    echo_yellow "🔒 $description"
    if [ -n "$default_value" ]; then
        echo_blue "   Default: $default_value"
        read -p "   Enter value (or press Enter for default): " value
        value=${value:-$default_value}
    else
        read -p "   Enter value: " value
    fi
    
    if [ -n "$value" ]; then
        # Store in Key Vault
        az keyvault secret set \
            --vault-name $KEY_VAULT_NAME \
            --name $key \
            --value "$value" \
            --output none
        
        # Set as app setting referencing Key Vault
        set_app_setting $key "@Microsoft.KeyVault(VaultName=$KEY_VAULT_NAME;SecretName=$key)"
        echo_green "   ✅ $key configured"
    else
        echo_red "   ⚠️ Skipping $key (no value provided)"
    fi
}

echo_blue "\n🚀 Core Pulser 4.0 Configuration"
echo_blue "================================="

# Set non-sensitive environment variables directly
set_app_setting "PULSER_VERSION" "4.0.0"
set_app_setting "PULSER_MODE" "production"
set_app_setting "PULSER_ORCHESTRATOR" "true"
set_app_setting "PULSER_TENANT" "ces"
set_app_setting "TENANT_ID" "ces"
set_app_setting "NODE_ENV" "production"
set_app_setting "NEXT_PUBLIC_VERCEL_ENV" "production"
set_app_setting "NEXT_PUBLIC_MAX_LOOPS" "100"
set_app_setting "NEXT_PUBLIC_BACKEND_URL" "https://$APP_NAME.azurewebsites.net"
set_app_setting "MCP_ENABLED" "true"
set_app_setting "MCP_SERVER_PORT" "3001"
set_app_setting "WEBSITES_PORT" "3000"
set_app_setting "NEXT_TELEMETRY_DISABLED" "1"

echo_green "✅ Core configuration complete"

echo_blue "\n🔐 Sensitive Configuration (stored in Key Vault)"
echo_blue "================================================"

# Collect sensitive information
set_secret "NEXTAUTH-SECRET" "NextAuth Secret (32+ characters for production)" "$(openssl rand -base64 32)"
set_secret "DATABASE-URL" "PostgreSQL Connection String" "postgresql://user:password@host:5432/database?sslmode=require"
set_secret "AZURE-OPENAI-API-KEY" "Azure OpenAI API Key"
set_secret "AZURE-OPENAI-ENDPOINT" "Azure OpenAI Endpoint" "https://your-resource.openai.azure.com/"
set_secret "REWORKD-PLATFORM-OPENAI-API-KEY" "OpenAI API Key for AgentGPT backend"

echo_yellow "\n🔧 Optional Authentication Providers"
echo_yellow "====================================="

read -p "Configure Google OAuth? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    set_secret "GOOGLE-CLIENT-ID" "Google OAuth Client ID"
    set_secret "GOOGLE-CLIENT-SECRET" "Google OAuth Client Secret"
fi

read -p "Configure GitHub OAuth? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    set_secret "GITHUB-CLIENT-ID" "GitHub OAuth Client ID"
    set_secret "GITHUB-CLIENT-SECRET" "GitHub OAuth Client Secret"
fi

read -p "Configure Discord OAuth? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    set_secret "DISCORD-CLIENT-ID" "Discord OAuth Client ID"
    set_secret "DISCORD-CLIENT-SECRET" "Discord OAuth Client Secret"
fi

# Grant Web App access to Key Vault
echo_yellow "\n🔑 Configuring Key Vault access..."

# Get the Web App's system identity
PRINCIPAL_ID=$(az webapp identity assign \
    --name $APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --query principalId -o tsv)

# Grant access to Key Vault
az keyvault set-policy \
    --name $KEY_VAULT_NAME \
    --object-id $PRINCIPAL_ID \
    --secret-permissions get list \
    --output none

echo_green "✅ Key Vault access configured"

# Restart the web app to apply new settings
echo_yellow "\n🔄 Restarting web app to apply settings..."
az webapp restart \
    --name $APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --output none

echo_green "✅ Web app restarted"

# Summary
APP_URL="https://$APP_NAME.azurewebsites.net"

echo_blue "\n🎉 Environment Configuration Complete!"
echo_blue "======================================"
echo_yellow "📋 Summary:"
echo "   • App Name: $APP_NAME"
echo "   • Resource Group: $RESOURCE_GROUP"
echo "   • Key Vault: $KEY_VAULT_NAME"
echo "   • App URL: $APP_URL"
echo ""
echo_yellow "🔍 Verification Commands:"
echo "   • Check app settings: az webapp config appsettings list --name $APP_NAME --resource-group $RESOURCE_GROUP"
echo "   • View Key Vault secrets: az keyvault secret list --vault-name $KEY_VAULT_NAME"
echo "   • Check app logs: az webapp log tail --name $APP_NAME --resource-group $RESOURCE_GROUP"
echo ""
echo_yellow "🌐 Next Steps:"
echo "   1. Test the application: open $APP_URL"
echo "   2. Monitor logs for any configuration issues"
echo "   3. Set up custom domain (optional)"
echo "   4. Configure SSL certificate (optional)"
echo ""

# Offer to open the app
if command -v open &> /dev/null; then
    read -p "🌐 Open app in browser to test? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        open $APP_URL
    fi
fi

echo_green "✨ Azure environment setup completed!"