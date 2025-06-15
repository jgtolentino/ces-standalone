'use client';

import { useState } from 'react';
import { InsightPanel } from '@/components/ces/InsightPanel';
import { RoleSelector } from '@/components/ces/RoleSelector';
import { FeedbackBar } from '@/components/ces/FeedbackBar';
import { QueryInput } from '@/components/ces/QueryInput';

export default function AskCES() {
  const [currentRole, setCurrentRole] = useState<'exec' | 'strategist' | 'creative' | 'analyst'>('analyst');
  const [conversation, setConversation] = useState<Array<{
    query: string;
    response: string;
    role: string;
    timestamp: string;
    businessScore?: any;
  }>>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleQuery = async (query: string) => {
    if (!query.trim()) return;

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/ask-ces', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          role: currentRole,
          includeContext: true,
          conversationHistory: conversation.map(c => [
            { role: 'user', content: c.query },
            { role: 'assistant', content: c.response }
          ]).flat()
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      
      const newEntry = {
        query,
        response: data.response,
        role: currentRole,
        timestamp: data.metadata.timestamp,
        businessScore: data.metadata.businessScore
      };

      setConversation(prev => [...prev, newEntry]);
    } catch (error) {
      console.error('Error:', error);
      const errorEntry = {
        query,
        response: 'Sorry, I encountered an error processing your request. Please try again.',
        role: currentRole,
        timestamp: new Date().toISOString()
      };
      setConversation(prev => [...prev, errorEntry]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearConversation = () => {
    setConversation([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Ask CES v3.0.0
          </h1>
          <p className="text-xl text-gray-600 mb-4">
            AI-Powered Campaign Effectiveness Intelligence
          </p>
          <div className="flex justify-center items-center space-x-4">
            <RoleSelector currentRole={currentRole} onRoleChange={setCurrentRole} />
            <button
              onClick={clearConversation}
              className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
            >
              Clear Chat
            </button>
          </div>
        </header>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <QueryInput 
                onSubmit={handleQuery} 
                isLoading={isLoading}
                placeholder={getRolePlaceholder(currentRole)}
              />
            </div>

            <div className="p-6">
              {conversation.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🎯</div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    Welcome to Ask CES
                  </h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    Ask me anything about campaign effectiveness, ROI optimization, 
                    creative performance, or strategic insights. I'll provide 
                    role-specific answers tailored to your needs.
                  </p>
                  <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto">
                    {getExampleQueries(currentRole).map((example, index) => (
                      <button
                        key={index}
                        onClick={() => handleQuery(example)}
                        className="p-3 text-sm bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-left"
                      >
                        {example}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {conversation.map((entry, index) => (
                    <div key={index} className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            {entry.role.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="bg-blue-50 rounded-lg p-4">
                            <p className="text-gray-800">{entry.query}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm">🎯</span>
                        </div>
                        <div className="flex-1">
                          <InsightPanel 
                            response={entry.response}
                            role={entry.role}
                            businessScore={entry.businessScore}
                            timestamp={entry.timestamp}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {conversation.length > 0 && (
            <div className="mt-6">
              <FeedbackBar 
                onFeedback={(rating, feedback) => {
                  console.log('Feedback received:', { rating, feedback });
                  // TODO: Implement ADR feedback loop
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function getRolePlaceholder(role: string): string {
  const placeholders = {
    exec: "What's our overall campaign ROI this quarter?",
    strategist: "How can we optimize our media mix for better reach?", 
    creative: "Which creative elements drive the highest engagement?",
    analyst: "Show me detailed performance metrics for top campaigns"
  };
  return placeholders[role as keyof typeof placeholders] || placeholders.analyst;
}

function getExampleQueries(role: string): string[] {
  const examples = {
    exec: [
      "Top ROI campaigns",
      "Budget optimization", 
      "Competitive analysis",
      "Strategic insights"
    ],
    strategist: [
      "Media mix optimization",
      "Audience targeting",
      "Channel performance", 
      "Campaign strategy"
    ],
    creative: [
      "Creative effectiveness",
      "Visual performance",
      "Messaging impact",
      "Brand connection"
    ],
    analyst: [
      "Performance metrics",
      "Trend analysis", 
      "Statistical insights",
      "Data correlations"
    ]
  };
  return examples[role as keyof typeof examples] || examples.analyst;
}