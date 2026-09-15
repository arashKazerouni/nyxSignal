# NyxSignal

NyxSignal is a crypto market-intelligence system designed to turn AI-assisted market research into structured, testable trading signals.

## Core idea

- **Gemini** acts as the market research and strategy layer.
- **NyxSignal** consumes structured market-analysis JSON.
- The ingestion boundary validates the canonical schema and semantic invariants.
- A normalized CoinGecko adapter supplies live market data.
- A deterministic scorer filters and ranks candidates without pretending to predict probabilities.
- Research predictions can be resolved later as profit, flat, or loss.
- The system measures calibration rather than optimizing for the number of trades.

## MVP

The current MVP is a Next.js dashboard with:

- live CoinGecko market radar
- capital and timeframe controls
- transparent liquidity/data-quality candidate scoring
- reserve-first capital presentation
- the initial structured Gemini research snapshot
- visible profit/flat/loss probabilities and confidence
- browser-local prediction outcome tracking
- multiclass Brier score and accuracy
- no automated wallet or exchange execution

The deployed MVP can use CoinGecko's public low-volume API path for initial testing. A production/high-frequency data plan and additional providers should be added only when the product requirements justify them.

## Time horizons

- Scalping: minutes to about 1 hour
- Short term: about 1 hour to 24 hours
- Swing: 1 day to 7 days
- Medium term: 1 week to 1 month
- Long term: 1 month to 1 year

## Prediction model

NyxSignal does **not** treat predictions as guarantees. Each opportunity can contain probability of profit, flat, and loss; confidence; risk; entry/targets/invalidation; expected upside/downside; risk/reward; allocation; evidence; catalysts; and a unique `prediction_id`.

The key distinction is that **confidence in an analysis is not the same thing as probability of profit**.

## Validation boundary

The Node.js contract layer validates Gemini payloads against `docs/gemini-output-schema.json` and checks unique prediction IDs, probability sums, entry-zone ordering, and allocation limits.

Run locally with:

```bash
npm install
npm test
npm run validate:example
npm run build
npm run dev
```

## Measurement objective

The long-term product loop is:

**research → prediction → outcome → calibration → improved research**

NyxSignal should measure prediction accuracy, probability calibration, false positives/negatives, performance by timeframe/strategy/asset/regime, and when appropriate expected return after costs.

A valid result can be **NO TRADE**. NyxSignal must never manufacture an opportunity simply because the user wants one.

## Architecture boundaries

The repository intentionally keeps exchange execution, wallet integration, high-frequency feeds, and durable multi-user storage outside the MVP. Browser-local outcome tracking demonstrates the measurement loop first; a server-side database should be introduced when multi-user persistence and historical analytics are actually required.
