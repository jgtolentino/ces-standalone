import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Client for public/anon access
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Client for server-side operations with full access
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Helper function to get KPI data
export async function getKPIData() {
  try {
    const { data, error } = await supabaseAdmin
      .from('scout_transactions')
      .select('transaction_id, total_amount, transaction_date')
      .gte('transaction_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Last 30 days
    
    if (error) throw error
    
    if (!data || data.length === 0) {
      return {
        revenue: 0,
        orders: 0,
        aov: 0,
        roi: 0
      }
    }
    
    const totalRevenue = data.reduce((sum, row) => sum + (row.total_amount || 0), 0)
    const totalOrders = data.length
    const aov = totalOrders > 0 ? totalRevenue / totalOrders : 0
    
    return {
      revenue: Math.round(totalRevenue),
      orders: totalOrders,
      aov: Math.round(aov),
      roi: 287 // Mock ROI for now
    }
  } catch (error) {
    console.error('Error fetching KPI data:', error)
    throw error
  }
}