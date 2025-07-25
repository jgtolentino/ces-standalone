-- Count total TBWA clients (including JTI)

-- Check current counts
SELECT 
    COUNT(*) as total_brands,
    SUM(CASE WHEN is_tbwa_client = true THEN 1 ELSE 0 END) as tbwa_clients_total,
    SUM(CASE WHEN is_jti_brand = true THEN 1 ELSE 0 END) as jti_brands,
    SUM(CASE WHEN is_tbwa_client = true AND is_jti_brand = false THEN 1 ELSE 0 END) as tbwa_non_jti,
    SUM(CASE WHEN is_tbwa_client = false OR is_tbwa_client IS NULL THEN 1 ELSE 0 END) as non_tbwa_brands
FROM master_brands;

-- List some TBWA brands to see what we have
SELECT brand_name, is_tbwa_client, is_jti_brand
FROM master_brands
WHERE is_tbwa_client = true
LIMIT 20;