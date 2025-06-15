'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Loader2, MessageCircle, Sparkles, Brain } from 'lucide-react';

interface AskCESProps {
  brand?: string;
  region?: string;
  dateRange?: string;
  campaignId?: string;
  className?: string;
}

interface CESResponse {
  answer: string;
  context: {
    brand?: string;
    region?: string;
    dateRange?: string;
    campaignId?: string;
  };
  timestamp: string;
}

export default function AskCES({ 
  brand, 
  region, 
  dateRange, 
  campaignId,
  className = '' 
}: AskCESProps) {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<CESResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch('/api/ask-ces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query: query.trim(),
          brand,
          region,
          dateRange,
          campaignId
        })
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const data: CESResponse = await res.json();
      setResponse(data);
      setQuery(''); // Clear input after successful submission
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get response from CES');
      console.error('Ask CES Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const suggestedQueries = [
    "What makes effective creative for this brand?",
    "How can I improve brand recall?",
    "What emotional triggers work best?",
    "Analyze this campaign's CES score",
    "Recommend creative optimizations"
  ];

  const handleSuggestedQuery = (suggestedQuery: string) => {
    setQuery(suggestedQuery);
  };

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Brain className="h-5 w-5 text-purple-600" />
          Ask CES
          <Badge variant="secondary" className="ml-auto">
            <Sparkles className="h-3 w-3 mr-1" />
            AI-Powered
          </Badge>
        </CardTitle>
        <p className="text-sm text-gray-600">
          TBWA's Creative Effectiveness System AI Assistant
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Context Display */}
        {(brand || region || dateRange || campaignId) && (
          <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg">
            {brand && <Badge variant="outline">Brand: {brand}</Badge>}
            {region && <Badge variant="outline">Region: {region}</Badge>}
            {dateRange && <Badge variant="outline">Period: {dateRange}</Badge>}
            {campaignId && <Badge variant="outline">Campaign: {campaignId}</Badge>}
          </div>
        )}

        {/* Query Input */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex gap-2">
            <Input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask about creative effectiveness, strategy, or optimization..."
              className="flex-1"
              disabled={loading}
            />
            <Button 
              type="submit" 
              disabled={loading || !query.trim()}
              className="px-6"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <MessageCircle className="h-4 w-4" />
              )}
            </Button>
          </div>
        </form>

        {/* Suggested Queries */}
        {!response && !loading && (
          <div className="space-y-2">
            <p className="text-xs text-gray-500 font-medium">Suggested questions:</p>
            <div className="flex flex-wrap gap-2">
              {suggestedQueries.map((suggestedQuery, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  className="text-xs h-auto py-1 px-2 text-left justify-start"
                  onClick={() => handleSuggestedQuery(suggestedQuery)}
                >
                  {suggestedQuery}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-2 text-gray-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">CES is analyzing your query...</span>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">
              <strong>Error:</strong> {error}
            </p>
          </div>
        )}

        {/* Response */}
        {response && !loading && (
          <div className="space-y-3">
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-800">CES Analysis</span>
                <span className="text-xs text-purple-600 ml-auto">
                  {new Date(response.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                {response.answer}
              </p>
            </div>
            
            {/* Ask Another Question */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setResponse(null);
                setError(null);
              }}
              className="w-full"
            >
              Ask Another Question
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}