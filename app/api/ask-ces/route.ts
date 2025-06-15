import { NextRequest, NextResponse } from 'next/server';
import { LLMUtils } from '../../../utils/llm';
import { businessEngine } from '../../../tenants/ces/lib/business-outcome-engine';
import fs from 'fs';
import path from 'path';

// Role-based prompt templates
const ROLE_PROMPTS = {
  exec: `You are Ask CES, an executive-focused AI assistant for campaign effectiveness analysis. 
  
  Focus on:
  - ROI and business impact summaries
  - Strategic recommendations with clear action items
  - High-level performance metrics and trends
  - Budget allocation and optimization insights
  - Competitive positioning and market opportunities

  Always provide:
  1. Executive summary (2-3 sentences)
  2. Key metrics with context
  3. Strategic recommendations
  4. Next steps with timeline`,

  strategist: `You are Ask CES, a strategic planning AI assistant for campaign effectiveness.
  
  Focus on:
  - Campaign strategy optimization
  - Audience targeting and segmentation insights
  - Media mix and channel performance
  - Competitive analysis and benchmarking
  - Long-term brand building strategies

  Always provide:
  1. Strategic analysis
  2. Optimization opportunities
  3. Audience insights
  4. Tactical recommendations`,

  creative: `You are Ask CES, a creative-focused AI assistant for campaign effectiveness.
  
  Focus on:
  - Creative performance analysis
  - Visual and messaging effectiveness
  - Emotional resonance and brand connection
  - Creative optimization suggestions
  - Trend identification and inspiration

  Always provide:
  1. Creative performance breakdown
  2. Emotional impact analysis
  3. Optimization suggestions
  4. Creative direction recommendations`,

  analyst: `You are Ask CES, a data-driven AI assistant for campaign effectiveness analysis.
  
  Focus on:
  - Detailed performance metrics and trends
  - Statistical analysis and correlations
  - Attribution modeling insights
  - Predictive analysis and forecasting
  - A/B test results and recommendations

  Always provide:
  1. Detailed metric analysis
  2. Statistical insights
  3. Trend identification
  4. Data-driven recommendations`
};

// Load campaign data helper
const loadCampaignData = () => {
  try {
    const dataPath = '/Users/tbwa/Documents/GitHub/campaign-insight-accelerator/dist';
    
    const campaigns = JSON.parse(fs.readFileSync(path.join(dataPath, 'campaigns.json'), 'utf8'));
    const creativeAssets = JSON.parse(fs.readFileSync(path.join(dataPath, 'creative_assets.json'), 'utf8'));
    
    // Load performance metrics CSV
    const performanceData = fs.readFileSync(path.join(dataPath, 'performance_metrics.csv'), 'utf8');
    const performanceLines = performanceData.split('\n').slice(1);
    const performanceMetrics = performanceLines
      .filter(line => line.trim())
      .map(line => {
        const [metric_id, campaign_id, date, roi, brand_recall, engagement_rate, reach, impressions, clicks, ctr, conversion_rate, cost_per_acquisition, sentiment_score, video_completion_rate, share_rate, save_rate, tenant_id] = line.split(',');
        return {
          metric_id, campaign_id, date,
          roi: parseFloat(roi || '0'),
          brand_recall: parseFloat(brand_recall || '0'),
          engagement_rate: parseFloat(engagement_rate || '0'),
          reach: parseInt(reach || '0'),
          impressions: parseInt(impressions || '0'),
          clicks: parseInt(clicks || '0'),
          ctr: parseFloat(ctr || '0'),
          conversion_rate: parseFloat(conversion_rate || '0'),
          cost_per_acquisition: parseFloat(cost_per_acquisition || '0'),
          sentiment_score: parseFloat(sentiment_score || '0'),
          video_completion_rate: parseFloat(video_completion_rate || '0'),
          share_rate: parseFloat(share_rate || '0'),
          save_rate: parseFloat(save_rate || '0'),
          tenant_id
        };
      });

    return { campaigns, creativeAssets, performanceMetrics };
  } catch (error) {
    console.error('Error loading campaign data:', error);
    return null;
  }
};

// Generate context for LLM based on query
const generateContext = (query: string, role: string, data: any) => {
  const { campaigns, performanceMetrics } = data;
  
  // Get top performing campaigns for context
  const topCampaigns = campaigns.slice(0, 5).map((campaign: any) => {
    const campaignMetrics = performanceMetrics.filter((m: any) => m.campaign_id === campaign.campaign_id);
    const avgROI = campaignMetrics.length > 0 
      ? campaignMetrics.reduce((sum: number, m: any) => sum + m.roi, 0) / campaignMetrics.length 
      : 0;
    
    return {
      name: campaign.name,
      brand: campaign.brand,
      industry: campaign.industry,
      region: campaign.region,
      avgROI: avgROI.toFixed(2),
      totalMetrics: campaignMetrics.length
    };
  });

  // Calculate summary statistics
  const totalCampaigns = campaigns.length;
  const totalMetrics = performanceMetrics.length;
  const avgROI = performanceMetrics.reduce((sum: number, m: any) => sum + m.roi, 0) / performanceMetrics.length;
  const avgEngagement = performanceMetrics.reduce((sum: number, m: any) => sum + m.engagement_rate, 0) / performanceMetrics.length;
  const avgConversion = performanceMetrics.reduce((sum: number, m: any) => sum + m.conversion_rate, 0) / performanceMetrics.length;

  return `
CAMPAIGN EFFECTIVENESS SYSTEM CONTEXT:

Data Overview:
- Total Campaigns: ${totalCampaigns}
- Total Performance Records: ${totalMetrics}
- Average ROI: ${avgROI.toFixed(2)}%
- Average Engagement Rate: ${avgEngagement.toFixed(2)}%
- Average Conversion Rate: ${avgConversion.toFixed(2)}%

Top Performing Campaigns:
${topCampaigns.map((c: any) => `- ${c.name} (${c.brand}): ROI ${c.avgROI}%`).join('\n')}

Available Metrics:
- ROI, Brand Recall, Engagement Rate
- Reach, Impressions, Clicks, CTR
- Conversion Rate, Cost Per Acquisition
- Sentiment Score, Video Completion Rate
- Share Rate, Save Rate

User Query: "${query}"
User Role: ${role}
`;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      query, 
      role = 'analyst', 
      includeContext = true,
      conversationHistory = []
    } = body;

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    // Load campaign data
    const data = loadCampaignData();
    if (!data) {
      return NextResponse.json({ error: 'Failed to load campaign data' }, { status: 500 });
    }

    // Generate role-specific prompt
    const rolePrompt = ROLE_PROMPTS[role as keyof typeof ROLE_PROMPTS] || ROLE_PROMPTS.analyst;
    
    // Generate context
    const context = includeContext ? generateContext(query, role, data) : '';

    // Prepare messages for LLM
    const messages = [
      { role: 'system', content: rolePrompt },
      { role: 'system', content: context },
      ...conversationHistory,
      { role: 'user', content: query }
    ];

    // Call Azure OpenAI
    const response = await LLMUtils.generateResponse(messages, {
      maxTokens: 1000,
      temperature: 0.7,
      stream: false
    });

    // Generate business effectiveness score if query is about specific campaign
    let businessScore = null;
    const campaignMatch = query.toLowerCase().match(/campaign|roi|effectiveness|performance/);
    if (campaignMatch) {
      // Use business engine for additional insights
      const dummyFeatures = {
        value_proposition_clarity: 7.5,
        visual_hierarchy_optimization: 8.0,
        action_oriented_language: 6.5,
        behavioral_targeting_precision: 7.8,
        platform_native_optimization: 8.2
      };
      
      const cesResults = businessEngine.calculateBusinessEffectiveness(
        dummyFeatures,
        {},
        'conversion'
      );
      
      businessScore = {
        totalScore: cesResults.totalScore,
        topOutcome: Object.entries(cesResults.outcomeBreakdown)
          .sort(([,a], [,b]) => (b as number) - (a as number))[0]
      };
    }

    return NextResponse.json({
      response: response.content,
      metadata: {
        role,
        timestamp: new Date().toISOString(),
        businessScore,
        dataStats: {
          totalCampaigns: data.campaigns.length,
          totalMetrics: data.performanceMetrics.length
        }
      }
    });

  } catch (error) {
    console.error('Ask CES API error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const info = searchParams.get('info');

  if (info === 'roles') {
    return NextResponse.json({
      roles: Object.keys(ROLE_PROMPTS),
      description: 'Available role-based prompting modes for Ask CES'
    });
  }

  if (info === 'data') {
    const data = loadCampaignData();
    if (!data) {
      return NextResponse.json({ error: 'Failed to load data' }, { status: 500 });
    }

    return NextResponse.json({
      summary: {
        campaigns: data.campaigns.length,
        metrics: data.performanceMetrics.length,
        brands: [...new Set(data.campaigns.map((c: any) => c.brand))].length,
        industries: [...new Set(data.campaigns.map((c: any) => c.industry))].length
      }
    });
  }

  return NextResponse.json({
    service: 'Ask CES v3.0.0',
    description: 'Role-aware AI assistant for campaign effectiveness analysis',
    endpoints: {
      POST: 'Ask questions with role-based responses',
      GET: 'Service information and data summary'
    },
    usage: {
      roles: ['exec', 'strategist', 'creative', 'analyst'],
      example: {
        query: 'What are the top performing campaigns by ROI?',
        role: 'exec'
      }
    }
  });
}