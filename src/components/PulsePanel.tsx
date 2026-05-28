"use client";
import React, { useMemo, useState } from "react";
import { usePulse } from "@/lib/usePulse";
import { Activity, ExternalLink, MessageSquare, ArrowUpCircle } from "lucide-react";
import { InfoTooltip } from "@/components/Tooltip";

const WINDOWS: Array<{ label: string; secs: number }> = [
  { label: "1h", secs: 3600 },
  { label: "24h", secs: 86400 },
  { label: "7d", secs: 7 * 86400 },
  { label: "All 100", secs: Number.MAX_SAFE_INTEGER },
];

function timeAgo(unix: number): string {
  const s = Math.floor(Date.now() / 1000) - unix;
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
}

export function PulsePanel() {
  const { data, error, isLoading } = usePulse();
  const [window, setWindow] = useState(86400);
  const [sourceFilter, setSourceFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    if (!data) return [];
    const cutoff = Math.floor(Date.now() / 1000) - window;
    return data.posts.filter((p) => {
      if (p.createdUtc < cutoff) return false;
      if (sourceFilter === "reddit" && !p.source.startsWith("r/")) return false;
      if (sourceFilter === "mastodon" && !p.source.startsWith("mastodon")) return false;
      return true;
    });
  }, [data, window, sourceFilter]);

  const summary = useMemo(() => {
    if (!filtered.length) return null;
    const keywordCounts: Record<string, number> = {};
    for (const p of filtered) for (const k of p.matchedKeywords) keywordCounts[k] = (keywordCounts[k] ?? 0) + 1;
    const top = Object.entries(keywordCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
    return { total: filtered.length, top };
  }, [filtered]);

  if (isLoading) return <div className="text-text-tertiary text-sm">Loading PulseChain pulse...</div>;
  if (error || !data) return <div className="text-text-tertiary text-sm">Pulse ingest pending (hourly cron; KV write quota resets daily UTC).</div>;

  return (
    <div className="space-y-4">
      <div className="glass-card p-4 border-l-4 border-brand-teal">
        <div className="flex items-center gap-2 mb-2">
          <Activity className="w-4 h-4 text-brand-teal" />
          <h2 className="text-sm font-semibold text-text-primary flex items-center gap-1.5">Last update {timeAgo(data.ts)} ago<InfoTooltip contentKey="_inline" text="Rolling-100 PulseChain posts. Aggregated hourly from Reddit + Mastodon. Filter by time window and source. Hot keywords show what the community is talking about right now." /></h2>
          <span className="ml-auto text-[11px] text-text-tertiary">{data.posts.length} posts in rolling-100</span>
        </div>
        {summary && (
          <p className="text-sm text-text-secondary">
            Window: <span className="font-semibold">{filtered.length} posts</span> in last {WINDOWS.find((w) => w.secs === window)?.label}.
            {summary.top.length > 0 && <> Hot keywords: {summary.top.map(([k, n]) => <span key={k} className="ml-1 px-1.5 py-0.5 rounded bg-brand-teal/10 text-brand-teal font-mono text-[11px]">{k} ({n})</span>)}.</>}
            {' '}Sources: r/reddit={data.sources.reddit ?? 0}, mastodon={data.sources.mastodon ?? 0}. X (Twitter) deferred (paid API required).
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] uppercase text-text-tertiary font-semibold">Window:</span>
        {WINDOWS.map((w) => (
          <button key={w.label} onClick={() => setWindow(w.secs)} className={`px-3 py-1 text-xs rounded-md border ${window === w.secs ? "bg-brand-teal text-white border-brand-teal" : "bg-white border-border text-text-secondary hover:bg-slate-50"}`}>
            {w.label}
          </button>
        ))}
        <span className="ml-4 text-[11px] uppercase text-text-tertiary font-semibold">Source:</span>
        {(["all", "reddit", "mastodon"] as const).map((s) => (
          <button key={s} onClick={() => setSourceFilter(s)} className={`px-3 py-1 text-xs rounded-md border capitalize ${sourceFilter === s ? "bg-brand-teal text-white border-brand-teal" : "bg-white border-border text-text-secondary hover:bg-slate-50"}`}>
            {s}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-text-tertiary text-sm">No posts in this window.</div>
      ) : (
        <div className="space-y-2">
          {filtered.map((p) => (
            <a key={p.id} href={p.url} target="_blank" rel="noopener noreferrer" className="glass-card p-3 flex items-start gap-3 hover:bg-white/60 transition-colors">
              <div className="shrink-0 flex flex-col items-center w-12 text-center">
                <ArrowUpCircle className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-bold tabular-nums text-text-primary">{p.score}</span>
                <span className="text-[10px] text-text-tertiary">{p.source.startsWith("mastodon") ? "boost" : "score"}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-text-primary line-clamp-2">{p.title}</div>
                <div className="mt-1 flex items-center gap-2 text-[11px] text-text-tertiary">
                  <span className="font-mono">{p.source}</span>
                  <span>-</span>
                  <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" />{p.comments}</span>
                  <span>-</span>
                  <span>{timeAgo(p.createdUtc)} ago</span>
                </div>
                {p.matchedKeywords.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {p.matchedKeywords.slice(0, 5).map((k) => <span key={k} className="text-[10px] px-1.5 py-0.5 rounded bg-brand-teal/10 text-brand-teal font-mono">{k}</span>)}
                  </div>
                )}
              </div>
              <ExternalLink className="w-3 h-3 text-text-tertiary shrink-0 mt-1" />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
