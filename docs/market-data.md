# NyxSignal Market Data Layer

## First provider: CoinGecko

NyxSignal currently uses CoinGecko's public REST API as its first market-data adapter. The initial endpoint is `/coins/markets`, ordered by market capitalization.

The adapter is deliberately isolated behind `fetchMarketSnapshot()` so the analysis layer does not depend directly on a provider response shape.

## Normalized market record

Each asset is normalized into:

- `id`
- `symbol`
- `name`
- `price`
- `marketCap`
- `marketCapRank`
- `volume24h`
- `priceChange24hPercent`
- `high24h`
- `low24h`
- `circulatingSupply`
- `totalSupply`
- `lastUpdated`

A snapshot also records `source`, `fetchedAt`, and `vsCurrency`.

## Reliability rules

- Provider HTTP failures are surfaced rather than silently converted into empty data.
- Malformed provider payloads are rejected.
- Provider-specific fields stay inside the adapter.
- Tests use an injected fetch implementation, so provider behavior can be tested without network access.
- The keyless public API is appropriate for the first low-volume integration; production/high-frequency usage may require a paid or WebSocket data source.

## Deferred data sources

Coinbase Advanced Trade/WebSocket and additional on-chain or derivatives providers can be added later behind the same normalized boundary when NyxSignal needs order-book, trade-stream, funding, open-interest, liquidation, or DEX liquidity data.
