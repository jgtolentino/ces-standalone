/**
 * Retail Insights Tenant Tools - Supabase Integration
 * Philippine retail analytics for brands like Alaska, Krem-Top, Oishi
 */

import { executeQuery } from '@ai/db';

export interface SalesData {
  store_name: string;
  region: string;
  brand: string;
  sku: string;
  category: string;
  sales: number;
  date: string;
  channel: string;
}

export async function getSalesByRegion(
  brand?: string,
  region?: string,
  dateRange?: { start: string; end: string }
): Promise<SalesData[]> {
  let sql = `
    SELECT 
      store_name,
      region,
      brand,
      sku,
      category,
      sales,
      date::text,
      channel
    FROM sales_interactions
    WHERE 1=1
  `;

  const params: any[] = [];

  if (brand) {
    sql += ` AND LOWER(brand) LIKE LOWER('%' || $${params.length + 1} || '%')`;
    params.push(brand);
  }

  if (region) {
    sql += ` AND LOWER(region) = LOWER($${params.length + 1})`;
    params.push(region);
  }

  if (dateRange) {
    sql += ` AND date >= $${params.length + 1}::date AND date <= $${params.length + 2}::date`;
    params.push(dateRange.start, dateRange.end);
  }

  sql += ` ORDER BY date DESC, sales DESC LIMIT 100`;

  return await executeQuery('retail-insights', sql, params);
}

export async function getBrandPerformance(timeframe: 'week' | 'month' | 'quarter' = 'month') {
  const interval = timeframe === 'week' ? '7 days' : timeframe === 'month' ? '30 days' : '90 days';
  
  const sql = `
    SELECT 
      brand,
      SUM(sales) as total_sales,
      COUNT(DISTINCT store_name) as store_count,
      COUNT(DISTINCT sku) as sku_count,
      AVG(sales) as avg_transaction,
      SUM(CASE WHEN region = 'Luzon' THEN sales ELSE 0 END) as luzon_sales,
      SUM(CASE WHEN region = 'Visayas' THEN sales ELSE 0 END) as visayas_sales,
      SUM(CASE WHEN region = 'Mindanao' THEN sales ELSE 0 END) as mindanao_sales,
      SUM(CASE WHEN channel = 'Online' THEN sales ELSE 0 END) as online_sales,
      SUM(CASE WHEN channel = 'In-store' THEN sales ELSE 0 END) as instore_sales
    FROM sales_interactions
    WHERE date >= CURRENT_DATE - INTERVAL '${interval}'
    GROUP BY brand
    ORDER BY total_sales DESC
  `;

  return await executeQuery('retail-insights', sql);
}

export async function getCustomerDemographics(brand?: string) {
  let sql = `
    SELECT 
      cd.age_group,
      cd.location,
      cd.income_bracket,
      cd.shopping_frequency,
      COUNT(*) as customer_count,
      AVG(si.sales) as avg_spend_per_visit,
      SUM(si.sales) as total_sales
    FROM customer_demographics cd
    JOIN sales_interactions si ON cd.customer_id = si.customer_id
  `;

  const params: any[] = [];

  if (brand) {
    sql += ` WHERE LOWER(si.brand) LIKE LOWER('%' || $${params.length + 1} || '%')`;
    params.push(brand);
  }

  sql += `
    GROUP BY cd.age_group, cd.location, cd.income_bracket, cd.shopping_frequency
    ORDER BY total_sales DESC
  `;

  return await executeQuery('retail-insights', sql, params);
}

export async function analyzeSeasonalTrends(brand: string, category?: string) {
  let sql = `
    SELECT 
      EXTRACT(month FROM date) as month,
      EXTRACT(year FROM date) as year,
      TO_CHAR(date, 'Month') as month_name,
      SUM(sales) as monthly_sales,
      COUNT(*) as transaction_count,
      AVG(sales) as avg_transaction_value
    FROM sales_interactions
    WHERE LOWER(brand) LIKE LOWER('%' || $1 || '%')
  `;

  const params = [brand];

  if (category) {
    sql += ` AND LOWER(category) = LOWER($${params.length + 1})`;
    params.push(category);
  }

  sql += `
    GROUP BY EXTRACT(month FROM date), EXTRACT(year FROM date), TO_CHAR(date, 'Month')
    ORDER BY year DESC, month DESC
  `;

  return await executeQuery('retail-insights', sql, params);
}

export async function getTopPerformingStores(region?: string, limit: number = 10) {
  let sql = `
    SELECT 
      store_name,
      region,
      SUM(sales) as total_sales,
      COUNT(*) as transaction_count,
      COUNT(DISTINCT brand) as brand_variety,
      AVG(sales) as avg_transaction,
      SUM(CASE WHEN channel = 'Online' THEN sales ELSE 0 END) as online_portion
    FROM sales_interactions
    WHERE date >= CURRENT_DATE - INTERVAL '30 days'
  `;

  const params: any[] = [];

  if (region) {
    sql += ` AND LOWER(region) = LOWER($${params.length + 1})`;
    params.push(region);
  }

  sql += `
    GROUP BY store_name, region
    ORDER BY total_sales DESC
    LIMIT $${params.length + 1}
  `;
  params.push(limit);

  return await executeQuery('retail-insights', sql, params);
}