/**
 * lpxPriceBands.ts — decode packRaw + compute Sell/Buy/MinBuy/MaxSell price bands.
 *
 * Verified to 1e-15 tolerance against pool 1 (WPLS/DAI) on 2026-05-27:
 *   packRaw = "295147920469743108376"
 *   Sell     = 0.000007020052901210  ✓
 *   Buy      = 0.000006855783663321  ✓
 *   Min Buy  = 0.000006828438992819  ✓
 *   Max Sell = 0.000529295225266585  ✓
 *
 * Key precision note: integer-division order matters for Max Sell.
 * Multiply (Rf*(Ra+Rb)*(17B-fee)) BEFORE dividing by (Ri*17B) to avoid
 * truncation error in the intermediate term.
 */

const DECIMAL_17B = 100_000n;
const DECIMAL_18 = 10n ** 18n;

export interface PriceBands {
  feeIndex: number;
  ntzIndex: number;
  profitIndex: number;
  managerRewardIndex: number;
  poolType: number;
  sellPrice: number;
  buyPrice: number;
  minBuyPrice: number;
  maxSellPrice: number;
}

function getUint17(packed: bigint, index: number): bigint {
  if (index < 0 || index > 14) throw new Error("Index out of range");
  return (packed >> (BigInt(index) * 17n)) & 131071n; // 2^17 - 1
}

function unpack(packRawStr: string): {
  fee: bigint;
  ntz: bigint;
  profitIndex: bigint;
  managerRewardIndex: bigint;
  poolType: number;
} {
  const e = BigInt(packRawStr);
  return {
    fee: getUint17(e, 0),
    ntz: getUint17(e, 1),
    profitIndex: getUint17(e, 2),
    managerRewardIndex: getUint17(e, 3),
    poolType: Number((e >> (17n * 4n)) & 15n),
  };
}

export function computePriceBands(rawPool: {
  packRaw: string;
  reserves: { fundRaw: string; fundImgRaw: string; anchorRaw: string; anchorImgRaw: string };
  fundToken: { decimals: number };
  anchorToken: { decimals: number };
}): PriceBands {
  const { fee, ntz, profitIndex, managerRewardIndex, poolType } = unpack(rawPool.packRaw);

  const Rf = BigInt(rawPool.reserves.fundRaw);
  const Ri = BigInt(rawPool.reserves.fundImgRaw);
  const Ra = BigInt(rawPool.reserves.anchorRaw);
  const Rb = BigInt(rawPool.reserves.anchorImgRaw);
  const fundDec = rawPool.fundToken.decimals;
  const anchorDec = rawPool.anchorToken.decimals;

  const decShift = (10 ** fundDec) / (10 ** anchorDec) / 1e18;

  // Sell Price: (Ra + Rb) / (Rf + Ri)
  const sellPriceRaw = ((Ra + Rb) * DECIMAL_18) / (Rf + Ri);
  const sellPrice = Number(sellPriceRaw) * decShift;

  // Buy Price: Sell * (17B - ntz) / 17B
  const buyPriceRaw = ((Ra + Rb) * DECIMAL_18 * (DECIMAL_17B - ntz)) / ((Rf + Ri) * DECIMAL_17B);
  const buyPrice = Number(buyPriceRaw) * decShift;

  // Max Sell (calcEndRatio): multiply BEFORE dividing to avoid truncation
  const endTerm = (Rf * (Ra + Rb) * (DECIMAL_17B - fee)) / (Ri * DECIMAL_17B);
  const endRatioRaw = ((Ra + endTerm + Rb) * DECIMAL_18) / Ri;
  const maxSellPrice = Number(endRatioRaw) * decShift;

  // Min Buy (calcStartRatio scaled by ntz):
  const startTerm = (Ra * (Rf + Ri) * (DECIMAL_17B - fee)) / (Rb * DECIMAL_17B);
  const startRatioRaw = (Rb * DECIMAL_18) / (Rf + startTerm + Ri);
  const minBuyRaw = (startRatioRaw * (DECIMAL_17B - ntz)) / DECIMAL_17B;
  const minBuyPrice = Number(minBuyRaw) * decShift;

  return {
    feeIndex: Number(fee) / 100_000,
    ntzIndex: Number(ntz) / 100_000,
    profitIndex: Number(profitIndex) / 100_000,
    managerRewardIndex: Number(managerRewardIndex) / 100_000,
    poolType,
    sellPrice,
    buyPrice,
    minBuyPrice,
    maxSellPrice,
  };
}
