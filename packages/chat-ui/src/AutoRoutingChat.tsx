/**
 * Auto-Routing Chat Interface
 * Automatically routes to correct assistant based on message content
 * No manual selection required - seamless user experience
 */

import React, { useState, useEffect } from 'react';
import { routeToAssistant, CORRECTED_ASSISTANT_CONFIGS } from '@ai/agents';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  assistant?: string;
  timestamp: Date;
}

export const AutoRoutingChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentAssistant, setCurrentAssistant] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const handleSendMessage = async (userMessage: string) => {
    if (!userMessage.trim()) return;

    // Auto-route based on message content
    const { assistant, systemPrompt } = routeToAssistant(userMessage);
    
    // Update current assistant if different
    if (assistant && assistant.id !== currentAssistant) {
      setCurrentAssistant(assistant.id);
    }

    // Add user message
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
      // Simulate AI response (replace with actual LLM call)
      const response = await simulateAIResponse(systemPrompt, userMessage, assistant);
      
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        assistant: assistant?.id,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMsg]);
    } catch (error) {
      console.error('Error getting AI response:', error);
    } finally {
      setIsTyping(false);
    }
  };

  const simulateAIResponse = async (systemPrompt: string | null, userMessage: string, assistant: any) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    if (!assistant) {
      return "I can help you with retail insights, campaign analysis, or TBWA knowledge. What would you like to know?";
    }

    // Generate contextual response based on assistant type
    const responses = {
      'tes': generateRetailResponse(userMessage),
      'ces': generateCampaignResponse(userMessage), 
      'tbwa': generateTBWAResponse(userMessage)
    };

    return responses[assistant.id] || "I'm here to help! What would you like to know?";
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header - Shows current assistant automatically */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">AI Agency Assistant</h1>
          
          {/* Auto-detected assistant indicator */}
          {currentAssistant && (
            <div className="flex items-center space-x-2 bg-blue-50 px-3 py-1 rounded-full">
              <span className="text-lg">
                {CORRECTED_ASSISTANT_CONFIGS[currentAssistant]?.avatar}
              </span>
              <span className="text-sm font-medium text-blue-700">
                {CORRECTED_ASSISTANT_CONFIGS[currentAssistant]?.name}
              </span>
            </div>
          )}
        </div>

        {/* Capabilities hint */}
        {currentAssistant && (
          <div className="mt-2 text-xs text-gray-500">
            {CORRECTED_ASSISTANT_CONFIGS[currentAssistant]?.description}
          </div>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.length === 0 && (
          <WelcomeMessage />
        )}

        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {/* Typing Indicator */}
        {isTyping && <TypingIndicator assistant={currentAssistant} />}
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <div className="flex space-x-4">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(inputValue);
              }
            }}
            placeholder="Ask about retail sales, campaign performance, or TBWA knowledge..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          
          <button
            onClick={() => handleSendMessage(inputValue)}
            disabled={!inputValue.trim() || isTyping}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </div>

        {/* Smart suggestions based on context */}
        <QuickSuggestions onSuggestionClick={handleSendMessage} />
      </div>
    </div>
  );
};

// Welcome message with examples
const WelcomeMessage: React.FC = () => (
  <div className="text-center py-8">
    <div className="text-4xl mb-4">🤖</div>
    <h2 className="text-xl font-semibold text-gray-900 mb-2">
      Welcome to AI Agency Assistant
    </h2>
    <p className="text-gray-600 mb-6">
      I automatically understand what you need help with. Just ask naturally!
    </p>
    
    <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
      <ExampleCard
        icon="🏪"
        title="Retail Insights"
        examples={[
          "Show Alaska sales in Luzon",
          "Oishi brand sentiment today",
          "Top performing stores"
        ]}
      />
      <ExampleCard
        icon="📊"
        title="Campaign Analysis"
        examples={[
          "Campaign ROI this quarter",
          "Creative performance test",
          "Budget optimization tips"
        ]}
      />
      <ExampleCard
        icon="🏢"
        title="TBWA Knowledge"
        examples={[
          "Client project updates",
          "Creative brief template",
          "TBWA methodology guide"
        ]}
      />
    </div>
  </div>
);

const ExampleCard: React.FC<{icon: string, title: string, examples: string[]}> = ({ 
  icon, title, examples 
}) => (
  <div className="bg-white rounded-lg p-4 border border-gray-200">
    <div className="text-2xl mb-2">{icon}</div>
    <h3 className="font-medium text-gray-900 mb-3">{title}</h3>
    <div className="space-y-2">
      {examples.map((example, i) => (
        <div key={i} className="text-sm text-gray-600 bg-gray-50 px-2 py-1 rounded">
          "{example}"
        </div>
      ))}
    </div>
  </div>
);

// Message bubble component
const MessageBubble: React.FC<{message: Message}> = ({ message }) => {
  const isUser = message.role === 'user';
  const assistant = message.assistant ? CORRECTED_ASSISTANT_CONFIGS[message.assistant] : null;

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
        isUser 
          ? 'bg-blue-600 text-white' 
          : 'bg-white text-gray-900 border border-gray-200'
      }`}>
        {/* Assistant indicator */}
        {!isUser && assistant && (
          <div className="flex items-center space-x-2 mb-2 text-xs text-gray-500">
            <span>{assistant.avatar}</span>
            <span>{assistant.name}</span>
          </div>
        )}
        
        <div className="whitespace-pre-wrap">{message.content}</div>
        
        <div className={`text-xs mt-2 ${isUser ? 'text-blue-100' : 'text-gray-400'}`}>
          {message.timestamp.toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};

// Typing indicator
const TypingIndicator: React.FC<{assistant: string | null}> = ({ assistant }) => {
  const assistantConfig = assistant ? CORRECTED_ASSISTANT_CONFIGS[assistant] : null;

  return (
    <div className="flex justify-start">
      <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 max-w-xs">
        {assistantConfig && (
          <div className="flex items-center space-x-2 mb-2 text-xs text-gray-500">
            <span>{assistantConfig.avatar}</span>
            <span>{assistantConfig.name}</span>
          </div>
        )}
        
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
        </div>
      </div>
    </div>
  );
};

// Smart suggestions based on recent context
const QuickSuggestions: React.FC<{onSuggestionClick: (suggestion: string) => void}> = ({ 
  onSuggestionClick 
}) => {
  const suggestions = [
    "Show top brands this month",
    "Campaign performance summary", 
    "Brand sentiment analysis",
    "Store performance report"
  ];

  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {suggestions.map((suggestion, i) => (
        <button
          key={i}
          onClick={() => onSuggestionClick(suggestion)}
          className="text-xs px-3 py-1 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
        >
          {suggestion}
        </button>
      ))}
    </div>
  );
};

// Helper functions for generating contextual responses
function generateRetailResponse(userMessage: string): string {
  if (userMessage.toLowerCase().includes('alaska')) {
    return "Alaska brand analysis: Strong performance in Luzon region with 23% market share in dairy category. Sentiment trending positive (+0.8) across social platforms. Key insights: Premium positioning resonating well with urban consumers.";
  }
  if (userMessage.toLowerCase().includes('sales')) {
    return "Sales performance overview: Top 3 regions by revenue - Luzon (₱45M), Visayas (₱32M), Mindanao (₱28M). Notable trends: Snacks category up 15% QoQ, beverages seasonal peak detected.";
  }
  return "Retail insights: I can help you analyze brand performance, regional sales trends, store operations, and social media sentiment for FMCG brands across the Philippines.";
}

function generateCampaignResponse(userMessage: string): string {
  if (userMessage.toLowerCase().includes('roi')) {
    return "Campaign ROI analysis: Q4 campaigns averaging 3.2x ROAS. Digital channels outperforming traditional by 18%. Recommendation: Increase budget allocation to social media campaigns showing 4.1x ROAS.";
  }
  if (userMessage.toLowerCase().includes('creative')) {
    return "Creative performance insights: Video assets showing 2.3x higher engagement vs static. A/B testing reveals emotional storytelling increases conversion rate by 31%. Suggest refreshing creative rotation to combat fatigue.";
  }
  return "Campaign effectiveness: I can analyze ROI, optimize media mix, test creative performance, and provide attribution insights to maximize your advertising impact.";
}

function generateTBWAResponse(userMessage: string): string {
  if (userMessage.toLowerCase().includes('client')) {
    return "Client project updates: 3 active campaigns in development, 2 pending creative approvals. Latest brand strategy sessions scheduled for next week. Access full project timeline in knowledge base.";
  }
  if (userMessage.toLowerCase().includes('brief')) {
    return "Creative brief assistance: TBWA Disruption methodology suggests focusing on convention identification first. Template includes: brand truth, market truth, disruption opportunity, and creative vision. Need specific client guidance?";
  }
  return "TBWA knowledge: I can help with client projects, creative briefs, campaign case studies, methodology guidance, and internal documentation. What specific information do you need?";
}

export default AutoRoutingChat;