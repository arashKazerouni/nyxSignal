# NyxSignal

NyxSignal is a crypto market-intelligence system designed to turn AI-assisted market research into structured, testable trading signals.

## Core idea

- **Gemini** acts as the market research and strategy layer.
- **NyxSignal** consumes structured market-analysis JSON.
- The ingestion boundary validates both the canonical schema and important semantic invariants.
- The application can combine those predictions with live market data.
- Predictions are measured against later market outcomes.
- The system should optimize for evidence, consistency, and calibration rather than the number of trades it produces.

## Time horizons

- Scalping: minutes to about 1 hour
- Short term: about 1 hour to 24 hours
- Swing: 1 day to 7 days
- Medium term: 1 week to 1 month
- Long term: 1 month to 1 year

## Prediction model

NyxSignal does **not** treat predictions as guarantees. Each opportunity can contain:

- probability of profit
- probability of a flat outcome
- probability of loss
- confidence in the analysis
- risk score and level
- entry zone
- targets
- invalidation price
- expected upside/downside
- risk/reward
- recommended allocation
- evidence and catalysts
- a unique `prediction_id`

The key distinction is that **confidence in an analysis is not the same thing as probability of profit**.

## Validation boundary

The current Node.js contract layer validates Gemini payloads against `docs/gemini-output-schema.json` and additionally checks:

- unique prediction IDs
- probability distributions summing to 1.0 within tolerance
- correctly ordered entry zones
- recommended allocation not exceeding maximum exposure

The canonical fixture can be checked with `npm run validate:example`, and regression tests run with `npm test`.

## Long-term objective

Build a prediction → outcome → measurement loop that can evaluate:

- prediction accuracy
- probability calibration
- win rate
- false positives and false negatives
- performance by timeframe
- performance by strategy
- performance by asset
- performance by market regime

A valid result can be **NO TRADE**. NyxSignal must never manufacture an opportunity simply because the user wants one.

## Current scope

The repository currently contains the project contract, machine-readable schema, representative market-analysis snapshot, and the first validation/CI boundary. Live market-data integration, web UI, Vercel deployment, Supabase persistence, exchange APIs, and automated execution remain separate future subsystems.
