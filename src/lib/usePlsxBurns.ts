"use client";
import useSWR from "swr";
import { fetchPlsxBurns } from "./plsxBurnTracker";

export function usePlsxBurns(
  windowBlocks: number,
  plsxPriceUsd: number | null
) {
  return useSWR(
    `plsx-burns:${windowBlocks}:${plsxPriceUsd ?? "null"}`,
    () => fetchPlsxBurns(windowBlocks, plsxPriceUsd),
    { refreshInterval: 60_000, revalidateOnFocus: false }
  );
}
