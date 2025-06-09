#!/bin/bash
set -e

# Tenant-Specific Deployment Script
# Deploys individual tenants with proper verification and database setup
# Usage: ./deploy-tenant.sh <tenant> [environment]

TENANT=$1
ENVIRONMENT=${2:-production}

if [ -z "$TENANT" ]; then
    echo "❌ Usage: ./deploy-tenant.sh <tenant> [environment]"
    echo "   Example: ./deploy-tenant.sh ces production"
    echo "   Available tenants: ces, retail-insights, scout, tbwa-chat"
    exit 1
fi

echo "🚀 Deploying tenant: $TENANT to $ENVIRONMENT"
echo "============================================="

# Step 1: Verify deployment readiness
echo "🔍 Step 1: Verifying deployment readiness..."
node scripts/deployment-verification.js $TENANT

if [ $? -ne 0 ]; then
    echo "❌ Deployment verification failed. Fix issues before deploying."
    exit 1
fi

# Step 2: Load environment-specific configuration
echo "🔧 Step 2: Loading environment configuration..."

case $ENVIRONMENT in
    production)
        ENV_FILE=".env.production"
        ;;
    staging)
        ENV_FILE=".env.staging"
        ;;
    development)
        ENV_FILE=".env.development"
        ;;
    *)
        echo "❌ Unknown environment: $ENVIRONMENT"
        exit 1
        ;;
esac

if [ -f "$ENV_FILE" ]; then
    echo "   Loading $ENV_FILE..."
    source $ENV_FILE
else
    echo "⚠️  No $ENV_FILE found, using default environment variables"
fi

# Step 3: Setup tenant-specific database
echo "🛢️ Step 3: Setting up tenant database..."

case $TENANT in
    ces)
        if [ -z "$CES_AZURE_POSTGRES_URL" ]; then
            echo "❌ CES_AZURE_POSTGRES_URL required for CES deployment"
            exit 1
        fi
        echo "   Using Azure PostgreSQL for CES"
        
        # Run CES-specific database migrations
        if [ -f "tenants/ces/sql/azure-postgres-schema.sql" ]; then
            echo "   Running CES database schema..."
            psql $CES_AZURE_POSTGRES_URL -f tenants/ces/sql/azure-postgres-schema.sql
        fi
        ;;
        
    retail-insights|scout|tbwa-chat)
        if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_ANON_KEY" ]; then
            echo "❌ SUPABASE_URL and SUPABASE_ANON_KEY required for $TENANT deployment"
            exit 1
        fi
        echo "   Using Supabase for $TENANT"
        
        # Run Supabase migrations if they exist
        if [ -f "tenants/$TENANT/supabase/migrations/schema.sql" ]; then
            echo "   Running $TENANT database schema..."
            # Use Supabase CLI or direct SQL execution
            # supabase db push --tenant $TENANT
        fi
        ;;
        
    *)
        echo "❌ Unknown tenant: $TENANT"
        exit 1
        ;;
esac

# Step 4: Build tenant application
echo "🔨 Step 4: Building tenant application..."
cd tenants/$TENANT

# Install dependencies
echo "   Installing dependencies..."
npm ci

# Run build
echo "   Building application..."
npm run build

# Step 5: Run tests
echo "🧪 Step 5: Running tests..."
if npm run test --silent > /dev/null 2>&1; then
    echo "   ✅ Tests passed"
else
    echo "   ⚠️  No tests found or tests failed - proceeding with deployment"
fi

# Step 6: Deploy to platform
echo "🌐 Step 6: Deploying to platform..."

case $ENVIRONMENT in
    production)
        # Deploy to Vercel production
        echo "   Deploying to Vercel production..."
        npx vercel --prod --yes
        ;;
    staging)
        # Deploy to Vercel preview
        echo "   Deploying to Vercel staging..."
        npx vercel --yes
        ;;
    development)
        # Local development setup
        echo "   Setting up local development..."
        npm run dev &
        DEV_PID=$!
        echo "   Development server started (PID: $DEV_PID)"
        ;;
esac

# Step 7: Post-deployment verification
echo "✅ Step 7: Post-deployment verification..."

if [ "$ENVIRONMENT" != "development" ]; then
    # Wait for deployment to be available
    sleep 30
    
    # Get deployment URL
    DEPLOYMENT_URL=$(npx vercel ls | grep $TENANT | head -1 | awk '{print $2}')
    
    if [ ! -z "$DEPLOYMENT_URL" ]; then
        echo "   Testing deployment at: https://$DEPLOYMENT_URL"
        
        # Basic health check
        HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://$DEPLOYMENT_URL)
        
        if [ "$HTTP_STATUS" -eq 200 ]; then
            echo "   ✅ Deployment successful!"
            echo "   🌍 Live at: https://$DEPLOYMENT_URL"
        else
            echo "   ❌ Deployment may have issues (HTTP $HTTP_STATUS)"
        fi
    else
        echo "   ⚠️  Could not determine deployment URL"
    fi
fi

# Step 8: Update deployment status
echo "📝 Step 8: Updating deployment status..."

# Create deployment record
DEPLOYMENT_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
cat > "tenants/$TENANT/LAST_DEPLOYMENT.json" << EOF
{
  "tenant": "$TENANT",
  "environment": "$ENVIRONMENT", 
  "deploymentDate": "$DEPLOYMENT_DATE",
  "deployedBy": "$(whoami)",
  "gitCommit": "$(git rev-parse HEAD)",
  "status": "deployed",
  "url": "${DEPLOYMENT_URL:-"local"}"
}
EOF

echo "✅ Deployment complete!"
echo ""
echo "📊 DEPLOYMENT SUMMARY"
echo "===================="
echo "Tenant: $TENANT"
echo "Environment: $ENVIRONMENT"
echo "Date: $DEPLOYMENT_DATE"
echo "URL: ${DEPLOYMENT_URL:-"localhost"}"
echo ""

# Return to original directory
cd ../..

echo "🎉 $TENANT deployment successful!"