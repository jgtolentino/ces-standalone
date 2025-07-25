# Scout v3.1.0 - Supabase Integration Guide

## Overview
This guide explains how to connect Scout Analytics v3.1.0 to Supabase for real-time data access.

## Prerequisites
- Supabase project created
- Database schema configured
- Environment variables ready

## Step 1: Configure Environment Variables

Add these to your `.env.local` file (locally) or Vercel environment variables (production):

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

### Where to find these values:
1. Go to your Supabase project dashboard
2. Navigate to Settings → API
3. Copy:
   - `SUPABASE_URL`: Project URL
   - `SUPABASE_ANON_KEY`: anon (public) key
   - `SUPABASE_SERVICE_ROLE_KEY`: service_role key (keep this secret!)

## Step 2: Database Schema

Scout v3.1.0 expects the following tables in your Supabase database:

### 1. Transactions Table
```sql
CREATE TABLE transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_date TIMESTAMP NOT NULL,
  store_id TEXT NOT NULL,
  region TEXT NOT NULL,
  category TEXT NOT NULL,
  brand TEXT NOT NULL,
  sku TEXT NOT NULL,
  revenue DECIMAL(10, 2) NOT NULL,
  quantity INTEGER NOT NULL,
  basket_id TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index for performance
CREATE INDEX idx_transactions_date ON transactions(transaction_date);
CREATE INDEX idx_transactions_region ON transactions(region);
CREATE INDEX idx_transactions_category ON transactions(category);
```

### 2. Stores Table
```sql
CREATE TABLE stores (
  id TEXT PRIMARY KEY,
  store_name TEXT NOT NULL,
  region TEXT NOT NULL,
  city TEXT NOT NULL,
  latitude DECIMAL(10, 6),
  longitude DECIMAL(10, 6),
  store_type TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 3. Products Table
```sql
CREATE TABLE products (
  sku TEXT PRIMARY KEY,
  product_name TEXT NOT NULL,
  category TEXT NOT NULL,
  brand TEXT NOT NULL,
  unit_price DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 4. Regional Performance View
```sql
CREATE VIEW regional_performance AS
SELECT 
  region,
  DATE_TRUNC('day', transaction_date) as date,
  COUNT(DISTINCT store_id) as active_stores,
  SUM(revenue) as total_revenue,
  COUNT(DISTINCT basket_id) as transaction_count,
  AVG(revenue) as avg_basket_size
FROM transactions
GROUP BY region, DATE_TRUNC('day', transaction_date);
```

## Step 3: Add to Vercel

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add the three Supabase variables:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Make sure they're available for Production environment

## Step 4: Test the Connection

The Scout dashboard will automatically connect to Supabase when the environment variables are configured. You can verify the connection by:

1. Checking the browser console for any connection errors
2. Monitoring the Network tab for Supabase API calls
3. Verifying data appears in the dashboard widgets

## Step 5: Row Level Security (RLS)

For production, enable RLS on your tables:

```sql
-- Enable RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create policies (example: read-only for authenticated users)
CREATE POLICY "Enable read access for all users" ON transactions
  FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON stores
  FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON products
  FOR SELECT USING (true);
```

## API Endpoints Using Supabase

Scout v3.1.0 connects to Supabase through these API endpoints:

- `/api/analytics` - Dashboard KPIs and metrics
- `/api/dashboard/overview` - Overview data
- `/api/kpi/overview` - KPI summary
- `/api/forecast` - Predictive analytics
- `/api/retailbot/chat` - AI-powered insights

## Troubleshooting

### Connection Issues
- Verify environment variables are set correctly
- Check Supabase project is active
- Ensure RLS policies allow read access

### No Data Showing
- Confirm data exists in the tables
- Check date ranges in filters
- Verify regional/category filters match your data

### Performance Issues
- Add appropriate indexes
- Consider creating materialized views for complex queries
- Enable connection pooling in Supabase

## Sample Data

If you need sample data for testing:

```sql
-- Insert sample stores
INSERT INTO stores (id, store_name, region, city, latitude, longitude, store_type)
VALUES 
  ('S001', 'Metro Manila Central', 'NCR', 'Manila', 14.5995, 120.9842, 'Flagship'),
  ('S002', 'Cebu Downtown', 'Visayas', 'Cebu City', 10.3157, 123.8854, 'Standard'),
  ('S003', 'Davao Main', 'Mindanao', 'Davao City', 7.0644, 125.6066, 'Standard');

-- Insert sample products
INSERT INTO products (sku, product_name, category, brand, unit_price)
VALUES 
  ('SKU001', 'Classic Cola 350ml', 'Beverages', 'CocaCola', 35.00),
  ('SKU002', 'Potato Chips Original', 'Snacks', 'Lays', 45.00),
  ('SKU003', 'Shampoo 200ml', 'Personal Care', 'Head & Shoulders', 120.00);

-- Insert sample transactions
INSERT INTO transactions (store_id, region, category, brand, sku, revenue, quantity, basket_id, transaction_date)
VALUES 
  ('S001', 'NCR', 'Beverages', 'CocaCola', 'SKU001', 105.00, 3, 'B001', NOW() - INTERVAL '1 day'),
  ('S002', 'Visayas', 'Snacks', 'Lays', 'SKU002', 90.00, 2, 'B002', NOW() - INTERVAL '2 days'),
  ('S003', 'Mindanao', 'Personal Care', 'Head & Shoulders', 'SKU003', 240.00, 2, 'B003', NOW() - INTERVAL '3 days');
```

## Next Steps

1. Deploy to Vercel with environment variables
2. Monitor real-time data flow
3. Configure alerts for data anomalies
4. Set up scheduled data refreshes if needed

---

For additional support with Supabase integration, refer to:
- [Supabase Documentation](https://supabase.com/docs)
- [Scout v3.1.0 Deployment Guide](./SCOUT_v3.1.0_DEPLOYMENT_GUIDE.md)