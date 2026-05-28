"use client";
import useSWR from "swr";

const WORKER = "https://plusx-mock-worker.x7t67f8tnq.workers.dev";

export interface VolToken {
  addr: string;
  symbol: string;
  ts: number;
  priceUsd: number;
  h1Pct: number;
  h6Pct: number;
  h24Pct: number;
  liquidityUsd: number;
  volumeH24Usd: number;
  primaryDex: string;
  pairAddress: string;
  rawVolScore: number;
  volIndex: number;
}

export interface VolLeaderboard {
  ts: number;
  tokens: VolToken[];
}

export interface VolHistoryPoint {
  ts: number;
  volIndex: number;
  priceUsd: number;
  h24Pct: number;
}

const fetcher = (url: string) =>
  fetch(url).then((r) => (r.ok ? r.json() : Promise.reject(r.status)));

export function useVolatilityTop10() {
  return useSWR<VolLeaderboard>(`${WORKER}/api/volatility/top10`, fetcher, {
    refreshInterval: 60_000,
    revalidateOnFocus: false,
  });
}

export function useVolatilityTop50() {
  return useSWR<VolLeaderboard>(`${WORKER}/api/volatility/top50`, fetcher, {
    refreshInterval: 60_000,
    revalidateOnFocus: false,
  });
}

export function useVolatilityHistory(
  addr: string | null | undefined,
  range: "1h" | "6h" | "24h" | "7d" | "30d" = "24h"
) {
  return useSWR<VolHistoryPoint[]>(
    addr ? `${WORKER}/api/volatility/${addr.toLowerCase()}/history?range=${range}` : null,
    fetcher,
    { refreshInterval: 5 * 60_000, revalidateOnFocus: false }
  );
}
