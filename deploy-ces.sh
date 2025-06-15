#!/bin/bash

# Ask CES v3.0.0 Deployment Script
# Deploy to ces-mvp.vercel.app

echo "🚀 Deploying Ask CES v3.0.0 to ces-mvp.vercel.app"

# Check if logged in to Vercel
if ! vercel whoami > /dev/null 2>&1; then
    echo "❌ Please login to Vercel first:"
    echo "   vercel login"
    exit 1
fi

echo "✅ Vercel authentication confirmed"

# Deploy with production flag
echo "📦 Starting deployment..."
vercel --prod --name ces-mvp --local-config vercel-ces.json

# Check deployment status
if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Ask CES v3.0.0 Deployment Successful!"
    echo ""
    echo "🌐 Your AI assistant is live at:"
    echo "   https://ces-mvp.vercel.app"
    echo ""
    echo "📋 Next steps:"
    echo "   1. Set environment variables in Vercel dashboard"
    echo "   2. Test the /api/ask-ces endpoint"
    echo "   3. Verify role-based responses"
    echo ""
    echo "🔧 Environment variables needed:"
    echo "   - AZURE_OPENAI_ENDPOINT"
    echo "   - AZURE_OPENAI_API_KEY" 
    echo "   - AZURE_OPENAI_DEPLOYMENT_NAME"
    echo ""
else
    echo "❌ Deployment failed. Check the logs above."
    exit 1
fi