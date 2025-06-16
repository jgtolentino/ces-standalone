export async function fetchDAL(
  dataset: string,
  query: Record<string, any> = {},
  host = process.env.NEXT_PUBLIC_DAL_HOST || ""
) {
  const url = `${host}/api/powerbi/dal`;
  const body = {
    datasetId: dataset,
    queryType: query.query_type || 'summary',
    filters: query.filters || {}
  };
  
  const r = await fetch(url, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.NEXT_PUBLIC_DAL_TOKEN ?? ""}`
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  
  if (!r.ok) {
    const errorText = await r.text();
    throw new Error(`DAL error ${r.status}: ${errorText}`);
  }
  
  const response = await r.json();
  return response.data || [];
}
