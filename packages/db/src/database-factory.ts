/**
 * Database Factory - Routes tenants to appropriate database providers
 * CES uses Azure PostgreSQL, others use Supabase
 */

import { createClient } from '@supabase/supabase-js';
import { Pool } from 'pg';

export interface DatabaseClient {
  query(sql: string, params?: any[]): Promise<any>;
  close(): Promise<void>;
  provider: 'supabase' | 'azure-postgres';
}

class SupabaseClient implements DatabaseClient {
  provider = 'supabase' as const;
  private client;

  constructor(url: string, key: string) {
    this.client = createClient(url, key);
  }

  async query(sql: string, params: any[] = []) {
    const { data, error } = await this.client.rpc('execute_sql', {
      query: sql,
      params: params
    });
    
    if (error) throw new Error(`Supabase query error: ${error.message}`);
    return data;
  }

  async close() {
    // Supabase handles connection pooling
  }
}

class AzurePostgresClient implements DatabaseClient {
  provider = 'azure-postgres' as const;
  private pool: Pool;

  constructor(connectionConfig: any) {
    this.pool = new Pool({
      host: connectionConfig.host,
      database: connectionConfig.database,
      user: connectionConfig.user,
      password: connectionConfig.password,
      port: connectionConfig.port || 5432,
      ssl: { rejectUnauthorized: false },
      max: 20,
      idleTimeoutMillis: 30000,
    });
  }

  async query(sql: string, params: any[] = []) {
    const client = await this.pool.connect();
    try {
      const result = await client.query(sql, params);
      return result.rows;
    } finally {
      client.release();
    }
  }

  async close() {
    await this.pool.end();
  }
}

export class DatabaseFactory {
  private static clients = new Map<string, DatabaseClient>();

  static async getClient(tenantId: string): Promise<DatabaseClient> {
    if (this.clients.has(tenantId)) {
      return this.clients.get(tenantId)!;
    }

    let client: DatabaseClient;

    switch (tenantId) {
      case 'ces':
        // CES uses Azure PostgreSQL for enterprise requirements
        client = new AzurePostgresClient({
          host: process.env.CES_AZURE_PG_HOST,
          database: process.env.CES_AZURE_PG_DB || 'campaign_effectiveness',
          user: process.env.CES_AZURE_PG_USER,
          password: process.env.CES_AZURE_PG_PASS,
          port: 5432
        });
        break;

      case 'retail-insights':
        // Retail uses Supabase for rapid development
        client = new SupabaseClient(
          process.env.RETAIL_SUPABASE_URL!,
          process.env.RETAIL_SUPABASE_KEY!
        );
        break;

      case 'scout':
        // Scout uses Supabase for social media data
        client = new SupabaseClient(
          process.env.SCOUT_SUPABASE_URL!,
          process.env.SCOUT_SUPABASE_KEY!
        );
        break;

      case 'tbwa-chat':
        // TBWA Chat uses Supabase for knowledge base
        client = new SupabaseClient(
          process.env.TBWA_SUPABASE_URL!,
          process.env.TBWA_SUPABASE_KEY!
        );
        break;

      default:
        throw new Error(`Unknown tenant: ${tenantId}`);
    }

    this.clients.set(tenantId, client);
    return client;
  }

  static async closeAll() {
    for (const [tenantId, client] of this.clients) {
      await client.close();
      this.clients.delete(tenantId);
    }
  }
}

// Utility function for tenant-aware queries
export async function executeQuery(tenantId: string, sql: string, params?: any[]) {
  const client = await DatabaseFactory.getClient(tenantId);
  return await client.query(sql, params);
}