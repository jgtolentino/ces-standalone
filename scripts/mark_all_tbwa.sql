-- Mark ALL brands as TBWA clients
-- Then identify which ones are JTI tobacco brands

-- Step 1: Mark ALL brands as TBWA clients
UPDATE master_brands 
SET is_tbwa_client = true;

-- Step 2: Mark JTI tobacco brands (5-6 brands)
UPDATE master_brands 
SET is_jti_brand = true
WHERE brand_name IN ('Winston', 'Camel', 'Mevius', 'LD', 'Mighty');

-- Step 3: Update market segments based on the schema requirements
UPDATE master_brands 
SET market_segment = CASE 
    WHEN is_jti_brand = true THEN 'jti'
    WHEN is_tbwa_client = true THEN 'tbwa_non_jti'
    ELSE 'competitor'
END;

-- Verify the setup
SELECT 
    is_tbwa_client,
    is_jti_brand,
    market_segment,
    COUNT(*) as brand_count
FROM master_brands
GROUP BY is_tbwa_client, is_jti_brand, market_segment
ORDER BY is_tbwa_client DESC, is_jti_brand DESC;

-- This should now show:
-- All brands with is_tbwa_client = true
-- 5 brands with is_jti_brand = true (tobacco)
-- Rest are FMCG (non-tobacco) TBWA clients