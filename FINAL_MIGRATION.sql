-- FINAL SIMPLE MIGRATION - RUN THIS IN SUPABASE

-- 1. Update market segments
UPDATE master_brands SET market_segment = 'jti' WHERE brand_name IN ('Winston', 'Camel', 'Mevius', 'LD', 'Mighty');
UPDATE master_brands SET market_segment = 'tbwa_non_jti' WHERE is_tbwa_client = true AND brand_name NOT IN ('Winston', 'Camel', 'Mevius', 'LD', 'Mighty');
UPDATE master_brands SET market_segment = 'competitor' WHERE is_tbwa_client = false OR is_tbwa_client IS NULL;

-- 2. Check results
SELECT * FROM get_market_share_kpis();