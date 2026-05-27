"use client";

import React, { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Share2, ShieldCheck, Target, BarChart3, Activity, Wallet, TrendingDown, Info, Copy } from "lucide-react";
import { PoolIconPair } from "@/components/PoolPairIcons";
import { FavoriteButton } from "@/components/FavoriteButton";
import { DetailStatCard } from "@/components/DetailStatCard";
import { MyPositionPanel } from "@/components/MyPositionPanel";
import { CandlestickChart } from "@/components/CandlestickChart";
import { AddLiquidityPanel } from "@/components/AddLiquidityPanel";
import { CompoundHarvestSlider } from "@/components/CompoundHarvestSlider";
import { PoolReserves } from "@/components/PoolReserves";
import { RisksAccordion } from "@/components/RisksAccordion";
import { Tooltip } from "@/components/Tooltip";
import { Button } from "@/components/ui/button";
import { poolsData, copyData } from "@/lib/data";
import { cn } from "@/lib/utils";
import { useLivePoolDetail, useLiveCandles } from "@/lib/useLivePools";
import { formatUsd } from "@/lib/livePools";

function formatTime(d: Date): string {
  return d.toLocaleTimeString("en-AU", { hour12: false });
}
function fmtPct(v: number): string { return `${v.toFixed(2)}%`; }
function truncAddr(addr: string): string {
  if (!addr) return "—";
  return `${addr.substring(0, 10)}...${addr.substring(34)}`;
}

export function PoolDetailClient({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [activeTab, setActiveTab] = useState("add-liquidity");
  const [candleInterval, setCandleInterval] = useState("15m");

  const { pool: anyPool, livePool, isLive, lastUpdated } = useLivePoolDetail(id);
  void isLive;
  const staticPool = poolsData.pools.find((p) => p.id === id);
  const pool = anyPool ?? staticPool;
  // wplsDetail applies when this pool is the WPLS/DAI pair (by symbol, not id)
  const isWplsPair = pool?.pair[0]?.toUpperCase() === "WPLS";
  const wplsDetail = isWplsPair ? poolsData.wplsDetail : null;

  const { candles: liveCandles } = useLiveCandles(
    livePool?.fundTokenAddress,
    livePool?.anchorTokenAddress,
    candleInterval
  );

  if (!pool) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-20 text-center">
        <h1 className="text-2xl font-bold">Pool not found</h1>
        <Link href="/" className="text-brand-teal hover:underline mt-4 block">Back to Pools</Link>
      </div>
    );
  }

  const displayApr = livePool ? fmtPct(livePool.aprAllTime) : (wplsDetail?.aprSinceInception ?? pool.apr30d);
  // TVL: DexScreener USD value → static fallback "—" (never show token-count-as-dollars)
  const displayTvl = livePool?.tvlUsd != null
    ? formatUsd(livePool.tvlUsd)
    : (livePool?.tvl ?? "—");
  // Volume: DexScreener USD value → "—" (never show static fabricated $894.6K)
  const displayVolume = livePool?.volume24hUsd != null
    ? formatUsd(livePool.volume24hUsd)
    : "—";
  // Fees: DexScreener-derived (volume × feeIndex) → "—"
  const displayFees = livePool?.fees24hUsd != null
    ? formatUsd(livePool.fees24hUsd)
    : "—";
  // Impermanent Loss: no historical price data → always "—" (never fabricate -2.45%)
  const displayIl = "—";
  const displayIlRaw = 0;

  const myPositionData = wplsDetail?.myPosition ?? {
    shareOfPool: "0.00%", fundBalance: "$0.00", anchorBalance: "$0.00",
    makerYield7d: "$0.00", arbitrageYield7d: "$0.00", totalClaimableYield: "$0.00",
  };

  const poolReserves = livePool
    ? {
        fund: { symbol: livePool.pair[0], amount: livePool.fundReserveAmount.toLocaleString("en-AU", { maximumFractionDigits: 0 }), amountUsd: livePool.tvlUsd != null ? formatUsd(livePool.tvlUsd) : "—" },
        anchor: { symbol: livePool.pair[1], amount: livePool.anchorReserveAmount.toLocaleString("en-AU", { maximumFractionDigits: 0 }), amountUsd: "—" },
      }
    : (wplsDetail?.poolReserves ?? {
        fund: { symbol: pool.pair[0], amount: "0", amountUsd: "$0.00" },
        anchor: { symbol: pool.pair[1], amount: "0", amountUsd: "$0.00" },
      });

  const compoundHarvestSettings = wplsDetail?.compoundHarvestSettings ?? {
    compoundPercent: 75, harvestPercent: 25, autoCompound: true, autoHarvest: false,
  };

  const fundAddress = livePool?.fundTokenAddress ?? wplsDetail?.fund?.address;
  const anchorAddress = livePool?.anchorTokenAddress ?? wplsDetail?.anchor?.address;
  const managerAddress = livePool?.managerAddress ?? wplsDetail?.manager;

  const ntzBreakdown: Record<string, string> = livePool
    ? {
        "NTZ": fmtPct(livePool.ntzIndex * 100),
        "Profit": fmtPct(livePool.profitIndex * 100),
        "Fee": fmtPct(livePool.feeIndex * 100),
        "Manager Reward": fmtPct(livePool.managerRewardIndex * 100),
      }
    : (wplsDetail?.ntzBreakdown
        ? Object.fromEntries(
            Object.entries(wplsDetail.ntzBreakdown)
              .filter(([k]) => !k.endsWith("Raw"))
              .map(([k, v]) => [k, String(v)])
          )
        : {});

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-6 lg:py-8">
      <div className="flex items-start sm:items-center justify-between mb-6 gap-3">
        <div className="flex items-start sm:items-center gap-3 sm:gap-6 flex-wrap">
          <Link href="/" className="p-2 hover:bg-slate-100 rounded-full transition-all shrink-0">
            <ArrowLeft className="w-5 h-5 text-text-secondary" />
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-3">
              <PoolIconPair fundSymbol={pool.pair[0]} anchorSymbol={pool.pair[1]} size={36} />
              <h1 className="text-[18px] sm:text-[20px] font-bold text-text-primary">{pool.pair[0]} / {pool.pair[1]}</h1>
              <FavoriteButton id={pool.id} />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full border border-brand-teal text-[11px] font-bold text-brand-teal">#{pool.lpxNumber} {pool.lpxKind}</span>
              <span className="px-2.5 py-0.5 rounded-full bg-managed-badge text-[11px] font-bold text-white flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />{pool.managedMode}
              </span>
              <span className="px-2.5 py-0.5 rounded-full border border-brand-teal text-[11px] font-bold text-brand-teal flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-dot" />Active
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <Button variant="outline" className="rounded-xl border-2 gap-2 text-text-secondary">
            <Share2 className="w-4 h-4" /><span className="hidden sm:inline">Share</span>
          </Button>
          {lastUpdated && <span className="text-[10px] text-text-tertiary">Live · {formatTime(lastUpdated)}</span>}
        </div>
      </div>

      <div className="bg-[#FFFBEB] border border-amber-100 rounded-xl px-4 py-2 mb-8 flex items-center gap-2">
        <Info className="w-4 h-4 text-amber-600 shrink-0" />
        <p className="text-[12px] text-amber-900 leading-tight">{copyData.disclaimer.riskTopBar}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <DetailStatCard label="APR Since Inception" value={displayApr} icon={<Target className="w-5 h-5" />} iconBg="bg-[#EDE9FE]" iconColor="#8B5CF6" tooltipKey="aprSinceInception" />
        <DetailStatCard label="TVL" value={displayTvl} icon={<BarChart3 className="w-5 h-5" />} iconBg="bg-[#DBEAFE]" iconColor="#3B82F6" tooltipKey="totalTvl" />
        <DetailStatCard label="24H Volume" value={displayVolume} icon={<Activity className="w-5 h-5" />} iconBg="bg-[#FCE7F3]" iconColor="#EC4899" tooltipKey="totalPoolVolume" />
        <DetailStatCard label="Fees (24H)" value={displayFees} icon={<Wallet className="w-5 h-5" />} iconBg="bg-[#DBEAFE]" iconColor="#3B82F6" tooltipKey="fees24h" />
        <DetailStatCard label="Impermanent Loss" value={displayIl} subValue="vs HODL" subValueColor={displayIlRaw < 0 ? "down" : "up"} icon={<TrendingDown className="w-5 h-5" />} iconBg="bg-[#FEF3C7]" iconColor="#F59E0B" tooltipKey="impermanentLoss" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 mb-6 sm:mb-8">
        <div className="lg:col-span-5 flex flex-col gap-6 lg:gap-8">
          <MyPositionPanel data={myPositionData} />
          <div className="w-full overflow-hidden">
            <CandlestickChart
              id={pool.id}
              pair={pool.pair}
              liveCandles={liveCandles.length > 0 ? liveCandles : undefined}
              onIntervalChange={setCandleInterval}
            />
          </div>
        </div>

        <div className="lg:col-span-7 flex flex-col gap-6 lg:gap-8">
          <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="flex border-b border-border bg-slate-50 overflow-x-auto">
              {(["add-liquidity", "remove-liquidity", "price-range", "settings"] as const).map((tab) => {
                const label: Record<string, string> = { "add-liquidity": "Add Liquidity", "remove-liquidity": "Remove", "price-range": "Price Range", "settings": "Settings" };
                return (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    className={cn("px-4 sm:px-6 py-4 text-sm font-semibold transition-all border-b-2 shrink-0",
                      activeTab === tab ? "text-text-primary border-brand-teal" : "text-text-secondary border-transparent hover:text-text-primary"
                    )}>
                    {label[tab]}
                  </button>
                );
              })}
            </div>
            <div className="p-4 sm:p-8">
              {activeTab === "add-liquidity" && <AddLiquidityPanel pair={pool.pair} />}
              {activeTab === "remove-liquidity" && <div className="text-center py-12 text-text-secondary">Remove liquidity interface (mock)</div>}
              {activeTab === "price-range" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(wplsDetail?.priceRange || {}).map(([key, value]) => (
                      <div key={key} className="p-4 border border-border rounded-xl">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-[11px] font-bold text-text-tertiary uppercase tracking-wider">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                          <Tooltip contentKey={key} />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-mono font-medium text-text-primary truncate mr-2">{value as string}</span>
                          <button className="text-text-tertiary hover:text-brand-teal transition-colors"><Copy className="w-3.5 h-3.5" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {activeTab === "settings" && (
                <div className="space-y-4">
                  {Object.entries(ntzBreakdown).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center py-3 border-b border-slate-50 last:border-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm text-text-secondary capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                        <Tooltip contentKey={key} />
                      </div>
                      <span className="text-sm font-bold text-text-primary">{value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white border border-border rounded-2xl p-4 sm:p-8 shadow-sm">
            <CompoundHarvestSlider initialSettings={compoundHarvestSettings} />
          </div>

          <PoolReserves reserves={poolReserves} />

          <div className="bg-white border border-border rounded-2xl p-4 sm:p-6 shadow-sm space-y-4">
            {[
              { label: "Fund Address", tooltipKey: "fund", address: fundAddress },
              { label: "Anchor Address", tooltipKey: "anchor", address: anchorAddress },
              { label: "Manager Wallet", tooltipKey: "manager", address: managerAddress },
            ].map(({ label, tooltipKey, address }) => (
              <div key={label} className="flex justify-between items-center text-sm gap-2">
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-text-secondary">{label}</span>
                  <Tooltip contentKey={tooltipKey} />
                </div>
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-mono text-xs text-text-primary truncate max-w-[140px] sm:max-w-[200px] lg:max-w-none">
                    {address ? truncAddr(address) : "—"}
                  </span>
                  <Copy className="w-3.5 h-3.5 text-text-tertiary cursor-pointer shrink-0" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <RisksAccordion />
    </div>
  );
}
