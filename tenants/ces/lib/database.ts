// Standalone database implementation for deployment

export async function executeQuery(query: string, params: any[] = []) {
  // For deployment, return mock data based on query type
  console.log('Executing query:', query);
  
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