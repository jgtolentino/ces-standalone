'use client';

import { useState, useEffect } from 'react';
import { useRoleContext } from '../../lib/prompting/role-engine';

interface InsightWithMetadata {
  content: string;
  metadata: {
    generated_by: string;
    timestamp: string;
    source: string;
    confidence: number;
    role_context: string;
    data_sources: string[];
  };
  feedback?: {
    helpful: boolean;
    timestamp: string;
  };
}

interface AskScoutResponse {
  response: string;
  metadata: any;
  suggestions?: string[];
  related_widgets?: string[];
}

export default function EnhancedScoutDashboard({ initialRole = 'brand_manager' }: { initialRole?: string }) {
  const [currentRole, setCurrentRole] = useState(initialRole);
  const [insights, setInsights] = useState<InsightWithMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [query, setQuery] = useState('');
  
  const { role, generatePrompt, validateInsight, getRelevantWidgets, getAlertPriority } = useRoleContext(currentRole);

  const [isExpanded, setIsExpanded] = useState({
    executive: true,
    regional: true,
    products: true,
    ai: true
  });

  const handleAskScout = async (question: string) => {
    if (!question.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/ask-scout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: question,
          role_id: currentRole,
          widget_context: 'enhanced_dashboard',
          response_type: 'question'
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data: AskScoutResponse = await response.json();
      
      const newInsight: InsightWithMetadata = {
        content: data.response,
        metadata: data.metadata
      };

      setInsights(prev => [newInsight, ...prev.slice(0, 4)]); // Keep last 5 insights
      setQuery('');
    } catch (error) {
      console.error('Ask Scout error:', error);
      // Show error state
    } finally {
      setIsLoading(false);
    }
  };

  const handleInsightFeedback = (index: number, helpful: boolean) => {
    setInsights(prev => prev.map((insight, i) => 
      i === index 
        ? { 
            ...insight, 
            feedback: { helpful, timestamp: new Date().toISOString() }
          }
        : insight
    ));
  };

  const toggleSection = (section: keyof typeof isExpanded) => {
    setIsExpanded(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Role Selector */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center flex-shrink-0">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-sm">📊</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Scout Analytics</h1>
                  <p className="text-xs text-gray-500 hidden sm:block">Real-time Retail Intelligence</p>
                </div>
              </div>
            </div>
            
            {/* Role Selector */}
            <div className="flex items-center space-x-4">
              <select
                value={currentRole}
                onChange={(e) => setCurrentRole(e.target.value)}
                className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="brand_manager">Brand Manager</option>
                <option value="category_manager">Category Manager</option>
                <option value="regional_director">Regional Director</option>
              </select>
              
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">👤</span>
                </div>
                <div className="hidden sm:block text-left ml-2">
                  <div className="text-sm font-medium text-gray-900">{role?.display_name}</div>
                  <div className="text-xs text-gray-500">Analytics Team</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Ask Scout Interface */}
        <div className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <span className="text-2xl">🤖</span>
            <h2 className="text-lg font-semibold text-gray-900">Ask Scout AI</h2>
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              Role: {role?.display_name}
            </span>
          </div>
          
          <div className="flex space-x-3">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAskScout(query)}
              placeholder={`Ask about ${role?.insights_focus.join(', ')}...`}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <button
              onClick={() => handleAskScout(query)}
              disabled={isLoading || !query.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Analyzing...' : 'Ask'}
            </button>
          </div>

          {/* Recent Insights */}
          {insights.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Recent AI Insights</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {insights.map((insight, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-3">
                    <p className="text-sm text-gray-800 mb-2">{insight.content}</p>
                    
                    {/* Metadata */}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center space-x-4">
                        <span>Generated: {formatTimestamp(insight.metadata.timestamp)}</span>
                        <span className={`font-medium ${getConfidenceColor(insight.metadata.confidence)}`}>
                          Confidence: {Math.round(insight.metadata.confidence * 100)}%
                        </span>
                        <span>Sources: {insight.metadata.data_sources.join(', ')}</span>
                      </div>
                      
                      {/* Feedback */}
                      {!insight.feedback && (
                        <div className="flex items-center space-x-2">
                          <span>Helpful?</span>
                          <button
                            onClick={() => handleInsightFeedback(index, true)}
                            className="text-green-600 hover:text-green-800"
                          >
                            👍
                          </button>
                          <button
                            onClick={() => handleInsightFeedback(index, false)}
                            className="text-red-600 hover:text-red-800"
                          >
                            👎
                          </button>
                        </div>
                      )}
                      
                      {insight.feedback && (
                        <span className={insight.feedback.helpful ? 'text-green-600' : 'text-red-600'}>
                          {insight.feedback.helpful ? '👍 Helpful' : '👎 Not helpful'}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Dashboard Widgets */}
        <div className="space-y-6">
          {/* Executive Summary */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => toggleSection('executive')}>
              <div className="flex items-center space-x-3">
                <span className="text-gray-400">📊</span>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-semibold text-gray-900">Executive Summary</h3>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">KPI Cards</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Key performance indicators optimized for {role?.display_name}</p>
                </div>
              </div>
              <button className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
                <svg className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isExpanded.executive ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
            </div>
            {isExpanded.executive && (
              <div className="px-4 pb-4">
                <div className="border-t border-gray-200 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white rounded-lg p-6 border border-gray-200">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                            <span className="text-white text-sm">💰</span>
                          </div>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                            <dd className="text-lg font-medium text-gray-900">₱3.84M</dd>
                          </dl>
                        </div>
                        <div className="flex-shrink-0">
                          <span className="text-green-600 text-sm font-medium">+8.2%</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-6 border border-gray-200">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                            <span className="text-white text-sm">🛒</span>
                          </div>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">Market Share</dt>
                            <dd className="text-lg font-medium text-gray-900">23.4%</dd>
                          </dl>
                        </div>
                        <div className="flex-shrink-0">
                          <span className="text-green-600 text-sm font-medium">+1.8%</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-6 border border-gray-200">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                            <span className="text-white text-sm">📈</span>
                          </div>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">Campaign ROI</dt>
                            <dd className="text-lg font-medium text-gray-900">287%</dd>
                          </dl>
                        </div>
                        <div className="flex-shrink-0">
                          <span className="text-green-600 text-sm font-medium">+45%</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-6 border border-gray-200">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                            <span className="text-white text-sm">⚡</span>
                          </div>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">AI Confidence</dt>
                            <dd className="text-lg font-medium text-gray-900">94%</dd>
                          </dl>
                        </div>
                        <div className="flex-shrink-0">
                          <span className="text-green-600 text-sm font-medium">High</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}