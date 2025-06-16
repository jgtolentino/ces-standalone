export interface CESScore {
  overall: number
  emotional_impact: number
  visual_distinctiveness: number
  message_clarity: number
  cultural_relevance: number
  brand_assets: number
  confidence: number
}

export interface Campaign {
  id: string
  name: string
  type: 'purpose_driven' | 'brand_building' | 'promotional'
  format: 'video' | 'static' | 'audio' | 'carousel'
  phase: 'briefing' | 'development' | 'activation'
  region: string
  segment: string[]
  ces_score: CESScore
  created_at: Date
  assets: CreativeAsset[]
}

export interface CreativeAsset {
  id: string
  campaign_id: string
  type: 'image' | 'video' | 'audio'
  url: string
  features: {
    sentiment_polarity: number
    emotional_intensity: number
    visual_distinctness: number
    text_readability: number
    brand_integration: number
    call_to_action_strength: number
    platform_adaptation: number
  }
  shap_values: SHAPValue[]
  timeline_segments?: TimelineSegment[]
}

export interface SHAPValue {
  feature: string
  value: number
  impact: 'positive' | 'negative'
  importance: number
}

export interface TimelineSegment {
  start_time: number
  end_time: number
  type: 'intro' | 'product' | 'cta' | 'brand'
  effectiveness_score: number
  features: string[]
}

export interface Insight {
  id: string
  type: 'recommendation' | 'warning' | 'success' | 'info'
  title: string
  description: string
  impact_score: number
  confidence: number
  suggested_actions: string[]
  related_campaigns: string[]
}

export interface PromptTemplate {
  id: string
  name: string
  description: string
  prompt: string
  category: 'optimization' | 'analysis' | 'comparison' | 'prediction'
  tags: string[]
}

export interface RegionData {
  id: string
  name: string
  type: 'country' | 'region' | 'city' | 'barangay'
  parent_id?: string
  coordinates: [number, number]
  metrics: {
    recall: number
    persuasion: number
    brand_lift: number
    engagement: number
  }
  campaign_count: number
}

export interface PersonaData {
  id: string
  name: string
  demographics: {
    age_range: string
    gender: string
    income_bracket: string
    device_preference: string
  }
  performance_metrics: {
    recall: number
    persuasion: number
    brand_lift: number
    engagement: number
  }
  top_campaigns: string[]
  behavioral_insights: string[]
}

export interface ModelVersion {
  version: string
  date: Date
  accuracy: number
  features_count: number
  changes: Array<{
    feature: string
    change_type: 'added' | 'removed' | 'modified'
    impact: number
  }>
  performance_comparison: {
    previous_version?: string
    accuracy_delta: number
    feature_importance_changes: Array<{
      feature: string
      old_importance: number
      new_importance: number
    }>
  }
}