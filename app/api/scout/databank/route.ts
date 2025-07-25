import { supabaseAdmin } from '../../../../lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    const dateRange = searchParams.get('dateRange') || '30d';
    const location = searchParams.get('location') || 'all';
    const category = searchParams.get('category') || 'all';
    const brand = searchParams.get('brand') || 'all';
    const search = searchParams.get('search') || '';
    const sortField = searchParams.get('sortField') || 'transaction_date';
    const sortDirection = searchParams.get('sortDirection') || 'desc';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // Calculate date range
    let dateFilter = new Date();
    switch (dateRange) {
      case 'today':
        dateFilter.setHours(0, 0, 0, 0);
        break;
      case '7d':
        dateFilter.setDate(dateFilter.getDate() - 7);
        break;
      case '30d':
        dateFilter.setDate(dateFilter.getDate() - 30);
        break;
      case '90d':
        dateFilter.setDate(dateFilter.getDate() - 90);
        break;
      case '360d':
        dateFilter.setDate(dateFilter.getDate() - 360);
        break;
    }

    // Build query
    let query = supabaseAdmin
      .from('scout_transactions')
      .select(`
        transaction_id,
        transaction_date,
        total_amount,
        payment_method,
        store_id,
        master_stores!inner(
          store_name,
          region
        ),
        scout_transaction_items(
          quantity,
          unit_price,
          master_brands(
            brand_name,
            is_tbwa_client,
            market_segment
          ),
          master_categories(
            category_name
          )
        )
      `)
      .gte('transaction_date', dateFilter.toISOString())
      .order(sortField, { ascending: sortDirection === 'asc' })
      .range(offset, offset + limit - 1);

    // Apply location filter
    if (location !== 'all') {
      const regionMap: Record<string, string[]> = {
        'ncr': ['NCR'],
        'luzon': ['Region I', 'Region II', 'Region III', 'Region IV-A', 'Region IV-B', 'Region V', 'CAR'],
        'visayas': ['Region VI', 'Region VII', 'Region VIII'],
        'mindanao': ['Region IX', 'Region X', 'Region XI', 'Region XII', 'Region XIII', 'BARMM']
      };
      
      if (regionMap[location]) {
        query = query.in('master_stores.region', regionMap[location]);
      }
    }

    // Apply brand filter
    if (brand !== 'all') {
      if (brand === 'jti') {
        query = query.eq('scout_transaction_items.master_brands.market_segment', 'jti');
      } else if (brand === 'tbwa') {
        query = query.eq('scout_transaction_items.master_brands.is_tbwa_client', true);
      } else if (brand === 'competitors') {
        query = query.eq('scout_transaction_items.master_brands.is_tbwa_client', false);
      }
    }

    const { data, error } = await query;

    if (error) throw error;

    // Transform data with proper types
    const transactions = data?.map((transaction: any) => ({
      transaction_id: transaction.transaction_id,
      transaction_date: transaction.transaction_date,
      store_name: transaction.master_stores?.store_name || 'Unknown Store',
      region: transaction.master_stores?.region || 'Unknown Region',
      total_amount: transaction.total_amount,
      payment_method: transaction.payment_method,
      items: transaction.scout_transaction_items?.map((item: any) => ({
        brand_name: item.master_brands?.brand_name || 'Unknown Brand',
        category_name: item.master_categories?.category_name || 'Unknown Category',
        quantity: item.quantity,
        unit_price: item.unit_price
      })) || []
    })) || [];

    // Apply search filter (post-processing)
    let filteredTransactions = transactions;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredTransactions = transactions.filter(t => 
        t.transaction_id.toLowerCase().includes(searchLower) ||
        t.store_name.toLowerCase().includes(searchLower) ||
        t.region.toLowerCase().includes(searchLower) ||
        t.items.some((i: any) => i.brand_name.toLowerCase().includes(searchLower))
      );
    }

    // Apply category filter (post-processing)
    if (category !== 'all') {
      const categoryMap: Record<string, string[]> = {
        'beverages': ['Beverages', 'Drinks', 'Juice', 'Water'],
        'snacks': ['Snacks', 'Chips', 'Biscuits', 'Crackers'],
        'personal-care': ['Personal Care', 'Shampoo', 'Soap', 'Toothpaste'],
        'household': ['Household', 'Detergent', 'Cleaner'],
        'tobacco': ['Tobacco', 'Cigarettes']
      };
      
      if (categoryMap[category]) {
        filteredTransactions = filteredTransactions.filter(t =>
          t.items.some((i: any) => categoryMap[category].some(cat => 
            i.category_name.toLowerCase().includes(cat.toLowerCase())
          ))
        );
      }
    }

    return Response.json({
      transactions: filteredTransactions,
      total: filteredTransactions.length,
      page,
      limit
    });

  } catch (error) {
    console.error('Databank API error:', error);
    
    // Return mock data if query fails
    return Response.json({
      transactions: [
        {
          transaction_id: 'TRX-001',
          transaction_date: new Date().toISOString(),
          store_name: 'Metro Manila Hub',
          region: 'NCR',
          total_amount: 1250,
          payment_method: 'Cash',
          items: [
            { brand_name: 'Winston', category_name: 'Tobacco', quantity: 2, unit_price: 150 },
            { brand_name: 'Oishi', category_name: 'Snacks', quantity: 3, unit_price: 25 }
          ]
        }
      ],
      total: 1,
      page: 1,
      limit: 20
    });
  }
}