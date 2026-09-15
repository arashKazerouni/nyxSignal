# NyxSignal

NyxSignal is a crypto market-intelligence system designed to turn AI-assisted market research into structured, testable trading signals.

## Core idea

- **Gemini** acts as the market research and strategy layer.
- **NyxSignal** consumes structured market-analysis JSON.
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

The initial repository contains the project contract, machine-readable schema, and an example market-analysis snapshot. Live application infrastructure, Vercel deployment, Supabase persistence, exchange APIs, and automated execution are intentionally deferred until the core contract is stable.
