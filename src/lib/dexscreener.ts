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

/**
 * DAI bridged from Ethereum — ecosystem oracle pegs this to exactly $1.00.
 * PulseChain DEXes use it as the USD reference. DexScreener may report ~$0.74
 * (illiquid USDC pair) which is irrelevant — the oracle peg is canonical.
 */
export const DAI_ETH_ADDRESS = "0xefd766ccb38eaf1dfd701853bfce31359239f305";

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

/**
 * Return the USD price for a token on PulseChain.
 *
 * Special case: DAI bridged from Ethereum (0xefd766ccb38eaf1dfd701853bfce31359239f305)
 * is the ecosystem oracle reference — always returns exactly 1.0 regardless of
 * DexScreener's reported price (which can be ~$0.74 due to illiquid USDC pairs).
 *
 * For all other tokens: fetch DexScreener pairs for the token, filter to
 * PulseChain, pick the pair with the highest liquidity.usd, and return its
 * priceUsd. Returns null if no pair is found or on any error.
 */
export async function getTokenPriceUsd(tokenAddress: string): Promise<number | null> {
  if (tokenAddress.toLowerCase() === DAI_ETH_ADDRESS.toLowerCase()) {
    return 1.0;
  }
  try {
    const pairs = await fetchDexScreenerPairsForToken(tokenAddress);
    const pulsePairs = pairs.filter((p) => p.chainId === "pulsechain");
    if (pulsePairs.length === 0) return null;
    // Pick highest-liquidity pair as the most reliable price source
    const best = pulsePairs.reduce((a, b) =>
      (a.liquidity?.usd ?? 0) >= (b.liquidity?.usd ?? 0) ? a : b
    );
    const price = parseFloat(best.priceUsd);
    return isNaN(price) ? null : price;
  } catch {
    return null;
  }
}
