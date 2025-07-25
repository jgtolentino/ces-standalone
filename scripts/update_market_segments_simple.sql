-- Simple market segment update for existing brands
-- Just set is_jti_brand for tobacco brands that are TBWA clients

-- First, check what TBWA brands exist
SELECT brand_name, is_tbwa_client, is_jti_brand, market_segment 
FROM master_brands 
WHERE is_tbwa_client = true
ORDER BY brand_name;

-- Update JTI tobacco brands (if they exist and are TBWA clients)
UPDATE master_brands 
SET is_jti_brand = true,
    market_segment = 'jti'
WHERE is_tbwa_client = true 
  AND brand_name IN ('Winston', 'Camel', 'Mevius', 'LD', 'Mighty', 'Glamour', 'Caster', 'Salem', 'More', 'Seven Stars');

-- Update non-JTI TBWA brands
UPDATE master_brands 
SET is_jti_brand = false,
    market_segment = 'tbwa_non_jti'
WHERE is_tbwa_client = true 
  AND brand_name NOT IN ('Winston', 'Camel', 'Mevius', 'LD', 'Mighty', 'Glamour', 'Caster', 'Salem', 'More', 'Seven Stars');

-- Update all non-TBWA brands as competitors
UPDATE master_brands 
SET market_segment = 'competitor'
WHERE is_tbwa_client = false OR is_tbwa_client IS NULL;

-- Check the results
SELECT 
    market_segment,
    COUNT(*) as brand_count,
    ROUND(COUNT(*)::NUMERIC / (SELECT COUNT(*) FROM master_brands) * 100, 1) as percentage
FROM master_brands
WHERE market_segment IS NOT NULL
GROUP BY market_segment
ORDER BY market_segment;

-- Test market share KPIs again
SELECT * FROM get_market_share_kpis();