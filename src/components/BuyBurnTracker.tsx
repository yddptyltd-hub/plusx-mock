"use client";

import React, { useState, useEffect } from "react";
import { Flame, ExternalLink } from "lucide-react";
import { useBurnState } from "@/lib/useBurnState";
import { formatUsd } from "@/lib/livePools";
import { useMode } from "@/lib/useMode";

interface Props {
  priceGraph: Record<string, { price_usd: number | null }>;
}

function relTime(ts: number): string {
  const d = Math.floor((Date.now() - ts) / 1000);
  if (d < 60) return `${d}s`;
  if (d < 3600) return `${Math.floor(d / 60)}m`;
  return `${Math.floor(d / 3600)}h`;
}

const FEE_WALLET = "0x900DEaf4aF0711c7Eb7a2699fE86209F6F626dEf";
const BURN_TARGETS = new Set([
  "0x664e58570e5835b99d281f12dd14d350315d7e2a",
  "0x131bf51e864024df1982f2cd7b1c786e1a005152",
]);

export function BuyBurnTracker({ priceGraph }: Props) {
  const { data, isLoading } = useBurnState(priceGraph);
  const { mode } = useMode();
  const [, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 10_000);
    return () => clearInterval(id);
  }, []);

  const shortWallet = `${FEE_WALLET.slice(0, 10)}…${FEE_WALLET.slice(-8)}`;
  const scanUrl = `https://scan.pulsechain.com/address/${FEE_WALLET}`;

  return (
    <div className="bg-white border border-border rounded-2xl p-5 shadow-sm mb-8">
      <div className="flex items-center gap-2 mb-1">
        <Flame className="w-4 h-4 text-orange-500 shrink-0" />
        <h2 className="text-sm font-semibold text-text-primary">
          Buy &amp; Burn (LPX Fees → uP/uPX)
        </h2>
      </div>
      <p className="text-[11px] text-text-tertiary mb-4 leading-snug">
        Every trade against an LPX position generates a small fee. Fees accumulate in the fee
        wallet, then periodically the protocol uses the accumulated DAI/WPLS to buy uP and uPX
        from the open market and burn them, reducing supply and increasing scarcity.
      </p>

      <div className="mb-1">
        {isLoading || !data ? (
          <div className="h-9 w-32 bg-slate-100 rounded animate-pulse" />
        ) : (
          <span className="text-[32px] font-bold text-text-primary leading-tight tabular-nums">
            {formatUsd(data.totalPendingUsd)} pending burn
          </span>
        )}
        <p className="text-[11px] text-text-tertiary mt-0.5">
          fees collected since last burn, in fee wallet{" "}
          <a
            href={scanUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-teal hover:underline inline-flex items-center gap-0.5 font-mono"
          >
            {mode === "pro" ? FEE_WALLET : shortWallet}
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
        {isLoading || !data
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-slate-50 rounded-xl p-4 animate-pulse">
                <div className="h-3 w-10 bg-slate-200 rounded mb-2" />
                <div className="h-5 w-24 bg-slate-200 rounded mb-1" />
                <div className="h-3 w-16 bg-slate-200 rounded" />
              </div>
            ))
          : data.holdings.map((h) => (
              <div key={h.symbol} className="bg-slate-50 rounded-xl p-4">
                <p className="text-[11px] font-semibold text-text-tertiary uppercase tracking-wider mb-1">
                  {h.symbol}
                  {BURN_TARGETS.has(h.address.toLowerCase()) && (
                    <span className="ml-1 text-orange-400" aria-label="burn target">🔥</span>
                  )}
                </p>
                <p className="text-[15px] font-bold text-text-primary tabular-nums leading-tight">
                  {h.balance.toLocaleString("en-US", { maximumFractionDigits: 2 })}
                </p>
                <p className="text-[11px] text-text-tertiary mt-0.5 tabular-nums">
                  {h.valueUsd !== null ? formatUsd(h.valueUsd) : "—"}
                </p>
              </div>
            ))}
      </div>

      <p className="text-[11px] text-text-tertiary mt-3 text-right">
        {data
          ? `live · last refreshed ${relTime(data.generatedAt)} ago`
          : isLoading
          ? "fetching on-chain data…"
          : "waiting for price data…"}
      </p>
    </div>
  );
}
