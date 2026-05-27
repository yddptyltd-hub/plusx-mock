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

## v1.2 — Historical snapshots via CF Worker + KV

Goal: after 7+ days of running, the mock can show REAL "vs last 7 days" deltas + sparklines.

### Architecture

```
[CF Cron, every 30 min] → [Worker /scheduled] → fetch SearchLPXs → KV.put(snap:<ts>)
                                                                  → KV.put(latest)

[Mock site / page load] → [Worker /api/latest]   → KV.get(latest)
                       → [Worker /api/history?days=7] → KV.list(prefix=snap:) → filter recent → return array
```

### File layout

- `worker/index.ts` — Worker entrypoint (scheduled + fetch handlers)
- `wrangler.toml` — config: cron trigger, KV bindings (SNAPSHOTS, LATEST)
- `src/lib/history.ts` — client-side wrapper around /api/history endpoint
- `src/components/Sparkline.tsx` — accepts the historical data shape and renders the real sparkline

### KV retention

- `snap:<unix_ms>` keys: 60-day TTL (covers 30d sparkline + headroom)
- `latest` key: no TTL, overwritten each cron

### Worker triggers

```toml
[triggers]
crons = ["*/30 * * * *"]   # every 30 minutes
```

### Cost model

- Cron triggers: free tier 100k/day, we use 48/day
- KV reads: free tier 100k/day, we use ~5-10k/day
- KV writes: free tier 1k/day, we use 48/day
- Worker requests: free tier 100k/day, we use likely <5k/day
- **Total: $0/month**

### Approved by Yahya 2026-05-27

After v1.1 client-side live API integration lands.
