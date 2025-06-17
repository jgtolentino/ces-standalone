import { fetchDAL } from "../../../../lib/dal";

export async function GET() {
  try {
    const data = await fetchDAL("kpi_revenue_2024", { query_type: "summary" });
    console.log("KPI API - Raw data:", data);
    
    // Handle both array and direct object responses
    const rows = Array.isArray(data) ? data : [data];
    const r = rows[0] ?? {};
    
    console.log("KPI API - First row:", r);
    
    const result = {
      revenue: r.total_revenue || r.revenue || 0,
      orders: r.total_transactions || r.transactions || 0,
      aov: r.avg_aov || r.aov || 0,
      roi: r.avg_roi || r.roi || 0,
    };
    
    console.log("KPI API - Result:", result);
    return Response.json(result);
  } catch (e: any) {
    console.error("KPI API Error:", e);
    return Response.json({ error: e.message }, { status: 500 });
  }
}
