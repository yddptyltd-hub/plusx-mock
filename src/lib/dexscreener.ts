/**
 * dexscreener.ts — USD source-of-truth for TVL/Volume via DexScreener API.
 *
 * Invariant: TVL and Volume shown in the UI are USD values from DexScreener,
 * never raw token counts mislabeled as dollars.
 *
 * CORS-open, free, no-auth required.
 * Docs: https://docs.dexscreener.com/api/reference
 */

const DEXSCREENER_BASE = "https://api.dexscreener.com/latest/dex";

// ─── API response types ───────────────────────────────────────────────────────

export interface DexScreenerPair {
  chainId: string;
  pairAddress: string;
  baseToken: { address: string; symbol: string; name: string };
  quoteToken: { address: string; symbol: string; name: string };
  priceUsd: string;
  liquidity: { usd: number; base: number; quote: number };
  volume: { h24: number; h6: number; h1: number; m5: number };
  txns: { h24: { buys: number; sells: number } };
  pairCreatedAt: number; // unix ms
  dexId: string;
}

interface DexScreenerTokenResponse {
  pairs: DexScreenerPair[] | null;
}

// ─── Fetch helpers ────────────────────────────────────────────────────────────

/**
 * Fetch all DexScreener pairs for a given token address.
 * Returns empty array on any failure (non-throwing — callers degrade gracefully).
 */
export async function fetchDexScreenerPairsForToken(
  tokenAddress: string
): Promise<DexScreenerPair[]> {
  try {
    const res = await fetch(
      `${DEXSCREENER_BASE}/tokens/${encodeURIComponent(tokenAddress)}`,
      { cache: "no-store" }
    );
    if (!res.ok) return [];
    const data: DexScreenerTokenResponse = await res.json();
    return data.pairs ?? [];
  } catch {
    return [];
  }
}

/**
 * For a fund+anchor pair on PulseChain, find the matching DexScreener pair.
 * Matches regardless of which side is base/quote.
 * Returns null if not found or on any error.
 */
export async function findPairForLPX(
  fundAddr: string,
  anchorAddr: string
): Promise<DexScreenerPair | null> {
  const pairs = await fetchDexScreenerPairsForToken(fundAddr);
  const fundLower = fundAddr.toLowerCase();
  const anchorLower = anchorAddr.toLowerCase();

  const match = pairs.find(
    (p) =>
      p.chainId === "pulsechain" &&
      ((p.baseToken.address.toLowerCase() === fundLower &&
        p.quoteToken.address.toLowerCase() === anchorLower) ||
        (p.baseToken.address.toLowerCase() === anchorLower &&
          p.quoteToken.address.toLowerCase() === fundLower))
  );

  return match ?? null;
}
