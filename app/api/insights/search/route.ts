import { NextRequest, NextResponse } from 'next/server';
import { searchCampaignInsights, getRecommendationsForContext } from '../../../../lib/rag-memory';
import { verifyDalJwt } from '../../../../packages/agents/keykey/jwt';

export async function POST(request: NextRequest) {
  try {
    // Verify JWT token authentication
    const auth = request.headers.get("authorization") ?? "";
    if (!auth.startsWith("Bearer ")) {
      return NextResponse.json({ error: "missing token" }, { status: 401 });
    }
    try {
      await verifyDalJwt(auth.slice(7));
    } catch {
      return NextResponse.json({ error: "invalid token" }, { status: 401 });
    }

    const body = await request.json();
    const { query, campaignId, context, type = 'search' } = body;

    if (!query && !context) {
      return NextResponse.json(
        { error: 'Query or context is required' },
        { status: 400 }
      );
    }

    let results;

    if (type === 'recommendations' && context) {
      // Get AI recommendations based on context
      results = await getRecommendationsForContext(context);
    } else {
      // Search for insights
      results = await searchCampaignInsights(query, campaignId);
    }

    return NextResponse.json({
      type,
      query: query || 'contextual',
      results,
      metadata: {
        total_results: results.length,
        generated_at: new Date().toISOString(),
        source: 'cesai_rag_index'
      }
    });

  } catch (error) {
    console.error('Insight search error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to search insights',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const campaignId = searchParams.get('campaign_id');
    const meta = searchParams.get('meta');

    // Meta endpoint for insight discovery
    if (meta === 'true') {
      return NextResponse.json({
        endpoint: '/api/insights/search',
        methods: ['GET', 'POST'],
        parameters: {
          q: 'Search query string',
          campaign_id: 'Optional campaign ID filter',
          meta: 'true for metadata'
        },
        response_format: {
          type: 'search | recommendations',
          query: 'string',
          results: 'array',
          metadata: 'object'
        },
        examples: {
          search: '/api/insights/search?q=facebook+targeting',
          campaign_specific: '/api/insights/search?q=roi+optimization&campaign_id=camp_123',
          metadata: '/api/insights/search?meta=true'
        }
      });
    }

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter "q" is required' },
        { status: 400 }
      );
    }

    // Simple GET-based search
    const results = await searchCampaignInsights(query, campaignId || undefined);

    return NextResponse.json({
      type: 'search',
      query,
      campaign_id: campaignId,
      results,
      metadata: {
        total_results: results.length,
        generated_at: new Date().toISOString(),
        source: 'cesai_rag_index'
      }
    });

  } catch (error) {
    console.error('Insight search error:', error);
    return NextResponse.json(
      { error: 'Failed to search insights' },
      { status: 500 }
    );
  }
}