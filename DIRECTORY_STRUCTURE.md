# 🏗️ AI Agency - Directory Structure

> **AI-Powered Campaign Effectiveness & Agent Orchestration Platform**

## 📁 Core Application Structure

```
ai-agency/
├── app/                           # Next.js App Router
│   ├── api/                       # API Routes
│   │   ├── analytics/             # Analytics endpoints
│   │   ├── ask-ces/               # ✨ CES AI agent (v3.0.0)
│   │   ├── ask-scout/             # 🔍 Scout AI agent
│   │   ├── campaign-analysis/     # 📊 Campaign analysis
│   │   ├── campaign-analytics/    # 📈 Campaign metrics
│   │   ├── campaigns/             # 🎯 Campaign management
│   │   ├── creative-analysis/     # 🎨 Creative insights
│   │   └── health/                # ⚡ Health checks
│   ├── ces/                       # 🧠 CES dashboard page
│   ├── creative-analyzer/         # 🎨 Creative analysis UI
│   ├── real-campaigns/            # 📊 Real campaign data
│   ├── vibe/                      # 🌟 Vibe analysis
│   ├── layout.tsx                 # 🏠 Root layout
│   └── page.tsx                   # 🏁 Home page (redirects to CES)
│
├── components/                    # ⚛️ React Components
│   ├── ces/                       # 🧠 CES-specific components
│   ├── scout/                     # 🔍 Scout dashboard components
│   ├── ui/                        # 🎛️ Shared UI components
│   │   ├── badge.tsx              # 🏷️ Badge component
│   │   ├── button.tsx             # 🔘 Button component
│   │   ├── card.tsx               # 🃏 Card component
│   │   └── input.tsx              # 📝 Input component
│   └── AskCES.tsx                 # 🤖 Main CES component
│
├── lib/                           # 📚 Core Libraries
│   ├── utils.ts                   # 🛠️ Utility functions (cn, etc.)
│   └── types.ts                   # 📋 TypeScript types
│
└── utils/                         # 🔧 Utility Functions
    ├── business-outcome-engine.ts # 💼 Business logic engine
    ├── llm.ts                     # 🧠 LLM integration utilities
    └── prompting/                 # 💬 AI prompting system
```

## 🚀 Infrastructure & Configuration

```
├── infra/                         # 🏗️ Infrastructure configs
│   ├── azure/                     # ☁️ Azure Key Vault
│   ├── supabase/                  # 🗄️ Database & migrations
│   └── vercel/                    # 🚀 Deployment config
│
├── config/                        # ⚙️ Application configs
│   ├── ask-ces.yaml              # 🧠 CES agent config
│   └── scout-dashboard.yaml       # 🔍 Scout config
│
├── scripts/                       # 🤖 Automation scripts
│   ├── deployment-verification.js # ✅ Deployment checks
│   ├── integration-analyzer.js    # 🔗 Integration analysis
│   └── qa/                        # 🧪 Quality assurance
│
└── Configuration Files            # 📄 Core configs
    ├── package.json               # 📦 Dependencies & scripts
    ├── next.config.js             # ⚡ Next.js configuration
    ├── tailwind.config.ts         # 🎨 Tailwind CSS config
    ├── tsconfig.json              # 📘 TypeScript config
    ├── vercel.json                # 🚀 Vercel deployment
    └── postcss.config.js          # 🎨 PostCSS config
```

## 🤖 AI Agent System

```
├── modules/dev-platform-local/    # 💻 Local development platform
│   ├── agents/                    # 🤖 Agent definitions
│   ├── rules/                     # 📋 Agent behavior rules
│   └── tools/                     # 🛠️ Development tools
│
├── rules/                         # 🎯 Agent orchestration rules
│   ├── 1-agent-roles-and-goals.mdc
│   ├── 2-structured-io-design.mdc
│   ├── 3-deployment-verification.mdc
│   └── 4-quality-assurance.mdc
│
├── pulser/                        # 🔄 Pulser orchestration
│   ├── agents/                    # 🤖 Agent configurations
│   └── pipelines/                 # 🚰 Processing pipelines
│
└── skr/                          # 📊 SKR configurations
    └── agent-configs/             # ⚙️ Agent settings
```

## 📊 Documentation & Reports

```
├── reports/                       # 📈 Analysis reports
│   ├── deployment-analysis.md     # 🚀 Deployment status
│   ├── integration-report.md      # 🔗 Integration analysis
│   └── qa-validation.md           # ✅ Quality assurance
│
├── Documentation/                 # 📚 Project documentation
│   ├── DEPLOYMENT_GUIDE.md        # 🚀 Deployment instructions
│   ├── API_DOCUMENTATION.md       # 📡 API reference
│   ├── AGENT_ARCHITECTURE.md      # 🏗️ Agent system design
│   └── INTEGRATION_GUIDE.md       # 🔗 Integration tutorials
│
└── Deployment Scripts/            # 🤖 Deployment automation
    ├── deploy.sh                  # 🚀 Main deployment script
    ├── verify-deployment.sh       # ✅ Deployment verification
    └── rollback.sh                # ↩️ Rollback procedures
```

## 🎯 Key Features by Module

### 🧠 **Ask CES v3.0.0** (`/app/ces/`)
- **Role-aware AI assistant** (Exec, Strategist, Creative, Analyst)
- **Campaign effectiveness analysis** with business outcome scoring
- **Natural language queries** with context-aware responses
- **Real-time insights** from campaign performance data

### 🔍 **Scout Dashboard** (`/app/scout/`)
- **Retail analytics** and market intelligence
- **Brand performance monitoring** across regions
- **Consumer behavior insights** and trend analysis
- **Competitive intelligence** and benchmarking

### 🎨 **Creative Analyzer** (`/app/creative-analyzer/`)
- **Creative performance analysis** using AI
- **Visual hierarchy optimization** suggestions
- **Emotional resonance scoring** for brand connection
- **Creative trend identification** and recommendations

### 🤖 **Agent Orchestration** (`/modules/`)
- **Multi-agent coordination** with intelligent routing
- **Local development platform** for agent testing
- **Rule-based behavior** with adaptive learning
- **Integration APIs** for external tool connectivity

## 🚀 Deployment Status

| Component | Status | URL |
|-----------|--------|-----|
| **Ask CES v3.0.0** | ✅ **LIVE** | [ai-agency-sage.vercel.app/ces](https://ai-agency-sage.vercel.app/ces) |
| **API Endpoints** | ✅ **ACTIVE** | [/api/ask-ces](https://ai-agency-sage.vercel.app/api/ask-ces) |
| **Creative Analyzer** | ✅ **DEPLOYED** | [/creative-analyzer](https://ai-agency-sage.vercel.app/creative-analyzer) |
| **Agent System** | 🔄 **DEVELOPMENT** | Local platform active |

## 📋 Tech Stack

- **Frontend:** Next.js 14, React, TypeScript, TailwindCSS
- **Backend:** Node.js, API Routes, Serverless Functions
- **AI/ML:** Azure OpenAI, GPT-4o, Role-based Prompting
- **Database:** Supabase, PostgreSQL, Campaign Data Store
- **Deployment:** Vercel, Azure Integration, Multi-cloud
- **Development:** Local Agent Platform, Pulser Orchestration

---

**Last Updated:** June 16, 2025  
**Version:** Ask CES v3.0.0  
**Status:** Production Ready ✅