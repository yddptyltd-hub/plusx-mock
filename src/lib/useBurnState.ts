"use client";
import useSWR from "swr";
import { fetchBurnState } from "./burnTracker";

export function useBurnState(
  priceGraph: Record<string, { price_usd: number | null }>
) {
  return useSWR(
    Object.keys(priceGraph).length > 0 ? "burn-state" : null,
    () => fetchBurnState(priceGraph),
    { refreshInterval: 60_000, revalidateOnFocus: false }
  );
}
