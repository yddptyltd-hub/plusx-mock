"use client";
import useSWR from "swr";

const WORKER = "https://plusx-mock-worker.x7t67f8tnq.workers.dev";

export interface BacktestCandle {
  openTS: number;
  closeTS: number;
  open: number;
  high: number;
  low: number;
  close: number;
  idxBuyPer100Usd: number;
}

export interface BacktestResponse {
  poolId: number;
  fundAddr: string;
  anchorAddr: string;
  interval: string;
  count: number;
  candles: BacktestCandle[];
}

const fetcher = (url: string) =>
  fetch(url).then((r) => {
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json();
  });

export function useBacktest(poolId: number | null, interval: string, count: number) {
  const key = poolId == null ? null : `${WORKER}/api/backtest?pool=${poolId}&interval=${interval}&count=${count}`;
  return useSWR<BacktestResponse>(key, fetcher, { refreshInterval: 0, revalidateOnFocus: false });
}

export function useBacktestCustom(fund: string | null, anchor: string | null, interval: string, count: number) {
  const valid = fund && anchor && /^0x[a-fA-F0-9]{40}$/.test(fund) && /^0x[a-fA-F0-9]{40}$/.test(anchor);
  const key = valid ? `${WORKER}/api/backtest?fund=${fund}&anchor=${anchor}&interval=${interval}&count=${count}` : null;
  return useSWR<BacktestResponse>(key, fetcher, { refreshInterval: 0, revalidateOnFocus: false });
}

export interface BacktestStats {
  candleCount: number;
  minPrice: number;
  maxPrice: number;
  avgPrice: number;
  pctTimeInsideBand: number;
  bandExitCount: number;
  totalRangePct: number;
  edgeCapturedPct: number;
}

export function computeBacktestStats(
  candles: BacktestCandle[],
  centerPrice: number,
  ntzPct: number
): BacktestStats {
  if (candles.length === 0 || centerPrice <= 0) {
    return { candleCount: 0, minPrice: 0, maxPrice: 0, avgPrice: 0, pctTimeInsideBand: 0, bandExitCount: 0, totalRangePct: 0, edgeCapturedPct: 0 };
  }
  let center = centerPrice;
  let exits = 0;
  let insideCandles = 0;
  for (const c of candles) {
    let highBand = center * (1 + ntzPct / 100);
    let lowBand = center * (1 - ntzPct / 100);
    const candleInside = c.high <= highBand && c.low >= lowBand;
    if (candleInside) insideCandles++;
    if (c.high > highBand) { exits++; center = highBand; }
    highBand = center * (1 + ntzPct / 100);
    lowBand = center * (1 - ntzPct / 100);
    if (c.low < lowBand) { exits++; center = lowBand; }
  }
  const allCloses = candles.map((c) => c.close);
  const min = Math.min(...candles.map((c) => c.low));
  const max = Math.max(...candles.map((c) => c.high));
  return {
    candleCount: candles.length,
    minPrice: min,
    maxPrice: max,
    avgPrice: allCloses.reduce((a, b) => a + b, 0) / allCloses.length,
    pctTimeInsideBand: (insideCandles / candles.length) * 100,
    bandExitCount: exits,
    totalRangePct: ((max - min) / min) * 100,
    edgeCapturedPct: exits * ntzPct,
  };
}
