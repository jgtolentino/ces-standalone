import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, ExternalLink, Eye, AlertCircle } from 'lucide-react';
import { cn } from '../utils/cn';

export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  reasoning?: ReasoningTrace;
  sources?: SourceReference[];
  dashboardLink?: string;
  tenantId?: string;
}

export interface ReasoningTrace {
  steps: string[];
  dataAccess: string[];
  modelUsed: string;
  confidence: number;
}

export interface SourceReference {
  type: 'dashboard' | 'document' | 'api';
  title: string;
  url: string;
  snippet?: string;
}

interface ChatInterfaceProps {
  tenantId: string;
  userId: string;
  onSendMessage: (message: string) => Promise<ChatMessage>;
  messages: ChatMessage[];
  isLoading?: boolean;
  className?: string;
}

export function ChatInterface({
  tenantId,
  userId,
  onSendMessage,
  messages,
  isLoading = false,
  className
}: ChatInterfaceProps) {
  const [input, setInput] = useState('');
  const [showReasoning, setShowReasoning] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const message = input.trim();
    setInput('');
    
    try {
      await onSendMessage(message);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const toggleReasoning = (messageId: string) => {
    setShowReasoning(showReasoning === messageId ? null : messageId);
  };

  return (
    <div className={cn("flex flex-col h-full bg-white", className)}>
      {/* Header */}
      <div className="bg-white border-b-2 border-tbwa-primary px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-tbwa-primary rounded-full flex items-center justify-center">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-tbwa-secondary">
              TBWA AI Assistant
            </h2>
            <p className="text-sm text-gray-500">
              Campaign insights powered by AI
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={cn(
                "flex space-x-3",
                message.role === 'user' ? "justify-end" : "justify-start"
              )}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 bg-tbwa-primary rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-white" />
                </div>
              )}
              
              <div className={cn(
                "max-w-[70%] rounded-lg px-4 py-3",
                message.role === 'user' 
                  ? "bg-tbwa-primary text-white" 
                  : "bg-gray-100 text-tbwa-secondary"
              )}>
                <div className="prose prose-sm max-w-none">
                  {message.content}
                </div>

                {/* Dashboard Link */}
                {message.dashboardLink && (
                  <motion.a
                    href={message.dashboardLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center mt-3 px-3 py-1.5 bg-tbwa-primary-10 text-tbwa-primary rounded-md text-sm hover:bg-tbwa-primary-20 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    View Dashboard
                  </motion.a>
                )}

                {/* Sources */}
                {message.sources && message.sources.length > 0 && (
                  <div className="mt-3 space-y-1">
                    <p className="text-xs font-medium text-gray-600">Sources:</p>
                    {message.sources.map((source, idx) => (
                      <a
                        key={idx}
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-xs text-tbwa-primary hover:underline"
                      >
                        {source.title}
                      </a>
                    ))}
                  </div>
                )}

                {/* Reasoning Toggle */}
                {message.reasoning && (
                  <div className="mt-3">
                    <button
                      onClick={() => toggleReasoning(message.id)}
                      className="inline-flex items-center text-xs text-gray-600 hover:text-tbwa-primary transition-colors"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      {showReasoning === message.id ? 'Hide' : 'Show'} AI Reasoning
                    </button>
                    
                    <AnimatePresence>
                      {showReasoning === message.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-2 p-3 bg-gray-50 rounded-md border"
                        >
                          <div className="space-y-2">
                            <div>
                              <p className="text-xs font-medium text-gray-700">Model: {message.reasoning.modelUsed}</p>
                              <p className="text-xs text-gray-600">Confidence: {Math.round(message.reasoning.confidence * 100)}%</p>
                            </div>
                            
                            <div>
                              <p className="text-xs font-medium text-gray-700">Reasoning Steps:</p>
                              <ol className="text-xs text-gray-600 space-y-1">
                                {message.reasoning.steps.map((step, idx) => (
                                  <li key={idx} className="flex items-start">
                                    <span className="mr-2">{idx + 1}.</span>
                                    <span>{step}</span>
                                  </li>
                                ))}
                              </ol>
                            </div>
                            
                            {message.reasoning.dataAccess.length > 0 && (
                              <div>
                                <p className="text-xs font-medium text-gray-700">Data Accessed:</p>
                                <ul className="text-xs text-gray-600">
                                  {message.reasoning.dataAccess.map((access, idx) => (
                                    <li key={idx}>• {access}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                <div className="mt-2 text-xs text-gray-500">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>

              {message.role === 'user' && (
                <div className="w-8 h-8 bg-tbwa-secondary rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="h-4 w-4 text-white" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex space-x-3"
          >
            <div className="w-8 h-8 bg-tbwa-primary rounded-full flex items-center justify-center">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <div className="bg-gray-100 rounded-lg px-4 py-3">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-tbwa-primary rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-tbwa-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-tbwa-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t bg-white p-4">
        <form onSubmit={handleSubmit} className="flex space-x-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about campaigns, performance, or insights..."
            disabled={isLoading}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-tbwa-primary focus:border-tbwa-primary disabled:opacity-50"
          />
          <motion.button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-4 py-2 bg-tbwa-primary text-white rounded-lg hover:bg-tbwa-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Send className="h-4 w-4" />
          </motion.button>
        </form>
        
        <p className="text-xs text-gray-500 mt-2 text-center">
          AI-Agency Assistant • Tenant: {tenantId} • Generated by AI
        </p>
      </div>
    </div>
  );
}

export default ChatInterface;