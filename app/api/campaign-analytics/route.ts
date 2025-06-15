import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '../../../lib/database';

export async function GET(request: NextRequest) {
  try {
    // This API could fetch aggregated data directly from the database
    // or process data from the creative_campaign_analysis table.
    
    // Example: Fetch a summary of campaign types and their analysis status
    const query = `
      SELECT 
        campaign_type, 
        COUNT(DISTINCT campaign_id) as total_campaigns,
        COUNT(DISTINCT CASE WHEN creative_features IS NOT NULL THEN campaign_id END) as analyzed_campaigns
      FROM creative_campaign_analysis
      GROUP BY campaign_type;
    `;
    
    const result = await executeQuery(query);

    // Example: Fetch average scores for creative features or business outcomes
    // This would require more complex aggregation or pre-calculated views/tables

    return NextResponse.json({
      summary: result.rows,
      // Add more aggregated data here as needed
      generatedAt: new Date().toISOString()
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching campaign analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaign analytics', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 