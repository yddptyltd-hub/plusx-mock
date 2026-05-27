"use client";

import React, { useState, useMemo, useEffect } from "react";
import { StatCard } from "@/components/StatCard";
import { FilterChips } from "@/components/FilterChips";
import { PoolTable } from "@/components/PoolTable";
import { poolsData, copyData } from "@/lib/data";
import { generateSparklineData } from "@/lib/mockChartData";
import { getFavorites } from "@/lib/useFavorites";

type SortConfig = {
  key: "tvlRaw" | "volume24hRaw" | "ageDays" | "apr30dRaw" | null;
  direction: "asc" | "desc" | null;
};

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState({ favorites: false, managed: false, solo: false });
  const [favorites, setFavorites] = useState<string[]>([]);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: null });

  useEffect(() => {
    setFavorites(getFavorites());
  }, []);

  const refreshFavorites = () => {
    setFavorites(getFavorites());
  };

  const handleSort = (key: SortConfig["key"]) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        if (prev.direction === "desc") return { key, direction: "asc" };
        if (prev.direction === "asc") return { key: null, direction: null };
      }
      return { key, direction: "desc" };
    });
  };

  const filteredPools = useMemo(() => {
    let pools = [...poolsData.pools];

    if (searchQuery) {
      pools = pools.filter((pool) =>
        pool.pair.some((token) => token.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (activeFilters.favorites) {
      pools = pools.filter((pool) => favorites.includes(pool.id));
    }

    if (activeFilters.managed) {
      pools = pools.filter((pool) => pool.managedMode === "Managed");
    }

    if (activeFilters.solo) {
      pools = pools.filter((pool) => pool.managedMode === "Solo");
    }

    if (sortConfig.key && sortConfig.direction) {
      pools.sort((a: any, b: any) => {
        const valA = a[sortConfig.key!] as number;
        const valB = b[sortConfig.key!] as number;
        if (sortConfig.direction === "asc") return valA - valB;
        return valB - valA;
      });
    }

    return pools;
  }, [searchQuery, activeFilters, favorites, sortConfig]);

  const stats = [
    copyData.headerStats.activePools,
    copyData.headerStats.liquidityProviders,
    copyData.headerStats.avgApr30d,
  ];

  return (
    <div className="max-w-7xl mx-auto px-12 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        {stats.map((stat, i) => (
          <StatCard
            key={i}
            label={stat.label}
            value={stat.value}
            subtitle={stat.subtitle}
            tooltipText={stat.tooltip}
          />
        ))}
      </div>

      <FilterChips onSearch={setSearchQuery} onFilterChange={setActiveFilters} />

      <PoolTable 
        pools={filteredPools} 
        favorites={favorites} 
        onFavoriteToggle={refreshFavorites} 
        sortConfig={sortConfig} 
        onSort={handleSort} 
      />
    </div>
  );
}
