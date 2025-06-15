import { NextRequest, NextResponse } from 'next/server';
import { LLMUtils } from '../../../utils/llm';
import { getCESContext } from '../../../utils/context';

export async function POST(request: NextRequest) {
  try {
    const { query, brand, region, dateRange, campaignId } = await request.json();

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    // Get contextual information for CES insights
    const context = await getCESContext({ brand, region, dateRange, campaignId });
    
    // Generate CES-specific response using Azure OpenAI
    const response = await LLMUtils.queryCES(query, context);

    return NextResponse.json({
      answer: response,
      context: {
        brand,
        region,
        dateRange,
        campaignId
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Ask CES API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process CES query', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'help';

    if (format === 'help') {
      return NextResponse.json({
        name: 'Ask CES API',
        description: 'TBWA Creative Effectiveness System AI Assistant',
        usage: {
          endpoint: '/api/ask-ces',
          method: 'POST',
          requiredFields: ['query'],
          optionalFields: ['brand', 'region', 'dateRange', 'campaignId']
        },
        examples: [
          {
            query: "What makes effective creative for Alaska brand?",
            brand: "Alaska",
            region: "NCR"
          },
          {
            query: "How can I improve brand recall for this campaign?",
            campaignId: "camp_123"
          }
        ],
        capabilities: [
          "Creative strategy recommendations",
          "CES framework analysis",
          "Brand-specific insights",
          "Campaign optimization",
          "Performance prediction"
        ]
      });
    }

    return NextResponse.json({
      status: 'ready',
      model: 'Azure OpenAI',
      features: ['context-aware', 'brand-specific', 'real-time'],
      version: '2.0'
    });

  } catch (error) {
    console.error('Ask CES GET Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch CES info' },
      { status: 500 }
    );
  }
}