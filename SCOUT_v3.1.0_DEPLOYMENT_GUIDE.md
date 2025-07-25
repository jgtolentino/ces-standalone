# Scout Analytics v3.1.0 - Deployment Guide

## 📋 Pre-Deployment Checklist

### Required Services
- [ ] Azure SQL Database configured and accessible
- [ ] Azure OpenAI service with GPT-4o deployment
- [ ] Node.js 18.x or higher installed
- [ ] Git for version control
- [ ] Vercel account (recommended) or alternative hosting

### Environment Setup
- [ ] All required environment variables documented
- [ ] SSL certificates configured (for production)
- [ ] Domain/subdomain configured
- [ ] Backup strategy in place

## 🚀 Deployment Options

### Option 1: Vercel Deployment (Recommended)

#### Step 1: One-Click Deploy
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/jgtolentino/ces-standalone&env=CES_AZURE_POSTGRES_URL,AZURE_OPENAI_API_KEY,AZURE_OPENAI_ENDPOINT,AZURE_OPENAI_DEPLOYMENT_NAME)

#### Step 2: Configure Environment Variables
In Vercel Dashboard, add:
```bash
CES_AZURE_POSTGRES_URL=sqlserver://[username]:[password]@[server].database.windows.net:1433/[database]
AZURE_OPENAI_API_KEY=your_azure_openai_key
AZURE_OPENAI_ENDPOINT=https://[your-resource].openai.azure.com/
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4o-deployment
AZURE_TENANT_ID=your_tenant_id
AZURE_CLIENT_ID=your_client_id
```

#### Step 3: Deploy
- Vercel will automatically build and deploy
- Monitor deployment logs for any issues
- Access your deployment at: `https://[your-project].vercel.app`

### Option 2: Manual Deployment

#### Step 1: Clone Repository
```bash
git clone -b scout-v3.1.0-client-delivery https://github.com/jgtolentino/ces-standalone.git
cd ces-standalone
```

#### Step 2: Install Dependencies
```bash
npm install
```

#### Step 3: Configure Environment
```bash
cp .env.example .env.local
# Edit .env.local with your credentials
```

#### Step 4: Build Application
```bash
npm run build
```

#### Step 5: Start Production Server
```bash
npm start
# Application runs on http://localhost:3000
```

### Option 3: Docker Deployment

#### Dockerfile
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

#### Build and Run
```bash
docker build -t scout-analytics:3.1.0 .
docker run -p 3000:3000 --env-file .env.production scout-analytics:3.1.0
```

## 🔧 Configuration Details

### Database Connection
Ensure your Azure SQL connection string follows this format:
```
sqlserver://[username]:[password]@[server].database.windows.net:1433/[database]?encrypt=true
```

### Azure OpenAI Setup
1. Create OpenAI resource in Azure Portal
2. Deploy GPT-4o model
3. Note the endpoint and API key
4. Configure rate limiting if needed

### Performance Optimization
```javascript
// next.config.js optimizations included:
- Image optimization
- Bundle splitting
- Static generation where possible
- API route caching
```

## 📊 Post-Deployment Verification

### 1. Health Check
```bash
curl https://your-domain.com/api/health
# Expected: {"status":"healthy","version":"3.1.0"}
```

### 2. Run QA Tests
```bash
npm run qa:full
```

### 3. Verify Key Features
- [ ] Dashboard loads without errors
- [ ] Regional map displays and is interactive
- [ ] Filters update data correctly
- [ ] RetailBot responds to queries
- [ ] Data refreshes in real-time (if enabled)

### 4. Performance Metrics
- Page Load: < 200ms
- Time to Interactive: < 1s
- Lighthouse Score: > 90

## 🔍 Monitoring & Maintenance

### Logging
- Application logs: Check Vercel/hosting platform logs
- API logs: Monitor Azure OpenAI usage
- Database logs: Track query performance

### Recommended Monitoring Tools
- **Uptime**: Pingdom, UptimeRobot
- **Performance**: Google Analytics, Datadog
- **Errors**: Sentry, LogRocket
- **API Usage**: Azure Monitor

### Backup Schedule
- Database: Daily automated backups
- Configuration: Version controlled in Git
- User data: Follow compliance requirements

## 🚨 Troubleshooting

### Common Issues

#### Database Connection Failed
```bash
# Test connection
node -e "console.log(process.env.CES_AZURE_POSTGRES_URL)"
# Verify firewall rules in Azure
```

#### OpenAI API Errors
```bash
# Check API key validity
curl -X POST https://[your-resource].openai.azure.com/openai/deployments/[deployment]/completions?api-version=2023-05-15 \
  -H "api-key: YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "test"}'
```

#### Build Failures
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

## 📈 Scaling Considerations

### Horizontal Scaling
- Vercel: Automatic scaling included
- Manual: Use load balancer with multiple instances
- Database: Consider read replicas for heavy loads

### Caching Strategy
- Static pages: 24-hour cache
- API responses: 5-minute cache for analytics
- Real-time data: No caching

### Rate Limiting
- API routes: 100 requests/minute per IP
- OpenAI calls: Based on your Azure tier
- Database queries: Connection pooling enabled

## 🔐 Security Checklist

- [ ] Environment variables secured
- [ ] HTTPS enforced
- [ ] CORS properly configured
- [ ] API routes authenticated
- [ ] Database access restricted by IP
- [ ] Regular security updates applied

## 📞 Support Contacts

### Technical Support
- Email: support@[your-company].com
- Slack: #scout-analytics-support
- Documentation: [Internal Wiki URL]

### Emergency Contacts
- DevOps Lead: [Contact Info]
- Database Admin: [Contact Info]
- Security Team: [Contact Info]

---

**Deployment completed?** Run `npm run qa:full` to verify everything is working correctly!