-- Simple update: Just set is_jti_brand for tobacco brands

-- Set JTI flag for tobacco brands
UPDATE master_brands 
SET is_jti_brand = true
WHERE brand_name IN ('Winston', 'Camel', 'Mevius', 'LD', 'Mighty', 'Glamour');

-- That's it! 
-- is_tbwa_client already categorizes TBWA vs non-TBWA
-- is_jti_brand now identifies which TBWA brands are tobacco

-- Check the results
SELECT * FROM get_market_share_kpis();