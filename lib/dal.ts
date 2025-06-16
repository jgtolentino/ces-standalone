export async function fetchDAL(
  dataset: string,
  query: Record<string, any> = {},
  host = process.env.NEXT_PUBLIC_DAL_HOST || ""
) {
  const qs = new URLSearchParams({ dataset, ...query });
  const url = `${host}/api/powerbi/dal?${qs.toString()}`;
  const r   = await fetch(url, {
    headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_DAL_TOKEN ?? ""}` },
    cache: "no-store",
  });
  if (!r.ok) throw new Error(`DAL error ${r.status}`);
  return r.json();
}
