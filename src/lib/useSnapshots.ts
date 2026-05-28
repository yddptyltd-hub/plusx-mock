"use client";

import useSWR from "swr";

const WORKER_BASE = "https://plusx-mock-worker.x7t67f8tnq.workers.dev";

export interface Snapshot {
  poolId: number;
  ts: number;
  fundReserveRaw: string;
  anchorReserveRaw: string;
  apr30d: number;
  aprAllTime: number;
  liquidityProvidersCount: number;
  liquidityProvidersAllTimeCount: number;
  candleOpen: number;
  candleClose: number;
  candleHigh: number;
  candleLow: number;
  idxBuyPer100Usd: number;
  swapCount15min: number;
  swapVolumeFundRaw: string;
  swapVolumeAnchorRaw: string;
  uniqueWallets15min: number;
  biggestSwap: {
    hash: string;
    fromAddr: string;
    fundAmountRaw: string;
    anchorAmountRaw: string;
    side: "buy" | "sell";
  } | null;
}

const fetcher = (url: string) =>
  fetch(url).then((r) => (r.ok ? r.json() : Promise.reject(r.status)));

export function useSnapshots(
  poolId: number | undefined,
  range: "1h" | "24h" | "7d" | "30d" = "24h"
) {
  const { data, error, isLoading } = useSWR<Snapshot[]>(
    poolId !== undefined
      ? `${WORKER_BASE}/api/snapshots/${poolId}?range=${range}`
      : null,
    fetcher,
    { refreshInterval: 60_000, revalidateOnFocus: false }
  );
  return { snapshots: data ?? [], error, isLoading };
}

export function useLatestSnapshot(poolId: number | undefined) {
  const { data, error, isLoading } = useSWR<Snapshot>(
    poolId !== undefined
      ? `${WORKER_BASE}/api/snapshots/${poolId}/latest`
      : null,
    fetcher,
    { refreshInterval: 60_000 }
  );
  return { latest: data, error, isLoading };
}
