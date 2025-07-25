import { supabaseAdmin } from '../../../../lib/supabase';

export async function GET() {
  try {
    // Fetch all master data in parallel
    const [brandsResult, categoriesResult, storesResult] = await Promise.all([
      // Get all brands with market segments
      supabaseAdmin
        .from('master_brands')
        .select('brand_id, brand_name, is_tbwa_client, market_segment')
        .order('brand_name'),
      
      // Get all categories
      supabaseAdmin
        .from('master_categories')
        .select('category_id, category_name')
        .order('category_name'),
      
      // Get all stores with regions
      supabaseAdmin
        .from('master_stores')
        .select('store_id, store_name, region, city')
        .order('store_name')
    ]);

    if (brandsResult.error) throw brandsResult.error;
    if (categoriesResult.error) throw categoriesResult.error;
    if (storesResult.error) throw storesResult.error;

    // Process brands data
    const brands = brandsResult.data || [];
    const jtiBrands = brands.filter(b => b.market_segment === 'jti');
    const tbwaBrands = brands.filter(b => b.is_tbwa_client && b.market_segment !== 'jti');
    const competitorBrands = brands.filter(b => !b.is_tbwa_client);

    // Extract unique regions
    const regions = [...new Set(storesResult.data?.map(s => s.region) || [])].sort();
    
    // Group regions by area
    const regionGroups = {
      ncr: regions.filter(r => r.includes('NCR')),
      luzon: regions.filter(r => 
        ['Region I', 'Region II', 'Region III', 'Region IV-A', 'Region IV-B', 'Region V', 'CAR']
        .some(area => r.includes(area))
      ),
      visayas: regions.filter(r => 
        ['Region VI', 'Region VII', 'Region VIII'].some(area => r.includes(area))
      ),
      mindanao: regions.filter(r => 
        ['Region IX', 'Region X', 'Region XI', 'Region XII', 'Region XIII', 'BARMM']
        .some(area => r.includes(area))
      )
    };

    // Extract unique cities
    const cities = [...new Set(storesResult.data?.map(s => s.city).filter(Boolean) || [])].sort();

    return Response.json({
      brands: {
        all: brands,
        jti: jtiBrands,
        tbwa: tbwaBrands,
        competitors: competitorBrands,
        count: {
          total: brands.length,
          jti: jtiBrands.length,
          tbwa: tbwaBrands.length,
          competitors: competitorBrands.length
        }
      },
      categories: categoriesResult.data || [],
      stores: storesResult.data || [],
      locations: {
        regions: regions,
        regionGroups: regionGroups,
        cities: cities
      },
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Master data API error:', error);
    
    // Return basic structure if query fails
    return Response.json({
      brands: {
        all: [],
        jti: [],
        tbwa: [],
        competitors: [],
        count: { total: 0, jti: 0, tbwa: 0, competitors: 0 }
      },
      categories: [],
      stores: [],
      locations: {
        regions: [],
        regionGroups: { ncr: [], luzon: [], visayas: [], mindanao: [] },
        cities: []
      },
      lastUpdated: new Date().toISOString()
    });
  }
}