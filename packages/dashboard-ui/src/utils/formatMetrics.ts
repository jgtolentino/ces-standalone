import { CampaignMetrics } from '../types';

export const formatMetrics = (metrics: CampaignMetrics) => {
  return {
    impressions: metrics.impressions.toLocaleString(),
    clicks: metrics.clicks.toLocaleString(),
    conversions: metrics.conversions.toLocaleString(),
    spend: new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(metrics.spend),
    revenue: new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(metrics.revenue)
  };
}; 