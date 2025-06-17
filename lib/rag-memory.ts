import { fetchDAL } from './dal';
import { isPublicExplanationQuery, generatePublicExplanation } from './prompts/public-explanation';

export interface RAGInsight {
  id: string;
  campaign_id: string;
  category: string;
  insight_text: string;
  confidence_score: number;
  data_sources: string[];
  tags: string[];
  embedding_vector: number[];
  related_campaigns: string[];
  created_by: string;
  last_updated: string;
}

export interface CampaignCorrelation {
  correlation_id: string;
  primary_campaign: string;
  related_campaigns: string[];
  correlation_strength: number;
  correlation_type: string;
  insight_summary: string;
}

export interface RAGIndex {
  version: string;
  created_at: string;
  source: string;
  insights: RAGInsight[];
  campaign_correlations: CampaignCorrelation[];
  knowledge_graph: {
    entities: any[];
    relationships: any[];
  };
  metadata: {
    total_insights: number;
    last_updated: string;
    coverage_period: string;
    data_sources_count: number;
    embedding_dimensions: number;
  };
}

export interface RAGSearchQuery {
  query: string;
  filters?: {
    category?: string;
    tags?: string[];
    campaign_ids?: string[];
    confidence_threshold?: number;
    date_range?: {
      start: string;
      end: string;
    };
  };
  limit?: number;
  similarity_threshold?: number;
}

export interface RAGSearchResult {
  insight: RAGInsight;
  similarity_score: number;
  relevance_rank: number;
}

export interface InsightRecommendation {
  id: string;
  title: string;
  description: string;
  confidence: number;
  impact_estimate: 'high' | 'medium' | 'low';
  implementation_effort: 'high' | 'medium' | 'low';
  supporting_insights: string[];
  related_metrics: string[];
  action_items: string[];
}

class RAGMemoryEngine {
  private ragIndex: RAGIndex | null = null;
  private indexLastLoaded: number = 0;
  private cacheExpiry: number = 5 * 60 * 1000; // 5 minutes

  async loadRAGIndex(): Promise<RAGIndex> {
    const now = Date.now();
    
    // Return cached index if still fresh
    if (this.ragIndex && (now - this.indexLastLoaded) < this.cacheExpiry) {
      return this.ragIndex;
    }

    try {
      // In production, this would fetch from a vector database
      // For now, load from local JSON file
      const response = await fetch('/insights/ces_rag.json');
      if (!response.ok) {
        throw new Error(`Failed to load RAG index: ${response.status}`);
      }
      
      this.ragIndex = await response.json();
      this.indexLastLoaded = now;
      
      return this.ragIndex!;
    } catch (error) {
      console.error('Failed to load RAG index:', error);
      // Return empty index as fallback
      return this.getEmptyIndex();
    }
  }

  private getEmptyIndex(): RAGIndex {
    return {
      version: "1.0.0",
      created_at: new Date().toISOString(),
      source: "CESAI-RAG-INDEX",
      insights: [],
      campaign_correlations: [],
      knowledge_graph: { entities: [], relationships: [] },
      metadata: {
        total_insights: 0,
        last_updated: new Date().toISOString(),
        coverage_period: "",
        data_sources_count: 0,
        embedding_dimensions: 0
      }
    };
  }

  async searchInsights(searchQuery: RAGSearchQuery): Promise<RAGSearchResult[]> {
    const ragIndex = await this.loadRAGIndex();
    const { query, filters = {}, limit = 5, similarity_threshold = 0.7 } = searchQuery;

    // Check if this is a public explanation query
    if (isPublicExplanationQuery(query)) {
      // Return the platform explanation insight with high relevance
      const platformInsight = ragIndex.insights.find(insight => 
        insight.category === 'platform_explanation'
      );
      
      if (platformInsight) {
        return [{
          insight: platformInsight,
          similarity_score: 0.95,
          relevance_rank: 1
        }];
      }
    }

    // Filter insights based on criteria
    let filteredInsights = ragIndex.insights;

    if (filters.category) {
      filteredInsights = filteredInsights.filter(insight => 
        insight.category === filters.category
      );
    }

    if (filters.tags && filters.tags.length > 0) {
      filteredInsights = filteredInsights.filter(insight =>
        filters.tags!.some(tag => insight.tags.includes(tag))
      );
    }

    if (filters.campaign_ids && filters.campaign_ids.length > 0) {
      filteredInsights = filteredInsights.filter(insight =>
        filters.campaign_ids!.includes(insight.campaign_id) ||
        insight.related_campaigns.some(id => filters.campaign_ids!.includes(id))
      );
    }

    if (filters.confidence_threshold) {
      filteredInsights = filteredInsights.filter(insight =>
        insight.confidence_score >= filters.confidence_threshold!
      );
    }

    // Calculate similarity scores (simplified text matching for now)
    const results: RAGSearchResult[] = filteredInsights.map(insight => {
      const similarity = this.calculateSimilarity(query, insight);
      return {
        insight,
        similarity_score: similarity,
        relevance_rank: 0 // Will be set after sorting
      };
    });

    // Filter by similarity threshold and sort
    const filteredResults = results
      .filter(result => result.similarity_score >= similarity_threshold)
      .sort((a, b) => b.similarity_score - a.similarity_score)
      .slice(0, limit);

    // Set relevance ranks
    filteredResults.forEach((result, index) => {
      result.relevance_rank = index + 1;
    });

    return filteredResults;
  }

  private calculateSimilarity(query: string, insight: RAGInsight): number {
    const queryLower = query.toLowerCase();
    const insightText = insight.insight_text.toLowerCase();
    const tags = insight.tags.join(' ').toLowerCase();
    const category = insight.category.toLowerCase();

    // Simple keyword-based similarity (in production, use proper embeddings)
    const queryWords = queryLower.split(/\s+/);
    let score = 0;

    queryWords.forEach(word => {
      if (insightText.includes(word)) score += 0.3;
      if (tags.includes(word)) score += 0.2;
      if (category.includes(word)) score += 0.1;
    });

    // Boost score based on confidence
    score *= (0.5 + insight.confidence_score * 0.5);

    return Math.min(score, 1.0);
  }

  async findCampaignCorrelations(campaignId: string): Promise<CampaignCorrelation[]> {
    const ragIndex = await this.loadRAGIndex();
    
    return ragIndex.campaign_correlations.filter(correlation =>
      correlation.primary_campaign === campaignId ||
      correlation.related_campaigns.includes(campaignId)
    );
  }

  async generateRecommendations(
    currentContext: any,
    relevantInsights: RAGSearchResult[]
  ): Promise<InsightRecommendation[]> {
    const recommendations: InsightRecommendation[] = [];

    // Group insights by category
    const insightsByCategory = relevantInsights.reduce((acc, result) => {
      const category = result.insight.category;
      if (!acc[category]) acc[category] = [];
      acc[category].push(result);
      return acc;
    }, {} as Record<string, RAGSearchResult[]>);

    // Generate recommendations for each category
    Object.entries(insightsByCategory).forEach(([category, insights], index) => {
      const avgConfidence = insights.reduce((sum, result) => 
        sum + result.insight.confidence_score, 0) / insights.length;
      
      const avgSimilarity = insights.reduce((sum, result) => 
        sum + result.similarity_score, 0) / insights.length;

      const recommendation: InsightRecommendation = {
        id: `rec_${category}_${index}`,
        title: this.generateRecommendationTitle(category, insights),
        description: this.generateRecommendationDescription(category, insights),
        confidence: (avgConfidence + avgSimilarity) / 2,
        impact_estimate: this.estimateImpact(avgConfidence, insights.length),
        implementation_effort: this.estimateEffort(category),
        supporting_insights: insights.map(result => result.insight.id),
        related_metrics: this.extractRelatedMetrics(insights),
        action_items: this.generateActionItems(category, insights)
      };

      recommendations.push(recommendation);
    });

    return recommendations.sort((a, b) => b.confidence - a.confidence);
  }

  private generateRecommendationTitle(category: string, insights: RAGSearchResult[]): string {
    const categoryTitles = {
      'performance_optimization': 'Optimize Campaign Performance',
      'audience_insights': 'Enhance Audience Targeting',
      'seasonal_trends': 'Leverage Seasonal Opportunities',
      'lead_generation': 'Improve Lead Generation',
      'app_marketing': 'Boost App Marketing Results',
      'content_strategy': 'Strengthen Content Strategy',
      'retargeting_optimization': 'Optimize Retargeting Campaigns',
      'trust_building': 'Build Customer Trust'
    };

    return categoryTitles[category as keyof typeof categoryTitles] || `Improve ${category.replace('_', ' ')}`;
  }

  private generateRecommendationDescription(
    category: string, 
    insights: RAGSearchResult[]
  ): string {
    const topInsight = insights[0]?.insight;
    if (!topInsight) return '';

    return `Based on ${insights.length} historical insight(s), ` +
           `we recommend focusing on ${topInsight.insight_text.slice(0, 100)}...`;
  }

  private estimateImpact(confidence: number, insightCount: number): 'high' | 'medium' | 'low' {
    const score = confidence * Math.log(insightCount + 1);
    if (score > 0.8) return 'high';
    if (score > 0.5) return 'medium';
    return 'low';
  }

  private estimateEffort(category: string): 'high' | 'medium' | 'low' {
    const effortMap = {
      'performance_optimization': 'medium',
      'audience_insights': 'low',
      'seasonal_trends': 'low',
      'lead_generation': 'medium',
      'app_marketing': 'high',
      'content_strategy': 'medium',
      'retargeting_optimization': 'low',
      'trust_building': 'high'
    };

    return effortMap[category as keyof typeof effortMap] as 'high' | 'medium' | 'low' || 'medium';
  }

  private extractRelatedMetrics(insights: RAGSearchResult[]): string[] {
    const metrics = new Set<string>();
    
    insights.forEach(result => {
      result.insight.tags.forEach(tag => {
        if (tag.includes('roi') || tag.includes('conversion') || 
            tag.includes('engagement') || tag.includes('ctr')) {
          metrics.add(tag);
        }
      });
    });

    return Array.from(metrics).slice(0, 5);
  }

  private generateActionItems(category: string, insights: RAGSearchResult[]): string[] {
    const actionMap = {
      'performance_optimization': [
        'Review current targeting parameters',
        'Test timing optimizations',
        'Analyze creative performance'
      ],
      'audience_insights': [
        'Segment audience by behavior patterns',
        'Create persona-specific content',
        'Test new targeting criteria'
      ],
      'seasonal_trends': [
        'Plan seasonal campaign calendar',
        'Prepare holiday-specific creative assets',
        'Schedule pre-launch content seeding'
      ]
    };

    return actionMap[category as keyof typeof actionMap] || [
      'Analyze current performance metrics',
      'Implement recommended changes',
      'Monitor results and iterate'
    ];
  }

  async addInsight(insight: Omit<RAGInsight, 'id' | 'created_by' | 'last_updated'>): Promise<string> {
    const ragIndex = await this.loadRAGIndex();
    
    const newInsight: RAGInsight = {
      ...insight,
      id: `insight_${Date.now()}`,
      created_by: 'geniebot_agent',
      last_updated: new Date().toISOString()
    };

    ragIndex.insights.push(newInsight);
    ragIndex.metadata.total_insights = ragIndex.insights.length;
    ragIndex.metadata.last_updated = new Date().toISOString();

    // In production, this would update the vector database
    // For now, we'll just update the in-memory cache
    this.ragIndex = ragIndex;

    return newInsight.id;
  }
}

// Export singleton instance
export const ragMemoryEngine = new RAGMemoryEngine();

// Convenience functions for common operations
export async function searchCampaignInsights(
  query: string, 
  campaignId?: string
): Promise<RAGSearchResult[]> {
  const searchQuery: RAGSearchQuery = {
    query,
    filters: campaignId ? { campaign_ids: [campaignId] } : {},
    limit: 5,
    similarity_threshold: 0.6
  };

  return ragMemoryEngine.searchInsights(searchQuery);
}

export async function getRecommendationsForContext(
  context: any
): Promise<InsightRecommendation[]> {
  // Extract relevant query from context
  const query = `${context.page || ''} ${context.metric || ''} ${context.filters?.channel || ''}`.trim();
  
  if (!query) return [];

  const insights = await searchCampaignInsights(query);
  return ragMemoryEngine.generateRecommendations(context, insights);
}

export async function findRelatedCampaigns(campaignId: string): Promise<CampaignCorrelation[]> {
  return ragMemoryEngine.findCampaignCorrelations(campaignId);
}