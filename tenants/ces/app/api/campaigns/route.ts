import { NextRequest, NextResponse } from 'next/server';
import { getCampaignMetrics } from '@ai/agents';
import { executeQuery } from '@ai/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Get real campaign data from Azure PostgreSQL
    const campaigns = await getCampaignMetrics(
      undefined, // No specific campaign ID
      startDate || undefined,
      endDate || undefined,
      status || undefined
    );

    // Apply pagination
    const totalCampaigns = campaigns.length;
    const paginatedCampaigns = campaigns.slice(offset, offset + limit);

    // Calculate aggregate metrics from real data
    const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
    const totalSpend = campaigns.reduce((sum, c) => sum + c.spent, 0);
    const totalReach = campaigns.reduce((sum, c) => sum + c.reach, 0);
    const totalImpressions = campaigns.reduce((sum, c) => sum + c.impressions, 0);
    const totalClicks = campaigns.reduce((sum, c) => sum + c.clicks, 0);
    const totalConversions = campaigns.reduce((sum, c) => sum + c.conversions, 0);
    
    const averageROI = campaigns.length > 0 
      ? campaigns.reduce((sum, c) => sum + c.roi, 0) / campaigns.length 
      : 0;
    
    const overallCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    const overallConversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;

    return NextResponse.json({
      campaigns: paginatedCampaigns,
      pagination: {
        total: totalCampaigns,
        limit,
        offset,
        hasMore: offset + limit < totalCampaigns
      },
      aggregates: {
        totalCampaigns,
        activeCampaigns,
        totalSpend,
        totalReach,
        totalImpressions,
        totalClicks,
        totalConversions,
        averageROI: Math.round(averageROI * 100) / 100,
        overallCTR: Math.round(overallCTR * 100) / 100,
        overallConversionRate: Math.round(overallConversionRate * 100) / 100
      },
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaigns' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['campaign_name', 'channel', 'budget', 'start_date', 'end_date'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Insert new campaign into Azure PostgreSQL
    const insertQuery = `
      INSERT INTO campaigns (
        campaign_name, status, channel, budget, spent, roi, reach, conversions,
        impressions, clicks, ctr, cpm, cpc, conversion_rate, start_date, end_date,
        brand, campaign_type, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, $5, $6, $7, $8, NOW(), NOW()
      ) RETURNING *;
    `;

    const result = await executeQuery('ces', insertQuery, [
      body.campaign_name,
      body.status || 'draft',
      body.channel,
      parseFloat(body.budget),
      body.start_date,
      body.end_date,
      body.brand || 'TBWA',
      body.campaign_type || 'brand_awareness'
    ]);

    if (result.length === 0) {
      throw new Error('Failed to create campaign');
    }

    return NextResponse.json({
      campaign: result[0],
      message: 'Campaign created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating campaign:', error);
    return NextResponse.json(
      { error: 'Failed to create campaign' },
      { status: 500 }
    );
  }
}