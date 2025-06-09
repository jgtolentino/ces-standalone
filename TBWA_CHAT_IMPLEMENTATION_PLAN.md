# TBWA Chat Interface Implementation Plan

## Executive Summary

This document outlines a comprehensive implementation plan for integrating a TBWA-branded chat interface into the ai-agency monorepo. The chat interface will serve as the primary interaction point for campaign analytics, leveraging existing CES and Scout tenants while providing transparent AI reasoning and source attribution.

## Architecture Overview

```
ai-agency/
├── tenants/
│   └── tbwa-chat/                    # New TBWA Chat tenant
│       ├── app/
│       │   ├── layout.tsx           # TBWA-branded layout
│       │   ├── page.tsx             # Chat interface
│       │   ├── chat/                # Chat components
│       │   ├── dashboard/           # Dashboard views
│       │   └── api/                 # API routes
│       ├── edge/                    # Edge functions
│       ├── pulser/                  # Orchestration
│       └── supabase/                # Database policies
│
├── packages/
│   ├── chat-ui/                     # Shared chat components
│   │   ├── components/
│   │   │   ├── ChatInterface.tsx
│   │   │   ├── MessageList.tsx
│   │   │   ├── ReasoningTrace.tsx
│   │   │   └── SourceAttribution.tsx
│   │   └── hooks/
│   │       ├── useChat.ts
│   │       └── useReasoningTrace.ts
│   │
│   └── agents/
│       └── tbwa-orchestrator/       # TBWA-specific agent
│           ├── src/
│           │   ├── index.ts
│           │   ├── reasoning.ts
│           │   └── routing.ts
│           └── package.json
```

## 1. File Structure & Components

### 1.1 Tenant Structure (`/tenants/tbwa-chat/`)

```typescript
// app/layout.tsx
import { TBWAThemeProvider } from '@ai/chat-ui/theme'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <TBWAThemeProvider>
          {children}
        </TBWAThemeProvider>
      </body>
    </html>
  )
}
```

```typescript
// app/page.tsx
import { ChatInterface } from '@ai/chat-ui/components'
import { DashboardContainer } from './dashboard/DashboardContainer'

export default function HomePage() {
  return (
    <div className="flex h-screen">
      <ChatInterface className="w-1/3" />
      <DashboardContainer className="w-2/3" />
    </div>
  )
}
```

### 1.2 Chat UI Package (`/packages/chat-ui/`)

```typescript
// components/ChatInterface.tsx
import { useChat } from '../hooks/useChat'
import { MessageList } from './MessageList'
import { InputArea } from './InputArea'
import { ReasoningPanel } from './ReasoningPanel'

export function ChatInterface({ className }: { className?: string }) {
  const { messages, sendMessage, reasoning } = useChat()
  
  return (
    <div className={`flex flex-col ${className}`}>
      <MessageList messages={messages} />
      <ReasoningPanel reasoning={reasoning} />
      <InputArea onSend={sendMessage} />
    </div>
  )
}
```

```typescript
// components/ReasoningTrace.tsx
interface ReasoningStep {
  agent: string
  action: string
  reasoning: string
  confidence: number
  sources: string[]
}

export function ReasoningTrace({ steps }: { steps: ReasoningStep[] }) {
  return (
    <div className="space-y-2">
      {steps.map((step, i) => (
        <div key={i} className="border-l-2 border-tbwa-turquoise pl-4">
          <div className="font-semibold">{step.agent}</div>
          <div className="text-sm text-gray-600">{step.reasoning}</div>
          <SourceLinks sources={step.sources} />
        </div>
      ))}
    </div>
  )
}
```

## 2. Integration Points

### 2.1 CES Integration

```typescript
// packages/agents/tbwa-orchestrator/src/integrations/ces.ts
import { CESClient } from '@ai/agents/ces-drive-scraper'

export class CESIntegration {
  private client: CESClient
  
  async getCampaignMetrics(campaignId: string) {
    const metrics = await this.client.fetchCampaignData(campaignId)
    return {
      data: metrics,
      sources: [`ces://campaigns/${campaignId}`],
      reasoning: 'Retrieved campaign effectiveness metrics from CES database'
    }
  }
  
  async analyzeTrends(params: TrendParams) {
    const trends = await this.client.analyzeTrends(params)
    return {
      data: trends,
      visualization: 'line-chart',
      sources: trends.dataSources
    }
  }
}
```

### 2.2 Scout Integration

```typescript
// packages/agents/tbwa-orchestrator/src/integrations/scout.ts
import { ScoutAlertBot } from '@ai/agents/scout-alert-bot'

export class ScoutIntegration {
  private bot: ScoutAlertBot
  
  async getRetailInsights(query: InsightQuery) {
    const insights = await this.bot.queryInsights(query)
    return {
      data: insights,
      alerts: insights.alerts,
      sources: [`scout://insights/${query.id}`],
      reasoning: 'Analyzed retail performance data from Scout'
    }
  }
}
```

### 2.3 Pulser Integration

```typescript
// tenants/tbwa-chat/pulser/pipelines/chat-orchestration.yaml
name: tbwa-chat-orchestration
version: 3.2
tenant: tbwa-chat

stages:
  - name: intent-classification
    type: llm-router
    config:
      model: intelligentRouter
      patterns:
        - campaign_analysis: "campaign|effectiveness|ROI|performance"
        - retail_insights: "retail|store|product|scout"
        - general_query: ".*"
  
  - name: data-retrieval
    type: parallel
    routes:
      - condition: "intent == 'campaign_analysis'"
        agent: ces-integration
      - condition: "intent == 'retail_insights'"
        agent: scout-integration
  
  - name: reasoning-synthesis
    type: llm
    config:
      model: deepseek-coder:6.7b-instruct-q4_K_M
      prompt: |
        Synthesize the following data with clear reasoning:
        {data}
        
        Provide:
        1. Key insights
        2. Supporting evidence
        3. Confidence level
        4. Data sources
```

## 3. API Design

### 3.1 Chat API

```typescript
// tenants/tbwa-chat/app/api/chat/route.ts
import { TBWAOrchestrator } from '@ai/agents/tbwa-orchestrator'
import { createClient } from '@ai/db'

export async function POST(request: Request) {
  const { message, sessionId, context } = await request.json()
  const supabase = createClient()
  const orchestrator = new TBWAOrchestrator()
  
  // Process message with reasoning trace
  const response = await orchestrator.process({
    message,
    sessionId,
    context,
    includeReasoning: true
  })
  
  // Store in chat history
  await supabase.from('chat_messages').insert({
    tenant_id: 'tbwa-chat',
    session_id: sessionId,
    message,
    response: response.message,
    reasoning: response.reasoning,
    sources: response.sources
  })
  
  return Response.json(response)
}
```

### 3.2 Dashboard Linking API

```typescript
// tenants/tbwa-chat/app/api/dashboard/route.ts
export async function POST(request: Request) {
  const { chatResponse, visualizationType } = await request.json()
  
  // Generate dashboard configuration from chat response
  const dashboardConfig = await generateDashboardConfig({
    data: chatResponse.data,
    type: visualizationType,
    filters: chatResponse.filters
  })
  
  return Response.json({
    dashboardId: dashboardConfig.id,
    embedUrl: `/dashboard/${dashboardConfig.id}`,
    interactive: true
  })
}
```

## 4. Security & Tenant Isolation

### 4.1 Row Level Security

```sql
-- tenants/tbwa-chat/supabase/policies/chat_isolation.sql
CREATE POLICY "Isolate TBWA chat messages" ON chat_messages
  FOR ALL USING (tenant_id = 'tbwa-chat');

CREATE POLICY "Isolate TBWA reasoning traces" ON reasoning_traces
  FOR ALL USING (tenant_id = 'tbwa-chat');

-- Sandboxed artifacts
CREATE POLICY "Isolate TBWA artifacts" ON chat_artifacts
  FOR ALL USING (
    tenant_id = 'tbwa-chat' AND
    session_id = current_setting('app.session_id')
  );
```

### 4.2 API Security

```typescript
// tenants/tbwa-chat/edge/middleware.ts
import { verifyJWT } from '@ai/auth'

export async function middleware(request: Request) {
  // Verify tenant access
  const token = request.headers.get('authorization')
  const payload = await verifyJWT(token)
  
  if (payload.tenant !== 'tbwa-chat') {
    return new Response('Unauthorized', { status: 401 })
  }
  
  // Add tenant context
  request.headers.set('X-Tenant-ID', 'tbwa-chat')
  request.headers.set('X-Session-ID', payload.sessionId)
}
```

## 5. UI/UX Implementation

### 5.1 TBWA Branding

```typescript
// packages/chat-ui/theme/tbwa.ts
export const tbwaTheme = {
  colors: {
    primary: '#00B5AD',      // Turquoise
    secondary: '#333333',    // Charcoal
    background: '#FFFFFF',
    surface: '#F5F5F5',
    text: {
      primary: '#333333',
      secondary: '#666666'
    }
  },
  typography: {
    fontFamily: 'Inter, system-ui, sans-serif',
    heading: {
      fontWeight: 700
    }
  },
  components: {
    chat: {
      message: {
        user: {
          background: '#00B5AD',
          color: '#FFFFFF'
        },
        assistant: {
          background: '#F5F5F5',
          color: '#333333'
        }
      }
    }
  }
}
```

### 5.2 Chat Components

```typescript
// packages/chat-ui/components/Message.tsx
interface MessageProps {
  role: 'user' | 'assistant'
  content: string
  reasoning?: ReasoningStep[]
  sources?: string[]
  timestamp: Date
}

export function Message({ role, content, reasoning, sources, timestamp }: MessageProps) {
  return (
    <div className={`message message-${role}`}>
      <div className="message-content">{content}</div>
      {reasoning && (
        <ReasoningAccordion steps={reasoning} />
      )}
      {sources && (
        <SourceList sources={sources} />
      )}
      <time className="message-time">
        {timestamp.toLocaleTimeString()}
      </time>
    </div>
  )
}
```

## 6. Implementation Phases

### Phase 1: Foundation (Week 1-2)
- [ ] Create `tbwa-chat` tenant structure
- [ ] Set up `chat-ui` package with basic components
- [ ] Implement TBWA theme and branding
- [ ] Create basic chat interface

### Phase 2: Integration (Week 3-4)
- [ ] Integrate with CES tenant APIs
- [ ] Integrate with Scout tenant APIs
- [ ] Set up Pulser orchestration pipelines
- [ ] Implement reasoning trace capture

### Phase 3: Dashboard Linking (Week 5-6)
- [ ] Create dashboard generation API
- [ ] Implement artifact sandboxing
- [ ] Build dashboard embedding system
- [ ] Add interactive visualization controls

### Phase 4: Security & Polish (Week 7-8)
- [ ] Implement RLS policies
- [ ] Add session management
- [ ] Create chat history persistence
- [ ] Performance optimization

## 7. Testing Strategy

```typescript
// tenants/tbwa-chat/tests/integration.test.ts
describe('TBWA Chat Integration', () => {
  it('should route campaign queries to CES', async () => {
    const response = await chatAPI.send({
      message: "Show me campaign effectiveness for Q4"
    })
    
    expect(response.sources).toContain('ces://campaigns')
    expect(response.reasoning).toContain('CES')
  })
  
  it('should maintain tenant isolation', async () => {
    const tbwaResponse = await chatAPI.send({
      message: "test",
      tenant: "tbwa-chat"
    })
    
    const otherResponse = await chatAPI.send({
      message: "test",
      tenant: "other-tenant"
    })
    
    expect(tbwaResponse.sessionId).not.toBe(otherResponse.sessionId)
  })
})
```

## 8. Deployment Configuration

```yaml
# tenants/tbwa-chat/vercel.json
{
  "functions": {
    "app/api/chat/route.ts": {
      "maxDuration": 30
    }
  },
  "rewrites": [
    {
      "source": "/tbwa-chat/:path*",
      "destination": "/tenants/tbwa-chat/:path*"
    }
  ]
}
```

## 9. Monitoring & Analytics

```typescript
// tenants/tbwa-chat/edge/analytics.ts
export async function trackChatMetrics(event: ChatEvent) {
  await supabase.from('chat_analytics').insert({
    tenant_id: 'tbwa-chat',
    event_type: event.type,
    session_id: event.sessionId,
    query_intent: event.intent,
    response_time: event.duration,
    data_sources: event.sources,
    timestamp: new Date()
  })
}
```

## 10. Success Criteria

1. **Functional Requirements**
   - Chat interface responds to queries within 3 seconds
   - Reasoning traces visible for all responses
   - Source attribution for all data points
   - Dashboard generation from chat context

2. **Non-Functional Requirements**
   - 99.9% uptime
   - Sub-100ms UI interactions
   - Complete tenant isolation
   - TBWA brand consistency

## Implementation Status

### ✅ Completed Foundation Files
- [x] `/TBWA_CHAT_IMPLEMENTATION_PLAN.md` - Comprehensive implementation plan
- [x] `/tenants/tbwa-chat/package.json` - Tenant package configuration
- [x] `/packages/chat-ui/package.json` - Chat UI package configuration  
- [x] `/packages/agents/tbwa-orchestrator/package.json` - Agent orchestrator package
- [x] `/packages/chat-ui/src/components/ChatInterface.tsx` - Main chat component
- [x] `/packages/chat-ui/src/hooks/useChat.ts` - Chat state management hook
- [x] `/packages/agents/tbwa-orchestrator/src/index.ts` - Core orchestrator logic
- [x] `/tenants/tbwa-chat/app/api/chat/route.ts` - Chat API endpoints
- [x] `/tenants/tbwa-chat/pulser/pipelines/chat-orchestration.yaml` - Pulser pipeline

### 🔄 Next Implementation Steps

#### Phase 1: Foundation Setup (Week 1-2)
```bash
# 1. Install dependencies
cd /Users/tbwa/Documents/GitHub/ai-agency
pnpm install

# 2. Create TBWA tenant
task create:tenant TENANT=tbwa-chat

# 3. Set up chat-ui package
cd packages/chat-ui
pnpm install
pnpm build

# 4. Set up orchestrator agent
cd ../agents/tbwa-orchestrator  
pnpm install
pnpm build

# 5. Configure environment
cd ../../tenants/tbwa-chat
cp .env.sample .env.local
# Edit .env.local with TBWA-specific config
```

#### Phase 2: Integration Development (Week 3-4)
```bash
# 1. Create missing integration files
mkdir -p packages/agents/tbwa-orchestrator/src/integrations
touch packages/agents/tbwa-orchestrator/src/integrations/ces.ts
touch packages/agents/tbwa-orchestrator/src/integrations/scout.ts

# 2. Create remaining chat UI components
mkdir -p packages/chat-ui/src/components
touch packages/chat-ui/src/components/MessageList.tsx
touch packages/chat-ui/src/components/InputArea.tsx
touch packages/chat-ui/src/components/ReasoningPanel.tsx

# 3. Set up database schemas
cd tenants/tbwa-chat/supabase
# Create migration files for chat tables
```

#### Phase 3: Verification & Testing
```bash
# 1. Build verification
cd tenants/tbwa-chat
npm run build
npm run typecheck

# 2. Start development server
npm run dev

# 3. Test chat functionality
curl -X POST http://localhost:3003/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Show campaign performance", "sessionId": "test-123"}'

# 4. Verify tenant isolation
# Check database policies are applied correctly
```

## Database Schema Requirements

```sql
-- Chat sessions table
CREATE TABLE chat_sessions (
  id UUID PRIMARY KEY,
  tenant_id TEXT NOT NULL DEFAULT 'tbwa-chat',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat messages table  
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES chat_sessions(id),
  tenant_id TEXT NOT NULL DEFAULT 'tbwa-chat',
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  sources JSONB,
  reasoning JSONB,
  visualization_data JSONB,
  confidence REAL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat analytics table
CREATE TABLE chat_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL DEFAULT 'tbwa-chat',
  session_id UUID REFERENCES chat_sessions(id),
  event_type TEXT NOT NULL,
  query_length INTEGER,
  response_time INTEGER,
  sources_count INTEGER,
  confidence_score REAL,
  has_visualization BOOLEAN,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security policies
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tbwa_chat_sessions" ON chat_sessions
  FOR ALL USING (tenant_id = 'tbwa-chat');

CREATE POLICY "tbwa_chat_messages" ON chat_messages  
  FOR ALL USING (tenant_id = 'tbwa-chat');

CREATE POLICY "tbwa_chat_analytics" ON chat_analytics
  FOR ALL USING (tenant_id = 'tbwa-chat');
```

## Environment Configuration

```bash
# tenants/tbwa-chat/.env.local
TENANT_SLUG=tbwa-chat
BASE_PATH=/tbwa-chat
NEXT_PUBLIC_TENANT_NAME="TBWA Chat Assistant"
NEXT_PUBLIC_THEME_PRIMARY="#00B5AD"
NEXT_PUBLIC_THEME_SECONDARY="#333333"

# API endpoints
NEXT_PUBLIC_CES_API_URL=${CES_API_URL}
NEXT_PUBLIC_SCOUT_API_URL=${SCOUT_API_URL}
NEXT_PUBLIC_PULSER_API_URL=${PULSER_API_URL}

# Database
SUPABASE_URL=${SUPABASE_URL}
SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
```

## Verification Checklist

### ✅ Pre-deployment Verification
- [ ] All TypeScript files compile without errors
- [ ] Database migrations run successfully  
- [ ] RLS policies prevent cross-tenant access
- [ ] Chat API responds with proper error handling
- [ ] Reasoning traces are captured and returned
- [ ] TBWA branding is applied consistently
- [ ] Pulser pipeline executes without errors

### ✅ Post-deployment Verification  
- [ ] Chat interface loads at `/tbwa-chat`
- [ ] Messages send and receive successfully
- [ ] Reasoning panel displays agent actions
- [ ] Source attribution links work correctly
- [ ] Dashboard generation triggers properly
- [ ] Session persistence works across page reloads
- [ ] Tenant isolation verified in database

### ✅ Integration Testing
- [ ] CES integration returns campaign data
- [ ] Scout integration returns retail insights  
- [ ] Multi-source queries combine data correctly
- [ ] Visualization generation works for numeric data
- [ ] Error handling gracefully manages failures

## Success Metrics

1. **Response Time**: < 3 seconds for typical queries
2. **Accuracy**: > 90% confidence for data-backed responses  
3. **Uptime**: > 99.9% availability
4. **User Satisfaction**: Clear reasoning traces for all responses
5. **Security**: Zero cross-tenant data leaks

## Appendix: Example Interactions

```typescript
// Example 1: Campaign Analysis
User: "Show me campaign performance for our latest product launch"
Assistant: "I found performance data for your recent campaigns. Let me analyze the effectiveness metrics from our CES platform..."

Reasoning Trace:
1. Intent Classifier: Identified "campaign_analysis" intent (confidence: 0.95)
2. CES Integration: Retrieved campaign data for last 30 days (4 campaigns found)
3. Response Synthesizer: Analyzed ROI, CTR, and conversion metrics
4. Visualization Generator: Created line chart showing performance trends

Sources: ces://campaigns/2024-q1, ces://metrics/effectiveness

// Example 2: Retail Insights  
User: "What are the trending products in our retail locations?"
Assistant: "Based on Scout's real-time retail data, I can see several trending products across your store network..."

Reasoning Trace:
1. Intent Classifier: Identified "retail_insights" intent (confidence: 0.89)
2. Scout Integration: Queried product performance data from POS systems
3. Data Analysis: Identified top 10 trending products by sales velocity
4. Visualization Generator: Created bar chart of product performance

Sources: scout://products/trending, scout://sales/velocity

// Example 3: Cross-Platform Analysis
User: "How do our digital campaigns correlate with in-store sales?"
Assistant: "Excellent question! I'll analyze the relationship between your digital campaign performance and retail sales data..."

Reasoning Trace:
1. Intent Classifier: Identified "cross_platform" intent (confidence: 0.92)
2. Multi-Source Integration: Retrieved data from both CES and Scout
3. Correlation Analysis: Found 78% correlation between digital reach and store traffic
4. Insight Synthesis: Identified key campaign-to-sales attribution patterns

Sources: ces://campaigns/digital, scout://sales/attribution, analytics://correlation
```