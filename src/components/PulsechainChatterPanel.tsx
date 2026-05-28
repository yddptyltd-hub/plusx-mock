"use client";

import React from "react";
import { usePulsechainChatter } from "@/lib/usePulsechainChatter";
import { MessageSquare, ArrowUpCircle, ExternalLink } from "lucide-react";

function timeAgo(unix: number): string {
  const secs = Math.floor(Date.now() / 1000) - unix;
  if (secs < 60) return `${secs}s ago`;
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  return `${Math.floor(secs / 86400)}d ago`;
}

export function PulsechainChatterPanel({ limit }: { limit?: number }) {
  const { data, error, isLoading } = usePulsechainChatter();
  if (isLoading) return <div className="text-text-tertiary text-sm">Loading chatter…</div>;
  if (error || !data) {
    return (
      <div className="text-text-tertiary text-sm">
        Chatter ingest pending (waiting on next hourly cron tick + KV write quota reset).
      </div>
    );
  }
  const items = limit ? data.tokens.slice(0, limit) : data.tokens;
  if (items.length === 0) return <div className="text-text-tertiary text-sm">No matching chatter in last 7d.</div>;

  return (
    <div className="space-y-2">
      {items.map((m) => (
        <a
          key={m.id}
          href={m.url}
          target="_blank"
          rel="noopener noreferrer"
          className="glass-card p-3 flex items-start gap-3 hover:bg-white/60 transition-colors"
        >
          <div className="shrink-0 flex flex-col items-center w-12 text-center">
            <ArrowUpCircle className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-bold tabular-nums text-text-primary">{m.score}</span>
            <span className="text-[10px] text-text-tertiary">score</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-text-primary line-clamp-2">{m.title}</div>
            <div className="mt-1 flex items-center gap-2 text-[11px] text-text-tertiary">
              <span className="font-mono">{m.source}</span>
              <span>·</span>
              <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {m.comments}</span>
              <span>·</span>
              <span>{timeAgo(m.createdUtc)}</span>
            </div>
            {m.matchedKeywords.length > 0 && (
              <div className="mt-1.5 flex flex-wrap gap-1">
                {m.matchedKeywords.slice(0, 5).map((k) => (
                  <span key={k} className="text-[10px] px-1.5 py-0.5 rounded bg-brand-teal/10 text-brand-teal font-mono">
                    {k}
                  </span>
                ))}
              </div>
            )}
          </div>
          <ExternalLink className="w-3 h-3 text-text-tertiary shrink-0 mt-1" />
        </a>
      ))}
    </div>
  );
}
