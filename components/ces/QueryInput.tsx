'use client';

import { useState, KeyboardEvent } from 'react';

interface QueryInputProps {
  onSubmit: (query: string) => void;
  isLoading: boolean;
  placeholder?: string;
}

export function QueryInput({ onSubmit, isLoading, placeholder = "Ask me anything about campaign effectiveness..." }: QueryInputProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = () => {
    if (query.trim() && !isLoading) {
      onSubmit(query.trim());
      setQuery('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex items-end space-x-3">
      <div className="flex-1">
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          rows={3}
          disabled={isLoading}
        />
        <div className="mt-2 text-xs text-gray-500">
          Press Enter to send, Shift+Enter for new line
        </div>
      </div>
      
      <button
        onClick={handleSubmit}
        disabled={!query.trim() || isLoading}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
      >
        {isLoading ? (
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Thinking...</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <span>Ask CES</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </div>
        )}
      </button>
    </div>
  );
}