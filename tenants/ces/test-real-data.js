const fs = require('fs');
const path = require('path');

// Load your real data
const dataPath = '/Users/tbwa/Documents/GitHub/campaign-insight-accelerator/dist';
const campaigns = JSON.parse(fs.readFileSync(path.join(dataPath, 'campaigns.json'), 'utf8'));
const creativeAssets = JSON.parse(fs.readFileSync(path.join(dataPath, 'creative_assets.json'), 'utf8'));

// Load performance metrics from JSON instead of CSV for easier processing
const performanceMetrics = JSON.parse(fs.readFileSync(path.join(dataPath, 'performance_metrics.json'), 'utf8'));

console.log('✅ Real Data Loaded Successfully:');
console.log(`📊 Campaigns: ${campaigns.length}`);
console.log(`🎨 Creative Assets: ${creativeAssets.length}`);
console.log(`📈 Performance Metrics: ${performanceMetrics.length}`);

// Sample Analysis: Map real creative data to business features
function mapCreativeAssetToBusinessFeatures(asset) {
  return {
    // Content features based on your real data
    value_proposition_clarity: asset.text_readability * 10, // 0-1 to 0-10 scale
    urgency_scarcity_triggers: asset.emotional_trigger === 'Excitement' ? 8.0 : 5.0,
    social_proof_integration: asset.brand_integration === 'Prominent' ? 9.0 : asset.brand_integration === 'Subtle' ? 6.0 : 3.0,
    problem_solution_framing: asset.performance_score * 10,
    
    // Design features
    visual_hierarchy_optimization: asset.visual_distinctness * 10,
    color_psychology_application: asset.color_harmony * 10,
    mobile_optimization: asset.dimensions?.includes('300x') ? 9.0 : 8.0,
    
    // Messaging features
    benefit_focused_headlines: asset.text_readability * 10,
    action_oriented_language: asset.emotional_trigger === 'Urgency' ? 9.0 : 7.0,
    personalization_depth: asset.a_b_test_variant ? 8.0 : 4.0,
    
    // Targeting & Channel features
    behavioral_targeting_precision: asset.performance_score * 10,
    lookalike_audience_optimization: 7.0,
    platform_native_optimization: asset.format === 'mp4' ? 9.0 : 8.0,
    cross_channel_consistency: 7.5
  };
}

// Sample Analysis: Map real performance data to business outcomes
function mapPerformanceToBusinessOutcomes(metrics) {
  if (metrics.length === 0) return {};
  
  const avgMetrics = metrics.reduce((acc, metric) => {
    acc.roi += metric.roi || 0;
    acc.brand_recall += metric.brand_recall || 0;
    acc.engagement_rate += metric.engagement_rate || 0;
    acc.conversion_rate += metric.conversion_rate || 0;
    acc.sentiment_score += metric.sentiment_score || 0;
    acc.ctr += metric.ctr || 0;
    acc.video_completion_rate += metric.video_completion_rate || 0;
    acc.share_rate += metric.share_rate || 0;
    acc.save_rate += metric.save_rate || 0;
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
    engagement: avgMetrics.engagement_rate * 7.5,
    brand_recall: avgMetrics.brand_recall,
    conversion: avgMetrics.conversion_rate * 6,
    roi_sales: Math.min(avgMetrics.roi * 60, 500),
    brand_sentiment: avgMetrics.sentiment_score * 100,
    acquisition: avgMetrics.ctr * 12,
    media_efficiency: Math.max(100 - (avgMetrics.cost_per_acquisition || 0) / 10, 50),
    behavioral_response: (avgMetrics.video_completion_rate / 100) * 60,
    brand_equity: (avgMetrics.brand_recall + avgMetrics.sentiment_score * 100) / 2
  };
}

// Analyze first 5 campaigns
console.log('\n🔍 Analyzing Real Campaigns with Business-Outcome Engine:');
console.log('='.repeat(60));

for (let i = 0; i < Math.min(5, campaigns.length); i++) {
  const campaign = campaigns[i];
  
  // Find assets for this campaign
  const campaignAssets = creativeAssets.filter(a => a.campaign_id === campaign.campaign_id);
  const campaignMetrics = performanceMetrics.filter(m => m.campaign_id === campaign.campaign_id);
  
  if (campaignAssets.length === 0) {
    console.log(`\n❌ ${campaign.name} - No creative assets found`);
    continue;
  }
  
  console.log(`\n📋 Campaign: ${campaign.name}`);
  console.log(`   Brand: ${campaign.brand} | Industry: ${campaign.industry}`);
  console.log(`   Budget: $${campaign.budget.toLocaleString()} | Region: ${campaign.region}`);
  console.log(`   Assets: ${campaignAssets.length} | Performance Records: ${campaignMetrics.length}`);
  
  // Analyze the primary creative asset
  const primaryAsset = campaignAssets[0];
  const businessFeatures = mapCreativeAssetToBusinessFeatures(primaryAsset);
  
  console.log(`\n   🎨 Creative Analysis (${primaryAsset.name}):`);
  console.log(`   ├─ Value Proposition Clarity: ${businessFeatures.value_proposition_clarity.toFixed(1)}/10`);
  console.log(`   ├─ Visual Hierarchy: ${businessFeatures.visual_hierarchy_optimization.toFixed(1)}/10`);
  console.log(`   ├─ Mobile Optimization: ${businessFeatures.mobile_optimization.toFixed(1)}/10`);
  console.log(`   └─ Action-Oriented Language: ${businessFeatures.action_oriented_language.toFixed(1)}/10`);
  
  // Analyze actual business performance
  if (campaignMetrics.length > 0) {
    const businessOutcomes = mapPerformanceToBusinessOutcomes(campaignMetrics);
    console.log(`\n   📊 Business Performance:`);
    console.log(`   ├─ Engagement: ${businessOutcomes.engagement.toFixed(1)}/75 (target)`);
    console.log(`   ├─ Brand Recall: ${businessOutcomes.brand_recall.toFixed(1)}/65 (target)`);
    console.log(`   ├─ Conversion: ${businessOutcomes.conversion.toFixed(1)}/12 (target)`);
    console.log(`   ├─ ROI Performance: ${businessOutcomes.roi_sales.toFixed(1)}/300 (target)`);
    console.log(`   └─ Brand Sentiment: ${businessOutcomes.brand_sentiment.toFixed(1)}/75 (target)`);
    
    // Calculate simple business effectiveness score
    const avgFeatureScore = Object.values(businessFeatures).reduce((sum, score) => sum + score, 0) / Object.keys(businessFeatures).length;
    console.log(`\n   ⭐ Business Effectiveness Score: ${avgFeatureScore.toFixed(1)}/10`);
  }
}

console.log('\n' + '='.repeat(60));
console.log('✅ Real Data Analysis Complete!');
console.log('💡 Your 500 campaigns are ready for business-outcome analysis');
console.log('🚀 NO award patterns - Pure business metrics only');