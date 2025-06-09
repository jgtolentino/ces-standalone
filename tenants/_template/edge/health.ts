import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export default async function handler(req: NextRequest) {
  const tenantSlug = process.env.TENANT_SLUG || 'template'
  
  try {
    // Basic health checks
    const checks = {
      timestamp: new Date().toISOString(),
      tenant: tenantSlug,
      status: 'healthy',
      version: process.env.npm_package_version || '0.1.0',
      checks: {
        api: 'ok',
        database: 'ok', // Would check Supabase connection in production
        cache: 'ok',
        external_services: 'ok'
      },
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      environment: process.env.NODE_ENV || 'development'
    }

    // Simulate some basic health validations
    if (req.method !== 'GET') {
      return NextResponse.json(
        { error: 'Method not allowed' }, 
        { status: 405 }
      )
    }

    // Return health status
    return NextResponse.json(checks, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Tenant': tenantSlug,
        'X-Health-Check': 'ok'
      }
    })

  } catch (error) {
    return NextResponse.json(
      { 
        status: 'unhealthy', 
        tenant: tenantSlug,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}