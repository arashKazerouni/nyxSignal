const DEFAULT_BASE_URL = 'https://api.coingecko.com/api/v3';

function asNumber(value) {
  return value === null || value === undefined ? null : Number(value);
}

function normalizeMarket(market) {
  return {
    id: market.id,
    symbol: market.symbol,
    name: market.name,
    price: asNumber(market.current_price),
    marketCap: asNumber(market.market_cap),
    marketCapRank: asNumber(market.market_cap_rank),
    volume24h: asNumber(market.total_volume),
    priceChange24hPercent: asNumber(market.price_change_percentage_24h),
    high24h: asNumber(market.high_24h),
    low24h: asNumber(market.low_24h),
    circulatingSupply: asNumber(market.circulating_supply),
    totalSupply: asNumber(market.total_supply),
    lastUpdated: market.last_updated ?? null,
  };
}

export async function fetchMarketSnapshot({
  vsCurrency = 'usd',
  perPage = 50,
  page = 1,
  baseUrl = DEFAULT_BASE_URL,
  fetchImpl = globalThis.fetch,
} = {}) {
  if (typeof fetchImpl !== 'function') {
    throw new Error('A fetch implementation is required');
  }

  const url = new URL(`${baseUrl}/coins/markets`);
  url.searchParams.set('vs_currency', vsCurrency);
  url.searchParams.set('order', 'market_cap_desc');
  url.searchParams.set('per_page', String(perPage));
  url.searchParams.set('page', String(page));
  url.searchParams.set('sparkline', 'false');

  const response = await fetchImpl(url);
  if (!response.ok) {
    throw new Error(`CoinGecko request failed with HTTP ${response.status}`);
  }

  const markets = await response.json();
  if (!Array.isArray(markets)) {
    throw new Error('CoinGecko response must be an array');
  }

  return {
    source: 'coingecko',
    fetchedAt: new Date().toISOString(),
    vsCurrency,
    markets: markets.map(normalizeMarket),
  };
}

export { normalizeMarket };
