import { fetchDAL } from './dal';

export interface ForecastData {
  date: string;
  actual?: number;
  predicted: number;
  confidence_lower: number;
  confidence_upper: number;
  is_forecast: boolean;
}

export interface ForecastSummary {
  metric: string;
  period: number;
  predicted_change: number;
  confidence_level: number;
  key_insights: string[];
  risk_factors: string[];
}

export async function fetchForecast(
  metric: 'revenue' | 'roi' | 'transactions' | 'aov',
  period: '30' | '60' | '90',
  filters: Record<string, any> = {}
): Promise<ForecastData[]> {
  try {
    // Fetch historical data first for baseline
    const historicalData = await fetchDAL('kpi_revenue_2024', {
      query_type: 'main',
      filters: {
        ...filters,
        // Get last 90 days of historical data for context
        dateRange: {
          start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
          end: new Date().toISOString(),
        },
      },
    });

    // Generate forecast data (this would typically call ForecastBot agent)
    const forecastData = await generateForecastPredictions(historicalData, metric, period);
    
    return forecastData;
  } catch (error) {
    console.error('Forecast fetch error:', error);
    // Return mock data for development
    return generateMockForecastData(metric, period);
  }
}

async function generateForecastPredictions(
  historicalData: any[],
  metric: string,
  period: string
): Promise<ForecastData[]> {
  // This would integrate with ForecastBot agent in production
  // For now, generate realistic predictions based on historical trends
  
  const days = parseInt(period);
  const result: ForecastData[] = [];
  
  // Add last 30 days of historical data
  const last30Days = historicalData.slice(-30);
  last30Days.forEach((item, index) => {
    result.push({
      date: item.date || new Date(Date.now() - (30 - index) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      actual: getMetricValue(item, metric),
      predicted: getMetricValue(item, metric),
      confidence_lower: getMetricValue(item, metric),
      confidence_upper: getMetricValue(item, metric),
      is_forecast: false,
    });
  });

  // Generate forecast predictions
  const baseValue = last30Days.length > 0 ? getMetricValue(last30Days[last30Days.length - 1], metric) : 1000000;
  const trend = calculateTrend(last30Days, metric);
  
  for (let i = 1; i <= days; i++) {
    const futureDate = new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    // Apply trend with some seasonality and noise
    const seasonalFactor = 1 + 0.1 * Math.sin((i / 7) * 2 * Math.PI); // Weekly seasonality
    const predicted = baseValue * (1 + trend * i / 30) * seasonalFactor;
    
    // Add confidence intervals (wider for longer forecasts)
    const uncertainty = 0.1 + (i / days) * 0.2; // Uncertainty increases over time
    const confidence_lower = predicted * (1 - uncertainty);
    const confidence_upper = predicted * (1 + uncertainty);
    
    result.push({
      date: futureDate,
      predicted: Math.round(predicted),
      confidence_lower: Math.round(confidence_lower),
      confidence_upper: Math.round(confidence_upper),
      is_forecast: true,
    });
  }
  
  return result;
}

function getMetricValue(dataPoint: any, metric: string): number {
  switch (metric) {
    case 'revenue':
      return dataPoint.revenue || dataPoint.total_revenue || 0;
    case 'roi':
      return dataPoint.roi || dataPoint.avg_roi || 0;
    case 'transactions':
      return dataPoint.transactions || dataPoint.total_transactions || 0;
    case 'aov':
      return dataPoint.aov || dataPoint.avg_aov || 0;
    default:
      return 0;
  }
}

function calculateTrend(data: any[], metric: string): number {
  if (data.length < 2) return 0;
  
  const values = data.map(d => getMetricValue(d, metric));
  const firstValue = values[0];
  const lastValue = values[values.length - 1];
  
  if (firstValue === 0) return 0;
  
  // Calculate growth rate over the historical period
  return (lastValue - firstValue) / firstValue / data.length;
}

function generateMockForecastData(metric: string, period: string): ForecastData[] {
  const days = parseInt(period);
  const result: ForecastData[] = [];
  
  // Mock historical data (last 30 days)
  for (let i = 30; i >= 1; i--) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const baseValue = metric === 'revenue' ? 50000 : metric === 'roi' ? 3.2 : metric === 'aov' ? 440 : 150;
    const actual = baseValue * (0.8 + Math.random() * 0.4); // ±20% variation
    
    result.push({
      date,
      actual: Math.round(actual),
      predicted: Math.round(actual),
      confidence_lower: Math.round(actual),
      confidence_upper: Math.round(actual),
      is_forecast: false,
    });
  }
  
  // Mock forecast data
  for (let i = 1; i <= days; i++) {
    const date = new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const baseValue = metric === 'revenue' ? 52000 : metric === 'roi' ? 3.4 : metric === 'aov' ? 450 : 155;
    const predicted = baseValue * (1 + 0.02 * i / 30); // 2% monthly growth
    const uncertainty = 0.1 + (i / days) * 0.15;
    
    result.push({
      date,
      predicted: Math.round(predicted),
      confidence_lower: Math.round(predicted * (1 - uncertainty)),
      confidence_upper: Math.round(predicted * (1 + uncertainty)),
      is_forecast: true,
    });
  }
  
  return result;
}

export async function generateForecastSummary(
  forecastData: ForecastData[],
  metric: string,
  period: string
): Promise<ForecastSummary> {
  const forecastPoints = forecastData.filter(d => d.is_forecast);
  const historicalPoints = forecastData.filter(d => !d.is_forecast);
  
  if (forecastPoints.length === 0 || historicalPoints.length === 0) {
    throw new Error('Insufficient data for forecast summary');
  }
  
  const lastHistorical = historicalPoints[historicalPoints.length - 1];
  const lastForecast = forecastPoints[forecastPoints.length - 1];
  
  const predicted_change = ((lastForecast.predicted - (lastHistorical.actual || lastHistorical.predicted)) / 
    (lastHistorical.actual || lastHistorical.predicted)) * 100;
  
  // Calculate average confidence interval width
  const avgConfidenceWidth = forecastPoints.reduce((sum, point) => {
    return sum + (point.confidence_upper - point.confidence_lower) / point.predicted;
  }, 0) / forecastPoints.length;
  
  const confidence_level = Math.max(0.6, 1 - avgConfidenceWidth);
  
  return {
    metric,
    period: parseInt(period),
    predicted_change,
    confidence_level,
    key_insights: generateInsights(forecastData, metric, predicted_change),
    risk_factors: generateRiskFactors(confidence_level, predicted_change),
  };
}

function generateInsights(forecastData: ForecastData[], metric: string, change: number): string[] {
  const insights: string[] = [];
  
  if (change > 5) {
    insights.push(`Strong upward trend expected for ${metric} with ${change.toFixed(1)}% growth`);
  } else if (change < -5) {
    insights.push(`Declining trend forecasted for ${metric} with ${Math.abs(change).toFixed(1)}% decrease`);
  } else {
    insights.push(`Stable performance expected for ${metric} with minimal change`);
  }
  
  // Analyze volatility
  const forecastPoints = forecastData.filter(d => d.is_forecast);
  const avgVolatility = forecastPoints.reduce((sum, point) => {
    return sum + (point.confidence_upper - point.confidence_lower) / point.predicted;
  }, 0) / forecastPoints.length;
  
  if (avgVolatility > 0.2) {
    insights.push('High uncertainty detected - monitor closely for unexpected changes');
  } else if (avgVolatility < 0.1) {
    insights.push('Low volatility expected - stable and predictable performance');
  }
  
  return insights;
}

function generateRiskFactors(confidence: number, change: number): string[] {
  const risks: string[] = [];
  
  if (confidence < 0.7) {
    risks.push('Low confidence in predictions due to data volatility');
  }
  
  if (Math.abs(change) > 15) {
    risks.push('Significant change predicted - external factors may impact accuracy');
  }
  
  risks.push('Market conditions and campaign changes may affect forecast accuracy');
  risks.push('Seasonal variations not fully captured in short-term forecasts');
  
  return risks;
}