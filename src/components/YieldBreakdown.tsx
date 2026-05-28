"use client";

import React from "react";
import { Tooltip } from "@/components/Tooltip";
import { cn } from "@/lib/utils";

interface YieldBreakdownProps {
  anchorSymbol: string;
  anchorDecimals: number;
  totalYieldAnchor: number;
  arbYieldAnchor: number;
  makerYieldAnchor: number;
  arbPercent: number;
  anchorPriceUsd: number | null;
  profitPerShareRaw: string;
  profitPerShareArbRaw: string;
  sharesTotalRaw: string;
  isPro: boolean;
}

function fmtAnchor(amount: number, symbol: string): string {
  if (amount === 0) return `0 ${symbol}`;
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M ${symbol}`;
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(1)}K ${symbol}`;
  return `${amount.toFixed(2)} ${symbol}`;
}

function fmtUsd(amount: number, priceUsd: number): string {
  const usd = amount * priceUsd;
  if (usd >= 1_000_000) return `$${(usd / 1_000_000).toFixed(1)}M`;
  if (usd >= 1_000) return `$${(usd / 1_000).toFixed(1)}K`;
  if (usd >= 1) return `$${usd.toFixed(2)}`;
  return `$${usd.toFixed(4)}`;
}

function truncRaw(s: string): string {
  if (!s || s === "0") return "0";
  if (s.length <= 16) return s;
  return `${s.slice(0, 8)}…${s.slice(-6)}`;
}

export function YieldBreakdown({
  anchorSymbol,
  anchorDecimals,
  totalYieldAnchor,
  arbYieldAnchor,
  makerYieldAnchor,
  arbPercent,
  anchorPriceUsd,
  profitPerShareRaw,
  profitPerShareArbRaw,
  sharesTotalRaw,
  isPro,
}: YieldBreakdownProps) {
  const makerPercent = Math.max(0, 100 - arbPercent);
  const hasData = totalYieldAnchor > 0 || arbYieldAnchor > 0;

  return (
    <div className="glass-card p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-xs font-bold text-text-tertiary uppercase tracking-wider">
          Yield Breakdown{" "}
          <span className="font-normal normal-case text-text-tertiary">(since inception)</span>
        </h3>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className={cn("rounded-xl border p-3", hasData ? "border-border bg-slate-50" : "border-dashed border-border bg-slate-50/50")}>
          <div className="flex items-center gap-1 mb-1">
            <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider">Total Yield</span>
            <Tooltip contentKey="totalYieldInception" />
          </div>
          <div className="text-sm sm:text-base font-bold text-text-primary leading-tight">
            {hasData ? fmtAnchor(totalYieldAnchor, anchorSymbol) : "—"}
          </div>
          {hasData && anchorPriceUsd !== null && (
            <div className="text-[10px] text-text-tertiary mt-0.5">{fmtUsd(totalYieldAnchor, anchorPriceUsd)}</div>
          )}
        </div>

        <div className={cn("rounded-xl border p-3", hasData ? "border-border bg-purple-50/60" : "border-dashed border-border bg-slate-50/50")}>
          <div className="flex items-center gap-1 mb-1">
            <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">Arb Yield</span>
            <Tooltip contentKey="arbYieldInception" />
          </div>
          <div className="text-sm sm:text-base font-bold text-text-primary leading-tight">
            {hasData ? fmtAnchor(arbYieldAnchor, anchorSymbol) : "—"}
          </div>
          {hasData && anchorPriceUsd !== null && (
            <div className="text-[10px] text-text-tertiary mt-0.5">{fmtUsd(arbYieldAnchor, anchorPriceUsd)}</div>
          )}
          {hasData && totalYieldAnchor > 0 && (
            <div className="text-[10px] text-purple-600 font-semibold mt-0.5">{arbPercent.toFixed(0)}% of total</div>
          )}
        </div>

        <div className={cn("rounded-xl border p-3", hasData ? "border-border bg-teal-50/60" : "border-dashed border-border bg-slate-50/50")}>
          <div className="flex items-center gap-1 mb-1">
            <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider">Maker Yield</span>
            <Tooltip contentKey="makerYieldInception" />
          </div>
          <div className="text-sm sm:text-base font-bold text-text-primary leading-tight">
            {hasData ? fmtAnchor(makerYieldAnchor, anchorSymbol) : "—"}
          </div>
          {hasData && anchorPriceUsd !== null && (
            <div className="text-[10px] text-text-tertiary mt-0.5">{fmtUsd(makerYieldAnchor, anchorPriceUsd)}</div>
          )}
          {hasData && totalYieldAnchor > 0 && (
            <div className="text-[10px] text-teal-700 font-semibold mt-0.5">{makerPercent.toFixed(0)}% of total</div>
          )}
        </div>
      </div>

      {isPro && hasData && (
        <>
          <div className="mb-4">
            <div className="flex items-center justify-between text-[10px] text-text-tertiary mb-1">
              <span>Arb {arbPercent.toFixed(0)}%</span>
              <span>Maker {makerPercent.toFixed(0)}%</span>
            </div>
            <div className="flex h-2 rounded-full overflow-hidden bg-slate-100">
              <div className="bg-purple-400 transition-all duration-500" style={{ width: `${arbPercent}%` }} />
              <div className="bg-teal-400 transition-all duration-500" style={{ width: `${makerPercent}%` }} />
            </div>
          </div>

          <div className="border-t border-slate-100 pt-3 space-y-1.5">
            <div className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider mb-2">Raw fields</div>
            {(
              [
                ["profitPerShareRaw", profitPerShareRaw],
                ["profitPerShareArbRaw", profitPerShareArbRaw],
                ["sharesTotalRaw", sharesTotalRaw],
              ] as [string, string][]
            ).map(([label, val]) => (
              <div key={label} className="flex items-start justify-between gap-2 text-xs">
                <span className="text-text-tertiary font-mono shrink-0">{label}</span>
                <span className="font-mono text-text-secondary text-right break-all">{truncRaw(val)}</span>
              </div>
            ))}
            <div className="text-[10px] text-text-tertiary mt-2 leading-relaxed">
              Formula: profitPerShareRaw &times; sharesTotalRaw / 10<sup>{anchorDecimals + 18}</sup>
              {" "}(anchorDecimals={anchorDecimals} + 18 LPX precision)
            </div>
          </div>
        </>
      )}

      {!hasData && (
        <p className="text-[11px] text-text-tertiary">No yield data recorded for this pool yet.</p>
      )}
    </div>
  );
}
