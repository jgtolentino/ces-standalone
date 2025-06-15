// Centralized LLM routing via Azure OpenAI API
// Standardized for Scout, CES, Ask CES, and all AI agents

import { OpenAIClient, AzureKeyCredential } from "@azure/openai";

// Azure OpenAI configuration
const endpoint = process.env.AZURE_OPENAI_ENDPOINT!;
const apiKey = process.env.AZURE_OPENAI_KEY!;
const deploymentId = process.env.AZURE_OPENAI_DEPLOYMENT_ID || "gpt-4-turbo";

// Initialize client
const client = new OpenAIClient(endpoint, new AzureKeyCredential(apiKey));

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatOptions {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  stream?: boolean;
}

/**
 * Primary Azure OpenAI chat function
 * Used by all agents: Scout, CES, Ask CES, RetailBot, etc.
 */
export async function azureOpenAIChat(
  messages: ChatMessage[],
  options: ChatOptions = {}
): Promise<string> {
  try {
    const {
      temperature = 0.7,
      maxTokens = 1024,
      topP = 0.95,
      stream = false
    } = options;

    const response = await client.getChatCompletions(deploymentId, messages, {
      temperature,
      maxTokens,
      topP,
      stream
    });

    return response.choices?.[0]?.message?.content ?? "[Azure OpenAI error: No response]";
  } catch (error) {
    console.error("Azure OpenAI API Error:", error);
    return `[Azure OpenAI error: ${error instanceof Error ? error.message : String(error)}]`;
  }
}

/**
 * Streaming chat function for real-time responses
 */
export async function azureOpenAIChatStream(
  messages: ChatMessage[],
  options: ChatOptions = {}
): Promise<AsyncIterable<string>> {
  const {
    temperature = 0.7,
    maxTokens = 1024,
    topP = 0.95
  } = options;

  try {
    const response = await client.getChatCompletions(deploymentId, messages, {
      temperature,
      maxTokens,
      topP,
      stream: true
    });

    return streamToAsyncIterable(response);
  } catch (error) {
    console.error("Azure OpenAI Streaming Error:", error);
    throw error;
  }
}

/**
 * Helper function to convert stream to async iterable
 */
async function* streamToAsyncIterable(stream: any): AsyncIterable<string> {
  for await (const chunk of stream) {
    const content = chunk.choices?.[0]?.delta?.content;
    if (content) {
      yield content;
    }
  }
}

/**
 * Scout-specific prompts and configurations
 */
export const ScoutPrompts = {
  retailAnalysis: (query: string) => [
    {
      role: "system" as const,
      content: "You are Scout Analytics AI, specialized in Philippine retail market analysis. Provide data-driven insights for TBWA brand partners including Alaska, Oishi, Del Monte, Peerless, and JTI. Focus on actionable recommendations."
    },
    {
      role: "user" as const,
      content: query
    }
  ],
  
  trendAnalysis: (data: string, query: string) => [
    {
      role: "system" as const,
      content: "Analyze retail trends and patterns. Provide insights on consumer behavior, product performance, and market opportunities in the Philippine market."
    },
    {
      role: "user" as const,
      content: `Data: ${data}\nQuery: ${query}`
    }
  ]
};

/**
 * CES-specific prompts and configurations
 */
export const CESPrompts = {
  creativeAnalysis: (campaign: string, assets: string) => [
    {
      role: "system" as const,
      content: "You are Ask CES, TBWA's Creative Effectiveness System AI. Analyze creative campaigns using the CES framework: Memorability, Brand Connection, Emotional Resonance, Clear Communication, and Call-to-Action Strength. Provide actionable creative recommendations."
    },
    {
      role: "user" as const,
      content: `Campaign: ${campaign}\nAssets: ${assets}\nProvide CES analysis and recommendations.`
    }
  ],
  
  strategyConsult: (brief: string, context: string) => [
    {
      role: "system" as const,
      content: "You are a senior creative strategist with access to TBWA's Strategy Knowledge Repository (SKR). Provide strategic insights and creative direction based on proven frameworks and industry best practices."
    },
    {
      role: "user" as const,
      content: `Brief: ${brief}\nContext: ${context}\nProvide strategic recommendations.`
    }
  ]
};

/**
 * Utility functions for different use cases
 */
export const LLMUtils = {
  // Scout Analytics queries
  async queryScout(query: string, context?: string): Promise<string> {
    const messages = context 
      ? [...ScoutPrompts.trendAnalysis(context, query)]
      : [...ScoutPrompts.retailAnalysis(query)];
    
    return azureOpenAIChat(messages, { temperature: 0.3 });
  },

  // CES Creative analysis
  async queryCES(campaign: string, assets: string): Promise<string> {
    const messages = CESPrompts.creativeAnalysis(campaign, assets);
    return azureOpenAIChat(messages, { temperature: 0.5 });
  },

  // Ask CES strategic consultation
  async queryStrategy(brief: string, context: string): Promise<string> {
    const messages = CESPrompts.strategyConsult(brief, context);
    return azureOpenAIChat(messages, { temperature: 0.4 });
  },

  // General purpose chat
  async queryGeneral(messages: ChatMessage[]): Promise<string> {
    return azureOpenAIChat(messages);
  }
};

// Legacy function aliases for backward compatibility
export const queryClaude = LLMUtils.queryGeneral;
export const queryDevstral = LLMUtils.queryGeneral;
export const queryDeepSeek = LLMUtils.queryGeneral;

// Export client for advanced usage
export { client as azureOpenAIClient };