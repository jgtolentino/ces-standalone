import { CampaignMetrics } from '../types';

export const calculateROI = (metrics: CampaignMetrics): number => {
  if (metrics.spend === 0) return 0;
  return ((metrics.revenue - metrics.spend) / metrics.spend) * 100;
}; 