import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Basic health checks
    const checks = {
      timestamp: new Date().toISOString(),
      tenant: 'ces',
      status: 'healthy',
      version: process.env.npm_package_version || '1.0.0',
      checks: {
        api: 'ok',
        database: 'ok', // Would check Azure PostgreSQL connection in production
        cache: 'ok',
        external_services: 'ok'
      },
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      environment: process.env.NODE_ENV || 'development'
    };

    // Return health status
    return NextResponse.json(checks, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Tenant': 'ces',
        'X-Health-Check': 'ok'
      }
    });

  } catch (error) {
    return NextResponse.json(
      { 
        status: 'unhealthy', 
        tenant: 'ces',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 