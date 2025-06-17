import { NextResponse } from 'next/server';
import { getUsageStats } from '../../../../packages/agents/keykey/jwt';

export async function GET() {
  try {
    const stats = getUsageStats();
    
    return NextResponse.json({
      status: 'healthy',
      service: 'keykey',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      usage: stats.percentages,
      limits: {
        daily_requests: stats.limits.DAILY_OPENAI_REQUESTS,
        monthly_budget: stats.limits.MONTHLY_COST_LIMIT_USD
      }
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      service: 'keykey',
      error: 'Health check failed'
    }, { status: 500 });
  }
}