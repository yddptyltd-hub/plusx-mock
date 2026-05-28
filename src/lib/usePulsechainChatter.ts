"use client";
import useSWR from "swr";

const WORKER = "https://plusx-mock-worker.x7t67f8tnq.workers.dev";

export interface ChatterMention {
  id: string;
  title: string;
  source: string;
  url: string;
  score: number;
  comments: number;
  rankScore: number;
  createdUtc: number;
  matchedKeywords: string[];
}

export interface PulsechainChatter {
  ts: number;
  tokens: ChatterMention[];
}

const fetcher = (u: string) =>
  fetch(u).then((r) => {
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json();
  });

export function usePulsechainChatter() {
  return useSWR<PulsechainChatter>(`${WORKER}/api/chatter/pulsechain`, fetcher, {
    refreshInterval: 5 * 60_000,
    revalidateOnFocus: false,
  });
}
