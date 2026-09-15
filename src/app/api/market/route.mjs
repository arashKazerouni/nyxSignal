import { fetchMarketSnapshot } from '../../../market-data/coingecko.mjs';

export async function GET(request) {
  const url = new URL(request.url);
  const perPage = Math.min(Math.max(Number(url.searchParams.get('per_page') ?? 50), 10), 100);
  const vsCurrency = url.searchParams.get('vs_currency') ?? 'usd';

  try {
    const snapshot = await fetchMarketSnapshot({ perPage, vsCurrency });
    return Response.json(snapshot, { headers: { 'Cache-Control': 's-maxage=30, stale-while-revalidate=60' } });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 502 });
  }
}
