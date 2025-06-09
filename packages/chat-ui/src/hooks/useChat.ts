import { useState, useCallback, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: string[];
  reasoning?: ReasoningStep[];
  visualizationData?: any;
}

export interface ReasoningStep {
  agent: string;
  action: string;
  reasoning: string;
  confidence: number;
  sources: string[];
  duration: number;
}

interface UseChatOptions {
  sessionId?: string;
  apiEndpoint?: string;
}

export function useChat(options: UseChatOptions = {}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [reasoning, setReasoning] = useState<ReasoningStep[]>([]);
  
  const sessionIdRef = useRef(options.sessionId || uuidv4());
  const apiEndpoint = options.apiEndpoint || '/api/chat';

  // Load chat history on mount
  useEffect(() => {
    loadChatHistory();
  }, []);

  const loadChatHistory = async () => {
    try {
      const response = await fetch(`${apiEndpoint}/history?sessionId=${sessionIdRef.current}`);
      if (response.ok) {
        const history = await response.json();
        setMessages(history.messages || []);
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  };

  const sendMessage = useCallback(async (content: string) => {
    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setReasoning([]);

    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          sessionId: sessionIdRef.current,
          context: {
            previousMessages: messages.slice(-5) // Last 5 messages for context
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
        sources: data.sources,
        reasoning: data.reasoning,
        visualizationData: data.visualizationData
      };

      setMessages(prev => [...prev, assistantMessage]);
      setReasoning(data.reasoning || []);

      return assistantMessage;

    } catch (error) {
      console.error('Failed to send message:', error);
      
      const errorMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
      return errorMessage;

    } finally {
      setIsLoading(false);
    }
  }, [messages, apiEndpoint]);

  const generateDashboard = useCallback(async (message: Message) => {
    if (!message.visualizationData) return null;

    try {
      const response = await fetch('/api/dashboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: sessionIdRef.current,
          visualizationData: message.visualizationData,
          context: message.content
        })
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Failed to generate dashboard:', error);
    }

    return null;
  }, []);

  const clearChat = useCallback(() => {
    setMessages([]);
    setReasoning([]);
    sessionIdRef.current = uuidv4();
  }, []);

  return {
    messages,
    sendMessage,
    isLoading,
    reasoning,
    generateDashboard,
    clearChat,
    sessionId: sessionIdRef.current
  };
}