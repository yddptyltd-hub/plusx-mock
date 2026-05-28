"use client";

/**
 * usePriceGraph — SWR hook for the Cloudflare worker /api/price-graph endpoint.
 *
 * This is the authoritative source for homepage top-tile stats:
 *   - pool_count  → "Active Pools" tile
 *   - total_tvl_usd → "Total TVL" tile
 *
 * pools.json static values are the fallback only when the worker fetch fails
 * or returns total_tvl_usd === 0.
 */

import useSWR from "swr";

const WORKER_URL =
  "https://plusx-mock-worker.x7t67f8tnq.workers.dev/api/price-graph";

export interface PriceGraphSummary {
  pool_count: number;
  total_tvl_usd: number;
  generated_at: string;
}

async function fetchPriceGraph(): Promise<PriceGraphSummary> {
  const res = await fetch(WORKER_URL, { cache: "no-store" });
  if (!res.ok) throw new Error(`price-graph worker responded ${res.status}`);
  const data = await res.json();
  if (!data.total_tvl_usd || !data.pool_count) {
    throw new Error("price-graph: missing pool_count or total_tvl_usd");
  }
  return {
    pool_count: data.pool_count as number,
    total_tvl_usd: data.total_tvl_usd as number,
    generated_at: data.generated_at as string,
  };
}

export function usePriceGraph() {
  const { data, error, isLoading } = useSWR<PriceGraphSummary>(
    "price-graph-summary",
    fetchPriceGraph,
    {
      refreshInterval: 30_000,
      dedupingInterval: 25_000,
      revalidateOnFocus: true,
      shouldRetryOnError: true,
      errorRetryCount: 3,
      errorRetryInterval: 5_000,
    }
  );

  return {
    data: data ?? null,
    isLive: !error && !isLoading && data !== undefined,
    isLoading,
    error: error as Error | undefined,
  };
}
