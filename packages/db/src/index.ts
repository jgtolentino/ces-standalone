/**
 * AI Database Package - Multi-tenant database access
 */

// Export primary tenant database factory (newer implementation)
export {
  TenantDatabaseFactory,
  executeQuery,
  TENANT_CONFIG,
  type TenantId,
  type DatabaseClient
} from './tenant-database-factory';

// Export tenant schemas
export * from './tenant-schemas';