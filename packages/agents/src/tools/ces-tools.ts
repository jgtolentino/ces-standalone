/**
 * CES Tenant Tools - Azure PostgreSQL Integration
 * Campaign Effectiveness System tools for TBWA agency
 */

import { executeQuery } from '@ai/db';

export interface CampaignMetrics {
  campaign_id: string;
  campaign_name: string;
  brand: string;
  channel: string;
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  conversions: number;
  roi: number;
  ctr: number;
  conversion_rate: number;
}

export async function getCampaignPerformance(
  brand?: string,
  channel?: string,
  dateRange?: { start: string; end: string }
): Promise<CampaignMetrics[]> {
  let sql = `
    SELECT 
      campaign_id,
      campaign_name,
      brand,
      channel,
      budget,
      spent,
      impressions,
      clicks,
      conversions,
      CASE WHEN spent > 0 THEN (conversions * avg_order_value) / spent ELSE 0 END as roi,
      CASE WHEN impressions > 0 THEN (clicks::float / impressions) * 100 ELSE 0 END as ctr,
      CASE WHEN clicks > 0 THEN (conversions::float / clicks) * 100 ELSE 0 END as conversion_rate
    FROM campaigns c
    LEFT JOIN campaign_metrics cm ON c.campaign_id = cm.campaign_id
    WHERE 1=1
  `;

  const params: any[] = [];
  let paramIndex = 1;

  if (brand) {
    sql += ` AND LOWER(brand) LIKE LOWER($${paramIndex})`;
    params.push(`%${brand}%`);
    paramIndex++;
  }

  if (channel) {
    sql += ` AND LOWER(channel) LIKE LOWER($${paramIndex})`;
    params.push(`%${channel}%`);
    paramIndex++;
  }

  if (dateRange) {
    sql += ` AND start_date >= $${paramIndex} AND end_date <= $${paramIndex + 1}`;
    params.push(dateRange.start, dateRange.end);
    paramIndex += 2;
  }

  sql += ` ORDER BY spent DESC LIMIT 50`;

  return await executeQuery('ces', sql, params);
}

export async function calculateROIMetrics(campaignId?: string) {
  const sql = `
    WITH campaign_roi AS (
      SELECT 
        c.campaign_id,
        c.campaign_name,
        c.brand,
        c.budget,
        c.spent,
        cm.conversions,
        cm.revenue,
        CASE 
          WHEN c.spent > 0 THEN (cm.revenue / c.spent) 
          ELSE 0 
        END as roi,
        CASE 
          WHEN c.spent > 0 THEN ((cm.revenue - c.spent) / c.spent) * 100 
          ELSE 0 
        END as roas_percentage
      FROM campaigns c
      LEFT JOIN campaign_metrics cm ON c.campaign_id = cm.campaign_id
      ${campaignId ? 'WHERE c.campaign_id = $1' : ''}
    )
    SELECT 
      campaign_id,
      campaign_name,
      brand,
      budget,
      spent,
      conversions,
      revenue,
      ROUND(roi::numeric, 2) as roi,
      ROUND(roas_percentage::numeric, 2) as roas_percentage,
      CASE 
        WHEN roi >= 4.0 THEN 'Excellent'
        WHEN roi >= 2.0 THEN 'Good'
        WHEN roi >= 1.0 THEN 'Break Even'
        ELSE 'Poor'
      END as performance_grade
    FROM campaign_roi
    ORDER BY roi DESC
  `;

  const params = campaignId ? [campaignId] : [];
  return await executeQuery('ces', sql, params);
}

export async function analyzeChannelEffectiveness() {
  const sql = `
    SELECT 
      channel,
      COUNT(*) as campaign_count,
      SUM(budget) as total_budget,
      SUM(spent) as total_spent,
      SUM(impressions) as total_impressions,
      SUM(clicks) as total_clicks,
      SUM(conversions) as total_conversions,
      AVG(CASE WHEN spent > 0 THEN (revenue / spent) ELSE 0 END) as avg_roi,
      AVG(CASE WHEN impressions > 0 THEN (clicks::float / impressions) * 100 ELSE 0 END) as avg_ctr,
      AVG(CASE WHEN clicks > 0 THEN (conversions::float / clicks) * 100 ELSE 0 END) as avg_conversion_rate
    FROM campaigns c
    LEFT JOIN campaign_metrics cm ON c.campaign_id = cm.campaign_id
    WHERE c.status = 'active' OR c.status = 'completed'
    GROUP BY channel
    ORDER BY avg_roi DESC
  `;

  return await executeQuery('ces', sql);
}

export async function generateOptimizationRecommendations(campaignId: string) {
  const sql = `
    WITH campaign_analysis AS (
      SELECT 
        c.*,
        cm.*,
        CASE WHEN c.spent > 0 THEN (cm.revenue / c.spent) ELSE 0 END as current_roi,
        CASE WHEN cm.impressions > 0 THEN (cm.clicks::float / cm.impressions) * 100 ELSE 0 END as current_ctr,
        CASE WHEN cm.clicks > 0 THEN (cm.conversions::float / cm.clicks) * 100 ELSE 0 END as current_cr
      FROM campaigns c
      LEFT JOIN campaign_metrics cm ON c.campaign_id = cm.campaign_id
      WHERE c.campaign_id = $1
    ),
    channel_benchmarks AS (
      SELECT 
        channel,
        AVG(CASE WHEN spent > 0 THEN (revenue / spent) ELSE 0 END) as benchmark_roi,
        AVG(CASE WHEN impressions > 0 THEN (clicks::float / impressions) * 100 ELSE 0 END) as benchmark_ctr,
        AVG(CASE WHEN clicks > 0 THEN (conversions::float / clicks) * 100 ELSE 0 END) as benchmark_cr
      FROM campaigns c
      LEFT JOIN campaign_metrics cm ON c.campaign_id = cm.campaign_id
      WHERE c.status = 'completed'
      GROUP BY channel
    )
    SELECT 
      ca.*,
      cb.benchmark_roi,
      cb.benchmark_ctr,
      cb.benchmark_cr,
      CASE 
        WHEN ca.current_roi < cb.benchmark_roi THEN 'Increase budget for high-performing keywords'
        WHEN ca.current_ctr < cb.benchmark_ctr THEN 'Optimize ad creative and targeting'
        WHEN ca.current_cr < cb.benchmark_cr THEN 'Improve landing page experience'
        ELSE 'Performance is above benchmark'
      END as primary_recommendation,
      ROUND((cb.benchmark_roi - ca.current_roi)::numeric, 2) as roi_gap,
      ROUND((cb.benchmark_ctr - ca.current_ctr)::numeric, 2) as ctr_gap,
      ROUND((cb.benchmark_cr - ca.current_cr)::numeric, 2) as cr_gap
    FROM campaign_analysis ca
    LEFT JOIN channel_benchmarks cb ON ca.channel = cb.channel
  `;

  return await executeQuery('ces', sql, [campaignId]);
}