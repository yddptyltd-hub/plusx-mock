"use client";
import React, { useMemo } from "react";
import { useLivePools } from "@/lib/useLivePools";
import { useVolatilityTop10 } from "@/lib/useVolatility";
import type { LivePool } from "@/lib/livePools";
import { TrendingUp, TrendingDown, Layers, Flame, Award } from "lucide-react";
import { InfoTooltip } from "@/components/Tooltip";

function fmtUsd(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

export function CofounderKpi() {
  const { pools } = useLivePools();
  const { data: vol } = useVolatilityTop10();

  const k = useMemo(() => {
    if (!pools) return null;
    const live = pools as LivePool[];
    const sortedByAge = [...live].sort((a, b) => a.ageDays - b.ageDays);
    const newest = sortedByAge[0];
    const sortedByVolume = [...live].sort((a, b) => (b.volume24hRaw ?? 0) - (a.volume24hRaw ?? 0));
    const topVol = sortedByVolume[0];
    const youngerThan7d = live.filter((p) => p.ageDays <= 7).length;
    return {
      newest,
      newestSince: newest ? Math.floor(newest.ageDays) : null,
      youngerThan7d,
      topVolPool: topVol,
      totalLive: live.length,
    };
  }, [pools]);

  const topMover = vol?.tokens?.[0];
  const topGainer = vol?.tokens?.find((t) => t.h24Pct > 0);
  const topLoser = vol?.tokens?.find((t) => t.h24Pct < 0);

  if (!k) return null;

  return (
    <div className="glass-card p-5">
      <div className="flex items-center gap-2 mb-3">
        <h2 className="text-sm font-semibold text-text-primary">Cofounder daily snapshot</h2>
        <InfoTooltip contentKey="_inline" text="Yesterday's pulse in one row. Pool freshness, top volume pool, biggest gainer + loser of the last 24h. Live numbers - quote anywhere." />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
        <div className="border-l-2 border-brand-teal pl-2.5">
          <div className="text-[10px] uppercase text-text-tertiary flex items-center gap-1"><Layers className="w-3 h-3" /> Live pools</div>
          <div className="font-bold tabular-nums text-text-primary text-lg">{k.totalLive}</div>
          <div className="text-[10px] text-text-tertiary">{k.youngerThan7d} new in 7d</div>
        </div>
        <div className="border-l-2 border-orange-500 pl-2.5">
          <div className="text-[10px] uppercase text-text-tertiary flex items-center gap-1"><Award className="w-3 h-3" /> Newest pool</div>
          <div className="font-bold text-text-primary truncate">{k.newest ? `${k.newest.pair[0]}/${k.newest.pair[1]}` : "—"}</div>
          <div className="text-[10px] text-text-tertiary">#{k.newest?.lpxNumber} · {k.newestSince}d old</div>
        </div>
        <div className="border-l-2 border-sky-500 pl-2.5">
          <div className="text-[10px] uppercase text-text-tertiary flex items-center gap-1"><Flame className="w-3 h-3" /> Top 24h volume</div>
          <div className="font-bold text-text-primary truncate">{k.topVolPool ? `${k.topVolPool.pair[0]}/${k.topVolPool.pair[1]}` : "—"}</div>
          <div className="text-[10px] text-text-tertiary tabular-nums">{k.topVolPool ? fmtUsd(k.topVolPool.volume24hRaw ?? 0) : "—"}</div>
        </div>
        <div className="border-l-2 border-green-500 pl-2.5">
          <div className="text-[10px] uppercase text-text-tertiary flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Top gainer 24h</div>
          <div className="font-bold text-green-600">{topGainer ? `${topGainer.symbol} +${topGainer.h24Pct.toFixed(2)}%` : "—"}</div>
          <div className="text-[10px] text-text-tertiary">Vol Index {topGainer?.volIndex ?? "—"}</div>
        </div>
        <div className="border-l-2 border-red-500 pl-2.5">
          <div className="text-[10px] uppercase text-text-tertiary flex items-center gap-1"><TrendingDown className="w-3 h-3" /> Top loser 24h</div>
          <div className="font-bold text-red-600">{topLoser ? `${topLoser.symbol} ${topLoser.h24Pct.toFixed(2)}%` : "—"}</div>
          <div className="text-[10px] text-text-tertiary">Vol Index {topLoser?.volIndex ?? "—"}</div>
        </div>
      </div>
      <p className="mt-3 text-[11px] text-text-tertiary leading-relaxed">
        {topMover && <>Story of the day: <span className="font-semibold text-text-primary">{topMover.symbol}</span> ({topMover.h24Pct >= 0 ? "+" : ""}{topMover.h24Pct.toFixed(2)}% 24h, index {topMover.volIndex}/100). </>}
        Use the copy-packs below to broadcast this.
      </p>
    </div>
  );
}
