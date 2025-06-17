let jwt: string | null = null;

async function getJwt() {
  if (jwt) return jwt;
  
  // Use KeyKey JWT service only - no fallback tokens for production security
  const keyKeyUrl = process.env.NEXT_PUBLIC_DAL_KEYKEY_URL;
  if (!keyKeyUrl) {
    throw new Error('NEXT_PUBLIC_DAL_KEYKEY_URL environment variable is required for secure JWT authentication');
  }
  
  const response = await fetch(keyKeyUrl);
  if (!response.ok) {
    throw new Error(`Failed to obtain JWT from KeyKey service: ${response.status} ${response.statusText}`);
  }
  
  jwt = await response.text();
  
  return jwt;
}

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
  
  const doFetch = async () =>
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await getJwt()}`
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

  let r = await doFetch();
  if (r.status === 401) {
    jwt = null; // expired → force refresh
    r = await doFetch();
  }
  
  if (!r.ok) {
    const errorText = await r.text();
    throw new Error(`DAL error ${r.status}: ${errorText}`);
  }
  
  const response = await r.json();
  return response.data || [];
}
