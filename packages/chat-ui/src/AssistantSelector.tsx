/**
 * Assistant Selector Component
 * Shows "Ask Tes" and "Ask Ces" options in chat UI
 */

import React, { useState } from 'react';
import { AssistantRouter, ASSISTANT_CONFIGS } from '@ai/agents';

interface AssistantSelectorProps {
  onAssistantSelect: (assistantId: string) => void;
  currentAssistant?: string;
}

export const AssistantSelector: React.FC<AssistantSelectorProps> = ({ 
  onAssistantSelect, 
  currentAssistant 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const assistants = AssistantRouter.getAvailableAssistants();

  const currentConfig = currentAssistant ? ASSISTANT_CONFIGS[currentAssistant] : null;

  return (
    <div className="relative">
      {/* Current Assistant Display */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 rounded-lg px-3 py-2 transition-colors"
      >
        <span className="text-xl">{currentConfig?.avatar || '🤖'}</span>
        <span className="font-medium text-gray-700">
          {currentConfig?.name || 'Select Assistant'}
        </span>
        <svg 
          className={`w-4 h-4 transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Assistant Options Dropdown */}
      {isOpen && (
        <div className="absolute top-12 left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-2">
            <div className="text-xs text-gray-500 mb-2 px-2">Choose your assistant:</div>
            
            {assistants.map((assistant) => (
              <button
                key={assistant.id}
                onClick={() => {
                  onAssistantSelect(assistant.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors ${
                  currentAssistant === assistant.id ? 'bg-blue-50 border border-blue-200' : ''
                }`}
              >
                <span className="text-2xl flex-shrink-0 mt-1">{assistant.avatar}</span>
                
                <div className="flex-1 text-left">
                  <div className="font-medium text-gray-900">{assistant.name}</div>
                  <div className="text-sm text-gray-600 mb-1">{assistant.description}</div>
                  
                  <div className="text-xs text-gray-500">
                    Say: <span className="font-mono bg-gray-100 px-1 rounded">
                      {assistant.activationPhrases[0]}
                    </span>
                  </div>
                  
                  <div className="text-xs text-blue-600 mt-1">
                    {assistant.capabilities.slice(0, 2).join(' • ')}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Quick Examples */}
          <div className="border-t border-gray-100 p-3 bg-gray-50 rounded-b-lg">
            <div className="text-xs text-gray-600 mb-2">Quick examples:</div>
            <div className="space-y-1 text-xs">
              <div><span className="font-mono">Ask Tes</span> about Alaska sales in Luzon</div>
              <div><span className="font-mono">Ask Ces</span> for campaign ROI analysis</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Assistant Avatar Component
export const AssistantAvatar: React.FC<{ assistantId: string; size?: 'sm' | 'md' | 'lg' }> = ({ 
  assistantId, 
  size = 'md' 
}) => {
  const config = ASSISTANT_CONFIGS[assistantId];
  if (!config) return null;

  const sizeClasses = {
    sm: 'w-6 h-6 text-sm',
    md: 'w-8 h-8 text-lg', 
    lg: 'w-12 h-12 text-2xl'
  };

  return (
    <div className={`${sizeClasses[size]} flex items-center justify-center bg-gray-100 rounded-full`}>
      {config.avatar}
    </div>
  );
};

// Usage in chat interface
export const ChatInterface: React.FC = () => {
  const [currentAssistant, setCurrentAssistant] = useState<string>('tes');
  const [messages, setMessages] = useState<Array<{role: string, content: string, assistant?: string}>>([]);

  const handleMessage = async (userMessage: string) => {
    // Route message to appropriate assistant
    const { assistant, systemPrompt } = routeToAssistant(userMessage);
    
    if (assistant && assistant.id !== currentAssistant) {
      setCurrentAssistant(assistant.id);
    }

    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

    // Here you would call your LLM with the system prompt
    // const response = await callLLM(systemPrompt, userMessage);
    
    const assistantResponse = `${assistant?.name || 'Assistant'} response to: ${userMessage}`;
    setMessages(prev => [...prev, { 
      role: 'assistant', 
      content: assistantResponse,
      assistant: assistant?.id 
    }]);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header with Assistant Selector */}
      <div className="flex items-center justify-between p-4 border-b">
        <h1 className="text-xl font-semibold">AI Agency Chat</h1>
        <AssistantSelector 
          currentAssistant={currentAssistant}
          onAssistantSelect={setCurrentAssistant}
        />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {message.role === 'assistant' && message.assistant && (
              <AssistantAvatar assistantId={message.assistant} size="sm" />
            )}
            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
              message.role === 'user' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-800'
            }`}>
              {message.content}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 border-t">
        <input
          type="text"
          placeholder={`Try "Ask ${ASSISTANT_CONFIGS[currentAssistant]?.activationPhrases[0]}" or type your question...`}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleMessage((e.target as HTMLInputElement).value);
              (e.target as HTMLInputElement).value = '';
            }
          }}
        />
      </div>
    </div>
  );
};