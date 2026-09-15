# Opportunity scoring

NyxSignal's first candidate scorer is deliberately deterministic and transparent. It is **not** a probability model and must not be presented as one.

## Boundary

The CoinGecko adapter produces normalized market records. The scorer consumes those records and ranks candidates using:

- reported 24h volume as a coarse liquidity gate
- 24h price change as a simple momentum/activity signal
- market capitalization as a size/liquidity proxy
- a minimum heuristic risk/reward threshold
- a configurable candidate count and capital amount

Provider-specific fields stay outside the scoring module.

## NO_TRADE

The scorer returns `NO_TRADE` when no market survives the data-quality and liquidity filters. A later Gemini analysis may also independently return `NO TRADE` even when candidates exist here.

## Capital presentation

`allocateCapital()` treats the result as a risk-budget presentation, not an order instruction. A configurable reserve remains unallocated and each position is capped. No exchange or wallet execution is performed.

## Probability boundary

The scorer intentionally does not manufacture `P_PROFIT`, `P_FLAT`, or `P_LOSS`. Those probabilities come from the Gemini analysis contract and will later be evaluated against observed outcomes.
