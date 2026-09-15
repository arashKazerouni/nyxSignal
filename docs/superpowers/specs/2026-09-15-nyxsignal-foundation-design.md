# NyxSignal Foundation Design

**Date:** 2026-09-15
**Status:** Approved for specification review

## Goal

Establish the foundational architecture and data contract for NyxSignal, a crypto-market intelligence application that consumes Gemini market research, presents structured trading opportunities, and records predictions so their accuracy can be measured over time.

## Product Principles

1. **Probabilities are estimates, not promises.** NyxSignal must never present a model probability as a guarantee of profit.
2. **Accuracy over activity.** The system may return `NO_HIGH_QUALITY_OPPORTUNITY` rather than manufacture a trade.
3. **Honesty over apparent precision.** Missing or stale market data must be represented as unavailable rather than fabricated.
4. **Prediction accountability from day one.** Every actionable prediction receives a unique ID and enough immutable context to evaluate its eventual outcome.
5. **Separate confidence from probability.** Probability describes the estimated outcome distribution; confidence describes the quality of the analysis and evidence supporting that estimate.
6. **Capital-aware, never capital-forcing.** User capital can influence suggested allocation, but NyxSignal must not require a trade or concentrate the entire portfolio into one opportunity.

## System Boundary

NyxSignal V1 is split into two conceptual layers:

- **Gemini Research Engine:** researches current crypto-market conditions and produces a stable, machine-readable market-analysis payload.
- **NyxSignal Application:** validates and consumes that payload, presents opportunities and risk information, accepts user capital and horizon preferences, and stores prediction records for later outcome evaluation.

Vercel and Supabase are intentionally deferred. The first milestone establishes the contract, documentation, and example data without introducing deployment or persistence infrastructure prematurely.

## Gemini → NyxSignal Contract

The canonical analysis payload contains:

- `analysis_timestamp`
- `market_regime`
- `market_summary`
- `strategies`
- `opportunities`
- `top_opportunities`
- `no_trade_conditions`

Each opportunity contains:

- `prediction_id`
- asset identity and trading pair
- timeframe and strategy
- current price
- entry zone
- targets
- invalidation price
- expected upside/downside
- risk/reward ratio
- probability distribution: `profit`, `flat`, `loss`
- analysis confidence
- risk score/level and main risks
- suggested allocation and maximum exposure
- evidence
- catalysts
- invalidation reasons

The probability values represent:

- **P_PROFIT:** probability that the intended target is reached before invalidation.
- **P_FLAT:** probability that neither major outcome occurs within the relevant horizon.
- **P_LOSS:** probability that invalidation is reached before the target.

The three probabilities should approximately sum to 1.0. They are not equivalent to expected return after fees, slippage, taxes, or execution constraints; that distinction must remain explicit in later implementation.

## Supported Horizons

NyxSignal recognizes five planning horizons:

- `scalping`: less than 1 hour
- `short_term`: 1 hour to 24 hours
- `swing`: 1 day to 7 days
- `medium_term`: 1 week to 1 month
- `long_term`: 1 month to 1 year

The application should preserve the horizon supplied by the research engine rather than silently changing it.

## Prediction Tracking

Prediction records are conceptually immutable snapshots. A prediction should retain its original:

- prediction ID
- timestamp
- asset and pair
- horizon
- entry zone
- target(s)
- invalidation
- probability distribution
- confidence
- risk information
- allocation recommendation
- evidence/catalysts

Later outcome records will evaluate whether the predicted target, flat condition, or invalidation occurred within the defined horizon. This enables future measurement of:

- win rate
- loss rate
- calibration
- probability accuracy
- performance by strategy
- performance by asset
- performance by horizon
- false-positive/no-trade quality

Outcome evaluation must avoid look-ahead bias and must use only information available at the prediction timestamp when assessing the original prediction.

## Market and Strategy Model

The research engine may classify the market using:

- `BULLISH`
- `BEARISH`
- `SIDEWAYS`
- `HIGH_VOLATILITY`
- `LOW_VOLATILITY`
- `TRANSITIONING`

Strategy selection can include momentum, trend following, breakout, pullback, mean reversion, support/resistance, volatility expansion/contraction, relative strength, catalyst-driven, and market-neutral approaches.

The model should consider multiple independent signals, including price/volume/liquidity, market structure, derivatives data where available, sentiment, news/catalysts, macro conditions, and relevant asset-specific events. Low liquidity, manipulation risk, poor risk/reward, conflicting evidence, stale data, and major uncertainty should reduce confidence or cause the opportunity to be rejected.

## Capital and Allocation

The user may provide available capital. NyxSignal will use that value to translate a percentage recommendation into an amount while retaining a maximum exposure limit.

Allocation logic should consider:

- estimated probability distribution
- risk score
- volatility
- liquidity and expected slippage
- risk/reward
- correlation with other positions
- user-selected horizon

No recommendation may imply that 100% of capital should automatically be deployed. When capital is not supplied, percentage allocation can still be provided.

## No-Trade Behavior

No-trade states are first-class results. Examples include:

- insufficient evidence
- conflicting signals
- poor liquidity
- excessive spread/slippage
- macro event risk
- broken market structure
- probabilities that do not justify the risk

The UI and data model must be able to represent an empty opportunity set without treating it as an error.

## Initial Repository Structure

```text
nyxSignal/
├── README.md
├── docs/
│   ├── architecture.md
│   ├── gemini-output-schema.json
│   └── superpowers/
│       └── specs/
│           └── 2026-09-15-nyxsignal-foundation-design.md
└── data/
    └── examples/
        └── 2026-09-15-market-analysis.json
```

The initial implementation should remain intentionally small. It should document and validate the contract before introducing a web framework, database, authentication, exchange execution, or automated trading.

## Example Market Snapshot

The first example payload will use the 2026-09-15 Gemini analysis supplied during design: a transitioning/bearish-pullback market with BTC around the $75.5k-$76.2k support shelf, ETH showing relative strength, and ETH/BTC/SOL opportunity records. The example is illustrative historical research data and must not be represented as a live recommendation.

## Future Expansion Boundaries

The following are explicitly outside this foundation milestone:

- live exchange execution
- automated trading
- wallet custody
- Vercel deployment
- Supabase persistence
- authentication
- real-time websocket market feeds
- backtesting engine
- automated probability calibration

These can be added as separate subsystems once the contract and prediction lifecycle are stable.

## Acceptance Criteria

The foundation is successful when:

1. A new engineer can understand NyxSignal's architecture from the repository documentation.
2. Gemini has one canonical JSON contract that NyxSignal can validate against.
3. The supplied 2026-09-15 analysis exists as a representative machine-readable fixture.
4. Prediction IDs and probability semantics are unambiguous.
5. No-trade behavior is explicitly supported.
6. The design leaves a clean path to persistent prediction/outcome tracking without coupling the foundation to Supabase.
