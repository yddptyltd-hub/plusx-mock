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

export default function PoolDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [activeTab, setActiveTab] = useState("add-liquidity");

  const pool = poolsData.pools.find((p) => p.id === id);
  const isWpls = id === "wpls-dai-eth";
  const detail = isWpls ? poolsData.wplsDetail : (null as any);

  if (!pool) {
    return (
      <div className="max-w-7xl mx-auto px-12 py-20 text-center">
        <h1 className="text-2xl font-bold">Pool not found</h1>
        <Link href="/" className="text-brand-teal hover:underline mt-4 block">Back to Pools</Link>
      </div>
    );
  }

  // Use values from detail if available, otherwise fallback to pool or placeholders
  const displayApr = detail?.aprSinceInception || pool.apr30d;
  const displayTvl = detail?.tvl || pool.tvl;
  const displayVolume = detail?.volume24h || pool.volume24h;
  const displayFees = detail?.fees24h || "$0.00";
  const displayIl = detail?.impermanentLoss || "0.00%";
  const displayIlRaw = detail?.impermanentLossRaw || 0;

  const myPositionData = detail?.myPosition || {
    shareOfPool: "0.00%",
    fundBalance: "$0.00",
    anchorBalance: "$0.00",
    makerYield7d: "$0.00",
    arbitrageYield7d: "$0.00",
    totalClaimableYield: "$0.00"
  };

  const poolReserves = detail?.poolReserves || {
    fund: { symbol: pool.pair[0], amount: "0", amountUsd: "$0.00" },
    anchor: { symbol: pool.pair[1], amount: "0", amountUsd: "$0.00" }
  };

  const compoundHarvestSettings = detail?.compoundHarvestSettings || {
    compoundPercent: 75,
    harvestPercent: 25,
    autoCompound: true,
    autoHarvest: false
  };

  return (
    <div className="max-w-7xl mx-auto px-12 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-6">
          <Link href="/" className="p-2 hover:bg-slate-100 rounded-full transition-all">
            <ArrowLeft className="w-5 h-5 text-text-secondary" />
          </Link>
          <div className="flex items-center gap-4">
            <PoolIconPair fundSymbol={pool.pair[0]} anchorSymbol={pool.pair[1]} size={40} />
            <h1 className="text-[20px] font-bold text-text-primary">{pool.pair[0]} / {pool.pair[1]}</h1>
            <FavoriteButton id={pool.id} />
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full border border-brand-teal text-[11px] font-bold text-brand-teal">
                #{pool.lpxNumber} {pool.lpxKind}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-managed-badge text-[11px] font-bold text-white flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                {pool.managedMode}
              </span>
              <span className="px-2.5 py-0.5 rounded-full border border-brand-teal text-[11px] font-bold text-brand-teal flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-dot" />
                Active
              </span>
            </div>
          </div>
        </div>
        <Button variant="outline" className="rounded-xl border-2 gap-2 text-text-secondary">
          <Share2 className="w-4 h-4" />
          Share
        </Button>
      </div>

      <div className="bg-[#FFFBEB] border border-amber-100 rounded-xl px-4 py-2 mb-8 flex items-center gap-2">
        <Info className="w-4 h-4 text-amber-600 shrink-0" />
        <p className="text-[12px] text-amber-900 leading-tight">
          {copyData.disclaimer.riskTopBar}
        </p>
      </div>

      <div className="grid grid-cols-5 gap-4 mb-8">
        <DetailStatCard
          label="APR Since Inception"
          value={displayApr}
          icon={<Target className="w-5 h-5" />}
          iconBg="bg-[#EDE9FE]"
          iconColor="#8B5CF6"
          tooltipKey="aprSinceInception"
        />
        <DetailStatCard
          label="TVL"
          value={displayTvl}
          icon={<BarChart3 className="w-5 h-5" />}
          iconBg="bg-[#DBEAFE]"
          iconColor="#3B82F6"
          tooltipKey="totalTvl"
        />
        <DetailStatCard
          label="24H Volume"
          value={displayVolume}
          subValue={detail ? `▲ ${detail.volume24hChangePercent}% vs yesterday` : undefined}
          subValueColor="up"
          icon={<Activity className="w-5 h-5" />}
          iconBg="bg-[#FCE7F3]"
          iconColor="#EC4899"
          tooltipKey="totalPoolVolume"
        />
        <DetailStatCard
          label="Fees (24H)"
          value={displayFees}
          icon={<Wallet className="w-5 h-5" />}
          iconBg="bg-[#DBEAFE]"
          iconColor="#3B82F6"
          tooltipKey="fees24h"
        />
        <DetailStatCard
          label="Impermanent Loss"
          value={displayIl}
          subValue="vs HODL"
          subValueColor={displayIlRaw < 0 ? "down" : "up"}
          icon={<TrendingDown className="w-5 h-5" />}
          iconBg="bg-[#FEF3C7]"
          iconColor="#F59E0B"
          tooltipKey="impermanentLoss"
        />
      </div>

      <div className="grid grid-cols-12 gap-8 mb-8">
        <div className="col-span-5 flex flex-col gap-8">
          <MyPositionPanel data={myPositionData} />
          <CandlestickChart id={pool.id} pair={pool.pair} />
        </div>

        <div className="col-span-7 flex flex-col gap-8">
          <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="flex border-b border-border bg-slate-50">
              <button
                onClick={() => setActiveTab("add-liquidity")}
                className={cn(
                  "px-6 py-4 text-sm font-semibold transition-all border-b-2",
                  activeTab === "add-liquidity"
                    ? "text-text-primary border-brand-teal"
                    : "text-text-secondary border-transparent hover:text-text-primary"
                )}
              >
                Add Liquidity
              </button>
              <button
                onClick={() => setActiveTab("remove-liquidity")}
                className={cn(
                  "px-6 py-4 text-sm font-semibold transition-all border-b-2",
                  activeTab === "remove-liquidity"
                    ? "text-text-primary border-brand-teal"
                    : "text-text-secondary border-transparent hover:text-text-primary"
                )}
              >
                Remove Liquidity
              </button>
              <button
                onClick={() => setActiveTab("price-range")}
                className={cn(
                  "px-6 py-4 text-sm font-semibold transition-all border-b-2",
                  activeTab === "price-range"
                    ? "text-text-primary border-brand-teal"
                    : "text-text-secondary border-transparent hover:text-text-primary"
                )}
              >
                Price Range
              </button>
              <button
                onClick={() => setActiveTab("settings")}
                className={cn(
                  "px-6 py-4 text-sm font-semibold transition-all border-b-2",
                  activeTab === "settings"
                    ? "text-text-primary border-brand-teal"
                    : "text-text-secondary border-transparent hover:text-text-primary"
                )}
              >
                Settings
              </button>
            </div>

            <div className="p-8">
              {activeTab === "add-liquidity" && <AddLiquidityPanel pair={pool.pair} />}
              {activeTab === "remove-liquidity" && (
                <div className="text-center py-12 text-text-secondary">Remove liquidity interface (mock)</div>
              )}
              {activeTab === "price-range" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(detail?.priceRange || {}).map(([key, value]) => (
                      <div key={key} className="p-4 border border-border rounded-xl">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-[11px] font-bold text-text-tertiary uppercase tracking-wider">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                          <Tooltip contentKey={key} />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-mono font-medium text-text-primary truncate mr-2">{value as string}</span>
                          <button className="text-text-tertiary hover:text-brand-teal transition-colors">
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {activeTab === "settings" && (
                <div className="space-y-4">
                  {Object.entries(detail?.ntzBreakdown || {}).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center py-3 border-b border-slate-50 last:border-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm text-text-secondary capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                        <Tooltip contentKey={key} />
                      </div>
                      <span className="text-sm font-bold text-text-primary">{value as string}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white border border-border rounded-2xl p-8 shadow-sm">
            <CompoundHarvestSlider initialSettings={compoundHarvestSettings} />
          </div>

          <PoolReserves reserves={poolReserves} />

          <div className="bg-white border border-border rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-1.5">
                <span className="text-text-secondary">Fund Address</span>
                <Tooltip contentKey="fund" />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-text-primary">
                  {detail?.fund.address.substring(0, 10)}...{detail?.fund.address.substring(34)}
                </span>
                <Copy className="w-3.5 h-3.5 text-text-tertiary cursor-pointer" />
              </div>
            </div>
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-1.5">
                <span className="text-text-secondary">Anchor Address</span>
                <Tooltip contentKey="anchor" />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-text-primary">
                  {detail?.anchor.address.substring(0, 10)}...{detail?.anchor.address.substring(34)}
                </span>
                <Copy className="w-3.5 h-3.5 text-text-tertiary cursor-pointer" />
              </div>
            </div>
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-1.5">
                <span className="text-text-secondary">Manager Wallet</span>
                <Tooltip contentKey="manager" />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-text-primary">
                  {detail?.manager.substring(0, 10)}...{detail?.manager.substring(34)}
                </span>
                <Copy className="w-3.5 h-3.5 text-text-tertiary cursor-pointer" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <RisksAccordion />
    </div>
  );
}
