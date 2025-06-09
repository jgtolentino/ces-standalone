/**
 * Business Outcome-Driven Creative Features Engine
 * Generates creative features based purely on business performance
 * NOT tied to award-winning patterns
 */

export interface BusinessOutcome {
  id: string;
  name: string;
  description: string;
  metrics: string[];
  weight: number;
  targetValue: number;
  threshold: number;
  category: 'engagement' | 'conversion' | 'brand' | 'efficiency' | 'behavioral';
}

export interface CreativeFeature {
  id: string;
  name: string;
  description: string;
  category: 'content' | 'design' | 'messaging' | 'targeting' | 'channel';
  businessImpact: Record<string, number>; // Direct impact on business outcomes
  measurability: 'high' | 'medium' | 'low';
  implementation: string[];
  testability: 'A/B_testable' | 'multivariate' | 'qualitative';
  costToImplement: 'low' | 'medium' | 'high';
  timeToImplement: 'immediate' | 'short' | 'medium' | 'long';
}

// Business Outcomes Framework (NOT award-based)
export const BUSINESS_OUTCOMES: Record<string, BusinessOutcome> = {
  engagement: {
    id: 'engagement',
    name: 'Engagement Performance',
    description: 'Views, likes, shares, completion rate, time spent',
    metrics: ['view_rate', 'completion_rate', 'time_spent', 'interactions', 'shares', 'saves'],
    weight: 0.85,
    targetValue: 75, // 75% engagement rate
    threshold: 50,
    category: 'engagement'
  },
  brand_recall: {
    id: 'brand_recall',
    name: 'Brand Recall & Recognition',
    description: 'Unaided recall, aided recall, brand recognition',
    metrics: ['unaided_recall', 'aided_recall', 'brand_recognition', 'message_recall'],
    weight: 0.90,
    targetValue: 65, // 65% recall rate
    threshold: 40,
    category: 'brand'
  },
  conversion: {
    id: 'conversion',
    name: 'Conversion Performance',
    description: 'CTR, conversion rate, lead generation',
    metrics: ['ctr', 'conversion_rate', 'lead_conversion', 'purchase_completion'],
    weight: 0.95,
    targetValue: 12, // 12% conversion rate
    threshold: 5,
    category: 'conversion'
  },
  roi_sales: {
    id: 'roi_sales',
    name: 'ROI & Sales Performance',
    description: 'Return on investment, sales lift, revenue attribution',
    metrics: ['roi', 'roas', 'sales_lift', 'revenue_per_visitor', 'customer_ltv'],
    weight: 1.0,
    targetValue: 300, // 3x ROI
    threshold: 150,
    category: 'conversion'
  },
  brand_sentiment: {
    id: 'brand_sentiment',
    name: 'Brand Sentiment',
    description: 'Positive sentiment, brand love, advocacy rate',
    metrics: ['sentiment_score', 'net_promoter_score', 'brand_love_index', 'advocacy_rate'],
    weight: 0.80,
    targetValue: 75, // 75% positive sentiment
    threshold: 60,
    category: 'brand'
  },
  acquisition: {
    id: 'acquisition',
    name: 'Customer Acquisition',
    description: 'CAC, qualified leads, new customer rate',
    metrics: ['customer_acquisition_cost', 'lead_quality_score', 'new_customer_rate'],
    weight: 0.88,
    targetValue: 85, // 85% qualified lead rate
    threshold: 65,
    category: 'conversion'
  },
  media_efficiency: {
    id: 'media_efficiency',
    name: 'Media Efficiency',
    description: 'CPV, CPI, CPM optimization, reach efficiency',
    metrics: ['cost_per_view', 'cost_per_impression', 'reach_frequency_ratio', 'media_mix_efficiency'],
    weight: 0.75,
    targetValue: 120, // 20% efficiency improvement
    threshold: 100,
    category: 'efficiency'
  },
  behavioral_response: {
    id: 'behavioral_response',
    name: 'Behavioral Response',
    description: 'Site visits, app downloads, trial usage, repeat behavior',
    metrics: ['site_visit_rate', 'app_download_rate', 'trial_conversion', 'repeat_usage'],
    weight: 0.82,
    targetValue: 45, // 45% behavioral response rate
    threshold: 25,
    category: 'behavioral'
  },
  brand_equity: {
    id: 'brand_equity',
    name: 'Long-term Brand Equity',
    description: 'Brand trust, relevance, consideration lift',
    metrics: ['brand_trust_score', 'relevance_index', 'consideration_lift', 'preference_share'],
    weight: 0.70,
    targetValue: 80, // 80% brand equity score
    threshold: 65,
    category: 'brand'
  }
};

// Creative Features Based on Business Performance (NOT Awards)
export const BUSINESS_DRIVEN_FEATURES: CreativeFeature[] = [
  
  // CONTENT FEATURES
  {
    id: 'value_proposition_clarity',
    name: 'Value Proposition Clarity',
    description: 'Clear, specific benefit communication that drives action',
    category: 'content',
    businessImpact: {
      conversion: 0.92,
      roi_sales: 0.89,
      acquisition: 0.87,
      engagement: 0.71,
      brand_recall: 0.84,
      brand_sentiment: 0.68,
      media_efficiency: 0.75,
      behavioral_response: 0.83,
      brand_equity: 0.72
    },
    measurability: 'high',
    implementation: [
      'Single benefit focus per message',
      'Quantified value statements',
      'Before/after demonstrations',
      'Benefit-first headline structure'
    ],
    testability: 'A/B_testable',
    costToImplement: 'low',
    timeToImplement: 'immediate'
  },
  {
    id: 'urgency_scarcity_triggers',
    name: 'Urgency & Scarcity Triggers',
    description: 'Time-sensitive or limited availability messaging',
    category: 'content',
    businessImpact: {
      conversion: 0.94,
      roi_sales: 0.91,
      acquisition: 0.89,
      engagement: 0.78,
      brand_recall: 0.65,
      brand_sentiment: 0.58,
      media_efficiency: 0.82,
      behavioral_response: 0.93,
      brand_equity: 0.52
    },
    measurability: 'high',
    implementation: [
      'Limited time offers',
      'Stock countdown displays',
      'Exclusive access messaging',
      'Price increase warnings'
    ],
    testability: 'A/B_testable',
    costToImplement: 'low',
    timeToImplement: 'immediate'
  },
  {
    id: 'social_proof_integration',
    name: 'Social Proof Integration',
    description: 'Customer testimonials, reviews, usage statistics',
    category: 'content',
    businessImpact: {
      conversion: 0.88,
      roi_sales: 0.85,
      acquisition: 0.92,
      engagement: 0.74,
      brand_recall: 0.71,
      brand_sentiment: 0.87,
      media_efficiency: 0.69,
      behavioral_response: 0.81,
      brand_equity: 0.84
    },
    measurability: 'high',
    implementation: [
      'Customer review highlights',
      'Usage statistics display',
      'Expert endorsements',
      'User-generated content'
    ],
    testability: 'A/B_testable',
    costToImplement: 'medium',
    timeToImplement: 'short'
  },
  {
    id: 'problem_solution_framing',
    name: 'Problem-Solution Framing',
    description: 'Clear pain point identification and solution presentation',
    category: 'content',
    businessImpact: {
      conversion: 0.86,
      roi_sales: 0.83,
      acquisition: 0.88,
      engagement: 0.82,
      brand_recall: 0.79,
      brand_sentiment: 0.75,
      media_efficiency: 0.71,
      behavioral_response: 0.85,
      brand_equity: 0.77
    },
    measurability: 'medium',
    implementation: [
      'Pain point agitation',
      'Solution demonstration',
      'Outcome visualization',
      'Alternative comparison'
    ],
    testability: 'multivariate',
    costToImplement: 'medium',
    timeToImplement: 'short'
  },

  // DESIGN FEATURES
  {
    id: 'visual_hierarchy_optimization',
    name: 'Visual Hierarchy Optimization',
    description: 'Strategic visual flow that guides to conversion',
    category: 'design',
    businessImpact: {
      conversion: 0.91,
      roi_sales: 0.88,
      acquisition: 0.84,
      engagement: 0.89,
      brand_recall: 0.86,
      brand_sentiment: 0.71,
      media_efficiency: 0.85,
      behavioral_response: 0.87,
      brand_equity: 0.74
    },
    measurability: 'high',
    implementation: [
      'Eye-tracking optimized layouts',
      'Progressive information reveal',
      'Contrasting CTA placement',
      'Scannable content structure'
    ],
    testability: 'A/B_testable',
    costToImplement: 'medium',
    timeToImplement: 'short'
  },
  {
    id: 'color_psychology_application',
    name: 'Color Psychology Application',
    description: 'Strategic color use to drive specific behaviors',
    category: 'design',
    businessImpact: {
      conversion: 0.76,
      roi_sales: 0.73,
      acquisition: 0.71,
      engagement: 0.84,
      brand_recall: 0.91,
      brand_sentiment: 0.88,
      media_efficiency: 0.67,
      behavioral_response: 0.79,
      brand_equity: 0.93
    },
    measurability: 'high',
    implementation: [
      'Action-driving color schemes',
      'Trust-building color palettes',
      'Urgency-conveying accents',
      'Brand consistency maintenance'
    ],
    testability: 'A/B_testable',
    costToImplement: 'low',
    timeToImplement: 'immediate'
  },
  {
    id: 'mobile_optimization',
    name: 'Mobile-First Optimization',
    description: 'Design optimized for mobile user behavior and conversion',
    category: 'design',
    businessImpact: {
      conversion: 0.95,
      roi_sales: 0.92,
      acquisition: 0.94,
      engagement: 0.93,
      brand_recall: 0.78,
      brand_sentiment: 0.72,
      media_efficiency: 0.89,
      behavioral_response: 0.96,
      brand_equity: 0.69
    },
    measurability: 'high',
    implementation: [
      'Thumb-friendly navigation',
      'Single-column layouts',
      'Large tap targets',
      'Fast loading optimization'
    ],
    testability: 'A/B_testable',
    costToImplement: 'medium',
    timeToImplement: 'medium'
  },

  // MESSAGING FEATURES
  {
    id: 'benefit_focused_headlines',
    name: 'Benefit-Focused Headlines',
    description: 'Headlines that emphasize user benefits over features',
    category: 'messaging',
    businessImpact: {
      conversion: 0.90,
      roi_sales: 0.87,
      acquisition: 0.85,
      engagement: 0.83,
      brand_recall: 0.92,
      brand_sentiment: 0.76,
      media_efficiency: 0.81,
      behavioral_response: 0.86,
      brand_equity: 0.78
    },
    measurability: 'high',
    implementation: [
      'Outcome-focused language',
      'User benefit emphasis',
      'Emotional benefit connection',
      'Specific result promises'
    ],
    testability: 'A/B_testable',
    costToImplement: 'low',
    timeToImplement: 'immediate'
  },
  {
    id: 'action_oriented_language',
    name: 'Action-Oriented Language',
    description: 'Verbs and phrases that drive immediate action',
    category: 'messaging',
    businessImpact: {
      conversion: 0.96,
      roi_sales: 0.94,
      acquisition: 0.91,
      engagement: 0.74,
      brand_recall: 0.68,
      brand_sentiment: 0.63,
      media_efficiency: 0.77,
      behavioral_response: 0.95,
      brand_equity: 0.59
    },
    measurability: 'high',
    implementation: [
      'Command-form CTAs',
      'Active voice usage',
      'Present tense focus',
      'Specific action verbs'
    ],
    testability: 'A/B_testable',
    costToImplement: 'low',
    timeToImplement: 'immediate'
  },
  {
    id: 'personalization_depth',
    name: 'Personalization Depth',
    description: 'Customized messaging based on user data and behavior',
    category: 'messaging',
    businessImpact: {
      conversion: 0.89,
      roi_sales: 0.92,
      acquisition: 0.87,
      engagement: 0.91,
      brand_recall: 0.84,
      brand_sentiment: 0.89,
      media_efficiency: 0.94,
      behavioral_response: 0.88,
      brand_equity: 0.86
    },
    measurability: 'high',
    implementation: [
      'Dynamic content insertion',
      'Behavioral trigger messaging',
      'Geographic customization',
      'Purchase history integration'
    ],
    testability: 'multivariate',
    costToImplement: 'high',
    timeToImplement: 'long'
  },

  // TARGETING FEATURES
  {
    id: 'behavioral_targeting_precision',
    name: 'Behavioral Targeting Precision',
    description: 'Targeting based on actual user behavior patterns',
    category: 'targeting',
    businessImpact: {
      conversion: 0.93,
      roi_sales: 0.95,
      acquisition: 0.94,
      engagement: 0.87,
      brand_recall: 0.79,
      brand_sentiment: 0.81,
      media_efficiency: 0.96,
      behavioral_response: 0.91,
      brand_equity: 0.74
    },
    measurability: 'high',
    implementation: [
      'Purchase intent tracking',
      'Engagement pattern analysis',
      'Cross-device behavior linking',
      'Lifecycle stage targeting'
    ],
    testability: 'multivariate',
    costToImplement: 'high',
    timeToImplement: 'medium'
  },
  {
    id: 'lookalike_audience_optimization',
    name: 'Lookalike Audience Optimization',
    description: 'Targeting users similar to high-value customers',
    category: 'targeting',
    businessImpact: {
      conversion: 0.88,
      roi_sales: 0.91,
      acquisition: 0.95,
      engagement: 0.82,
      brand_recall: 0.76,
      brand_sentiment: 0.78,
      media_efficiency: 0.93,
      behavioral_response: 0.85,
      brand_equity: 0.71
    },
    measurability: 'high',
    implementation: [
      'High-LTV customer modeling',
      'Conversion-based lookalikes',
      'Engagement-based segments',
      'Multi-source data integration'
    ],
    testability: 'A/B_testable',
    costToImplement: 'medium',
    timeToImplement: 'medium'
  },

  // CHANNEL FEATURES
  {
    id: 'platform_native_optimization',
    name: 'Platform-Native Optimization',
    description: 'Content optimized for specific platform behaviors',
    category: 'channel',
    businessImpact: {
      conversion: 0.87,
      roi_sales: 0.84,
      acquisition: 0.86,
      engagement: 0.95,
      brand_recall: 0.81,
      brand_sentiment: 0.83,
      media_efficiency: 0.91,
      behavioral_response: 0.89,
      brand_equity: 0.77
    },
    measurability: 'high',
    implementation: [
      'Platform-specific formats',
      'Native behavior integration',
      'Algorithm optimization',
      'Platform feature utilization'
    ],
    testability: 'A/B_testable',
    costToImplement: 'medium',
    timeToImplement: 'short'
  },
  {
    id: 'cross_channel_consistency',
    name: 'Cross-Channel Consistency',
    description: 'Consistent messaging and experience across all touchpoints',
    category: 'channel',
    businessImpact: {
      conversion: 0.84,
      roi_sales: 0.87,
      acquisition: 0.82,
      engagement: 0.79,
      brand_recall: 0.93,
      brand_sentiment: 0.91,
      media_efficiency: 0.85,
      behavioral_response: 0.86,
      brand_equity: 0.95
    },
    measurability: 'medium',
    implementation: [
      'Unified message architecture',
      'Consistent visual identity',
      'Synchronized timing',
      'Cross-platform tracking'
    ],
    testability: 'qualitative',
    costToImplement: 'high',
    timeToImplement: 'long'
  }
];

/**
 * Business-Driven Creative Effectiveness Engine
 * Focuses purely on business outcomes, not awards
 */
export class BusinessOutcomeEngine {
  
  calculateBusinessEffectiveness(
    featureScores: Record<string, number>,
    businessPriorities: Record<string, number> = {},
    campaignObjective: 'conversion' | 'brand' | 'engagement' | 'efficiency' = 'conversion'
  ): {
    totalScore: number;
    outcomeBreakdown: Record<string, number>;
    featureROI: Record<string, number>;
    implementationPlan: any[];
    businessRecommendations: string[];
  } {
    
    // Apply objective weights
    const objectiveWeights = this.getObjectiveWeights(campaignObjective);
    
    // Calculate outcome scores
    const outcomeBreakdown: Record<string, number> = {};
    const featureROI: Record<string, number> = {};
    
    for (const [outcomeId, outcome] of Object.entries(BUSINESS_OUTCOMES)) {
      let outcomeScore = 0;
      
      for (const feature of BUSINESS_DRIVEN_FEATURES) {
        const featureScore = featureScores[feature.id] || 0;
        const impact = feature.businessImpact[outcomeId] || 0;
        const weight = objectiveWeights[outcome.category] || 1;
        const contribution = featureScore * impact * weight;
        
        outcomeScore += contribution;
        featureROI[feature.id] = (featureROI[feature.id] || 0) + contribution;
      }
      
      // Apply business priority weight
      const priorityWeight = businessPriorities[outcomeId] || 1;
      outcomeBreakdown[outcomeId] = outcomeScore * priorityWeight * outcome.weight;
    }
    
    // Calculate total business score
    const totalScore = Object.values(outcomeBreakdown).reduce((sum, score) => sum + score, 0) / 100;
    
    // Generate implementation plan
    const implementationPlan = this.generateImplementationPlan(featureScores);
    
    // Generate business-focused recommendations
    const businessRecommendations = this.generateBusinessRecommendations(
      featureScores, 
      outcomeBreakdown, 
      campaignObjective
    );
    
    return {
      totalScore: Math.round(totalScore * 100) / 100,
      outcomeBreakdown,
      featureROI,
      implementationPlan,
      businessRecommendations
    };
  }
  
  private getObjectiveWeights(objective: string): Record<string, number> {
    const weights = {
      conversion: {
        engagement: 0.8,
        conversion: 1.5,
        brand: 0.7,
        efficiency: 1.2,
        behavioral: 1.3
      },
      brand: {
        engagement: 1.1,
        conversion: 0.8,
        brand: 1.5,
        efficiency: 0.9,
        behavioral: 1.0
      },
      engagement: {
        engagement: 1.5,
        conversion: 0.9,
        brand: 1.1,
        efficiency: 1.0,
        behavioral: 1.2
      },
      efficiency: {
        engagement: 0.9,
        conversion: 1.2,
        brand: 0.8,
        efficiency: 1.5,
        behavioral: 1.0
      }
    };
    
    return weights[objective as keyof typeof weights] || weights.conversion;
  }
  
  private generateImplementationPlan(featureScores: Record<string, number>): any[] {
    const plan = [];
    
    // Sort features by ROI potential and implementation ease
    const sortedFeatures = BUSINESS_DRIVEN_FEATURES
      .map(feature => ({
        ...feature,
        currentScore: featureScores[feature.id] || 0,
        gap: Math.max(0, 8 - (featureScores[feature.id] || 0)),
        priority: this.calculateImplementationPriority(feature, featureScores[feature.id] || 0)
      }))
      .filter(f => f.gap > 1)
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 5);
    
    for (const feature of sortedFeatures) {
      plan.push({
        feature: feature.name,
        currentScore: feature.currentScore,
        targetScore: 8,
        gap: feature.gap,
        costToImplement: feature.costToImplement,
        timeToImplement: feature.timeToImplement,
        testability: feature.testability,
        expectedROI: this.calculateExpectedROI(feature),
        implementation: feature.implementation,
        priority: feature.priority > 7 ? 'high' : feature.priority > 5 ? 'medium' : 'low'
      });
    }
    
    return plan;
  }
  
  private calculateImplementationPriority(feature: CreativeFeature, currentScore: number): number {
    const gap = Math.max(0, 8 - currentScore);
    const businessImpact = Object.values(feature.businessImpact).reduce((sum, impact) => sum + impact, 0) / Object.keys(feature.businessImpact).length;
    
    const costMultiplier = feature.costToImplement === 'low' ? 1.2 : feature.costToImplement === 'medium' ? 1.0 : 0.7;
    const timeMultiplier = feature.timeToImplement === 'immediate' ? 1.3 : feature.timeToImplement === 'short' ? 1.1 : 0.8;
    
    return gap * businessImpact * costMultiplier * timeMultiplier;
  }
  
  private calculateExpectedROI(feature: any): string {
    const avgImpact = Object.values(feature.businessImpact).reduce((sum: number, impact: unknown) => sum + (impact as number), 0) / Object.keys(feature.businessImpact).length;
    const roi = (avgImpact * feature.gap * 100) / (feature.costToImplement === 'low' ? 1 : feature.costToImplement === 'medium' ? 3 : 5);
    
    if (roi > 50) return 'Very High';
    if (roi > 30) return 'High';
    if (roi > 15) return 'Medium';
    return 'Low';
  }
  
  private generateBusinessRecommendations(
    featureScores: Record<string, number>,
    outcomeBreakdown: Record<string, number>,
    objective: string
  ): string[] {
    const recommendations = [];
    
    // Find lowest performing business outcomes
    const sortedOutcomes = Object.entries(outcomeBreakdown)
      .sort(([,a], [,b]) => a - b)
      .slice(0, 2);
    
    for (const [outcomeId, score] of sortedOutcomes) {
      const outcome = BUSINESS_OUTCOMES[outcomeId];
      if (outcome && score < outcome.threshold) {
        const bestFeatures = BUSINESS_DRIVEN_FEATURES
          .filter(f => f.businessImpact[outcomeId] && f.businessImpact[outcomeId] > 0.8)
          .slice(0, 2);
        
        recommendations.push(
          `To improve ${outcome.name} (current: ${Math.round(score)}, target: ${outcome.targetValue}), focus on: ${bestFeatures.map(f => f.name).join(' and ')}`
        );
      }
    }
    
    // Quick wins (low cost, high impact)
    const quickWins = BUSINESS_DRIVEN_FEATURES
      .filter(f => 
        f.costToImplement === 'low' && 
        f.timeToImplement === 'immediate' &&
        (featureScores[f.id] || 0) < 7
      )
      .slice(0, 2);
    
    if (quickWins.length > 0) {
      recommendations.push(
        `Quick wins for immediate impact: ${quickWins.map(f => f.name).join(' and ')}`
      );
    }
    
    return recommendations.slice(0, 5);
  }
}

// Export singleton instance
export const businessEngine = new BusinessOutcomeEngine();