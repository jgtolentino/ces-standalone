import { NextRequest, NextResponse } from 'next/server';
import { getUsageStats } from '../../../../packages/agents/keykey/jwt';

export async function GET(request: NextRequest) {
  try {
    const stats = getUsageStats();
    
    // Add warning flags for approaching limits
    const warnings = [];
    if (stats.percentages.dailyUsage > 80) {
      warnings.push('Daily request limit approaching (>80%)');
    }
    if (stats.percentages.monthlyBudget > 80) {
      warnings.push('Monthly cost limit approaching (>80%)');
    }
    
    return NextResponse.json({
      ...stats,
      warnings,
      timestamp: new Date().toISOString(),
      status: warnings.length > 0 ? 'warning' : 'healthy'
    });
  } catch (error) {
    console.error('Error fetching usage stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch usage statistics' },
      { status: 500 }
    );
  }
}