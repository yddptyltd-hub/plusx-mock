"use client";
import React, { useMemo } from "react";
import { useLivePools } from "@/lib/useLivePools";
import { useVolatilityTop10 } from "@/lib/useVolatility";
import type { LivePool } from "@/lib/livePools";
import { Activity } from "lucide-react";
import { InfoTooltip } from "@/components/Tooltip";

function fmtUsd(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

export function ActivityHeartbeat() {
  const { pools } = useLivePools();
  const { data: vol } = useVolatilityTop10();

  const stats = useMemo(() => {
    if (!pools) return { poolCount: 0, totalTvl: 0 };
    const live = pools as LivePool[];
    return {
      poolCount: live.length,
      totalTvl: live.reduce((acc, p) => acc + (p.tvlUsd ?? 0), 0),
    };
  }, [pools]);

  const topMover = vol?.tokens?.[0];

  return (
    <div className="glass-card px-4 py-3 mb-4 flex flex-wrap items-center gap-x-4 gap-y-2">
      <div className="flex items-center gap-2">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-60"></span>
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500"></span>
        </span>
        <span className="text-xs font-bold uppercase text-green-700 tracking-wide">PulseChain Live</span>
        <InfoTooltip contentKey="_inline" text="Heartbeat shows real on-chain activity right now: how many LPX pools exist, total TVL locked across them, and the hottest token by volatility. If you ever see all-zero values, the data layer is degraded - not the chain." />
      </div>
      <div className="text-[12px] text-text-secondary flex flex-wrap items-center gap-x-3 gap-y-1">
        <span><Activity className="w-3 h-3 inline mr-1 text-text-tertiary" />{stats.poolCount} LPX pools</span>
        <span>·</span>
        <span>TVL {fmtUsd(stats.totalTvl)}</span>
        {topMover && (
          <>
            <span>·</span>
            <span>Hot: <span className="font-semibold text-text-primary">{topMover.symbol}</span> <span className={topMover.h24Pct >= 0 ? "text-green-600" : "text-red-600"}>{topMover.h24Pct >= 0 ? "+" : ""}{topMover.h24Pct.toFixed(2)}%</span></span>
          </>
        )}
      </div>
    </div>
  );
}
