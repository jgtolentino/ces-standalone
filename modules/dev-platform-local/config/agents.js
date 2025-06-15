export const activeAgents = {
  devstral: {
    enabled: true,
    mode: process.env.NODE_ENV === 'production' ? 'cloud' : 'local',
    contextLimit: 131072
  },
  yummy: {
    enabled: true,
    features: ['creative_directions', 'brand_scoring', 'signal_mapping']
  },
  scoutAI: {
    enabled: false,
    modules: ['retail_analytics', 'inventory_optimization']
  },
  cesAI: {
    enabled: true,
    apiEndpoint: process.env.CES_API || '/api/ces-proxy'
  },
  pulser: {
    enabled: true,
    heartbeat: 5000  // ms
  }
};

// Agent communication matrix
export const agentRelationships = {
  devstral: ['yummy', 'cesAI', 'pulser'],
  yummy: ['devstral', 'cesAI'],
  scoutAI: [],  // Isolated when enabled
  cesAI: ['devstral', 'yummy'],
  pulser: ['devstral']  // Direct connection to orchestrator
};

// Agent capabilities registry
export const agentCapabilities = {
  nlp: ['devstral', 'cesAI'],
  vision: ['yummy'],
  data_processing: ['scoutAI', 'cesAI'],
  orchestration: ['devstral', 'pulser']
};

export const promptProfiles = {
  default: "claude",
  options: {
    claude: "./devstral/system_prompt.txt",
    cursor: "./devstral/prompts/cursor.txt",
    copilot: "./devstral/prompts/copilot.txt",
    gemini: "./devstral/prompts/gemini.txt"
  }
} 