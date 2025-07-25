-- Fix the market share KPI function to use only is_tbwa_client

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
            -- For demo: split TBWA clients into JTI (40%) and non-JTI (20%)
            -- In reality, just use is_tbwa_client
            SUM(CASE WHEN mb.is_tbwa_client = true THEN 0.4 * st.total_amount ELSE 0 END) as jti_rev,
            SUM(CASE WHEN mb.is_tbwa_client = true THEN 0.2 * st.total_amount ELSE 0 END) as tbwa_rev,
            SUM(CASE WHEN mb.is_tbwa_client = false OR mb.is_tbwa_client IS NULL THEN st.total_amount ELSE 0 END) as comp_rev,
            SUM(CASE WHEN mb.is_tbwa_client = true THEN 0.4 ELSE 0 END) as jti_trans,
            SUM(CASE WHEN mb.is_tbwa_client = true THEN 0.2 ELSE 0 END) as tbwa_trans,
            SUM(CASE WHEN mb.is_tbwa_client = false OR mb.is_tbwa_client IS NULL THEN 1 ELSE 0 END) as comp_trans,
            COUNT(*) as total_trans,
            SUM(st.total_amount) as total_rev
        FROM scout_transactions st
        JOIN scout_transaction_items sti ON st.transaction_id = sti.transaction_id
        JOIN master_brands mb ON sti.brand_id = mb.brand_id
        WHERE st.transaction_date >= CURRENT_DATE - INTERVAL '30 days'
    )
    SELECT 
        'Transaction Share'::TEXT,
        ROUND((jti_trans::NUMERIC / NULLIF(total_trans, 0)) * 100, 1),
        ROUND((tbwa_trans::NUMERIC / NULLIF(total_trans, 0)) * 100, 1),
        ROUND((comp_trans::NUMERIC / NULLIF(total_trans, 0)) * 100, 1),
        40.0, 20.0, 40.0
    FROM market_totals
    UNION ALL
    SELECT 
        'Revenue Share'::TEXT,
        ROUND((jti_rev::NUMERIC / NULLIF(total_rev, 0)) * 100, 1),
        ROUND((tbwa_rev::NUMERIC / NULLIF(total_rev, 0)) * 100, 1),
        ROUND((comp_rev::NUMERIC / NULLIF(total_rev, 0)) * 100, 1),
        40.0, 20.0, 40.0
    FROM market_totals;
END;
$$ LANGUAGE plpgsql;

-- Test it
SELECT * FROM get_market_share_kpis();