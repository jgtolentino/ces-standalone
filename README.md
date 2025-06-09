# AI Agency - Multi-Tenant Platform

A production-ready multi-tenant AI agency platform with **23 isolated client workspaces**, built on Vercel Edge Functions, Supabase, and Pulser v3.2.

## 🏗️ Architecture

```
ai-agency/
├── tenants/                 # 23 isolated tenant applications
│   ├── ces/                 # Campaign Effectiveness Suite (52K+ records)
│   ├── scout/               # Scout Analytics (real-time retail)
│   ├── acme/                # ACME Corporation
│   └── ...                  # 20+ more tenants
│
├── packages/                # Sophisticated shared libraries
│   ├── ui/                  # Component library (shadcn/ui)
│   ├── db/                  # Typed Supabase client with RLS
│   ├── agents/              # Advanced AI agent system
│   │   ├── ces-drive-scraper/     # Google Drive automation
│   │   ├── scout-alert-bot/       # KPI monitoring & Slack alerts
│   │   ├── azurance/              # Cross-cloud optimization proxy
│   │   ├── memory-sync/           # Persistent agent memory
│   │   └── bugbot/               # AI-powered bug detection
│   └── eslint-config/       # Shared linting configuration
│
├── infra/                   # Infrastructure configuration
│   ├── vercel/              # Vercel deployment config
│   ├── supabase/            # Enhanced database with 15+ tables
│   └── pulser/              # Org-wide pipeline definitions (v3.2)
│
├── scripts/                 # Advanced automation utilities
└── .github/workflows/       # CI/CD matrix builds with AI
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- pnpm 8+
- Task (go-task.github.io)

### Setup
```bash
# Clone and install
git clone <repo-url>
cd ai-agency
pnpm install

# Run health check
task doctor

# Start development (all tenants)
task dev

# Start specific tenant
task dev:tenant TENANT=ces
```

## 👥 Tenant Management

### Create New Tenant
```bash
# Create new client workspace
task create:tenant TENANT=my-client

# Configure environment
cd tenants/my-client
cp .env.sample .env.local
# Edit .env.local with tenant-specific config

# Start development
task dev:tenant TENANT=my-client
```

### Tenant Structure
Each tenant gets:
- **Isolated Next.js app** (`/tenants/{slug}/app/`)
- **Edge functions** (`/tenants/{slug}/edge/`)
- **Pulser pipelines** (`/tenants/{slug}/pulser/`)
- **Database policies** (`/tenants/{slug}/supabase/`)
- **Vercel sub-path** (`/{slug}/`)

## 🛠️ Development

### Available Commands
```bash
# Development
task dev                    # All tenants
task dev:tenant TENANT=ces  # Specific tenant

# Building
task build                  # Everything
task build:tenant TENANT=ces

# Testing
task test                   # All tests
task test:tenant TENANT=ces

# Linting
task lint                   # All code
task lint:fix               # Auto-fix issues

# Type checking
task typecheck              # All TypeScript

# Pulser operations
task pulser:scan            # Duplicate scanning
task pulser:costs           # Cost analysis
```

### Adding Features
1. **Shared functionality** → Add to `packages/`
2. **Tenant-specific** → Add to `tenants/{slug}/`
3. **Infrastructure** → Update `infra/`

## 🔒 Security & Isolation

### Row Level Security (RLS)
- Every database query auto-scoped to tenant
- `tenant_id` automatically injected
- Policies prevent cross-tenant data access

### Environment Isolation
- Tenant-specific environment variables
- API keys scoped per tenant
- Resource limits per tenant

## 📊 Monitoring & Operations

### Cost Tracking
```bash
# Generate cost report
task pulser:costs

# Analyze by tenant
node scripts/collect-costs.js --period=30d
```

### Health Monitoring
- Automated health checks per tenant
- Uptime monitoring
- Performance metrics
- Error tracking

### Duplicate Detection
```bash
# Scan for code duplication
task pulser:scan

# Tenant-specific scan
task pulser:scan:tenant TENANT=ces
```

## 🚀 Deployment

### Vercel Configuration
- **Automatic deployments** on push to main
- **Preview deployments** for PRs
- **Edge function routing** by tenant path
- **Environment variables** per tenant

### CI/CD Pipeline
- **Matrix builds** - one job per changed tenant
- **Shared package testing**
- **Security scanning**
- **Cost analysis**
- **Health checks**

### Production Deployment
```bash
# Deploy to production
task deploy:production

# Deploy preview
task deploy:preview
```

## 🤖 Advanced AI Agent System

### **CES Drive Scraper** (`@ai/ces-drive-scraper`)
- **Automated Google Drive monitoring** for new campaign assets
- **Real-time file processing** with metadata extraction
- **Scheduled scanning** with configurable intervals
- **Integration with campaign pipeline** for asset optimization

### **Scout Alert Bot** (`@ai/scout-alert-bot`)
- **Real-time KPI monitoring** (revenue, transactions, performance)
- **Intelligent threshold detection** with severity levels
- **Slack/Teams integration** for instant notifications
- **Configurable alerting rules** per tenant

### **Azurance Cloud Proxy** (`@ai/azurance`)
- **Azure Advisor integration** for cost optimization
- **Cross-cloud recommendation translation** (Azure → AWS/GCP)
- **Automated cost analysis** with savings projections
- **Multi-cloud optimization strategies**

### **Memory Sync System** (`@ai/memory-sync`)
- **Persistent agent memory** across sessions
- **Cross-agent communication** for collaboration
- **Conversation history** with intelligent archiving
- **Context preservation** for improved AI responses

### **BugBot** (AI-Powered QA)
- **Automated bug detection** using static/dynamic analysis
- **AI-powered fix suggestions** with code snippets
- **Integration with ClickUp** for issue tracking
- **Continuous learning** from resolution patterns

## 🧩 Integration

### Supabase (Enhanced)
- **15+ specialized tables** for agent data
- **Row Level Security** with tenant isolation
- **Real-time subscriptions** for live updates
- **Advanced RLS policies** for multi-tenant security
- **Agent memory storage** with intelligent cleanup

### Pulser v3.2 (Production-Ready)
- **Intelligent LLM routing** (60-80% cost savings)
- **Tenant-scoped pipeline execution**
- **Automated error handling** with escalation
- **CI/CD integration** with GitHub Actions
- **Version management** with semantic release

### Vercel Edge (Optimized)
- **Sub-path routing** (`/ces`, `/scout`, etc.)
- **Edge functions** for real-time processing
- **Global CDN** with intelligent caching
- **Automatic scaling** based on tenant load

## 📝 Configuration

### Environment Variables
```bash
# Global (in Vercel dashboard)
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
PULSER_API_KEY=your_pulser_key

# Per tenant (in tenant .env.local)
TENANT_SLUG=ces
BASE_PATH=/ces
NEXT_PUBLIC_TENANT_NAME="Campaign Effectiveness Suite"
```

### Tenant Configuration
```json
{
  "slug": "ces",
  "name": "Campaign Effectiveness Suite", 
  "settings": {
    "theme": "blue",
    "features": ["analytics", "ai-insights", "reports"],
    "limits": {
      "users": 50,
      "projects": 100
    }
  }
}
```

## 🔧 Troubleshooting

### Common Issues

**Tenant not loading?**
```bash
# Check tenant configuration
task doctor:tenants

# Verify build
task build:tenant TENANT=your-tenant
```

**Database connection issues?**
```bash
# Check RLS policies
supabase logs

# Verify tenant context
SELECT public.get_current_tenant();
```

**Build failures?**
```bash
# Clean and rebuild
task clean
task install:fresh
task build
```

## 📚 Documentation

- **[Architecture Guide](docs/architecture.md)** - System design & patterns
- **[Tenant Guide](docs/tenants.md)** - Creating & managing tenants  
- **[Development Guide](docs/development.md)** - Local development setup
- **[Deployment Guide](docs/deployment.md)** - Production deployment
- **[Security Guide](docs/security.md)** - Security best practices

## 🤝 Contributing

1. **Fork the repository**
2. **Create feature branch** (`git checkout -b feature/amazing-feature`)
3. **Make changes** to relevant tenant or shared package
4. **Add tests** and ensure `task test` passes
5. **Run linting** with `task lint:fix`
6. **Commit changes** (`git commit -m 'Add amazing feature'`)
7. **Push to branch** (`git push origin feature/amazing-feature`)
8. **Open Pull Request**

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Ready to scale your AI agency?** 🚀 Start with `task create:tenant TENANT=your-first-client`