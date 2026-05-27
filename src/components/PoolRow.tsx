"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { PoolIconPair } from "@/components/PoolPairIcons";
import { FavoriteButton } from "@/components/FavoriteButton";
import { formatAge } from "@/lib/format";
import { cn } from "@/lib/utils";

interface PoolRowProps {
  pool: {
    id: string;
    pair: string[];
    tvl: string;
    volume24h: string;
    apr30d: string;
    managedMode: string;
    ageDays: number;
    favorite: boolean;
    state: string;
  };
  isFavorited: boolean;
  onFavoriteToggle: () => void;
}

export function PoolRow({ pool, isFavorited, onFavoriteToggle }: PoolRowProps) {
  const router = useRouter();

  return (
    <>
      {/* Desktop table row — hidden below md */}
      <tr
        onClick={() => router.push(`/pools/${pool.id}`)}
        className={cn(
          "group cursor-pointer transition-all border-b border-border hover:bg-bg-row-hover hidden md:table-row",
          isFavorited && "bg-bg-row-favorite border-l-3 border-l-brand-teal"
        )}
      >
        <td className="px-6 py-4">
          <div className="flex items-center gap-3">
            <FavoriteButton id={pool.id} onToggle={onFavoriteToggle} />
            <PoolIconPair fundSymbol={pool.pair[0]} anchorSymbol={pool.pair[1]} />
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-text-primary group-hover:text-brand-teal transition-colors">
                {pool.pair[0]} / {pool.pair[1]}
              </span>
              <span className="text-[11px] text-text-tertiary">{pool.managedMode} LPX</span>
            </div>
          </div>
        </td>
        <td className="px-6 py-4 text-sm font-medium text-text-primary tabular-nums">{pool.tvl}</td>
        <td className="px-6 py-4 text-sm font-medium text-text-primary tabular-nums">{pool.volume24h}</td>
        <td className="px-6 py-4 text-sm text-text-secondary tabular-nums">{formatAge(pool.ageDays)}</td>
        <td className="px-6 py-4 text-sm font-bold text-brand-teal-text tabular-nums">{pool.apr30d}</td>
        <td className="px-6 py-4">
          <span className="px-2.5 py-0.5 rounded-full border border-brand-teal text-[11px] font-bold text-brand-teal">
            {pool.state}
          </span>
        </td>
      </tr>

      {/* Mobile card — visible below md */}
      <tr className="md:hidden border-b border-border">
        <td colSpan={6} className="p-0">
          <div
            onClick={() => router.push(`/pools/${pool.id}`)}
            className={cn(
              "cursor-pointer px-4 py-4 transition-colors active:bg-slate-50",
              isFavorited && "border-l-4 border-l-brand-teal bg-bg-row-favorite"
            )}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FavoriteButton id={pool.id} onToggle={onFavoriteToggle} />
                <PoolIconPair fundSymbol={pool.pair[0]} anchorSymbol={pool.pair[1]} />
                <div className="flex flex-col">
                  <span className="text-[14px] font-semibold text-text-primary">
                    {pool.pair[0]} / {pool.pair[1]}
                  </span>
                  <span className="text-[11px] text-text-tertiary">{pool.managedMode} LPX</span>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full border border-brand-teal text-[11px] font-bold text-brand-teal shrink-0">
                {pool.state}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              <div>
                <p className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wider">TVL</p>
                <p className="text-[13px] font-medium text-text-primary tabular-nums">{pool.tvl}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wider">30D APR</p>
                <p className="text-[13px] font-bold text-brand-teal-text tabular-nums">{pool.apr30d}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wider">Volume (24H)</p>
                <p className="text-[13px] font-medium text-text-primary tabular-nums">{pool.volume24h}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wider">Age</p>
                <p className="text-[13px] text-text-secondary tabular-nums">{formatAge(pool.ageDays)}</p>
              </div>
            </div>
          </div>
        </td>
      </tr>
    </>
  );
}
