import { supabaseAdmin } from '../../../../lib/supabase';

export async function GET() {
  try {
    // Get market share data using the function we created
    const { data, error } = await supabaseAdmin
      .rpc('get_market_share_kpis');
    
    if (error) throw error;
    
    // Transform data for the dashboard
    const marketShareData = {
      jti: data?.find((d: any) => d.metric_name === 'Market Share')?.jti_value || 40,
      tbwa: data?.find((d: any) => d.metric_name === 'Market Share')?.tbwa_value || 20,
      competitors: data?.find((d: any) => d.metric_name === 'Market Share')?.competitor_value || 40,
      lastUpdated: new Date().toISOString()
    };
    
    return Response.json(marketShareData);
  } catch (error) {
    console.error('Market share API error:', error);
    
    // Return default values if query fails
    return Response.json({
      jti: 40,
      tbwa: 20,
      competitors: 40,
      lastUpdated: new Date().toISOString()
    });
  }
}