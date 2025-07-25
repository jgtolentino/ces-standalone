-- Add spend_per_capita and store_density_score to Scout analytics

-- First, let's create a population reference table if it doesn't exist
CREATE TABLE IF NOT EXISTS master_population (
  region_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region_name TEXT NOT NULL UNIQUE,
  population INTEGER NOT NULL,
  area_km2 DECIMAL(10,2),
  population_density DECIMAL(10,2) GENERATED ALWAYS AS (population / NULLIF(area_km2, 0)) STORED,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert Philippine region population data (2020 census estimates)
INSERT INTO master_population (region_name, population, area_km2) VALUES
  ('NCR', 13484462, 619.57),
  ('Region I', 5301139, 13012.60),
  ('Region II', 3685744, 29836.88),
  ('Region III', 12422172, 22014.63),
  ('Region IV-A', 16195042, 16228.99),
  ('Region IV-B', 3228558, 29606.25),
  ('Region V', 6082165, 18114.47),
  ('CAR', 1797660, 19294.78),
  ('Region VI', 7954723, 20778.29),
  ('Region VII', 8081988, 15872.58),
  ('Region VIII', 4719010, 23234.78),
  ('Region IX', 3875576, 17056.73),
  ('Region X', 5022768, 20496.02),
  ('Region XI', 5243536, 20357.42),
  ('Region XII', 4901486, 22513.30),
  ('Region XIII', 2803085, 21478.35),
  ('BARMM', 4404288, 36650.95)
ON CONFLICT (region_name) DO NOTHING;

-- Create enhanced view with spend per capita and store density
CREATE OR REPLACE VIEW scout_analytics_enhanced AS
WITH regional_summary AS (
  SELECT 
    s.region,
    COUNT(DISTINCT t.transaction_id) as transaction_count,
    COUNT(DISTINCT s.store_id) as store_count,
    SUM(t.total_amount) as total_revenue,
    COUNT(DISTINCT t.customer_id) as unique_customers
  FROM scout_transactions t
  JOIN master_stores s ON t.store_id = s.store_id
  WHERE t.transaction_date >= CURRENT_DATE - INTERVAL '30 days'
  GROUP BY s.region
)
SELECT 
  rs.*,
  mp.population,
  mp.area_km2,
  mp.population_density,
  -- Calculate spend per capita
  CASE 
    WHEN mp.population > 0 THEN ROUND((rs.total_revenue / mp.population)::numeric, 2)
    ELSE 0
  END as spend_per_capita,
  -- Calculate store density score (stores per 100k population)
  CASE 
    WHEN mp.population > 0 THEN ROUND((rs.store_count::numeric / mp.population * 100000), 2)
    ELSE 0
  END as store_density_score,
  -- Average transaction value
  CASE 
    WHEN rs.transaction_count > 0 THEN ROUND((rs.total_revenue / rs.transaction_count)::numeric, 2)
    ELSE 0
  END as avg_transaction_value
FROM regional_summary rs
LEFT JOIN master_population mp ON rs.region = mp.region_name
ORDER BY rs.total_revenue DESC;

-- Create function to get demographics data
CREATE OR REPLACE FUNCTION get_scout_demographics(
  date_from DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
  date_to DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  demographic_type TEXT,
  demographic_value TEXT,
  customer_count INTEGER,
  transaction_count INTEGER,
  total_spend DECIMAL,
  avg_spend DECIMAL
) AS $$
BEGIN
  -- Gender demographics
  RETURN QUERY
  SELECT 
    'gender'::TEXT as demographic_type,
    c.gender as demographic_value,
    COUNT(DISTINCT c.customer_id)::INTEGER as customer_count,
    COUNT(t.transaction_id)::INTEGER as transaction_count,
    SUM(t.total_amount)::DECIMAL as total_spend,
    ROUND(AVG(t.total_amount)::numeric, 2) as avg_spend
  FROM scout_customers c
  JOIN scout_transactions t ON c.customer_id = t.customer_id
  WHERE t.transaction_date BETWEEN date_from AND date_to
  GROUP BY c.gender;

  -- Age group demographics
  RETURN QUERY
  SELECT 
    'age_group'::TEXT as demographic_type,
    c.age_group as demographic_value,
    COUNT(DISTINCT c.customer_id)::INTEGER as customer_count,
    COUNT(t.transaction_id)::INTEGER as transaction_count,
    SUM(t.total_amount)::DECIMAL as total_spend,
    ROUND(AVG(t.total_amount)::numeric, 2) as avg_spend
  FROM scout_customers c
  JOIN scout_transactions t ON c.customer_id = t.customer_id
  WHERE t.transaction_date BETWEEN date_from AND date_to
  GROUP BY c.age_group;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT SELECT ON scout_analytics_enhanced TO authenticated;
GRANT SELECT ON master_population TO authenticated;
GRANT EXECUTE ON FUNCTION get_scout_demographics TO authenticated;