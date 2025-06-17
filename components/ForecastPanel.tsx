"use client";
import { useState, useEffect } from 'react';
import ForecastLineChart from './charts/ForecastLineChart';
import { fetchForecast, generateForecastSummary, type ForecastData, type ForecastSummary } from '../lib/forecast';

export default function ForecastPanel() {
  const [selectedMetric, setSelectedMetric] = useState<'revenue' | 'roi' | 'transactions' | 'aov'>('revenue');
  const [selectedPeriod, setSelectedPeriod] = useState<'30' | '60' | '90'>('30');
  const [forecastData, setForecastData] = useState<ForecastData[]>([]);
  const [summary, setSummary] = useState<ForecastSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const metrics = [
    { id: 'revenue' as const, label: 'Revenue', icon: '💰', unit: '₱' },
    { id: 'roi' as const, label: 'ROI', icon: '📈', unit: '%' },
    { id: 'transactions' as const, label: 'Transactions', icon: '🛒', unit: '' },
    { id: 'aov' as const, label: 'AOV', icon: '💎', unit: '₱' },
  ];

  const periods = [
    { id: '30' as const, label: '30 Days', description: 'Short-term forecast' },
    { id: '60' as const, label: '60 Days', description: 'Medium-term outlook' },
    { id: '90' as const, label: '90 Days', description: 'Quarterly projection' },
  ];

  useEffect(() => {
    loadForecast();
  }, [selectedMetric, selectedPeriod]);

  const loadForecast = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await fetchForecast(selectedMetric, selectedPeriod);
      setForecastData(data);
      
      const summaryData = await generateForecastSummary(data, selectedMetric, selectedPeriod);
      setSummary(summaryData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load forecast');
    } finally {
      setLoading(false);
    }
  };

  const formatValue = (value: number, metric: string) => {
    if (metric === 'revenue' || metric === 'aov') {
      return '₱' + value.toLocaleString();
    }
    if (metric === 'roi') {
      return value.toFixed(1) + '%';
    }
    return value.toLocaleString();
  };

  const getChangeIcon = (change: number) => {
    if (change > 5) return '📈';
    if (change < -5) return '📉';
    return '➡️';
  };

  const getChangeColor = (change: number) => {
    if (change > 5) return 'text-green-600';
    if (change < -5) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div id="forecast-panel" className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          🔮 Predictive Analytics
        </h2>
        <p className="text-gray-600">
          AI-powered forecasting with confidence intervals and trend analysis
        </p>
      </div>

      {/* Controls */}
      <div className="mb-6 space-y-4">
        {/* Metric Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Forecast Metric
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {metrics.map((metric) => (
              <button
                key={metric.id}
                onClick={() => setSelectedMetric(metric.id)}
                className={`p-3 rounded-lg border text-center transition-colors ${
                  selectedMetric === metric.id
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="text-lg mb-1">{metric.icon}</div>
                <div className="text-sm font-medium">{metric.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Period Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Forecast Period
          </label>
          <div className="grid grid-cols-3 gap-2">
            {periods.map((period) => (
              <button
                key={period.id}
                onClick={() => setSelectedPeriod(period.id)}
                className={`p-3 rounded-lg border text-center transition-colors ${
                  selectedPeriod === period.id
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="font-medium">{period.label}</div>
                <div className="text-xs opacity-75">{period.description}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-600">Generating forecast...</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2">
            <span className="text-red-500">⚠️</span>
            <span className="text-red-700 font-medium">Forecast Error</span>
          </div>
          <p className="text-red-600 text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Main Content */}
      {!loading && !error && forecastData.length > 0 && (
        <div className="space-y-6">
          {/* Summary Cards */}
          {summary && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Predicted Change</p>
                    <p className={`text-2xl font-bold ${getChangeColor(summary.predicted_change)}`}>
                      {getChangeIcon(summary.predicted_change)} {summary.predicted_change > 0 ? '+' : ''}
                      {summary.predicted_change.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600 font-medium">Confidence Level</p>
                    <p className="text-2xl font-bold text-green-700">
                      {(summary.confidence_level * 100).toFixed(0)}%
                    </p>
                  </div>
                  <div className="text-2xl">🎯</div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-600 font-medium">Forecast Period</p>
                    <p className="text-2xl font-bold text-purple-700">
                      {summary.period} Days
                    </p>
                  </div>
                  <div className="text-2xl">📅</div>
                </div>
              </div>
            </div>
          )}

          {/* Forecast Chart */}
          <ForecastLineChart 
            data={forecastData} 
            metric={selectedMetric}
            period={selectedPeriod}
          />

          {/* Insights and Risk Factors */}
          {summary && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Key Insights */}
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 mb-3 flex items-center">
                  <span className="mr-2">💡</span>
                  Key Insights
                </h3>
                <ul className="space-y-2">
                  {summary.key_insights.map((insight, index) => (
                    <li key={index} className="text-sm text-green-700 flex items-start">
                      <span className="mr-2 mt-1">•</span>
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Risk Factors */}
              <div className="bg-amber-50 rounded-lg p-4">
                <h3 className="font-semibold text-amber-800 mb-3 flex items-center">
                  <span className="mr-2">⚠️</span>
                  Risk Factors
                </h3>
                <ul className="space-y-2">
                  {summary.risk_factors.map((risk, index) => (
                    <li key={index} className="text-sm text-amber-700 flex items-start">
                      <span className="mr-2 mt-1">•</span>
                      <span>{risk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}