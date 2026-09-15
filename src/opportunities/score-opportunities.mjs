const DEFAULTS = {
  minVolume24h: 10_000_000,
  maxCandidates: 10,
  maxAllocationPercent: 20,
  minRiskReward: 1.5,
};

const HORIZON_RANK = {
  scalping: 1,
  short_term: 2,
  swing: 3,
  medium_term: 4,
  long_term: 5,
};

function finite(value) {
  return Number.isFinite(Number(value)) ? Number(value) : null;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function normalizeHorizon(value) {
  return String(value ?? 'short_term').toLowerCase().replaceAll('-', '_').replaceAll(' ', '_');
}

function scoreMarket(market, options) {
  const price = finite(market.price);
  const volume = finite(market.volume24h);
  const marketCap = finite(market.marketCap);
  const change = finite(market.priceChange24hPercent);

  if (price === null || price <= 0) return { eligible: false, reason: 'INVALID_PRICE' };
  if (volume === null || volume < options.minVolume24h) return { eligible: false, reason: 'LOW_LIQUIDITY' };
  if (marketCap === null || marketCap <= 0) return { eligible: false, reason: 'INVALID_MARKET_CAP' };
  if (change === null) return { eligible: false, reason: 'MISSING_MOMENTUM' };

  const liquidityScore = clamp(Math.log10(volume) * 10 - 60, 0, 25);
  const momentumScore = clamp(12.5 + change * 1.5, 0, 25);
  const sizeScore = clamp(25 - Math.max(0, Math.log10(marketCap) - 9) * 3, 0, 25);
  const activityScore = clamp(Math.abs(change) * 1.2, 0, 25);
  const score = Number((liquidityScore + momentumScore + sizeScore + activityScore).toFixed(2));

  return {
    eligible: true,
    score,
    components: {
      liquidity: Number(liquidityScore.toFixed(2)),
      momentum: Number(momentumScore.toFixed(2)),
      marketSize: Number(sizeScore.toFixed(2)),
      activity: Number(activityScore.toFixed(2)),
    },
  };
}

function allocationFor(score, riskReward, capital, options) {
  if (score < 55 || riskReward < options.minRiskReward) return 0;
  const quality = clamp((score - 55) / 45, 0, 1);
  const rrFactor = clamp((riskReward - 1.5) / 2.5, 0, 1);
  const allocation = clamp(2 + quality * 8 + rrFactor * 5, 0, options.maxAllocationPercent);
  return capital === null ? Number(allocation.toFixed(2)) : Number((capital * allocation / 100).toFixed(2));
}

export function rankMarketCandidates(snapshot, { capital = null, horizon = 'short_term', ...overrides } = {}) {
  if (!snapshot || !Array.isArray(snapshot.markets)) throw new Error('A normalized market snapshot is required');
  const options = { ...DEFAULTS, ...overrides };
  const normalizedHorizon = normalizeHorizon(horizon);
  const candidates = [];

  for (const market of snapshot.markets) {
    const scored = scoreMarket(market, options);
    if (!scored.eligible) continue;

    const change = finite(market.priceChange24hPercent);
    const directionalBias = change >= 0 ? 'MOMENTUM_LONG_CANDIDATE' : 'MEAN_REVERSION_CANDIDATE';
    const riskReward = Number((1.5 + clamp(Math.abs(change) / 10, 0, 2.5)).toFixed(2));
    const recommendedPercent = allocationFor(scored.score, riskReward, null, options);

    candidates.push({
      asset: market.name,
      symbol: market.symbol.toUpperCase(),
      marketId: market.id,
      horizon: normalizedHorizon,
      setup: directionalBias,
      score: scored.score,
      scoreComponents: scored.components,
      price: market.price,
      volume24h: market.volume24h,
      marketCap: market.marketCap,
      priceChange24hPercent: change,
      riskReward,
      recommendedAllocationPercent: recommendedPercent,
      recommendedAmount: capital === null ? null : Number((capital * recommendedPercent / 100).toFixed(2)),
      rationale: change >= 0
        ? 'Positive 24h momentum with sufficient reported liquidity.'
        : 'Negative 24h momentum; candidate requires confirmation before treating weakness as a reversal.',
    });
  }

  candidates.sort((a, b) => b.score - a.score || b.riskReward - a.riskReward);
  const selected = candidates.slice(0, options.maxCandidates);

  return {
    generatedAt: new Date().toISOString(),
    source: snapshot.source ?? 'unknown',
    horizon: normalizedHorizon,
    capital: capital === null ? null : Number(capital),
    candidates: selected,
    status: selected.length > 0 ? 'CANDIDATES_AVAILABLE' : 'NO_TRADE',
    noTradeReason: selected.length > 0 ? null : 'No market passed the liquidity, data-quality, and scoring filters.',
    horizonRank: HORIZON_RANK[normalizedHorizon] ?? null,
  };
}

export function allocateCapital(candidates, capital, { reservePercent = 60, maxPositionPercent = 10 } = {}) {
  if (!Array.isArray(candidates)) throw new Error('Candidates must be an array');
  if (!Number.isFinite(Number(capital)) || Number(capital) < 0) throw new Error('Capital must be a non-negative number');

  const investablePercent = clamp(100 - reservePercent, 0, 100);
  const eligible = candidates.filter((candidate) => candidate.recommendedAllocationPercent > 0);
  const totalRequested = eligible.reduce((sum, candidate) => sum + candidate.recommendedAllocationPercent, 0);
  const scale = totalRequested > investablePercent && totalRequested > 0 ? investablePercent / totalRequested : 1;

  return eligible.map((candidate) => {
    const percent = Number(clamp(candidate.recommendedAllocationPercent * scale, 0, maxPositionPercent).toFixed(2));
    return {
      ...candidate,
      allocationPercent: percent,
      allocationAmount: Number((Number(capital) * percent / 100).toFixed(2)),
    };
  });
}
