// Export all dashboard types
export interface CampaignMetrics {
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
  revenue: number;
}

export interface Campaign {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'completed';
  metrics: CampaignMetrics;
  startDate: string;
  endDate: string;
} 