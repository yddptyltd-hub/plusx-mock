"use client";
import React, { useMemo } from "react";
import { useLivePools } from "@/lib/useLivePools";
import type { LivePool } from "@/lib/livePools";
import { useVolatilityTop10 } from "@/lib/useVolatility";
import { Activity, TrendingUp, TrendingDown, Plus, BarChart3, Coins } from "lucide-react";

// Simple pass-through — previously used document.startViewTransition() which
// fired on every SWR revalidation and logged "Transition was skipped" thousands
// of times in DevTools when a new transition started before the prior one finished.
// View-transition animations aren't worth 4800+ console errors on the cofounder demo.
function useViewTransitionUpdate<T>(value: T): T {
  return value;
}

function fmtUsd(n: number | null | undefined): string {
  if (!n || !Number.isFinite(n)) return "—";
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

function timeAgo(unixMs: number | null): string {
  if (!unixMs) return "—";
  const s = Math.floor((Date.now() - unixMs) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export function LivePulse() {
  const { pools } = useLivePools();
  const { data: vol } = useVolatilityTop10();

  const stats = useMemo(() => {
    if (!pools || pools.length === 0) return null;
    const live = pools as LivePool[];

    const sortedByCreated = [...live]
      .filter((p) => p.pairCreatedAt != null)
      .sort((a, b) => (b.pairCreatedAt ?? 0) - (a.pairCreatedAt ?? 0));
    const newest = sortedByCreated[0] ?? null;

    const topTvl = [...live].sort((a, b) => (b.tvlUsd ?? 0) - (a.tvlUsd ?? 0))[0] ?? null;
    const topVol = [...live].sort((a, b) => (b.volume24hUsd ?? 0) - (a.volume24hUsd ?? 0))[0] ?? null;

    return {
      poolCount: live.length,
      totalTvl: live.reduce((acc, p) => acc + (p.tvlUsd ?? 0), 0),
      newest,
      topTvl,
      topVol,
    };
  }, [pools]);

  const topGainer = vol?.tokens?.find((t) => t.h24Pct > 0) ?? vol?.tokens?.[0] ?? null;
  const topLoser = [...(vol?.tokens ?? [])].sort((a, b) => a.h24Pct - b.h24Pct)[0] ?? null;

  // Single snapshot object → one view-transition per refresh, not 6 racing transitions.
  const snapshot = useViewTransitionUpdate({ stats, topGainer, topLoser });
  const displayStats = snapshot.stats;
  const displayGainer = snapshot.topGainer;
  const displayLoser = snapshot.topLoser;

  if (!displayStats) {
    return (
      <section className="glass-card p-5">
        <div className="text-sm text-text-tertiary">Loading PulseChain pulse…</div>
      </section>
    );
  }

  return (
    <section className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-brand-teal" />
          <h2 className="text-[15px] font-bold tracking-tight text-text-primary">What's happening on PulseChain right now</h2>
        </div>
        <span className="text-[10px] uppercase font-semibold text-text-tertiary tabular-nums">live · auto-refresh 60s</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <PulseRow
          icon={<Coins className="w-4 h-4 text-blue-600" />}
          label="LPX pools live"
          value={displayStats.poolCount.toString()}
          sub={`${fmtUsd(displayStats.totalTvl)} TVL across all`}
          vtSlug="pools"
        />
        {displayStats.newest && (
          <PulseRow
            icon={<Plus className="w-4 h-4 text-emerald-600" />}
            label="Newest pool"
            value={`${displayStats.newest.pair[0]}/${displayStats.newest.pair[1]}`}
            sub={`#${displayStats.newest.lpxNumber} · ${timeAgo(displayStats.newest.pairCreatedAt)}`}
            vtSlug="newest"
          />
        )}
        {displayStats.topTvl && (
          <PulseRow
            icon={<BarChart3 className="w-4 h-4 text-violet-600" />}
            label="Biggest TVL"
            value={`${displayStats.topTvl.pair[0]}/${displayStats.topTvl.pair[1]}`}
            sub={fmtUsd(displayStats.topTvl.tvlUsd) + " · #" + displayStats.topTvl.lpxNumber}
            vtSlug="biggest-tvl"
          />
        )}
        {displayStats.topVol && (
          <PulseRow
            icon={<Activity className="w-4 h-4 text-orange-600" />}
            label="Top 24h volume"
            value={`${displayStats.topVol.pair[0]}/${displayStats.topVol.pair[1]}`}
            sub={fmtUsd(displayStats.topVol.volume24hUsd) + " · #" + displayStats.topVol.lpxNumber}
            vtSlug="top-volume"
          />
        )}
        {displayGainer && (
          <PulseRow
            icon={<TrendingUp className="w-4 h-4 text-emerald-600" />}
            label="Top gainer 24h"
            value={displayGainer.symbol}
            sub={`${displayGainer.h24Pct >= 0 ? "+" : ""}${displayGainer.h24Pct.toFixed(2)}% · vol idx ${displayGainer.volIndex ?? "—"}`}
            tone="up"
            vtSlug="top-gainer"
          />
        )}
        {displayLoser && (
          <PulseRow
            icon={<TrendingDown className="w-4 h-4 text-red-600" />}
            label="Top loser 24h"
            value={displayLoser.symbol}
            sub={`${displayLoser.h24Pct.toFixed(2)}% · vol idx ${displayLoser.volIndex ?? "—"}`}
            tone="down"
            vtSlug="top-loser"
          />
        )}
      </div>
    </section>
  );
}

function PulseRow({
  icon,
  label,
  value,
  sub,
  tone,
  vtSlug,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  tone?: "up" | "down";
  vtSlug: string;
}) {
  const toneCls = tone === "up" ? "text-emerald-700" : tone === "down" ? "text-red-700" : "text-text-primary";
  return (
    <div
      className="rounded-xl border border-border/80 bg-white/50 backdrop-blur-sm p-4 hover:border-brand-teal/40 hover:bg-white/80 transition-all duration-300 shadow-sm"
      style={{ viewTransitionName: `pulse-tile-${vtSlug}` }}
    >
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold text-text-tertiary mb-1.5">
        {icon}
        {label}
      </div>
      <div
        className={`text-base font-extrabold ${toneCls}`}
        style={{ viewTransitionName: `pulse-value-${vtSlug}` }}
      >
        {value}
      </div>
      <div className="text-[12px] text-text-secondary mt-0.5 tabular-nums">{sub}</div>
    </div>
  );
}
