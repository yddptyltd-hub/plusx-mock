"use client";
import Link from "next/link";
import { useVolatilityTop50, VolToken } from "@/lib/useVolatility";
import { Flame } from "lucide-react";
import { fmtPrice } from "@/lib/formatPrice";
import { useTokenLink } from "@/lib/tokenLink";
import { InfoTooltip } from "@/components/Tooltip";

function fmtUsd(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(2)}`;
}

function VolBar({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="w-20 h-2 bg-slate-200/50 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full"
        style={{
          width: `${pct}%`,
          background: `linear-gradient(90deg, #fbbf24, #ef4444)`,
        }}
      />
    </div>
  );
}

export function VolatilityLeaderboard() {
  const { data, error, isLoading } = useVolatilityTop50();
  const tokenLink = useTokenLink();

  if (isLoading) {
    return (
      <div className="glass-card p-6 text-text-tertiary text-sm">
        Loading volatility data…
      </div>
    );
  }
  if (error || !data) {
    return (
      <div className="glass-card p-6 text-text-tertiary text-sm">
        Volatility data temporarily unavailable.
      </div>
    );
  }

  const tokens: VolToken[] = data.tokens ?? [];

  return (
    <div className="glass-card overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-white/40">
        <Flame className="w-4 h-4 text-orange-500" />
        <h2 className="text-sm font-semibold text-text-primary flex items-center gap-1.5">
          Top {tokens.length} PulseChain Volatility (5-min refresh)
          <InfoTooltip contentKey="_inline" text="Quality-weighted volatility index across the full PulseChain token universe. Combines liquidity, |24h % change|, and 24h volume into a single 0-100 score. Higher = more action. Refreshed every 5 minutes." />
        </h2>
        <span className="text-[11px] text-text-tertiary ml-auto">
          Index = log10(liq) × |Δ24h| × √vol — normalized 0-100
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead className="bg-white/30 text-text-tertiary text-[11px] uppercase tracking-wide">
            <tr>
              <th className="px-4 py-2 text-left font-medium">#</th>
              <th className="px-4 py-2 text-left font-medium">Token</th>
              <th className="px-4 py-2 text-right font-medium">Index</th>
              <th className="px-4 py-2 text-right font-medium">Price</th>
              <th className="px-4 py-2 text-right font-medium">24h %</th>
              <th className="px-4 py-2 text-right font-medium">Liquidity</th>
              <th className="px-4 py-2 text-right font-medium">Vol 24h</th>
            </tr>
          </thead>
          <tbody>
            {tokens.map((t, i) => (
              <tr key={t.addr} className="border-t border-white/40 hover:bg-white/30 transition-colors">
                <td className="px-4 py-2.5 text-text-tertiary tabular-nums">{i + 1}</td>
                <td className="px-4 py-2.5 font-semibold">
                  {(() => {
                    const li = tokenLink(t.addr, t.pairAddress);
                    return li.external ? (
                      <a href={li.href} target="_blank" rel="noopener noreferrer" className="text-text-primary hover:text-brand-teal">{t.symbol} ↗</a>
                    ) : (
                      <Link href={li.href} className="text-text-primary hover:text-brand-teal">{t.symbol}</Link>
                    );
                  })()}
                </td>
                <td className="px-4 py-2.5 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <span className="tabular-nums">{t.volIndex}</span>
                    <VolBar value={t.volIndex} />
                  </div>
                </td>
                <td className="px-4 py-2.5 text-right tabular-nums">{fmtPrice(t.priceUsd)}</td>
                <td
                  className={`px-4 py-2.5 text-right tabular-nums font-medium ${
                    t.h24Pct >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {t.h24Pct >= 0 ? "+" : ""}{t.h24Pct.toFixed(2)}%
                </td>
                <td className="px-4 py-2.5 text-right tabular-nums text-text-secondary">{fmtUsd(t.liquidityUsd)}</td>
                <td className="px-4 py-2.5 text-right tabular-nums text-text-secondary">{fmtUsd(t.volumeH24Usd)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-5 py-3 border-t border-white/40 text-[11px] text-text-tertiary text-right">
        live · refreshes every 60s · powered by DexScreener + GetTokensByTier
      </div>
    </div>
  );
}
