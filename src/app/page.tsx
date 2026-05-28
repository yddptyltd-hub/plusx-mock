"use client";

import React, { useState, useMemo, useEffect } from "react";
import { StatCard } from "@/components/StatCard";
import { FilterChips } from "@/components/FilterChips";
import { PoolTable } from "@/components/PoolTable";
import { copyData } from "@/lib/data";
import { getFavorites } from "@/lib/useFavorites";
import { useLivePools } from "@/lib/useLivePools";
import { LivePool, formatUsd } from "@/lib/livePools";
import { usePriceGraph } from "@/lib/usePriceGraph";

type SortConfig = {
  key: "tvlRaw" | "volume24hRaw" | "ageDays" | "apr30dRaw" | null;
  direction: "asc" | "desc" | null;
};

function formatTime(d: Date): string {
  return d.toLocaleTimeString("en-AU", { hour12: false });
}

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState({ favorites: false, managed: false, solo: false });
  const [favorites, setFavorites] = useState<string[]>([]);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: null });
  const [lastUpdatedDisplay, setLastUpdatedDisplay] = useState<string | null>(null);

  const { pools: livePools, isLive, error } = useLivePools();
  const { data: priceGraph, isLive: workerLive } = usePriceGraph();

  useEffect(() => { setFavorites(getFavorites()); }, []);

  useEffect(() => {
    if (isLive) setLastUpdatedDisplay(formatTime(new Date()));
  }, [isLive, livePools]);

  const refreshFavorites = () => setFavorites(getFavorites());

  const handleSort = (key: SortConfig["key"]) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        if (prev.direction === "desc") return { key, direction: "asc" };
        if (prev.direction === "asc") return { key: null, direction: null };
      }
      return { key, direction: "desc" };
    });
  };

  const livePcts = useMemo(() => {
    if (!livePools.length) return null;
    const active = livePools.filter((p) => !("isClosed" in p && (p as any).isClosed));
    const count = active.length;
    const lpCount = active.reduce((acc, p) => acc + (("liquidityProvidersCount" in p) ? (p as LivePool).liquidityProvidersCount : 0), 0);
    const lpAllTime = active.reduce((acc, p) => acc + (("liquidityProvidersAllTimeCount" in p) ? (p as LivePool).liquidityProvidersAllTimeCount : 0), 0);
    const apr30dValues = active.map((p) => (p as any).apr30dRaw as number).filter((v) => v > 0);
    const avgApr30d = apr30dValues.length ? apr30dValues.reduce((a, b) => a + b, 0) / apr30dValues.length : 0;
    const maxApr = Math.max(...apr30dValues);
    const maxPool = active.find((p) => (p as any).apr30dRaw === maxApr);
    const maxLabel = maxPool ? `${maxPool.pair[0]}/${maxPool.pair[1]}` : "";
    const fundSymbols = new Set(active.map((p) => p.pair[0]));
    // Total TVL: sum of per-pool tvlUsd (raw-reserves × token-price formula)
    const tvlUsdValues = active
      .map((p) => (p as LivePool).tvlUsd)
      .filter((v): v is number => v !== null && v > 0);
    const totalTvlUsd = tvlUsdValues.length ? tvlUsdValues.reduce((a, b) => a + b, 0) : null;
    return { count, lpCount, lpAllTime, avgApr30d, maxApr, maxLabel, fundTokenCount: fundSymbols.size, totalTvlUsd, poolCount: count };
  }, [livePools]);

  const stats = useMemo(() => {
    const s = copyData.headerStats;
    const tvlTooltip = "Sum of TVL across all active LPX pools, computed from on-chain reserves × DexScreener token prices. DAI treated as $1.00 per ecosystem oracle.";
    if (!livePcts || !isLive) return [s.activePools, s.liquidityProviders, s.avgApr30d, { label: "Total TVL", value: "—", subtitle: "loading…", tooltip: tvlTooltip }];

    // Worker is authoritative for pool_count + total_tvl_usd.
    // Fall back to per-pool aggregates only when worker is unavailable or returns 0.
    const workerPoolCount = workerLive && priceGraph && priceGraph.pool_count > 0 ? priceGraph.pool_count : null;
    const workerTvl = workerLive && priceGraph && priceGraph.total_tvl_usd > 0 ? priceGraph.total_tvl_usd : null;

    const displayPoolCount = workerPoolCount ?? livePcts.count;
    const displayTvl = workerTvl ?? livePcts.totalTvlUsd;
    const tvlValue = displayTvl !== null ? formatUsd(displayTvl) : "—";
    const tvlSubtitle = `across ${displayPoolCount} pools${workerLive ? " · live" : ""}`;
    const poolSubtitle = `${workerLive ? "live · " : ""}across ${livePcts.fundTokenCount} fund tokens`;

    return [
      { label: s.activePools.label, value: String(displayPoolCount), subtitle: poolSubtitle, tooltip: s.activePools.tooltip },
      { label: s.liquidityProviders.label, value: livePcts.lpCount.toLocaleString(), subtitle: `${livePcts.lpAllTime.toLocaleString()} all-time`, tooltip: s.liquidityProviders.tooltip },
      { label: s.avgApr30d.label, value: `${livePcts.avgApr30d.toFixed(2)}%`, subtitle: livePcts.maxLabel ? `Max ${livePcts.maxApr.toFixed(2)}% on ${livePcts.maxLabel}` : s.avgApr30d.subtitle, tooltip: s.avgApr30d.tooltip },
      { label: "Total TVL", value: tvlValue, subtitle: tvlSubtitle, tooltip: tvlTooltip },
    ];
  }, [livePcts, isLive, priceGraph, workerLive]);

  const filteredPools = useMemo(() => {
    let pools = [...livePools];
    if (searchQuery) pools = pools.filter((p) => p.pair.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));
    if (activeFilters.favorites) pools = pools.filter((p) => favorites.includes(p.id));
    if (activeFilters.managed) pools = pools.filter((p) => p.managedMode === "Managed");
    if (activeFilters.solo) pools = pools.filter((p) => p.managedMode === "Solo");
    if (sortConfig.key && sortConfig.direction) {
      pools.sort((a: any, b: any) => {
        const valA = a[sortConfig.key!] as number;
        const valB = b[sortConfig.key!] as number;
        return sortConfig.direction === "asc" ? valA - valB : valB - valA;
      });
    }
    return pools;
  }, [livePools, searchQuery, activeFilters, favorites, sortConfig]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-6 lg:py-10">
      <div className="relative mb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <StatCard key={i} label={stat.label} value={stat.value} subtitle={stat.subtitle} tooltipText={stat.tooltip} />
          ))}
        </div>
        <div className="flex justify-end mt-2">
          <span className="text-[11px] text-text-tertiary">
            {lastUpdatedDisplay ? `Live · Last updated ${lastUpdatedDisplay}` : error ? "Offline · showing snapshot" : "Loading live data…"}
          </span>
        </div>
      </div>
      <FilterChips onSearch={setSearchQuery} onFilterChange={setActiveFilters} />
      <PoolTable pools={filteredPools as any} favorites={favorites} onFavoriteToggle={refreshFavorites} sortConfig={sortConfig} onSort={handleSort} />
    </div>
  );
}
