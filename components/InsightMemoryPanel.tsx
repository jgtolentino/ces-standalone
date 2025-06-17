"use client";
import { useState, useEffect, useCallback } from 'react';
import { searchCampaignInsights, getRecommendationsForContext, type RAGSearchResult, type InsightRecommendation } from '../lib/rag-memory';

interface InsightMemoryPanelProps {
  context?: {
    page?: string;
    metric?: string;
    filters?: Record<string, any>;
    currentData?: any;
  };
  isOpen?: boolean;
  onToggle?: () => void;
}

export default function InsightMemoryPanel({ context, isOpen = false, onToggle }: InsightMemoryPanelProps) {
  const [insights, setInsights] = useState<RAGSearchResult[]>([]);
  const [recommendations, setRecommendations] = useState<InsightRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  const loadContextualInsights = useCallback(async () => {
    if (!context || loading) return;

    setLoading(true);
    setError(null);

    try {
      // Generate contextual query based on current page/metric
      const query = `${context.page || ''} ${context.metric || ''} performance optimization`.trim();
      
      if (query.length > 0) {
        const [insightResults, recs] = await Promise.all([
          searchCampaignInsights(query),
          getRecommendationsForContext(context)
        ]);

        setInsights(insightResults);
        setRecommendations(recs);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load insights');
    } finally {
      setLoading(false);
    }
  }, [context, loading]);

  const handleManualSearch = async () => {
    if (!searchQuery.trim() || loading) return;

    setLoading(true);
    setError(null);

    try {
      const results = await searchCampaignInsights(searchQuery.trim());
      setInsights(results);
      
      // Clear recommendations for manual searches
      setRecommendations([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  // Load contextual insights when context changes
  useEffect(() => {
    if (isOpen && context) {
      loadContextualInsights();
    }
  }, [isOpen, context, loadContextualInsights]);

  const formatConfidence = (score: number) => {
    return (score * 100).toFixed(0) + '%';
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-6 left-6 w-14 h-14 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center z-50 hover:scale-105"
        title="Open Insight Memory Assistant"
      >
        <span className="text-2xl">🧠</span>
      </button>
    );
  }

  return (
    <div className="fixed left-6 bottom-20 w-96 bg-white rounded-lg shadow-xl border z-50 max-h-[80vh] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-t-lg">
        <div className="flex items-center space-x-2">
          <span className="text-xl">🧠</span>
          <span className="font-semibold">GenieBot Memory</span>
        </div>
        <button
          onClick={onToggle}
          className="text-white hover:text-gray-200 transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Search Bar */}
        <div className="p-4 border-b">
          <div className="flex space-x-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleManualSearch()}
              placeholder="Search campaign insights..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <button
              onClick={handleManualSearch}
              disabled={!searchQuery.trim() || loading}
              className="px-4 py-2 bg-purple-500 text-white rounded text-sm hover:bg-purple-600 disabled:opacity-50 transition-colors"
            >
              {loading ? '⏳' : '🔍'}
            </button>
          </div>
        </div>

        {/* Context Info */}
        {context && (
          <div className="p-3 bg-gray-50 border-b">
            <p className="text-xs text-gray-600 mb-1">Current Context:</p>
            <div className="flex flex-wrap gap-1">
              {context.page && (
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                  {context.page}
                </span>
              )}
              {context.metric && (
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                  {context.metric}
                </span>
              )}
              {context.filters?.channel && (
                <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
                  {context.filters.channel}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-gray-600 text-sm">Searching insights...</span>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-4">
            <div className="bg-red-50 border border-red-200 rounded p-3">
              <div className="flex items-center space-x-2">
                <span className="text-red-500">⚠️</span>
                <span className="text-red-700 font-medium text-sm">Error</span>
              </div>
              <p className="text-red-600 text-xs mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Recommendations Section */}
        {!loading && !error && recommendations.length > 0 && (
          <div className="p-4 border-b">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
              <span className="mr-2">💡</span>
              AI Recommendations
            </h3>
            <div className="space-y-3">
              {recommendations.slice(0, 2).map((rec) => (
                <div key={rec.id} className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-200">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-sm text-blue-900">{rec.title}</h4>
                    <span className={`text-xs px-2 py-1 rounded ${getConfidenceColor(rec.confidence)}`}>
                      {formatConfidence(rec.confidence)}
                    </span>
                  </div>
                  <p className="text-xs text-blue-700 mb-2">{rec.description}</p>
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs px-2 py-1 rounded ${getImpactColor(rec.impact_estimate)}`}>
                      {rec.impact_estimate} impact
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${getEffortColor(rec.implementation_effort)}`}>
                      {rec.implementation_effort} effort
                    </span>
                  </div>
                  {rec.action_items.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs font-medium text-blue-800 mb-1">Actions:</p>
                      <ul className="text-xs text-blue-700 space-y-1">
                        {rec.action_items.slice(0, 2).map((action, index) => (
                          <li key={index} className="flex items-start">
                            <span className="mr-1">•</span>
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Historical Insights Section */}
        {!loading && !error && insights.length > 0 && (
          <div className="p-4">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
              <span className="mr-2">📚</span>
              Historical Insights ({insights.length})
            </h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {insights.map((result) => (
                <div key={result.insight.id} className="bg-gray-50 rounded-lg p-3 border">
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      {result.insight.category.replace('_', ' ')}
                    </span>
                    <div className="flex items-center space-x-1">
                      <span className={`text-xs ${getConfidenceColor(result.insight.confidence_score)}`}>
                        {formatConfidence(result.insight.confidence_score)}
                      </span>
                      <span className="text-xs text-gray-500">
                        #{result.relevance_rank}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mb-2 leading-relaxed">
                    {result.insight.insight_text}
                  </p>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {result.insight.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="text-xs px-2 py-1 bg-white border rounded text-gray-600">
                        {tag.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Campaign: {result.insight.campaign_id}</span>
                    <span>Similarity: {formatConfidence(result.similarity_score)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && insights.length === 0 && recommendations.length === 0 && (
          <div className="p-8 text-center">
            <div className="text-4xl mb-3">🧠</div>
            <h3 className="font-medium text-gray-800 mb-2">No Insights Found</h3>
            <p className="text-sm text-gray-600 mb-4">
              Try searching for campaign insights or performance optimization tips.
            </p>
            <button
              onClick={loadContextualInsights}
              className="px-4 py-2 bg-purple-500 text-white rounded text-sm hover:bg-purple-600 transition-colors"
            >
              Load Contextual Insights
            </button>
          </div>
        )}
      </div>
    </div>
  );
}