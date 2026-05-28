"use client";
import { usePulseNews } from "@/lib/usePulseNews";
import { ExternalLink, Newspaper } from "lucide-react";

function timeAgo(unix: number): string {
  const s = Math.floor(Date.now() / 1000) - unix;
  if (s < 3600) return `${Math.max(1, Math.floor(s / 60))}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
}

export function PulseNewsCard() {
  const { data, error } = usePulseNews();

  return (
    <section className="glass-card p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Newspaper className="w-4 h-4 text-brand-teal" />
          <h2 className="text-sm font-semibold text-text-primary">PulseChain community news</h2>
        </div>
        <span className="text-[10px] uppercase font-semibold text-text-tertiary">r/PulseChain · refreshed hourly</span>
      </div>

      {error || !data || data.items?.length === 0 ? (
        <div>
          <div className="text-[11px] text-text-tertiary mb-3">
            Live feed warming — direct links to PulseChain sources:
          </div>
          <ul className="space-y-1.5">
            {[
              { label: "r/PulseChain (community)", url: "https://www.reddit.com/r/PulseChain/" },
              { label: "PulseChain official site", url: "https://pulsechain.com/" },
              { label: "@PulseChainCom on X", url: "https://x.com/PulseChainCom" },
              { label: "@HEXcrypto on X", url: "https://x.com/HEXcrypto" },
              { label: "PulseX DEX", url: "https://pulsex.com/" },
              { label: "DexScreener PulseChain", url: "https://dexscreener.com/pulsechain" },
            ].map((s) => (
              <li key={s.url}>
                <a href={s.url} target="_blank" rel="noopener noreferrer"
                   className="group flex items-center gap-2 rounded-md p-1.5 hover:bg-slate-50 text-sm text-text-primary group-hover:text-brand-teal-dark">
                  <ExternalLink className="w-3.5 h-3.5 text-text-tertiary group-hover:text-brand-teal" />
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <ul className="space-y-2">
          {data.items.map((it) => (
            <li key={it.url}>
              <a
                href={it.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start justify-between gap-3 rounded-md p-2 hover:bg-slate-50 transition-colors"
              >
                <div className="min-w-0">
                  <div className="text-sm text-text-primary group-hover:text-brand-teal-dark line-clamp-2">{it.title}</div>
                  <div className="text-[11px] text-text-tertiary tabular-nums mt-0.5">
                    u/{it.author} · {timeAgo(it.publishedUnix)} ago
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-text-tertiary flex-none mt-1 group-hover:text-brand-teal" />
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
