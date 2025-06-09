# Vercel Production Environment Variables

Copy these to your Vercel project dashboard → Settings → Environment Variables:

## Core Pulser Configuration
```
PULSER_VERSION=4.0.0
PULSER_MODE=production
PULSER_ORCHESTRATOR=true
PULSER_TENANT=ces
TENANT_ID=ces
```

## Next.js Configuration  
```
NODE_ENV=production
NEXT_PUBLIC_VERCEL_ENV=production
NEXT_PUBLIC_MAX_LOOPS=100
NEXT_PUBLIC_BACKEND_URL=https://your-backend.vercel.app
```

## Authentication (Required)
```
NEXTAUTH_SECRET=your_production_secret_32_chars_minimum
NEXTAUTH_URL=https://your-app.vercel.app
```

## Database (Required)
```
DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require
```

## AI Services
```
AZURE_OPENAI_API_KEY=your_azure_openai_key
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4-turbo
REWORKD_PLATFORM_OPENAI_API_KEY=your_openai_key
```

## Optional Auth Providers
```
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

## MCP Configuration
```
MCP_ENABLED=true
MCP_SERVER_PORT=3001
```

## Note: Replace all placeholder values with your actual credentials before deploying!