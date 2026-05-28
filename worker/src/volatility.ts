// v4.A — Volatility Data Pipeline
// Module B-G all depend on this. Do not break.

import { Env } from "./index";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface TierToken {
  address: string;
  symbol: string;
  tier: string;
  liquidityUsd: number;
}

interface DexPair {
  chainId: string;
  dexId: string;
  pairAddress: string;
  priceUsd: string;
  priceChange?: { h1?: number; h6?: number; h24?: number };
  liquidity?: { usd?: number };
  volume?: { h24?: number };
}

export interface VolatilitySnapshot {
  addr: string;
  symbol: string;
  ts: number;
  priceUsd: number;
  h1Pct: number;
  h6Pct: number;
  h24Pct: number;
  liquidityUsd: number;
  volumeH24Usd: number;
  primaryDex: string;
  pairAddress: string;
  rawVolScore: number;
  volIndex: number;
}

interface ZScoreBaseline {
  mean24h: number;
  std24h: number;
  sampleCount: number;
  computedAt: number;
}

interface VolErrorEntry {
  addr: string;
  symbol: string;
  ts: number;
  error: string;
}

const TIER_URL = "https://lpx.plusx.app/watcher/DEXWatcher/GetTokensByTier";
const LPX_URL = "https://lpx.plusx.app/watcher/LPXWatcher/SearchLPXs";
const LPX_BODY = JSON.stringify({ request: { skip: 0, take: 100, sid: "", forWalletAdr: "", forToken: "", isFilterPorfolio: false, isFilterManager: false, isFilterOnlySolo: false } });
const DEXSCREENER = "https://api.dexscreener.com/latest/dex/tokens/";
const MIN_LIQUIDITY_USD = 5000;
const SNAPSHOT_TTL_S = 35 * 86400;
const LEADERBOARD_TTL_S = 7 * 86400;
const BASELINE_TTL_S = 14 * 86400;
const ERROR_LOG_KEY = "volatility:errors:latest";
const LEADERBOARD_LATEST_KEY = "volatility:leaderboard:latest";
const CHUNK_SIZE = 5;
const CHUNK_DELAY_MS = 200;

async function fetchTierTokens(): Promise<TierToken[]> {
  const res = await fetch(TIER_URL);
  if (!res.ok) throw new Error(`GetTokensByTier failed: ${res.status}`);
  const data = await res.json() as unknown[];
  const tokens: TierToken[] = [];
  for (const item of data) {
    const t = item as { address?: string; symbol?: string; tier?: string; liquidityUsd?: number };
    if (!t.address || !t.symbol) continue;
    const liq = t.liquidityUsd ?? 0;
    if (liq < MIN_LIQUIDITY_USD) continue;
    tokens.push({ address: t.address.toLowerCase(), symbol: t.symbol, tier: t.tier ?? "", liquidityUsd: liq });
  }
  return tokens;
}

async function fetchLpxTokens(): Promise<TierToken[]> {
  const res = await fetch(LPX_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: LPX_BODY });
  if (!res.ok) return [];
  const pools = await res.json() as unknown[];
  const seen = new Map<string, TierToken>();
  for (const item of pools) {
    const p = item as { fundToken?: { erc20Address?: string; symbol?: string }; anchorToken?: { erc20Address?: string; symbol?: string } };
    for (const tok of [p.fundToken, p.anchorToken]) {
      if (!tok?.erc20Address || !tok.symbol) continue;
      const addr = tok.erc20Address.toLowerCase();
      if (!seen.has(addr)) seen.set(addr, { address: addr, symbol: tok.symbol, tier: "LPX", liquidityUsd: 0 });
    }
  }
  return Array.from(seen.values());
}

const MAX_UNIVERSE = 500;

export async function buildTokenUniverse(): Promise<TierToken[]> {
  let tierTokens: TierToken[] = [];
  let tierFailed = false;
  try { tierTokens = await fetchTierTokens(); }
  catch (err) { console.error("GetTokensByTier failed, fallback to LPX list:", err); tierFailed = true; }
  const lpxTokens = await fetchLpxTokens();
  const universe = new Map<string, TierToken>();
  for (const t of tierTokens) universe.set(t.address, t);
  for (const t of lpxTokens) { if (!universe.has(t.address)) universe.set(t.address, t); }
  const raw = Array.from(universe.values());
  console.log(`Universe raw: ${raw.length} (tier=${tierTokens.length}${tierFailed ? "[FAIL]" : ""}, lpx=${lpxTokens.length})`);

  if (raw.length <= MAX_UNIVERSE) return raw;

  // Cap at 500: prefer tier S then A then B then C then LPX/unknown
  const tierOrder: Record<string, number> = { S: 0, A: 1, B: 2, C: 3 };
  const ranked = raw.slice().sort((a, b) => {
    const ta = tierOrder[a.tier] ?? 4;
    const tb = tierOrder[b.tier] ?? 4;
    if (ta !== tb) return ta - tb;
    return b.liquidityUsd - a.liquidityUsd;
  });
  const capped = ranked.slice(0, MAX_UNIVERSE);
  console.log(`Universe capped: ${capped.length} (from ${raw.length})`);
  return capped;
}

async function fetchDexScreener(addr: string): Promise<DexPair | null> {
  try {
    const res = await fetch(DEXSCREENER + encodeURIComponent(addr), { headers: { "User-Agent": "plusx-volatility-worker/4a" } });
    if (!res.ok) return null;
    const data = await res.json() as { pairs?: DexPair[] };
    const pc = (data.pairs ?? []).filter((p) => p.chainId === "pulsechain");
    if (!pc.length) return null;
    return pc.sort((a, b) => (b.liquidity?.usd ?? 0) - (a.liquidity?.usd ?? 0))[0];
  } catch { return null; }
}

// Deterministic: same inputs -> same output
export function rawVolScore(liquidityUsd: number, h24Pct: number, volumeH24Usd: number): number {
  return Math.log10(liquidityUsd + 1) * Math.abs(h24Pct) * Math.sqrt(volumeH24Usd / 1000 + 1);
}

function percentileRank(value: number, allValues: number[]): number {
  if (!allValues.length) return 0;
  const sorted = [...allValues].sort((a, b) => a - b);
  let below = 0;
  for (const v of sorted) { if (v < value) below++; }
  return (below / sorted.length) * 100;
}

async function isOnCooldown(env: Env, addr: string): Promise<boolean> {
  return (await env.SNAPSHOTS.get(`volatility:${addr}:cooldown`)) !== null;
}

async function trackFailure(env: Env, addr: string, symbol: string, reason: string): Promise<void> {
  const failKey = `volatility:${addr}:fail_count`;
  const raw = await env.SNAPSHOTS.get(failKey);
  const count = raw ? parseInt(raw, 10) + 1 : 1;
  if (count >= 5) {
    await env.SNAPSHOTS.put(`volatility:${addr}:cooldown`, "1", { expirationTtl: 3600 });
    await env.SNAPSHOTS.delete(failKey);
    console.log(`${symbol} on cooldown after ${count} failures`);
  } else {
    await env.SNAPSHOTS.put(failKey, String(count), { expirationTtl: 7200 });
  }
  const logRaw = await env.SNAPSHOTS.get(ERROR_LOG_KEY);
  const log: VolErrorEntry[] = logRaw ? (JSON.parse(logRaw) as VolErrorEntry[]) : [];
  log.push({ addr, symbol, ts: Math.floor(Date.now() / 1000), error: reason });
  while (log.length > 50) log.shift();
  await env.SNAPSHOTS.put(ERROR_LOG_KEY, JSON.stringify(log), { expirationTtl: 7 * 86400 });
}

async function clearFailCount(env: Env, addr: string): Promise<void> {
  await env.SNAPSHOTS.delete(`volatility:${addr}:fail_count`);
}

export async function runVolatilitySnapshot(env: Env): Promise<void> {
  const epoch5min = Math.floor(Date.now() / (5 * 60 * 1000)) * (5 * 60);
  const universe = await buildTokenUniverse();
  if (!universe.length) { console.error("Empty universe — abort"); return; }

  type ScoredItem = { token: TierToken; pair: DexPair; priceUsd: number; h1Pct: number; h6Pct: number; h24Pct: number; liquidityUsd: number; volumeH24Usd: number; raw: number };
  const scored: ScoredItem[] = [];

  for (let i = 0; i < universe.length; i += CHUNK_SIZE) {
    const chunk = universe.slice(i, i + CHUNK_SIZE);
    const results = await Promise.allSettled(chunk.map(async (tok) => {
      if (await isOnCooldown(env, tok.address)) return null;
      return { tok, pair: await fetchDexScreener(tok.address) };
    }));
    for (let j = 0; j < chunk.length; j++) {
      const tok = chunk[j];
      const r = results[j];
      if (r.status === "rejected") { await trackFailure(env, tok.address, tok.symbol, String(r.reason)); continue; }
      if (r.value === null) continue;
      if (!r.value.pair) { await trackFailure(env, tok.address, tok.symbol, "no PulseChain pair"); continue; }
      const priceUsd = parseFloat(r.value.pair.priceUsd ?? "0") || 0;
      if (priceUsd === 0) { await trackFailure(env, tok.address, tok.symbol, "priceUsd=0"); continue; }
      await clearFailCount(env, tok.address);
      const { pair } = r.value;
      const liq = pair.liquidity?.usd ?? 0;
      const vol = pair.volume?.h24 ?? 0;
      const h24 = pair.priceChange?.h24 ?? 0;
      scored.push({ token: tok, pair, priceUsd, h1Pct: pair.priceChange?.h1 ?? 0, h6Pct: pair.priceChange?.h6 ?? 0, h24Pct: h24, liquidityUsd: liq, volumeH24Usd: vol, raw: rawVolScore(liq, h24, vol) });
    }
    if (i + CHUNK_SIZE < universe.length) await new Promise((r) => setTimeout(r, CHUNK_DELAY_MS));
  }

  if (!scored.length) { console.error("No data — abort snapshot"); return; }

  const allRaws = scored.map((s) => s.raw);
  const snapshots: VolatilitySnapshot[] = scored.map((s) => ({
    addr: s.token.address, symbol: s.token.symbol, ts: epoch5min, priceUsd: s.priceUsd,
    h1Pct: s.h1Pct, h6Pct: s.h6Pct, h24Pct: s.h24Pct, liquidityUsd: s.liquidityUsd,
    volumeH24Usd: s.volumeH24Usd, primaryDex: s.pair.dexId ?? "", pairAddress: s.pair.pairAddress ?? "",
    rawVolScore: Math.round(s.raw * 1000) / 1000,
    volIndex: Math.round(percentileRank(s.raw, allRaws)),
  }));

  const leaderboard = [...snapshots].sort((a, b) => b.volIndex - a.volIndex).slice(0, 50);
  const lbJson = JSON.stringify({ ts: epoch5min, tokens: leaderboard });
  const allTokensJson = JSON.stringify({ ts: epoch5min, tokens: snapshots });
  await Promise.all([
    env.SNAPSHOTS.put(`volatility:history:${epoch5min}`, allTokensJson, { expirationTtl: SNAPSHOT_TTL_S }),
    env.SNAPSHOTS.put(LEADERBOARD_LATEST_KEY, lbJson, { expirationTtl: 86400 }),
  ]);
  console.log(`Snapshot done: ${snapshots.length} tokens, top=${leaderboard[0]?.symbol}(${leaderboard[0]?.volIndex})`);
}

export async function computeZScoreBaselines(env: Env): Promise<void> {
  const now = Math.floor(Date.now() / 1000);
  const cutoff7d = now - 7 * 86400;

  // Build the current token universe to iterate per-token rather than listing the
  // entire KV namespace (which would require pagination over hundreds-of-thousands of keys).
  const universe = await buildTokenUniverse();
  let computed = 0;

  const histList: string[] = [];
  let cursor: string | undefined;
  do {
    const page = await env.SNAPSHOTS.list({ prefix: `volatility:history:`, cursor });
    for (const k of page.keys) {
      const ts = parseInt(k.name.split(":")[2] ?? "", 10);
      if (!isNaN(ts) && ts >= cutoff7d) histList.push(k.name);
    }
    cursor = page.list_complete ? undefined : (page as { cursor?: string }).cursor;
  } while (cursor);

  if (histList.length < 3) {
    console.log(`Z-score baselines skipped: only ${histList.length} history blobs in window`);
    return;
  }

  const blobs = await Promise.all(histList.map((k) => env.SNAPSHOTS.get(k)));
  const perAddr: Record<string, number[]> = {};
  for (const v of blobs) {
    if (!v) continue;
    try {
      const blob = JSON.parse(v) as { ts: number; tokens: VolatilitySnapshot[] };
      for (const t of blob.tokens) {
        const k = t.addr.toLowerCase();
        (perAddr[k] ??= []).push(t.h24Pct);
      }
    } catch { /* skip */ }
  }

  for (const tok of universe) {
    const addr = tok.address.toLowerCase();
    const samples = perAddr[addr];
    if (!samples || samples.length < 3) continue;
    const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
    const std = Math.sqrt(samples.reduce((a, b) => a + (b - mean) ** 2, 0) / samples.length);
    const baseline: ZScoreBaseline = {
      mean24h: Math.round(mean * 10000) / 10000,
      std24h: Math.round(std * 10000) / 10000,
      sampleCount: samples.length,
      computedAt: now,
    };
    await env.SNAPSHOTS.put(`volatility:${addr}:baseline`, JSON.stringify(baseline), { expirationTtl: BASELINE_TTL_S });
    computed++;
  }
  console.log(`Z-score baselines computed for ${computed} tokens from ${histList.length} history blobs`);
}

const VOL_CORS = { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" };

function rangeToSeconds(range: string): number {
  const map: Record<string, number> = { "1h": 3600, "6h": 21600, "24h": 86400, "7d": 604800, "30d": 2592000 };
  return map[range] ?? 86400;
}

export async function handleVolatilityRoutes(request: Request, env: Env, path: string): Promise<Response | null> {
  if (path === "/api/volatility/top10" || path === "/api/volatility/top50") {
    const raw = await env.SNAPSHOTS.get(LEADERBOARD_LATEST_KEY);
    if (!raw) return new Response(JSON.stringify({ error: "no_volatility_data_yet" }), { status: 503, headers: { ...VOL_CORS, "Cache-Control": "no-store" } });
    if (path === "/api/volatility/top50") return new Response(raw, { headers: { ...VOL_CORS, "Cache-Control": "public, max-age=300" } });
    const lb = JSON.parse(raw) as { ts: number; tokens: VolatilitySnapshot[] };
    return new Response(JSON.stringify({ ts: lb.ts, tokens: lb.tokens.slice(0, 10) }), { headers: { ...VOL_CORS, "Cache-Control": "public, max-age=300" } });
  }

  const histMatch = path.match(/^\/api\/volatility\/(0x[a-fA-F0-9]+)\/history$/);
  if (histMatch) {
    const addr = histMatch[1].toLowerCase();
    const range = new URL(request.url).searchParams.get("range") ?? "24h";
    const cutoff = Math.floor(Date.now() / 1000) - rangeToSeconds(range);
    const list = await env.SNAPSHOTS.list({ prefix: `volatility:history:` });
    const inWindow = list.keys
      .filter((k) => { const ts = parseInt(k.name.split(":")[2] ?? "0", 10); return !isNaN(ts) && ts >= cutoff; })
      .sort((a, b) => parseInt(a.name.split(":")[2] ?? "0", 10) - parseInt(b.name.split(":")[2] ?? "0", 10));
    const values = await Promise.all(inWindow.map((k) => env.SNAPSHOTS.get(k.name)));
    const points: Array<{ ts: number; volIndex: number; priceUsd: number; h24Pct: number }> = [];
    for (const v of values) {
      if (!v) continue;
      try {
        const blob = JSON.parse(v) as { ts: number; tokens: VolatilitySnapshot[] };
        const s = blob.tokens.find((t) => t.addr.toLowerCase() === addr);
        if (s) points.push({ ts: s.ts, volIndex: s.volIndex, priceUsd: s.priceUsd, h24Pct: s.h24Pct });
      } catch { /* skip */ }
    }
    return new Response(JSON.stringify(points), { headers: { ...VOL_CORS, "Cache-Control": "public, max-age=300" } });
  }

  const baseMatch = path.match(/^\/api\/volatility\/(0x[a-fA-F0-9]+)\/baseline$/);
  if (baseMatch) {
    const addr = baseMatch[1].toLowerCase();
    const raw = await env.SNAPSHOTS.get(`volatility:${addr}:baseline`);
    if (!raw) return new Response(JSON.stringify({ error: "baseline_not_yet_computed" }), { status: 404, headers: { ...VOL_CORS, "Cache-Control": "no-store" } });
    return new Response(raw, { headers: { ...VOL_CORS, "Cache-Control": "public, max-age=300" } });
  }

  return null;
}
