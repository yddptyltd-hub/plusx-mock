/**
 * sanity_pool_math.test.ts — Regression test for token-count-as-dollars bug.
 *
 * Invariant: "$2.7B" (or any > $1B) must NEVER appear for WPLS TVL.
 * Bug: formatTokenAmount(2_680_012_312 WPLS tokens) → "$2.7B".
 * Fix: DexScreener liquidity.usd is the USD source of truth.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// vi.mock factory is hoisted — inline data (cannot reference outer-scope vars)
vi.mock("../src/lib/dexscreener", () => {
  const pair = {
    chainId: "pulsechain",
    pairAddress: "0xe56043671df55de5cdf8459710433c10324de0ae",
    baseToken: { address: "0xa1077a294dde1b09bb078844df40758a5d0f9a27", symbol: "WPLS", name: "Wrapped Pulse" },
    quoteToken: { address: "0xefd766ccb38eaf1dfd701853bfce31359239f305", symbol: "DAI", name: "Dai Stablecoin" },
    priceUsd: "0.00000705",
    liquidity: { usd: 816900.15, base: 57000000000, quote: 408450 },
    volume: { h24: 28500, h6: 7100, h1: 1200, m5: 250 },
    txns: { h24: { buys: 142, sells: 118 } },
    pairCreatedAt: 1680000000000,
    dexId: "pulsex",
  };
  return {
    findPairForLPX: vi.fn().mockResolvedValue(pair),
    fetchDexScreenerPairsForToken: vi.fn().mockResolvedValue([pair]),
  };
});

import { enrichWithDexScreener, type LivePool } from "../src/lib/livePools";

function makeWplsPool(): LivePool {
  return {
    id: "wpls-dai-1", pair: ["WPLS", "DAI"],
    tvl: "—", tvlRaw: 2_680_012_312, tvlUsd: null,
    volume24h: "—", volume24hRaw: 0, volume24hUsd: null,
    fees24hUsd: null, priceUsd: null, pairCreatedAt: null,
    apr30d: "7.0%", apr30dRaw: 7.0,
    managedMode: "Managed", lpxKind: "Custom LPX", lpxNumber: 1,
    ageDays: 0, favorite: false, state: "Active",
    aprAllTime: 11.84, aprAllTimeFormatted: "11.84%",
    liquidityProvidersCount: 12, liquidityProvidersAllTimeCount: 28,
    fundTokenAddress: "0xa1077a294dde1b09bb078844df40758a5d0f9a27",
    anchorTokenAddress: "0xefd766ccb38eaf1dfd701853bfce31359239f305",
    fundDecimals: 18, anchorDecimals: 18,
    fundReserveAmount: 2_680_012_312, anchorReserveAmount: 408_450,
    ntzIndex: 0.0234, profitIndex: 0.005, feeIndex: 0.0028,
    managerRewardIndex: 0, managerAddress: "0x07b2f1ed9b644db28ad7051bef2ba51d443a8b4c",
    poolId: 1,
  };
}

describe("Pool math sanity — token-count-as-dollars regression", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("tvl is USD value after enrichment — not token count", async () => {
    const [enriched] = await enrichWithDexScreener([makeWplsPool()]);
    expect(enriched.tvl).not.toContain("B");
    expect(enriched.tvl).not.toBe("$2.7B");
    expect(enriched.tvlUsd).toBe(816900.15);
    expect(enriched.tvl).toMatch(/^\$\d+/);
    console.log(`[SANITY] tvl: ${enriched.tvl}`);
  });

  it("volume24hUsd is populated from DexScreener", async () => {
    const [enriched] = await enrichWithDexScreener([makeWplsPool()]);
    expect(enriched.volume24hUsd).toBe(28500);
    expect(enriched.volume24h).toMatch(/^\$\d+/);
    console.log(`[SANITY] volume24h: ${enriched.volume24h}`);
  });

  it("fees24hUsd = volume * feeIndex", async () => {
    const [enriched] = await enrichWithDexScreener([makeWplsPool()]);
    expect(enriched.fees24hUsd).toBeCloseTo(28500 * 0.0028, 2);
  });

  it("ageDays derived from pairCreatedAt, not zero", async () => {
    const [enriched] = await enrichWithDexScreener([makeWplsPool()]);
    expect(enriched.ageDays).toBeGreaterThan(0);
    console.log(`[SANITY] ageDays: ${enriched.ageDays}`);
  });
});
