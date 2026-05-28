import type { BacktestCandle } from "@/lib/useBacktest";

export interface HodlVsLpxParams {
  initialUsd: number;
  ntzPct: number;
  rebalanceFrac: number;
  feeCaptureFrac: number;
}

export interface SeriesPoint {
  ts: number;
  price: number;
  hodlUsd: number;
  lpxUsd: number;
  ilPct: number;
}

export interface HodlVsLpxResult {
  series: SeriesPoint[];
  hodlFinal: number;
  lpxFinal: number;
  edgeUsd: number;
  edgePct: number;
  exits: number;
  feesAccruedUsd: number;
  accuracyScore: number;
}

const INTERVAL_RES: Record<string, number> = {
  "15m": 95,
  "30m": 88,
  "1h": 80,
  "4h": 60,
  "1d": 40,
};

export function computeAccuracy(interval: string, candleCount: number): number {
  const base = INTERVAL_RES[interval] ?? 50;
  const minutesPerCandle = interval === "15m" ? 15 : interval === "30m" ? 30 : interval === "1h" ? 60 : interval === "4h" ? 240 : 1440;
  const windowDays = (candleCount * minutesPerCandle) / 1440;
  const coverage = Math.min(windowDays / 7, 1);
  return Math.round(base * (0.4 + 0.6 * coverage));
}

export function simulateHodlVsLpx(
  candles: BacktestCandle[],
  interval: string,
  params: HodlVsLpxParams
): HodlVsLpxResult {
  if (candles.length === 0) {
    return { series: [], hodlFinal: 0, lpxFinal: 0, edgeUsd: 0, edgePct: 0, exits: 0, feesAccruedUsd: 0, accuracyScore: 0 };
  }
  const { initialUsd, ntzPct, rebalanceFrac, feeCaptureFrac } = params;
  const sorted = [...candles].sort((a, b) => a.openTS - b.openTS);
  const startPrice = sorted[0].open;
  if (startPrice <= 0) {
    return { series: [], hodlFinal: 0, lpxFinal: 0, edgeUsd: 0, edgePct: 0, exits: 0, feesAccruedUsd: 0, accuracyScore: 0 };
  }
  const initialAnchor = initialUsd / 2;
  const initialFundUsdValue = initialUsd / 2;
  const initialFundQty = initialFundUsdValue / startPrice;

  let lpxAnchor = initialAnchor;
  let lpxFundQty = initialFundQty;
  let center = startPrice;
  let exits = 0;
  let feesAccrued = 0;

  const series: SeriesPoint[] = [];
  for (const c of sorted) {
    let highBand = center * (1 + ntzPct / 100);
    let lowBand = center * (1 - ntzPct / 100);

    if (c.high > highBand) {
      const sellPrice = highBand;
      const sellQty = lpxFundQty * rebalanceFrac;
      lpxFundQty -= sellQty;
      lpxAnchor += sellQty * sellPrice;
      feesAccrued += sellQty * sellPrice * (ntzPct / 100) * feeCaptureFrac;
      center = sellPrice;
      exits++;
    }
    highBand = center * (1 + ntzPct / 100);
    lowBand = center * (1 - ntzPct / 100);
    if (c.low < lowBand) {
      const buyPrice = lowBand;
      const spendAnchor = lpxAnchor * rebalanceFrac;
      const boughtQty = spendAnchor / buyPrice;
      lpxAnchor -= spendAnchor;
      lpxFundQty += boughtQty;
      feesAccrued += spendAnchor * (ntzPct / 100) * feeCaptureFrac;
      center = buyPrice;
      exits++;
    }

    const priceClose = c.close;
    const hodlUsd = initialAnchor + initialFundQty * priceClose;
    const lpxUsd = lpxAnchor + lpxFundQty * priceClose + feesAccrued;
    const ilPct = hodlUsd > 0 ? ((lpxUsd - hodlUsd) / hodlUsd) * 100 : 0;
    series.push({ ts: c.closeTS, price: priceClose, hodlUsd, lpxUsd, ilPct });
  }

  const last = series[series.length - 1];
  const hodlFinal = last.hodlUsd;
  const lpxFinal = last.lpxUsd;
  const edgeUsd = lpxFinal - hodlFinal;
  const edgePct = hodlFinal > 0 ? (edgeUsd / hodlFinal) * 100 : 0;
  const accuracyScore = computeAccuracy(interval, sorted.length);

  return { series, hodlFinal, lpxFinal, edgeUsd, edgePct, exits, feesAccruedUsd: feesAccrued, accuracyScore };
}
