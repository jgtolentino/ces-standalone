/**
 * AI Agents Package - Cross-tenant AI functionality
 */

// Export prompts (excluding ces-personality due to TypeScript inheritance issues)
export * from './prompts/tenant-system-prompts';

// Export specific tools to avoid conflicts
export {
  getCampaignMetrics,
  analyzeCreativePerformance,
  calculateCampaignROI,
  generateCampaignReport,
  optimizeMediaSpend,
  CES_TOOLS,
  type CampaignMetrics,
  type CreativeAsset
} from './tools/ces-production-tools';

// Routers excluded due to TypeScript errors - focus on CES tools only