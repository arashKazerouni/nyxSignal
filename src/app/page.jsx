'use client';

import { useEffect, useMemo, useState } from 'react';
import { allocateCapital, rankMarketCandidates } from '../opportunities/score-opportunities.mjs';

const horizons = [
  ['scalping', 'Scalp'],
  ['short_term', 'Short-term'],
  ['swing', 'Swing'],
  ['medium_term', 'Medium-term'],
  ['long_term', 'Long-term'],
];

function pct(value) {
  return value == null ? '—' : `${Number(value).toFixed(1)}%`;
}

function money(value) {
  return value == null ? '—' : `$${Number(value).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

export default function Home() {
  const [market, setMarket] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [capital, setCapital] = useState(1000);
  const [horizon, setHorizon] = useState('short_term');
  const [error, setError] = useState('');
  const [lastRefresh, setLastRefresh] = useState(null);

  async function refresh() {
    setError('');
    try {
      const [marketResponse, analysisResponse] = await Promise.all([
        fetch('/api/market?per_page=50', { cache: 'no-store' }),
        fetch('/api/analysis', { cache: 'no-store' }),
      ]);
      const marketData = await marketResponse.json();
      const analysisData = await analysisResponse.json();
      if (!marketResponse.ok) throw new Error(marketData.error ?? 'Market data unavailable');
      setMarket(marketData);
      setAnalysis(analysisData);
      setLastRefresh(new Date());
    } catch (refreshError) {
      setError(refreshError.message);
    }
  }

  useEffect(() => { refresh(); }, []);

  const ranked = useMemo(() => {
    if (!market) return null;
    return rankMarketCandidates(market, { capital: Number(capital) || 0, horizon });
  }, [market, capital, horizon]);

  const allocations = useMemo(() => (
    ranked ? allocateCapital(ranked.candidates, Number(capital) || 0) : []
  ), [ranked, capital]);

  const research = analysis?.opportunities ?? [];

  return (
    <main className="shell">
      <header className="topbar">
        <div>
          <div className="eyebrow">NYXSIGNAL / MARKET INTELLIGENCE</div>
          <h1>See the market. Measure the signal.</h1>
          <p className="lede">A research-first radar combining live market data, structured Gemini analysis, risk-aware allocation, and prediction tracking.</p>
        </div>
        <button className="refresh" onClick={refresh}>Refresh market</button>
      </header>

      {error && <div className="error">Market feed unavailable: {error}</div>}

      <section className="control-grid">
        <label>Capital
          <input type="number" min="0" step="50" value={capital} onChange={(event) => setCapital(event.target.value)} />
        </label>
        <label>Horizon
          <select value={horizon} onChange={(event) => setHorizon(event.target.value)}>
            {horizons.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        <div className="status-card">
          <span>Market feed</span>
          <strong>{market ? 'LIVE' : 'CONNECTING'}</strong>
          <small>{lastRefresh ? lastRefresh.toLocaleTimeString() : '—'}</small>
        </div>
        <div className="status-card">
          <span>Research layer</span>
          <strong>{analysis ? analysis.market_regime?.primary ?? 'READY' : 'LOADING'}</strong>
          <small>Probability estimates come from research, not the heuristic scorer.</small>
        </div>
      </section>

      <section className="section-head">
        <div>
          <div className="eyebrow">RADAR</div>
          <h2>Candidate opportunities</h2>
        </div>
        <span className={`badge ${ranked?.status === 'NO_TRADE' ? 'muted' : ''}`}>{ranked?.status ?? 'WAITING'}</span>
      </section>

      <section className="cards">
        {ranked?.candidates?.length ? ranked.candidates.map((candidate) => (
          <article className="card" key={candidate.marketId}>
            <div className="card-top">
              <div><strong>{candidate.symbol}</strong><span>{candidate.asset}</span></div>
              <div className="score">{candidate.score}<small>/100</small></div>
            </div>
            <div className="price">{money(candidate.price)}</div>
            <div className={candidate.priceChange24hPercent >= 0 ? 'positive change' : 'negative change'}>
              {candidate.priceChange24hPercent >= 0 ? '+' : ''}{pct(candidate.priceChange24hPercent)} 24h
            </div>
            <div className="metrics">
              <span>Volume<strong>{money(candidate.volume24h)}</strong></span>
              <span>R/R<strong>{candidate.riskReward}x</strong></span>
              <span>Suggested<strong>{candidate.recommendedAllocationPercent}%</strong></span>
            </div>
          </article>
        )) : <div className="empty">{ranked?.noTradeReason ?? 'Waiting for live market data.'}</div>}
      </section>

      <section className="section-head">
        <div>
          <div className="eyebrow">RESEARCH</div>
          <h2>Gemini snapshot</h2>
        </div>
        {analysis?.market_summary?.market_sentiment && <span className="badge">{analysis.market_summary.market_sentiment}</span>}
      </section>

      <section className="research-grid">
        {research.map((item) => (
          <article className="research-card" key={item.prediction_id}>
            <div className="research-top"><strong>{item.symbol}</strong><span>{item.timeframe}</span></div>
            <p>{item.setup}</p>
            <div className="probability-row">
              <span>Profit <b>{pct(item.probabilities?.profit * 100)}</b></span>
              <span>Flat <b>{pct(item.probabilities?.flat * 100)}</b></span>
              <span>Loss <b>{pct(item.probabilities?.loss * 100)}</b></span>
            </div>
            <div className="research-meta">Confidence {item.confidence}/100 · Risk {item.risk?.level ?? '—'} · R/R {item.risk_reward_ratio ?? '—'}x</div>
          </article>
        ))}
      </section>

      <section className="allocation">
        <div>
          <div className="eyebrow">RISK BUDGET</div>
          <h2>Capital presentation</h2>
          <p>Reserve-first sizing. These numbers are research output, not trade execution instructions.</p>
        </div>
        <div className="allocation-list">
          {allocations.length ? allocations.map((item) => (
            <div className="allocation-row" key={item.marketId}>
              <strong>{item.symbol}</strong><span>{item.allocationPercent}%</span><b>{money(item.allocationAmount)}</b>
            </div>
          )) : <span className="muted-text">No allocation recommended.</span>}
        </div>
      </section>

      <footer>
        NyxSignal MVP · heuristic candidate scoring is separate from Gemini probability estimates · no automated execution
      </footer>
    </main>
  );
}
