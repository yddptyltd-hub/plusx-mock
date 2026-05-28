"use client";

import React, { useState } from "react";
import { useSnapshots } from "@/lib/useSnapshots";

interface ActivityPulseProps {
  poolId: number;
  fundDecimals: number;
  anchorDecimals: number;
  fundPriceUsd: number | null;
  anchorPriceUsd: number | null;
}

type Range = "1h" | "24h" | "7d" | "30d";

function rawToDecimal(raw: string, decimals: number): number {
  if (!raw || raw === "0") return 0;
  try {
    const big = BigInt(raw);
    const div = BigInt(10 ** decimals);
    return Number(big / div) + Number(big % div) / 10 ** decimals;
  } catch {
    return 0;
  }
}

function computeTvl(
  s: { fundReserveRaw: string; anchorReserveRaw: string },
  fDec: number, aDec: number, fPrice: number, aPrice: number
): number {
  return rawToDecimal(s.fundReserveRaw, fDec) * fPrice + rawToDecimal(s.anchorReserveRaw, aDec) * aPrice;
}

function fmtDuration(secs: number): string {
  if (secs < 120) return `${Math.round(secs)}s`;
  if (secs < 7200) return `${Math.round(secs / 60)}min`;
  const h = Math.floor(secs / 3600);
  const m = Math.round((secs % 3600) / 60);
  if (secs < 86400) return m > 0 ? `${h}h ${m}min` : `${h}h`;
  const d = Math.floor(secs / 86400);
  const rh = Math.round((secs % 86400) / 3600);
  return rh > 0 ? `${d}d ${rh}h` : `${d}d`;
}

function DeltaCell({ label, delta, pct, detail }: { label: string; delta: number | null; pct: number | null; detail?: string }) {
  const noData = delta === null;
  const isPos = !noData && delta! > 0;
  const isNeg = !noData && delta! < 0;
  const color = noData || delta === 0 ? "text-text-tertiary" : isPos ? "text-green-500" : "text-red-500";
  const arrow = noData ? "—" : isPos ? "▲" : isNeg ? "▼" : "—";
  return (
    <div className="flex-1 min-w-0">
      <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider mb-1">{label}</p>
      {noData ? (
        <p className="text-sm font-semibold text-text-tertiary">—</p>
      ) : (
        <>
          <p className={`text-sm font-semibold ${color}`}>{arrow} {Math.abs(delta!).toFixed(Math.abs(delta!) >= 100 ? 0 : 2)}</p>
          {pct !== null && delta !== 0 && <p className={`text-[11px] ${color}`}>{pct > 0 ? "+" : ""}{pct.toFixed(2)}%</p>}
        </>
      )}
      {detail && <p className="text-[10px] text-text-tertiary mt-0.5">{detail}</p>}
    </div>
  );
}

export function ActivityPulse({ poolId, fundDecimals, anchorDecimals, fundPriceUsd, anchorPriceUsd }: ActivityPulseProps) {
  const [range, setRange] = useState<Range>("24h");
  const { snapshots, isLoading } = useSnapshots(poolId, range);

  const hasPrices = fundPriceUsd !== null && anchorPriceUsd !== null;
  const n = snapshots.length;
  const first = n > 0 ? snapshots[0] : null;
  const last = n > 0 ? snapshots[n - 1] : null;

  const tvlSeries: number[] = hasPrices
    ? snapshots.map((s) => computeTvl(s, fundDecimals, anchorDecimals, fundPriceUsd!, anchorPriceUsd!))
    : [];

  const tvlFirst = tvlSeries.length >= 2 ? tvlSeries[0] : null;
  const tvlLast = tvlSeries.length >= 2 ? tvlSeries[n - 1] : null;
  const tvlDelta = tvlFirst !== null && tvlLast !== null ? tvlLast - tvlFirst : null;
  const tvlPct = tvlDelta !== null && tvlFirst !== null && tvlFirst !== 0 ? (tvlDelta / tvlFirst) * 100 : null;

  const aprFirst = n >= 2 ? first!.apr30d * 100 : null;
  const aprLast = n >= 2 ? last!.apr30d * 100 : null;
  const aprDelta = aprFirst !== null && aprLast !== null ? aprLast - aprFirst : null;
  const aprPct = aprDelta !== null && aprFirst !== null && aprFirst !== 0 ? (aprDelta / aprFirst) * 100 : null;
  const aprDetail = aprFirst !== null && aprLast !== null ? `${aprFirst.toFixed(2)}→${aprLast.toFixed(2)}%` : undefined;

  const lpFirst = n >= 2 ? first!.liquidityProvidersCount : null;
  const lpLast = n >= 2 ? last!.liquidityProvidersCount : null;
  const lpDelta = lpFirst !== null && lpLast !== null ? lpLast - lpFirst : null;
  const lpPct = lpDelta !== null && lpFirst !== null && lpFirst !== 0 ? (lpDelta / lpFirst) * 100 : null;
  const lpDetail = lpFirst !== null && lpLast !== null ? `${lpFirst} → ${lpLast}` : undefined;

  const spanSec = n >= 2 ? last!.ts - first!.ts : null;
  const historyLabel = n === 0 ? "No snapshots yet" : n === 1 ? "1 snapshot" : `${n} snapshots over ${fmtDuration(spanSec!)}`;

  const nowSec = Math.floor(Date.now() / 1000);
  const secsUntilNext = last ? 900 - (nowSec - last.ts) : null;
  const nextLabel = secsUntilNext === null ? "—" : secsUntilNext <= 0 ? "pending (cron may be lagging)" : `in ~${Math.round(secsUntilNext / 60)}min`;

  const svgW = 400;
  const svgH = 80;
  const sparkline = (() => {
    if (!hasPrices || tvlSeries.length < 2) return null;
    const min = Math.min(...tvlSeries);
    const max = Math.max(...tvlSeries);
    const rng = max - min || 1;
    const pts = tvlSeries.map((v, i) => {
      const x = (i / (tvlSeries.length - 1)) * svgW;
      const y = svgH - ((v - min) / rng) * (svgH - 8) - 4;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });
    return { pts: pts.join(" "), first: pts[0].split(","), last: pts[pts.length - 1].split(",") };
  })();

  return (
    <div className="glass-card p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-bold text-text-tertiary uppercase tracking-wider">Activity Pulse</h3>
        <select
          value={range}
          onChange={(e) => setRange(e.target.value as Range)}
          className="text-xs font-semibold text-text-secondary border border-border rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-brand-teal"
        >
          {(["1h", "24h", "7d", "30d"] as const).map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      <div className="mb-4 h-20 flex items-center justify-center bg-slate-50 rounded-xl overflow-hidden">
        {isLoading ? (
          <p className="text-xs text-text-tertiary">Loading…</p>
        ) : !hasPrices ? (
          <p className="text-xs text-text-tertiary text-center px-4">TVL chart unavailable — no DAI route for token</p>
        ) : sparkline ? (
          <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-full" preserveAspectRatio="none">
            <polyline points={sparkline.pts} fill="none" stroke="#0D9488" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
            <circle cx={sparkline.first[0]} cy={sparkline.first[1]} r="3" fill="#0D9488" />
            <circle cx={sparkline.last[0]} cy={sparkline.last[1]} r="3" fill="#0D9488" />
          </svg>
        ) : (
          <p className="text-xs text-text-tertiary text-center px-4">(building history — {n} snapshot{n !== 1 ? "s" : ""})</p>
        )}
      </div>

      <div className="flex gap-3 mb-4">
        <DeltaCell label="TVL change" delta={tvlDelta} pct={tvlPct} />
        <div className="w-px bg-border" />
        <DeltaCell label="APR change" delta={aprDelta} pct={aprPct} detail={aprDetail} />
        <div className="w-px bg-border" />
        <DeltaCell label="LP change" delta={lpDelta} pct={lpPct} detail={lpDetail} />
      </div>

      <div className="border-t border-border pt-3 space-y-1">
        <p className="text-[11px] text-text-tertiary">History: {historyLabel}</p>
        <p className="text-[11px] text-text-tertiary">Next snapshot: {nextLabel}</p>
      </div>
    </div>
  );
}
