"use client";
import Link from "next/link";
import { useVolatilityTop10 } from "@/lib/useVolatility";
import { Flame } from "lucide-react";
import { useTokenLink } from "@/lib/tokenLink";
import { InfoTooltip } from "@/components/Tooltip";

export function VolatilityTop5() {
  const { data, isLoading } = useVolatilityTop10();
  const tokenLink = useTokenLink();
  if (isLoading || !data) {
    return null;
  }
  const top = (data.tokens ?? []).slice(0, 5);
  if (top.length === 0) return null;

  return (
    <div className="glass-card p-5 mb-8">
      <div className="flex items-center gap-2 mb-3">
        <Flame className="w-4 h-4 text-orange-500" />
        <h2 className="text-sm font-semibold text-text-primary flex items-center gap-1.5">Top 5 PulseChain Volatility (5-min)<InfoTooltip contentKey="_inline" text="Quick view of the 5 most volatile PulseChain tokens right now. Tap any to see token detail (if it's in an LPX pool) or DexScreener. Tap See full leaderboard for the top 50." /></h2>
        <Link href="/volatility/" className="ml-auto text-[11px] text-brand-teal hover:underline">
          See full leaderboard →
        </Link>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        {top.map((t) => {
          const up = t.h24Pct >= 0;
          const li = tokenLink(t.addr, t.pairAddress);
          const inner = (
            <>
              <div className="text-sm font-bold text-text-primary truncate">{t.symbol}{li.external ? " ↗" : ""}</div>
              <div className={`text-lg font-bold tabular-nums ${up ? "text-green-600" : "text-red-600"}`}>
                {up ? "+" : ""}{t.h24Pct.toFixed(2)}%
              </div>
              <div className="text-[11px] text-text-tertiary tabular-nums">
                Index {t.volIndex} · liq ${(t.liquidityUsd / 1000).toFixed(1)}K
              </div>
            </>
          );
          const className = "flex-1 border border-white/40 rounded-xl p-3 hover:bg-white/40 transition-colors bg-white/30 block";
          return li.external ? (
            <a key={t.addr} href={li.href} target="_blank" rel="noopener noreferrer" className={className}>{inner}</a>
          ) : (
            <Link key={t.addr} href={li.href} className={className}>{inner}</Link>
          );
        })}
      </div>
    </div>
  );
}
