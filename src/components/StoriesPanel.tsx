"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useVolatilityTop10 } from "@/lib/useVolatility";
import { useLivePools } from "@/lib/useLivePools";
import { Flame, TrendingDown, TrendingUp } from "lucide-react";
import { fmtPrice as fmtPriceShared } from "@/lib/formatPrice";
import { useTokenLink } from "@/lib/tokenLink";

interface Story {
  addr: string;
  symbol: string;
  priceUsd: number;
  h24Pct: number;
  volIndex: number;
  liquidityUsd: number;
  pairAddress: string;
  matchingPools: Array<{ id: string; lpxNumber: number; pair: string[]; tvl: string }>;
}

const fmtPrice = fmtPriceShared;

function buildNarrative(s: Story): string {
  const dir = s.h24Pct >= 0 ? "rallied" : "dropped";
  const pct = Math.abs(s.h24Pct).toFixed(2);
  const poolPart =
    s.matchingPools.length === 0
      ? "No LPX pool currently quotes this token."
      : `Routed through ${s.matchingPools.length} LPX pool${s.matchingPools.length === 1 ? "" : "s"} (#${s.matchingPools.map((p) => p.lpxNumber).join(", #")}).`;
  return `${s.symbol} ${dir} ${pct}% over 24h on $${(s.liquidityUsd / 1000).toFixed(1)}K of liquidity. Volatility index ${s.volIndex}/100. ${poolPart}`;
}

export function StoriesPanel() {
  const { data: vol, isLoading: volLoading } = useVolatilityTop10();
  const { pools, isLoading: poolsLoading } = useLivePools();
  const tokenLink = useTokenLink();

  const stories: Story[] = useMemo(() => {
    if (!vol || !pools) return [];
    return vol.tokens.map((t) => {
      const matchingPools = pools
        .filter((p) => "fundTokenAddress" in p && (p as { fundTokenAddress: string }).fundTokenAddress?.toLowerCase() === t.addr.toLowerCase())
        .map((p) => ({ id: p.id, lpxNumber: p.lpxNumber, pair: p.pair, tvl: p.tvl }));
      return {
        addr: t.addr,
        symbol: t.symbol,
        pairAddress: t.pairAddress,
        priceUsd: t.priceUsd,
        h24Pct: t.h24Pct,
        volIndex: t.volIndex,
        liquidityUsd: t.liquidityUsd,
        matchingPools,
      };
    });
  }, [vol, pools]);

  if (volLoading || poolsLoading) {
    return <div className="text-text-tertiary text-sm">Loading stories…</div>;
  }
  if (stories.length === 0) {
    return <div className="text-text-tertiary text-sm">No stories yet.</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {stories.map((s) => {
        const up = s.h24Pct >= 0;
        const li = tokenLink(s.addr, s.pairAddress);
        const cls = "glass-card p-5 hover:bg-white/60 transition-colors block";
        const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) =>
          li.external
            ? <a key={s.addr} href={li.href} target="_blank" rel="noopener noreferrer" className={cls}>{children}</a>
            : <Link key={s.addr} href={li.href} className={cls}>{children}</Link>;
        return (
          <Wrapper key={s.addr}>
            <div className="flex items-center gap-2 mb-2">
              <Flame className="w-4 h-4 text-orange-500" />
              <h3 className="text-base font-bold text-text-primary">{s.symbol}</h3>
              <div className="ml-auto flex items-center gap-1">
                {up ? <TrendingUp className="w-4 h-4 text-green-600" /> : <TrendingDown className="w-4 h-4 text-red-600" />}
                <span className={`text-sm font-bold tabular-nums ${up ? "text-green-600" : "text-red-600"}`}>
                  {up ? "+" : ""}{s.h24Pct.toFixed(2)}%
                </span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-3 text-[11px]">
              <div>
                <div className="text-text-tertiary uppercase">Index</div>
                <div className="font-bold tabular-nums text-text-primary">{s.volIndex}</div>
              </div>
              <div>
                <div className="text-text-tertiary uppercase">Price</div>
                <div className="font-bold tabular-nums text-text-primary">{fmtPrice(s.priceUsd)}</div>
              </div>
              <div>
                <div className="text-text-tertiary uppercase">Liq</div>
                <div className="font-bold tabular-nums text-text-primary">${(s.liquidityUsd / 1000).toFixed(1)}K</div>
              </div>
            </div>
            <p className="text-[12px] text-text-secondary leading-relaxed mb-3">{buildNarrative(s)}</p>
            {s.matchingPools.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {s.matchingPools.slice(0, 3).map((p) => (
                  <span key={p.id} className="text-[10px] px-2 py-0.5 rounded-full bg-brand-teal/10 text-brand-teal font-semibold border border-brand-teal/20">
                    #{p.lpxNumber} {p.pair.join("/")}
                  </span>
                ))}
              </div>
            )}
          </Wrapper>
        );
      })}
    </div>
  );
}
