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
    <tr
      onClick={() => router.push(`/pools/${pool.id}`)}
      className={cn(
        "group cursor-pointer transition-all border-b border-border hover:bg-bg-row-hover",
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
      <td className="px-6 py-4 text-sm font-medium text-text-primary tabular-nums">
        {pool.tvl}
      </td>
      <td className="px-6 py-4 text-sm font-medium text-text-primary tabular-nums">
        {pool.volume24h}
      </td>
      <td className="px-6 py-4 text-sm text-text-secondary tabular-nums">
        {formatAge(pool.ageDays)}
      </td>
      <td className="px-6 py-4 text-sm font-bold text-brand-teal-text tabular-nums">
        {pool.apr30d}
      </td>
      <td className="px-6 py-4">
        <span className="px-2.5 py-0.5 rounded-full border border-brand-teal text-[11px] font-bold text-brand-teal">
          {pool.state}
        </span>
      </td>
    </tr>
  );
}
