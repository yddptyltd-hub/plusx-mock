"use client";
import { RawSwap } from "@/lib/useSwaps";
import { useMode } from "@/lib/useMode";
import { ArrowDown, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PoolMeta {
  poolId: number;
  pair: [string, string];
  fundDecimals: number;
  anchorDecimals: number;
  fundPriceUsd: number | null;
  anchorPriceUsd: number | null;
}

interface Props {
  swaps: RawSwap[];
  poolsMeta: Record<number, PoolMeta>;
  maxRows?: number;
  loading?: boolean;
}

function formatRelTime(ts: number): string {
  const delta = Date.now() / 1000 - ts;
  if (delta < 60) return `${Math.floor(delta)}s ago`;
  if (delta < 3600) return `${Math.floor(delta / 60)}m ago`;
  if (delta < 86400) return `${Math.floor(delta / 3600)}h ago`;
  return `${Math.floor(delta / 86400)}d ago`;
}

function formatTokenAmt(raw: string, decimals: number): string {
  if (!raw) return "0";
  try {
    const big = BigInt(raw);
    const div = 10n ** BigInt(decimals);
    const whole = Number(big / div);
    const frac = Number(big % div) / Number(div);
    const total = whole + frac;
    if (total >= 1e9) return `${(total / 1e9).toFixed(2)}B`;
    if (total >= 1e6) return `${(total / 1e6).toFixed(2)}M`;
    if (total >= 1e3) return `${(total / 1e3).toFixed(2)}K`;
    return total.toFixed(4);
  } catch {
    return "0";
  }
}

function tokenAmtNum(raw: string, decimals: number): number {
  if (!raw) return 0;
  try {
    const big = BigInt(raw);
    const div = 10n ** BigInt(decimals);
    return Number(big / div) + Number(big % div) / Number(div);
  } catch {
    return 0;
  }
}

function fmtUsd(v: number): string {
  if (v < 1) return `$${v.toFixed(4)}`;
  if (v < 1000) return `$${v.toFixed(2)}`;
  if (v < 1e6) return `$${(v / 1000).toFixed(1)}K`;
  return `$${(v / 1e6).toFixed(2)}M`;
}

export function TradesFeed({ swaps, poolsMeta, maxRows = 50, loading }: Props) {
  const { mode } = useMode();
  const visible = swaps.slice(0, maxRows);

  if (loading && visible.length === 0) {
    return (
      <div className="glass-card p-6 text-text-tertiary text-sm">
        Loading trades…
      </div>
    );
  }
  if (visible.length === 0) {
    return (
      <div className="glass-card p-6 text-text-tertiary text-sm">
        No trades yet.
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead className="bg-slate-50 text-text-tertiary text-[11px] uppercase tracking-wide">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Time</th>
              <th className="px-4 py-3 text-left font-medium">Pool</th>
              <th className="px-4 py-3 text-left font-medium">Action</th>
              <th className="px-4 py-3 text-right font-medium">Fund Δ</th>
              <th className="px-4 py-3 text-right font-medium">Anchor Δ</th>
              {mode === "pro" && (
                <th className="px-4 py-3 text-right font-medium">USD</th>
              )}
            </tr>
          </thead>
          <tbody>
            {visible.map((s, i) => {
              const meta = poolsMeta[s.poolId];
              const isBuy = s.direction === "InFund";
              const pair = meta ? `${meta.pair[0]}/${meta.pair[1]}` : `#${s.poolId}`;
              const fundDec = meta?.fundDecimals ?? 18;
              const anchorDec = meta?.anchorDecimals ?? 18;
              const fundSym = meta?.pair[0] ?? "Fund";
              const anchorSym = meta?.pair[1] ?? "Anchor";
              let usd = "—";
              if (meta) {
                const fundAmt = tokenAmtNum(s.fundDeltaRaw, fundDec);
                const anchorAmt = tokenAmtNum(s.anchorDeltaRaw, anchorDec);
                const fundV = meta.fundPriceUsd != null ? meta.fundPriceUsd * fundAmt : 0;
                const anchorV = meta.anchorPriceUsd != null ? meta.anchorPriceUsd * anchorAmt : 0;
                const maxV = Math.max(fundV, anchorV);
                if (maxV > 0) usd = fmtUsd(maxV);
              }
              return (
                <tr
                  key={`${s.poolId}-${s.timestamp}-${i}`}
                  className="border-t border-border hover:bg-slate-50/50"
                >
                  <td className="px-4 py-2.5 text-text-secondary">{formatRelTime(s.timestamp)}</td>
                  <td className="px-4 py-2.5 font-medium text-text-primary">{pair}</td>
                  <td className="px-4 py-2.5">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold",
                        isBuy ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                      )}
                    >
                      {isBuy ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                      LPX {isBuy ? "Bought" : "Sold"}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums">
                    {formatTokenAmt(s.fundDeltaRaw, fundDec)} {fundSym}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums">
                    {formatTokenAmt(s.anchorDeltaRaw, anchorDec)} {anchorSym}
                  </td>
                  {mode === "pro" && (
                    <td className="px-4 py-2.5 text-right tabular-nums text-text-secondary">{usd}</td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
