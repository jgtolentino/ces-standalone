-- CES Tenant Isolation Policies
-- Ensures strict data isolation for Campaign Effectiveness System

-- Enable RLS on all CES tables
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE attribution_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE audience_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitive_intelligence ENABLE ROW LEVEL SECURITY;

-- Campaigns table policies
CREATE POLICY "CES tenant isolation for campaigns" ON campaigns
  FOR ALL USING (tenant_id = 'ces');

CREATE POLICY "CES users can view campaigns" ON campaigns
  FOR SELECT USING (
    tenant_id = 'ces' AND 
    (auth.jwt() ->> 'tenant') = 'ces'
  );

CREATE POLICY "CES users can insert campaigns" ON campaigns
  FOR INSERT WITH CHECK (
    tenant_id = 'ces' AND 
    (auth.jwt() ->> 'tenant') = 'ces'
  );

CREATE POLICY "CES users can update campaigns" ON campaigns
  FOR UPDATE USING (
    tenant_id = 'ces' AND 
    (auth.jwt() ->> 'tenant') = 'ces'
  );

-- Campaign metrics policies
CREATE POLICY "CES tenant isolation for campaign_metrics" ON campaign_metrics
  FOR ALL USING (tenant_id = 'ces');

CREATE POLICY "CES users can view campaign metrics" ON campaign_metrics
  FOR SELECT USING (
    tenant_id = 'ces' AND 
    (auth.jwt() ->> 'tenant') = 'ces'
  );

CREATE POLICY "CES users can insert campaign metrics" ON campaign_metrics
  FOR INSERT WITH CHECK (
    tenant_id = 'ces' AND 
    (auth.jwt() ->> 'tenant') = 'ces'
  );

-- Campaign analytics policies
CREATE POLICY "CES tenant isolation for campaign_analytics" ON campaign_analytics
  FOR ALL USING (tenant_id = 'ces');

CREATE POLICY "CES users can view analytics" ON campaign_analytics
  FOR SELECT USING (
    tenant_id = 'ces' AND 
    (auth.jwt() ->> 'tenant') = 'ces'
  );

-- Attribution data policies
CREATE POLICY "CES tenant isolation for attribution_data" ON attribution_data
  FOR ALL USING (tenant_id = 'ces');

CREATE POLICY "CES users can view attribution data" ON attribution_data
  FOR SELECT USING (
    tenant_id = 'ces' AND 
    (auth.jwt() ->> 'tenant') = 'ces'
  );

-- Audience insights policies
CREATE POLICY "CES tenant isolation for audience_insights" ON audience_insights
  FOR ALL USING (tenant_id = 'ces');

CREATE POLICY "CES users can view audience insights" ON audience_insights
  FOR SELECT USING (
    tenant_id = 'ces' AND 
    (auth.jwt() ->> 'tenant') = 'ces'
  );

-- Competitive intelligence policies (read-only for most users)
CREATE POLICY "CES tenant isolation for competitive_intelligence" ON competitive_intelligence
  FOR ALL USING (tenant_id = 'ces');

CREATE POLICY "CES users can view competitive intelligence" ON competitive_intelligence
  FOR SELECT USING (
    tenant_id = 'ces' AND 
    (auth.jwt() ->> 'tenant') = 'ces'
  );

CREATE POLICY "CES admins can manage competitive intelligence" ON competitive_intelligence
  FOR ALL USING (
    tenant_id = 'ces' AND 
    (auth.jwt() ->> 'tenant') = 'ces' AND
    (auth.jwt() ->> 'role') IN ('admin', 'analyst')
  );

-- Create CES-specific database functions
CREATE OR REPLACE FUNCTION get_ces_campaign_performance(
  p_campaign_id UUID DEFAULT NULL,
  p_start_date DATE DEFAULT NULL,
  p_end_date DATE DEFAULT NULL
) RETURNS TABLE (
  campaign_id UUID,
  campaign_name TEXT,
  channel TEXT,
  impressions BIGINT,
  clicks BIGINT,
  conversions BIGINT,
  spend DECIMAL(12,2),
  revenue DECIMAL(12,2),
  roi DECIMAL(8,2),
  ctr DECIMAL(8,4),
  cpm DECIMAL(8,2),
  cpc DECIMAL(8,2),
  conversion_rate DECIMAL(8,4)
) LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Ensure user has access to CES tenant
  IF (auth.jwt() ->> 'tenant') != 'ces' THEN
    RAISE EXCEPTION 'Access denied: User not authorized for CES tenant';
  END IF;

  RETURN QUERY
  SELECT 
    c.id as campaign_id,
    c.name as campaign_name,
    c.channel,
    COALESCE(SUM(cm.impressions), 0) as impressions,
    COALESCE(SUM(cm.clicks), 0) as clicks,
    COALESCE(SUM(cm.conversions), 0) as conversions,
    COALESCE(SUM(cm.spend), 0) as spend,
    COALESCE(SUM(cm.revenue), 0) as revenue,
    CASE 
      WHEN SUM(cm.spend) > 0 THEN (SUM(cm.revenue) / SUM(cm.spend))::DECIMAL(8,2)
      ELSE 0
    END as roi,
    CASE 
      WHEN SUM(cm.impressions) > 0 THEN (SUM(cm.clicks)::DECIMAL / SUM(cm.impressions) * 100)::DECIMAL(8,4)
      ELSE 0
    END as ctr,
    CASE 
      WHEN SUM(cm.impressions) > 0 THEN (SUM(cm.spend) / (SUM(cm.impressions) / 1000))::DECIMAL(8,2)
      ELSE 0
    END as cpm,
    CASE 
      WHEN SUM(cm.clicks) > 0 THEN (SUM(cm.spend) / SUM(cm.clicks))::DECIMAL(8,2)
      ELSE 0
    END as cpc,
    CASE 
      WHEN SUM(cm.clicks) > 0 THEN (SUM(cm.conversions)::DECIMAL / SUM(cm.clicks) * 100)::DECIMAL(8,4)
      ELSE 0
    END as conversion_rate
  FROM campaigns c
  LEFT JOIN campaign_metrics cm ON c.id = cm.campaign_id
  WHERE c.tenant_id = 'ces'
    AND (p_campaign_id IS NULL OR c.id = p_campaign_id)
    AND (p_start_date IS NULL OR cm.date >= p_start_date)
    AND (p_end_date IS NULL OR cm.date <= p_end_date)
  GROUP BY c.id, c.name, c.channel
  ORDER BY SUM(cm.spend) DESC NULLS LAST;
END;
$$;

-- Create function to get channel performance breakdown
CREATE OR REPLACE FUNCTION get_ces_channel_performance(
  p_start_date DATE DEFAULT NULL,
  p_end_date DATE DEFAULT NULL
) RETURNS TABLE (
  channel TEXT,
  campaigns_count BIGINT,
  total_spend DECIMAL(12,2),
  total_revenue DECIMAL(12,2),
  avg_roi DECIMAL(8,2),
  total_impressions BIGINT,
  total_clicks BIGINT,
  avg_ctr DECIMAL(8,4),
  avg_cpm DECIMAL(8,2)
) LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Ensure user has access to CES tenant
  IF (auth.jwt() ->> 'tenant') != 'ces' THEN
    RAISE EXCEPTION 'Access denied: User not authorized for CES tenant';
  END IF;

  RETURN QUERY
  SELECT 
    c.channel,
    COUNT(DISTINCT c.id) as campaigns_count,
    COALESCE(SUM(cm.spend), 0) as total_spend,
    COALESCE(SUM(cm.revenue), 0) as total_revenue,
    CASE 
      WHEN SUM(cm.spend) > 0 THEN (SUM(cm.revenue) / SUM(cm.spend))::DECIMAL(8,2)
      ELSE 0
    END as avg_roi,
    COALESCE(SUM(cm.impressions), 0) as total_impressions,
    COALESCE(SUM(cm.clicks), 0) as total_clicks,
    CASE 
      WHEN SUM(cm.impressions) > 0 THEN (SUM(cm.clicks)::DECIMAL / SUM(cm.impressions) * 100)::DECIMAL(8,4)
      ELSE 0
    END as avg_ctr,
    CASE 
      WHEN SUM(cm.impressions) > 0 THEN (SUM(cm.spend) / (SUM(cm.impressions) / 1000))::DECIMAL(8,2)
      ELSE 0
    END as avg_cpm
  FROM campaigns c
  LEFT JOIN campaign_metrics cm ON c.id = cm.campaign_id
  WHERE c.tenant_id = 'ces'
    AND (p_start_date IS NULL OR cm.date >= p_start_date)
    AND (p_end_date IS NULL OR cm.date <= p_end_date)
  GROUP BY c.channel
  ORDER BY total_spend DESC;
END;
$$;

-- Create audit trigger for CES data changes
CREATE OR REPLACE FUNCTION ces_audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
  -- Only audit CES tenant data
  IF (COALESCE(NEW.tenant_id, OLD.tenant_id) = 'ces') THEN
    INSERT INTO audit_log (
      tenant_id,
      table_name,
      operation,
      old_data,
      new_data,
      user_id,
      timestamp
    ) VALUES (
      'ces',
      TG_TABLE_NAME,
      TG_OP,
      CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
      CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) ELSE NULL END,
      auth.uid(),
      NOW()
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit triggers to CES tables
CREATE TRIGGER ces_campaigns_audit 
  AFTER INSERT OR UPDATE OR DELETE ON campaigns
  FOR EACH ROW EXECUTE FUNCTION ces_audit_trigger();

CREATE TRIGGER ces_campaign_metrics_audit 
  AFTER INSERT OR UPDATE OR DELETE ON campaign_metrics
  FOR EACH ROW EXECUTE FUNCTION ces_audit_trigger();

-- Grant appropriate permissions to CES users
GRANT SELECT, INSERT, UPDATE ON campaigns TO ces_user;
GRANT SELECT, INSERT, UPDATE ON campaign_metrics TO ces_user;
GRANT SELECT ON campaign_analytics TO ces_user;
GRANT SELECT ON attribution_data TO ces_user;
GRANT SELECT ON audience_insights TO ces_user;
GRANT SELECT ON competitive_intelligence TO ces_user;

-- Grant admin permissions to CES admins
GRANT ALL ON campaigns TO ces_admin;
GRANT ALL ON campaign_metrics TO ces_admin;
GRANT ALL ON campaign_analytics TO ces_admin;
GRANT ALL ON attribution_data TO ces_admin;
GRANT ALL ON audience_insights TO ces_admin;
GRANT ALL ON competitive_intelligence TO ces_admin;

-- Create CES-specific indexes for performance
CREATE INDEX IF NOT EXISTS idx_campaigns_ces_tenant ON campaigns(tenant_id) WHERE tenant_id = 'ces';
CREATE INDEX IF NOT EXISTS idx_campaigns_ces_status ON campaigns(status) WHERE tenant_id = 'ces';
CREATE INDEX IF NOT EXISTS idx_campaigns_ces_channel ON campaigns(channel) WHERE tenant_id = 'ces';
CREATE INDEX IF NOT EXISTS idx_campaign_metrics_ces_date ON campaign_metrics(date) WHERE tenant_id = 'ces';
CREATE INDEX IF NOT EXISTS idx_campaign_metrics_ces_campaign ON campaign_metrics(campaign_id) WHERE tenant_id = 'ces';

-- Add comments for documentation
COMMENT ON POLICY "CES tenant isolation for campaigns" ON campaigns IS 
  'Ensures campaigns data is isolated to CES tenant only';

COMMENT ON FUNCTION get_ces_campaign_performance IS 
  'Returns comprehensive performance metrics for CES campaigns with optional filtering';

COMMENT ON FUNCTION get_ces_channel_performance IS 
  'Returns aggregated performance metrics by marketing channel for CES tenant';