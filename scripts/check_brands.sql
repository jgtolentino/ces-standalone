-- Check current brand mappings
SELECT 
    brand_name,
    is_tbwa_client,
    is_jti_brand,
    market_segment
FROM master_brands
ORDER BY brand_name
LIMIT 20;

-- Check if JTI brands exist
SELECT COUNT(*) as jti_brand_count
FROM master_brands
WHERE brand_name IN ('Winston', 'Camel', 'Mevius', 'LD', 'Mighty', 'Glamour', 'Caster', 'Salem', 'More', 'Seven Stars');

-- Check market segment distribution
SELECT 
    market_segment,
    COUNT(*) as brand_count
FROM master_brands
GROUP BY market_segment;

-- Check if we have any TBWA clients
SELECT COUNT(*) as tbwa_client_count
FROM master_brands
WHERE is_tbwa_client = true;

-- Check sample transactions
SELECT 
    mb.brand_name,
    mb.market_segment,
    mb.is_jti_brand,
    mb.is_tbwa_client,
    COUNT(*) as transaction_count
FROM scout_transactions st
JOIN scout_transaction_items sti ON st.transaction_id = sti.transaction_id
JOIN master_brands mb ON sti.brand_id = mb.brand_id
WHERE st.transaction_date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY mb.brand_name, mb.market_segment, mb.is_jti_brand, mb.is_tbwa_client
ORDER BY transaction_count DESC
LIMIT 10;