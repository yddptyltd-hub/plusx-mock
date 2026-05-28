"use client";
import Link from "next/link";
import { Flame } from "lucide-react";
import { LivePool, formatUsd } from "@/lib/livePools";
import { RawSwap } from "@/lib/useSwaps";

interface Props {
  pools: LivePool[];
  swaps: RawSwap[];
}

function relTime(ts: number): string {
  const d = Date.now() / 1000 - ts;
  if (d < 60) return `${Math.floor(d)}s ago`;
  if (d < 3600) return `${Math.floor(d / 60)}m ago`;
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
  return `${Math.floor(d / 86400)}d ago`;
}

export function HotPools({ pools, swaps }: Props) {
  const since = Date.now() / 1000 - 86400;

  const trades24hByPool = new Map<number, RawSwap[]>();
  for (const s of swaps) {
    if (s.timestamp < since) continue;
    const arr = trades24hByPool.get(s.poolId);
    if (arr) arr.push(s);
    else trades24hByPool.set(s.poolId, [s]);
  }

  const ranked = pools
    .map((p) => ({ pool: p, swaps: trades24hByPool.get(p.poolId) ?? [] }))
    .filter((r) => r.swaps.length > 0)
    .sort((a, b) => {
      if (b.swaps.length !== a.swaps.length) return b.swaps.length - a.swaps.length;
      return (b.pool.tvlUsd ?? 0) - (a.pool.tvlUsd ?? 0);
    })
    .slice(0, 5);

  return (
    <div className="bg-white border border-border rounded-2xl p-5 shadow-sm mb-8">
      <div className="flex items-center gap-2 mb-3">
        <Flame className="w-4 h-4 text-orange-500" />
        <h2 className="text-sm font-semibold text-text-primary">Hot Pools (24h)</h2>
        <span className="text-[11px] text-text-tertiary ml-auto">Ranked by trade count</span>
      </div>
      {ranked.length === 0 ? (
        <div className="text-sm text-text-tertiary py-3">No trades in the last 24h yet.</div>
      ) : (
        <div className="flex flex-col sm:flex-row gap-3">
          {ranked.map(({ pool, swaps: ps }) => {
            const last = ps[0];
            return (
              <Link
                key={pool.poolId}
                href={`/pools/${pool.id}/`}
                className="flex-1 border border-border rounded-xl p-3 hover:bg-slate-50 transition-colors block"
              >
                <div className="text-sm font-bold text-text-primary truncate">
                  {pool.pair[0]} / {pool.pair[1]}
                </div>
                <div className="text-lg font-bold text-text-primary tabular-nums">
                  {ps.length}{" "}
                  <span className="text-xs font-medium text-text-secondary">trades</span>
                </div>
                <div className="text-[11px] text-text-tertiary tabular-nums">
                  {pool.tvlUsd != null ? formatUsd(pool.tvlUsd) : "—"} TVL
                </div>
                <div className="text-[11px] text-text-tertiary">last {relTime(last.timestamp)}</div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
