/**
 * Tenant-Specific Database Factory
 * Routes each tenant to appropriate database provider
 * CES → Azure PostgreSQL, Others → Supabase
 */

import { createClient } from '@supabase/supabase-js';
import { Pool } from 'pg';

export type TenantId = 'ces' | 'retail-insights' | 'scout' | 'tbwa-chat' | 'acme';

export interface DatabaseClient {
  query(sql: string, params?: any[]): Promise<any>;
  tenant: TenantId;
  provider: 'azure' | 'supabase';
}

class AzurePostgresClient implements DatabaseClient {
  private pool: Pool;
  public tenant: TenantId;
  public provider: 'azure' = 'azure';

  constructor(tenant: TenantId, connectionString: string) {
    this.tenant = tenant;
    this.pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }

  async query(sql: string, params?: any[]): Promise<any> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(sql, params);
      return result.rows;
    } finally {
      client.release();
    }
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}

class SupabaseClient implements DatabaseClient {
  private client: any;
  public tenant: TenantId;
  public provider: 'supabase' = 'supabase';

  constructor(tenant: TenantId, url: string, key: string) {
    this.tenant = tenant;
    this.client = createClient(url, key);
  }

  async query(sql: string, params?: any[]): Promise<any> {
    // Convert SQL to Supabase client calls
    const { data, error } = await this.client.rpc('execute_sql', { 
      query: sql, 
      parameters: params 
    });
    
    if (error) throw new Error(`Supabase query error: ${error.message}`);
    return data;
  }
}

export class TenantDatabaseFactory {
  private static instances = new Map<TenantId, DatabaseClient>();

  static getClient(tenant: TenantId): DatabaseClient {
    if (this.instances.has(tenant)) {
      return this.instances.get(tenant)!;
    }

    const client = this.createClient(tenant);
    this.instances.set(tenant, client);
    return client;
  }

  private static createClient(tenant: TenantId): DatabaseClient {
    switch (tenant) {
      case 'ces':
        // CES uses Azure PostgreSQL for enterprise reliability
        const cesConnectionString = process.env.CES_AZURE_POSTGRES_URL;
        if (!cesConnectionString) {
          throw new Error('CES_AZURE_POSTGRES_URL environment variable required for CES tenant');
        }
        return new AzurePostgresClient(tenant, cesConnectionString);

      case 'retail-insights':
      case 'scout':
      case 'tbwa-chat':
      case 'acme':
      default:
        // Other tenants use Supabase for development speed
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_ANON_KEY;
        
        if (!supabaseUrl || !supabaseKey) {
          throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY required for non-CES tenants');
        }
        
        return new SupabaseClient(tenant, supabaseUrl, supabaseKey);
    }
  }

  static async closeAll(): Promise<void> {
    for (const [tenant, client] of this.instances) {
      if (client instanceof AzurePostgresClient) {
        await client.close();
      }
    }
    this.instances.clear();
  }
}

// Convenience function for tenant-specific queries
export async function executeQuery(
  tenant: TenantId, 
  sql: string, 
  params?: any[]
): Promise<any> {
  const client = TenantDatabaseFactory.getClient(tenant);
  return await client.query(sql, params);
}

// Tenant configuration mapping
export const TENANT_CONFIG = {
  ces: {
    database: 'azure-postgresql',
    schema: 'ces_production',
    tables: ['campaigns', 'analytics', 'creative_assets', 'campaign_performance'],
    features: ['campaign_analysis', 'creative_optimization', 'roi_tracking']
  },
  'retail-insights': {
    database: 'supabase',
    schema: 'public',
    tables: ['sales_data', 'product_performance', 'store_metrics', 'customer_segments'],
    features: ['sales_analytics', 'inventory_optimization', 'customer_insights']
  },
  scout: {
    database: 'supabase', 
    schema: 'public',
    tables: ['projects', 'tasks', 'team_members', 'project_metrics'],
    features: ['project_tracking', 'team_collaboration', 'progress_analytics']
  },
  'tbwa-chat': {
    database: 'supabase',
    schema: 'public', 
    tables: ['conversations', 'messages', 'users', 'chat_analytics'],
    features: ['real_time_chat', 'message_history', 'user_management']
  }
} as const;