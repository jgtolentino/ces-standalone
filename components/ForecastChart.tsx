'use client';

import { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  TimeScale,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  TimeScale
);

interface ForecastChartProps {
  data: any;
  loading?: boolean;
  selectedMetric: 'revenue' | 'transactions' | 'aov';
  showConfidenceBands: boolean;
  onMetricChange: (metric: 'revenue' | 'transactions' | 'aov') => void;
  onConfidenceBandsToggle: (show: boolean) => void;
}

export default function ForecastChart({
  data,
  loading = false,
  selectedMetric,
  showConfidenceBands,
  onMetricChange,
  onConfidenceBandsToggle
}: ForecastChartProps) {
  const chartRef = useRef<ChartJS<'line'>>(null);

  // Chart options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      title: {
        display: true,
        text: `${getMetricLabel(selectedMetric)} Forecast - AI Predictions`,
        font: {
          size: 16,
          weight: 'bold' as const,
        },
        color: '#1f2937',
      },
      legend: {
        position: 'top' as const,
        labels: {
          filter: (legendItem: any) => {
            // Hide confidence band labels if they're not shown
            if (!showConfidenceBands && 
                (legendItem.text === 'Confidence Upper' || legendItem.text === 'Confidence Lower')) {
              return false;
            }
            return true;
          },
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#374151',
        borderWidth: 1,
        callbacks: {
          label: function(context: any) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            
            if (selectedMetric === 'revenue') {
              return `${label}: $${value.toLocaleString()}`;
            } else if (selectedMetric === 'transactions') {
              return `${label}: ${value.toLocaleString()}`;
            } else {
              return `${label}: $${value.toFixed(2)}`;
            }
          },
          afterLabel: function(context: any) {
            if (context.dataset.label === 'Forecast') {
              return 'AI Generated Prediction';
            }
            return '';
          }
        }
      }
    },
    scales: {
      x: {
        type: 'time' as const,
        time: {
          unit: 'day' as const,
          displayFormats: {
            day: 'MMM dd',
          },
        },
        title: {
          display: true,
          text: 'Date',
          color: '#6b7280',
        },
        grid: {
          color: '#f3f4f6',
        },
      },
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: getMetricLabel(selectedMetric),
          color: '#6b7280',
        },
        grid: {
          color: '#f3f4f6',
        },
        ticks: {
          callback: function(value: any) {
            if (selectedMetric === 'revenue') {
              return '$' + value.toLocaleString();
            } else if (selectedMetric === 'transactions') {
              return value.toLocaleString();
            } else {
              return '$' + value.toFixed(2);
            }
          }
        }
      }
    },
    elements: {
      point: {
        hoverRadius: 8,
      }
    },
    animation: {
      duration: 750,
      easing: 'easeInOutQuart' as const,
    }
  };

  function getMetricLabel(metric: string): string {
    switch (metric) {
      case 'revenue':
        return 'Revenue ($)';
      case 'transactions':
        return 'Transactions';
      case 'aov':
        return 'Average Order Value ($)';
      default:
        return 'Value';
    }
  }

  if (loading) {
    return (
      <div className="forecast-chart-container">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded mb-4"></div>
            <div className="flex space-x-4">
              <div className="h-10 bg-gray-200 rounded w-32"></div>
              <div className="h-10 bg-gray-200 rounded w-40"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="forecast-chart-container">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="text-center text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p>No forecast data available</p>
            <p className="text-sm mt-1">Please try refreshing or check your data connection</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="forecast-chart-container space-y-4">
      {/* Chart Controls */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">Metric:</label>
            <select 
              value={selectedMetric}
              onChange={(e) => onMetricChange(e.target.value as 'revenue' | 'transactions' | 'aov')}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="revenue">Revenue</option>
              <option value="transactions">Transactions</option>
              <option value="aov">Average Order Value</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={showConfidenceBands}
                onChange={(e) => onConfidenceBandsToggle(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                disabled={selectedMetric !== 'revenue'}
              />
              <span className={selectedMetric !== 'revenue' ? 'text-gray-400' : 'text-gray-700'}>
                Show Confidence Bands
              </span>
            </label>
            
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Historical</span>
              <div className="w-3 h-1 bg-green-500 rounded" style={{borderStyle: 'dashed'}}></div>
              <span>AI Forecast</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="h-96">
          <Line 
            ref={chartRef}
            data={data} 
            options={options} 
          />
        </div>
      </div>

      {/* AI Attribution */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200 p-4">
        <div className="flex items-center space-x-2 text-sm">
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <span className="font-medium text-green-800">ForecastBot AI Predictions</span>
          <span className="text-green-600">|</span>
          <span className="text-green-700">
            Powered by GPT-4 Turbo with confidence scoring ≥ 85%
          </span>
        </div>
      </div>
    </div>
  );
}