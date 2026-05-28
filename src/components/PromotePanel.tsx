"use client";
import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useLivePools } from "@/lib/useLivePools";
import type { LivePool } from "@/lib/livePools";
import { useVolatilityTop10 } from "@/lib/useVolatility";
import { useXMentions } from "@/lib/useXMentions";
import { Copy, Check, Megaphone, MessageCircle, ExternalLink, Sparkles } from "lucide-react";
import { InfoTooltip } from "@/components/Tooltip";
import { PromoSnapshot } from "@/components/PromoSnapshot";
import { CofounderKpi } from "@/components/CofounderKpi";

function fmtUsd(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

function timeAgo(unix: number): string {
  const s = Math.floor(Date.now() / 1000) - unix;
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
}

export function PromotePanel() {
  const { pools } = useLivePools();
  const { data: vol } = useVolatilityTop10();
  const { data: xData, error: xErr } = useXMentions();
  const [copied, setCopied] = useState<string | null>(null);

  const stats = useMemo(() => {
    if (!pools) return { count: 0, tvl: 0, managers: 0 };
    const live = pools as LivePool[];
    const mgrs = new Set(live.filter((p) => p.managedMode === "Managed" && p.managerAddress).map((p) => p.managerAddress.toLowerCase()));
    return {
      count: live.length,
      tvl: live.reduce((acc, p) => acc + (p.tvlUsd ?? 0), 0),
      managers: mgrs.size,
    };
  }, [pools]);

  const topMover = vol?.tokens?.[0];
  const [channel, setChannel] = useState<"x" | "telegram">("x");

  const packs: Array<{ id: string; title: string; body: string }> = useMemo(() => {
    if (!topMover) return [];
    const url = "https://plusx-mock.pages.dev";
    const moverPct = `${topMover.h24Pct >= 0 ? "+" : ""}${topMover.h24Pct.toFixed(2)}%`;
    if (channel === "telegram") {
      return [
        { id: "elevator", title: "Elevator pitch (TG)", body: `🟢 *PlusX LPX is live*\n\n• ${stats.count} pools · ${fmtUsd(stats.tvl)} TVL · ${stats.managers} active managers\n• Real on-chain candles, no fabrication\n• Backtest any pair in 5 seconds\n\n👉 ${url}/backtest/` },
        { id: "volpitch", title: "Volatility hook (TG)", body: `🔥 *${topMover.symbol} moved ${moverPct}* in the last 24h on PulseChain.\n\nVolatility Index ${topMover.volIndex}/100 — that's the kind of move LPX captures as fee yield, not just price action.\n\n📊 Full leaderboard: ${url}/volatility/` },
        { id: "hodlvslpx", title: "HODL vs LPX hook (TG)", body: `💡 *Would you have made more HODLing or LP'ing?*\n\nOur simulator runs real on-chain candles and shows the exact difference. Adjust the NTZ band, see when LPX wins vs loses.\n\n🧪 ${url}/hodl-vs-lpx/` },
        { id: "newpair", title: "Custom-pair demo (TG)", body: `🧪 *Backtest LPX on any PulseChain pair*\n\nPaste two token addresses → we pull PulseX candles → you see what LPX would have done.\n\nNo pool needed. Honest accuracy score included.\n\n👉 ${url}/backtest/ (toggle Custom Pair)` },
        { id: "buzzcta", title: "Influencer DM (TG)", body: `Hey 👋 — built a public dashboard for PulseChain LPX:\n\n• Live volatility leaderboard (top 50 PC tokens)\n• HODL vs LPX simulator with accuracy score\n• Backtest engine (any pair)\n• Manager rankings + risk flags\n\nFree, no wallet needed. Quick look: ${url}` },
      ];
    }
    return [
      { id: "elevator", title: "Elevator pitch (under 280 char)", body: `LPX on @PulseChain runs structured liquidity on real candles. ${stats.count} live pools, ${fmtUsd(stats.tvl)} TVL, ${stats.managers} active managers. Backtest any pair in 5s → ${url}/backtest/` },
      { id: "volpitch", title: "Volatility hook", body: `${topMover.symbol} just moved ${moverPct} on PulseChain. LPX would have caught it as fee yield, not just price action.\n\nSee the full volatility leaderboard: ${url}/volatility/` },
      { id: "hodlvslpx", title: "HODL vs LPX hook", body: `Question: would you have made more HODLing PulseChain tokens, or LPing them through LPX?\n\nThe simulator shows the exact dollar difference with an honest accuracy score. Try your own pair: ${url}/hodl-vs-lpx/` },
      { id: "newpair", title: "Custom-pair demo", body: `Want LPX on a pair we don't have a pool for yet? Paste any 2 PulseChain token addresses into our backtest engine → real PulseX candles + accuracy score.\n\n${url}/backtest/  (toggle Custom pair)` },
      { id: "buzzcta", title: "Influencer DM template", body: `Hey - putting together a dashboard for PulseChain LPX positions: real-time volatility leaderboard, HODL vs LPX simulator, full backtest engine, on-chain manager rankings. Free to use, no fluff. ${url} - would love your thoughts.` },
    ];
  }, [topMover, stats, channel]);

  const copy = async (id: string, text: string) => {
    try { await navigator.clipboard.writeText(text); setCopied(id); setTimeout(() => setCopied(null), 1800); } catch { /* noop */ }
  };

  const topX = useMemo(() => {
    if (!xData?.mentions) return [];
    return [...xData.mentions].sort((a, b) => (b.favs + b.retweets * 3) - (a.favs + a.retweets * 3)).slice(0, 10);
  }, [xData]);

  return (
    <div className="space-y-6">
      <CofounderKpi />
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-brand-teal" />
          <h2 className="text-sm font-semibold text-text-primary">Live PulseChain LPX stats - quote anywhere</h2>
          <InfoTooltip contentKey="_inline" text="Real on-chain numbers cofounders can paste into pitches. Always fresh. Manager count excludes Solo mode (where the LP is its own manager)." />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          <Stat label="Active LPX pools" value={stats.count.toString()} />
          <Stat label="Total TVL" value={fmtUsd(stats.tvl)} />
          <Stat label="Managers tracked" value={stats.managers.toString()} />
          <Stat label="Hot mover (24h)" value={topMover ? `${topMover.symbol} ${topMover.h24Pct >= 0 ? "+" : ""}${topMover.h24Pct.toFixed(1)}%` : "..."} />
        </div>
      </div>

      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <Megaphone className="w-4 h-4 text-orange-500" />
          <h2 className="text-sm font-semibold text-text-primary">Copy-pack: tweets / DMs / Telegram pitches</h2>
          <InfoTooltip contentKey="_inline" text="Pre-formatted promo blurbs using LIVE numbers from the site. X mode = plain text. Telegram mode = bold + emojis flavored for TG channels. Click-to-copy or one-tap Tweet/Share." />
          <div className="ml-auto flex items-center gap-1 border border-border rounded-md bg-white p-0.5">
            <button onClick={() => setChannel("x")} className={`px-2.5 py-1 text-[11px] font-semibold rounded ${channel === "x" ? "bg-sky-500 text-white" : "text-text-secondary"}`}>X</button>
            <button onClick={() => setChannel("telegram")} className={`px-2.5 py-1 text-[11px] font-semibold rounded ${channel === "telegram" ? "bg-sky-500 text-white" : "text-text-secondary"}`}>Telegram</button>
          </div>
        </div>
        <div className="space-y-3">
          {packs.map((p) => (
            <div key={p.id} className="border border-border rounded-lg p-3 bg-white/50">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-xs font-semibold text-text-primary uppercase tracking-wide">{p.title}</h3>
                <span className="text-[10px] text-text-tertiary tabular-nums ml-auto">{p.body.length} chars</span>
                <button onClick={() => copy(p.id, p.body)} className="text-[11px] flex items-center gap-1 px-2 py-1 rounded-md border border-border bg-white hover:bg-slate-50">
                  {copied === p.id ? <><Check className="w-3 h-3 text-green-600" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
                </button>
                {channel === "x" ? (
                  <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(p.body)}`} target="_blank" rel="noopener noreferrer" className="text-[11px] flex items-center gap-1 px-2 py-1 rounded-md border border-sky-500/40 bg-sky-500/10 text-sky-700 hover:bg-sky-500/20">
                    <ExternalLink className="w-3 h-3" /> Tweet
                  </a>
                ) : (
                  <a href={`https://t.me/share/url?url=${encodeURIComponent("https://plusx-mock.pages.dev")}&text=${encodeURIComponent(p.body)}`} target="_blank" rel="noopener noreferrer" className="text-[11px] flex items-center gap-1 px-2 py-1 rounded-md border border-sky-500/40 bg-sky-500/10 text-sky-700 hover:bg-sky-500/20">
                    <ExternalLink className="w-3 h-3" /> Share to TG
                  </a>
                )}
              </div>
              <pre className="text-[12px] text-text-primary whitespace-pre-wrap font-sans leading-relaxed">{p.body}</pre>
              <PromoSnapshot title={p.title} body={p.body} />
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <MessageCircle className="w-4 h-4 text-sky-500" />
          <h2 className="text-sm font-semibold text-text-primary">X (Twitter) mentions - top by engagement</h2>
          <InfoTooltip contentKey="_inline" text="Live X mentions of LPX/PlusX/PulseChain. Ranked by favs + 3x retweets. Sourced from an external scraper that writes to our KV under x:mentions:latest. If empty, the scraper hasn't run today (X free API is read-own-tweets only; paid API not used)." />
        </div>
        {xErr || !xData ? (
          <div className="text-text-tertiary text-sm space-y-2">
            <p>
              X mentions pending - external Jules sandbox scraper writes to the KV blob at <code>x:mentions:latest</code>.
              Endpoint <code>/api/x-mentions</code> populates instantly when data lands. No fabrication.
            </p>
            <p>
              <a href="/jules-x-scraper-brief.md" target="_blank" rel="noopener noreferrer" className="text-brand-teal hover:underline inline-flex items-center gap-1">
                <ExternalLink className="w-3 h-3" /> Download Jules brief (copy-paste into a new Jules session to dispatch the scraper)
              </a>
            </p>
          </div>
        ) : topX.length === 0 ? (
          <div className="text-text-tertiary text-sm">No X mentions ingested yet.</div>
        ) : (
          <div className="space-y-2">
            {topX.map((m) => (
              <a key={m.id} href={m.url} target="_blank" rel="noopener noreferrer" className="block p-3 border border-border rounded-lg bg-white/50 hover:bg-white/80 transition-colors">
                <div className="flex items-center gap-2 text-[11px] text-text-tertiary mb-1">
                  <span className="font-bold text-text-primary">@{m.author}</span>
                  <span>·</span>
                  <span>{m.authorFollowers.toLocaleString()} followers</span>
                  <span>·</span>
                  <span>{timeAgo(m.createdUtc)} ago</span>
                  <span className="ml-auto text-sky-600 font-semibold">{m.favs}♥ {m.retweets}↻ {m.replies}💬</span>
                </div>
                <p className="text-[13px] text-text-primary leading-relaxed">{m.text}</p>
                <div className="mt-1 flex items-center gap-2"><ExternalLink className="w-3 h-3 text-text-tertiary" /><span className="text-[10px] text-text-tertiary">View on X</span></div>
              </a>
            ))}
          </div>
        )}
      </div>

      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <h3 className="text-sm font-semibold text-text-primary">Cofounder share-pack URLs</h3>
          <InfoTooltip contentKey="_inline" text="Direct links you can drop into pitches. Each route is shareable and renders fully without wallet connection." />
        </div>
        <ul className="text-sm space-y-1.5">
          <li><Link href="/hodl-vs-lpx/" className="text-brand-teal hover:underline">/hodl-vs-lpx/</Link> - the killer demo: HODL vs LPX with accuracy score</li>
          <li><Link href="/backtest/" className="text-brand-teal hover:underline">/backtest/</Link> - full backtest + NTZ optimizer (Custom pair mode lets you paste any 2 addresses)</li>
          <li><Link href="/volatility/" className="text-brand-teal hover:underline">/volatility/</Link> - live volatility leaderboard, refreshes every 5 min</li>
          <li><Link href="/managers/" className="text-brand-teal hover:underline">/managers/</Link> - manager ranking by composite score</li>
          <li><Link href="/buzz/" className="text-brand-teal hover:underline">/buzz/</Link> - tokens to watch, off-LPX opportunities, risk flags</li>
          <li><Link href="/pulse/" className="text-brand-teal hover:underline">/pulse/</Link> - PulseChain chatter rolling-100</li>
        </ul>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase font-semibold text-text-tertiary mb-0.5">{label}</div>
      <div className="text-lg font-bold tabular-nums text-text-primary">{value}</div>
    </div>
  );
}
