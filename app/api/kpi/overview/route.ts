import { getKPIData } from '../../../../lib/supabase'

export async function GET() {
  try {
    const data = await getKPIData()
    console.log("KPI API - Supabase data:", data)
    
    return Response.json(data)
  } catch (e: any) {
    console.error("KPI API Error:", e)
    
    // Return mock data if Supabase fails
    return Response.json({
      revenue: 3840000, // ₱3.84M
      orders: 12450,
      aov: 308,
      roi: 287
    })
  }
}