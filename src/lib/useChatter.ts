"use client";
import useSWR from "swr";

const WORKER = "https://plusx-mock-worker.x7t67f8tnq.workers.dev";

export interface ChatterMention {
  source: "reddit" | "nitter";
  title: string;
  text: string;
  url: string;
  author: string;
  timestamp: number;
  engagement?: { score?: number; comments?: number };
}

export interface ChatterState {
  symbol: string;
  mentions: ChatterMention[];
  generatedAt: number;
  sources: { reddit: number; nitter: number; failed: string[] };
}

const fetcher = (url: string) =>
  fetch(url).then((r) => (r.ok ? (r.json() as Promise<ChatterState>) : null));

export function useChatter(symbol: string | null | undefined) {
  return useSWR<ChatterState | null>(
    symbol ? `${WORKER}/api/chatter?symbol=${encodeURIComponent(symbol)}` : null,
    fetcher,
    { refreshInterval: 5 * 60_000, revalidateOnFocus: false }
  );
}
