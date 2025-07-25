-- Load Scout Dashboard Data with Correct Table Names

-- Clear existing data
TRUNCATE scout_transaction_items CASCADE;
TRUNCATE scout_transactions CASCADE;

-- Generate transactions with realistic market share
WITH date_series AS (
  SELECT generate_series(
    CURRENT_DATE - INTERVAL '360 days',
    CURRENT_DATE,
    INTERVAL '1 hour'
  ) AS transaction_time
)
INSERT INTO scout_transactions (transaction_id, store_id, customer_id, transaction_date, total_amount, payment_method)
SELECT 
  gen_random_uuid(),
  (SELECT store_id FROM master_stores ORDER BY random() LIMIT 1),
  (SELECT customer_id FROM scout_customers ORDER BY random() LIMIT 1),
  transaction_time + (random() * INTERVAL '59 minutes'),
  50 + (random() * 450),
  CASE WHEN random() < 0.7 THEN 'Cash' ELSE 'GCash' END
FROM date_series
WHERE random() < 0.1  -- 10% chance of transaction per hour = ~8,640 transactions
LIMIT 10000;

-- Add transaction items with correct market share distribution
INSERT INTO scout_transaction_items (transaction_item_id, transaction_id, brand_id, category_id, quantity, unit_price)
SELECT 
  gen_random_uuid(),
  t.transaction_id,
  CASE 
    -- 40% JTI brands
    WHEN random() < 0.4 THEN 
      (SELECT brand_id FROM master_brands 
       WHERE market_segment = 'jti' 
       ORDER BY random() LIMIT 1)
    -- 20% TBWA non-JTI
    WHEN random() < 0.6 THEN 
      (SELECT brand_id FROM master_brands 
       WHERE market_segment = 'tbwa_non_jti' 
       ORDER BY random() LIMIT 1)
    -- 40% Competitors
    ELSE 
      (SELECT brand_id FROM master_brands 
       WHERE market_segment = 'competitor' OR market_segment IS NULL
       ORDER BY random() LIMIT 1)
  END,
  (SELECT category_id FROM master_categories ORDER BY random() LIMIT 1),
  1 + (random() * 4)::int,
  20 + (random() * 180)
FROM scout_transactions t;

-- Verify the data load
SELECT 
  'Transactions Loaded' as metric,
  COUNT(*) as count
FROM scout_transactions
UNION ALL
SELECT 
  'Transaction Items Loaded',
  COUNT(*)
FROM scout_transaction_items
UNION ALL
SELECT 
  'Customers Available',
  COUNT(*)
FROM scout_customers
UNION ALL
SELECT 
  'Stores Available',
  COUNT(*)
FROM master_stores
UNION ALL
SELECT 
  'Brands Available',
  COUNT(*)
FROM master_brands;

-- Check market share distribution
SELECT * FROM get_market_share_kpis();