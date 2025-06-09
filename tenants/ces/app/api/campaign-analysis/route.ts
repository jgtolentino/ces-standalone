import { NextRequest, NextResponse } from 'next/server';
import { businessEngine, BUSINESS_DRIVEN_FEATURES, BUSINESS_OUTCOMES } from '../../../lib/business-outcome-engine';
import fs from 'fs';
import path from 'path';

// Load real campaign data
const loadRealData = () => {
  try {
    const dataPath = '/Users/tbwa/Documents/GitHub/campaign-insight-accelerator/dist';
    
    const campaigns = JSON.parse(fs.readFileSync(path.join(dataPath, 'campaigns.json'), 'utf8'));
    const creativeAssets = JSON.parse(fs.readFileSync(path.join(dataPath, 'creative_assets.json'), 'utf8'));
    
    // Load performance metrics CSV
    const performanceData = fs.readFileSync(path.join(dataPath, 'performance_metrics.csv'), 'utf8');
    const performanceLines = performanceData.split('\n').slice(1); // Skip header
    const performanceMetrics = performanceLines
      .filter(line => line.trim())
      .map(line => {
        const [metric_id, campaign_id, date, roi, brand_recall, engagement_rate, reach, impressions, clicks, ctr, conversion_rate, cost_per_acquisition, sentiment_score, video_completion_rate, share_rate, save_rate, tenant_id] = line.split(',');
        return {
          metric_id: metric_id || '',
          campaign_id: campaign_id || '',
          date: date || '',
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
          tenant_id: tenant_id || ''
        };
      });

    return { campaigns, creativeAssets, performanceMetrics };
  } catch (error) {
    console.error('Error loading real data:', error);
    return null;
  }
};

// Map real creative asset data to business-driven features
const mapCreativeAssetToBusinessFeatures = (asset: any): Record<string, number> => {
  return {
    // Content features
    value_proposition_clarity: asset.text_readability * 10, // 0-1 to 0-10 scale
    urgency_scarcity_triggers: asset.emotional_trigger === 'Excitement' ? 8.0 : 5.0,
    social_proof_integration: asset.brand_integration === 'Prominent' ? 9.0 : asset.brand_integration === 'Subtle' ? 6.0 : 3.0,
    problem_solution_framing: asset.performance_score * 10, // Use performance as proxy
    
    // Design features  
    visual_hierarchy_optimization: asset.visual_distinctness * 10,
    color_psychology_application: asset.color_harmony * 10,
    mobile_optimization: asset.dimensions?.includes('300x') ? 9.0 : asset.dimensions?.includes('728x') ? 7.0 : 8.0, // Mobile-first scoring
    
    // Messaging features
    benefit_focused_headlines: asset.text_readability * 10,
    action_oriented_language: asset.emotional_trigger === 'Urgency' ? 9.0 : asset.emotional_trigger === 'Excitement' ? 7.0 : 5.0,
    personalization_depth: asset.a_b_test_variant ? 8.0 : 4.0, // A/B testing indicates personalization
    
    // Targeting features
    behavioral_targeting_precision: asset.performance_score * 10, // Performance indicates targeting quality
    lookalike_audience_optimization: 7.0, // Default reasonable score
    
    // Channel features
    platform_native_optimization: asset.format === 'mp4' ? 9.0 : asset.format === 'svg' ? 8.0 : 7.0,
    cross_channel_consistency: 7.5 // Default reasonable score
  };
};

// Map real performance metrics to business outcomes
const mapPerformanceToBusinessOutcomes = (metrics: any[]): Record<string, number> => {
  if (metrics.length === 0) return {};
  
  // Average the metrics across all performance records for this campaign
  const avgMetrics = metrics.reduce((acc, metric) => {
    acc.roi += metric.roi;
    acc.brand_recall += metric.brand_recall;
    acc.engagement_rate += metric.engagement_rate;
    acc.conversion_rate += metric.conversion_rate;
    acc.sentiment_score += metric.sentiment_score;
    acc.ctr += metric.ctr;
    acc.video_completion_rate += metric.video_completion_rate;
    acc.share_rate += metric.share_rate;
    acc.save_rate += metric.save_rate;
    return acc;
  }, {
    roi: 0, brand_recall: 0, engagement_rate: 0, conversion_rate: 0,
    sentiment_score: 0, ctr: 0, video_completion_rate: 0, share_rate: 0, save_rate: 0
  });
  
  const count = metrics.length;
  Object.keys(avgMetrics).forEach(key => {
    avgMetrics[key] /= count;
  });
  
  return {
    engagement: avgMetrics.engagement_rate * 7.5, // Scale to match our target ranges
    brand_recall: avgMetrics.brand_recall,
    conversion: avgMetrics.conversion_rate * 6, // Scale up conversion rate
    roi_sales: Math.min(avgMetrics.roi * 60, 500), // Scale ROI to our range
    brand_sentiment: avgMetrics.sentiment_score * 100, // Convert to percentage
    acquisition: avgMetrics.ctr * 12, // Scale CTR to acquisition rate
    media_efficiency: Math.max(100 - (avgMetrics.cost_per_acquisition / 10), 50), // Inverse of cost
    behavioral_response: (avgMetrics.video_completion_rate / 100) * 60, // Scale completion rate
    brand_equity: (avgMetrics.brand_recall + avgMetrics.sentiment_score * 100) / 2 // Combined metric
  };
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const campaignId = searchParams.get('campaignId');
  const limit = parseInt(searchParams.get('limit') || '10');
  const analysisType = searchParams.get('type') || 'summary';
  
  const data = loadRealData();
  if (!data) {
    return NextResponse.json({ error: 'Failed to load campaign data' }, { status: 500 });
  }
  
  const { campaigns, creativeAssets, performanceMetrics } = data;
  
  if (analysisType === 'summary') {
    return NextResponse.json({
      summary: {
        totalCampaigns: campaigns.length,
        totalCreativeAssets: creativeAssets.length,
        totalPerformanceRecords: performanceMetrics.length,
        businessOutcomes: Object.keys(BUSINESS_OUTCOMES).length,
        businessFeatures: BUSINESS_DRIVEN_FEATURES.length,
        industries: [...new Set(campaigns.map((c: any) => c.industry))],
        regions: [...new Set(campaigns.map((c: any) => c.region))],
        brands: [...new Set(campaigns.map((c: any) => c.brand))]
      }
    });
  }
  
  if (campaignId) {
    // Analyze specific campaign
    const campaign = campaigns.find((c: any) => c.campaign_id === campaignId);
    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }
    
    const campaignAssets = creativeAssets.filter((a: any) => a.campaign_id === campaignId);
    const campaignMetrics = performanceMetrics.filter((m: any) => m.campaign_id === campaignId);
    
    if (campaignAssets.length === 0) {
      return NextResponse.json({ error: 'No creative assets found for campaign' }, { status: 404 });
    }
    
    // Analyze the first asset (or average across all assets)
    const primaryAsset = campaignAssets[0];
    const businessFeatureScores = mapCreativeAssetToBusinessFeatures(primaryAsset);
    const realBusinessOutcomes = mapPerformanceToBusinessOutcomes(campaignMetrics);
    
    // Run business effectiveness analysis
    const cesResults = businessEngine.calculateBusinessEffectiveness(
      businessFeatureScores,
      {}, // No custom priorities
      'conversion' // Default objective
    );
    
    return NextResponse.json({
      campaign,
      analysis: {
        businessEffectivenessScore: cesResults.totalScore,
        predictedOutcomes: cesResults.outcomeBreakdown,
        actualOutcomes: realBusinessOutcomes,
        featureScores: businessFeatureScores,
        recommendations: cesResults.businessRecommendations,
        implementationPlan: cesResults.implementationPlan
      },
      assets: campaignAssets.length,
      performanceRecords: campaignMetrics.length
    });
  }
  
  // Return campaign list with basic analysis
  const analyzedCampaigns = campaigns.slice(0, limit).map((campaign: any) => {
    const campaignAssets = creativeAssets.filter((a: any) => a.campaign_id === campaign.campaign_id);
    const campaignMetrics = performanceMetrics.filter((m: any) => m.campaign_id === campaign.campaign_id);
    
    if (campaignAssets.length === 0) {
      return { ...campaign, analysis: null, assets: 0, performanceRecords: campaignMetrics.length };
    }
    
    const primaryAsset = campaignAssets[0];
    const businessFeatureScores = mapCreativeAssetToBusinessFeatures(primaryAsset);
    const realBusinessOutcomes = mapPerformanceToBusinessOutcomes(campaignMetrics);
    
    const cesResults = businessEngine.calculateBusinessEffectiveness(
      businessFeatureScores,
      {},
      'conversion'
    );
    
    return {
      ...campaign,
      analysis: {
        businessEffectivenessScore: cesResults.totalScore,
        topBusinessOutcome: Object.entries(cesResults.outcomeBreakdown)
          .sort(([,a], [,b]) => b - a)[0],
        actualPerformance: {
          roi: campaignMetrics.length > 0 ? campaignMetrics.reduce((sum, m) => sum + m.roi, 0) / campaignMetrics.length : 0,
          engagement: campaignMetrics.length > 0 ? campaignMetrics.reduce((sum, m) => sum + m.engagement_rate, 0) / campaignMetrics.length : 0,
          conversion: campaignMetrics.length > 0 ? campaignMetrics.reduce((sum, m) => sum + m.conversion_rate, 0) / campaignMetrics.length : 0
        }
      },
      assets: campaignAssets.length,
      performanceRecords: campaignMetrics.length
    };
  });
  
  return NextResponse.json({
    campaigns: analyzedCampaigns,
    total: campaigns.length,
    analyzed: analyzedCampaigns.length
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { campaignIds, analysisType = 'batch', businessPriorities = {} } = body;
    
    const data = loadRealData();
    if (!data) {
      return NextResponse.json({ error: 'Failed to load campaign data' }, { status: 500 });
    }
    
    const { campaigns, creativeAssets, performanceMetrics } = data;
    
    if (analysisType === 'batch' && campaignIds) {
      // Batch analysis of multiple campaigns
      const results = campaignIds.map((campaignId: string) => {
        const campaign = campaigns.find((c: any) => c.campaign_id === campaignId);
        if (!campaign) return null;
        
        const campaignAssets = creativeAssets.filter((a: any) => a.campaign_id === campaignId);
        const campaignMetrics = performanceMetrics.filter((m: any) => m.campaign_id === campaignId);
        
        if (campaignAssets.length === 0) return null;
        
        const primaryAsset = campaignAssets[0];
        const businessFeatureScores = mapCreativeAssetToBusinessFeatures(primaryAsset);
        
        const cesResults = businessEngine.calculateBusinessEffectiveness(
          businessFeatureScores,
          businessPriorities,
          'conversion'
        );
        
        return {
          campaignId,
          campaignName: campaign.name,
          brand: campaign.brand,
          businessEffectivenessScore: cesResults.totalScore,
          topRecommendation: cesResults.businessRecommendations[0],
          businessOutcomes: cesResults.outcomeBreakdown
        };
      }).filter(Boolean);
      
      return NextResponse.json({
        batchAnalysis: results,
        summary: {
          totalAnalyzed: results.length,
          averageScore: results.reduce((sum: number, r: any) => sum + r.businessEffectivenessScore, 0) / results.length,
          topPerformers: results
            .sort((a: any, b: any) => b.businessEffectivenessScore - a.businessEffectivenessScore)
            .slice(0, 5)
        }
      });
    }
    
    return NextResponse.json({ error: 'Invalid analysis type or missing campaign IDs' }, { status: 400 });
    
  } catch (error) {
    console.error('Campaign analysis error:', error);
    return NextResponse.json({ error: 'Failed to analyze campaigns' }, { status: 500 });
  }
}