import test from 'node:test';
import assert from 'node:assert/strict';
import { allocateCapital, rankMarketCandidates } from './score-opportunities.mjs';

const snapshot = {
  source: 'test',
  fetchedAt: '2026-09-15T15:00:00.000Z',
  markets: [
    {
      id: 'bitcoin', symbol: 'btc', name: 'Bitcoin', price: 76000,
      marketCap: 1_500_000_000_000, volume24h: 30_000_000_000,
      priceChange24hPercent: 2.4,
    },
    {
      id: 'thin-token', symbol: 'thin', name: 'Thin Token', price: 1,
      marketCap: 20_000_000, volume24h: 50_000,
      priceChange24hPercent: 30,
    },
    {
      id: 'ether', symbol: 'eth', name: 'Ethereum', price: 2500,
      marketCap: 300_000_000_000, volume24h: 15_000_000_000,
      priceChange24hPercent: -1.5,
    },
  ],
};

test('ranks liquid candidates and filters thin markets', () => {
  const result = rankMarketCandidates(snapshot, { capital: 1000, horizon: 'short-term' });
  assert.equal(result.status, 'CANDIDATES_AVAILABLE');
  assert.equal(result.horizon, 'short_term');
  assert.ok(result.candidates.every((candidate) => candidate.symbol !== 'THIN'));
  assert.equal(result.candidates[0].symbol, 'BTC');
  assert.equal(result.candidates[0].recommendedAmount >= 0, true);
});

test('returns NO_TRADE when every market fails filters', () => {
  const result = rankMarketCandidates({ source: 'test', markets: snapshot.markets.slice(1, 2) });
  assert.equal(result.status, 'NO_TRADE');
  assert.match(result.noTradeReason, /filters/);
});

test('allocates capital while preserving the reserve', () => {
  const candidates = [
    { symbol: 'BTC', recommendedAllocationPercent: 20 },
    { symbol: 'ETH', recommendedAllocationPercent: 20 },
  ];
  const result = allocateCapital(candidates, 1000, { reservePercent: 60, maxPositionPercent: 10 });
  assert.deepEqual(result.map((item) => item.allocationPercent), [10, 10]);
  assert.equal(result.reduce((sum, item) => sum + item.allocationAmount, 0), 200);
});

test('rejects invalid capital input', () => {
  assert.throws(() => allocateCapital([], -1), /non-negative/);
});
