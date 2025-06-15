# Ask CES v3.0.0 - Campaign Effectiveness Intelligence

> AI-Powered, Role-Aware Campaign Analysis Assistant

## 🎯 Overview

Ask CES v3.0.0 is an intelligent AI assistant designed specifically for campaign effectiveness analysis. It provides role-aware responses tailored to executives, strategists, creatives, and analysts, backed by real campaign performance data.

## 🚀 Live Demo

**Production URL**: [https://ces-mvp.vercel.app](https://ces-mvp.vercel.app)

## ✨ Key Features

### 🧠 Role-Aware Intelligence
- **Executive View**: ROI summaries, strategic insights, high-level metrics
- **Strategist View**: Campaign optimization, audience targeting, media mix analysis  
- **Creative View**: Visual performance, messaging effectiveness, brand connection
- **Analyst View**: Detailed metrics, statistical analysis, trend identification

### 🔍 Natural Language Querying
- Ask questions in plain English about campaign performance
- Context-aware responses using real campaign data
- Business effectiveness scoring for strategic insights

### 📊 Real Campaign Data
- 7,000+ real campaign records
- 46,000+ performance metrics
- Multi-brand analysis (P&G, Adidas, Nike, etc.)
- Cross-industry insights

### 🎨 Modern Interface
- Clean, intuitive design
- Real-time conversation flow
- Role-specific example queries
- Feedback system for continuous improvement

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Azure OpenAI GPT-4o
- **Data**: Campaign Insight Accelerator dataset
- **Deployment**: Vercel with edge functions
- **AI**: Role-based prompt engineering, business outcome scoring

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Azure OpenAI API access
- Campaign data files

### Installation

```bash
# Clone the repository
git clone https://github.com/jgtolentino/ai-agency.git
cd ai-agency

# Checkout the CES MVP branch
git checkout ces-mvp

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your Azure OpenAI credentials

# Start development server
npm run dev

# Open browser
open http://localhost:3000/ces
```

### Environment Variables

```env
AZURE_OPENAI_ENDPOINT=your_azure_openai_endpoint
AZURE_OPENAI_API_KEY=your_azure_openai_key
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4o-deployment
```

## 📖 Usage

### Basic Query
```javascript
POST /api/ask-ces
{
  "query": "What are the top performing campaigns by ROI?",
  "role": "exec"
}
```

### Role-Specific Examples

**Executive**: "Show me quarterly ROI performance and budget recommendations"
**Strategist**: "How can we optimize our media mix for better reach?"
**Creative**: "Which visual elements drive the highest engagement?"
**Analyst**: "Analyze correlation between creative features and conversion rates"

## 🏗️ Architecture

### API Structure
```
/api/ask-ces          # Main query endpoint
├── POST              # Submit queries with role context
└── GET               # Service info and data summary
```

### Component Architecture
```
app/ces/              # Main application page
components/ces/       # CES-specific components
├── InsightPanel      # Response display with formatting
├── RoleSelector      # Role switching interface
├── QueryInput       # Natural language input
└── FeedbackBar      # ADR feedback system
```

### Data Flow
1. User selects role and enters query
2. Query sent to `/api/ask-ces` with role context
3. System generates role-specific prompt
4. Azure OpenAI processes query with campaign data context
5. Response formatted and displayed with business scoring
6. Feedback collected for continuous improvement

## 🎨 Role-Specific Features

### Executive Dashboard
- High-level ROI summaries
- Strategic recommendations with timelines
- Budget optimization insights
- Competitive positioning analysis

### Strategist Workbench
- Campaign strategy optimization
- Audience targeting recommendations
- Media mix performance analysis
- Cross-channel attribution insights

### Creative Studio
- Visual performance breakdowns
- Messaging effectiveness scores
- Brand connection analysis
- Creative optimization suggestions

### Analyst Console
- Detailed performance metrics
- Statistical correlation analysis
- Trend identification and forecasting
- A/B test result interpretation

## 📊 Business Effectiveness Engine

Ask CES includes a proprietary business effectiveness scoring system:

- **Engagement Score**: Social interaction and user engagement metrics
- **Brand Recall**: Brand awareness and memorability indicators
- **Conversion Score**: Purchase intent and conversion optimization
- **ROI Performance**: Revenue impact and cost effectiveness

## 🔄 ADR Feedback Loop

The system includes an Adaptive Data Refinement (ADR) feedback mechanism:

1. Users rate response quality (1-5 stars)
2. Optional detailed feedback for improvement areas
3. Role-weighted feedback contributes to model refinement
4. Continuous learning improves response accuracy

## 🚢 Deployment

### Vercel Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to production
vercel --prod --name ces-mvp

# Set environment variables in Vercel dashboard
vercel env add AZURE_OPENAI_ENDPOINT
vercel env add AZURE_OPENAI_API_KEY
vercel env add AZURE_OPENAI_DEPLOYMENT_NAME
```

### Custom Domain Setup

1. Configure DNS to point to Vercel
2. Add domain in Vercel dashboard
3. Update `vercel-ces.json` configuration
4. Redeploy for SSL certificate generation

## 🔧 Configuration

### Ask CES Configuration (`config/ask-ces.yaml`)

```yaml
project: ask-ces
version: 3.0.0
deployment:
  domain: ces-mvp.vercel.app
  cloud: vercel
  environment: production

llm:
  provider: azure-openai
  model: gpt-4o
  context: 16k
  streaming: true

roles:
  - exec
  - strategist  
  - creative
  - analyst

features:
  - ask_api
  - insight_panel
  - creative_vector_engine
  - role_based_prompting
  - artifact_output
  - adr_feedback_loop
```

## 📈 Performance Metrics

- **Response Time**: <1.5s average
- **Uptime**: 99.9% target
- **Query Volume**: 1,000/day capacity
- **User Satisfaction**: 4.5+ star rating target

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

- **Documentation**: See `/config/ask-ces.yaml` for full configuration
- **Issues**: Create GitHub issues for bugs and feature requests
- **Contact**: Technical support via repository discussions

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🏆 Acknowledgments

- Built on the AI Agency monorepo platform
- Powered by Azure OpenAI GPT-4o
- Campaign data from Campaign Insight Accelerator
- UI components inspired by modern design principles

---

**Ask CES v3.0.0** - Revolutionizing campaign effectiveness analysis through AI-powered intelligence.