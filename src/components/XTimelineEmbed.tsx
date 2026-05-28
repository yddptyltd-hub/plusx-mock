"use client";
import { useEffect, useRef } from "react";

const WATCHED_HANDLES = ["PulseChainCom", "HEXcrypto"];

export function XTimelineEmbed() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const id = "twitter-wjs";
    if (!document.getElementById(id)) {
      const s = document.createElement("script");
      s.id = id;
      s.async = true;
      s.src = "https://platform.twitter.com/widgets.js";
      s.charset = "utf-8";
      document.body.appendChild(s);
    } else {
      const tw = (window as unknown as { twttr?: { widgets?: { load: (el?: HTMLElement) => void } } }).twttr;
      if (tw?.widgets?.load && ref.current) tw.widgets.load(ref.current);
    }
  }, []);

  return (
    <section className="glass-card p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-text-primary">Live X timelines — PulseChain accounts</h2>
        <span className="text-[10px] uppercase font-semibold text-text-tertiary">embed via x.com — no scraping</span>
      </div>
      <p className="text-[12px] text-text-tertiary mb-4 leading-relaxed">
        X killed guest-flow scraping in May 2026 (verified across 6 tools — see <code className="font-mono">scripts/x_ingest/RESEARCH.md</code> in this repo).
        Showing real X timelines via the official embed widget instead. Add or swap handles by editing
        <code className="font-mono"> WATCHED_HANDLES</code> in <code className="font-mono">XTimelineEmbed.tsx</code>.
      </p>
      <div ref={ref} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {WATCHED_HANDLES.map((h) => (
          <div key={h} className="rounded-xl border border-border bg-white overflow-hidden">
            <div className="px-3 py-2 border-b border-border text-xs font-semibold text-text-secondary bg-slate-50">@{h}</div>
            <a className="twitter-timeline" data-height="500" data-theme="light" data-chrome="noheader nofooter noborders" href={`https://twitter.com/${h}`}>
              Tweets by @{h}
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}
