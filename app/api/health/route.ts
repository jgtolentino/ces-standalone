import { NextRequest, NextResponse } from 'next/server';
import { mint, getUsageStats } from '@/lib/keykey';
import { alertCritical, alertError } from '@/lib/alert';

interface HealthCheck {
  service: string;
  status: 'healthy' | 'degraded' | 'down';
  responseTime?: number;
  error?: string;
  timestamp: string;
}

interface HealthResponse {
  status: 'healthy' | 'degraded' | 'down';
  timestamp: string;
  version: string;
  checks: HealthCheck[];
  uptime: number;
  system_type: string;
  cost_guardrails?: {
    status: string;
    usage_percentage: {
      daily: number;
      monthly: number;
    };
    warnings: string[];
  };
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();
  const checks: HealthCheck[] = [];
  
  // Check DAL (Data Access Layer) - using analytics endpoint as proxy
  const dalCheck = await checkDAL();
  checks.push(dalCheck);
  
  // Check OpenAI connectivity
  const openaiCheck = await checkOpenAI();
  checks.push(openaiCheck);
  
  // Check KeyKey JWT service
  const keykeyCheck = await checkKeyKey();
  checks.push(keykeyCheck);
  
  // Determine overall health
  const downServices = checks.filter(check => check.status === 'down');
  const degradedServices = checks.filter(check => check.status === 'degraded');
  
  let overallStatus: 'healthy' | 'degraded' | 'down';
  if (downServices.length > 0) {
    overallStatus = 'down';
  } else if (degradedServices.length > 0) {
    overallStatus = 'degraded';
  } else {
    overallStatus = 'healthy';
  }
  
  // Get cost guardrails status
  const usageStats = getUsageStats();
  const costWarnings = [];
  if (usageStats.percentages.dailyUsage > 80) {
    costWarnings.push('Daily request limit approaching (>80%)');
  }
  if (usageStats.percentages.monthlyBudget > 80) {
    costWarnings.push('Monthly cost limit approaching (>80%)');
  }

  const response: HealthResponse = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    version: process.env.VERCEL_GIT_COMMIT_SHA?.substring(0, 8) || '1.0.0',
    checks,
    uptime: Math.floor(process.uptime()),
    system_type: "Scout Analytics v3.3.1-dg-final",
    cost_guardrails: {
      status: costWarnings.length > 0 ? 'warning' : 'healthy',
      usage_percentage: {
        daily: Math.round(usageStats.percentages.dailyUsage),
        monthly: Math.round(usageStats.percentages.monthlyBudget)
      },
      warnings: costWarnings
    }
  };
  
  // Send alerts for critical service failures
  if (overallStatus === 'down') {
    const downServiceNames = downServices.map(s => s.service).join(', ');
    await alertCritical(
      'Scout Analytics v3.3.1',
      `Critical services are down: ${downServiceNames}`,
      { 
        downServices: downServices.map(s => ({ service: s.service, error: s.error })),
        timestamp: new Date().toISOString(),
        uptime: Math.floor(process.uptime())
      }
    );
  } else if (degradedServices.length > 0) {
    const degradedServiceNames = degradedServices.map(s => s.service).join(', ');
    await alertError(
      'Scout Analytics v3.3.1',
      `Services experiencing performance issues: ${degradedServiceNames}`,
      {
        degradedServices: degradedServices.map(s => ({ service: s.service, responseTime: s.responseTime })),
        timestamp: new Date().toISOString()
      }
    );
  }

  // Return appropriate HTTP status code
  const httpStatus = overallStatus === 'down' ? 503 : 
                    overallStatus === 'degraded' ? 206 : 200;
  
  return NextResponse.json(response, { status: httpStatus });
}

async function checkDAL(): Promise<HealthCheck> {
  const start = Date.now();
  try {
    // Test DAL by calling our analytics endpoint
    const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/analytics?metric=impressions`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Short timeout for health check
      signal: AbortSignal.timeout(5000)
    });
    
    const responseTime = Date.now() - start;
    
    if (response.ok) {
      return {
        service: 'DAL',
        status: responseTime > 2000 ? 'degraded' : 'healthy',
        responseTime,
        timestamp: new Date().toISOString()
      };
    } else {
      return {
        service: 'DAL',
        status: 'down',
        responseTime,
        error: `HTTP ${response.status}: ${response.statusText}`,
        timestamp: new Date().toISOString()
      };
    }
  } catch (error) {
    return {
      service: 'DAL',
      status: 'down',
      responseTime: Date.now() - start,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    };
  }
}

async function checkOpenAI(): Promise<HealthCheck> {
  const start = Date.now();
  try {
    // Simple OpenAI API connectivity check
    const response = await fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(5000)
    });
    
    const responseTime = Date.now() - start;
    
    if (response.ok) {
      return {
        service: 'OpenAI',
        status: responseTime > 3000 ? 'degraded' : 'healthy',
        responseTime,
        timestamp: new Date().toISOString()
      };
    } else {
      return {
        service: 'OpenAI',
        status: 'down',
        responseTime,
        error: `HTTP ${response.status}: ${response.statusText}`,
        timestamp: new Date().toISOString()
      };
    }
  } catch (error) {
    return {
      service: 'OpenAI',
      status: 'down',
      responseTime: Date.now() - start,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    };
  }
}

async function checkKeyKey(): Promise<HealthCheck> {
  const start = Date.now();
  try {
    // Test KeyKey JWT minting capability
    const token = await mint();
    const responseTime = Date.now() - start;
    
    if (token && token.length > 0) {
      return {
        service: 'KeyKey',
        status: responseTime > 1000 ? 'degraded' : 'healthy',
        responseTime,
        timestamp: new Date().toISOString()
      };
    } else {
      return {
        service: 'KeyKey',
        status: 'down',
        responseTime,
        error: 'Failed to mint JWT token',
        timestamp: new Date().toISOString()
      };
    }
  } catch (error) {
    return {
      service: 'KeyKey',
      status: 'down',
      responseTime: Date.now() - start,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    };
  }
} 