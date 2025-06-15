export interface CreativeFeatureScores {
  content_value_proposition_clear: number;
  content_urgency_triggers: number;
  content_social_proof: number;
  content_narrative_construction: number;

  design_visual_hierarchy: number;
  design_motion_graphics: number;
  design_color_psychology: number;
  design_visual_distinctiveness: number;

  messaging_action_oriented_language: number;
  messaging_benefit_focused_headlines: number;
  messaging_message_clarity: number;
  messaging_emotional_connection: number;

  targeting_behavioral_precision: number;
  targeting_lookalike_optimization: number;
  targeting_values_based_targeting: number;

  channel_cross_channel_consistency: number;
  channel_platform_optimization: number;
  channel_multi_format_adaptation: number;

  detected_storytelling: number;
  detected_emotional_appeal: number;
  detected_call_to_action: number;
  // Add other detected features as needed
}

export interface BusinessOutcomeScores {
  outcome_engagement_high_engagement: number;
  outcome_engagement_creative_breakthrough: number;
  outcome_engagement_social_sharing: number;

  outcome_conversion_direct_conversion: number;
  outcome_conversion_sales_lift: number;
  outcome_conversion_lead_generation: number;

  outcome_brand_brand_recall: number;
  outcome_brand_cultural_relevance: number;
  outcome_brand_brand_trust: number;

  outcome_efficiency_media_efficiency: number;
  outcome_efficiency_roi_positive: number;

  outcome_behavioral_consideration_behavior: number;
  outcome_behavioral_advocacy_behavior: number;
  // Add other behavioral outcomes as needed
}

export interface CampaignAsset {
  id: string;
  campaign_id: string;
  name: string;
  type: 'video' | 'image' | 'presentation' | 'document';
  file_path: string;
  content_text?: string;
  metadata?: Record<string, any>; // Store additional metadata
}

export interface CampaignPerformanceMetrics {
  metric_id: string;
  campaign_id: string;
  date: string;
  roi: number;
  brand_recall: number;
  engagement_rate: number;
  conversion_rate: number;
  sentiment_score: number;
  ctr: number;
  video_completion_rate?: number;
  share_rate?: number;
  save_rate?: number;
  cost_per_acquisition?: number;
}

export interface Campaign {
  campaign_id: string;
  campaign_name: string;
  status: string; // e.g., 'active', 'completed', 'draft'
  channel: string;
  budget: number;
  spent: number;
  revenue: number; // Added for ROI calculation
  impressions: number;
  clicks: number;
  conversions: number;
  roi: number;
  reach: number;
  start_date: string;
  end_date: string;
  brand: string;
  campaign_type: string;
  industry: string;
  region: string;
  created_at: string;
  updated_at: string;
  // Potentially add arrays of assets or metrics to the campaign object if needed
  assets?: CampaignAsset[];
  metrics?: CampaignPerformanceMetrics[];
}

export interface CreativeAnalysisResult {
  campaign: Campaign;
  creativeFeatureScores: CreativeFeatureScores;
  businessOutcomePredictions: BusinessOutcomeScores;
  recommendations: string[];
  compositionAnalysis: {
    videoHeavy: boolean;
    imageRich: boolean;
    strategicFocus: boolean;
    comprehensiveCampaign: boolean;
  };
} 