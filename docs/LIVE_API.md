# Live API integration (for v1.1)

The PlusX LPX backend exposes 3 JSON endpoints under `lpx.plusx.app/watcher/*`. All allow CORS (`access-control-allow-origin: *`), no auth required. The mock can fetch them directly from the browser — no proxy needed.

## Endpoints

### 1. POST `https://lpx.plusx.app/watcher/LPXWatcher/SearchLPXs`

Returns the full pool list with all metrics.

**Request body**:
```json
{
  "request": {
    "skip": 0,
    "take": 15,
    "sid": "",
    "forWalletAdr": "",
    "forToken": "",
    "isFilterPorfolio": false,
    "isFilterManager": false,
    "isFilterOnlySolo": false
  }
}
```

**Response**: array of pool objects. Each pool has:
- `poolId`, `poolType` (1=Managed?), `isSolo`, `isClosed`
- `managerAddress`, `liquidityProvidersCount`
- `fundToken` / `anchorToken` (name, symbol, erc20Address, decimals)
- `reserves`: `{ fundRaw, fundImgRaw, anchorRaw, anchorImgRaw }` (wei strings)
- `feeIndex`, `ntzIndex`, `profitIndex`, `managerRewardIndex` (floats)
- `aprAllTime` (= "APR Since Inception"), `apr30d` (= displayed 30D APR)
- `liquidityFlow24h`, `liquidityFlow7d`

### 2. GET `https://lpx.plusx.app/watcher/DEXWatcher/GetCandles?baseTokenAddress=<fund>&quoteTokenAddress=<anchor>&interval=15m&count=900`

Returns OHLC candlestick data for a pair.

**Response**: array of candles `{ openTS, closeTS, open, high, low, close, idxBuyPer100Usd }`.

### 3. GET `https://lpx.plusx.app/watcher/LPXWatcher/GetSwaps?poolId=<n>&take=1000&beforeTimestamp=0&direction=0`

Returns swap history for a pool.

**Response**: array of swaps `{ poolId, timestamp, direction, fundDeltaRaw, anchorDeltaRaw }`.

## What's still mocked even with live API

- The top 3 KPI cards (Total TVL / Total Pool Volume / Total Throughput) — the live site does not have these. Either compute aggregates from the SearchLPXs response, OR drop the cards.
- "vs last 7 days" percentage deltas — no time-series available unless we capture and store our own.
- `Impermanent Loss -2.45% vs HODL` — requires historical entry-price tracking, not in the API.
- Token icons — the API returns symbol/name/address but not icon URLs. Map symbols to icon URLs ourselves (or use a chain-icon library).

## v1.1 implementation plan

1. Create `src/lib/livePools.ts` with `fetchLivePools()`, `fetchCandles(fund, anchor)`, `fetchSwaps(poolId)`.
2. Add a SWR/React Query layer with 60s stale-time, 5min cache-time.
3. Replace `data.poolsData` usage in pages with the SWR hook. Keep static JSON as fallback for SSR / first paint.
4. Surface a small "Last updated: HH:MM" badge near the table header so it's clear the data is live.
