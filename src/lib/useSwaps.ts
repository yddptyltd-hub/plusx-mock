"use client";
import useSWR from "swr";

const BASE = "https://lpx.plusx.app/watcher";

export interface RawSwap {
  poolId: number;
  timestamp: number;
  direction: "InFund" | "InAnchor";
  fundDeltaRaw: string;
  anchorDeltaRaw: string;
}

const fetcher = (url: string) =>
  fetch(url, { cache: "no-store" }).then((r) =>
    r.ok ? r.json() : Promise.reject(r.status)
  );

export function usePoolSwaps(poolId: number | undefined, take = 200) {
  const { data, error, isLoading } = useSWR<RawSwap[]>(
    poolId !== undefined
      ? `${BASE}/LPXWatcher/GetSwaps?poolId=${poolId}&take=${take}&beforeTimestamp=0&direction=0`
      : null,
    fetcher,
    { refreshInterval: 60_000, revalidateOnFocus: false }
  );
  return { swaps: data ?? [], error, isLoading };
}

export function useAllSwaps(poolIds: number[], takePerPool = 25) {
  const key =
    poolIds.length > 0
      ? `all-swaps-${poolIds.join(",")}-${takePerPool}`
      : null;
  const { data, error, isLoading } = useSWR<RawSwap[]>(
    key,
    async () => {
      const results = await Promise.allSettled(
        poolIds.map((id) =>
          fetch(
            `${BASE}/LPXWatcher/GetSwaps?poolId=${id}&take=${takePerPool}&beforeTimestamp=0&direction=0`,
            { cache: "no-store" }
          )
            .then((r) => (r.ok ? r.json() : []))
            .then((arr) => (Array.isArray(arr) ? (arr as RawSwap[]) : []))
        )
      );
      const merged: RawSwap[] = [];
      for (const r of results) {
        if (r.status === "fulfilled") merged.push(...r.value);
      }
      merged.sort((a, b) => b.timestamp - a.timestamp);
      return merged;
    },
    { refreshInterval: 60_000, revalidateOnFocus: false }
  );
  return { swaps: data ?? [], error, isLoading };
}
