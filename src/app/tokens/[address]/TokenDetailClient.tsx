"use client";

import React, { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Copy, ExternalLink, BarChart3, Layers, Globe, Flame } from "lucide-react";
import { useBurnState } from "@/lib/useBurnState";
import { TokenIcon } from "@/components/PoolPairIcons";
import { DetailStatCard } from "@/components/DetailStatCard";
import { cn } from "@/lib/utils";
import { useLivePools } from "@/lib/useLivePools";
import { formatUsdCompact, formatUsd } from "@/lib/format";
import { fetchDexScreenerPairsForToken, DexScreenerPair } from "@/lib/dexscreener";
import ProOnly, { useMode } from "@/lib/useMode";
import { ChatterFeed } from "@/components/ChatterFeed";
import { VolatilityCard } from "@/components/VolatilityCard";
import { fmtPrice } from "@/lib/formatPrice";
import { LivePool } from "@/lib/livePools";
import { loadPriceGraph } from "@/lib/priceGraph";

interface PriceGraphToken {
  symbol: string;
  decimals: number;
  price_usd: number | null;
  route: string | null;
  hops: number | null;
  liquidity_used_usd: number | null;
}

interface PriceGraph {
  generated_at: string;
  anchor: { address: string; symbol: string; price_usd: number };
  tokens: Record<string, PriceGraphToken>;
  total_tvl_usd: number;
  pool_count: number;
}

function truncAddr(addr: string): string {
  if (!addr) return "—";
  return `${addr.substring(0, 10)}...${addr.substring(addr.length - 8)}`;
}


function fmtPctChange(v: number | undefined): { text: string; up: boolean } {
  if (v == null) return { text: "—", up: true };
  return { text: `${v >= 0 ? "+" : ""}${v.toFixed(2)}%`, up: v >= 0 };
}

export function TokenDetailClient({ params }: { params: Promise<{ address: string }> }) {
  const { address: rawAddress } = use(params);
  const address = rawAddress.toLowerCase();

  // ALL hooks before any early return (React #310)
  const [graph, setGraph] = useState<PriceGraph | null>(null);
  const [graphLoading, setGraphLoading] = useState(true);
  const [dexPairs, setDexPairs] = useState<DexScreenerPair[]>([]);
  const [dexLoading, setDexLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const { pools, isLive } = useLivePools();
  const { mode } = useMode();

  // Burn tracker — only used for uP and uPX token pages
  const priceGraphForBurn = graph?.tokens
    ? Object.fromEntries(
        Object.entries(graph.tokens).map(([k, v]) => [k, { price_usd: v.price_usd }])
      )
    : {};
  const { data: burnData } = useBurnState(priceGraphForBurn);

  const BURN_TARGET_ADDRESSES = new Set([
    "0x664e58570e5835b99d281f12dd14d350315d7e2a", // uPX
    "0x131bf51e864024df1982f2cd7b1c786e1a005152", // uP
  ]);
  const isBurnTarget = BURN_TARGET_ADDRESSES.has(address);

  useEffect(() => {
    loadPriceGraph().then((data) => { setGraph(data as PriceGraph | null); setGraphLoading(false); }).catch(() => setGraphLoading(false));
  }, []);

  useEffect(() => {
    fetchDexScreenerPairsForToken(address).then((pairs) => {
      setDexPairs(pairs);
      setDexLoading(false);
    });
  }, [address]);

  const tokenInfo = graph?.tokens[address] ?? null;
  const lpxPools = pools.filter(
    (p) =>
      ("fundTokenAddress" in p && (p as { fundTokenAddress: string }).fundTokenAddress.toLowerCase() === address) ||
      ("anchorTokenAddress" in p && (p as { anchorTokenAddress: string }).anchorTokenAddress.toLowerCase() === address)
  );
  const pulsePairs = dexPairs
    .filter((p) => p.chainId === "pulsechain")
    .sort((a, b) => (b.liquidity?.usd ?? 0) - (a.liquidity?.usd ?? 0));
  const priceChange24h = (pulsePairs[0] as { priceChange?: { h24?: number } } | undefined)?.priceChange?.h24;
  const { text: changeText, up: changeUp } = fmtPctChange(priceChange24h);
  const lpxTvlUsd = lpxPools.reduce((sum, p) => {
    const tvl = "tvlUsd" in p && typeof (p as { tvlUsd?: number | null }).tvlUsd === "number"
      ? ((p as { tvlUsd: number }).tvlUsd ?? 0) : 0;
    return sum + tvl;
  }, 0);

  // ── Yield rollup ─────────────────────────────────────────────────────────────
  // Only LivePool instances carry yield fields. Static-fallback pools don't.
  const liveLpxPools = lpxPools.filter(
    (p): p is LivePool => "totalYieldAnchor" in p && "anchorTokenAddress" in p
  );

  interface PoolYieldEntry {
    pool: LivePool;
    yieldUsd: number;
    arbUsd: number;
    makerUsd: number;
    anchorPriceUsd: number | null;
  }

  const yieldEntries: PoolYieldEntry[] = liveLpxPools.map((p) => {
    const anchorAddr = p.anchorTokenAddress.toLowerCase();
    const anchorPriceUsd = graph?.tokens?.[anchorAddr]?.price_usd ?? null;
    if (anchorPriceUsd === null) {
      return { pool: p, yieldUsd: 0, arbUsd: 0, makerUsd: 0, anchorPriceUsd: null };
    }
    return {
      pool: p,
      yieldUsd: p.totalYieldAnchor * anchorPriceUsd,
      arbUsd: p.arbYieldAnchor * anchorPriceUsd,
      makerUsd: p.makerYieldAnchor * anchorPriceUsd,
      anchorPriceUsd,
    };
  });

  const hasAnyAnchorPrice = yieldEntries.some((e) => e.anchorPriceUsd !== null);
  const totalYieldUsd = yieldEntries.reduce((s, e) => s + e.yieldUsd, 0);
  const arbYieldUsd = yieldEntries.reduce((s, e) => s + e.arbUsd, 0);
  const makerYieldUsd = yieldEntries.reduce((s, e) => s + e.makerUsd, 0);
  const arbPct = totalYieldUsd > 0 ? (arbYieldUsd / totalYieldUsd) * 100 : 0;
  const makerPct = totalYieldUsd > 0 ? (makerYieldUsd / totalYieldUsd) * 100 : 0;

  // Top 3 pools by USD yield for Pro mode
  const top3YieldPools = [...yieldEntries]
    .filter((e) => e.yieldUsd > 0)
    .sort((a, b) => b.yieldUsd - a.yieldUsd)
    .slice(0, 3);

  // Raw anchor-denomination fallback (when no USD price available)
  // Group by anchor symbol and sum totalYieldAnchor
  const rawAnchorTotals: Record<string, { symbol: string; total: number }> = {};
  if (!hasAnyAnchorPrice && liveLpxPools.length > 0) {
    for (const p of liveLpxPools) {
      const sym = p.pair[1]; // anchor is always pair[1]
      if (!rawAnchorTotals[sym]) rawAnchorTotals[sym] = { symbol: sym, total: 0 };
      rawAnchorTotals[sym].total += p.totalYieldAnchor;
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(address).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  if (graphLoading) {
    return <div className="max-w-5xl mx-auto px-4 py-20 text-center text-text-secondary">Loading token data…</div>;
  }
  if (!tokenInfo) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-text-primary mb-2">Token not found</h1>
        <p className="text-text-secondary mb-4 font-mono text-sm">{address}</p>
        <Link href="/" className="text-brand-teal hover:underline">← Back to Pools</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 lg:px-12 py-6 lg:py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/" className="p-2 hover:bg-slate-100 rounded-full transition-all shrink-0">
          <ArrowLeft className="w-5 h-5 text-text-secondary" />
        </Link>
        <TokenIcon symbol={tokenInfo.symbol} size={36} />
        <div>
          <h1 className="text-[20px] font-bold text-text-primary leading-tight">{tokenInfo.symbol}</h1>
          <p className="text-xs text-text-tertiary">Token</p>
        </div>
      </div>

      <div className="bg-white border border-border rounded-2xl p-5 sm:p-6 shadow-sm mb-6">
        <p className="text-[11px] font-semibold text-text-tertiary uppercase tracking-wider mb-1">Current Price (DAI-anchored)</p>
        <div className="flex items-baseline gap-3 flex-wrap">
          <span className="text-[32px] font-bold text-text-primary leading-tight">{fmtPrice(tokenInfo.price_usd)}</span>
          {priceChange24h != null && (
            <span className={cn("text-sm font-semibold", changeUp ? "text-green-600" : "text-red-500")}>{changeText} (24h)</span>
          )}
        </div>
      </div>

      {isBurnTarget && (
        <div className="flex items-start gap-2 bg-orange-50 border border-orange-200 rounded-2xl px-4 py-3 mb-6">
          <Flame className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
          <p className="text-[12px] text-orange-700 leading-snug">
            This token is bought &amp; burned from LPX trade fees.{" "}
            {burnData ? (
              <>
                Currently{" "}
                <strong>
                  {formatUsd(
                    burnData.holdings
                      .filter((h) => BURN_TARGET_ADDRESSES.has(h.address.toLowerCase()))
                      .reduce((a, h) => a + (h.valueUsd ?? 0), 0)
                  )}
                </strong>{" "}
                pending burn →{" "}
              </>
            ) : null}
            <Link href="/#burn" className="underline font-medium">
              View full burn tracker
            </Link>
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
        <DetailStatCard label="LPX TVL" value={lpxTvlUsd > 0 ? formatUsdCompact(lpxTvlUsd) : "—"} icon={<BarChart3 className="w-5 h-5" />} iconBg="bg-[#DBEAFE]" iconColor="#3B82F6" tooltipKey="totalTvl" />
        <DetailStatCard label="LPX Pools" value={isLive ? String(lpxPools.length) : "…"} icon={<Layers className="w-5 h-5" />} iconBg="bg-[#EDE9FE]" iconColor="#8B5CF6" tooltipKey="aprSinceInception" />
        <DetailStatCard label="PulseChain Pairs" value={dexLoading ? "…" : String(pulsePairs.length)} icon={<Globe className="w-5 h-5" />} iconBg="bg-[#DCFCE7]" iconColor="#16A34A" tooltipKey="totalPoolVolume" />
      </div>

      {/* ── Yield Rollup Card ───────────────────────────────────────────── */}
      <div className="bg-white border border-border rounded-2xl p-5 sm:p-6 shadow-sm mb-6">
        <h2 className="text-xs font-bold text-text-tertiary uppercase tracking-wider mb-4">
          Yield Earned With This Token (since inception)
        </h2>
        {liveLpxPools.length === 0 ? (
          <p className="text-sm text-text-secondary">No LPX pools feature this token yet.</p>
        ) : !hasAnyAnchorPrice ? (
          <div>
            <p className="text-sm text-text-secondary mb-2">USD prices unavailable — raw anchor totals:</p>
            <div className="flex flex-wrap gap-3">
              {Object.values(rawAnchorTotals).map(({ symbol, total }) => (
                <span key={symbol} className="text-sm font-mono text-text-primary">
                  {total.toLocaleString("en-US", { maximumFractionDigits: 2 })} {symbol}
                </span>
              ))}
            </div>
          </div>
        ) : totalYieldUsd === 0 ? (
          <p className="text-sm text-text-secondary">This token&apos;s pools haven&apos;t accrued yield yet.</p>
        ) : (
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-[11px] font-semibold text-text-tertiary uppercase tracking-wider mb-1">Total Yield</p>
                <p className="text-[22px] font-bold text-text-primary leading-tight tabular-nums">{formatUsd(totalYieldUsd)}</p>
                <p className="text-[11px] text-text-tertiary mt-1">across {liveLpxPools.length} pool{liveLpxPools.length !== 1 ? "s" : ""}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-[11px] font-semibold text-text-tertiary uppercase tracking-wider mb-1">Arb Yield</p>
                <p className="text-[22px] font-bold text-text-primary leading-tight tabular-nums">{formatUsd(arbYieldUsd)}</p>
                <p className="text-[11px] text-text-tertiary mt-1">{arbPct.toFixed(0)}% of total</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-[11px] font-semibold text-text-tertiary uppercase tracking-wider mb-1">Maker Yield</p>
                <p className="text-[22px] font-bold text-text-primary leading-tight tabular-nums">{formatUsd(makerYieldUsd)}</p>
                <p className="text-[11px] text-text-tertiary mt-1">{makerPct.toFixed(0)}% of total</p>
              </div>
            </div>
            {mode === "pro" && top3YieldPools.length > 0 && (
              <details className="mt-4 border-t border-border pt-3">
                <summary className="text-xs text-text-tertiary cursor-pointer select-none">Top contributing pools</summary>
                <div className="mt-2 space-y-1">
                  {top3YieldPools.map(({ pool: p, yieldUsd }) => (
                    <Link key={p.id} href={`/pools/${p.id}/`} className="block text-xs text-text-secondary hover:text-brand-teal transition-colors">
                      #{p.poolId} {p.pair[0]}/{p.pair[1]} — {formatUsd(yieldUsd)} ({p.arbPercent.toFixed(0)}% arb)
                    </Link>
                  ))}
                </div>
              </details>
            )}
          </div>
        )}
      </div>

      <div className="bg-white border border-border rounded-2xl shadow-sm mb-6 overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="text-xs font-bold text-text-tertiary uppercase tracking-wider">LPX Pools Featuring {tokenInfo.symbol}</h2>
        </div>
        {!isLive ? (
          <p className="px-5 py-6 text-sm text-text-secondary">Loading pools…</p>
        ) : lpxPools.length === 0 ? (
          <p className="px-5 py-6 text-sm text-text-secondary">No LPX pools found featuring this token.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-border">
                  <th className="px-5 py-3 text-left text-[11px] font-semibold text-text-secondary">Pool</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold text-text-secondary">Side</th>
                  <th className="px-5 py-3 text-right text-[11px] font-semibold text-text-secondary">TVL</th>
                  <th className="px-5 py-3 text-right text-[11px] font-semibold text-text-secondary">APR</th>
                  <th className="px-5 py-3 text-center text-[11px] font-semibold text-text-secondary">Action</th>
                </tr>
              </thead>
              <tbody>
                {lpxPools.map((p) => {
                  const lp = p as { id: string; pair: [string, string]; tvlUsd?: number | null; tvl?: string; apr30d: string; fundTokenAddress?: string };
                  const isFund = "fundTokenAddress" in p && (p as { fundTokenAddress: string }).fundTokenAddress.toLowerCase() === address;
                  const tvlDisplay = lp.tvlUsd != null ? formatUsd(lp.tvlUsd) : (lp.tvl ?? "—");
                  const side = isFund ? "Fund" : "Anchor";
                  return (
                    <tr key={lp.id} className="border-b border-border last:border-0 hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3 font-medium text-text-primary">{lp.pair[0]} / {lp.pair[1]}</td>
                      <td className="px-5 py-3">
                        <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold", side === "Fund" ? "bg-[#DBEAFE] text-blue-700" : "bg-[#DCFCE7] text-green-700")}>{side}</span>
                      </td>
                      <td className="px-5 py-3 text-right font-mono text-text-primary tabular-nums">{tvlDisplay}</td>
                      <td className="px-5 py-3 text-right font-bold text-brand-teal-text tabular-nums">{lp.apr30d}</td>
                      <td className="px-5 py-3 text-center">
                        <Link href={`/pools/${lp.id}/`} className="text-brand-teal hover:underline text-xs font-semibold">View →</Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ProOnly>
        {tokenInfo.route && (
          <div className="bg-white border border-border rounded-2xl p-5 sm:p-6 shadow-sm mb-6">
            <h2 className="text-xs font-bold text-text-tertiary uppercase tracking-wider mb-3">Price Source (DAI-anchored)</h2>
            <p className="text-sm text-text-secondary leading-relaxed">{tokenInfo.route}</p>
            {tokenInfo.hops != null && <p className="text-[11px] text-text-tertiary mt-1">{tokenInfo.hops} hop{tokenInfo.hops !== 1 ? "s" : ""} from DAI</p>}
          </div>
        )}

        <div className="bg-white border border-border rounded-2xl shadow-sm mb-6 overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-xs font-bold text-text-tertiary uppercase tracking-wider">PulseChain Pairs (DexScreener)</h2>
          </div>
          {dexLoading ? (
            <p className="px-5 py-6 text-sm text-text-secondary">Loading DexScreener pairs…</p>
          ) : pulsePairs.length === 0 ? (
            <p className="px-5 py-6 text-sm text-text-secondary">DexScreener returned no PulseChain pairs for this token.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-border">
                    <th className="px-5 py-3 text-left text-[11px] font-semibold text-text-secondary">DEX</th>
                    <th className="px-5 py-3 text-left text-[11px] font-semibold text-text-secondary">Pair</th>
                    <th className="px-5 py-3 text-right text-[11px] font-semibold text-text-secondary">Price USD</th>
                    <th className="px-5 py-3 text-right text-[11px] font-semibold text-text-secondary">Liquidity</th>
                    <th className="px-5 py-3 text-right text-[11px] font-semibold text-text-secondary">24h Vol</th>
                  </tr>
                </thead>
                <tbody>
                  {pulsePairs.map((pair) => (
                    <tr key={pair.pairAddress} className="border-b border-border last:border-0 hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3 text-text-secondary text-[12px]">{pair.dexId}</td>
                      <td className="px-5 py-3 font-medium text-text-primary">{pair.baseToken.symbol}/{pair.quoteToken.symbol}</td>
                      <td className="px-5 py-3 text-right font-mono tabular-nums text-text-primary">{pair.priceUsd ? fmtPrice(parseFloat(pair.priceUsd)) : "—"}</td>
                      <td className="px-5 py-3 text-right font-mono tabular-nums text-text-secondary">{pair.liquidity?.usd != null ? formatUsdCompact(pair.liquidity.usd) : "—"}</td>
                      <td className="px-5 py-3 text-right font-mono tabular-nums text-text-secondary">{pair.volume?.h24 != null ? formatUsdCompact(pair.volume.h24) : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="bg-white border border-border rounded-2xl p-5 sm:p-6 shadow-sm mb-6">
          <h2 className="text-xs font-bold text-text-tertiary uppercase tracking-wider mb-4">On-Chain</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-text-secondary shrink-0">Contract</span>
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-mono text-xs text-text-primary truncate">{truncAddr(address)}</span>
                <button onClick={handleCopy} title="Copy address" className="text-text-tertiary hover:text-brand-teal transition-colors shrink-0"><Copy className="w-3.5 h-3.5" /></button>
                {copied && <span className="text-[10px] text-green-600 shrink-0">Copied!</span>}
                <a href={`https://scan.pulsechain.com/address/${address}`} target="_blank" rel="noopener noreferrer" className="text-text-tertiary hover:text-blue-600 transition-colors shrink-0" title="View on PulseChain Scan"><ExternalLink className="w-3.5 h-3.5" /></a>
              </div>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-text-secondary shrink-0">Decimals</span>
              <span className="font-mono text-sm text-text-primary">{tokenInfo.decimals}</span>
            </div>
            {tokenInfo.liquidity_used_usd != null && (
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-text-secondary shrink-0">Liquidity used for price</span>
                <span className="font-mono text-sm text-text-primary">{formatUsdCompact(tokenInfo.liquidity_used_usd)}</span>
              </div>
            )}
          </div>
        </div>

        <VolatilityCard address={address} />
        <ChatterFeed symbol={tokenInfo?.symbol} />
      </ProOnly>
    </div>
  );
}
