"use client";
import { useMemo } from "react";
import { useLivePools } from "@/lib/useLivePools";
import type { LivePool } from "@/lib/livePools";

interface TokenLinkInfo {
  href: string;
  external: boolean;
}

export function useTokenLink() {
  const { pools } = useLivePools();
  const lpxAddresses = useMemo(() => {
    const set = new Set<string>();
    if (!pools) return set;
    for (const p of pools as LivePool[]) {
      if ("fundTokenAddress" in p && p.fundTokenAddress) set.add(p.fundTokenAddress.toLowerCase());
      if ("anchorTokenAddress" in p && p.anchorTokenAddress) set.add(p.anchorTokenAddress.toLowerCase());
    }
    return set;
  }, [pools]);

  return (addr: string, pairAddress?: string): TokenLinkInfo => {
    const lower = addr.toLowerCase();
    if (lpxAddresses.has(lower)) return { href: `/tokens/${lower}/`, external: false };
    if (pairAddress) return { href: `https://dexscreener.com/pulsechain/${pairAddress}`, external: true };
    return { href: `https://dexscreener.com/pulsechain/${lower}`, external: true };
  };
}
