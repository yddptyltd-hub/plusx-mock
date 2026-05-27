/**
 * contract_dexscreener.test.ts — Live contract test, NO MOCKS.
 * Failure mode guarded: bad DexScreener shape fails here before the UI.
 */

import { describe, it, expect } from "vitest";
import {
  fetchDexScreenerPairsForToken,
  findPairForLPX,
  getTokenPriceUsd,
  DAI_ETH_ADDRESS,
  type DexScreenerPair,
} from "../src/lib/dexscreener";

const WPLS_ADDRESS = "0xa1077a294dde1b09bb078844df40758a5d0f9a27";
const DAI_ADDRESS  = "0xefd766ccb38eaf1dfd701853bfce31359239f305";
const KNOWN_PAIR   = "0xe56043671df55de5cdf8459710433c10324de0ae";

describe("DexScreener live contract", () => {
  it("returns pulsechain pairs with correct shape for WPLS", async () => {
    const pairs = await fetchDexScreenerPairsForToken(WPLS_ADDRESS);
    expect(pairs.length).toBeGreaterThan(0);

    const known = pairs.find(
      (p: DexScreenerPair) => p.pairAddress.toLowerCase() === KNOWN_PAIR
    );
    expect(known).toBeDefined();
    if (!known) throw new Error("known pair not found");

    expect(known.chainId).toBe("pulsechain");
    expect(typeof known.liquidity.usd).toBe("number");
    expect(known.liquidity.usd).toBeGreaterThan(0);
    expect(typeof known.volume.h24).toBe("number");
    expect(typeof known.priceUsd).toBe("string");
    expect(typeof known.pairCreatedAt).toBe("number");

    console.log(`[LIVE] WPLS/DAI liquidity.usd = $${known.liquidity.usd.toLocaleString()}`);
    console.log(`[LIVE] WPLS/DAI volume.h24    = $${known.volume.h24.toLocaleString()}`);
    console.log(`[LIVE] WPLS/DAI priceUsd      = ${known.priceUsd}`);
  });

  it("findPairForLPX returns non-null and matches direct fetch", async () => {
    const [directPairs, found] = await Promise.all([
      fetchDexScreenerPairsForToken(WPLS_ADDRESS),
      findPairForLPX(WPLS_ADDRESS, DAI_ADDRESS),
    ]);

    expect(found).not.toBeNull();
    if (!found) throw new Error("findPairForLPX returned null");

    expect(found.chainId).toBe("pulsechain");
    expect(found.liquidity.usd).toBeGreaterThan(0);
    // Sanity: WPLS USD TVL cannot exceed $100M (would flag token-count leak)
    expect(found.liquidity.usd).toBeLessThan(100_000_000);

    const direct = directPairs.find(
      (p: DexScreenerPair) =>
        p.pairAddress.toLowerCase() === found.pairAddress.toLowerCase()
    );
    expect(direct).toBeDefined();
    expect(direct!.liquidity.usd).toBe(found.liquidity.usd);

    console.log(`[LIVE] pairAddress  = ${found.pairAddress}`);
    console.log(`[LIVE] liquidity.usd = $${found.liquidity.usd.toLocaleString()}`);
    console.log(`[LIVE] volume.h24    = $${found.volume.h24.toLocaleString()}`);
  });

  it("getTokenPriceUsd: DAI(ETH) returns exactly 1.0 (oracle peg, no network call needed)", async () => {
    const price = await getTokenPriceUsd(DAI_ETH_ADDRESS);
    expect(price).toBe(1.0);
    console.log(`[LIVE] DAI(ETH) oracle price = ${price}`);
  });

  it("getTokenPriceUsd: WPLS returns a live positive price from highest-liquidity PulseChain pair", async () => {
    const price = await getTokenPriceUsd(WPLS_ADDRESS);
    expect(price).not.toBeNull();
    expect(price).toBeGreaterThan(0);
    // WPLS is a fractional-cent token — must never return a dollar-range value (would indicate token-count leak)
    expect(price).toBeLessThan(1.0);
    console.log(`[LIVE] WPLS price from getTokenPriceUsd = $${price}`);
  });
});
