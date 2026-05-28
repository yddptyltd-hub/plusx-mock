"use client";

import React, { useState } from "react";
import { useChatter, ChatterMention } from "@/lib/useChatter";
import { ExternalLink } from "lucide-react";

function timeAgo(ts: number): string {
  const diff = Math.floor(Date.now() / 1000) - ts;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function SourceBadge({ source }: { source: "reddit" | "nitter" }) {
  if (source === "reddit") {
    return (
      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-700">
        Reddit
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700">
      Twitter
    </span>
  );
}

function MentionRow({ mention }: { mention: ChatterMention }) {
  return (
    <div className="py-3 border-b border-border last:border-0">
      <div className="flex items-center gap-2 mb-1">
        <SourceBadge source={mention.source} />
        <span className="text-[11px] text-text-tertiary">{timeAgo(mention.timestamp)}</span>
        <span className="text-[11px] text-text-tertiary">·</span>
        <span className="text-[11px] text-text-tertiary truncate max-w-[120px]">{mention.author}</span>
      </div>
      <a
        href={mention.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-start gap-1 group"
      >
        <span className="text-sm font-medium text-text-primary group-hover:text-brand-teal transition-colors leading-snug line-clamp-2">
          {mention.title}
        </span>
        <ExternalLink className="w-3 h-3 text-text-tertiary group-hover:text-brand-teal transition-colors mt-0.5 shrink-0" />
      </a>
      {mention.text && mention.text !== mention.title && (
        <p className="text-[12px] text-text-secondary mt-1 line-clamp-2 leading-snug">{mention.text}</p>
      )}
      {mention.source === "reddit" && mention.engagement && (
        <p className="text-[11px] text-text-tertiary mt-1">
          ↑ {mention.engagement.score ?? 0} · 💬 {mention.engagement.comments ?? 0}
        </p>
      )}
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="py-3 border-b border-border last:border-0 animate-pulse">
      <div className="flex items-center gap-2 mb-2">
        <div className="h-4 w-12 bg-slate-200 rounded" />
        <div className="h-3 w-16 bg-slate-100 rounded" />
      </div>
      <div className="h-4 w-3/4 bg-slate-200 rounded mb-1" />
      <div className="h-3 w-1/2 bg-slate-100 rounded" />
    </div>
  );
}

interface ChatterFeedProps {
  symbol: string | null | undefined;
}

export function ChatterFeed({ symbol }: ChatterFeedProps) {
  const { data, isLoading, error } = useChatter(symbol);
  const [expanded, setExpanded] = useState(false);

  const VISIBLE = 10;

  if (!symbol) return null;

  return (
    <div className="bg-white border border-border rounded-2xl p-5 sm:p-6 shadow-sm mb-6">
      <div className="flex items-baseline justify-between mb-1">
        <h2 className="text-xs font-bold text-text-tertiary uppercase tracking-wider">Recent Mentions</h2>
        <span className="text-[10px] text-text-tertiary">from Reddit + Nitter, refreshes hourly</span>
      </div>

      {isLoading && (
        <div className="mt-3">
          {[0, 1, 2].map((i) => <SkeletonRow key={i} />)}
        </div>
      )}

      {error && !isLoading && (
        <p className="text-sm text-text-secondary mt-3">Mention feed temporarily unavailable.</p>
      )}

      {!isLoading && !error && data !== undefined && (
        <>
          {data === null || data.mentions.length === 0 ? (
            <p className="text-sm text-text-secondary mt-3">
              {data === null ? "Mention feed temporarily unavailable." : "No recent mentions in the last week."}
            </p>
          ) : (
            <>
              <div className="mt-2">
                {(expanded ? data.mentions : data.mentions.slice(0, VISIBLE)).map((m, i) => (
                  <MentionRow key={`${m.url}-${i}`} mention={m} />
                ))}
              </div>
              {data.mentions.length > VISIBLE && (
                <button
                  onClick={() => setExpanded((e) => !e)}
                  className="mt-3 text-xs text-brand-teal hover:underline font-semibold"
                >
                  {expanded ? "Show less" : `+ ${data.mentions.length - VISIBLE} more`}
                </button>
              )}
              {data.sources.failed.length > 0 && (
                <p className="text-[10px] text-text-tertiary mt-2">
                  {data.sources.failed.join(", ")} unavailable this cycle
                </p>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
