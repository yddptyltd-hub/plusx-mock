"use client";

import React from "react";
import { PoolRow } from "@/components/PoolRow";
import { ChevronUp, ChevronDown } from "lucide-react";

interface PoolTableProps {
  pools: any[];
  favorites: string[];
  onFavoriteToggle: () => void;
  sortConfig: { key: string | null; direction: "asc" | "desc" | null };
  onSort: (key: any) => void;
}

export function PoolTable({ pools, favorites, onFavoriteToggle, sortConfig, onSort }: PoolTableProps) {
  return (
    <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm">
      <table className="w-full text-left" id="pool-table">
        <thead>
          <tr className="border-b border-border bg-slate-50">
            <th className="px-6 py-4 text-[13px] font-semibold text-text-secondary">Pool</th>
            <th 
              className="px-6 py-4 text-[13px] font-semibold text-text-secondary cursor-pointer hover:text-text-primary"
              onClick={() => onSort("tvlRaw")}
            >
              <div className="flex items-center gap-1">
                TVL {sortConfig.key === "tvlRaw" && (sortConfig.direction === "desc" ? <ChevronDown className="w-3.5 h-3.5 text-brand-teal" /> : <ChevronUp className="w-3.5 h-3.5 text-brand-teal" />)}
              </div>
            </th>
            <th 
              className="px-6 py-4 text-[13px] font-semibold text-text-secondary cursor-pointer hover:text-text-primary"
              onClick={() => onSort("volume24hRaw")}
            >
              <div className="flex items-center gap-1">
                Volume {sortConfig.key === "volume24hRaw" && (sortConfig.direction === "desc" ? <ChevronDown className="w-3.5 h-3.5 text-brand-teal" /> : <ChevronUp className="w-3.5 h-3.5 text-brand-teal" />)}
              </div>
            </th>
            <th 
              className="px-6 py-4 text-[13px] font-semibold text-text-secondary cursor-pointer hover:text-text-primary"
              onClick={() => onSort("ageDays")}
            >
              <div className="flex items-center gap-1">
                Age {sortConfig.key === "ageDays" && (sortConfig.direction === "desc" ? <ChevronDown className="w-3.5 h-3.5 text-brand-teal" /> : <ChevronUp className="w-3.5 h-3.5 text-brand-teal" />)}
              </div>
            </th>
            <th 
              className="px-6 py-4 text-[13px] font-semibold text-text-secondary cursor-pointer hover:text-text-primary"
              onClick={() => onSort("apr30dRaw")}
            >
              <div className="flex items-center gap-1">
                APR {sortConfig.key === "apr30dRaw" && (sortConfig.direction === "desc" ? <ChevronDown className="w-3.5 h-3.5 text-brand-teal" /> : <ChevronUp className="w-3.5 h-3.5 text-brand-teal" />)}
              </div>
            </th>
            <th className="px-6 py-4 text-[13px] font-semibold text-text-secondary">State</th>
          </tr>
        </thead>
        <tbody>
          {pools.map((pool) => (
            <PoolRow 
              key={pool.id} 
              pool={pool} 
              isFavorited={favorites.includes(pool.id)}
              onFavoriteToggle={onFavoriteToggle}
            />
          ))}
        </tbody>
      </table>
      {pools.length === 0 && (
        <div className="py-12 text-center text-text-secondary">
          No pools found matching your search and filters.
        </div>
      )}
    </div>
  );
}
