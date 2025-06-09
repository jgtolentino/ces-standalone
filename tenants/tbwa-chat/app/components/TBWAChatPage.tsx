'use client';

import React, { useState, useCallback } from 'react';
import { ChatInterface, ChatMessage } from '@ai/chat-ui';
import { v4 as uuidv4 } from 'uuid';

export function TBWAChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: "👋 Hello! I'm your TBWA AI Assistant. I can help you with:\n\n• **Campaign Strategy** - Generate creative concepts and market insights\n• **Performance Analysis** - Analyze CES scores and campaign metrics\n• **Creative Execution** - Create ad copy and visual concepts\n• **Data Insights** - Access Scout retail analytics\n\nWhat would you like to explore today?",
      role: 'assistant',
      timestamp: new Date(),
      tenantId: 'tbwa-chat'
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = useCallback(async (content: string): Promise<ChatMessage> => {
    const userMessage: ChatMessage = {
      id: uuidv4(),
      content,
      role: 'user',
      timestamp: new Date(),
      tenantId: 'tbwa-chat'
    };

    // Add user message immediately
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Call the chat API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          tenantId: 'tbwa-chat',
          userId: 'demo-user', // In production, get from auth
          history: messages.slice(-5) // Send last 5 messages for context
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const assistantMessage: ChatMessage = await response.json();
      
      // Add assistant message
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
      
      return assistantMessage;
    } catch (error) {
      console.error('Chat error:', error);
      
      // Add error message
      const errorMessage: ChatMessage = {
        id: uuidv4(),
        content: "I apologize, but I'm experiencing technical difficulties. Please try again in a moment.",
        role: 'assistant',
        timestamp: new Date(),
        tenantId: 'tbwa-chat'
      };
      
      setMessages(prev => [...prev, errorMessage]);
      setIsLoading(false);
      
      return errorMessage;
    }
  }, [messages]);

  return (
    <div className="h-screen bg-tbwa-neutral">
      <ChatInterface
        tenantId="tbwa-chat"
        userId="demo-user"
        messages={messages}
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        className="h-full max-w-4xl mx-auto"
      />
    </div>
  );
}