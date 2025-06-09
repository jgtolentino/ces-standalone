-- CES Azure PostgreSQL Schema
-- Campaign Effectiveness System Database Structure

-- ========================================
-- Core Tables
-- ========================================

CREATE TABLE IF NOT EXISTS campaigns (
    campaign_id SERIAL PRIMARY KEY,
    campaign_name VARCHAR(255) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    channel VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed')),
    budget DECIMAL(12,2) NOT NULL,
    spent DECIMAL(12,2) DEFAULT 0,
    roi DECIMAL(8,2) DEFAULT 0,
    reach BIGINT DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    impressions BIGINT DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    ctr DECIMAL(6,2) DEFAULT 0,
    cpm DECIMAL(8,2) DEFAULT 0,
    cpc DECIMAL(8,2) DEFAULT 0,
    conversion_rate DECIMAL(6,2) DEFAULT 0,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    campaign_type VARCHAR(50) DEFAULT 'brand_awareness',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    tenant_id VARCHAR(50) DEFAULT 'ces'
);

CREATE TABLE IF NOT EXISTS campaign_metrics (
    metric_id SERIAL PRIMARY KEY,
    campaign_id INTEGER REFERENCES campaigns(campaign_id) ON DELETE CASCADE,
    impressions BIGINT DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    revenue DECIMAL(12,2) DEFAULT 0,
    avg_order_value DECIMAL(8,2) DEFAULT 0,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tenant_id VARCHAR(50) DEFAULT 'ces'
);

CREATE TABLE IF NOT EXISTS campaign_analytics (
    analytics_id SERIAL PRIMARY KEY,
    campaign_id INTEGER REFERENCES campaigns(campaign_id) ON DELETE CASCADE,
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(12,4),
    metric_type VARCHAR(50), -- 'kpi', 'rate', 'count', 'currency'
    calculation_date DATE DEFAULT CURRENT_DATE,
    tenant_id VARCHAR(50) DEFAULT 'ces'
);

CREATE TABLE IF NOT EXISTS creative_assets (
    asset_id SERIAL PRIMARY KEY,
    campaign_id INTEGER REFERENCES campaigns(campaign_id) ON DELETE CASCADE,
    asset_type VARCHAR(20) CHECK (asset_type IN ('image', 'video', 'audio', 'text')),
    asset_url VARCHAR(500),
    performance_score DECIMAL(4,2) DEFAULT 0,
    engagement_rate DECIMAL(6,2) DEFAULT 0,
    click_through_rate DECIMAL(6,2) DEFAULT 0,
    conversion_rate DECIMAL(6,2) DEFAULT 0,
    cost_per_engagement DECIMAL(8,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tenant_id VARCHAR(50) DEFAULT 'ces'
);

CREATE TABLE IF NOT EXISTS campaign_performance (
    performance_id SERIAL PRIMARY KEY,
    campaign_id INTEGER REFERENCES campaigns(campaign_id) ON DELETE CASCADE,
    avg_order_value DECIMAL(8,2) DEFAULT 0,
    total_revenue DECIMAL(12,2) DEFAULT 0,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tenant_id VARCHAR(50) DEFAULT 'ces'
);

CREATE TABLE IF NOT EXISTS campaign_channel_performance (
    channel_performance_id SERIAL PRIMARY KEY,
    campaign_id INTEGER REFERENCES campaigns(campaign_id) ON DELETE CASCADE,
    channel VARCHAR(50) NOT NULL,
    spent DECIMAL(12,2) DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    roi DECIMAL(8,2) DEFAULT 0,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tenant_id VARCHAR(50) DEFAULT 'ces'
);

-- ========================================
-- Indexes for Performance
-- ========================================

CREATE INDEX IF NOT EXISTS idx_campaigns_brand ON campaigns(brand);
CREATE INDEX IF NOT EXISTS idx_campaigns_channel ON campaigns(channel);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_dates ON campaigns(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_campaign_metrics_campaign_id ON campaign_metrics(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_analytics_campaign_id ON campaign_analytics(campaign_id);
CREATE INDEX IF NOT EXISTS idx_creative_assets_campaign_id ON creative_assets(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_performance_campaign_id ON campaign_performance(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_channel_performance_campaign_id ON campaign_channel_performance(campaign_id);

-- ========================================
-- Row Level Security (RLS)
-- ========================================

ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE creative_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_channel_performance ENABLE ROW LEVEL SECURITY;

-- CES tenant isolation policy
CREATE POLICY ces_tenant_isolation ON campaigns
    FOR ALL USING (tenant_id = 'ces');

CREATE POLICY ces_metrics_isolation ON campaign_metrics
    FOR ALL USING (tenant_id = 'ces');

CREATE POLICY ces_analytics_isolation ON campaign_analytics
    FOR ALL USING (tenant_id = 'ces');

CREATE POLICY ces_creative_assets_isolation ON creative_assets
    FOR ALL USING (tenant_id = 'ces');

CREATE POLICY ces_performance_isolation ON campaign_performance
    FOR ALL USING (tenant_id = 'ces');

CREATE POLICY ces_channel_performance_isolation ON campaign_channel_performance
    FOR ALL USING (tenant_id = 'ces');

-- ========================================
-- Functions for Calculated Metrics
-- ========================================

CREATE OR REPLACE FUNCTION calculate_campaign_roi(p_campaign_id INTEGER)
RETURNS DECIMAL(8,2) AS $$
DECLARE
    campaign_spent DECIMAL(12,2);
    campaign_revenue DECIMAL(12,2);
    roi_value DECIMAL(8,2);
BEGIN
    SELECT spent INTO campaign_spent 
    FROM campaigns 
    WHERE campaign_id = p_campaign_id;
    
    SELECT SUM(revenue) INTO campaign_revenue 
    FROM campaign_metrics 
    WHERE campaign_id = p_campaign_id;
    
    IF campaign_spent > 0 AND campaign_revenue > 0 THEN
        roi_value := campaign_revenue / campaign_spent;
    ELSE
        roi_value := 0;
    END IF;
    
    RETURN roi_value;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION calculate_campaign_ctr(p_campaign_id INTEGER)
RETURNS DECIMAL(6,2) AS $$
DECLARE
    total_impressions BIGINT;
    total_clicks INTEGER;
    ctr_value DECIMAL(6,2);
BEGIN
    SELECT SUM(impressions), SUM(clicks) 
    INTO total_impressions, total_clicks
    FROM campaign_metrics 
    WHERE campaign_id = p_campaign_id;
    
    IF total_impressions > 0 THEN
        ctr_value := (total_clicks::DECIMAL / total_impressions) * 100;
    ELSE
        ctr_value := 0;
    END IF;
    
    RETURN ctr_value;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- Production Ready Schema - No Sample Data
-- ========================================

-- ========================================
-- Triggers for Updated Timestamps
-- ========================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_campaigns_updated_at 
    BEFORE UPDATE ON campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- Health Check Function
-- ========================================

CREATE OR REPLACE FUNCTION health_check()
RETURNS JSON AS $$
BEGIN
    RETURN json_build_object(
        'status', 'healthy',
        'database', 'campaign_effectiveness',
        'tenant', 'ces',
        'timestamp', CURRENT_TIMESTAMP,
        'table_count', (
            SELECT COUNT(*) 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        )
    );
END;
$$ LANGUAGE plpgsql;