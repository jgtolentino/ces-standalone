'use client';

import useSWR from 'swr';
import { useState } from 'react';

interface HistoricalData {
  date: string;
  revenue: number;
  transactions: number;
  aov: number;
}

interface ForecastData extends HistoricalData {
  confidence_lower: number;
  confidence_upper: number;
  trend_factor: number;
}

interface ForecastResponse {
  historical: HistoricalData[];
  forecast: ForecastData[];
  metadata: {
    forecast_days: number;
    confidence_level: number;
    generated_at: string;
    data_points: number;
  };
}

interface UseForecastConfig {
  days?: 30 | 60 | 90;
  confidence_level?: number;
  refreshInterval?: number;
}

export default function useForecast(config: UseForecastConfig = {}) {
  const { 
    days = 30, 
    confidence_level = 0.85, 
    refreshInterval = 300000 // 5 minutes
  } = config;

  const [selectedMetric, setSelectedMetric] = useState<'revenue' | 'transactions' | 'aov'>('revenue');
  const [showConfidenceBands, setShowConfidenceBands] = useState(true);

  // SWR fetcher function
  const fetcher = async (url: string): Promise<ForecastResponse> => {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Forecast API error: ${response.status}`);
    }

    return response.json();
  };

  // SWR hook for data fetching
  const {
    data,
    error,
    isLoading,
    mutate: refetch
  } = useSWR<ForecastResponse>(
    `/api/forecast?days=${days}&confidence=${confidence_level}`,
    fetcher,
    {
      refreshInterval,
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      errorRetryCount: 3,
      errorRetryInterval: 5000,
      dedupingInterval: 60000, // 1 minute
    }
  );

  // Transform data for Chart.js
  const getChartData = () => {
    if (!data) return null;

    const { historical, forecast } = data;
    const allData = [...historical, ...forecast];
    
    const labels = allData.map(d => d.date);
    const historicalLength = historical.length;

    // Base datasets
    const datasets = [
      {
        label: 'Historical',
        data: historical.map(d => d[selectedMetric]),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: false,
        tension: 0.1,
        pointRadius: 2,
        pointHoverRadius: 4,
      },
      {
        label: 'Forecast',
        data: [
          ...Array(historicalLength - 1).fill(null),
          historical[historicalLength - 1]?.[selectedMetric],
          ...forecast.map(d => d[selectedMetric])
        ],
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderDash: [5, 5],
        fill: false,
        tension: 0.1,
        pointRadius: 2,
        pointHoverRadius: 4,
      },
    ];

    // Add confidence bands if enabled and metric is revenue
    if (showConfidenceBands && selectedMetric === 'revenue') {
      datasets.push(
        {
          label: 'Confidence Upper',
          data: [
            ...Array(historicalLength - 1).fill(null),
            historical[historicalLength - 1]?.revenue,
            ...forecast.map(d => d.confidence_upper)
          ],
          borderColor: 'rgba(16, 185, 129, 0.3)',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: false,
          tension: 0.1,
          pointRadius: 0,
          pointHoverRadius: 2,
        },
        {
          label: 'Confidence Lower',
          data: [
            ...Array(historicalLength - 1).fill(null),
            historical[historicalLength - 1]?.revenue,
            ...forecast.map(d => d.confidence_lower)
          ],
          borderColor: 'rgba(16, 185, 129, 0.3)',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: false,
          tension: 0.1,
          pointRadius: 0,
          pointHoverRadius: 2,
        }
      );
    }

    return {
      labels,
      datasets
    };
  };

  // Get forecast summary statistics
  const getForecastSummary = () => {
    if (!data) return null;

    const { forecast, historical } = data;
    const lastHistorical = historical[historical.length - 1];
    const avgForecast = {
      revenue: forecast.reduce((sum, d) => sum + d.revenue, 0) / forecast.length,
      transactions: forecast.reduce((sum, d) => sum + d.transactions, 0) / forecast.length,
      aov: forecast.reduce((sum, d) => sum + d.aov, 0) / forecast.length,
    };

    const growth = {
      revenue: ((avgForecast.revenue - lastHistorical.revenue) / lastHistorical.revenue) * 100,
      transactions: ((avgForecast.transactions - lastHistorical.transactions) / lastHistorical.transactions) * 100,
      aov: ((avgForecast.aov - lastHistorical.aov) / lastHistorical.aov) * 100,
    };

    return {
      avgForecast,
      growth,
      confidence: data.metadata.confidence_level,
      period: data.metadata.forecast_days,
    };
  };

  // Manual forecast generation with different parameters
  const generateForecast = async (newDays: 30 | 60 | 90, newConfidence?: number) => {
    try {
      const response = await fetch('/api/forecast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          days: newDays,
          confidence_level: newConfidence || confidence_level,
        }),
      });

      if (!response.ok) {
        throw new Error(`Forecast generation failed: ${response.status}`);
      }

      const newData = await response.json();
      
      // Update SWR cache with new data
      refetch();
      
      return newData;
    } catch (error) {
      console.error('Error generating forecast:', error);
      throw error;
    }
  };

  return {
    // Data
    data,
    chartData: getChartData(),
    forecastSummary: getForecastSummary(),
    
    // State
    isLoading,
    error,
    selectedMetric,
    showConfidenceBands,
    
    // Actions
    setSelectedMetric,
    setShowConfidenceBands,
    refetch,
    generateForecast,
    
    // Metadata
    metadata: data?.metadata,
  };
}