/**
 * Corrected Assistant Router - Only 3 Tenants
 * 1. "Ask Tes" → RetailGenie (retail insights + brand monitoring)
 * 2. "Ask Ces" → CES-AI (campaign effectiveness) 
 * 3. "Ask TBWA" → TBWA Assistant (internal knowledge)
 */

import { getSystemPrompt } from './prompts/prompt-factory';

export interface AssistantConfig {
  id: string;
  name: string;
  tenantId: string;
  activationPhrases: string[];
  description: string;
  avatar: string;
  capabilities: string[];
  combinedFunctions: string[];
}

export const CORRECTED_ASSISTANT_CONFIGS: Record<string, AssistantConfig> = {
  'tes': {
    id: 'tes',
    name: 'RetailGenie (Tes)',
    tenantId: 'retail-insights',
    activationPhrases: ['ask tes', 'tes', 'retail', 'sales', 'brand monitoring', 'sentiment'],
    description: 'Philippine retail intelligence + brand monitoring specialist',
    avatar: '🏪',
    capabilities: [
      'FMCG brand performance analysis',
      'Regional sales trends (Luzon, Visayas, Mindanao)', 
      'SKU-level insights for Alaska, Oishi, Krem-Top',
      'Store performance optimization',
      'Consumer behavior patterns'
    ],
    combinedFunctions: [
      // RETAIL FUNCTIONS
      'Philippine retail sales analysis',
      'Brand performance tracking', 
      'Store operations insights',
      'Regional market intelligence',
      // BRAND MONITORING FUNCTIONS (merged from Scout)
      'Social media brand mentions',
      'Sentiment analysis and tracking',
      'Competitive intelligence monitoring',
      'Crisis detection and alerts',
      'Social media trend analysis'
    ]
  },

  'ces': {
    id: 'ces', 
    name: 'CES-AI (Ces)',
    tenantId: 'ces',
    activationPhrases: ['ask ces', 'ces', 'campaign', 'roas', 'creative'],
    description: 'Campaign effectiveness + creative intelligence strategist',
    avatar: '📊',
    capabilities: [
      'Campaign ROI and ROAS analysis',
      'Media mix optimization',
      'Attribution modeling',
      'Creative performance testing',
      'Budget allocation recommendations'
    ],
    combinedFunctions: [
      // CAMPAIGN EFFECTIVENESS
      'Campaign performance analysis',
      'ROI and ROAS optimization',
      'Media attribution modeling',
      'Budget allocation strategy',
      // CREATIVE INTELLIGENCE (expanded scope)
      'Creative asset performance analysis',
      'Creative fatigue detection',
      'A/B testing insights',
      'Creative optimization recommendations',
      'Brand creative intelligence'
    ]
  },

  'tbwa': {
    id: 'tbwa',
    name: 'TBWA Assistant',
    tenantId: 'tbwa-chat',
    activationPhrases: ['ask tbwa', 'tbwa', 'knowledge', 'client', 'internal'],
    description: 'TBWA internal knowledge and client information assistant',
    avatar: '🏢',
    capabilities: [
      'Client project information',
      'TBWA methodology guidance',
      'Creative brief assistance',
      'Campaign case studies',
      'Internal knowledge base search'
    ],
    combinedFunctions: [
      'Client project knowledge management',
      'TBWA methodology and frameworks',
      'Creative brief development support',
      'Historical campaign case studies',
      'Internal documentation search',
      'Team collaboration assistance',
      'Process and workflow guidance'
    ]
  }
};

export class CorrectedAssistantRouter {
  /**
   * Route user input to one of 3 assistants only
   */
  static routeMessage(input: string): AssistantConfig | null {
    const normalizedInput = input.toLowerCase().trim();
    
    // Check for explicit activation phrases first
    for (const config of Object.values(CORRECTED_ASSISTANT_CONFIGS)) {
      for (const phrase of config.activationPhrases) {
        if (normalizedInput.includes(phrase)) {
          return config;
        }
      }
    }

    // Smart routing based on content keywords
    return this.smartRoute(normalizedInput);
  }

  /**
   * Smart routing for 3 tenants only
   */
  private static smartRoute(input: string): AssistantConfig | null {
    const keywords = {
      // TES: Retail + Brand Monitoring
      tes: [
        // Retail keywords
        'sales', 'store', 'sku', 'brand performance', 'luzon', 'visayas', 'mindanao', 
        'alaska', 'oishi', 'krem-top', 'retail', 'fmcg', 'consumer',
        // Brand monitoring keywords  
        'mentions', 'sentiment', 'social media', 'twitter', 'facebook', 'monitoring',
        'reputation', 'crisis', 'trending', 'buzz'
      ],
      
      // CES: Campaign + Creative Intelligence
      ces: [
        'roi', 'roas', 'ctr', 'cpc', 'campaign', 'budget', 'media', 'advertising', 
        'impressions', 'creative', 'asset', 'fatigue', 'optimization', 'attribution',
        'testing', 'performance', 'effectiveness'
      ],
      
      // TBWA: Internal Knowledge
      tbwa: [
        'client', 'project', 'tbwa', 'brief', 'strategy', 'methodology', 'internal',
        'knowledge', 'documentation', 'process', 'workflow', 'team', 'collaboration'
      ]
    };

    const scores = {
      tes: this.calculateScore(input, keywords.tes),
      ces: this.calculateScore(input, keywords.ces), 
      tbwa: this.calculateScore(input, keywords.tbwa)
    };

    const topAssistant = Object.entries(scores).reduce((a, b) => 
      scores[a[0]] > scores[b[0]] ? a : b
    );

    // Only route if confidence is high enough
    return scores[topAssistant[0]] > 2 ? CORRECTED_ASSISTANT_CONFIGS[topAssistant[0]] : null;
  }

  private static calculateScore(input: string, keywords: string[]): number {
    return keywords.reduce((score, keyword) => {
      return score + (input.includes(keyword) ? 1 : 0);
    }, 0);
  }

  /**
   * Get system prompt for routed assistant
   */
  static getAssistantPrompt(assistantId: string, context: 'chat' | 'api' | 'dashboard' = 'chat'): string {
    const config = CORRECTED_ASSISTANT_CONFIGS[assistantId];
    if (!config) {
      throw new Error(`Unknown assistant: ${assistantId}`);
    }

    return getSystemPrompt(config.tenantId as any, context);
  }

  /**
   * List all 3 available assistants
   */
  static getAvailableAssistants(): AssistantConfig[] {
    return Object.values(CORRECTED_ASSISTANT_CONFIGS);
  }
}

// Helper function for easy routing
export function routeToAssistant(message: string): {
  assistant: AssistantConfig | null;
  systemPrompt: string | null;
} {
  const assistant = CorrectedAssistantRouter.routeMessage(message);
  
  if (!assistant) {
    return { assistant: null, systemPrompt: null };
  }

  const systemPrompt = CorrectedAssistantRouter.getAssistantPrompt(assistant.id);
  
  return { assistant, systemPrompt };
}