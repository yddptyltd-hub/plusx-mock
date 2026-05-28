/**
 * priceGraph.ts — canonical loader for the DAI-anchored price graph.
 *
 * Primary source: CF Worker /api/price-graph (refreshes every 30 min via cron).
 * Fallback: /data/price_graph.json (static file baked at build time).
 *
 * All frontend components should use loadPriceGraph() from here, not fetch
 * /data/price_graph.json directly, so live prices flow site-wide.
 */

const WORKER_URL =
  "https://plusx-mock-worker.x7t67f8tnq.workers.dev/api/price-graph";

export interface PriceGraphToken {
  symbol: string;
  decimals: number;
  price_usd: number | null;
  route: string | null;
  hops: number | null;
  liquidity_used_usd: number | null;
}

export interface PriceGraph {
  generated_at: string;
  anchor: { address: string; symbol: string; price_usd: number; note?: string };
  tokens: Record<string, PriceGraphToken>;
  total_tvl_usd: number;
  pool_count: number;
}

// Client-side dedup: all callers share ONE in-flight promise; TTL 5min.
const PRICE_GRAPH_TTL_MS = 5 * 60 * 1000;
let _cache: PriceGraph | null = null;
let _cachedAt = 0;
let _inflight: Promise<PriceGraph | null> | null = null;

export async function loadPriceGraph(): Promise<PriceGraph | null> {
  const now = Date.now();
  if (_cache && now - _cachedAt < PRICE_GRAPH_TTL_MS) return _cache;
  if (_inflight) return _inflight;
  _inflight = (async () => {
    let worker: PriceGraph | null = null;
    let staticFile: PriceGraph | null = null;
    try {
      const res = await fetch(WORKER_URL, { cache: "no-store" });
      if (res.ok) worker = (await res.json()) as PriceGraph;
    } catch { /* fall through */ }
    try {
      const res = await fetch("/data/price_graph.json", { cache: "no-store" });
      if (res.ok) staticFile = (await res.json()) as PriceGraph;
    } catch { /* ignore */ }

    // Prefer Worker prices (live), but fill null entries from static file.
    // Worker can fail to resolve some tokens (DexScreener rate limits / gaps);
    // static file built by Python script typically has those prices baked in.
    if (worker && staticFile) {
      for (const [addr, tok] of Object.entries(staticFile.tokens)) {
        if (worker.tokens[addr] && worker.tokens[addr].price_usd === null && tok.price_usd !== null) {
          worker.tokens[addr] = { ...worker.tokens[addr], price_usd: tok.price_usd, route: tok.route ?? worker.tokens[addr].route };
        }
      }
      _cache = worker;
    } else {
      _cache = worker ?? staticFile;
    }
    if (_cache) _cachedAt = Date.now();
    return _cache;
  })().finally(() => { _inflight = null; });
  return _inflight;
}
