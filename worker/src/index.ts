import { buildPriceGraph } from "./priceGraph";
import { ingestChatter, getChatter } from "./chatter";
import { runVolatilitySnapshot, computeZScoreBaselines, handleVolatilityRoutes } from "./volatility";
import { ingestPulsechainChatter, handlePulsechainChatter } from "./chatterPulsechain";
import { ingestPulse, handlePulse } from "./pulsePosts";
import { handleXMentions } from "./xMentions";
import { handlePulseNews, refreshPulseNews } from "./pulseNews";

export interface Env {
  SNAPSHOTS: KVNamespace;
}

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Cache-Control": "public, max-age=60",
  "Content-Type": "application/json",
};

interface Pool {
  poolId: number;
  fundToken: { erc20Address: string };
  anchorToken: { erc20Address: string };
  reserves: { fundRaw: string; anchorRaw: string };
  apr30d: number;
  aprAllTime: number;
  liquidityProvidersCount: number;
  liquidityProvidersAllTimeCount: number;
}

interface Candle {
  openTS: number;
  closeTS: number;
  open: number;
  high: number;
  low: number;
  close: number;
  idxBuyPer100Usd: number;
}

// Snapshot shape stored in KV — swap fields populated from GetCandles where GetSwaps is unavailable
export interface Snapshot {
  poolId: number;
  ts: number;
  fundReserveRaw: string;
  anchorReserveRaw: string;
  apr30d: number;
  aprAllTime: number;
  liquidityProvidersCount: number;
  liquidityProvidersAllTimeCount: number;
  // Activity fields: from the most recent 15m candle
  candleOpen: number;
  candleClose: number;
  candleHigh: number;
  candleLow: number;
  idxBuyPer100Usd: number;
  // Legacy swap fields (zeroed — GetSwaps endpoint returns 404 on this API)
  swapCount15min: number;
  swapVolumeFundRaw: string;
  swapVolumeAnchorRaw: string;
  uniqueWallets15min: number;
  biggestSwap: null;
}

const SEARCH_URL = "https://lpx.plusx.app/watcher/LPXWatcher/SearchLPXs";
const SEARCH_BODY = JSON.stringify({
  request: {
    skip: 0,
    take: 100,
    sid: "",
    forWalletAdr: "",
    forToken: "",
    isFilterPorfolio: false,
    isFilterManager: false,
    isFilterOnlySolo: false,
  },
});

async function fetchPools(): Promise<Pool[]> {
  const res = await fetch(SEARCH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: SEARCH_BODY,
  });
  if (!res.ok) throw new Error(`SearchLPXs failed: ${res.status}`);
  const data = await res.json() as unknown;
  return (Array.isArray(data) ? data : []) as Pool[];
}

async function fetchLatestCandle(fund: string, anchor: string): Promise<Candle | null> {
  const url =
    `https://lpx.plusx.app/watcher/DEXWatcher/GetCandles` +
    `?baseTokenAddress=${encodeURIComponent(fund)}` +
    `&quoteTokenAddress=${encodeURIComponent(anchor)}` +
    `&interval=15m&count=1`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json() as unknown;
  const arr = Array.isArray(data) ? data : [];
  return arr.length ? (arr[arr.length - 1] as Candle) : null;
}

async function runSnapshot(env: Env): Promise<void> {
  const now = Math.floor(Date.now() / 1000);
  const tsMinute = Math.floor(now / 900) * 900;

  const pools = await fetchPools();

  await Promise.all(
    pools.map(async (pool) => {
      const candle = await fetchLatestCandle(
        pool.fundToken.erc20Address,
        pool.anchorToken.erc20Address
      );

      const snap: Snapshot = {
        poolId: pool.poolId,
        ts: tsMinute,
        fundReserveRaw: pool.reserves?.fundRaw ?? "0",
        anchorReserveRaw: pool.reserves?.anchorRaw ?? "0",
        apr30d: pool.apr30d ?? 0,
        aprAllTime: pool.aprAllTime ?? 0,
        liquidityProvidersCount: pool.liquidityProvidersCount ?? 0,
        liquidityProvidersAllTimeCount: pool.liquidityProvidersAllTimeCount ?? 0,
        candleOpen: candle?.open ?? 0,
        candleClose: candle?.close ?? 0,
        candleHigh: candle?.high ?? 0,
        candleLow: candle?.low ?? 0,
        idxBuyPer100Usd: candle?.idxBuyPer100Usd ?? 0,
        // GetSwaps endpoint returns 404; keep fields for schema compat with v2
        swapCount15min: 0,
        swapVolumeFundRaw: "0",
        swapVolumeAnchorRaw: "0",
        uniqueWallets15min: 0,
        biggestSwap: null,
      };

      const key = `snap:${pool.poolId}:${tsMinute}`;
      await env.SNAPSHOTS.put(key, JSON.stringify(snap), {
        expirationTtl: 35 * 86400,
      });
    })
  );
}

function rangeSeconds(range: string): number {
  if (range === "7d") return 7 * 86400;
  if (range === "30d") return 30 * 86400;
  return 86400;
}

async function handleFetch(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS });
  }

  if (path === "/api/health") {
    return new Response(
      JSON.stringify({ status: "ok", ts: Math.floor(Date.now() / 1000) }),
      { headers: CORS }
    );
  }

  if (path === "/api/chatter") {
    const symbol = url.searchParams.get("symbol");
    if (!symbol) {
      return new Response(JSON.stringify({ error: "symbol required" }), { status: 400, headers: CORS });
    }
    const data = await getChatter(env, symbol);
    if (!data) {
      return new Response(
        JSON.stringify({ error: "no_chatter_data", symbol }),
        { status: 404, headers: { ...CORS, "Cache-Control": "no-store" } }
      );
    }
    return new Response(JSON.stringify(data), {
      headers: { ...CORS, "Cache-Control": "public, max-age=300" },
    });
  }

  // ── Volatility routes ─────────────────────────────────────────────────────
  if (path.startsWith("/api/volatility/")) {
    const volRes = await handleVolatilityRoutes(request, env, path);
    if (volRes) return volRes;
  }

  if (path === "/api/chatter/pulsechain") {
    return await handlePulsechainChatter(env);
  }

  if (path === "/api/pulse") {
    return await handlePulse(env);
  }

  if (path === "/api/pulse-news") {
    if (url.searchParams.get("refresh") === "1") {
      try {
        const r = await refreshPulseNews(env);
        return new Response(JSON.stringify({ refreshed: r.ingested }), { headers: { ...CORS, "Content-Type": "application/json" } });
      } catch (err) {
        return new Response(JSON.stringify({ error: "refresh_failed", detail: String(err) }), { status: 500, headers: { ...CORS, "Content-Type": "application/json" } });
      }
    }
    return await handlePulseNews(env);
  }

  if (path === "/api/x-mentions") {
    return await handleXMentions(env);
  }

  if (path === "/api/backtest") {
    const poolIdStr = url.searchParams.get("pool");
    const fundParam = url.searchParams.get("fund");
    const anchorParam = url.searchParams.get("anchor");
    const interval = url.searchParams.get("interval") ?? "1h";
    const countStr = url.searchParams.get("count") ?? "168";
    const count = Math.min(Math.max(parseInt(countStr, 10) || 168, 24), 720);
    const ALLOWED_INTERVALS = new Set(["15m", "30m", "1h", "4h", "1d"]);
    if (!ALLOWED_INTERVALS.has(interval)) {
      return new Response(JSON.stringify({ error: "invalid interval" }), { status: 400, headers: CORS });
    }
    let fundAddr: string;
    let anchorAddr: string;
    let poolIdOut: number | null = null;
    if (fundParam && anchorParam) {
      if (!/^0x[a-fA-F0-9]{40}$/.test(fundParam) || !/^0x[a-fA-F0-9]{40}$/.test(anchorParam)) {
        return new Response(JSON.stringify({ error: "invalid token address" }), { status: 400, headers: CORS });
      }
      fundAddr = fundParam;
      anchorAddr = anchorParam;
    } else if (poolIdStr) {
      const pools = await fetchPools();
      const pool = pools.find((p) => String(p.poolId) === poolIdStr);
      if (!pool) {
        return new Response(JSON.stringify({ error: "pool not found" }), { status: 404, headers: CORS });
      }
      fundAddr = pool.fundToken.erc20Address;
      anchorAddr = pool.anchorToken.erc20Address;
      poolIdOut = pool.poolId;
    } else {
      return new Response(JSON.stringify({ error: "must provide pool OR (fund + anchor)" }), { status: 400, headers: CORS });
    }
    const candlesUrl =
      `https://lpx.plusx.app/watcher/DEXWatcher/GetCandles` +
      `?baseTokenAddress=${encodeURIComponent(fundAddr)}` +
      `&quoteTokenAddress=${encodeURIComponent(anchorAddr)}` +
      `&interval=${interval}&count=${count}`;
    const candlesRes = await fetch(candlesUrl);
    if (!candlesRes.ok) {
      return new Response(JSON.stringify({ error: "candles fetch failed", status: candlesRes.status }), { status: 502, headers: CORS });
    }
    const candles = await candlesRes.json() as unknown;
    const arr = Array.isArray(candles) ? candles : [];
    return new Response(
      JSON.stringify({
        poolId: poolIdOut,
        fundAddr,
        anchorAddr,
        interval,
        count: arr.length,
        candles: arr,
      }),
      { headers: { ...CORS, "Cache-Control": "public, max-age=120" } }
    );
  }

  if (path === "/api/price-graph") {
    const value = await env.SNAPSHOTS.get("price_graph:latest");
    if (!value) {
      return new Response(
        JSON.stringify({ error: "price_graph_not_yet_built" }),
        { status: 503, headers: { ...CORS, "Cache-Control": "no-store" } }
      );
    }
    return new Response(value, {
      headers: { ...CORS, "Cache-Control": "public, max-age=300" },
    });
  }

  const latestMatch = path.match(/^\/api\/snapshots\/(\d+)\/latest$/);
  if (latestMatch) {
    const poolId = latestMatch[1];
    const list = await env.SNAPSHOTS.list({ prefix: `snap:${poolId}:` });
    if (!list.keys.length) {
      return new Response(JSON.stringify({ error: "no snapshots" }), { status: 404, headers: CORS });
    }
    const sorted = list.keys.sort((a, b) => a.name.localeCompare(b.name));
    const value = await env.SNAPSHOTS.get(sorted[sorted.length - 1].name);
    return new Response(value ?? "{}", { headers: CORS });
  }

  const rangeMatch = path.match(/^\/api\/snapshots\/(\d+)$/);
  if (rangeMatch) {
    const poolId = rangeMatch[1];
    const range = url.searchParams.get("range") ?? "24h";
    const cutoff = Math.floor(Date.now() / 1000) - rangeSeconds(range);

    const list = await env.SNAPSHOTS.list({ prefix: `snap:${poolId}:` });
    const filtered = list.keys
      .filter((k) => parseInt(k.name.split(":")[2] ?? "0", 10) >= cutoff)
      .sort((a, b) => a.name.localeCompare(b.name));

    const values = await Promise.all(filtered.map((k) => env.SNAPSHOTS.get(k.name)));
    const snaps = values.filter(Boolean).map((v) => JSON.parse(v!));
    return new Response(JSON.stringify(snaps), { headers: CORS });
  }

  return new Response(JSON.stringify({ error: "not found" }), { status: 404, headers: CORS });
}

async function runPriceGraph(env: Env): Promise<void> {
  const graph = await buildPriceGraph();
  const json = JSON.stringify(graph);
  await env.SNAPSHOTS.put("price_graph:latest", json, { expirationTtl: 7 * 86400 });
  await env.SNAPSHOTS.put(
    "price_graph:generated_at",
    (graph as { generated_at: string }).generated_at,
    { expirationTtl: 7 * 86400 }
  );
}

export default {
  async scheduled(event: ScheduledEvent, env: Env, _ctx: ExecutionContext): Promise<void> {
    if (event.cron === "0 4 * * *") {
      try { await computeZScoreBaselines(env); }
      catch (err) { console.error("Z-score baseline error:", err); }
    } else if (event.cron === "0 * * * *") {
      try {
        const result = await ingestChatter(env);
        console.log(`Chatter ingest complete: ${result.tokensProcessed} tokens, ${result.mentionsWritten} mentions`);
      } catch (err) {
        console.error("Chatter ingest error:", err);
      }
      try {
        const r = await ingestPulsechainChatter(env);
        console.log(`PulseChain chatter ingest: ${r.ingested} items`);
      } catch (err) {
        console.error("Pulsechain chatter error:", err);
      }
      try {
        const p = await ingestPulse(env);
        console.log(`Pulse rolling-100 ingest: ${p.ingested} items, sources=${JSON.stringify(p.sources)}`);
      } catch (err) {
        console.error("Pulse rolling ingest error:", err);
      }
      try {
        const n = await refreshPulseNews(env);
        console.log(`Pulse-news refresh: ${n.ingested} items`);
      } catch (err) {
        console.error("Pulse-news refresh error:", err);
      }
    } else if (event.cron === "*/30 * * * *") {
      try {
        await runPriceGraph(env);
      } catch (err) {
        console.error("Price graph error:", err);
      }
    } else if (event.cron === "*/5 * * * *") {
      try {
        await runVolatilitySnapshot(env);
      } catch (err) {
        console.error("Volatility snapshot error:", err);
      }
    } else {
      // */15 cron — LPX pool snapshots
      try {
        await runSnapshot(env);
      } catch (err) {
        console.error("Snapshot error:", err);
      }
    }
  },

  async fetch(request: Request, env: Env, _ctx: ExecutionContext): Promise<Response> {
    try {
      return await handleFetch(request, env);
    } catch (err) {
      console.error("Fetch error:", err);
      return new Response(JSON.stringify({ error: "internal error" }), { status: 500, headers: CORS });
    }
  },
};
