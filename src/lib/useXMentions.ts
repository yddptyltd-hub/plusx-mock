"use client";
import useSWR from "swr";

const WORKER = "https://plusx-mock-worker.x7t67f8tnq.workers.dev";

export interface XMention {
  id: string;
  url: string;
  author: string;
  authorFollowers: number;
  text: string;
  createdUtc: number;
  favs: number;
  retweets: number;
  replies: number;
  views?: number;
  matchedKeywords: string[];
}
export interface XMentionsBlob { ts: number; ingestSource: string; mentions: XMention[]; }

const fetcher = (u: string) => fetch(u).then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); });
export function useXMentions() {
  return useSWR<XMentionsBlob>(`${WORKER}/api/x-mentions`, fetcher, { refreshInterval: 5 * 60_000, revalidateOnFocus: false });
}
