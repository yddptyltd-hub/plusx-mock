"use client";
import useSWR from "swr";
import type { ChatterMention } from "@/lib/usePulsechainChatter";

const WORKER = "https://plusx-mock-worker.x7t67f8tnq.workers.dev";

export interface PulseData {
  ts: number;
  posts: ChatterMention[];
  sources: Record<string, number>;
}

const fetcher = (u: string) => fetch(u).then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); });

export function usePulse() {
  return useSWR<PulseData>(`${WORKER}/api/pulse`, fetcher, { refreshInterval: 5 * 60_000, revalidateOnFocus: false });
}
