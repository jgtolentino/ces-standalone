/**
 * Role-Aware Prompting Engine for Scout Analytics
 * Cherry-picked from CES architecture for contextual AI interactions
 */

export interface UserRole {
  id: string;
  display_name: string;
  primary_widgets: string[];
  insights_focus: string[];
  prompting_context: string;
  alert_types: string[];
}

export interface PromptContext {
  role: UserRole;
  widget_context?: string;
  data_context?: Record<string, any>;
  confidence_threshold?: number;
}

export interface InsightMetadata {
  generated_by: string;
  timestamp: string;
  source: string;
  confidence: number;
  role_context: string;
  data_sources: string[];
}

export class RoleAwarePromptEngine {
  private roles: Map<string, UserRole> = new Map();

  constructor() {
    this.initializeRoles();
  }

  private initializeRoles() {
    const roles: UserRole[] = [
      {
        id: 'brand_manager',
        display_name: 'Brand Manager',
        primary_widgets: ['executive_summary', 'brand_performance', 'market_share'],
        insights_focus: ['campaign_roi', 'category_alerts', 'competitive_position'],
        prompting_context: 'Focus on brand performance, market share trends, and campaign ROI optimization. Prioritize actionable insights for marketing strategy.',
        alert_types: ['share_drop', 'competitor_gain', 'seasonal_opportunity']
      },
      {
        id: 'category_manager',
        display_name: 'Category Manager',
        primary_widgets: ['product_insights', 'substitution_analysis', 'basket_analysis'],
        insights_focus: ['product_mix', 'pricing_insights', 'inventory_optimization'],
        prompting_context: 'Emphasize product mix optimization, pricing strategies, and category health. Focus on SKU performance and substitution patterns.',
        alert_types: ['pricing_anomaly', 'stock_out', 'new_product_performance']
      },
      {
        id: 'regional_director',
        display_name: 'Regional Director',
        primary_widgets: ['regional_performance', 'store_analytics', 'geographic_trends'],
        insights_focus: ['store_level_alerts', 'geo_insights', 'territory_performance'],
        prompting_context: 'Highlight regional performance variations, store efficiency, and geographic opportunities. Focus on operational excellence.',
        alert_types: ['underperforming_stores', 'regional_trends', 'expansion_opportunities']
      }
    ];

    roles.forEach(role => this.roles.set(role.id, role));
  }

  public getRole(roleId: string): UserRole | undefined {
    return this.roles.get(roleId);
  }

  public generateContextualPrompt(
    query: string,
    context: PromptContext,
    type: 'question' | 'insight' | 'alert' = 'question'
  ): string {
    const { role, widget_context, data_context } = context;

    let prompt = `You are an AI analytics assistant for Scout Retail Intelligence Platform, 
responding to a ${role.display_name}. ${role.prompting_context}

User Role Context:
- Primary Focus Areas: ${role.insights_focus.join(', ')}
- Relevant Alert Types: ${role.alert_types.join(', ')}
- Key Widgets: ${role.primary_widgets.join(', ')}`;

    if (widget_context) {
      prompt += `\nWidget Context: Currently viewing ${widget_context}`;
    }

    if (data_context) {
      prompt += `\nData Context: ${JSON.stringify(data_context, null, 2)}`;
    }

    switch (type) {
      case 'question':
        prompt += `\n\nUser Question: "${query}"

Please provide a concise, actionable response focused on ${role.display_name} priorities. Include specific metrics, trends, or recommendations when possible.`;
        break;

      case 'insight':
        prompt += `\n\nGenerate an insight about: "${query}"

Provide a data-driven insight that would be valuable for a ${role.display_name}. Include confidence level and actionable recommendations.`;
        break;

      case 'alert':
        prompt += `\n\nAlert Context: "${query}"

Analyze this alert from a ${role.display_name} perspective. Explain the impact and suggest immediate actions.`;
        break;
    }

    return prompt;
  }

  public generateInsightMetadata(
    source: string,
    confidence: number,
    role: UserRole,
    data_sources: string[] = []
  ): InsightMetadata {
    return {
      generated_by: 'scout-ai',
      timestamp: new Date().toISOString(),
      source,
      confidence,
      role_context: role.id,
      data_sources
    };
  }

  public validateInsightQuality(
    insight: string,
    metadata: InsightMetadata,
    role: UserRole
  ): { valid: boolean; score: number; feedback: string[] } {
    const feedback: string[] = [];
    let score = 0;

    // Check confidence threshold
    if (metadata.confidence >= 0.75) {
      score += 25;
    } else {
      feedback.push('Low confidence score - consider gathering more data');
    }

    // Check role relevance
    const roleKeywords = role.insights_focus.join(' ').toLowerCase();
    const insightLower = insight.toLowerCase();
    const relevanceScore = role.insights_focus.filter(focus => 
      insightLower.includes(focus.toLowerCase())
    ).length / role.insights_focus.length;

    if (relevanceScore >= 0.3) {
      score += 25;
    } else {
      feedback.push('Insight may not be relevant to user role');
    }

    // Check for actionable content
    const actionWords = ['recommend', 'suggest', 'should', 'consider', 'optimize', 'improve'];
    const hasActionable = actionWords.some(word => insightLower.includes(word));
    
    if (hasActionable) {
      score += 25;
    } else {
      feedback.push('Insight lacks actionable recommendations');
    }

    // Check for specific metrics
    const hasMetrics = /\d+%|\$\d+|\d+\.\d+|increase|decrease|growth|decline/.test(insight);
    
    if (hasMetrics) {
      score += 25;
    } else {
      feedback.push('Consider including specific metrics or trends');
    }

    return {
      valid: score >= 50,
      score,
      feedback
    };
  }

  public getRelevantWidgets(roleId: string): string[] {
    const role = this.getRole(roleId);
    return role ? role.primary_widgets : [];
  }

  public getAlertPriority(alertType: string, roleId: string): 'high' | 'medium' | 'low' {
    const role = this.getRole(roleId);
    if (!role) return 'low';

    if (role.alert_types.includes(alertType)) {
      return 'high';
    }

    // Check for related alert types
    const relatedAlerts = {
      'brand_manager': ['revenue_drop', 'market_share', 'competitor'],
      'category_manager': ['product_performance', 'pricing', 'inventory'],
      'regional_director': ['store_performance', 'regional', 'geographic']
    };

    const related = relatedAlerts[roleId as keyof typeof relatedAlerts] || [];
    const isRelated = related.some(keyword => alertType.includes(keyword));

    return isRelated ? 'medium' : 'low';
  }
}

// Singleton instance
export const roleEngine = new RoleAwarePromptEngine();

// Helper functions for components
export function useRoleContext(roleId: string = 'brand_manager') {
  const role = roleEngine.getRole(roleId);
  
  return {
    role,
    generatePrompt: (query: string, context?: Partial<PromptContext>) => 
      roleEngine.generateContextualPrompt(query, { role: role!, ...context }),
    validateInsight: (insight: string, metadata: InsightMetadata) =>
      roleEngine.validateInsightQuality(insight, metadata, role!),
    getRelevantWidgets: () => roleEngine.getRelevantWidgets(roleId),
    getAlertPriority: (alertType: string) => roleEngine.getAlertPriority(alertType, roleId)
  };
}