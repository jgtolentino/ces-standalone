/**
 * Smart Auto-Router - Zero Manual Selection Required
 * Automatically detects intent and routes to correct assistant
 */

export interface RouterAnalysis {
  assistant: string | null;
  confidence: number;
  reasoning: string;
  detectedTopics: string[];
  suggestedFollowUp?: string[];
}

export class SmartAutoRouter {
  private static keywordPatterns = {
    // TES: Retail + Brand Monitoring (Combined)
    tes: {
      retail: [
        'sales', 'revenue', 'store', 'sku', 'product', 'brand performance',
        'market share', 'consumer', 'customer', 'purchase', 'buying',
        'luzon', 'visayas', 'mindanao', 'region', 'philippines', 'filipino',
        'alaska', 'oishi', 'krem-top', 'nestlé', 'unilever',
        'snacks', 'beverages', 'dairy', 'fmcg', 'retail', 'category'
      ],
      monitoring: [
        'sentiment', 'social media', 'mentions', 'buzz', 'trending', 'viral',
        'facebook', 'twitter', 'instagram', 'tiktok', 'youtube',
        'reputation', 'crisis', 'negative', 'positive', 'engagement',
        'comments', 'shares', 'likes', 'followers', 'influencer'
      ]
    },

    // CES: Campaign + Creative Intelligence  
    ces: {
      campaign: [
        'campaign', 'advertising', 'ad', 'marketing', 'media', 'budget',
        'roi', 'roas', 'ctr', 'cpc', 'cpm', 'impressions', 'clicks',
        'conversions', 'attribution', 'reach', 'frequency', 'targeting'
      ],
      creative: [
        'creative', 'asset', 'design', 'copy', 'video', 'image', 'banner',
        'fatigue', 'testing', 'variation', 'performance', 'optimization',
        'brand awareness', 'engagement', 'storytelling', 'messaging'
      ]
    },

    // TBWA: Internal Knowledge
    tbwa: [
      'client', 'project', 'brief', 'strategy', 'methodology', 'process',
      'tbwa', 'internal', 'team', 'workflow', 'documentation', 'knowledge',
      'disruption', 'framework', 'guidelines', 'template', 'approval'
    ]
  };

  /**
   * Analyze message and auto-route to appropriate assistant
   */
  static analyzeAndRoute(message: string): RouterAnalysis {
    const normalizedMessage = message.toLowerCase().trim();
    const words = normalizedMessage.split(/\s+/);
    
    // Calculate scores for each assistant
    const scores = {
      tes: this.calculateTESScore(words),
      ces: this.calculateCESScore(words),
      tbwa: this.calculateTBWAScore(words)
    };

    // Find highest scoring assistant
    const maxScore = Math.max(...Object.values(scores));
    const topAssistant = Object.entries(scores).find(([_, score]) => score === maxScore)?.[0];

    // Determine confidence based on score and gap
    const confidence = this.calculateConfidence(scores, maxScore);
    
    // Generate reasoning and detected topics
    const reasoning = this.generateReasoning(topAssistant, scores, normalizedMessage);
    const detectedTopics = this.detectTopics(normalizedMessage);

    return {
      assistant: confidence > 0.6 ? topAssistant || null : null,
      confidence,
      reasoning,
      detectedTopics,
      suggestedFollowUp: this.generateFollowUpSuggestions(topAssistant)
    };
  }

  private static calculateTESScore(words: string[]): number {
    const retailScore = this.countMatches(words, this.keywordPatterns.tes.retail);
    const monitoringScore = this.countMatches(words, this.keywordPatterns.tes.monitoring);
    
    // Boost score if both retail and monitoring concepts present
    const combinedBonus = retailScore > 0 && monitoringScore > 0 ? 2 : 0;
    
    return retailScore + monitoringScore + combinedBonus;
  }

  private static calculateCESScore(words: string[]): number {
    const campaignScore = this.countMatches(words, this.keywordPatterns.ces.campaign);
    const creativeScore = this.countMatches(words, this.keywordPatterns.ces.creative);
    
    // Boost score if both campaign and creative concepts present
    const combinedBonus = campaignScore > 0 && creativeScore > 0 ? 2 : 0;
    
    return campaignScore + creativeScore + combinedBonus;
  }

  private static calculateTBWAScore(words: string[]): number {
    return this.countMatches(words, this.keywordPatterns.tbwa);
  }

  private static countMatches(words: string[], patterns: string[]): number {
    return words.reduce((count, word) => {
      return count + (patterns.some(pattern => 
        word.includes(pattern) || pattern.includes(word)
      ) ? 1 : 0);
    }, 0);
  }

  private static calculateConfidence(scores: Record<string, number>, maxScore: number): number {
    const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
    
    if (totalScore === 0) return 0;
    if (maxScore === 0) return 0;
    
    // Confidence based on relative dominance
    const dominance = maxScore / totalScore;
    
    // Also consider absolute score strength
    const absoluteStrength = Math.min(maxScore / 5, 1); // Cap at 5 matches
    
    return Math.min(dominance * absoluteStrength, 1);
  }

  private static generateReasoning(
    assistant: string | null, 
    scores: Record<string, number>, 
    message: string
  ): string {
    if (!assistant) {
      return "Unable to determine specific domain. Message appears to be general inquiry.";
    }

    const reasoningMap = {
      tes: `Detected retail/brand monitoring context (score: ${scores.tes}). Keywords suggest Philippine market analysis or social media monitoring needs.`,
      ces: `Detected campaign/creative context (score: ${scores.ces}). Keywords suggest advertising performance or creative optimization focus.`,
      tbwa: `Detected internal knowledge context (score: ${scores.tbwa}). Keywords suggest TBWA process or client project inquiry.`
    };

    return reasoningMap[assistant] || "Auto-routing based on content analysis.";
  }

  private static detectTopics(message: string): string[] {
    const topics: string[] = [];
    
    // Detect specific topics
    const topicPatterns = {
      'Philippine Retail': ['luzon', 'visayas', 'mindanao', 'philippines', 'filipino'],
      'Brand Performance': ['brand performance', 'market share', 'sales analysis'],
      'Social Media': ['social media', 'facebook', 'twitter', 'instagram', 'sentiment'],
      'Campaign ROI': ['roi', 'roas', 'campaign performance', 'advertising'],
      'Creative Testing': ['creative', 'testing', 'asset', 'design', 'copy'],
      'Client Projects': ['client', 'project', 'brief', 'strategy']
    };

    Object.entries(topicPatterns).forEach(([topic, patterns]) => {
      if (patterns.some(pattern => message.includes(pattern))) {
        topics.push(topic);
      }
    });

    return topics;
  }

  private static generateFollowUpSuggestions(assistant: string | null): string[] {
    const suggestions = {
      tes: [
        "Show regional performance breakdown",
        "Analyze competitor social sentiment",
        "Compare brand performance vs industry"
      ],
      ces: [
        "Optimize budget allocation",
        "Test creative variations", 
        "Analyze attribution paths"
      ],
      tbwa: [
        "Access project timeline",
        "Review creative guidelines",
        "Get methodology documentation"
      ]
    };

    return assistant ? suggestions[assistant] || [] : [
      "Specify retail, campaign, or TBWA topic",
      "Ask about specific metrics or data",
      "Request analysis or recommendations"
    ];
  }

  /**
   * Get routing decision with explanation
   */
  static getRoutingDecision(message: string): {
    shouldRoute: boolean;
    targetAssistant: string | null;
    explanation: string;
    confidence: number;
  } {
    const analysis = this.analyzeAndRoute(message);
    
    return {
      shouldRoute: analysis.confidence > 0.6,
      targetAssistant: analysis.assistant,
      explanation: analysis.reasoning,
      confidence: analysis.confidence
    };
  }

  /**
   * Batch analyze multiple messages for pattern detection
   */
  static analyzeConversationPattern(messages: string[]): {
    dominantDomain: string | null;
    confidence: number;
    topicProgression: string[];
  } {
    const analyses = messages.map(msg => this.analyzeAndRoute(msg));
    
    // Count assistant assignments
    const assistantCounts = analyses.reduce((counts, analysis) => {
      if (analysis.assistant) {
        counts[analysis.assistant] = (counts[analysis.assistant] || 0) + 1;
      }
      return counts;
    }, {} as Record<string, number>);

    const dominantDomain = Object.entries(assistantCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || null;

    const confidence = dominantDomain 
      ? assistantCounts[dominantDomain] / messages.length 
      : 0;

    const topicProgression = analyses
      .flatMap(analysis => analysis.detectedTopics)
      .filter((topic, index, arr) => arr.indexOf(topic) === index);

    return {
      dominantDomain,
      confidence,
      topicProgression
    };
  }
}