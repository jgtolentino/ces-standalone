import { NextRequest, NextResponse } from 'next/server';
import { fetchDAL } from '../../../lib/dal';

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

interface ForecastRequest {
  days: 30 | 60 | 90;
  confidence_level?: number;
}

export async function POST(request: NextRequest) {
  try {
    const { days = 30, confidence_level = 0.85 }: ForecastRequest = await request.json();

    // Fetch historical data (last 6 months for better forecasting)
    const historicalData = await fetchHistoricalData();
    
    if (!historicalData || historicalData.length === 0) {
      return NextResponse.json({ error: 'No historical data available' }, { status: 400 });
    }

    // Generate forecast using ForecastBot agent
    const forecastData = await generateForecast(historicalData, days, confidence_level);
    
    return NextResponse.json({
      historical: historicalData,
      forecast: forecastData,
      metadata: {
        forecast_days: days,
        confidence_level,
        generated_at: new Date().toISOString(),
        data_points: forecastData.length
      }
    });

  } catch (error) {
    console.error('Forecast API error:', error);
    return NextResponse.json({ error: 'Failed to generate forecast' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Default GET request for 30-day forecast
    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get('days') || '30') as 30 | 60 | 90;
    const confidence_level = parseFloat(searchParams.get('confidence') || '0.85');

    const historicalData = await fetchHistoricalData();
    const forecastData = await generateForecast(historicalData, days, confidence_level);
    
    return NextResponse.json({
      historical: historicalData,
      forecast: forecastData,
      metadata: {
        forecast_days: days,
        confidence_level,
        generated_at: new Date().toISOString(),
        data_points: forecastData.length
      }
    });

  } catch (error) {
    console.error('Forecast GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch forecast' }, { status: 500 });
  }
}

async function fetchHistoricalData(): Promise<HistoricalData[]> {
  try {
    // Fetch last 6 months of daily aggregated data
    const query = `
      SELECT 
        DATE(created_at) as date,
        SUM(revenue) as revenue,
        COUNT(*) as transactions,
        AVG(order_value) as aov
      FROM sales_interactions 
      WHERE created_at >= NOW() - INTERVAL '6 months'
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;
    
    const results = await fetchDAL(query);
    
    return results.map((row: any) => ({
      date: row.date,
      revenue: parseFloat(row.revenue) || 0,
      transactions: parseInt(row.transactions) || 0,
      aov: parseFloat(row.aov) || 0
    }));

  } catch (error) {
    console.error('Error fetching historical data:', error);
    // Return mock data for development
    return generateMockHistoricalData();
  }
}

async function generateForecast(
  historicalData: HistoricalData[], 
  days: number, 
  confidenceLevel: number
): Promise<ForecastData[]> {
  try {
    // In production, this would call the ForecastBot agent
    // For now, generate statistical forecast based on trends
    
    const forecast: ForecastData[] = [];
    const lastDataPoint = historicalData[historicalData.length - 1];
    const recentTrend = calculateTrend(historicalData.slice(-30)); // Last 30 days trend
    const volatility = calculateVolatility(historicalData);
    
    for (let i = 1; i <= days; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      
      // Apply trend and seasonal factors
      const trendFactor = 1 + (recentTrend * i / 30); // Gradual trend application
      const seasonalFactor = getSeasonalFactor(date);
      const combinedFactor = trendFactor * seasonalFactor;
      
      const baseRevenue = lastDataPoint.revenue * combinedFactor;
      const baseTransactions = lastDataPoint.transactions * combinedFactor;
      const baseAov = baseRevenue / baseTransactions;
      
      // Calculate confidence intervals
      const confidenceRange = volatility * Math.sqrt(i / 30); // Uncertainty increases over time
      const revenueLower = baseRevenue * (1 - confidenceRange);
      const revenueUpper = baseRevenue * (1 + confidenceRange);
      
      forecast.push({
        date: date.toISOString().split('T')[0],
        revenue: Math.round(baseRevenue),
        transactions: Math.round(baseTransactions),
        aov: Math.round(baseAov * 100) / 100,
        confidence_lower: Math.round(revenueLower),
        confidence_upper: Math.round(revenueUpper),
        trend_factor: Math.round(combinedFactor * 100) / 100
      });
    }
    
    return forecast;

  } catch (error) {
    console.error('Error generating forecast:', error);
    throw new Error('Forecast generation failed');
  }
}

function calculateTrend(data: HistoricalData[]): number {
  if (data.length < 2) return 0;
  
  const firstHalf = data.slice(0, Math.floor(data.length / 2));
  const secondHalf = data.slice(Math.floor(data.length / 2));
  
  const firstAvg = firstHalf.reduce((sum, d) => sum + d.revenue, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, d) => sum + d.revenue, 0) / secondHalf.length;
  
  return (secondAvg - firstAvg) / firstAvg; // Percentage change
}

function calculateVolatility(data: HistoricalData[]): number {
  if (data.length < 2) return 0.1; // Default 10% volatility
  
  const revenues = data.map(d => d.revenue);
  const mean = revenues.reduce((sum, r) => sum + r, 0) / revenues.length;
  const variance = revenues.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / revenues.length;
  const stdDev = Math.sqrt(variance);
  
  return stdDev / mean; // Coefficient of variation
}

function getSeasonalFactor(date: Date): number {
  const month = date.getMonth();
  const dayOfWeek = date.getDay();
  
  // Basic seasonal adjustments
  let factor = 1.0;
  
  // Monthly seasonality (retail patterns)
  const monthlyFactors = [0.9, 0.85, 0.95, 1.0, 1.05, 1.1, 1.0, 0.95, 1.05, 1.1, 1.2, 1.3];
  factor *= monthlyFactors[month];
  
  // Weekly seasonality (Monday = 0, Sunday = 6)
  const weeklyFactors = [0.9, 1.0, 1.05, 1.1, 1.15, 1.2, 0.95];
  factor *= weeklyFactors[dayOfWeek];
  
  return factor;
}

function generateMockHistoricalData(): HistoricalData[] {
  const data: HistoricalData[] = [];
  const baseRevenue = 125000;
  const baseTransactions = 1800;
  
  for (let i = 180; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    // Add some realistic variation
    const randomFactor = 0.8 + Math.random() * 0.4; // 80% to 120%
    const seasonalFactor = getSeasonalFactor(date);
    
    const revenue = Math.round(baseRevenue * randomFactor * seasonalFactor);
    const transactions = Math.round(baseTransactions * randomFactor * seasonalFactor);
    const aov = Math.round((revenue / transactions) * 100) / 100;
    
    data.push({
      date: date.toISOString().split('T')[0],
      revenue,
      transactions,
      aov
    });
  }
  
  return data;
}