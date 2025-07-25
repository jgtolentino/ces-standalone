-- CES Schema Deployment Improvement
-- Generated: 2025-06-15T23:20:08.417Z
-- Total campaigns to migrate: 20

-- Add missing columns to match CSV data
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS industry VARCHAR(100);
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS region VARCHAR(100);
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS type VARCHAR(100);

-- Insert enhanced campaign data
INSERT INTO campaigns (campaign_id, campaign_name, brand, channel, status, budget, spent, roi, reach, impressions, clicks, ctr, cpm, cpc, conversion_rate, start_date, end_date, campaign_type, tenant_id) VALUES ('11f829a4-0ee0-4c3b-ae9c-cf855f23adfc', 'P&G Product Launch 2024', 'Adidas', 'multichannel', 'Paused', 92227, 73782, 4.52, 2209824015, 415248985, 22242723, 4.64, 0, 0, 0, '2024-12-22T23:23:32.211721', '2025-03-15T23:23:32.211721', 'Seasonal', 'tbwa');
INSERT INTO campaigns (campaign_id, campaign_name, brand, channel, status, budget, spent, roi, reach, impressions, clicks, ctr, cpm, cpc, conversion_rate, start_date, end_date, campaign_type, tenant_id) VALUES ('956f0859-c9ec-4ec0-b856-b8566c1e768c', 'McDonald''s Social Media 2023', 'Unilever', 'television', 'Active', 546469, 437175, 4.65, 2755130804, 568432358, 24895981, 3.78, 0, 0, 0, '2023-08-13T23:23:32.211759', '2023-11-29T23:23:32.211759', 'TV Commercial', 'tbwa');
INSERT INTO campaigns (campaign_id, campaign_name, brand, channel, status, budget, spent, roi, reach, impressions, clicks, ctr, cpm, cpc, conversion_rate, start_date, end_date, campaign_type, tenant_id) VALUES ('9d5ac43f-9d4f-4857-99ac-348889a57e97', 'Toyota Social Media 2023', 'P&G', 'display', 'Planning', 3776421, 3021137, 4.9, 4088349625, 795341013, 44090288, 4.29, 0, 0, 0, '2023-01-02T23:23:32.211773', '2023-06-13T23:23:32.211773', 'Brand Awareness', 'scout');
INSERT INTO campaigns (campaign_id, campaign_name, brand, channel, status, budget, spent, roi, reach, impressions, clicks, ctr, cpm, cpc, conversion_rate, start_date, end_date, campaign_type, tenant_id) VALUES ('70844237-2538-4422-aaec-cd0212c5d4a8', 'CocaCola Product Launch 2022', 'Nike', 'social_media', 'Active', 4636164, 3708931, 5.32, 501012013, 79326587, 6234298, 6.25, 0, 0, 0, '2022-08-26T23:23:32.211785', '2022-09-12T23:23:32.211785', 'Social Media', 'scout');
INSERT INTO campaigns (campaign_id, campaign_name, brand, channel, status, budget, spent, roi, reach, impressions, clicks, ctr, cpm, cpc, conversion_rate, start_date, end_date, campaign_type, tenant_id) VALUES ('f6364365-4ccf-4ed9-8f80-972b0f4aaa1d', 'Samsung Social Media 2024', 'Toyota', 'digital', 'Paused', 2920141, 2336113, 4.62, 2486990236, 442532195, 29481523, 5.48, 0, 0, 0, '2024-01-31T23:23:32.211797', '2024-04-30T23:23:32.211797', 'Digital', 'scout');
INSERT INTO campaigns (campaign_id, campaign_name, brand, channel, status, budget, spent, roi, reach, impressions, clicks, ctr, cpm, cpc, conversion_rate, start_date, end_date, campaign_type, tenant_id) VALUES ('26c44058-1dd5-4cdf-967a-97a93c2d599c', 'McDonald''s Social Media 2023', 'Adidas', 'digital', 'Active', 1827469, 1461975, 4.8, 3774276316, 725017661, 47819938, 6.08, 0, 0, 0, '2023-11-05T23:23:32.211808', '2024-04-01T23:23:32.211808', 'Digital', 'ces');
INSERT INTO campaigns (campaign_id, campaign_name, brand, channel, status, budget, spent, roi, reach, impressions, clicks, ctr, cpm, cpc, conversion_rate, start_date, end_date, campaign_type, tenant_id) VALUES ('4dcaa153-b392-4923-96e4-8818ba9eedf1', 'P&G TV Commercial 2024', 'P&G', 'digital', 'Paused', 3197988, 2558390, 5.02, 369523101, 69354890, 4723061, 5.35, 0, 0, 0, '2024-08-06T23:23:32.211819', '2024-08-18T23:23:32.211819', 'Digital', 'scout');
INSERT INTO campaigns (campaign_id, campaign_name, brand, channel, status, budget, spent, roi, reach, impressions, clicks, ctr, cpm, cpc, conversion_rate, start_date, end_date, campaign_type, tenant_id) VALUES ('d808c889-c7ac-4aff-b173-b9eb2079d022', 'BMW Digital 2023', 'Adidas', 'social_media', 'Planning', 196012, 156810, 4.67, 2951216750, 595087869, 37795121, 5.39, 0, 0, 0, '2023-04-01T23:23:32.211830', '2023-07-18T23:23:32.211830', 'Social Media', 'scout');
INSERT INTO campaigns (campaign_id, campaign_name, brand, channel, status, budget, spent, roi, reach, impressions, clicks, ctr, cpm, cpc, conversion_rate, start_date, end_date, campaign_type, tenant_id) VALUES ('be9e1d9c-b1cd-4d3d-8c29-cb6ad5225828', 'Adidas Digital 2023', 'Apple', 'display', 'Completed', 593669, 474935, 5.44, 5275505694, 999106508, 42639448, 4.25, 0, 0, 0, '2023-09-11T23:23:32.211840', '2024-03-07T23:23:32.211840', 'Brand Awareness', 'scout');
INSERT INTO campaigns (campaign_id, campaign_name, brand, channel, status, budget, spent, roi, reach, impressions, clicks, ctr, cpm, cpc, conversion_rate, start_date, end_date, campaign_type, tenant_id) VALUES ('4a5dcf21-c087-4044-9476-9eb0e73f8abc', 'Unilever Seasonal 2024', 'Adidas', 'social_media', 'Planning', 4924524, 3939619, 4.37, 4285067854, 782412271, 50231164, 5.6, 0, 0, 0, '2024-12-21T23:23:32.211851', '2025-05-26T23:23:32.211851', 'Social Media', 'ces');
INSERT INTO campaigns (campaign_id, campaign_name, brand, channel, status, budget, spent, roi, reach, impressions, clicks, ctr, cpm, cpc, conversion_rate, start_date, end_date, campaign_type, tenant_id) VALUES ('c2e65716-ba4d-428f-a8b4-5ef508617e52', 'CocaCola Digital 2024', 'P&G', 'digital', 'Completed', 2541758, 2033406, 4.52, 2675937674, 535671649, 33670969, 5.87, 0, 0, 0, '2024-10-06T23:23:32.211861', '2025-01-21T23:23:32.211861', 'Digital', 'ces');
INSERT INTO campaigns (campaign_id, campaign_name, brand, channel, status, budget, spent, roi, reach, impressions, clicks, ctr, cpm, cpc, conversion_rate, start_date, end_date, campaign_type, tenant_id) VALUES ('41ea5217-145b-42e0-bc1a-0170b9f8f24f', 'McDonald''s Digital 2022', 'Samsung', 'display', 'Completed', 252731, 202185, 4.86, 4305234061, 840241210, 38485508, 4.35, 0, 0, 0, '2022-11-16T23:23:32.211872', '2023-04-28T23:23:32.211872', 'Brand Awareness', 'tbwa');
INSERT INTO campaigns (campaign_id, campaign_name, brand, channel, status, budget, spent, roi, reach, impressions, clicks, ctr, cpm, cpc, conversion_rate, start_date, end_date, campaign_type, tenant_id) VALUES ('37579ab6-c9a8-4b3b-978e-cfdb7129da9e', 'Adidas Brand Awareness 2023', 'BMW', 'integrated', 'Active', 516461, 413169, 4.36, 3450734918, 668816737, 33793990, 4.55, 0, 0, 0, '2023-11-12T23:23:32.211882', '2024-03-23T23:23:32.211882', 'Product Launch', 'scout');
INSERT INTO campaigns (campaign_id, campaign_name, brand, channel, status, budget, spent, roi, reach, impressions, clicks, ctr, cpm, cpc, conversion_rate, start_date, end_date, campaign_type, tenant_id) VALUES ('1585e236-34bf-4919-b8f1-8b95c73b9ec9', 'P&G Social Media 2023', 'P&G', 'television', 'Paused', 2793843, 2235074, 3.95, 305477214, 50593123, 3590494, 5.93, 0, 0, 0, '2023-06-27T23:23:32.211893', '2023-07-07T23:23:32.211893', 'TV Commercial', 'tbwa');
INSERT INTO campaigns (campaign_id, campaign_name, brand, channel, status, budget, spent, roi, reach, impressions, clicks, ctr, cpm, cpc, conversion_rate, start_date, end_date, campaign_type, tenant_id) VALUES ('ec4f1bbc-fe3d-4bac-813d-9f0ff0811d9b', 'Unilever Seasonal 2023', 'Nike', 'social_media', 'Active', 2712137, 2169710, 6.13, 706144462, 113799828, 6031998, 5.96, 0, 0, 0, '2023-11-13T23:23:32.211903', '2023-12-02T23:23:32.211903', 'Social Media', 'ces');
INSERT INTO campaigns (campaign_id, campaign_name, brand, channel, status, budget, spent, roi, reach, impressions, clicks, ctr, cpm, cpc, conversion_rate, start_date, end_date, campaign_type, tenant_id) VALUES ('d51e112a-0040-407c-b7a1-e0764d44bec8', 'P&G Product Launch 2023', 'Toyota', 'multichannel', 'Paused', 742696, 594157, 4.35, 2180477002, 449653595, 20408458, 4.36, 0, 0, 0, '2023-10-25T23:23:32.211913', '2024-01-17T23:23:32.211913', 'Seasonal', 'tbwa');
INSERT INTO campaigns (campaign_id, campaign_name, brand, channel, status, budget, spent, roi, reach, impressions, clicks, ctr, cpm, cpc, conversion_rate, start_date, end_date, campaign_type, tenant_id) VALUES ('d741691d-6e6a-4a57-834b-21464452b646', 'Samsung Brand Awareness 2022', 'Samsung', 'digital', 'Completed', 2190705, 1752564, 4.9, 1523815795, 281760799, 17552987, 5.21, 0, 0, 0, '2022-12-14T23:23:32.211923', '2023-02-09T23:23:32.211923', 'Digital', 'tbwa');
INSERT INTO campaigns (campaign_id, campaign_name, brand, channel, status, budget, spent, roi, reach, impressions, clicks, ctr, cpm, cpc, conversion_rate, start_date, end_date, campaign_type, tenant_id) VALUES ('d7fbc04a-aa17-4cb4-8984-f11e46b578e1', 'BMW Digital 2023', 'Toyota', 'multichannel', 'Active', 3655605, 2924484, 4.82, 4120767123, 821558227, 42628940, 4.06, 0, 0, 0, '2023-10-26T23:23:32.211934', '2024-04-20T23:23:32.211934', 'Seasonal', 'tbwa');
INSERT INTO campaigns (campaign_id, campaign_name, brand, channel, status, budget, spent, roi, reach, impressions, clicks, ctr, cpm, cpc, conversion_rate, start_date, end_date, campaign_type, tenant_id) VALUES ('3e9bed5a-fa4f-4346-b3b7-f85d1ad83af0', 'Apple Social Media 2024', 'CocaCola', 'digital', 'Planning', 2319692, 1855754, 5.59, 560829194, 107874630, 6266233, 4.55, 0, 0, 0, '2024-07-11T23:23:32.211944', '2024-07-29T23:23:32.211944', 'Digital', 'scout');
INSERT INTO campaigns (campaign_id, campaign_name, brand, channel, status, budget, spent, roi, reach, impressions, clicks, ctr, cpm, cpc, conversion_rate, start_date, end_date, campaign_type, tenant_id) VALUES ('be2c180e-2e3e-4a3a-be0c-9b44345c5143', 'Toyota TV Commercial 2024', 'Nike', 'multichannel', 'Active', 512081, 409665, 5.76, 3393125967, 666354280, 30392623, 4.34, 0, 0, 0, '2024-06-12T23:23:32.211955', '2024-10-08T23:23:32.211955', 'Seasonal', 'scout');

-- Update with additional CSV data
UPDATE campaigns SET industry = 'FMCG', region = 'North America', type = 'Seasonal' WHERE campaign_id = '11f829a4-0ee0-4c3b-ae9c-cf855f23adfc';
UPDATE campaigns SET industry = 'Finance', region = 'MEA', type = 'TV Commercial' WHERE campaign_id = '956f0859-c9ec-4ec0-b856-b8566c1e768c';
UPDATE campaigns SET industry = 'Food & Beverage', region = 'North America', type = 'Brand Awareness' WHERE campaign_id = '9d5ac43f-9d4f-4857-99ac-348889a57e97';
UPDATE campaigns SET industry = 'Finance', region = 'MEA', type = 'Social Media' WHERE campaign_id = '70844237-2538-4422-aaec-cd0212c5d4a8';
UPDATE campaigns SET industry = 'Food & Beverage', region = 'Global', type = 'Digital' WHERE campaign_id = 'f6364365-4ccf-4ed9-8f80-972b0f4aaa1d';
UPDATE campaigns SET industry = 'FMCG', region = 'MEA', type = 'Digital' WHERE campaign_id = '26c44058-1dd5-4cdf-967a-97a93c2d599c';
UPDATE campaigns SET industry = 'Healthcare', region = 'LATAM', type = 'Digital' WHERE campaign_id = '4dcaa153-b392-4923-96e4-8818ba9eedf1';
UPDATE campaigns SET industry = 'Finance', region = 'Global', type = 'Social Media' WHERE campaign_id = 'd808c889-c7ac-4aff-b173-b9eb2079d022';
UPDATE campaigns SET industry = 'Fashion', region = 'LATAM', type = 'Brand Awareness' WHERE campaign_id = 'be9e1d9c-b1cd-4d3d-8c29-cb6ad5225828';
UPDATE campaigns SET industry = 'Fashion', region = 'LATAM', type = 'Social Media' WHERE campaign_id = '4a5dcf21-c087-4044-9476-9eb0e73f8abc';
UPDATE campaigns SET industry = 'Finance', region = 'MEA', type = 'Digital' WHERE campaign_id = 'c2e65716-ba4d-428f-a8b4-5ef508617e52';
UPDATE campaigns SET industry = 'FMCG', region = 'LATAM', type = 'Brand Awareness' WHERE campaign_id = '41ea5217-145b-42e0-bc1a-0170b9f8f24f';
UPDATE campaigns SET industry = 'FMCG', region = 'MEA', type = 'Product Launch' WHERE campaign_id = '37579ab6-c9a8-4b3b-978e-cfdb7129da9e';
UPDATE campaigns SET industry = 'Food & Beverage', region = 'Europe', type = 'TV Commercial' WHERE campaign_id = '1585e236-34bf-4919-b8f1-8b95c73b9ec9';
UPDATE campaigns SET industry = 'Fashion', region = 'Global', type = 'Social Media' WHERE campaign_id = 'ec4f1bbc-fe3d-4bac-813d-9f0ff0811d9b';
UPDATE campaigns SET industry = 'Fashion', region = 'LATAM', type = 'Seasonal' WHERE campaign_id = 'd51e112a-0040-407c-b7a1-e0764d44bec8';
UPDATE campaigns SET industry = 'FMCG', region = 'Europe', type = 'Digital' WHERE campaign_id = 'd741691d-6e6a-4a57-834b-21464452b646';
UPDATE campaigns SET industry = 'Automotive', region = 'Global', type = 'Seasonal' WHERE campaign_id = 'd7fbc04a-aa17-4cb4-8984-f11e46b578e1';
UPDATE campaigns SET industry = 'Tech', region = 'MEA', type = 'Digital' WHERE campaign_id = '3e9bed5a-fa4f-4346-b3b7-f85d1ad83af0';
UPDATE campaigns SET industry = 'Healthcare', region = 'LATAM', type = 'Seasonal' WHERE campaign_id = 'be2c180e-2e3e-4a3a-be0c-9b44345c5143';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_campaigns_industry ON campaigns(industry);
CREATE INDEX IF NOT EXISTS idx_campaigns_region ON campaigns(region);
CREATE INDEX IF NOT EXISTS idx_campaigns_type ON campaigns(type);
CREATE INDEX IF NOT EXISTS idx_campaigns_tenant_status ON campaigns(tenant_id, status);

-- Create view for enhanced campaign data
CREATE OR REPLACE VIEW enhanced_campaigns AS
SELECT 
    c.*,
    CASE 
        WHEN c.spent > 0 AND c.budget > 0 THEN (c.spent / c.budget * 100)
        ELSE 0 
    END as budget_utilization_percentage,
    CASE
        WHEN c.impressions > 0 AND c.clicks > 0 THEN (c.clicks::DECIMAL / c.impressions * 100)
        ELSE c.ctr
    END as calculated_ctr_percentage,
    CASE
        WHEN c.roi > 2 THEN 'high_performing'
        WHEN c.roi > 1 THEN 'performing'  
        ELSE 'needs_optimization'
    END as performance_category
FROM campaigns c;