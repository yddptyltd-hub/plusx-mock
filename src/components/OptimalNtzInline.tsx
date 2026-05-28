"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useBacktest, computeBacktestStats } from "@/lib/useBacktest";
import { Sparkles } from "lucide-react";

interface Props {
  poolId: number;
  poolDisplayName: string;
}

export function OptimalNtzInline({ poolId, poolDisplayName }: Props) {
  const { data, isLoading, error } = useBacktest(poolId, "1h", 168);

  const result = useMemo(() => {
    if (!data || !data.candles || data.candles.length < 2) return null;
    const candles = data.candles;
    const centerPrice = candles[0].open;
    if (!centerPrice) return null;
    const widths = [0.02, 0.05, 0.1, 0.2, 0.3, 0.5, 0.75, 1, 1.5, 2, 3, 5, 7, 10];
    let best: { ntzPct: number; exits: number; edge: number; pctInside: number } | null = null;
    for (const ntzPct of widths) {
      const s = computeBacktestStats(candles, centerPrice, ntzPct);
      if (!best || s.edgeCapturedPct > best.edge) {
        best = { ntzPct, exits: s.bandExitCount, edge: s.edgeCapturedPct, pctInside: s.pctTimeInsideBand };
      }
    }
    return { best, centerPrice, candleCount: candles.length };
  }, [data]);

  if (isLoading) {
    return (
      <div className="glass-card p-5 text-text-tertiary text-sm">Computing 7-day optimal NTZ…</div>
    );
  }
  if (error || !result || !result.best) {
    return (
      <div className="glass-card p-5 text-text-tertiary text-sm">No historical candles available for this pool.</div>
    );
  }
  const b = result.best;
  const fmtNtz = b.ntzPct < 1 ? b.ntzPct.toFixed(2) : b.ntzPct.toFixed(0);

  return (
    <div className="glass-card p-5">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-brand-teal" />
        <h3 className="text-sm font-semibold text-text-primary">Last 7d — Optimal NTZ</h3>
        <Link
          href={`/backtest/?pool=${poolId}`}
          className="ml-auto text-[11px] text-brand-teal hover:underline"
        >
          Open backtest →
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat label="Optimal NTZ" value={`± ${fmtNtz}%`} bold />
        <Stat label="Edge captured" value={`${b.edge.toFixed(2)}%`} bold />
        <Stat label="Band exits" value={b.exits.toString()} />
        <Stat label="% time inside" value={`${b.pctInside.toFixed(1)}%`} />
      </div>
      <p className="mt-3 text-[12px] text-text-tertiary leading-relaxed">
        On {poolDisplayName} over the last {result.candleCount} hourly candles, an NTZ band of ± {fmtNtz}%
        would have re-centered {b.exits} times, capturing {b.edge.toFixed(2)}% total edge as price exited the band.
        Path-walking simulator — every exit recenters the band on the trigger price.
      </p>
    </div>
  );
}

function Stat({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div>
      <div className="text-[10px] uppercase font-semibold text-text-tertiary mb-0.5">{label}</div>
      <div className={`tabular-nums text-text-primary ${bold ? "text-lg font-bold text-brand-teal" : "font-semibold"}`}>{value}</div>
    </div>
  );
}
