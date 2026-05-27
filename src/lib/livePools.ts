/**
 * livePools.ts — v1.1 live data fetching from lpx.plusx.app/watcher/*
 *
 * All endpoints are CORS-open (no proxy needed, no auth required).
 * Invariant: the shape returned here must be assignment-compatible with
 * the pool objects in data/pools.json so existing components need no changes.
 */

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
  volume24h: string;
  volume24hRaw: number;
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
  const tvlRaw = fundAmount;
  const tvl = formatTokenAmount(tvlRaw);
  const apr30dRaw = (raw.apr30d ?? 0) * 100;
  const aprAllTime = (raw.aprAllTime ?? 0) * 100;

  return {
    id: buildPoolId(raw.fundToken.symbol, raw.anchorToken.symbol, raw.poolId),
    pair: [raw.fundToken.symbol, raw.anchorToken.symbol],
    tvl,
    tvlRaw,
    volume24h: "$0",
    volume24hRaw: 0,
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
