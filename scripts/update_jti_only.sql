-- Simple JTI brand update
-- Just mark which TBWA brands are JTI tobacco brands

-- Update JTI tobacco brands
UPDATE master_brands 
SET is_jti_brand = true
WHERE brand_name IN ('Winston', 'Camel', 'Mevius', 'LD', 'Mighty', 'Glamour', 'Caster', 'Salem', 'More', 'Seven Stars');

-- Check what we have
SELECT 
    is_tbwa_client,
    is_jti_brand,
    COUNT(*) as brand_count
FROM master_brands
GROUP BY is_tbwa_client, is_jti_brand
ORDER BY is_tbwa_client, is_jti_brand;

-- Test market share KPIs
SELECT * FROM get_market_share_kpis();