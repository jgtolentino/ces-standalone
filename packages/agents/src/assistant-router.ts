/**
 * Assistant Router - Maps activation phrases to tenant assistants
 * "Ask Tes" → RetailGenie, "Ask Ces" → CES-AI
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
}

export const ASSISTANT_CONFIGS: Record<string, AssistantConfig> = {
  'tes': {
    id: 'tes',
    name: 'RetailGenie (Tes)',
    tenantId: 'retail-insights',
    activationPhrases: ['ask tes', 'tes', 'retail', 'sales'],
    description: 'Philippine retail market intelligence specialist',
    avatar: '🏪',
    capabilities: [
      'FMCG brand performance analysis',
      'Regional sales trends (Luzon, Visayas, Mindanao)', 
      'SKU-level insights for Alaska, Oishi, Krem-Top',
      'Store performance optimization',
      'Consumer behavior patterns'
    ]
  },

  'ces': {
    id: 'ces', 
    name: 'CES-AI (Ces)',
    tenantId: 'ces',
    activationPhrases: ['ask ces', 'ces', 'campaign', 'roas'],
    description: 'Campaign effectiveness and ROI optimization strategist',
    avatar: '📊',
    capabilities: [
      'Campaign ROI and ROAS analysis',
      'Media mix optimization',
      'Attribution modeling',
      'Creative performance testing',
      'Budget allocation recommendations'
    ]
  },

  'scout': {
    id: 'scout',
    name: 'Scout',
    tenantId: 'scout', 
    activationPhrases: ['ask scout', 'scout', 'brand monitoring', 'sentiment'],
    description: 'Brand intelligence and social media monitoring',
    avatar: '🔍',
    capabilities: [
      'Brand mention tracking',
      'Sentiment analysis',
      'Competitive intelligence', 
      'Crisis detection',
      'Social media trends'
    ]
  },

  'tbwa': {
    id: 'tbwa',
    name: 'TBWA Assistant',
    tenantId: 'tbwa-chat',
    activationPhrases: ['ask tbwa', 'tbwa', 'knowledge', 'client'],
    description: 'TBWA internal knowledge and client information assistant',
    avatar: '🏢',
    capabilities: [
      'Client project information',
      'TBWA methodology guidance',
      'Creative brief assistance',
      'Campaign case studies',
      'Internal knowledge base search'
    ]
  }
};

export class AssistantRouter {
  /**
   * Route user input to appropriate assistant based on activation phrases
   */
  static routeMessage(input: string): AssistantConfig | null {
    const normalizedInput = input.toLowerCase().trim();
    
    // Check for explicit activation phrases first
    for (const config of Object.values(ASSISTANT_CONFIGS)) {
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
   * Smart routing based on message content analysis
   */
  private static smartRoute(input: string): AssistantConfig | null {
    const keywords = {
      retail: ['sales', 'store', 'sku', 'brand performance', 'luzon', 'visayas', 'mindanao', 'alaska', 'oishi', 'krem-top'],
      campaign: ['roi', 'roas', 'ctr', 'cpc', 'campaign', 'budget', 'media', 'advertising', 'impressions'],
      social: ['mentions', 'sentiment', 'social media', 'twitter', 'facebook', 'brand monitoring'],
      internal: ['client', 'project', 'tbwa', 'brief', 'strategy', 'methodology']
    };

    const scores = {
      tes: this.calculateScore(input, keywords.retail),
      ces: this.calculateScore(input, keywords.campaign), 
      scout: this.calculateScore(input, keywords.social),
      tbwa: this.calculateScore(input, keywords.internal)
    };

    const topAssistant = Object.entries(scores).reduce((a, b) => 
      scores[a[0]] > scores[b[0]] ? a : b
    );

    // Only route if confidence is high enough
    return scores[topAssistant[0]] > 2 ? ASSISTANT_CONFIGS[topAssistant[0]] : null;
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
    const config = ASSISTANT_CONFIGS[assistantId];
    if (!config) {
      throw new Error(`Unknown assistant: ${assistantId}`);
    }

    return getSystemPrompt(config.tenantId as any, context);
  }

  /**
   * List all available assistants
   */
  static getAvailableAssistants(): AssistantConfig[] {
    return Object.values(ASSISTANT_CONFIGS);
  }

  /**
   * Get assistant by tenant ID
   */
  static getAssistantByTenant(tenantId: string): AssistantConfig | null {
    return Object.values(ASSISTANT_CONFIGS).find(config => config.tenantId === tenantId) || null;
  }
}

// Helper function for easy routing
export function routeToAssistant(message: string): {
  assistant: AssistantConfig | null;
  systemPrompt: string | null;
} {
  const assistant = AssistantRouter.routeMessage(message);
  
  if (!assistant) {
    return { assistant: null, systemPrompt: null };
  }

  const systemPrompt = AssistantRouter.getAssistantPrompt(assistant.id);
  
  return { assistant, systemPrompt };
}