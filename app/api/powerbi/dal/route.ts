import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '../../../../lib/database';

// Dataset registry mapping
const DATASET_REGISTRY = {
  'kpi_revenue_2024': {
    description: 'Revenue, Transactions, AOV, Margin',
    source: 'supabase',
    queries: {
      main: `
        SELECT 
          DATE(created_at) as date,
          SUM(revenue) as revenue,
          COUNT(*) as transactions,
          AVG(revenue) as aov,
          SUM(margin) as margin,
          SUM(revenue) / NULLIF(SUM(spent), 0) as roi
        FROM campaigns 
        WHERE created_at >= NOW() - INTERVAL '365 days'
        GROUP BY DATE(created_at)
        ORDER BY date DESC
      `,
      summary: `
        SELECT 
          SUM(revenue) as total_revenue,
          COUNT(*) as total_transactions,
          AVG(revenue) as avg_aov,
          SUM(margin) as total_margin,
          AVG(SUM(revenue) / NULLIF(SUM(spent), 0)) as avg_roi
        FROM campaigns 
        WHERE created_at >= NOW() - INTERVAL '365 days'
      `
    }
  },
  'campaign_performance': {
    description: 'CTR, ROI, Impressions, CPC',
    source: 'azure_sql',
    queries: {
      main: `
        SELECT 
          id,
          name,
          channel,
          impressions,
          clicks,
          conversions,
          spent,
          revenue,
          (clicks::float / NULLIF(impressions, 0)) * 100 as ctr,
          (revenue::float / NULLIF(spent, 0)) as roi,
          (spent::float / NULLIF(clicks, 0)) as cpc,
          start_date,
          end_date,
          status
        FROM campaigns 
        WHERE start_date >= NOW() - INTERVAL '90 days'
        ORDER BY start_date DESC
      `,
      summary: `
        SELECT 
          COUNT(*) as total_campaigns,
          SUM(impressions) as total_impressions,
          SUM(clicks) as total_clicks,
          SUM(conversions) as total_conversions,
          SUM(spent) as total_spent,
          SUM(revenue) as total_revenue,
          AVG((clicks::float / NULLIF(impressions, 0)) * 100) as avg_ctr,
          AVG(revenue::float / NULLIF(spent, 0)) as avg_roi,
          AVG(spent::float / NULLIF(clicks, 0)) as avg_cpc
        FROM campaigns 
        WHERE start_date >= NOW() - INTERVAL '90 days'
      `
    }
  },
  'audience_insights': {
    description: 'Age, Gender, Region, Income',
    source: 'supabase',
    queries: {
      main: `
        SELECT 
          age_range,
          gender,
          region,
          income_bracket,
          COUNT(*) as audience_count,
          AVG(engagement_score) as avg_engagement,
          SUM(conversions) as total_conversions,
          AVG(conversion_rate) as avg_conversion_rate
        FROM audience_data 
        WHERE created_at >= NOW() - INTERVAL '90 days'
        GROUP BY age_range, gender, region, income_bracket
        ORDER BY audience_count DESC
      `,
      demographics: `
        SELECT 
          'age' as dimension,
          age_range as segment,
          COUNT(*) as count,
          AVG(engagement_score) as performance_score
        FROM audience_data 
        WHERE created_at >= NOW() - INTERVAL '90 days'
        GROUP BY age_range
        UNION ALL
        SELECT 
          'gender' as dimension,
          gender as segment,
          COUNT(*) as count,
          AVG(engagement_score) as performance_score
        FROM audience_data 
        WHERE created_at >= NOW() - INTERVAL '90 days'
        GROUP BY gender
        UNION ALL
        SELECT 
          'region' as dimension,
          region as segment,
          COUNT(*) as count,
          AVG(engagement_score) as performance_score
        FROM audience_data 
        WHERE created_at >= NOW() - INTERVAL '90 days'
        GROUP BY region
      `
    }
  },
  'channel_analytics': {
    description: 'Media channel metrics (FB, IG, TV, In-store)',
    source: 'azure_sql',
    queries: {
      main: `
        SELECT 
          channel,
          DATE(created_at) as date,
          SUM(impressions) as impressions,
          SUM(clicks) as clicks,
          SUM(conversions) as conversions,
          SUM(spent) as spent,
          SUM(revenue) as revenue,
          AVG(ctr) as avg_ctr,
          AVG(cpc) as avg_cpc,
          AVG(roi) as avg_roi
        FROM campaigns 
        WHERE created_at >= NOW() - INTERVAL '90 days'
        GROUP BY channel, DATE(created_at)
        ORDER BY date DESC, channel
      `,
      summary: `
        SELECT 
          channel,
          COUNT(*) as campaign_count,
          SUM(impressions) as total_impressions,
          SUM(clicks) as total_clicks,
          SUM(conversions) as total_conversions,
          SUM(spent) as total_spent,
          SUM(revenue) as total_revenue,
          AVG(ctr) as avg_ctr,
          AVG(cpc) as avg_cpc,
          AVG(roi) as avg_roi,
          (SUM(revenue) / NULLIF(SUM(spent), 0)) as channel_roi
        FROM campaigns 
        WHERE created_at >= NOW() - INTERVAL '90 days'
        GROUP BY channel
        ORDER BY total_spent DESC
      `
    }
  },
  'qa_validation_logs': {
    description: 'UI audit trail from Caca + VibeTestBot',
    source: 'audit_db',
    queries: {
      main: `
        SELECT 
          log_id,
          test_type,
          component_name,
          validation_result,
          error_message,
          confidence_score,
          created_at,
          bot_name,
          tenant_id
        FROM qa_validation_logs 
        WHERE created_at >= NOW() - INTERVAL '30 days'
        ORDER BY created_at DESC
      `,
      summary: `
        SELECT 
          test_type,
          COUNT(*) as total_tests,
          SUM(CASE WHEN validation_result = 'pass' THEN 1 ELSE 0 END) as passed_tests,
          SUM(CASE WHEN validation_result = 'fail' THEN 1 ELSE 0 END) as failed_tests,
          AVG(confidence_score) as avg_confidence,
          bot_name
        FROM qa_validation_logs 
        WHERE created_at >= NOW() - INTERVAL '30 days'
        GROUP BY test_type, bot_name
        ORDER BY total_tests DESC
      `
    }
  }
};

export async function POST(request: NextRequest) {
  try {
    // Verify bearer token authentication
    const authHeader = request.headers.get('authorization');
    const powerbiToken = process.env.POWERBI_TOKEN;
    
    if (!authHeader || !authHeader.startsWith('Bearer ') || !powerbiToken) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid or missing bearer token' },
        { status: 401 }
      );
    }
    
    const token = authHeader.substring(7);
    if (token !== powerbiToken) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { datasetId, filters = {}, queryType = 'main' } = body;

    if (!datasetId) {
      return NextResponse.json(
        { error: 'Missing required parameter: datasetId' },
        { status: 400 }
      );
    }

    // Validate dataset exists in registry
    const dataset = DATASET_REGISTRY[datasetId as keyof typeof DATASET_REGISTRY];
    if (!dataset) {
      return NextResponse.json(
        { 
          error: 'Invalid datasetId',
          availableDatasets: Object.keys(DATASET_REGISTRY)
        },
        { status: 400 }
      );
    }

    // Get the appropriate query
    const query = dataset.queries[queryType as keyof typeof dataset.queries];
    if (!query) {
      return NextResponse.json(
        { 
          error: 'Invalid queryType',
          availableQueryTypes: Object.keys(dataset.queries)
        },
        { status: 400 }
      );
    }

    // Apply filters to query if provided
    let finalQuery = query;
    const queryParams: any[] = [];
    
    if (filters.dateRange) {
      const { start, end } = filters.dateRange;
      if (start && end) {
        finalQuery = finalQuery.replace(
          /WHERE created_at >= NOW\(\) - INTERVAL '[^']+'/g,
          `WHERE created_at >= $${queryParams.length + 1} AND created_at <= $${queryParams.length + 2}`
        );
        queryParams.push(start, end);
      }
    }

    if (filters.channel && datasetId === 'campaign_performance') {
      finalQuery += ` AND channel = $${queryParams.length + 1}`;
      queryParams.push(filters.channel);
    }

    if (filters.region && datasetId === 'audience_insights') {
      finalQuery += ` AND region = $${queryParams.length + 1}`;
      queryParams.push(filters.region);
    }

    // Execute query
    console.log(`Executing DAL query for dataset: ${datasetId}, queryType: ${queryType}`);
    const result = await executeQuery(finalQuery, queryParams);
    
    // Extract pagination parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10000');
    const rangeStart = searchParams.get('range_start');
    const rangeEnd = searchParams.get('range_end');

    // Get data array
    const dataArray = result.rows || result;
    const totalRecords = Array.isArray(dataArray) ? dataArray.length : 0;
    
    // Apply pagination
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = Array.isArray(dataArray) ? dataArray.slice(startIndex, endIndex) : dataArray;
    
    // Determine if there's a next page
    const hasNextPage = totalRecords > endIndex;
    const nextPageUrl = hasNextPage 
      ? `/api/powerbi/dal?datasetId=${datasetId}&queryType=${queryType}&page=${page + 1}&pageSize=${pageSize}${rangeStart ? `&range_start=${rangeStart}` : ''}${rangeEnd ? `&range_end=${rangeEnd}` : ''}`
      : null;

    // Format response for Power BI
    const response = {
      datasetId,
      description: dataset.description,
      source: dataset.source,
      queryType,
      filters: filters,
      data: paginatedData,
      metadata: {
        recordCount: Array.isArray(paginatedData) ? paginatedData.length : 0,
        totalRecords,
        page,
        pageSize,
        hasNextPage,
        executedAt: new Date().toISOString(),
        queryExecutionTime: Date.now() // This would be calculated in a real implementation
      }
    };

    // Add pagination header if there's a next page
    const headers: Record<string, string> = {};
    if (nextPageUrl) {
      headers['x-next-page'] = nextPageUrl;
    }

    return NextResponse.json(response, { headers });

  } catch (error) {
    console.error('DAL endpoint error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const meta = searchParams.get("meta");
    
    // Meta endpoint for dataset discovery
    if (meta === "true") {
      const datasets = Object.keys(DATASET_REGISTRY);
      return NextResponse.json({ 
        datasets,
        schemas: Object.entries(DATASET_REGISTRY).reduce((acc, [id, config]) => {
          acc[id] = {
            description: config.description,
            source: config.source,
            availableQueries: Object.keys(config.queries)
          };
          return acc;
        }, {} as Record<string, any>)
      });
    }

    // Return available datasets and their descriptions
    const datasets = Object.entries(DATASET_REGISTRY).map(([id, config]) => ({
      datasetId: id,
      description: config.description,
      source: config.source,
      availableQueries: Object.keys(config.queries)
    }));

    return NextResponse.json({
      message: 'Power BI DAL Endpoint',
      version: '1.0.0',
      availableDatasets: datasets,
      usage: {
        endpoint: '/api/powerbi/dal',
        method: 'POST',
        authentication: 'Bearer token required',
        parameters: {
          datasetId: 'Required - ID of the dataset to query',
          filters: 'Optional - Object containing filter criteria',
          queryType: 'Optional - Type of query (main, summary, etc.)'
        },
        meta: {
          endpoint: '/api/powerbi/dal?meta=true',
          description: 'Returns dataset schemas for Power BI discovery'
        }
      }
    });

  } catch (error) {
    console.error('DAL endpoint error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
