/**
 * sanity_pool_math.test.ts — Regression tests for canonical TVL formula.
 *
 * Invariant: TVL = fundReserveAmount * fundPriceUsd + anchorReserveAmount * anchorPriceUsd
 * fundImgRaw / anchorImgRaw (virtual reserves) NEVER included.
 * DAI(ETH) 0xefd766ccb38eaf1dfd701853bfce31359239f305 = exactly $1.00 (oracle peg).
 * Expected WPLS/DAI TVL ≈ $19,338 (not $2.7B token-count, not $816K DexScreener pool TVL)
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// vi.mock is hoisted — inline data only
vi.mock("../src/lib/dexscreener", () => {
  const pair = {
    chainId: "pulsechain",
    pairAddress: "0xe56043671df55de5cdf8459710433c10324de0ae",
    baseToken: { address: "0xa1077a294dde1b09bb078844df40758a5d0f9a27", symbol: "WPLS", name: "Wrapped Pulse" },
    quoteToken: { address: "0xefd766ccb38eaf1dfd701853bfce31359239f305", symbol: "DAI", name: "Dai Stablecoin" },
    priceUsd: "0.0000072",
    liquidity: { usd: 816900.15, base: 57000000000, quote: 408450 },
    volume: { h24: 28500, h6: 7100, h1: 1200, m5: 250 },
    txns: { h24: { buys: 142, sells: 118 } },
    pairCreatedAt: 1680000000000,
    dexId: "pulsex",
  };
  return {
    findPairForLPX: vi.fn().mockResolvedValue(pair),
    fetchDexScreenerPairsForToken: vi.fn().mockResolvedValue([pair]),
    DAI_ETH_ADDRESS: "0xefd766ccb38eaf1dfd701853bfce31359239f305",
    // WPLS = $0.0000072, DAI(ETH) = $1.00 (oracle peg)
    getTokenPriceUsd: vi.fn().mockImplementation((addr: string) => {
      if (addr.toLowerCase() === "0xefd766ccb38eaf1dfd701853bfce31359239f305") return Promise.resolve(1.0);
      if (addr.toLowerCase() === "0xa1077a294dde1b09bb078844df40758a5d0f9a27") return Promise.resolve(0.0000072);
      return Promise.resolve(null);
    }),
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
    fundReserveAmount: 2_680_012_312, anchorReserveAmount: 42.5,
    ntzIndex: 0.0234, profitIndex: 0.005, feeIndex: 0.0028,
    managerRewardIndex: 0, managerAddress: "0x07b2f1ed9b644db28ad7051bef2ba51d443a8b4c",
    poolId: 1,
  };
}

describe("Pool math — canonical TVL formula (raw reserves × token price)", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("tvlUsd = fundAmount * fundPrice + anchorAmount * anchorPrice (NOT img reserves, NOT DexScreener pool TVL)", async () => {
    const [enriched] = await enrichWithDexScreener([makeWplsPool()]);
    const expected = 2_680_012_312 * 0.0000072 + 42.5 * 1.0;
    expect(enriched.tvlUsd).toBeCloseTo(expected, 0);
    expect(enriched.tvlUsd).toBeGreaterThan(15_000);
    expect(enriched.tvlUsd).toBeLessThan(25_000);
    console.log(`[SANITY] tvlUsd: $${enriched.tvlUsd?.toLocaleString()}`);
  });

  it("tvl display string is NOT $2.7B and NOT $816.9K", async () => {
    const [enriched] = await enrichWithDexScreener([makeWplsPool()]);
    expect(enriched.tvl).not.toContain("B");
    expect(enriched.tvl).not.toBe("$2.7B");
    expect(enriched.tvl).not.toBe("$816.9K");
    expect(enriched.tvl).toMatch(/^\$\d+/);
    console.log(`[SANITY] tvl display: ${enriched.tvl}`);
  });

  it("tvlUsd < $50K for WPLS/DAI pool (live-verified upper bound)", async () => {
    const [enriched] = await enrichWithDexScreener([makeWplsPool()]);
    expect(enriched.tvlUsd).toBeLessThan(50_000);
  });

  it("volume24hUsd from DexScreener pair", async () => {
    const [enriched] = await enrichWithDexScreener([makeWplsPool()]);
    expect(enriched.volume24hUsd).toBe(28500);
    expect(enriched.volume24h).toMatch(/^\$\d+/);
    console.log(`[SANITY] volume24h: ${enriched.volume24h}`);
  });

  it("fees24hUsd = volume * feeIndex", async () => {
    const [enriched] = await enrichWithDexScreener([makeWplsPool()]);
    expect(enriched.fees24hUsd).toBeCloseTo(28500 * 0.0028, 2);
  });

  it("ageDays derived from pairCreatedAt", async () => {
    const [enriched] = await enrichWithDexScreener([makeWplsPool()]);
    expect(enriched.ageDays).toBeGreaterThan(0);
    console.log(`[SANITY] ageDays: ${enriched.ageDays}`);
  });

  it("DAI oracle peg: anchor contributes exactly $42.50 (not ~$31.66 at DexScreener market price)", async () => {
    const [enriched] = await enrichWithDexScreener([makeWplsPool()]);
    const fundOnlyTvl = 2_680_012_312 * 0.0000072;
    const anchorContribution = enriched.tvlUsd! - fundOnlyTvl;
    expect(anchorContribution).toBeCloseTo(42.5, 1);
  });
});
