/**
 * livePools.ts — v1.2 live data fetching from lpx.plusx.app/watcher/*
 *
 * All endpoints are CORS-open (no proxy needed, no auth required).
 * Invariant: TVL/Volume/Fees shown in the UI are USD values from DexScreener,
 * never raw token counts mislabeled as dollars.
 */

import { findPairForLPX, getTokenPriceUsd } from "./dexscreener";

const BASE = "https://lpx.plusx.app/watcher";

// ─── Raw API response types ───────────────────────────────────────────────────

export interface RawToken {
  name: string;
  symbol: string;
  erc20Address: string;
  decimals: number;
}

export interface RawReserves {
  fundRaw: string;      // wei bigint string
  fundImgRaw: string;
  anchorRaw: string;
  anchorImgRaw: string;
}

export interface RawPool {
  poolId: number;
  poolType: number;
  isSolo: boolean;
  isClosed: boolean;
  managerAddress: string;
  liquidityProvidersCount: number;
  liquidityProvidersAllTimeCount: number;
  fundToken: RawToken;
  anchorToken: RawToken;
  reserves: RawReserves;
  feeIndex: number;
  ntzIndex: number;
  profitIndex: number;
  managerRewardIndex: number;
  aprAllTime: number;
  apr30d: number;
  liquidityFlow24h: number;
  liquidityFlow7d: number;
}

export interface RawCandle {
  openTS: number;
  closeTS: number;
  open: number;
  high: number;
  low: number;
  close: number;
  idxBuyPer100Usd?: number;
}

// ─── Derived / mapped types ───────────────────────────────────────────────────

export interface LivePool {
  id: string;
  pair: [string, string];
  tvl: string;
  tvlRaw: number;
  // USD values sourced from DexScreener (null = not yet enriched or pair not found)
  tvlUsd: number | null;
  volume24h: string;
  volume24hRaw: number;
  volume24hUsd: number | null;
  fees24hUsd: number | null;
  priceUsd: number | null;
  pairCreatedAt: number | null; // unix ms from DexScreener
  apr30d: string;
  apr30dRaw: number;
  managedMode: "Managed" | "Solo" | "Immutable";
  lpxKind: string;
  lpxNumber: number;
  ageDays: number;
  favorite: boolean;
  state: "Active" | "Closed";
  aprAllTime: number;
  aprAllTimeFormatted: string;
  liquidityProvidersCount: number;
  liquidityProvidersAllTimeCount: number;
  fundTokenAddress: string;
  anchorTokenAddress: string;
  fundDecimals: number;
  anchorDecimals: number;
  fundReserveAmount: number;
  anchorReserveAmount: number;
  ntzIndex: number;
  profitIndex: number;
  feeIndex: number;
  managerRewardIndex: number;
  managerAddress: string;
  poolId: number;
}

export interface Candle {
  openTS: number;
  closeTS: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function weiToDecimal(raw: string, decimals: number): number {
  if (!raw || raw === "0") return 0;
  try {
    const big = BigInt(raw);
    const divisor = BigInt(10 ** decimals);
    const whole = Number(big / divisor);
    const frac = Number(big % divisor) / 10 ** decimals;
    return whole + frac;
  } catch {
    return 0;
  }
}

function formatTokenAmount(amount: number): string {
  if (amount >= 1_000_000_000) return `$${(amount / 1_000_000_000).toFixed(1)}B`;
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(1)}k`;
  if (amount >= 1) return `$${amount.toFixed(2)}`;
  return `$${amount.toFixed(4)}`;
}

/**
 * Format a USD dollar amount for display.
 * e.g. 1_234_567 → "$1.2M", 45_000 → "$45.0K", 94.3 → "$94.30"
 */
export function formatUsd(amount: number): string {
  if (amount >= 1_000_000_000) return `$${(amount / 1_000_000_000).toFixed(1)}B`;
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(1)}K`;
  if (amount >= 1) return `$${amount.toFixed(2)}`;
  return `$${amount.toFixed(4)}`;
}

function buildPoolId(fundSymbol: string, anchorSymbol: string, poolId: number): string {
  const slugify = (s: string) =>
    s.toLowerCase().replace(/[()]/g, "").replace(/\s+/g, "-");
  return `${slugify(fundSymbol)}-${slugify(anchorSymbol)}-${poolId}`;
}

function deriveManagedMode(raw: RawPool): "Managed" | "Solo" | "Immutable" {
  if (raw.isSolo) return "Solo";
  if (raw.poolType === 0) return "Immutable";
  return "Managed";
}

function mapPool(raw: RawPool): LivePool {
  const fundAmount = weiToDecimal(raw.reserves.fundRaw, raw.fundToken.decimals);
  // tvlRaw stores the raw token count — NOT dollars. Used only for relative
  // sorting until DexScreener enrichment overwrites tvlRaw with USD value.
  const tvlRaw = fundAmount;
  const apr30dRaw = (raw.apr30d ?? 0) * 100;
  const aprAllTime = (raw.aprAllTime ?? 0) * 100;
  return {
    id: buildPoolId(raw.fundToken.symbol, raw.anchorToken.symbol, raw.poolId),
    pair: [raw.fundToken.symbol, raw.anchorToken.symbol],
    tvl: "—",
    tvlRaw,
    tvlUsd: null,
    volume24h: "—",
    volume24hRaw: 0,
    volume24hUsd: null,
    fees24hUsd: null,
    priceUsd: null,
    pairCreatedAt: null,
    apr30d: `${apr30dRaw.toFixed(1)}%`,
    apr30dRaw,
    managedMode: deriveManagedMode(raw),
    lpxKind: raw.isSolo ? "Standard LPX" : "Custom LPX",
    lpxNumber: raw.poolId,
    ageDays: 0,
    favorite: false,
    state: raw.isClosed ? "Closed" : "Active",
    aprAllTime,
    aprAllTimeFormatted: `${aprAllTime.toFixed(2)}%`,
    liquidityProvidersCount: raw.liquidityProvidersCount,
    liquidityProvidersAllTimeCount: raw.liquidityProvidersAllTimeCount,
    fundTokenAddress: raw.fundToken.erc20Address,
    anchorTokenAddress: raw.anchorToken.erc20Address,
    fundDecimals: raw.fundToken.decimals,
    anchorDecimals: raw.anchorToken.decimals,
    fundReserveAmount: fundAmount,
    anchorReserveAmount: weiToDecimal(raw.reserves.anchorRaw, raw.anchorToken.decimals),
    ntzIndex: raw.ntzIndex,
    profitIndex: raw.profitIndex,
    feeIndex: raw.feeIndex,
    managerRewardIndex: raw.managerRewardIndex,
    managerAddress: raw.managerAddress,
    poolId: raw.poolId,
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

const SEARCH_BODY = {
  request: {
    skip: 0,
    take: 50,
    sid: "",
    forWalletAdr: "",
    forToken: "",
    isFilterPorfolio: false,
    isFilterManager: false,
    isFilterOnlySolo: false,
  },
};

export async function fetchLivePools(): Promise<LivePool[]> {
  const res = await fetch(`${BASE}/LPXWatcher/SearchLPXs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(SEARCH_BODY),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`SearchLPXs responded ${res.status}`);
  const raw: RawPool[] = await res.json();
  return raw
    .filter((p) => !p.isClosed)
    .sort((a, b) => a.poolId - b.poolId)
    .map((p) => mapPool(p));
}

/**
 * Enrich pools with USD values computed from raw on-chain reserves × token prices.
 *
 * Formula (verified against live mirror.lpx.plusx.app):
 *   tvlUsd = (fundRaw / 10^fundDecimals) * fundPriceUsd
 *           + (anchorRaw / 10^anchorDecimals) * anchorPriceUsd
 *
 * IMPORTANT: fundImgRaw / anchorImgRaw are virtual/imaginary reserves used
 * internally by the LPX constant-product math — they are NOT real tokens held.
 * They must NEVER be included in TVL computation.
 *
 * DAI(ETH) at 0xefd766ccb38eaf1dfd701853bfce31359239f305 is treated as exactly
 * $1.00 (ecosystem oracle peg) — DexScreener market price is irrelevant.
 *
 * Pools with no DexScreener price data keep tvl/volume as "—".
 */
export async function enrichWithDexScreener(pools: LivePool[]): Promise<LivePool[]> {
  return Promise.all(
    pools.map(async (pool) => {
      // Fetch token prices and DexScreener pair concurrently
      const [fundPriceUsd, anchorPriceUsd, pair] = await Promise.all([
        getTokenPriceUsd(pool.fundTokenAddress),
        getTokenPriceUsd(pool.anchorTokenAddress),
        findPairForLPX(pool.fundTokenAddress, pool.anchorTokenAddress),
      ]);

      // TVL = raw reserves × token prices (never img/virtual reserves)
      const tvlUsd =
        fundPriceUsd !== null && anchorPriceUsd !== null
          ? pool.fundReserveAmount * fundPriceUsd +
            pool.anchorReserveAmount * anchorPriceUsd
          : null;

      // Volume and fees come from DexScreener pair (if found)
      const volume24hUsd = pair?.volume?.h24 ?? null;
      const fees24hUsd =
        volume24hUsd !== null && pool.feeIndex > 0
          ? volume24hUsd * pool.feeIndex
          : null;

      // Price of the fund token (base token from DexScreener perspective)
      const priceUsd = fundPriceUsd;

      const pairCreatedAt = pair?.pairCreatedAt ?? null;
      const ageDays =
        pairCreatedAt !== null
          ? Math.floor((Date.now() - pairCreatedAt) / (1000 * 60 * 60 * 24))
          : 0;

      return {
        ...pool,
        tvl: tvlUsd !== null ? formatUsd(tvlUsd) : "—",
        tvlRaw: tvlUsd ?? pool.tvlRaw,
        tvlUsd,
        volume24h: volume24hUsd !== null ? formatUsd(volume24hUsd) : "—",
        volume24hRaw: volume24hUsd ?? pool.volume24hRaw,
        volume24hUsd,
        fees24hUsd,
        priceUsd,
        pairCreatedAt,
        ageDays,
      };
    })
  );
}

/** Convenience: fetch SearchLPXs + enrich with DexScreener USD values. */
export async function fetchLivePoolsEnriched(): Promise<LivePool[]> {
  const pools = await fetchLivePools();
  return enrichWithDexScreener(pools);
}

export async function fetchPoolCandles(
  fundAddr: string,
  anchorAddr: string,
  interval = "15m",
  count = 100
): Promise<Candle[]> {
  const url =
    `${BASE}/DEXWatcher/GetCandles` +
    `?baseTokenAddress=${encodeURIComponent(fundAddr)}` +
    `&quoteTokenAddress=${encodeURIComponent(anchorAddr)}` +
    `&interval=${encodeURIComponent(interval)}` +
    `&count=${count}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`GetCandles responded ${res.status}`);
  const candles: RawCandle[] = await res.json();
  return candles.map(({ openTS, closeTS, open, high, low, close }) => ({
    openTS, closeTS, open, high, low, close,
  }));
}
