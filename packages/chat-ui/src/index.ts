// Export main components
export { ChatInterface } from './components/ChatInterface';

// Export hooks
export { useChat } from './hooks/useChat';

// Export utilities
export { cn } from './utils/cn';

// Export types and interfaces
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

export interface ChatInterfaceProps {
  tenantId: string;
  userId: string;
  messages: ChatMessage[];
  onSendMessage: (content: string) => Promise<ChatMessage>;
  isLoading?: boolean;
  className?: string;
}