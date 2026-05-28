"use client";

import React, { useMemo, useState } from "react";
import { useVolatilityTop10 } from "@/lib/useVolatility";
import { useLivePools } from "@/lib/useLivePools";
import type { LivePool } from "@/lib/livePools";
import { Copy, Check } from "lucide-react";
interface Tweet {
  id: string;
  title: string;
  body: string;
}

function fmtUsd(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

import { fmtPrice } from "@/lib/formatPrice";
import { InfoTooltip } from "@/components/Tooltip";

export function SocialThread() {
  const { data: vol } = useVolatilityTop10();
  const { pools } = useLivePools();
  const [copied, setCopied] = useState<string | null>(null);

  const tweets: Tweet[] = useMemo(() => {
    const out: Tweet[] = [];
    if (!vol || vol.tokens.length === 0) return out;

    const top3 = vol.tokens.slice(0, 3);
    out.push({
      id: "intro",
      title: "1/ PulseChain Volatility — 24h recap",
      body: `Today's most-moved PulseChain tokens:\n\n${top3
        .map((t, i) => `${i + 1}. ${t.symbol} ${t.h24Pct >= 0 ? "+" : ""}${t.h24Pct.toFixed(2)}% (Vol Index ${t.volIndex}/100)`)
        .join("\n")}\n\nFull leaderboard: plusx-mock.pages.dev/volatility/`,
    });

    for (let i = 0; i < Math.min(top3.length, 3); i++) {
      const t = top3[i];
      const dir = t.h24Pct >= 0 ? "+" : "";
      out.push({
        id: `mover-${t.addr}`,
        title: `${i + 2}/ ${t.symbol}`,
        body: `${t.symbol} ${dir}${t.h24Pct.toFixed(2)}% / 24h\nVol Index: ${t.volIndex}/100\nPrice: ${fmtPrice(t.priceUsd)}\nLiq: ${fmtUsd(t.liquidityUsd)}\nVol 24h: ${fmtUsd(t.volumeH24Usd)}`,
      });
    }

    if (pools && pools.length > 0) {
      const livePools = (pools as LivePool[]).filter((p) => typeof p.volume24hRaw === "number");
      const sortedByVol = [...livePools].sort((a, b) => (b.volume24hRaw ?? 0) - (a.volume24hRaw ?? 0)).slice(0, 3);
      if (sortedByVol.length > 0) {
        out.push({
          id: "lpx-volume",
          title: `${out.length + 1}/ Top LPX pools by 24h volume`,
          body: `LPX pools moving the most quote-token volume:\n\n${sortedByVol
            .map((p, i) => `${i + 1}. #${p.lpxNumber} ${p.pair[0]}/${p.pair[1]} — ${p.volume24h}`)
            .join("\n")}\n\nFull list: plusx-mock.pages.dev`,
        });
      }
    }

    out.push({
      id: "outro",
      title: `${out.length + 1}/ Tools`,
      body: `Backtest any LPX pool: plusx-mock.pages.dev/backtest/\nVolatility leaderboard: plusx-mock.pages.dev/volatility/\nStories: plusx-mock.pages.dev/stories/\n\nReal on-chain data. No fabrication. Built for the PlusX community.`,
    });
    return out;
  }, [vol, pools]);

  const copy = async (tw: Tweet) => {
    try {
      await navigator.clipboard.writeText(tw.body);
      setCopied(tw.id);
      setTimeout(() => setCopied((c) => (c === tw.id ? null : c)), 1500);
    } catch { /* ignore */ }
  };

  if (tweets.length === 0) {
    return <div className="text-text-tertiary text-sm">Loading thread…</div>;
  }

  return (
    <div className="space-y-3">
      {tweets.map((tw) => {
        const len = tw.body.length;
        const over = len > 280;
        return (
          <div key={tw.id} className="glass-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-sm font-semibold text-text-primary flex items-center gap-1.5">{tw.title}<InfoTooltip contentKey="_inline" text="Auto-generated tweet from live PulseChain data. Click Copy to grab the text; paste into X / Telegram. The counter on the right tracks against X's 280-character limit." /></h3>
              <span className={`ml-auto text-[10px] tabular-nums ${over ? "text-red-600 font-bold" : "text-text-tertiary"}`}>
                {len} / 280
              </span>
              <button
                onClick={() => copy(tw)}
                className="text-[11px] flex items-center gap-1 px-2 py-1 rounded-md border border-border bg-white hover:bg-slate-50"
              >
                {copied === tw.id ? <><Check className="w-3 h-3 text-green-600" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
              </button>
            </div>
            <pre className="text-[13px] text-text-primary whitespace-pre-wrap font-sans leading-relaxed">{tw.body}</pre>
          </div>
        );
      })}
    </div>
  );
}
