"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useLivePools } from "@/lib/useLivePools";
import { useBacktest, useBacktestCustom, computeBacktestStats } from "@/lib/useBacktest";
import { BacktestChart } from "@/components/BacktestChart";
import { NtzOptimizer } from "@/components/NtzOptimizer";
import { ArrowDownUp } from "lucide-react";
import { InfoTooltip } from "@/components/Tooltip";
import { fmtPrice } from "@/lib/formatPrice";

const INTERVALS = ["15m", "30m", "1h", "4h", "1d"];
const COUNTS = [24, 72, 168, 336, 720];

export function BacktestPanel() {
  const { pools, isLoading: poolsLoading } = useLivePools();
  const [mode, setMode] = useState<"pool" | "custom">("pool");
  const [poolId, setPoolId] = useState<number | null>(null);
  const [fundAddr, setFundAddr] = useState("");
  const [anchorAddr, setAnchorAddr] = useState("");
  const [interval, setInterval] = useState("1h");
  const [count, setCount] = useState(168);
  const [ntzPct, setNtzPct] = useState(0.5);

  useEffect(() => {
    if (poolId == null && pools && pools.length > 0) setPoolId(pools[0].lpxNumber);
  }, [pools, poolId]);

  const selectedPool = useMemo(() => pools?.find((p) => p.lpxNumber === poolId) ?? null, [pools, poolId]);
  const poolBacktest = useBacktest(mode === "pool" ? poolId : null, interval, count);
  const customBacktest = useBacktestCustom(mode === "custom" ? fundAddr : null, mode === "custom" ? anchorAddr : null, interval, count);
  const data = mode === "pool" ? poolBacktest.data : customBacktest.data;
  const error = mode === "pool" ? poolBacktest.error : customBacktest.error;
  const isLoading = mode === "pool" ? poolBacktest.isLoading : customBacktest.isLoading;

  const swapTokens = () => { setFundAddr(anchorAddr); setAnchorAddr(fundAddr); };

  const candles = data?.candles ?? [];
  const centerPrice = candles.length > 0 ? candles[0].open : 0;
  const bandLow = centerPrice * (1 - ntzPct / 100);
  const bandHigh = centerPrice * (1 + ntzPct / 100);
  const stats = useMemo(() => computeBacktestStats(candles, centerPrice, ntzPct), [candles, centerPrice, ntzPct]);

  return (
    <div className="space-y-4">
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <button onClick={() => setMode("pool")} className={`px-3 py-1.5 text-xs font-semibold rounded-md border ${mode === "pool" ? "bg-brand-teal text-white border-brand-teal" : "bg-white border-border text-text-secondary"}`}>Existing LPX pool</button>
          <button onClick={() => setMode("custom")} className={`px-3 py-1.5 text-xs font-semibold rounded-md border ${mode === "custom" ? "bg-brand-teal text-white border-brand-teal" : "bg-white border-border text-text-secondary"}`}>Custom pair</button>
          <InfoTooltip contentKey="_inline" text="Existing LPX pool = backtest one of the live pools. Custom pair = paste any two PulseChain token addresses; we fetch the PulseX candles directly. Simulates LPX on tokens that don't have a pool yet." />
        </div>
        {mode === "custom" && (
          <div className="mb-4 grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-2 items-end">
            <div>
              <label className="text-[10px] font-semibold uppercase text-text-tertiary mb-1 block">Fund token (volatile)</label>
              <input value={fundAddr} onChange={(e) => setFundAddr(e.target.value.trim())} placeholder="0x... e.g. WPLS" className="w-full px-2 py-1.5 rounded-md border border-border bg-white text-xs font-mono" />
            </div>
            <button onClick={swapTokens} className="self-end mb-1 p-2 rounded-md border border-border bg-white hover:bg-slate-50" title="Swap fund and anchor"><ArrowDownUp className="w-4 h-4 text-text-secondary" /></button>
            <div>
              <label className="text-[10px] font-semibold uppercase text-text-tertiary mb-1 block">Anchor token (stable side)</label>
              <input value={anchorAddr} onChange={(e) => setAnchorAddr(e.target.value.trim())} placeholder="0x... e.g. DAI" className="w-full px-2 py-1.5 rounded-md border border-border bg-white text-xs font-mono" />
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {mode === "pool" && (
          <div>
            <label className="text-[11px] font-semibold uppercase text-text-tertiary mb-1 block">Pool</label>
            {poolsLoading ? (
              <div className="text-sm text-text-tertiary">Loading…</div>
            ) : (
              <select
                value={poolId ?? ""}
                onChange={(e) => setPoolId(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 rounded-lg border border-border bg-white text-sm"
              >
                {pools?.map((p) => (
                  <option key={p.lpxNumber} value={p.lpxNumber}>
                    {p.pair[0]}/{p.pair[1]} #{p.lpxNumber}
                  </option>
                ))}
              </select>
            )}
          </div>
          )}
          <div>
            <label className="text-[11px] font-semibold uppercase text-text-tertiary mb-1 block">Interval</label>
            <select
              value={interval}
              onChange={(e) => setInterval(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-white text-sm"
            >
              {INTERVALS.map((i) => (
                <option key={i} value={i}>{i}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[11px] font-semibold uppercase text-text-tertiary mb-1 block">Lookback ({count} candles)</label>
            <select
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value, 10))}
              className="w-full px-3 py-2 rounded-lg border border-border bg-white text-sm"
            >
              {COUNTS.map((c) => (
                <option key={c} value={c}>{c} candles</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[11px] font-semibold uppercase text-text-tertiary mb-1 block">NTZ Band ± {ntzPct < 1 ? ntzPct.toFixed(2) : ntzPct.toFixed(ntzPct < 10 ? 1 : 0)}%</label>
            <input
              type="range"
              min={0.02}
              max={50}
              step={0.01}
              value={ntzPct}
              onChange={(e) => setNtzPct(parseFloat(e.target.value))}
              className="w-full"
            />
            <input
              type="number"
              min={0.02}
              max={50}
              step={0.01}
              value={ntzPct}
              onChange={(e) => {
                const v = parseFloat(e.target.value);
                if (!Number.isNaN(v) && v >= 0.02 && v <= 50) setNtzPct(v);
              }}
              className="mt-1 w-full px-2 py-1 rounded-md border border-border bg-white text-xs tabular-nums"
            />
          </div>
        </div>
      </div>

      <div className="glass-card p-5">
        {isLoading ? (
          <div className="h-[420px] flex items-center justify-center text-text-tertiary">Loading candles…</div>
        ) : error ? (
          <div className="h-[420px] flex items-center justify-center text-red-600 text-sm">Failed to load candles.</div>
        ) : candles.length === 0 ? (
          <div className="h-[420px] flex items-center justify-center text-text-tertiary">No data.</div>
        ) : (
          <BacktestChart candles={candles} centerPrice={centerPrice} bandLow={bandLow} bandHigh={bandHigh} />
        )}
      </div>

      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-text-primary mb-3">Backtest Stats</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-sm">
          <Stat label="Candles" value={stats.candleCount.toString()} />
          <Stat label="Band exits" value={stats.bandExitCount.toString()} />
          <Stat label="Edge captured" value={`${stats.edgeCapturedPct.toFixed(2)}%`} />
          <Stat label="% time in NTZ" value={`${stats.pctTimeInsideBand.toFixed(1)}%`} />
          <Stat label="Min price" value={`$${fmtPrice(stats.minPrice)}`} />
          <Stat label="Max price" value={`$${fmtPrice(stats.maxPrice)}`} />
        </div>
        {stats.candleCount > 0 && (
          <p className="mt-4 text-[12px] text-text-tertiary leading-relaxed">
            {mode === "pool" && selectedPool && (<>Pool <span className="font-mono">{selectedPool.pair[0]}/{selectedPool.pair[1]} #{selectedPool.lpxNumber}</span>. </>)}
            {mode === "custom" && (<>Custom pair <span className="font-mono">{fundAddr.slice(0, 6)}…/{anchorAddr.slice(0, 6)}…</span>. </>)}
            Entry anchored at first candle open (${fmtPrice(centerPrice)}).
            A position with ± {ntzPct < 1 ? ntzPct.toFixed(2) : ntzPct.toFixed(ntzPct < 10 ? 1 : 0)}% NTZ would have stayed inside its no-trade-zone {stats.pctTimeInsideBand.toFixed(1)}% of the time
            and faced {stats.bandExitCount} rebalance trigger{stats.bandExitCount === 1 ? "" : "s"} (band exits) over the window.
          </p>
        )}
      </div>

      <NtzOptimizer candles={candles} centerPrice={centerPrice} />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase font-semibold text-text-tertiary mb-0.5">{label}</div>
      <div className="font-bold tabular-nums text-text-primary">{value}</div>
    </div>
  );
}
