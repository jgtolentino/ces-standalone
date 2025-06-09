#!/bin/bash

# Exit on error
set -e

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    echo "Azure CLI is not installed. Please install it first."
    exit 1
fi

# Check if user is logged in
if ! az account show &> /dev/null; then
    echo "Please login to Azure first using 'az login'"
    exit 1
fi

# Load environment variables
if [ -f .env ]; then
    source .env
else
    echo "No .env file found. Please create one with the required variables."
    exit 1
fi

# Create Key Vault if it doesn't exist
echo "Creating Key Vault if it doesn't exist..."
az keyvault create --name ai-agency-secrets --resource-group ai-agency-rg --location eastus

# Set secrets
echo "Setting secrets in Key Vault..."

# PostgreSQL connection string
az keyvault secret set \
    --vault-name ai-agency-secrets \
    --name ces-postgres-url \
    --value "postgresql://${CES_DB_USER}:${CES_DB_PASSWORD}@${CES_DB_HOST}:5432/ces_production?sslmode=require"

# OpenAI API Key
az keyvault secret set \
    --vault-name ai-agency-secrets \
    --name ces-openai-key \
    --value "${CES_OPENAI_API_KEY}"

# OpenAI Endpoint
az keyvault secret set \
    --vault-name ai-agency-secrets \
    --name ces-openai-endpoint \
    --value "https://${CES_OPENAI_RESOURCE}.openai.azure.com/"

# OpenAI Deployment
az keyvault secret set \
    --vault-name ai-agency-secrets \
    --name ces-openai-deployment \
    --value "gpt-4-ces"

# Create service principal for Vercel if it doesn't exist
echo "Creating service principal for Vercel..."
SP_NAME="vercel-ai-agency"
SP_ID=$(az ad sp list --display-name $SP_NAME --query "[].id" -o tsv)

if [ -z "$SP_ID" ]; then
    SP_ID=$(az ad sp create-for-rbac --name $SP_NAME --skip-assignment --query "id" -o tsv)
fi

# Grant access to Key Vault
echo "Granting access to Key Vault..."
az keyvault set-policy \
    --name ai-agency-secrets \
    --spn $SP_ID \
    --secret-permissions get list

echo "Setup complete! Please add the following to your Vercel environment variables:"
echo "VERCEL_SERVICE_PRINCIPAL_ID=$SP_ID" 