"use client";

import React, { useMemo } from "react";
import { useVolatilityTop50 } from "@/lib/useVolatility";
import { usePulsechainChatter } from "@/lib/usePulsechainChatter";
import { useLivePools } from "@/lib/useLivePools";
import type { LivePool } from "@/lib/livePools";
import { Flame, TrendingDown, AlertTriangle, Sparkles } from "lucide-react";
import { InfoTooltip } from "@/components/Tooltip";
import { useTokenLink } from "@/lib/tokenLink";
import { fmtPrice } from "@/lib/formatPrice";

function fmtUsd(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(2)}`;
}

export function BuzzPanel() {
  const { data: vol } = useVolatilityTop50();
  const { data: chatter } = usePulsechainChatter();
  const { pools } = useLivePools();
  const tokenLink = useTokenLink();

  const lpxAddresses = useMemo(() => {
    const set = new Set<string>();
    if (!pools) return set;
    for (const p of pools as LivePool[]) {
      if ("fundTokenAddress" in p && p.fundTokenAddress) set.add(p.fundTokenAddress.toLowerCase());
    }
    return set;
  }, [pools]);

  const sections = useMemo(() => {
    const tokens = vol?.tokens ?? [];
    const newOrUnknown = tokens.filter((t) => !lpxAddresses.has(t.addr.toLowerCase()) && t.liquidityUsd >= 3000).slice(0, 8);
    const keepAway = tokens.filter((t) => t.h24Pct <= -10 || t.liquidityUsd < 2000).slice(0, 8);
    const highestTalked = tokens.filter((t) => t.volumeH24Usd >= 500 || t.volIndex >= 70).slice(0, 8);
    return { newOrUnknown, keepAway, highestTalked };
  }, [vol, lpxAddresses]);

  const lpxChatter = useMemo(() => {
    if (!chatter) return [];
    return chatter.tokens.filter((m) =>
      m.matchedKeywords.some((k) => ["LPX", "PlusX", "liquidity", "manager", "solo"].includes(k))
    ).slice(0, 8);
  }, [chatter]);

  return (
    <div className="space-y-6">
      <Section icon={<Sparkles className="w-4 h-4 text-brand-teal" />} title="Highest-Talked Tokens" subtitle="High volatility index or 24h volume">
        {sections.highestTalked.length === 0
          ? <Empty />
          : sections.highestTalked.map((t) => {
              const li = tokenLink(t.addr, t.pairAddress);
              return <TokenRow key={t.addr} li={li} symbol={t.symbol} sub={`Index ${t.volIndex} - Vol ${fmtUsd(t.volumeH24Usd)}`} h24={t.h24Pct} price={t.priceUsd} liq={t.liquidityUsd} />;
            })}
      </Section>

      <Section icon={<Flame className="w-4 h-4 text-orange-500" />} title="Potential New / Off-LPX Tokens" subtitle="Not yet routed through any LPX pool, liq >= 3K">
        {sections.newOrUnknown.length === 0
          ? <Empty />
          : sections.newOrUnknown.map((t) => {
              const li = tokenLink(t.addr, t.pairAddress);
              return <TokenRow key={t.addr} li={li} symbol={t.symbol} sub={`No LPX pool yet - Index ${t.volIndex}`} h24={t.h24Pct} price={t.priceUsd} liq={t.liquidityUsd} />;
            })}
      </Section>

      <Section icon={<TrendingDown className="w-4 h-4 text-red-600" />} title="Keep Away - Risk Flags" subtitle="24h drop >= 10% OR liq < 2K">
        {sections.keepAway.length === 0
          ? <Empty />
          : sections.keepAway.map((t) => {
              const li = tokenLink(t.addr, t.pairAddress);
              const risk = t.liquidityUsd < 2000 ? "thin liquidity" : "sharp 24h drop";
              return <TokenRow key={t.addr} li={li} symbol={t.symbol} sub={`Risk: ${risk}`} h24={t.h24Pct} price={t.priceUsd} liq={t.liquidityUsd} risky />;
            })}
      </Section>

      <Section icon={<AlertTriangle className="w-4 h-4 text-orange-500" />} title="LPX / Manager / Liquidity Chatter" subtitle="Reddit mentions tagged LPX, PlusX, liquidity, manager, solo">
        {lpxChatter.length === 0
          ? <div className="text-text-tertiary text-sm px-1">No LPX-tagged mentions yet (Reddit hydrates hourly; X scraping deferred - paid API required).</div>
          : lpxChatter.map((m) => (
              <a key={m.id} href={m.url} target="_blank" rel="noopener noreferrer" className="glass-card p-3 flex items-start gap-3 hover:bg-white/60 transition-colors block">
                <div className="shrink-0 w-12 text-center">
                  <div className="text-sm font-bold tabular-nums">{m.score}</div>
                  <div className="text-[10px] text-text-tertiary">score</div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-text-primary line-clamp-2">{m.title}</div>
                  <div className="mt-1 text-[11px] text-text-tertiary font-mono">{m.source} - {m.comments} comments</div>
                </div>
              </a>
            ))}
      </Section>
    </div>
  );
}

const SECTION_HELP: Record<string, string> = {
  "Highest-Talked Tokens": "Tokens currently topping the PulseChain volatility leaderboard with meaningful 24h volume. Tap any to see its pools or DexScreener page.",
  "Potential New / Off-LPX Tokens": "Tokens NOT yet routed through any LPX pool. Useful for spotting tokens before they get added to LPX. Liquidity floor of $3K filters out scam tokens.",
  "Keep Away - Risk Flags": "Tokens flagged either by a sharp 24h drop (>=10%) or thin liquidity (<$2K). High risk of further drawdown or rug-pull. The red border marks these for visual triage.",
  "LPX / Manager / Liquidity Chatter": "Reddit posts tagged with LPX, PlusX, liquidity, manager, or solo keywords. Refreshed hourly. X (Twitter) deferred — paid API required.",
};

function Section({ icon, title, subtitle, children }: { icon: React.ReactNode; title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <h2 className="text-sm font-semibold text-text-primary">{title}</h2>
        <InfoTooltip contentKey="_inline" text={SECTION_HELP[title] ?? "Section info."} />
        <span className="text-[11px] text-text-tertiary ml-auto">{subtitle}</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">{children}</div>
    </div>
  );
}

function Empty() { return <div className="text-text-tertiary text-sm px-1">No matches.</div>; }

interface TokenRowProps { li: { href: string; external: boolean }; symbol: string; sub: string; h24: number; price: number; liq: number; risky?: boolean }
function TokenRow({ li, symbol, sub, h24, price, liq, risky }: TokenRowProps) {
  const up = h24 >= 0;
  const inner = (
    <div className="flex items-center gap-3">
      <div className="flex-1 min-w-0">
        <div className="text-sm font-bold text-text-primary truncate">{symbol}{li.external ? " ↗" : ""}</div>
        <div className="text-[11px] text-text-tertiary">{sub}</div>
      </div>
      <div className="text-right shrink-0">
        <div className={`text-sm font-bold tabular-nums ${up ? "text-green-600" : "text-red-600"}`}>{up ? "+" : ""}{h24.toFixed(2)}%</div>
        <div className="text-[10px] text-text-tertiary tabular-nums">{fmtPrice(price)} - liq {fmtUsd(liq)}</div>
      </div>
    </div>
  );
  const cls = `glass-card p-3 hover:bg-white/60 transition-colors block ${risky ? "border-l-4 border-red-500" : ""}`;
  return li.external
    ? <a href={li.href} target="_blank" rel="noopener noreferrer" className={cls}>{inner}</a>
    : <a href={li.href} className={cls}>{inner}</a>;
}
