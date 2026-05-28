"use client";
import useSWR from "swr";

const WORKER = "https://plusx-mock-worker.x7t67f8tnq.workers.dev";

export interface PulseNewsItem {
  title: string;
  url: string;
  publishedUnix: number;
  author: string;
  source: "reddit";
}

export interface PulseNewsBlob {
  ts: number;
  items: PulseNewsItem[];
}

const fetcher = async (url: string): Promise<PulseNewsBlob> => {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
};

export function usePulseNews() {
  return useSWR<PulseNewsBlob>(`${WORKER}/api/pulse-news`, fetcher, {
    refreshInterval: 10 * 60_000,
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });
}
