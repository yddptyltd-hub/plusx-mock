"use client";
import { useVolatilityHistory } from "@/lib/useVolatility";
import { Flame } from "lucide-react";

interface Props {
  address: string;
}

function Sparkline({ points }: { points: { ts: number; volIndex: number }[] }) {
  if (points.length < 2) {
    return (
      <div className="h-14 flex items-center justify-center text-[11px] text-text-tertiary">
        (building history — {points.length} snapshot{points.length === 1 ? "" : "s"})
      </div>
    );
  }
  const xs = points.map((_, i) => (i / (points.length - 1)) * 100);
  const ys = points.map((p) => p.volIndex);
  const max = Math.max(...ys, 1);
  const min = Math.min(...ys, 0);
  const range = max - min || 1;
  const path = xs
    .map((x, i) => `${i === 0 ? "M" : "L"} ${x},${100 - ((ys[i] - min) / range) * 100}`)
    .join(" ");
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-14">
      <path d={path} fill="none" stroke="#f97316" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
      <circle cx={xs[xs.length - 1]} cy={100 - ((ys[ys.length - 1] - min) / range) * 100} r="2" fill="#f97316" />
    </svg>
  );
}

export function VolatilityCard({ address }: Props) {
  const { data, error, isLoading } = useVolatilityHistory(address, "7d");

  if (isLoading) {
    return <div className="glass-card p-5 text-text-tertiary text-sm">Loading volatility…</div>;
  }
  if (error || !data || data.length === 0) {
    return (
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-2">
          <Flame className="w-4 h-4 text-orange-500" />
          <h3 className="text-sm font-semibold text-text-primary">Volatility Index</h3>
        </div>
        <div className="text-text-tertiary text-sm">No recent volatility data for this token.</div>
      </div>
    );
  }

  const latest = data[data.length - 1];
  const earliest = data[0];
  const indexDelta = latest.volIndex - earliest.volIndex;
  const priceDelta = earliest.priceUsd > 0 ? ((latest.priceUsd - earliest.priceUsd) / earliest.priceUsd) * 100 : 0;

  return (
    <div className="glass-card p-5">
      <div className="flex items-center gap-2 mb-3">
        <Flame className="w-4 h-4 text-orange-500" />
        <h3 className="text-sm font-semibold text-text-primary">Volatility Index (7d)</h3>
        <span className="text-[11px] text-text-tertiary ml-auto">{data.length} snapshots</span>
      </div>
      <div className="flex items-end gap-4 mb-3">
        <div>
          <div className="text-3xl font-bold text-text-primary tabular-nums">{latest.volIndex}</div>
          <div className="text-[11px] text-text-tertiary uppercase">current index · 0-100</div>
        </div>
        <div className="ml-auto text-right">
          <div className={`text-sm font-semibold tabular-nums ${indexDelta >= 0 ? "text-orange-600" : "text-text-secondary"}`}>
            {indexDelta >= 0 ? "+" : ""}{indexDelta} pts
          </div>
          <div className="text-[11px] text-text-tertiary">over window</div>
        </div>
      </div>
      <Sparkline points={data} />
      <div className="mt-2 flex items-center justify-between text-[11px] text-text-tertiary">
        <span>Price Δ: <span className={priceDelta >= 0 ? "text-green-600" : "text-red-600"}>{priceDelta >= 0 ? "+" : ""}{priceDelta.toFixed(2)}%</span></span>
        <span>refresh 5m</span>
      </div>
    </div>
  );
}
