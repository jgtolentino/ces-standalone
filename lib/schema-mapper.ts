/**
 * Schema Mapper for Scout & CES Cross-Agent Integration
 * Maps normalized consumer behavior signals from Scout analytics to CES prompt targeting
 * Enables full signal reuse between Scout's consumer behavior model and CES creative targeting
 */

import { Campaign, CampaignPerformanceMetrics, CreativeFeatureScores, BusinessOutcomeScores } from './types';

// Scout Analytics Schema Types
export interface ScoutConsumerProfile {
  // Demographics (from Scout transactions)
  age_group: '12-19' | '20-35' | '36-50' | '51-65' | '65+';
  gender: 'male' | 'female' | 'other';
  location: {
    region: string;
    province: string;
    city: string;
    barangay?: string;
  };
  
  // Behavioral Signals (from ADLS2/transaction patterns)
  purchase_frequency: 'high' | 'medium' | 'low';
  average_basket_size: number;
  price_sensitivity: 'high' | 'medium' | 'low';
  brand_loyalty: number; // 0-1 score
  category_preferences: string[];
  channel_preference: 'physical' | 'digital' | 'hybrid';
  
  // Temporal Patterns
  peak_shopping_times: string[];
  seasonal_behavior: Record<string, number>;
  
  // Derived Insights
  customer_lifetime_value: number;
  churn_risk: number; // 0-1 score
  segment: 'premium' | 'value' | 'mainstream' | 'explorer';
}

// CES Campaign Schema Types (Enhanced)
export interface CESCampaignContext {
  campaign_id: string;
  name: string;
  brand: string;
  industry: string;
  type: string; // Campaign type from CSV
  channel: string;
  budget: number;
  spent?: number; // Missing in CSV, calculated from performance
  region: string;
  start_date: string;
  end_date: string;
  status: 'Active' | 'Paused' | 'Planning' | 'Completed';
  tenant_id: string;
  target_outcomes: BusinessOutcome[];
  current_performance?: CampaignPerformanceMetrics;
  // Calculated fields from performance metrics
  calculated_roi?: number;
  calculated_reach?: number;
  calculated_impressions?: number;
  calculated_clicks?: number;
  calculated_ctr?: number;
}

export interface BusinessOutcome {
  type: 'engagement' | 'conversion' | 'brand_recall' | 'efficiency' | 'behavioral';
  priority: 'high' | 'medium' | 'low';
  target_value: number;
}

// Normalized Cross-Agent Schema
export interface NormalizedConsumerSignal {
  // Demographics (normalized across both systems)
  demographics: {
    age_group: string;
    gender: string;
    location_hierarchy: {
      region: string;
      province?: string;
      city?: string;
    };
  };
  
  // Behavioral Profile (enriched from Scout, used by CES)
  behavior: {
    engagement_level: 'high' | 'medium' | 'low';
    purchase_intent: number; // 0-1 score
    brand_affinity: number; // 0-1 score
    price_sensitivity: 'high' | 'medium' | 'low';
    channel_preference: string[];
    category_interests: string[];
  };
  
  // Contextual Signals (time-aware, location-aware)
  context: {
    shopping_momentum: number; // Recent activity score
    seasonal_relevance: number; // Current season alignment
    local_trends: string[]; // Regional trending categories
    competitive_exposure: number; // Brand competition level
  };
  
  // Targeting Precision (for CES prompt generation)
  targeting: {
    message_resonance_factors: string[];
    creative_preferences: string[];
    optimal_touchpoints: string[];
    urgency_triggers: string[];
  };
}

// CES-specific prompt enhancement data
export interface CESPromptEnhancement {
  consumer_insights: {
    primary_motivations: string[];
    pain_points: string[];
    aspirations: string[];
    decision_factors: string[];
  };
  
  creative_direction: {
    recommended_messaging: string[];
    visual_preferences: string[];
    emotional_triggers: string[];
    format_optimization: string[];
  };
  
  targeting_optimization: {
    precision_targeting: string[];
    lookalike_expansion: string[];
    behavioral_triggers: string[];
    timing_recommendations: string[];
  };
}

// Enhanced Creative Asset Interface (matching CSV data)
export interface CESCreativeAsset {
  asset_id: string;
  campaign_id: string;
  name: string;
  type: 'video' | 'image' | 'audio' | 'document';
  format: string; // mp4, jpg, png, etc.
  size_mb: number;
  dimensions?: string; // e.g., "1920x1080"
  duration_seconds?: number;
  emotional_trigger: string; // "Excitement", "Urgency", etc.
  brand_integration: 'Prominent' | 'Subtle' | 'Minimal';
  visual_distinctness: number; // 0-1 score
  text_readability: number; // 0-1 score  
  color_harmony: number; // 0-1 score
  performance_score: number; // 0-1 overall score
  a_b_test_variant?: string;
  tenant_id: string;
  created_at: string;
}

// Data reconciliation utilities
export interface DataReconciliation {
  csv_to_db_mapping: Record<string, string>;
  missing_in_db: string[];
  missing_in_csv: string[];
  calculated_fields: string[];
}

/**
 * Core Schema Mapper Class (Enhanced)
 */
export class SchemaMapper {

  /**
   * Reconciles CSV data with database schema
   */
  static getDataReconciliation(): DataReconciliation {
    return {
      csv_to_db_mapping: {
        'name': 'campaign_name',
        'type': 'campaign_type', 
        'region': 'target_region',
        'created_at': 'created_at'
      },
      missing_in_db: [
        'industry', 'type', 'region', 'start_date', 'end_date'
      ],
      missing_in_csv: [
        'spent', 'roi', 'reach', 'conversions', 'impressions', 
        'clicks', 'ctr', 'cpm', 'cpc', 'channel', 'created_by', 'updated_at'
      ],
      calculated_fields: [
        'calculated_roi', 'calculated_reach', 'calculated_impressions',
        'calculated_clicks', 'calculated_ctr'
      ]
    };
  }

  /**
   * Enhances CSV campaign data with calculated performance metrics
   */
  static enhanceCampaignWithMetrics(
    csvCampaign: any, 
    performanceMetrics: any[]
  ): CESCampaignContext {
    const campaignMetrics = performanceMetrics.filter(m => m.campaign_id === csvCampaign.campaign_id);
    
    // Calculate aggregated metrics
    const totalMetrics = campaignMetrics.length;
    const calculated = totalMetrics > 0 ? {
      calculated_roi: campaignMetrics.reduce((sum, m) => sum + (m.roi || 0), 0) / totalMetrics,
      calculated_reach: campaignMetrics.reduce((sum, m) => sum + (m.reach || 0), 0),
      calculated_impressions: campaignMetrics.reduce((sum, m) => sum + (m.impressions || 0), 0),
      calculated_clicks: campaignMetrics.reduce((sum, m) => sum + (m.clicks || 0), 0),
      calculated_ctr: campaignMetrics.reduce((sum, m) => sum + (m.ctr || 0), 0) / totalMetrics,
    } : {};

    return {
      campaign_id: csvCampaign.campaign_id,
      name: csvCampaign.name,
      brand: csvCampaign.brand,
      industry: csvCampaign.industry,
      type: csvCampaign.type,
      channel: this.inferChannelFromType(csvCampaign.type),
      budget: csvCampaign.budget,
      spent: calculated.calculated_reach ? calculated.calculated_reach * 0.1 : undefined, // Estimate
      region: csvCampaign.region,
      start_date: csvCampaign.start_date,
      end_date: csvCampaign.end_date,
      status: csvCampaign.status,
      tenant_id: csvCampaign.tenant_id,
      target_outcomes: this.inferTargetOutcomes(csvCampaign.type),
      ...calculated
    };
  }
  
  /**
   * Maps Scout consumer profiles to normalized signals
   */
  static mapScoutToNormalized(scoutProfile: ScoutConsumerProfile): NormalizedConsumerSignal {
    return {
      demographics: {
        age_group: scoutProfile.age_group,
        gender: scoutProfile.gender,
        location_hierarchy: {
          region: scoutProfile.location.region,
          province: scoutProfile.location.province,
          city: scoutProfile.location.city,
        },
      },
      
      behavior: {
        engagement_level: this.mapFrequencyToEngagement(scoutProfile.purchase_frequency),
        purchase_intent: this.calculatePurchaseIntent(scoutProfile),
        brand_affinity: scoutProfile.brand_loyalty,
        price_sensitivity: scoutProfile.price_sensitivity,
        channel_preference: [scoutProfile.channel_preference],
        category_interests: scoutProfile.category_preferences,
      },
      
      context: {
        shopping_momentum: this.calculateShoppingMomentum(scoutProfile),
        seasonal_relevance: this.calculateSeasonalRelevance(scoutProfile),
        local_trends: this.extractLocalTrends(scoutProfile),
        competitive_exposure: this.assessCompetitiveExposure(scoutProfile),
      },
      
      targeting: {
        message_resonance_factors: this.identifyMessageFactors(scoutProfile),
        creative_preferences: this.deriveCreativePreferences(scoutProfile),
        optimal_touchpoints: this.identifyTouchpoints(scoutProfile),
        urgency_triggers: this.identifyUrgencyTriggers(scoutProfile),
      },
    };
  }

  /**
   * Generates CES prompt enhancements from normalized signals
   */
  static generateCESPromptEnhancement(
    signal: NormalizedConsumerSignal,
    campaignContext: CESCampaignContext
  ): CESPromptEnhancement {
    
    const locationString = `${signal.demographics.gender}, ${signal.demographics.age_group}, ${signal.demographics.location_hierarchy.region}`;
    
    return {
      consumer_insights: {
        primary_motivations: this.generateMotivations(signal, campaignContext),
        pain_points: this.generatePainPoints(signal, campaignContext),
        aspirations: this.generateAspirations(signal, campaignContext),
        decision_factors: this.generateDecisionFactors(signal, campaignContext),
      },
      
      creative_direction: {
        recommended_messaging: this.generateMessaging(signal, campaignContext),
        visual_preferences: this.generateVisualPreferences(signal, campaignContext),
        emotional_triggers: this.generateEmotionalTriggers(signal, campaignContext),
        format_optimization: this.generateFormatOptimization(signal, campaignContext),
      },
      
      targeting_optimization: {
        precision_targeting: [
          `Primary: ${locationString}`,
          `Segment: ${signal.behavior.engagement_level} engagement, ${signal.behavior.price_sensitivity} price sensitivity`,
          `Context: ${signal.context.shopping_momentum > 0.7 ? 'High' : 'Medium'} shopping momentum`,
        ],
        lookalike_expansion: this.generateLookalikeExpansion(signal, campaignContext),
        behavioral_triggers: signal.targeting.urgency_triggers,
        timing_recommendations: this.generateTimingRecommendations(signal, campaignContext),
      },
    };
  }

  /**
   * Creates a complete CES prompt with behavioral injection
   */
  static createEnhancedCESPrompt(
    baseQuery: string,
    enhancement: CESPromptEnhancement,
    role: string = 'strategist'
  ): string {
    
    const consumerContext = `
CONSUMER BEHAVIORAL CONTEXT:
Primary Motivations: ${enhancement.consumer_insights.primary_motivations.join(', ')}
Key Pain Points: ${enhancement.consumer_insights.pain_points.join(', ')}
Decision Factors: ${enhancement.consumer_insights.decision_factors.join(', ')}

CREATIVE DIRECTION INSIGHTS:
Recommended Messaging: ${enhancement.creative_direction.recommended_messaging.join(', ')}
Emotional Triggers: ${enhancement.creative_direction.emotional_triggers.join(', ')}
Visual Preferences: ${enhancement.creative_direction.visual_preferences.join(', ')}

TARGETING OPTIMIZATION:
Precision Targeting: ${enhancement.targeting_optimization.precision_targeting.join(' | ')}
Behavioral Triggers: ${enhancement.targeting_optimization.behavioral_triggers.join(', ')}
`;

    return `${baseQuery}

${consumerContext}

Based on these behavioral signals from Scout analytics, provide ${role}-focused recommendations that leverage these consumer insights for maximum campaign effectiveness.`;
  }

  /**
   * Processes Scout query results for CES integration
   */
  static processScoutQueryForCES(
    scoutQuery: string,
    scoutResults: any,
    targetDemographic: string
  ): { normalizedSignal: NormalizedConsumerSignal; cesContext: string } {
    
    // Parse target demographic (e.g., "Female, 12-19, Surigao")
    const [gender, ageGroup, location] = targetDemographic.split(', ').map(s => s.trim());
    
    // Create normalized profile from Scout results
    const mockScoutProfile: ScoutConsumerProfile = {
      age_group: ageGroup as any,
      gender: gender.toLowerCase() as any,
      location: {
        region: location,
        province: location,
        city: location,
      },
      purchase_frequency: this.inferFrequencyFromResults(scoutResults),
      average_basket_size: scoutResults?.averageBasketSize || 250,
      price_sensitivity: this.inferPriceSensitivity(scoutResults),
      brand_loyalty: scoutResults?.brandLoyalty || 0.6,
      category_preferences: scoutResults?.topCategories || ['beverages', 'snacks'],
      channel_preference: 'hybrid',
      peak_shopping_times: ['weekend', 'evening'],
      seasonal_behavior: {},
      customer_lifetime_value: scoutResults?.clv || 5000,
      churn_risk: 0.3,
      segment: this.determineSegment(scoutResults),
    };

    const normalizedSignal = this.mapScoutToNormalized(mockScoutProfile);
    
    const cesContext = `
Scout Analytics Context for ${targetDemographic}:
- Purchase Behavior: ${mockScoutProfile.purchase_frequency} frequency, ₱${mockScoutProfile.average_basket_size} avg basket
- Brand Affinity: ${(mockScoutProfile.brand_loyalty * 100).toFixed(0)}% loyalty score
- Price Sensitivity: ${mockScoutProfile.price_sensitivity}
- Preferred Categories: ${mockScoutProfile.category_preferences.join(', ')}
- Customer Segment: ${mockScoutProfile.segment}
- Regional Context: ${location} market dynamics
`;

    return { normalizedSignal, cesContext };
  }

  // Helper methods for behavioral signal processing
  private static mapFrequencyToEngagement(frequency: string): 'high' | 'medium' | 'low' {
    switch (frequency) {
      case 'high': return 'high';
      case 'medium': return 'medium';
      default: return 'low';
    }
  }

  private static calculatePurchaseIntent(profile: ScoutConsumerProfile): number {
    const frequencyScore = profile.purchase_frequency === 'high' ? 0.8 : 
                          profile.purchase_frequency === 'medium' ? 0.6 : 0.4;
    const loyaltyBonus = profile.brand_loyalty * 0.3;
    const clvFactor = Math.min(profile.customer_lifetime_value / 10000, 0.3);
    
    return Math.min(frequencyScore + loyaltyBonus + clvFactor, 1.0);
  }

  private static calculateShoppingMomentum(profile: ScoutConsumerProfile): number {
    // Mock calculation based on purchase frequency and CLV
    const baseScore = profile.purchase_frequency === 'high' ? 0.8 : 
                     profile.purchase_frequency === 'medium' ? 0.6 : 0.4;
    const recencyBonus = (1 - profile.churn_risk) * 0.3;
    
    return Math.min(baseScore + recencyBonus, 1.0);
  }

  private static calculateSeasonalRelevance(profile: ScoutConsumerProfile): number {
    // Current season relevance (mock)
    return 0.7;
  }

  private static extractLocalTrends(profile: ScoutConsumerProfile): string[] {
    const regionTrends: Record<string, string[]> = {
      'NCR': ['premium beverages', 'convenience foods', 'health supplements'],
      'Visayas': ['local brands', 'traditional snacks', 'family packs'],
      'Mindanao': ['tropical fruits', 'local delicacies', 'bulk purchases'],
    };
    
    return regionTrends[profile.location.region] || ['regional preferences'];
  }

  private static assessCompetitiveExposure(profile: ScoutConsumerProfile): number {
    // Mock competitive exposure based on segment
    const segmentExposure: Record<string, number> = {
      'premium': 0.8,
      'mainstream': 0.9,
      'value': 0.6,
      'explorer': 0.7,
    };
    
    return segmentExposure[profile.segment] || 0.7;
  }

  private static identifyMessageFactors(profile: ScoutConsumerProfile): string[] {
    const factors: string[] = [];
    
    if (profile.price_sensitivity === 'high') factors.push('value-focused messaging');
    if (profile.brand_loyalty > 0.7) factors.push('brand heritage emphasis');
    if (profile.purchase_frequency === 'high') factors.push('convenience messaging');
    
    return factors.length > 0 ? factors : ['quality emphasis'];
  }

  private static deriveCreativePreferences(profile: ScoutConsumerProfile): string[] {
    const agePreferences: Record<string, string[]> = {
      '12-19': ['dynamic visuals', 'social media native', 'trend-forward'],
      '20-35': ['lifestyle integration', 'mobile-first', 'authentic moments'],
      '36-50': ['family-focused', 'practical benefits', 'trusted sources'],
      '51-65': ['clear messaging', 'traditional formats', 'value emphasis'],
      '65+': ['simple visuals', 'large text', 'familiar brands'],
    };
    
    return agePreferences[profile.age_group] || ['universal appeal'];
  }

  private static identifyTouchpoints(profile: ScoutConsumerProfile): string[] {
    const touchpoints: string[] = [];
    
    if (profile.channel_preference === 'digital') touchpoints.push('social media', 'mobile apps');
    if (profile.channel_preference === 'physical') touchpoints.push('in-store displays', 'print media');
    if (profile.channel_preference === 'hybrid') touchpoints.push('omnichannel', 'integrated campaigns');
    
    return touchpoints;
  }

  private static identifyUrgencyTriggers(profile: ScoutConsumerProfile): string[] {
    const triggers: string[] = [];
    
    if (profile.price_sensitivity === 'high') triggers.push('limited-time offers', 'discount alerts');
    if (profile.purchase_frequency === 'high') triggers.push('stock alerts', 'new product launches');
    if (profile.churn_risk > 0.5) triggers.push('loyalty rewards', 'win-back offers');
    
    return triggers;
  }

  // CES Enhancement Generation Methods
  private static generateMotivations(signal: NormalizedConsumerSignal, context: CESCampaignContext): string[] {
    const motivations: string[] = [];
    
    if (signal.behavior.price_sensitivity === 'high') motivations.push('cost savings', 'value optimization');
    if (signal.behavior.engagement_level === 'high') motivations.push('product discovery', 'brand connection');
    if (signal.context.shopping_momentum > 0.7) motivations.push('immediate satisfaction', 'convenience');
    
    return motivations.length > 0 ? motivations : ['product benefits', 'lifestyle enhancement'];
  }

  private static generatePainPoints(signal: NormalizedConsumerSignal, context: CESCampaignContext): string[] {
    const painPoints: string[] = [];
    
    if (signal.behavior.price_sensitivity === 'high') painPoints.push('budget constraints', 'value uncertainty');
    if (signal.context.competitive_exposure > 0.8) painPoints.push('choice overload', 'brand confusion');
    if (signal.demographics.location_hierarchy.region !== 'NCR') painPoints.push('product availability', 'delivery delays');
    
    return painPoints.length > 0 ? painPoints : ['decision complexity', 'time constraints'];
  }

  private static generateAspirations(signal: NormalizedConsumerSignal, context: CESCampaignContext): string[] {
    const aspirations: string[] = [];
    
    if (signal.demographics.age_group === '12-19') aspirations.push('social acceptance', 'trend leadership');
    if (signal.demographics.age_group === '20-35') aspirations.push('lifestyle optimization', 'personal growth');
    if (signal.demographics.age_group === '36-50') aspirations.push('family well-being', 'security');
    
    return aspirations.length > 0 ? aspirations : ['quality of life', 'satisfaction'];
  }

  private static generateDecisionFactors(signal: NormalizedConsumerSignal, context: CESCampaignContext): string[] {
    const factors: string[] = [];
    
    if (signal.behavior.price_sensitivity === 'high') factors.push('price comparison', 'value assessment');
    if (signal.behavior.brand_affinity > 0.7) factors.push('brand reputation', 'past experience');
    if (signal.behavior.engagement_level === 'high') factors.push('product reviews', 'social proof');
    
    return factors.length > 0 ? factors : ['product quality', 'availability'];
  }

  private static generateMessaging(signal: NormalizedConsumerSignal, context: CESCampaignContext): string[] {
    const messaging: string[] = [];
    
    if (signal.behavior.price_sensitivity === 'high') messaging.push('value-focused copy', 'savings emphasis');
    if (signal.demographics.age_group === '12-19') messaging.push('trendy language', 'social currency');
    if (context.region && context.region !== 'NCR') messaging.push('local relevance', 'regional pride');
    
    return messaging.length > 0 ? messaging : ['clear benefits', 'authentic tone'];
  }

  private static generateVisualPreferences(signal: NormalizedConsumerSignal, context: CESCampaignContext): string[] {
    const visuals: string[] = [];
    
    if (signal.demographics.age_group === '12-19') visuals.push('vibrant colors', 'dynamic layouts');
    if (signal.demographics.age_group === '36-50') visuals.push('clean design', 'family imagery');
    if (signal.behavior.engagement_level === 'high') visuals.push('interactive elements', 'rich media');
    
    return visuals.length > 0 ? visuals : ['professional design', 'clear imagery'];
  }

  private static generateEmotionalTriggers(signal: NormalizedConsumerSignal, context: CESCampaignContext): string[] {
    const triggers: string[] = [];
    
    if (signal.behavior.purchase_intent > 0.7) triggers.push('excitement', 'anticipation');
    if (signal.behavior.price_sensitivity === 'high') triggers.push('relief', 'satisfaction');
    if (signal.context.shopping_momentum > 0.7) triggers.push('urgency', 'FOMO');
    
    return triggers.length > 0 ? triggers : ['trust', 'confidence'];
  }

  private static generateFormatOptimization(signal: NormalizedConsumerSignal, context: CESCampaignContext): string[] {
    const formats: string[] = [];
    
    if (signal.demographics.age_group === '12-19') formats.push('short videos', 'stories format');
    if (signal.behavior.engagement_level === 'high') formats.push('interactive content', 'carousel ads');
    if (signal.context.shopping_momentum > 0.7) formats.push('quick-load formats', 'instant-action');
    
    return formats.length > 0 ? formats : ['standard formats', 'mobile-optimized'];
  }

  private static generateLookalikeExpansion(signal: NormalizedConsumerSignal, context: CESCampaignContext): string[] {
    return [
      `Similar ${signal.demographics.age_group} ${signal.demographics.gender} in ${signal.demographics.location_hierarchy.region}`,
      `${signal.behavior.engagement_level} engagement users in similar locations`,
      `Users with similar ${signal.behavior.price_sensitivity} price sensitivity`,
    ];
  }

  private static generateTimingRecommendations(signal: NormalizedConsumerSignal, context: CESCampaignContext): string[] {
    const timing: string[] = [];
    
    if (signal.context.shopping_momentum > 0.7) timing.push('immediate deployment', 'real-time optimization');
    if (signal.context.seasonal_relevance > 0.8) timing.push('seasonal alignment', 'holiday targeting');
    if (signal.behavior.engagement_level === 'high') timing.push('peak hours focus', 'engagement windows');
    
    return timing.length > 0 ? timing : ['standard scheduling', 'A/B test timing'];
  }

  // Utility methods for Scout result processing
  private static inferFrequencyFromResults(results: any): 'high' | 'medium' | 'low' {
    if (!results) return 'medium';
    const transactions = results.totalTransactions || 0;
    if (transactions > 20) return 'high';
    if (transactions > 10) return 'medium';
    return 'low';
  }

  private static inferPriceSensitivity(results: any): 'high' | 'medium' | 'low' {
    if (!results) return 'medium';
    const avgBasket = results.averageBasketSize || 250;
    if (avgBasket < 200) return 'high';
    if (avgBasket > 400) return 'low';
    return 'medium';
  }

  private static determineSegment(results: any): 'premium' | 'value' | 'mainstream' | 'explorer' {
    if (!results) return 'mainstream';
    const avgBasket = results.averageBasketSize || 250;
    const frequency = this.inferFrequencyFromResults(results);
    
    if (avgBasket > 500 && frequency === 'high') return 'premium';
    if (avgBasket < 200) return 'value';
    if (frequency === 'high') return 'explorer';
    return 'mainstream';
  }

  // New utility methods for deployment improvements
  private static inferChannelFromType(campaignType: string): string {
    const channelMapping: Record<string, string> = {
      'Social Media': 'social_media',
      'TV Commercial': 'television',
      'Brand Awareness': 'display',
      'Seasonal': 'multichannel',
      'Product Launch': 'integrated'
    };
    return channelMapping[campaignType] || 'digital';
  }

  private static inferTargetOutcomes(campaignType: string): BusinessOutcome[] {
    const outcomeMapping: Record<string, BusinessOutcome[]> = {
      'Brand Awareness': [
        { type: 'brand_recall', priority: 'high', target_value: 65 },
        { type: 'engagement', priority: 'medium', target_value: 12 }
      ],
      'Product Launch': [
        { type: 'conversion', priority: 'high', target_value: 8 },
        { type: 'engagement', priority: 'high', target_value: 15 }
      ],
      'Social Media': [
        { type: 'engagement', priority: 'high', target_value: 18 },
        { type: 'behavioral', priority: 'medium', target_value: 25 }
      ],
      'Seasonal': [
        { type: 'conversion', priority: 'high', target_value: 12 },
        { type: 'efficiency', priority: 'medium', target_value: 300 }
      ]
    };
    return outcomeMapping[campaignType] || [
      { type: 'engagement', priority: 'medium', target_value: 10 }
    ];
  }

  /**
   * Creates deployment-ready data migration utility
   */
  static createDeploymentMigration(
    csvCampaigns: any[],
    performanceMetrics: any[],
    creativeAssets: any[]
  ): {
    enhanced_campaigns: CESCampaignContext[];
    data_quality_report: any;
    migration_sql: string;
  } {
    const enhancedCampaigns = csvCampaigns.map(campaign => 
      this.enhanceCampaignWithMetrics(campaign, performanceMetrics)
    );

    const dataQuality = {
      total_campaigns: csvCampaigns.length,
      campaigns_with_metrics: enhancedCampaigns.filter(c => c.calculated_roi).length,
      missing_data_percentage: this.calculateMissingDataPercentage(enhancedCampaigns),
      reconciliation: this.getDataReconciliation()
    };

    const migrationSQL = this.generateMigrationSQL(enhancedCampaigns);

    return {
      enhanced_campaigns: enhancedCampaigns,
      data_quality_report: dataQuality,
      migration_sql: migrationSQL
    };
  }

  private static calculateMissingDataPercentage(campaigns: CESCampaignContext[]): number {
    const totalFields = campaigns.length * 10; // Key fields count
    const missingFields = campaigns.reduce((count, campaign) => {
      let missing = 0;
      if (!campaign.spent) missing++;
      if (!campaign.calculated_roi) missing++;
      if (!campaign.calculated_reach) missing++;
      return count + missing;
    }, 0);
    return (missingFields / totalFields) * 100;
  }

  private static generateMigrationSQL(campaigns: CESCampaignContext[]): string {
    const insertStatements = campaigns.slice(0, 10).map(campaign => {
      const values = [
        `'${campaign.campaign_id}'`,
        `'${campaign.name.replace(/'/g, "''")}'`,
        `'${campaign.brand}'`,
        `'${campaign.channel}'`,
        `'${campaign.status}'`,
        campaign.budget,
        campaign.spent || 0,
        campaign.calculated_roi || 0,
        campaign.calculated_reach || 0,
        campaign.calculated_impressions || 0,
        campaign.calculated_clicks || 0,
        campaign.calculated_ctr || 0,
        0, // cpm placeholder
        0, // cpc placeholder
        0, // conversion_rate placeholder
        `'${campaign.start_date}'`,
        `'${campaign.end_date}'`,
        `'${campaign.type}'`,
        `'${campaign.tenant_id}'`
      ].join(', ');

      return `INSERT INTO campaigns (campaign_id, campaign_name, brand, channel, status, budget, spent, roi, reach, impressions, clicks, ctr, cpm, cpc, conversion_rate, start_date, end_date, campaign_type, tenant_id) VALUES (${values});`;
    }).join('\n');

    return `-- CES Schema Population from CSV Data
-- Generated: ${new Date().toISOString()}

${insertStatements}

-- Add missing columns to match CSV data
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS industry VARCHAR(100);
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS region VARCHAR(100);

-- Update with CSV data
${campaigns.slice(0, 10).map(c => 
  `UPDATE campaigns SET industry = '${c.industry}', region = '${c.region}' WHERE campaign_id = '${c.campaign_id}';`
).join('\n')}`;
  }
}

// Example Usage:
/*
// 1. From Scout query to CES prompt
const scoutResults = { averageBasketSize: 300, totalTransactions: 15, topCategories: ['beverages'] };
const { normalizedSignal, cesContext } = SchemaMapper.processScoutQueryForCES(
  "Show regional performance for Visayas",
  scoutResults,
  "Female, 12–19, Surigao"
);

// 2. Generate CES enhancement
const campaignContext: CESCampaignContext = {
  campaign_id: "campaign_123",
  brand: "Coca-Cola",
  industry: "Beverages",
  channel: "Social Media",
  budget: 500000,
  region: "Visayas",
  target_outcomes: [{ type: 'engagement', priority: 'high', target_value: 0.15 }]
};

const enhancement = SchemaMapper.generateCESPromptEnhancement(normalizedSignal, campaignContext);

// 3. Create enhanced CES prompt
const enhancedPrompt = SchemaMapper.createEnhancedCESPrompt(
  "Create a targeted awareness campaign for young female consumers",
  enhancement,
  "strategist"
);
*/