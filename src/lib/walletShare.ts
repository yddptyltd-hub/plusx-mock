/**
 * walletShare.ts — computes a wallet's share of all LPX TVL.
 *
 * Formula:
 *   walletTvlUsd = sum(fundAmt * fundPrice + anchorAmt * anchorPrice)
 *                  for each active pool the wallet is LP in
 *   globalTvlUsd = same sum across ALL active pools
 *   sharePercent = walletTvlUsd / globalTvlUsd * 100
 *
 * This is "Share of LPX Total" — how much of the entire LPX ecosystem TVL
 * belongs to the wallet's positions (not per-pool share, which is different).
 */

import { loadPriceGraph } from "@/lib/priceGraph";

const WATCHER_BASE = "https://lpx.plusx.app/watcher";

export interface WalletShare {
  walletAddress: string;
  walletPositionsCount: number;
  walletTvlUsd: number;
  globalTvlUsd: number;
  sharePercent: number;
  generatedAt: number;
}

function weiToDecimalLocal(raw: string, decimals: number): number {
  if (!raw || raw === "0") return 0;
  try {
    const big = BigInt(raw);
    const divisor = BigInt(10) ** BigInt(decimals);
    return Number(big / divisor) + Number(big % divisor) / 10 ** decimals;
  } catch {
    return 0;
  }
}

async function fetchPools(forWallet: string, isFilterPortfolio: boolean): Promise<unknown[]> {
  const res = await fetch(`${WATCHER_BASE}/LPXWatcher/SearchLPXs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      request: {
        skip: 0, take: 100, sid: "",
        forWalletAdr: forWallet,
        forToken: "",
        isFilterPorfolio: isFilterPortfolio,
        isFilterManager: false,
        isFilterOnlySolo: false,
      },
    }),
    cache: "no-store",
  });
  if (!res.ok) return [];
  return res.json();
}

type PoolRaw = {
  isClosed: boolean;
  fundToken: { erc20Address: string; decimals: number };
  anchorToken: { erc20Address: string; decimals: number };
  reserves: { fundRaw: string; anchorRaw: string };
};

function computeTvl(
  pools: unknown[],
  tokens: Record<string, { price_usd: number | null }>
): number {
  return (pools as PoolRaw[]).reduce((acc, p) => {
    if (p.isClosed) return acc;
    const fa = p.fundToken.erc20Address.toLowerCase();
    const aa = p.anchorToken.erc20Address.toLowerCase();
    const fp = tokens[fa]?.price_usd ?? null;
    const ap = tokens[aa]?.price_usd ?? null;
    if (fp === null || ap === null) return acc;
    const fundAmt = weiToDecimalLocal(p.reserves.fundRaw, p.fundToken.decimals);
    const ancAmt = weiToDecimalLocal(p.reserves.anchorRaw, p.anchorToken.decimals);
    return acc + fundAmt * fp + ancAmt * ap;
  }, 0);
}

export async function fetchWalletShare(wallet: string): Promise<WalletShare | null> {
  const lowerWallet = wallet.toLowerCase();

  const [graph, walletPools, globalPools] = await Promise.all([
    loadPriceGraph(),
    fetchPools(lowerWallet, true),
    fetchPools("", false),
  ]);

  if (!graph?.tokens) return null;
  const tokens = graph.tokens as Record<string, { price_usd: number | null }>;

  const walletTvlUsd = computeTvl(walletPools, tokens);
  const globalTvlUsd = computeTvl(globalPools, tokens);
  const sharePercent = globalTvlUsd > 0 ? (walletTvlUsd / globalTvlUsd) * 100 : 0;
  const walletPositionsCount = (walletPools as PoolRaw[]).filter((p) => !p.isClosed).length;

  return {
    walletAddress: wallet,
    walletPositionsCount,
    walletTvlUsd,
    globalTvlUsd,
    sharePercent,
    generatedAt: Date.now(),
  };
}
