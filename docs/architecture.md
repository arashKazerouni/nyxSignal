# NyxSignal Architecture

## Purpose

NyxSignal is a research-driven crypto market intelligence application. Its first architectural goal is to create a stable boundary between external AI market research and future quantitative/live-market components.

## System boundary

```text
Gemini
  │
  │ structured market-analysis JSON
  ▼
NyxSignal ingestion / validation
  │
  ├── prediction records
  ├── live market data (future)
  ├── opportunity scoring (future)
  └── outcome tracking (future)
  │
  ▼
Dashboard / decision support (future)
```

Gemini is the research layer, not the final authority. NyxSignal must preserve the original prediction data so later outcomes can be compared against it.

## Prediction contract

Each prediction should have a stable `prediction_id` and timestamp. An opportunity should capture its timeframe, entry zone, targets, invalidation, outcome probabilities, confidence, risk, allocation guidance, evidence, catalysts, and invalidation reasons.

The three primary outcome probabilities are:

- `profit`: probability that the primary target is reached before invalidation
- `flat`: probability that neither major outcome occurs within the intended timeframe
- `loss`: probability that invalidation is reached before the primary target

These values should sum to approximately 1.0 when supplied.

## Probability vs confidence

`probabilities.profit` estimates an outcome. `confidence` measures confidence in the quality of the analysis and available evidence. They must remain separate fields and must not be conflated.

## Capital allocation

Allocation is decision support, not a guarantee. The future application should consider risk, volatility, liquidity, correlation, and risk/reward before presenting a position size. It must allow a no-trade result.

## Outcome measurement

The eventual system should preserve enough information to compare each prediction with actual market data. This enables calibration and strategy evaluation rather than relying on headline win rates alone.

## Deferred infrastructure

### Supabase

Add when persistent prediction/outcome storage is required. The initial contract must remain storage-provider agnostic.

### Vercel

Add when the web application exists and has a deployable runtime. Deployment should not be coupled to the initial research-data contract.

### Exchange / market-data APIs

Add after the prediction schema is validated. Live prices are required for real-time monitoring, but they should not redefine the research contract.

### Automated trading

Out of initial scope. NyxSignal is decision-support software first; execution can be considered only after prediction quality, risk controls, and observability are established.
