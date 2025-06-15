import React, { useState, useEffect } from 'react';
import { CreativeAnalysisResult } from '../lib/types';

interface CreativeInsightsComponentProps {
  campaignId?: string;
}

export const CreativeInsightsComponent: React.FC<CreativeInsightsComponentProps> = ({ campaignId }) => {
  const [insights, setInsights] = useState<CreativeAnalysisResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInsights = async () => {
      setLoading(true);
      setError(null);
      try {
        const url = campaignId ? `/api/creative-insights?campaignId=${campaignId}` : '/api/creative-insights';
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        setInsights(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, [campaignId]);

  if (loading) {
    return <div className="p-4 text-center">Loading creative insights...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">Error: {error}</div>;
  }

  if (!insights || insights.length === 0) {
    return <div className="p-4 text-center text-gray-500">No creative insights available for this campaign or overall.</div>;
  }

  return (
    <div className="p-4 space-y-8">
      {insights.map((analysis, index) => (
        <div key={analysis.campaign.campaign_id || index} className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Campaign: {analysis.campaign.campaign_name}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-700 mb-3">Creative Feature Scores</h3>
              <ul className="list-disc list-inside text-gray-600">
                {Object.entries(analysis.creativeFeatureScores).map(([feature, score]) => (
                  <li key={feature}>{feature.replace(/_/g, ' ')}: {score.toFixed(2)}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-700 mb-3">Business Outcome Predictions</h3>
              <ul className="list-disc list-inside text-gray-600">
                {Object.entries(analysis.businessOutcomePredictions).map(([outcome, score]) => (
                  <li key={outcome}>{outcome.replace(/_/g, ' ')}: {score.toFixed(2)}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-700 mb-3">Campaign Composition</h3>
            <ul className="list-disc list-inside text-gray-600">
              <li>Video Heavy: {analysis.compositionAnalysis.videoHeavy ? 'Yes' : 'No'}</li>
              <li>Image Rich: {analysis.compositionAnalysis.imageRich ? 'Yes' : 'No'}</li>
              <li>Strategic Focus: {analysis.compositionAnalysis.strategicFocus ? 'Yes' : 'No'}</li>
              <li>Comprehensive Campaign: {analysis.compositionAnalysis.comprehensiveCampaign ? 'Yes' : 'No'}</li>
              <li>Asset Counts: {Object.entries(analysis.compositionAnalysis.assetCounts).map(([type, count]) => `${type}: ${count}`).join(', ')}</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-700 mb-3">Recommendations</h3>
            <ul className="list-disc list-inside text-gray-600">
              {analysis.recommendations.map((rec, i) => (
                <li key={i}>{rec}</li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
}; 