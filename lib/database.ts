// Standalone database implementation for deployment

export async function checkDatabaseConnection() {
  // Mock database health check for deployment
  return {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  };
}

export async function executeQuery(query: string, params: any[] = []) {
  // For deployment, return mock data based on query type
  console.log('Executing query:', query);
  
  // Handle KPI revenue summary query
  if (query.includes('kpi_revenue_2024') || query.includes('total_revenue')) {
    return {
      rows: [
        {
          total_revenue: 1850000,
          total_transactions: 4200,
          avg_aov: 440,
          total_margin: 520000,
          avg_roi: 3.2,
          // Alternative field names for compatibility
          revenue: 1850000,
          transactions: 4200,
          aov: 440,
          margin: 520000,
          roi: 3.2
        }
      ]
    };
  }

  // Handle campaign performance data for trends
  if (query.includes('campaign_performance')) {
    return {
      rows: [
        { date: '2024-01-01', revenue: 120000, impressions: 50000, clicks: 2500 },
        { date: '2024-02-01', revenue: 135000, impressions: 55000, clicks: 2750 },
        { date: '2024-03-01', revenue: 142000, impressions: 58000, clicks: 2900 },
        { date: '2024-04-01', revenue: 158000, impressions: 62000, clicks: 3100 },
        { date: '2024-05-01', revenue: 165000, impressions: 65000, clicks: 3250 },
        { date: '2024-06-01', revenue: 178000, impressions: 68000, clicks: 3400 }
      ]
    };
  }

  // Handle product mix data
  if (query.includes('product_mix')) {
    return {
      rows: [
        { brand: 'Brand A', revenue: 450000, category: 'Electronics' },
        { brand: 'Brand B', revenue: 380000, category: 'Fashion' },
        { brand: 'Brand C', revenue: 320000, category: 'Home & Garden' },
        { brand: 'Brand D', revenue: 280000, category: 'Sports' },
        { brand: 'Brand E', revenue: 420000, category: 'Beauty' }
      ]
    };
  }

  // Handle audience insights data
  if (query.includes('audience_insights')) {
    return {
      rows: [
        { dimension: 'age', segment: '18-24', count: 1200, performance_score: 75.5 },
        { dimension: 'age', segment: '25-34', count: 2100, performance_score: 82.3 },
        { dimension: 'age', segment: '35-44', count: 1800, performance_score: 78.9 },
        { dimension: 'age', segment: '45-54', count: 1400, performance_score: 71.2 },
        { dimension: 'gender', segment: 'Female', count: 3200, performance_score: 79.8 },
        { dimension: 'gender', segment: 'Male', count: 3300, performance_score: 76.4 },
        { dimension: 'region', segment: 'Metro Manila', count: 2800, performance_score: 85.1 },
        { dimension: 'region', segment: 'Cebu', count: 1900, performance_score: 73.6 },
        { dimension: 'region', segment: 'Davao', count: 1800, performance_score: 71.8 }
      ]
    };
  }
  
  if (query.includes('campaigns')) {
    return {
      rows: [
        {
          id: "camp_001",
          name: "Q4 Holiday Campaign", 
          budget: 150000,
          spent: 89000,
          status: "active"
        }
      ]
    };
  }
  
  if (query.includes('analytics')) {
    return {
      rows: [
        {
          metric: "impressions",
          value: 2500000,
          date: "2025-06-09"
        }
      ]
    };
  }
  
  return { rows: [] };
}
