-- Simple data loader for Scout
-- Just load some sample data to test

-- Add some stores if they don't exist
INSERT INTO scout_stores (store_id, store_name, region, city) 
VALUES 
  (gen_random_uuid(), 'Metro Manila Hub', 'NCR', 'Manila'),
  (gen_random_uuid(), 'Central Luzon Store', 'Region III', 'Angeles'),
  (gen_random_uuid(), 'CALABARZON Center', 'Region IV-A', 'Batangas'),
  (gen_random_uuid(), 'Central Visayas Outlet', 'Region VII', 'Cebu City'),
  (gen_random_uuid(), 'Davao Region Store', 'Region XI', 'Davao City')
ON CONFLICT DO NOTHING;

-- Add some customers
INSERT INTO scout_customers (customer_id, full_name, gender, age_group, region, city)
SELECT 
  gen_random_uuid(),
  'Customer ' || generate_series,
  CASE WHEN random() > 0.5 THEN 'M' ELSE 'F' END,
  CASE 
    WHEN random() < 0.2 THEN '18-24'
    WHEN random() < 0.5 THEN '25-34'
    WHEN random() < 0.7 THEN '35-44'
    WHEN random() < 0.9 THEN '45-54'
    ELSE '55+'
  END,
  CASE 
    WHEN random() < 0.3 THEN 'NCR'
    WHEN random() < 0.5 THEN 'Region III'
    WHEN random() < 0.7 THEN 'Region IV-A'
    WHEN random() < 0.85 THEN 'Region VII'
    ELSE 'Region XI'
  END,
  'City'
FROM generate_series(1, 1000);

-- Generate transactions with realistic market share
WITH 
  stores AS (SELECT store_id FROM scout_stores LIMIT 5),
  customers AS (SELECT customer_id FROM scout_customers LIMIT 1000),
  brands AS (
    SELECT brand_id, brand_name, is_tbwa_client, market_segment
    FROM master_brands 
    WHERE brand_name IN (
      -- JTI brands (40%)
      'Winston', 'Camel', 'Mevius', 'LD', 'Mighty',
      -- TBWA non-tobacco (20%)
      'Oishi', 'Smart C+', 'Del Monte Ketchup', 'Downy', 'Tide',
      -- Competitors (40%)
      'Philip Morris', 'Nestle', 'Coca-Cola', 'San Miguel', 'Alaska'
    )
  )
INSERT INTO scout_transactions (transaction_id, store_id, customer_id, transaction_date, total_amount, payment_method)
SELECT 
  gen_random_uuid(),
  (SELECT store_id FROM stores ORDER BY random() LIMIT 1),
  (SELECT customer_id FROM customers ORDER BY random() LIMIT 1),
  CURRENT_DATE - (random() * 360)::int,
  50 + (random() * 450),
  CASE WHEN random() < 0.7 THEN 'Cash' ELSE 'GCash' END
FROM generate_series(1, 10000);

-- Add transaction items with market share distribution
INSERT INTO scout_transaction_items (transaction_item_id, transaction_id, brand_id, category_id, quantity, unit_price)
SELECT 
  gen_random_uuid(),
  t.transaction_id,
  CASE 
    -- 40% JTI brands
    WHEN random() < 0.4 THEN (SELECT brand_id FROM master_brands WHERE brand_name IN ('Winston', 'Camel', 'Mevius', 'LD', 'Mighty') ORDER BY random() LIMIT 1)
    -- 20% TBWA non-JTI
    WHEN random() < 0.6 THEN (SELECT brand_id FROM master_brands WHERE is_tbwa_client = true AND brand_name NOT IN ('Winston', 'Camel', 'Mevius', 'LD', 'Mighty') ORDER BY random() LIMIT 1)
    -- 40% Competitors
    ELSE (SELECT brand_id FROM master_brands WHERE is_tbwa_client = false OR is_tbwa_client IS NULL ORDER BY random() LIMIT 1)
  END,
  (SELECT category_id FROM master_categories ORDER BY random() LIMIT 1),
  1 + (random() * 4)::int,
  20 + (random() * 180)
FROM scout_transactions t;

-- Check the results
SELECT * FROM get_market_share_kpis();