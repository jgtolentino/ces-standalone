-- Populate master_brands table with all brands used in Scout Dashboard
-- Run this BEFORE loading transaction data

-- First, clear existing brands (optional - comment out if you want to keep existing)
-- TRUNCATE TABLE master_brands CASCADE;

-- Insert JTI tobacco brands (40% market share)
INSERT INTO master_brands (brand_id, brand_code, brand_name, is_tbwa_client, is_jti_brand, market_segment) 
SELECT gen_random_uuid(), brand_code, brand_name, true, true, 'jti'
FROM (VALUES 
    ('WIN', 'Winston'),
    ('CAM', 'Camel'),
    ('MEV', 'Mevius'),
    ('LD', 'LD'),
    ('MGT', 'Mighty'),
    ('GLM', 'Glamour'),
    ('CST', 'Caster'),
    ('SLM', 'Salem'),
    ('MOR', 'More'),
    ('SVS', 'Seven Stars')
) AS brands(brand_code, brand_name)
WHERE NOT EXISTS (
    SELECT 1 FROM master_brands mb WHERE mb.brand_name = brands.brand_name
);

-- Insert TBWA non-JTI brands (20% market share)
-- Liwayway brands
INSERT INTO master_brands (brand_id, brand_code, brand_name, is_tbwa_client, is_jti_brand, market_segment) 
SELECT gen_random_uuid(), brand_code, brand_name, true, false, 'tbwa_non_jti'
FROM (VALUES 
    ('OSH', 'Oishi'),
    ('SMC', 'Smart C+'),
    ('VFR', 'V-Fresh'),
    ('WFR', 'Wafer'),
    ('BRP', 'Bread Pan'),
    ('KRI', 'Kirei'),
    ('SPG', 'Sponge'),
    ('SFC', 'Sunflower Crackers'),
    ('PLW', 'Pillows'),
    ('PTF', 'Potato Fries'),
    ('FSD', 'Fishda'),
    ('NGH', 'Ngohiong')
) AS brands(brand_code, brand_name)
WHERE NOT EXISTS (
    SELECT 1 FROM master_brands mb WHERE mb.brand_name = brands.brand_name
);

-- Del Monte brands
INSERT INTO master_brands (brand_id, brand_name, is_tbwa_client, is_jti_brand, market_segment) VALUES
(gen_random_uuid(), 'Del Monte Ketchup', true, false, 'tbwa_non_jti'),
(gen_random_uuid(), 'Del Monte Spaghetti Sauce', true, false, 'tbwa_non_jti'),
(gen_random_uuid(), 'Del Monte Tomato Sauce', true, false, 'tbwa_non_jti'),
(gen_random_uuid(), 'Today''s', true, false, 'tbwa_non_jti'),
(gen_random_uuid(), 'Fiesta', true, false, 'tbwa_non_jti'),
(gen_random_uuid(), 'Quick n Easy', true, false, 'tbwa_non_jti'),
(gen_random_uuid(), 'Del Monte Juice', true, false, 'tbwa_non_jti'),
(gen_random_uuid(), 'Fit n Right', true, false, 'tbwa_non_jti'),
(gen_random_uuid(), 'Heart Smart', true, false, 'tbwa_non_jti');

-- Snow brands
INSERT INTO master_brands (brand_id, brand_name, is_tbwa_client, is_jti_brand, market_segment) VALUES
(gen_random_uuid(), 'Snow Milk', true, false, 'tbwa_non_jti'),
(gen_random_uuid(), 'Snow Yogurt', true, false, 'tbwa_non_jti'),
(gen_random_uuid(), 'Snow Cheese', true, false, 'tbwa_non_jti');

-- P&G Home Care brands
INSERT INTO master_brands (brand_id, brand_name, is_tbwa_client, is_jti_brand, market_segment) VALUES
(gen_random_uuid(), 'Downy', true, false, 'tbwa_non_jti'),
(gen_random_uuid(), 'Tide', true, false, 'tbwa_non_jti'),
(gen_random_uuid(), 'Ariel', true, false, 'tbwa_non_jti'),
(gen_random_uuid(), 'Joy', true, false, 'tbwa_non_jti'),
(gen_random_uuid(), 'Safeguard', true, false, 'tbwa_non_jti'),
(gen_random_uuid(), 'Head & Shoulders', true, false, 'tbwa_non_jti');

-- Insert Competitor brands (40% market share)
INSERT INTO master_brands (brand_id, brand_name, is_tbwa_client, is_jti_brand, market_segment) VALUES
(gen_random_uuid(), 'Philip Morris', false, false, 'competitor'),
(gen_random_uuid(), 'Japan Tobacco', false, false, 'competitor'),
(gen_random_uuid(), 'British American Tobacco', false, false, 'competitor'),
(gen_random_uuid(), 'Fortune Tobacco', false, false, 'competitor'),
(gen_random_uuid(), 'Unilever', false, false, 'competitor'),
(gen_random_uuid(), 'Nestle', false, false, 'competitor'),
(gen_random_uuid(), 'Coca-Cola', false, false, 'competitor'),
(gen_random_uuid(), 'Pepsi', false, false, 'competitor'),
(gen_random_uuid(), 'Alaska', false, false, 'competitor'),
(gen_random_uuid(), 'Monde Nissin', false, false, 'competitor'),
(gen_random_uuid(), 'Universal Robina', false, false, 'competitor'),
(gen_random_uuid(), 'Century Pacific', false, false, 'competitor'),
(gen_random_uuid(), 'San Miguel', false, false, 'competitor'),
(gen_random_uuid(), 'Emperador', false, false, 'competitor'),
(gen_random_uuid(), 'Tanduay', false, false, 'competitor');

-- Verify the brand distribution
SELECT 
    market_segment,
    COUNT(*) as brand_count,
    ROUND(COUNT(*)::NUMERIC / (SELECT COUNT(*) FROM master_brands) * 100, 1) as percentage
FROM master_brands
GROUP BY market_segment
ORDER BY market_segment;

-- Check specific counts
SELECT 
    'Total Brands' as metric, COUNT(*) as count FROM master_brands
UNION ALL
SELECT 'JTI Brands', COUNT(*) FROM master_brands WHERE is_jti_brand = true
UNION ALL
SELECT 'TBWA Non-JTI', COUNT(*) FROM master_brands WHERE market_segment = 'tbwa_non_jti'
UNION ALL
SELECT 'Competitors', COUNT(*) FROM master_brands WHERE market_segment = 'competitor';