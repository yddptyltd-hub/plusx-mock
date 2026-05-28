"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useLivePools } from "@/lib/useLivePools";
import type { LivePool } from "@/lib/livePools";
import { Award, ChevronRight } from "lucide-react";
import { InfoTooltip } from "@/components/Tooltip";

interface ManagerRow {
  address: string;
  poolCount: number;
  totalTvlUsd: number;
  totalYieldAnchor: number;
  weightedApr30d: number;
  oldestAgeDays: number;
  pools: { id: string; lpxNumber: number; pair: string[]; tvlUsd: number | null; apr30d: number }[];
  score: number;
}

const ZERO_ADDR = "0x0000000000000000000000000000000000000000";

function fmtUsd(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

function shortAddr(a: string): string {
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}

export function ManagersLeaderboard() {
  const { pools, isLoading } = useLivePools();

  const ranked = useMemo<ManagerRow[]>(() => {
    if (!pools) return [];
    const live = (pools as LivePool[]).filter(
      (p) => "managerAddress" in p && typeof p.managerAddress === "string" && p.managerAddress.toLowerCase() !== ZERO_ADDR && p.managedMode !== "Solo"
    );
    const byMgr = new Map<string, ManagerRow>();
    for (const p of live) {
      const addr = p.managerAddress.toLowerCase();
      const existing = byMgr.get(addr) ?? {
        address: addr,
        poolCount: 0,
        totalTvlUsd: 0,
        totalYieldAnchor: 0,
        weightedApr30d: 0,
        oldestAgeDays: 0,
        pools: [],
        score: 0,
      };
      const tvlUsd = p.tvlUsd ?? 0;
      existing.poolCount += 1;
      existing.totalTvlUsd += tvlUsd;
      existing.totalYieldAnchor += p.totalYieldAnchor ?? 0;
      existing.weightedApr30d += (p.apr30dRaw ?? 0) * tvlUsd;
      existing.oldestAgeDays = Math.max(existing.oldestAgeDays, p.ageDays ?? 0);
      existing.pools.push({ id: p.id, lpxNumber: p.lpxNumber, pair: p.pair, tvlUsd: p.tvlUsd, apr30d: p.apr30dRaw ?? 0 });
      byMgr.set(addr, existing);
    }
    const rows = Array.from(byMgr.values()).map((m) => {
      const avgApr = m.totalTvlUsd > 0 ? m.weightedApr30d / m.totalTvlUsd : 0;
      const score = m.poolCount * Math.log10(m.totalTvlUsd + 1) * Math.max(avgApr, 1) * Math.log10(m.oldestAgeDays + 1);
      return { ...m, weightedApr30d: avgApr, score };
    });
    return rows.sort((a, b) => b.score - a.score);
  }, [pools]);

  if (isLoading) return <div className="text-text-tertiary text-sm">Loading manager data…</div>;
  if (ranked.length === 0) return <div className="text-text-tertiary text-sm">No managed pools found.</div>;

  return (
    <div className="glass-card overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-[10px] uppercase text-text-tertiary border-b border-border">
            <th className="text-left px-4 py-3">#</th>
            <th className="text-left px-4 py-3">Manager</th>
            <th className="text-right px-4 py-3">Pools</th>
            <th className="text-right px-4 py-3">Total TVL</th>
            <th className="text-right px-4 py-3">Avg 30d APR</th>
            <th className="text-right px-4 py-3">Oldest Pool</th>
            <th className="text-right px-4 py-3"><span className="inline-flex items-center gap-1">Score<InfoTooltip contentKey="_inline" text="Composite rank = pool count × log10(total TVL) × weighted 30d APR × log10(oldest pool age). Higher = more battle-tested manager." /></span></th>
          </tr>
        </thead>
        <tbody>
          {ranked.map((m, i) => (
            <tr key={m.address} className="border-b border-white/30 hover:bg-white/40 transition-colors">
              <td className="px-4 py-3">
                {i < 3 ? <Award className="w-4 h-4 text-orange-500 inline" /> : <span className="text-text-tertiary tabular-nums">{i + 1}</span>}
              </td>
              <td className="px-4 py-3">
                <Link
                  href={`https://midgardexplorer.io/address/${m.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-text-primary hover:text-brand-teal hover:underline flex items-center gap-1"
                >
                  {shortAddr(m.address)} <ChevronRight className="w-3 h-3" />
                </Link>
                <div className="mt-1 flex flex-wrap gap-1">
                  {m.pools.slice(0, 4).map((p) => (
                    <Link
                      key={p.id}
                      href={`/pools/${p.id}/`}
                      className="text-[10px] px-1.5 py-0.5 rounded-md bg-brand-teal/10 text-brand-teal font-semibold border border-brand-teal/20 hover:bg-brand-teal/20"
                    >
                      #{p.lpxNumber} {p.pair.join("/")}
                    </Link>
                  ))}
                  {m.pools.length > 4 && (
                    <span className="text-[10px] text-text-tertiary">+{m.pools.length - 4} more</span>
                  )}
                </div>
              </td>
              <td className="px-4 py-3 text-right tabular-nums">{m.poolCount}</td>
              <td className="px-4 py-3 text-right tabular-nums">{fmtUsd(m.totalTvlUsd)}</td>
              <td className="px-4 py-3 text-right tabular-nums">{m.weightedApr30d.toFixed(1)}%</td>
              <td className="px-4 py-3 text-right tabular-nums">{Math.round(m.oldestAgeDays)}d</td>
              <td className="px-4 py-3 text-right tabular-nums font-semibold text-brand-teal">{m.score.toFixed(1)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
