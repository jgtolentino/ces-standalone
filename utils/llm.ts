interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface LLMOptions {
  maxTokens?: number;
  temperature?: number;
  stream?: boolean;
}

export class LLMUtils {
  static async generateResponse(
    messages: Message[],
    options: LLMOptions = {}
  ): Promise<{ content: string }> {
    // Mock implementation for local development
    // In production, this would call Azure OpenAI
    
    const { maxTokens = 1000, temperature = 0.7 } = options;
    
    // For now, return a mock response
    // This will be replaced with actual Azure OpenAI call
    const lastMessage = messages[messages.length - 1];
    
    // Simple mock response based on the query
    let response = "I'm Ask CES, your AI assistant for campaign effectiveness analysis. ";
    
    if (lastMessage.content.toLowerCase().includes('roi')) {
      response += "Based on the campaign data, I can see that ROI performance varies significantly across different campaigns. The top performers typically show ROI values above 5.0, with strong correlation to engagement rates and brand recall metrics.";
    } else if (lastMessage.content.toLowerCase().includes('campaign')) {
      response += "Looking at the campaign analytics, I notice several key trends in performance metrics. Engagement rates average around 7.2%, while conversion rates typically range from 2-8% depending on the campaign strategy and creative approach.";
    } else if (lastMessage.content.toLowerCase().includes('creative')) {
      response += "Creative performance analysis shows that visual elements with high brand integration tend to perform better. Color harmony and visual distinctness are key factors in driving engagement and memorability.";
    } else {
      response += "I can help you analyze campaign effectiveness across multiple dimensions including ROI, engagement, brand recall, and creative performance. What specific aspect would you like me to focus on?";
    }
    
    return { content: response };
  }
}

// Note: In production, replace this with actual Azure OpenAI integration
// Example implementation:
/*
import { OpenAIApi, Configuration } from 'openai';

const configuration = new Configuration({
  apiKey: process.env.AZURE_OPENAI_API_KEY,
  basePath: process.env.AZURE_OPENAI_ENDPOINT,
});

const openai = new OpenAIApi(configuration);

export class LLMUtils {
  static async generateResponse(messages: Message[], options: LLMOptions = {}) {
    const response = await openai.createChatCompletion({
      model: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4o',
      messages,
      max_tokens: options.maxTokens || 1000,
      temperature: options.temperature || 0.7,
      stream: options.stream || false,
    });

    return {
      content: response.data.choices[0]?.message?.content || 'No response generated'
    };
  }
}
*/