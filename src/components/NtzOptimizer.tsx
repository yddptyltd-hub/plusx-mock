"use client";

import React, { useMemo } from "react";
import type { BacktestCandle } from "@/lib/useBacktest";
import { computeBacktestStats } from "@/lib/useBacktest";

interface Props {
  candles: BacktestCandle[];
  centerPrice: number;
}

interface SweepRow {
  ntzPct: number;
  exits: number;
  pctInside: number;
  exitsPerDay: number;
  edgeCapturedPct: number;
}

export function NtzOptimizer({ candles, centerPrice }: Props) {
  const sweep: SweepRow[] = useMemo(() => {
    if (candles.length < 2 || centerPrice <= 0) return [];
    const firstTs = candles[0].openTS;
    const lastTs = candles[candles.length - 1].closeTS;
    const windowDays = Math.max((lastTs - firstTs) / 86400, 1 / 24);
    const widths = [0.02, 0.05, 0.1, 0.2, 0.3, 0.5, 0.75, 1, 1.5, 2, 3, 5, 7, 10, 15, 20, 30, 50];
    return widths.map((ntzPct) => {
      const s = computeBacktestStats(candles, centerPrice, ntzPct);
      return {
        ntzPct,
        exits: s.bandExitCount,
        pctInside: s.pctTimeInsideBand,
        exitsPerDay: s.bandExitCount / windowDays,
        edgeCapturedPct: s.edgeCapturedPct,
      };
    });
  }, [candles, centerPrice]);

  const bestRow = useMemo(() => {
    if (sweep.length === 0) return null;
    let best = sweep[0];
    for (const r of sweep) {
      if (r.edgeCapturedPct > best.edgeCapturedPct) best = r;
    }
    return best;
  }, [sweep]);

  if (sweep.length === 0) {
    return (
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-text-primary mb-2">NTZ Sweep Optimizer</h3>
        <p className="text-text-tertiary text-sm">Run a backtest above to populate the sweep.</p>
      </div>
    );
  }

  const maxEdge = Math.max(...sweep.map((r) => r.edgeCapturedPct), 1);

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-text-primary">NTZ Sweep Optimizer</h3>
        {bestRow && (
          <div className="text-[11px] text-text-tertiary">
            Optimal: <span className="font-bold text-brand-teal">± {bestRow.ntzPct < 1 ? bestRow.ntzPct.toFixed(2) : bestRow.ntzPct.toFixed(0)}%</span> · {bestRow.exits} exits · <span className="text-green-700 font-bold">{bestRow.edgeCapturedPct.toFixed(2)}% edge</span>
          </div>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[10px] uppercase text-text-tertiary border-b border-border">
              <th className="text-left py-1.5">NTZ ±%</th>
              <th className="text-right py-1.5">Band Exits</th>
              <th className="text-right py-1.5">Edge Captured</th>
              <th className="text-right py-1.5">Exits / Day</th>
              <th className="text-right py-1.5">% Time Inside</th>
              <th className="text-left py-1.5 pl-3">Edge Bar</th>
            </tr>
          </thead>
          <tbody>
            {sweep.map((r) => {
              const isBest = bestRow && r.ntzPct === bestRow.ntzPct;
              return (
                <tr key={r.ntzPct} className={`border-b border-white/30 ${isBest ? "bg-brand-teal/5" : ""}`}>
                  <td className="py-1.5 font-mono">{isBest ? "★ " : ""}± {r.ntzPct < 1 ? r.ntzPct.toFixed(2) : Number.isInteger(r.ntzPct) ? r.ntzPct.toFixed(0) : r.ntzPct.toFixed(1)}%</td>
                  <td className="py-1.5 text-right tabular-nums">{r.exits}</td>
                  <td className="py-1.5 text-right tabular-nums font-bold text-green-700">{r.edgeCapturedPct.toFixed(2)}%</td>
                  <td className="py-1.5 text-right tabular-nums">{r.exitsPerDay.toFixed(2)}</td>
                  <td className="py-1.5 text-right tabular-nums">{r.pctInside.toFixed(1)}%</td>
                  <td className="py-1.5 pl-3">
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden w-32">
                      <div className="h-2 bg-green-500" style={{ width: `${(r.edgeCapturedPct / maxEdge) * 100}%` }} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-[11px] text-text-tertiary leading-relaxed">
        Each row simulates a position with the given NTZ width over the same historical window.
        After every exit the band re-centers on the trigger price (matches LPX rebalance mechanics).
        Inside the NTZ no trade fires; outside, the position rebalances and captures NTZ% of edge per exit.
        Optimal = max total edge captured (= exits × NTZ%). The bound is the path-integral of price moves
        relative to the band — wider NTZ misses small wicks; narrower NTZ burns on noise.
      </p>
    </div>
  );
}
