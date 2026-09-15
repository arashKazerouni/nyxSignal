import test from 'node:test';
import assert from 'node:assert/strict';
import { fetchMarketSnapshot, normalizeMarket } from './coingecko.mjs';

const sampleMarket = {
  id: 'bitcoin',
  symbol: 'btc',
  name: 'Bitcoin',
  current_price: 75000,
  market_cap: 1_480_000_000_000,
  market_cap_rank: 1,
  total_volume: 32_000_000_000,
  price_change_percentage_24h: 2.5,
  high_24h: 76000,
  low_24h: 73000,
  circulating_supply: 19_000_000,
  total_supply: 21_000_000,
  last_updated: '2026-09-15T15:00:00.000Z',
};

test('normalizeMarket maps CoinGecko fields into NyxSignal market data', () => {
  const market = normalizeMarket(sampleMarket);

  assert.deepEqual(market, {
    id: 'bitcoin',
    symbol: 'btc',
    name: 'Bitcoin',
    price: 75000,
    marketCap: 1_480_000_000_000,
    marketCapRank: 1,
    volume24h: 32_000_000_000,
    priceChange24hPercent: 2.5,
    high24h: 76000,
    low24h: 73000,
    circulatingSupply: 19_000_000,
    totalSupply: 21_000_000,
    lastUpdated: '2026-09-15T15:00:00.000Z',
  });
});

test('fetchMarketSnapshot requests the intended CoinGecko market endpoint', async () => {
  let requestedUrl;

  const snapshot = await fetchMarketSnapshot({
    vsCurrency: 'usd',
    perPage: 10,
    page: 2,
    baseUrl: 'https://example.test/api/v3',
    fetchImpl: async (url) => {
      requestedUrl = url;
      return {
        ok: true,
        json: async () => [sampleMarket],
      };
    },
  });

  assert.equal(requestedUrl.pathname, '/api/v3/coins/markets');
  assert.equal(requestedUrl.searchParams.get('vs_currency'), 'usd');
  assert.equal(requestedUrl.searchParams.get('order'), 'market_cap_desc');
  assert.equal(requestedUrl.searchParams.get('per_page'), '10');
  assert.equal(requestedUrl.searchParams.get('page'), '2');
  assert.equal(requestedUrl.searchParams.get('sparkline'), 'false');
  assert.equal(snapshot.source, 'coingecko');
  assert.equal(snapshot.markets.length, 1);
  assert.equal(snapshot.markets[0].symbol, 'btc');
});

test('fetchMarketSnapshot surfaces provider HTTP failures', async () => {
  await assert.rejects(
    fetchMarketSnapshot({
      baseUrl: 'https://example.test/api/v3',
      fetchImpl: async () => ({ ok: false, status: 429 }),
    }),
    /CoinGecko request failed with HTTP 429/,
  );
});

test('fetchMarketSnapshot rejects malformed provider payloads', async () => {
  await assert.rejects(
    fetchMarketSnapshot({
      baseUrl: 'https://example.test/api/v3',
      fetchImpl: async () => ({ ok: true, json: async () => ({ markets: [] }) }),
    }),
    /CoinGecko response must be an array/,
  );
});
