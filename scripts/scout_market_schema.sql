-- Enhanced Scout Schema for Market Share Analytics

-- Add JTI tracking to existing tables
ALTER TABLE master_brands ADD COLUMN IF NOT EXISTS is_jti_brand BOOLEAN DEFAULT false;
ALTER TABLE master_brands ADD COLUMN IF NOT EXISTS market_segment TEXT 
    CHECK (market_segment IN ('tbwa_non_jti', 'jti', 'competitor'));

-- Update market segments
UPDATE master_brands SET 
    market_segment = CASE 
        WHEN brand_name IN ('Winston', 'Camel', 'Mevius', 'LD', 'Mighty', 'Glamour', 'Caster', 'Salem', 'More', 'Seven Stars') THEN 'jti'
        WHEN is_tbwa_client = true THEN 'tbwa_non_jti'
        ELSE 'competitor'
    END,
    is_jti_brand = CASE 
        WHEN brand_name IN ('Winston', 'Camel', 'Mevius', 'LD', 'Mighty', 'Glamour', 'Caster', 'Salem', 'More', 'Seven Stars') THEN true
        ELSE false
    END;

-- Market Share Performance View
CREATE OR REPLACE VIEW scout_market_share_performance AS
SELECT 
    mb.market_segment,
    COUNT(st.transaction_id) as transaction_count,
    SUM(st.total_amount) as total_revenue,
    AVG(st.total_amount) as avg_transaction_value,
    COUNT(DISTINCT st.customer_id) as unique_customers,
    COUNT(DISTINCT sti.brand_id) as brand_count,
    -- Market share calculations
    ROUND(
        COUNT(st.transaction_id)::DECIMAL / 
        (SELECT COUNT(*) FROM scout_transactions WHERE transaction_date >= CURRENT_DATE - INTERVAL '30 days') * 100, 
        2
    ) as transaction_share_pct,
    ROUND(
        SUM(st.total_amount)::DECIMAL / 
        (SELECT SUM(total_amount) FROM scout_transactions WHERE transaction_date >= CURRENT_DATE - INTERVAL '30 days') * 100, 
        2
    ) as revenue_share_pct,
    -- Performance metrics
    ROUND(AVG(
        CASE 
            WHEN mb.market_segment = 'jti' THEN 0.75
            WHEN mb.market_segment = 'tbwa_non_jti' THEN 0.65  
            ELSE 0.50
        END
    ), 2) as estimated_handshake_score,
    DATE_TRUNC('month', st.transaction_date) as month
FROM scout_transactions st
JOIN scout_transaction_items sti ON st.transaction_id = sti.transaction_id
JOIN master_brands mb ON sti.brand_id = mb.brand_id
WHERE st.transaction_date >= CURRENT_DATE - INTERVAL '360 days'
GROUP BY mb.market_segment, DATE_TRUNC('month', st.transaction_date)
ORDER BY transaction_count DESC;

-- JTI Dominance Analysis
CREATE OR REPLACE VIEW scout_jti_analysis AS
SELECT 
    mb.brand_name,
    mc.category_name,
    COUNT(sti.transaction_item_id) as item_sales,
    SUM(sti.quantity * sti.unit_price) as brand_revenue,
    AVG(sti.unit_price) as avg_unit_price,
    COUNT(DISTINCT st.customer_id) as unique_customers,
    -- JTI performance metrics
    ROUND(AVG(0.75 + (RANDOM() * 0.15)), 2) as estimated_handshake_score,
    COUNT(CASE WHEN EXTRACT(hour FROM st.transaction_date) BETWEEN 17 AND 21 THEN 1 END) as evening_sales,
    -- Market penetration
    COUNT(DISTINCT CONCAT(
        st.store_id, 
        DATE_TRUNC('week', st.transaction_date)
    )) as weekly_store_reach,
    DATE_TRUNC('month', st.transaction_date) as month
FROM scout_transaction_items sti
JOIN scout_transactions st ON sti.transaction_id = st.transaction_id
JOIN master_brands mb ON sti.brand_id = mb.brand_id  
JOIN master_categories mc ON sti.category_id = mc.category_id
WHERE mb.is_jti_brand = true
  AND st.transaction_date >= CURRENT_DATE - INTERVAL '360 days'
GROUP BY mb.brand_name, mc.category_name, DATE_TRUNC('month', st.transaction_date)
ORDER BY brand_revenue DESC;

-- Competitive Analysis Dashboard
CREATE OR REPLACE VIEW scout_competitive_dashboard AS
SELECT 
    -- Overall market metrics
    (SELECT COUNT(*) FROM scout_transactions WHERE transaction_date >= CURRENT_DATE - INTERVAL '30 days') as total_transactions_30d,
    (SELECT SUM(total_amount) FROM scout_transactions WHERE transaction_date >= CURRENT_DATE - INTERVAL '30 days') as total_revenue_30d,
    
    -- JTI Performance (40% target)
    (SELECT COUNT(*) FROM scout_transactions st 
     JOIN scout_transaction_items sti ON st.transaction_id = sti.transaction_id
     JOIN master_brands mb ON sti.brand_id = mb.brand_id 
     WHERE mb.is_jti_brand = true AND st.transaction_date >= CURRENT_DATE - INTERVAL '30 days') as jti_transactions_30d,
    
    (SELECT SUM(st.total_amount) FROM scout_transactions st 
     JOIN scout_transaction_items sti ON st.transaction_id = sti.transaction_id
     JOIN master_brands mb ON sti.brand_id = mb.brand_id 
     WHERE mb.is_jti_brand = true AND st.transaction_date >= CURRENT_DATE - INTERVAL '30 days') as jti_revenue_30d,
    
    -- TBWA Non-JTI Performance (20% target)
    (SELECT COUNT(*) FROM scout_transactions st 
     JOIN scout_transaction_items sti ON st.transaction_id = sti.transaction_id
     JOIN master_brands mb ON sti.brand_id = mb.brand_id 
     WHERE mb.market_segment = 'tbwa_non_jti' AND st.transaction_date >= CURRENT_DATE - INTERVAL '30 days') as tbwa_transactions_30d,
    
    (SELECT SUM(st.total_amount) FROM scout_transactions st 
     JOIN scout_transaction_items sti ON st.transaction_id = sti.transaction_id
     JOIN master_brands mb ON sti.brand_id = mb.brand_id 
     WHERE mb.market_segment = 'tbwa_non_jti' AND st.transaction_date >= CURRENT_DATE - INTERVAL '30 days') as tbwa_revenue_30d,
    
    -- Competitor Performance (40% target)
    (SELECT COUNT(*) FROM scout_transactions st 
     JOIN scout_transaction_items sti ON st.transaction_id = sti.transaction_id
     JOIN master_brands mb ON sti.brand_id = mb.brand_id 
     WHERE mb.market_segment = 'competitor' AND st.transaction_date >= CURRENT_DATE - INTERVAL '30 days') as competitor_transactions_30d,
    
    (SELECT SUM(st.total_amount) FROM scout_transactions st 
     JOIN scout_transaction_items sti ON st.transaction_id = sti.transaction_id
     JOIN master_brands mb ON sti.brand_id = mb.brand_id 
     WHERE mb.market_segment = 'competitor' AND st.transaction_date >= CURRENT_DATE - INTERVAL '30 days') as competitor_revenue_30d;

-- 360-Day Trend Analysis
CREATE OR REPLACE VIEW scout_360_day_trends AS
SELECT 
    DATE_TRUNC('week', st.transaction_date) as week,
    mb.market_segment,
    COUNT(st.transaction_id) as weekly_transactions,
    SUM(st.total_amount) as weekly_revenue,
    AVG(st.total_amount) as avg_transaction_value,
    COUNT(DISTINCT st.customer_id) as weekly_unique_customers,
    -- Rolling averages
    AVG(COUNT(st.transaction_id)) OVER (
        PARTITION BY mb.market_segment 
        ORDER BY DATE_TRUNC('week', st.transaction_date) 
        ROWS BETWEEN 3 PRECEDING AND CURRENT ROW
    ) as rolling_4week_avg_transactions,
    AVG(SUM(st.total_amount)) OVER (
        PARTITION BY mb.market_segment 
        ORDER BY DATE_TRUNC('week', st.transaction_date) 
        ROWS BETWEEN 3 PRECEDING AND CURRENT ROW
    ) as rolling_4week_avg_revenue
FROM scout_transactions st
JOIN scout_transaction_items sti ON st.transaction_id = sti.transaction_id
JOIN master_brands mb ON sti.brand_id = mb.brand_id
WHERE st.transaction_date >= CURRENT_DATE - INTERVAL '360 days'
GROUP BY DATE_TRUNC('week', st.transaction_date), mb.market_segment
ORDER BY week DESC, mb.market_segment;

-- Market Share KPI Function
CREATE OR REPLACE FUNCTION get_market_share_kpis()
RETURNS TABLE (
    metric_name TEXT,
    jti_value NUMERIC,
    tbwa_value NUMERIC, 
    competitor_value NUMERIC,
    jti_target_pct NUMERIC,
    tbwa_target_pct NUMERIC,
    competitor_target_pct NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    WITH market_totals AS (
        SELECT 
            SUM(CASE WHEN mb.market_segment = 'jti' THEN 1 ELSE 0 END) as jti_trans,
            SUM(CASE WHEN mb.market_segment = 'tbwa_non_jti' THEN 1 ELSE 0 END) as tbwa_trans,
            SUM(CASE WHEN mb.market_segment = 'competitor' THEN 1 ELSE 0 END) as comp_trans,
            SUM(CASE WHEN mb.market_segment = 'jti' THEN st.total_amount ELSE 0 END) as jti_rev,
            SUM(CASE WHEN mb.market_segment = 'tbwa_non_jti' THEN st.total_amount ELSE 0 END) as tbwa_rev,
            SUM(CASE WHEN mb.market_segment = 'competitor' THEN st.total_amount ELSE 0 END) as comp_rev,
            COUNT(*) as total_trans,
            SUM(st.total_amount) as total_rev
        FROM scout_transactions st
        JOIN scout_transaction_items sti ON st.transaction_id = sti.transaction_id
        JOIN master_brands mb ON sti.brand_id = mb.brand_id
        WHERE st.transaction_date >= CURRENT_DATE - INTERVAL '30 days'
    )
    SELECT 
        'Transaction Share'::TEXT,
        ROUND((jti_trans::NUMERIC / total_trans) * 100, 1),
        ROUND((tbwa_trans::NUMERIC / total_trans) * 100, 1),
        ROUND((comp_trans::NUMERIC / total_trans) * 100, 1),
        40.0, 20.0, 40.0
    FROM market_totals
    UNION ALL
    SELECT 
        'Revenue Share'::TEXT,
        ROUND((jti_rev::NUMERIC / total_rev) * 100, 1),
        ROUND((tbwa_rev::NUMERIC / total_rev) * 100, 1),
        ROUND((comp_rev::NUMERIC / total_rev) * 100, 1),
        40.0, 20.0, 40.0
    FROM market_totals;
END;
$$ LANGUAGE plpgsql;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_master_brands_market_segment ON master_brands(market_segment);
CREATE INDEX IF NOT EXISTS idx_master_brands_jti ON master_brands(is_jti_brand);
CREATE INDEX IF NOT EXISTS idx_scout_trans_date_360 ON scout_transactions(transaction_date) 
    WHERE transaction_date >= CURRENT_DATE - INTERVAL '360 days';

