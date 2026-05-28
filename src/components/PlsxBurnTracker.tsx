"use client";

import React, { useState, useEffect } from "react";
import { Flame, ExternalLink } from "lucide-react";
import { usePlsxBurns } from "@/lib/usePlsxBurns";
import { formatUsd } from "@/lib/livePools";
import { useMode } from "@/lib/useMode";

interface Props {
  plsxPriceUsd: number | null;
}

const WINDOW_BLOCKS = 5000;

function fmtPlsx(n: number): string {
  if (n >= 1_000_000_000)
    return (n / 1_000_000_000).toLocaleString("en-US", { maximumFractionDigits: 1 }) + "B";
  if (n >= 1_000_000)
    return (n / 1_000_000).toLocaleString("en-US", { maximumFractionDigits: 1 }) + "M";
  if (n >= 1_000)
    return (n / 1_000).toLocaleString("en-US", { maximumFractionDigits: 1 }) + "K";
  return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

function relTime(ts: number): string {
  const d = Math.floor((Date.now() - ts) / 1000);
  if (d < 60) return `${d}s`;
  if (d < 3600) return `${Math.floor(d / 60)}m`;
  return `${Math.floor(d / 3600)}h`;
}

const SOURCE_LABEL: Record<string, string> = {
  V2: "PulseX V2",
  V1: "PulseX V1",
  AUX: "Auxiliary",
  OTHER: "Other",
};

const SOURCE_PILL: Record<string, string> = {
  V2: "bg-violet-100 text-violet-700",
  V1: "bg-blue-100 text-blue-700",
  AUX: "bg-amber-100 text-amber-700",
  OTHER: "bg-slate-100 text-slate-600",
};

export function PlsxBurnTracker({ plsxPriceUsd }: Props) {
  const { data, isLoading, error } = usePlsxBurns(WINDOW_BLOCKS, plsxPriceUsd);
  const { mode } = useMode();
  const [, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 10_000);
    return () => clearInterval(id);
  }, []);

  const windowHours = (WINDOW_BLOCKS * 10) / 3600;
  const sources: Array<"V2" | "V1" | "AUX"> = ["V2", "V1", "AUX"];

  return (
    <div className="bg-white border border-border rounded-2xl p-5 shadow-sm mb-8">
      <div className="flex items-center gap-2 mb-1">
        <Flame className="w-4 h-4 text-orange-500 shrink-0" />
        <h2 className="text-sm font-semibold text-text-primary">
          PulseX Burns (ecosystem)
        </h2>
      </div>
      <p className="text-[11px] text-text-tertiary mb-4 leading-snug">
        PLSX burned via PulseX protocol fees on every swap — 0.05% fee accumulates in LP
        K-value, minted to feeTo on next liquidity event, then batch-burned to address(0).
      </p>

      <div className="mb-1">
        {isLoading && !data ? (
          <div className="h-9 w-40 bg-slate-100 rounded animate-pulse" />
        ) : error && !data ? (
          <span className="text-[15px] text-text-tertiary">
            — data temporarily unavailable
          </span>
        ) : data ? (
          <>
            <span className="text-[32px] font-bold text-text-primary leading-tight tabular-nums">
              {fmtPlsx(data.totalBurned)} PLSX
            </span>
            {data.totalBurnedUsd !== null && (
              <span className="text-[15px] text-text-tertiary ml-2 tabular-nums">
                ≈ {formatUsd(data.totalBurnedUsd)}
              </span>
            )}
          </>
        ) : null}
        <p className="text-[11px] text-text-tertiary mt-0.5">
          burned in last ~{windowHours.toFixed(0)}h ({WINDOW_BLOCKS.toLocaleString()} blocks){" "}
          {data && (
            <span className="tabular-nums">
              across {data.events.length} burn event{data.events.length !== 1 ? "s" : ""}
            </span>
          )}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3 mt-4">
        {isLoading && !data
          ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-slate-50 rounded-xl p-4 animate-pulse">
                <div className="h-3 w-16 bg-slate-200 rounded mb-2" />
                <div className="h-5 w-20 bg-slate-200 rounded mb-1" />
                <div className="h-3 w-10 bg-slate-200 rounded" />
              </div>
            ))
          : data
          ? sources.map((src) => {
              const amt = data.bySource[src];
              const pct =
                data.totalBurned > 0
                  ? ((amt / data.totalBurned) * 100).toFixed(0)
                  : "0";
              return (
                <div key={src} className="bg-slate-50 rounded-xl p-4">
                  <p className="text-[11px] font-semibold text-text-tertiary uppercase tracking-wider mb-1">
                    {SOURCE_LABEL[src]}
                  </p>
                  <p className="text-[15px] font-bold text-text-primary tabular-nums leading-tight">
                    {fmtPlsx(amt)}
                  </p>
                  <p className="text-[11px] text-text-tertiary mt-0.5 tabular-nums">
                    {pct}% of burns
                  </p>
                </div>
              );
            })
          : null}
      </div>

      {mode === "pro" && data && data.events.length > 0 && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="text-text-tertiary border-b border-border">
                <th className="text-left pb-1.5 font-medium pr-4">Block</th>
                <th className="text-left pb-1.5 font-medium pr-4">Source</th>
                <th className="text-right pb-1.5 font-medium pr-4">Amount</th>
                <th className="text-right pb-1.5 font-medium">Tx</th>
              </tr>
            </thead>
            <tbody>
              {data.events.slice(0, 5).map((e) => (
                <tr key={e.txHash} className="border-b border-slate-50 last:border-0">
                  <td className="py-1.5 pr-4 tabular-nums text-text-secondary">
                    {e.block.toLocaleString()}
                  </td>
                  <td className="py-1.5 pr-4">
                    <span
                      className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold ${SOURCE_PILL[e.source]}`}
                    >
                      {e.source}
                    </span>
                  </td>
                  <td className="py-1.5 pr-4 text-right tabular-nums text-text-primary font-medium">
                    {fmtPlsx(e.amount)} PLSX
                  </td>
                  <td className="py-1.5 text-right">
                    <a
                      href={`https://scan.pulsechain.com/tx/${e.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-teal hover:underline inline-flex items-center gap-0.5"
                    >
                      {e.txHash.slice(0, 8)}…
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

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
