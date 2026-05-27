"use client";

import useSWR from "swr";
import { fetchLivePoolsEnriched, fetchPoolCandles, LivePool, Candle } from "./livePools";
import staticPools from "@/data/pools.json";

type StaticPool = (typeof staticPools.pools)[number];
export type AnyPool = LivePool | StaticPool;

export function useLivePools() {
  const { data, error, isLoading, isValidating } = useSWR<LivePool[]>(
    "live-pools",
    fetchLivePoolsEnriched,
    {
      refreshInterval: 60_000,
      dedupingInterval: 30_000,
      revalidateOnFocus: true,
      shouldRetryOnError: true,
      errorRetryCount: 3,
      errorRetryInterval: 5_000,
    }
  );

  return {
    // Live data is always unique (poolId-suffixed ids). Static fallback when API down.
    pools: (data ?? staticPools.pools) as AnyPool[],
    isLive: !error && !isLoading && data !== undefined,
    isLoading: isLoading || isValidating,
    error: error as Error | undefined,
    lastUpdated: !error && !isLoading && data !== undefined ? new Date() : null,
  };
}

export function useLivePoolDetail(id: string) {
  const { pools, isLive, lastUpdated } = useLivePools();
  const pool = pools.find((p) => p.id === id) ?? null;
  const livePool =
    isLive && pool && "poolId" in pool ? (pool as LivePool) : null;
  return { pool, livePool, isLive, lastUpdated };
}

export function useLiveCandles(
  fundAddr: string | undefined,
  anchorAddr: string | undefined,
  interval = "15m"
) {
  const key =
    fundAddr && anchorAddr
      ? `candles-${fundAddr}-${anchorAddr}-${interval}`
      : null;

  const { data, error } = useSWR<Candle[]>(
    key,
    () => fetchPoolCandles(fundAddr!, anchorAddr!, interval, 100),
    {
      refreshInterval: 120_000,
      dedupingInterval: 60_000,
      revalidateOnFocus: false,
      shouldRetryOnError: true,
      errorRetryCount: 2,
    }
  );

  return {
    candles: data ?? [],
    isLive: !error && data !== undefined,
    error: error as Error | undefined,
  };
}
