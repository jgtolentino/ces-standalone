export function preProcess(task) {
  // Data preparation and validation
  if (task.type === 'retail_analysis') {
    return {
      routeTo: 'self',
      priority: 8,
      dataPrep: {
        validateMetrics: true,
        normalizeData: true,
        enrichWithMarket: true
      }
    };
  }
  
  if (task.type === 'inventory_optimization') {
    return {
      routeTo: 'cesAI',
      priority: 7,
      dataPrep: {
        validateForecast: true,
        checkInventory: true
      }
    };
  }
  
  return { routeTo: 'self', priority: 5 };
} 