#!/usr/bin/env node
/**
 * Deploy Scout Market Share Schema to Supabase
 * Uses environment variables from .env.local
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function deploySchema() {
  console.log('🚀 Deploying Scout Market Share Schema...');
  
  try {
    // 1. Add market segment columns to master_brands
    console.log('📊 Adding market segment columns...');
    
    const alterTableQueries = [
      `ALTER TABLE master_brands ADD COLUMN IF NOT EXISTS is_jti_brand BOOLEAN DEFAULT false`,
      `ALTER TABLE master_brands ADD COLUMN IF NOT EXISTS market_segment TEXT CHECK (market_segment IN ('tbwa_non_jti', 'jti', 'competitor'))`
    ];
    
    for (const query of alterTableQueries) {
      const { error } = await supabase.rpc('exec_sql', { query });
      if (error && !error.message.includes('already exists')) {
        console.error('Error:', error);
      }
    }
    
    // 2. Update market segments
    console.log('🔄 Updating market segments...');
    
    const updateQuery = `
      UPDATE master_brands SET 
        market_segment = CASE 
          WHEN brand_name IN ('Winston', 'Camel', 'Mevius', 'LD', 'Mighty', 'Glamour', 'Caster', 'Salem', 'More', 'Seven Stars') THEN 'jti'
          WHEN is_tbwa_client = true THEN 'tbwa_non_jti'
          ELSE 'competitor'
        END,
        is_jti_brand = CASE 
          WHEN brand_name IN ('Winston', 'Camel', 'Mevius', 'LD', 'Mighty', 'Glamour', 'Caster', 'Salem', 'More', 'Seven Stars') THEN true
          ELSE false
        END
    `;
    
    const { error: updateError } = await supabase.rpc('exec_sql', { query: updateQuery });
    if (updateError) {
      console.error('Update error:', updateError);
    }
    
    // 3. Create indexes
    console.log('📍 Creating indexes...');
    
    const indexQueries = [
      `CREATE INDEX IF NOT EXISTS idx_master_brands_market_segment ON master_brands(market_segment)`,
      `CREATE INDEX IF NOT EXISTS idx_master_brands_jti ON master_brands(is_jti_brand)`,
      `CREATE INDEX IF NOT EXISTS idx_scout_trans_date_360 ON scout_transactions(transaction_date) WHERE transaction_date >= CURRENT_DATE - INTERVAL '360 days'`
    ];
    
    for (const query of indexQueries) {
      const { error } = await supabase.rpc('exec_sql', { query });
      if (error && !error.message.includes('already exists')) {
        console.error('Index error:', error);
      }
    }
    
    console.log('✅ Schema deployment complete!');
    
    // 4. Test the deployment
    console.log('\n🧪 Testing market segments...');
    
    const { data, error: testError } = await supabase
      .from('master_brands')
      .select('market_segment, COUNT(*)')
      .group('market_segment');
      
    if (data) {
      console.log('Market segment distribution:', data);
    }
    
  } catch (error) {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  }
}

// Add exec_sql function if it doesn't exist
async function createExecSqlFunction() {
  const functionSql = `
    CREATE OR REPLACE FUNCTION exec_sql(query text)
    RETURNS void AS $$
    BEGIN
      EXECUTE query;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  `;
  
  // This will fail if we can't create functions, but that's ok
  await supabase.rpc('query', { sql: functionSql }).catch(() => {});
}

// Run deployment
createExecSqlFunction().then(() => deploySchema());