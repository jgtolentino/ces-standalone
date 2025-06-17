'use client';

import { useState } from 'react';
import ForecastChart from '../../components/ForecastChart';
import useForecast from '../../hooks/useForecast';

export default function ForecastPage() {
  const [forecastDays, setForecastDays] = useState<30 | 60 | 90>(30);
  const [confidenceLevel, setConfidenceLevel] = useState(0.85);

  const {
    chartData,
    forecastSummary,
    isLoading,
    error,
    selectedMetric,
    showConfidenceBands,
    setSelectedMetric,
    setShowConfidenceBands,
    generateForecast,
    metadata
  } = useForecast({
    days: forecastDays,
    confidence_level: confidenceLevel
  });

  const handleForecastGeneration = async () => {
    try {
      await generateForecast(forecastDays, confidenceLevel);
    } catch (error) {
      console.error('Failed to generate forecast:', error);
    }
  };

  const getGrowthColor = (growth: number) => {
    if (growth > 5) return 'text-green-600';
    if (growth > 0) return 'text-green-500';
    if (growth > -5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7H7" />
        </svg>
      );
    } else if (growth < 0) {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 7l-9.2 9.2M7 7v10h10" />
        </svg>
      );
    } else {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
        </svg>
      );
    }
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">📈 Forecast View</h1>
          <p className="text-gray-600 mb-4">AI-powered retail predictions based on transaction history</p>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-800 font-medium">Error loading forecast data</span>
            </div>
            <p className="text-red-700 mt-2 text-sm">{error.message}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">📈 Forecast View</h1>
            <p className="text-gray-600">AI-powered retail predictions based on transaction history</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Forecast Period:</label>
              <select
                value={forecastDays}
                onChange={(e) => setForecastDays(Number(e.target.value) as 30 | 60 | 90)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={30}>30 Days</option>
                <option value={60}>60 Days</option>
                <option value={90}>90 Days</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Confidence:</label>
              <select
                value={confidenceLevel}
                onChange={(e) => setConfidenceLevel(Number(e.target.value))}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={0.80}>80%</option>
                <option value={0.85}>85%</option>
                <option value={0.90}>90%</option>
                <option value={0.95}>95%</option>
              </select>
            </div>
            
            <button
              onClick={handleForecastGeneration}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
              {isLoading ? 'Generating...' : 'Regenerate'}
            </button>
          </div>
        </div>
        
        {metadata && (
          <div className="mt-4 flex items-center space-x-6 text-xs text-gray-500">
            <span>Generated: {new Date(metadata.generated_at).toLocaleString()}</span>
            <span>•</span>
            <span>Data Points: {metadata.data_points}</span>
            <span>•</span>
            <span>Confidence: {(metadata.confidence_level * 100).toFixed(0)}%</span>
          </div>
        )}
      </div>

      {/* Forecast Summary Cards */}
      {forecastSummary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-600">Avg Revenue ({forecastSummary.period}d)</h3>
              <div className={`flex items-center ${getGrowthColor(forecastSummary.growth.revenue)}`}>
                {getGrowthIcon(forecastSummary.growth.revenue)}
                <span className="ml-1 text-sm font-medium">
                  {forecastSummary.growth.revenue > 0 ? '+' : ''}{forecastSummary.growth.revenue.toFixed(1)}%
                </span>
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              ${forecastSummary.avgForecast.revenue.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-1">vs historical average</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-600">Avg Transactions ({forecastSummary.period}d)</h3>
              <div className={`flex items-center ${getGrowthColor(forecastSummary.growth.transactions)}`}>
                {getGrowthIcon(forecastSummary.growth.transactions)}
                <span className="ml-1 text-sm font-medium">
                  {forecastSummary.growth.transactions > 0 ? '+' : ''}{forecastSummary.growth.transactions.toFixed(1)}%
                </span>
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              {forecastSummary.avgForecast.transactions.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-1">vs historical average</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-600">Avg Order Value ({forecastSummary.period}d)</h3>
              <div className={`flex items-center ${getGrowthColor(forecastSummary.growth.aov)}`}>
                {getGrowthIcon(forecastSummary.growth.aov)}
                <span className="ml-1 text-sm font-medium">
                  {forecastSummary.growth.aov > 0 ? '+' : ''}{forecastSummary.growth.aov.toFixed(1)}%
                </span>
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              ${forecastSummary.avgForecast.aov.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500 mt-1">vs historical average</p>
          </div>
        </div>
      )}

      {/* Forecast Chart */}
      <ForecastChart
        data={chartData}
        loading={isLoading}
        selectedMetric={selectedMetric}
        showConfidenceBands={showConfidenceBands}
        onMetricChange={setSelectedMetric}
        onConfidenceBandsToggle={setShowConfidenceBands}
      />

      {/* AI Insights Panel */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          ForecastBot AI Insights
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="bg-white bg-opacity-60 rounded-lg p-4">
            <h4 className="font-medium text-gray-800 mb-2">🎯 Prediction Methodology</h4>
            <ul className="text-gray-700 space-y-1">
              <li>• Historical trend analysis (6 months)</li>
              <li>• Seasonal pattern detection</li>
              <li>• Campaign impact extrapolation</li>
              <li>• Statistical confidence scoring</li>
            </ul>
          </div>
          
          <div className="bg-white bg-opacity-60 rounded-lg p-4">
            <h4 className="font-medium text-gray-800 mb-2">⚡ Key Factors</h4>
            <ul className="text-gray-700 space-y-1">
              <li>• Weekly/monthly seasonality</li>
              <li>• Recent performance trends</li>
              <li>• Market volatility patterns</li>
              <li>• Confidence intervals ±{((1 - confidenceLevel) * 100).toFixed(0)}%</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-blue-100 border border-blue-200 rounded-lg">
          <p className="text-blue-800 text-sm">
            <strong>💡 AI Recommendation:</strong> These forecasts are most accurate for the next 30 days. 
            For longer periods, consider external factors like market changes, seasonal campaigns, 
            and competitive dynamics that may not be reflected in historical data.
          </p>
        </div>
      </div>
    </div>
  );
}