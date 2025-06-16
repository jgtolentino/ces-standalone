import { fetchDAL } from "../../../../lib/dal";

export async function GET() {
  try {
    const rows = await fetchDAL("kpi_revenue_2024", { query_type: "summary" });
    const r    = rows[0] ?? {};
    return Response.json({
      revenue: r.revenue,
      orders: r.transactions,
      aov: r.aov,
      roi: r.roi,
    });
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
