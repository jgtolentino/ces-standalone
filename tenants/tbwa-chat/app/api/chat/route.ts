import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { ChatMessage, ReasoningTrace, SourceReference } from '@ai/chat-ui';

// This would integrate with your existing Pulser orchestration
interface ChatRequest {
  message: string;
  tenantId: string;
  userId: string;
  history: ChatMessage[];
}

interface PulserResponse {
  content: string;
  reasoning: ReasoningTrace;
  sources: SourceReference[];
  dashboardLink?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { message, tenantId, userId, history } = body;

    // Intent classification - determine what the user is asking about
    const intent = classifyIntent(message);
    
    // Route to appropriate agent/service based on intent
    const response = await routeToAgent(intent, message, tenantId, userId, history);

    // Generate dashboard link if applicable
    const dashboardLink = generateDashboardLink(intent, response, tenantId);

    const assistantMessage: ChatMessage = {
      id: uuidv4(),
      content: response.content,
      role: 'assistant',
      timestamp: new Date(),
      reasoning: response.reasoning,
      sources: response.sources,
      ...(dashboardLink && { dashboardLink }),
      tenantId
    };

    return NextResponse.json(assistantMessage);
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Intent classification - determines which agents/data sources to use
function classifyIntent(message: string): {
  type: 'campaign_analysis' | 'creative_generation' | 'performance_query' | 'retail_insights' | 'general';
  entities: string[];
  confidence: number;
} {
  const lowerMessage = message.toLowerCase();
  
  // Campaign analysis patterns
  if (lowerMessage.includes('ces score') || 
      lowerMessage.includes('campaign performance') ||
      lowerMessage.includes('conversion') ||
      lowerMessage.includes('digital detox')) {
    return {
      type: 'campaign_analysis',
      entities: extractCampaignEntities(message),
      confidence: 0.9
    };
  }
  
  // Creative generation patterns
  if (lowerMessage.includes('generate') || 
      lowerMessage.includes('create') ||
      lowerMessage.includes('ad copy') ||
      lowerMessage.includes('campaign idea')) {
    return {
      type: 'creative_generation',
      entities: extractCreativeEntities(message),
      confidence: 0.85
    };
  }
  
  // Performance/analytics patterns
  if (lowerMessage.includes('trend') || 
      lowerMessage.includes('metrics') ||
      lowerMessage.includes('roi') ||
      lowerMessage.includes('performance')) {
    return {
      type: 'performance_query',
      entities: extractPerformanceEntities(message),
      confidence: 0.8
    };
  }
  
  // Retail insights patterns
  if (lowerMessage.includes('retail') || 
      lowerMessage.includes('sales') ||
      lowerMessage.includes('market') ||
      lowerMessage.includes('scout')) {
    return {
      type: 'retail_insights',
      entities: extractRetailEntities(message),
      confidence: 0.75
    };
  }
  
  return {
    type: 'general',
    entities: [],
    confidence: 0.5
  };
}

// Route to appropriate agent based on intent
async function routeToAgent(
  intent: ReturnType<typeof classifyIntent>,
  message: string,
  tenantId: string,
  userId: string,
  history: ChatMessage[]
): Promise<PulserResponse> {
  
  switch (intent.type) {
    case 'campaign_analysis':
      return await queryCESData(message, intent.entities, tenantId);
    
    case 'retail_insights':
      return await queryScoutData(message, intent.entities, tenantId);
    
    case 'creative_generation':
      return await generateCreativeContent(message, intent.entities, history);
    
    case 'performance_query':
      return await analyzePerformance(message, intent.entities, tenantId);
    
    default:
      return await handleGeneralQuery(message, history);
  }
}

// CES Campaign data integration
async function queryCESData(message: string, entities: string[], tenantId: string): Promise<PulserResponse> {
  // This would call your existing CES Genie Service
  const reasoning: ReasoningTrace = {
    steps: [
      "Identified request for CES campaign data",
      "Extracted campaign entities: " + entities.join(', '),
      "Querying CES database with tenant isolation",
      "Processing campaign metrics and trends",
      "Generating insights with confidence scoring"
    ],
    dataAccess: [
      "CES.campaigns table (tenant: " + tenantId + ")",
      "CES.metrics_daily for trend analysis",
      "CES.conversion_funnels for drop-off analysis"
    ],
    modelUsed: "claude-3.5-sonnet",
    confidence: 0.92
  };

  const sources: SourceReference[] = [
    {
      type: 'dashboard',
      title: 'CES Campaign Dashboard',
      url: '/ces/campaigns'
    },
    {
      type: 'api',
      title: 'CES Metrics API',
      url: '/api/ces/metrics'
    }
  ];

  // Simulate CES data query result
  const content = `Based on CES data analysis, here's what I found:

**Digital Detox Challenge Campaign Performance:**
- **CES Score Trend**: Declined from 85 to 70 over last 7 days (-18%)
- **Primary Drop-off Stage**: Click-through phase (CTR decreased 23%)
- **Platform Performance**: TikTok showing weakness vs. Instagram
- **Recommendation**: Adjust targeting parameters for 18-24 demographic

**Key Insights:**
• Video completion rates are strong (78%) but CTR needs optimization
• Weekend performance significantly better than weekdays
• Micro-influencer content outperforming brand-direct posts by 34%

The data suggests audience fatigue with current creative format. Consider refreshing visual assets.`;

  return { content, reasoning, sources };
}

// Scout retail data integration  
async function queryScoutData(message: string, entities: string[], tenantId: string): Promise<PulserResponse> {
  const reasoning: ReasoningTrace = {
    steps: [
      "Identified retail/market data request",
      "Routing to Scout analytics tenant",
      "Accessing retail transaction data with RLS",
      "Correlating with market trends",
      "Generating retail insights summary"
    ],
    dataAccess: [
      "Scout.retail_transactions (filtered by tenant)",
      "Scout.market_trends regional data",
      "Scout.brand_performance metrics"
    ],
    modelUsed: "claude-3-haiku",
    confidence: 0.87
  };

  const sources: SourceReference[] = [
    {
      type: 'dashboard', 
      title: 'Scout Retail Analytics',
      url: '/scout/retail-dashboard'
    }
  ];

  const content = `**Retail Market Analysis:**

**Category Performance:**
- Health & Wellness segment up 15% QoQ
- Gen Z spending patterns favor authentic/sustainable brands
- Mobile-first purchasing increased 42% in target demographic

**Regional Insights:**
- Urban markets showing higher engagement with wellness messaging
- Social commerce driving 67% of discovery-to-purchase journey

**Competitive Landscape:**
- Direct competitors launching similar wellness campaigns
- Window of opportunity exists in digital detox positioning

**Recommendation**: Focus on mobile-optimized, authenticity-driven creative execution in urban markets.`;

  return { content, reasoning, sources };
}

// Creative generation using Pulser LLM routing
async function generateCreativeContent(message: string, entities: string[], history: ChatMessage[]): Promise<PulserResponse> {
  const reasoning: ReasoningTrace = {
    steps: [
      "Analyzing creative generation request",
      "Reviewing conversation context for brand tone",
      "Accessing TBWA brand guidelines",
      "Using intelligent model router for cost optimization",
      "Generating creative concepts with brand consistency"
    ],
    dataAccess: [
      "TBWA brand guidelines database",
      "Previous campaign creative assets",
      "Brand tone and voice parameters"
    ],
    modelUsed: "claude-3-opus",
    confidence: 0.89
  };

  const sources: SourceReference[] = [
    {
      type: 'document',
      title: 'TBWA Brand Guidelines',
      url: '/docs/brand-guidelines'
    }
  ];

  const content = `**Creative Concepts for Digital Detox Campaign:**

**Instagram Story Copy Options:**
1. "Ready to unplug from the noise? 🌱 Start your #DigitalDetox journey"
2. "Your mind deserves a break. Disconnect to reconnect with yourself ✨"
3. "Stop scrolling. Start living. Join the Digital Detox movement 🧘"

**Visual Theme Suggestions:**
1. **Serene Minimalism**: Clean white spaces, soft nature elements, calming gradients
2. **Human Connection**: Real people in genuine moments without devices
3. **Nature Sanctuary**: Lush environments showcasing peace and tranquility

**Instagram Reel Script:**
*Scene 1*: Quick montage of notification overload
*Scene 2*: Person putting phone away, deep breath
*Scene 3*: Same person engaging in mindful activities
*CTA*: "Start your digital detox today"

**Brand Consistency Notes:**
- Maintains TBWA's progressive, human-centered approach
- Authentic messaging without preaching
- Actionable wellness focus aligned with brand values`;

  return { content, reasoning, sources };
}

// Performance analysis across multiple data sources
async function analyzePerformance(message: string, entities: string[], tenantId: string): Promise<PulserResponse> {
  const reasoning: ReasoningTrace = {
    steps: [
      "Processing performance analysis request",
      "Aggregating data from CES and Scout tenants", 
      "Cross-referencing campaign and retail metrics",
      "Identifying performance patterns and anomalies",
      "Generating actionable recommendations"
    ],
    dataAccess: [
      "Cross-tenant performance aggregation",
      "CES campaign effectiveness data",
      "Scout retail conversion metrics"
    ],
    modelUsed: "claude-3.5-sonnet",
    confidence: 0.94
  };

  const sources: SourceReference[] = [
    {
      type: 'dashboard',
      title: 'Integrated Performance Dashboard', 
      url: '/performance/overview'
    }
  ];

  const content = `**Integrated Performance Analysis:**

**Campaign Effectiveness (CES):**
- Overall campaign health: 73/100
- Engagement trending upward (+12% week-over-week)
- Creative performance varies significantly by platform

**Retail Impact (Scout):**
- Purchase intent correlation: 0.67 with wellness campaigns
- Category lift: +8% in health/wellness purchases
- Brand awareness increased 23% in target demo

**Cross-Platform Performance:**
- Instagram: Strong engagement, moderate conversion
- TikTok: Viral potential, needs optimization
- YouTube: Lower reach, higher quality engagement

**Optimization Opportunities:**
1. Reallocate budget from TikTok to Instagram for immediate ROI
2. Develop longer-form content for YouTube's engaged audience
3. Test micro-influencer partnerships for authenticity boost`;

  return { content, reasoning, sources };
}

// General conversational responses
async function handleGeneralQuery(message: string, history: ChatMessage[]): Promise<PulserResponse> {
  const reasoning: ReasoningTrace = {
    steps: [
      "Classified as general conversational query",
      "Reviewing conversation context",
      "Maintaining TBWA AI assistant persona",
      "Providing helpful guidance within agency context"
    ],
    dataAccess: ["Conversation history context"],
    modelUsed: "claude-3-haiku",
    confidence: 0.75
  };

  const content = `I'm here to help with your campaign development needs! I can assist with:

🎯 **Strategy & Insights**
- Campaign performance analysis 
- Market trend research
- Competitive intelligence

🎨 **Creative Development**  
- Ad copy generation
- Visual concept ideation
- Brand voice consistency

📊 **Data & Analytics**
- CES score tracking
- Retail performance correlation
- ROI optimization

What specific aspect of your campaign would you like to explore?`;

  return { content, reasoning, sources: [] };
}

// Generate dashboard deep-link URLs
function generateDashboardLink(
  intent: ReturnType<typeof classifyIntent>,
  response: PulserResponse,
  tenantId: string
): string | undefined {
  
  switch (intent.type) {
    case 'campaign_analysis':
      return `/ces/campaigns?filter=digital-detox&view=performance&tenant=${tenantId}`;
    
    case 'retail_insights':
      return `/scout/retail-dashboard?category=wellness&period=7d&tenant=${tenantId}`;
    
    case 'performance_query':
      return `/performance/overview?campaigns=all&period=30d&tenant=${tenantId}`;
    
    default:
      return undefined;
  }
}

// Entity extraction helpers
function extractCampaignEntities(message: string): string[] {
  const entities = [];
  if (message.toLowerCase().includes('digital detox')) entities.push('digital-detox');
  if (message.toLowerCase().includes('tiktok')) entities.push('tiktok');
  if (message.toLowerCase().includes('instagram')) entities.push('instagram');
  return entities;
}

function extractCreativeEntities(message: string): string[] {
  const entities = [];
  if (message.toLowerCase().includes('gen z')) entities.push('gen-z');
  if (message.toLowerCase().includes('wellness')) entities.push('wellness');
  return entities;
}

function extractPerformanceEntities(message: string): string[] {
  const entities = [];
  if (message.toLowerCase().includes('roi')) entities.push('roi');
  if (message.toLowerCase().includes('conversion')) entities.push('conversion');
  return entities;
}

function extractRetailEntities(message: string): string[] {
  const entities = [];
  if (message.toLowerCase().includes('sales')) entities.push('sales');
  if (message.toLowerCase().includes('market')) entities.push('market');
  return entities;
}