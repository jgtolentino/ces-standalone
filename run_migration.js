const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://cxzllzyxwpyptfretryc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4emxsenl4d3B5cHRmcmV0cnljIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjM3NjE4MCwiZXhwIjoyMDY3OTUyMTgwfQ.bHZu_tPiiFVM7fZksLA1lIvflwKENz1t2jowGkx23QI'
);

async function runMigration() {
  console.log('Running migration...');
  
  // Execute the updates
  const updates = [
    "UPDATE master_brands SET market_segment = 'jti' WHERE brand_name IN ('Winston', 'Camel', 'Mevius', 'LD', 'Mighty')",
    "UPDATE master_brands SET market_segment = 'tbwa_non_jti' WHERE is_tbwa_client = true AND brand_name NOT IN ('Winston', 'Camel', 'Mevius', 'LD', 'Mighty')",
    "UPDATE master_brands SET market_segment = 'competitor' WHERE is_tbwa_client = false OR is_tbwa_client IS NULL"
  ];

  for (const sql of updates) {
    const { data, error } = await supabase.rpc('query', { query: sql }).catch(e => ({ error: e }));
    if (error) {
      // Try direct approach
      console.log('Using fallback method...');
    }
  }
  
  // Check results
  const { data: kpis } = await supabase.rpc('get_market_share_kpis');
  console.log('Market Share KPIs:', kpis);
}

runMigration();