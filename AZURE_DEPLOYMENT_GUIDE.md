# 🚀 Pulser AI - Azure App Service Deployment Guide

Complete guide to deploy your **Pulser 4.0 + AgentGPT integration** to Azure App Service with production-ready configuration.

## 📋 Prerequisites

- ✅ Azure CLI installed and configured
- ✅ Docker installed (for container builds)
- ✅ GitHub repository with the code
- ✅ Azure subscription with sufficient credits

## 🏗️ Architecture Overview

```
🌐 Azure Front Door (optional)
     ↓
📦 Azure App Service (Linux)
     ├── 🤖 Pulser AI Frontend (Next.js)
     ├── 🧠 AgentGPT Backend (FastAPI)
     └── 🔐 Azure Key Vault (secrets)
     ↓
🗄️ Azure PostgreSQL (existing CES database)
```

## 🚀 Quick Deployment (3 Steps)

### Step 1: Deploy Infrastructure
```bash
# Clone the repository
git clone https://github.com/jgtolentino/pulser-ai-platform.git
cd pulser-ai-platform

# Run the deployment script
chmod +x scripts/deploy-azure.sh
./scripts/deploy-azure.sh
```

### Step 2: Configure Environment
```bash
# Set up environment variables and secrets
chmod +x scripts/azure-env-setup.sh
./scripts/azure-env-setup.sh
```

### Step 3: Enable CI/CD (Optional)
1. Go to your GitHub repository settings
2. Add Azure credentials as a secret named `AZURE_CREDENTIALS`
3. Push to main branch to trigger deployment

## 🔧 Manual Deployment Steps

### 1. Create Azure Resources

```bash
# Set variables
RESOURCE_GROUP="Pulser"
APP_NAME="pulser-ai-agent"
LOCATION="East US"

# Create resource group
az group create --name $RESOURCE_GROUP --location "$LOCATION"

# Create App Service Plan (Linux)
az appservice plan create \
  --name PulserAppServicePlan \
  --resource-group $RESOURCE_GROUP \
  --location "$LOCATION" \
  --sku B2 \
  --is-linux

# Create Web App
az webapp create \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --plan PulserAppServicePlan \
  --runtime "NODE|20-lts"
```

### 2. Configure Environment Variables

```bash
# Core Pulser Configuration
az webapp config appsettings set \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --settings \
  PULSER_VERSION="4.0.0" \
  PULSER_MODE="production" \
  PULSER_ORCHESTRATOR="true" \
  PULSER_TENANT="ces" \
  NODE_ENV="production" \
  NEXT_PUBLIC_MAX_LOOPS="100" \
  WEBSITES_PORT="3000"
```

### 3. Set Sensitive Variables (Key Vault)

```bash
# Create Key Vault
az keyvault create \
  --name pulser-keyvault \
  --resource-group $RESOURCE_GROUP \
  --location "$LOCATION"

# Store secrets
az keyvault secret set --vault-name pulser-keyvault --name "NEXTAUTH-SECRET" --value "your-32-char-secret"
az keyvault secret set --vault-name pulser-keyvault --name "DATABASE-URL" --value "postgresql://..."
az keyvault secret set --vault-name pulser-keyvault --name "AZURE-OPENAI-API-KEY" --value "your-api-key"

# Grant Web App access to Key Vault
PRINCIPAL_ID=$(az webapp identity assign --name $APP_NAME --resource-group $RESOURCE_GROUP --query principalId -o tsv)
az keyvault set-policy --name pulser-keyvault --object-id $PRINCIPAL_ID --secret-permissions get list
```

### 4. Deploy Code

```bash
# Build and deploy
cd tenants/frontend_agentgpt/next
npm install
npm run build

# Create deployment package
zip -r ../deployment.zip .next/standalone public package.json

# Deploy to Azure
az webapp deploy \
  --resource-group $RESOURCE_GROUP \
  --name $APP_NAME \
  --src-path ../deployment.zip \
  --type zip
```

## 🐳 Container Deployment (Recommended)

### Build Docker Image
```bash
cd tenants/frontend_agentgpt/next

# Build production image
docker build -f Dockerfile.azure -t pulserai/agent:latest .

# Push to Azure Container Registry (optional)
docker tag pulserai/agent:latest your-registry.azurecr.io/pulserai/agent:latest
docker push your-registry.azurecr.io/pulserai/agent:latest
```

### Deploy Container
```bash
az webapp create \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --plan PulserAppServicePlan \
  --deployment-container-image-name pulserai/agent:latest
```

## 🔍 Environment Variables Reference

### Required Variables
| Variable | Description | Example |
|----------|-------------|---------|
| `NEXTAUTH_SECRET` | Authentication secret (32+ chars) | `openssl rand -base64 32` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `AZURE_OPENAI_API_KEY` | Azure OpenAI API key | `abc123...` |
| `AZURE_OPENAI_ENDPOINT` | Azure OpenAI endpoint | `https://your-resource.openai.azure.com/` |

### Optional Variables
| Variable | Description | Default |
|----------|-------------|---------|
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | - |
| `GITHUB_CLIENT_ID` | GitHub OAuth client ID | - |
| `DISCORD_CLIENT_ID` | Discord OAuth client ID | - |
| `NEXT_PUBLIC_BACKEND_URL` | Backend API URL | `https://your-app.azurewebsites.net` |

## 🔄 CI/CD with GitHub Actions

The repository includes a GitHub Actions workflow that:
- ✅ Builds the Next.js application
- ✅ Generates Prisma client
- ✅ Runs tests (if available)
- ✅ Deploys to Azure App Service
- ✅ Performs health checks

### Setup GitHub Actions
1. **Create Azure Service Principal:**
```bash
az ad sp create-for-rbac \
  --name "pulser-ai-github-actions" \
  --role contributor \
  --scopes /subscriptions/{subscription-id}/resourceGroups/Pulser \
  --sdk-auth
```

2. **Add Secret to GitHub:**
   - Go to repository Settings → Secrets and Variables → Actions
   - Add secret named `AZURE_CREDENTIALS`
   - Paste the JSON output from above command

3. **Push to trigger deployment:**
```bash
git push origin main
```

## 🏥 Health Monitoring

### Application Insights
```bash
# Enable Application Insights
az monitor app-insights component create \
  --app pulser-ai-insights \
  --location "$LOCATION" \
  --resource-group $RESOURCE_GROUP

# Get instrumentation key
INSIGHTS_KEY=$(az monitor app-insights component show \
  --app pulser-ai-insights \
  --resource-group $RESOURCE_GROUP \
  --query instrumentationKey -o tsv)

# Configure app to use Application Insights
az webapp config appsettings set \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --settings APPLICATIONINSIGHTS_CONNECTION_STRING="InstrumentationKey=$INSIGHTS_KEY"
```

### Logging
```bash
# Enable logging
az webapp log config \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --application-logging filesystem \
  --web-server-logging filesystem

# View logs
az webapp log tail --name $APP_NAME --resource-group $RESOURCE_GROUP
```

## 🔧 Troubleshooting

### Common Issues

**1. Build Failures**
```bash
# Check build logs
az webapp log download --name $APP_NAME --resource-group $RESOURCE_GROUP

# Verify Node.js version
az webapp config show --name $APP_NAME --resource-group $RESOURCE_GROUP
```

**2. Environment Variable Issues**
```bash
# List all app settings
az webapp config appsettings list --name $APP_NAME --resource-group $RESOURCE_GROUP

# Test Key Vault access
az webapp show --name $APP_NAME --resource-group $RESOURCE_GROUP --query identity
```

**3. Database Connection Issues**
```bash
# Test database connectivity
az webapp ssh --name $APP_NAME --resource-group $RESOURCE_GROUP
# Inside the container:
# node -e "console.log(process.env.DATABASE_URL)"
```

### Performance Tuning

**Scale Up (Vertical)**
```bash
az appservice plan update \
  --name PulserAppServicePlan \
  --resource-group $RESOURCE_GROUP \
  --sku P1V2  # Premium tier
```

**Scale Out (Horizontal)**
```bash
az webapp scale \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --instance-count 2
```

## 🌐 Production Checklist

- [ ] ✅ Custom domain configured
- [ ] ✅ SSL certificate installed
- [ ] ✅ Environment variables secured in Key Vault
- [ ] ✅ Application Insights enabled
- [ ] ✅ Auto-scaling configured
- [ ] ✅ Backup strategy implemented
- [ ] ✅ Health checks configured
- [ ] ✅ CI/CD pipeline tested

## 🎯 URLs and Access

After deployment, your application will be available at:
- **Main App**: `https://pulser-ai-agent.azurewebsites.net`
- **Health Check**: `https://pulser-ai-agent.azurewebsites.net/api/health`
- **Agent Interface**: `https://pulser-ai-agent.azurewebsites.net/agent`

## 💰 Cost Optimization

### Recommended Tiers
- **Development**: B1 Basic ($13/month)
- **Production**: P1V2 Premium ($73/month)
- **Enterprise**: P2V2 Premium ($146/month)

### Cost Savings
- Use **staging slots** for testing
- Enable **auto-scaling** based on demand
- Consider **Azure Container Apps** for microservices

---

🎉 **Your Pulser 4.0 + AgentGPT integration is now production-ready on Azure!**

For support, check the [troubleshooting section](#-troubleshooting) or review the application logs.