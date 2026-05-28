/**
 * burnTracker.ts — Live on-chain read of the LPX fee wallet
 *
 * Fee wallet accumulates DAI/WPLS/uP/uPX from LPX trade fees.
 * Periodically the protocol uses accumulated funds to buy uP and uPX
 * from the open market and burn them, reducing supply.
 *
 * All balances fetched via standard ERC-20 balanceOf(address)
 * selector 0x70a08231 against PulseChain RPC.
 */

const FEE_WALLET = "0x900DEaf4aF0711c7Eb7a2699fE86209F6F626dEf";

const TRACKED_TOKENS = [
  { symbol: "DAI",  address: "0xefd766ccb38eaf1dfd701853bfce31359239f305", decimals: 18 },
  { symbol: "uPX",  address: "0x664e58570e5835b99d281f12dd14d350315d7e2a", decimals: 18 },
  { symbol: "uP",   address: "0x131bf51e864024df1982f2cd7b1c786e1a005152", decimals: 18 },
  { symbol: "WPLS", address: "0xa1077a294dde1b09bb078844df40758a5d0f9a27", decimals: 18 },
];

export interface BurnHolding {
  symbol: string;
  address: string;
  balance: number;
  priceUsd: number | null;
  valueUsd: number | null;
}

export interface BurnState {
  feeWallet: string;
  holdings: BurnHolding[];
  totalPendingUsd: number;
  generatedAt: number;
}

export async function fetchBurnState(
  priceGraph: Record<string, { price_usd: number | null }>
): Promise<BurnState> {
  const padded =
    "0x70a08231" +
    FEE_WALLET.slice(2).toLowerCase().padStart(64, "0");
  const RPC = "https://rpc.pulsechain.com";

  const holdings: BurnHolding[] = await Promise.all(
    TRACKED_TOKENS.map(async (t) => {
      try {
        const r = await fetch(RPC, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: 1,
            method: "eth_call",
            params: [{ to: t.address, data: padded }, "latest"],
          }),
          cache: "no-store",
        });
        if (!r.ok) throw new Error("rpc " + r.status);
        const j = await r.json();
        const hex = j.result as string;
        if (!hex || hex === "0x") throw new Error("empty");
        const raw = BigInt(hex);
        const div = 10n ** BigInt(t.decimals);
        const balance =
          Number(raw / div) + Number(raw % div) / Number(div);
        const priceUsd =
          t.symbol === "DAI"
            ? 1.0
            : (priceGraph[t.address.toLowerCase()]?.price_usd ?? null);
        const valueUsd = priceUsd !== null ? balance * priceUsd : null;
        return { symbol: t.symbol, address: t.address, balance, priceUsd, valueUsd };
      } catch {
        return {
          symbol: t.symbol,
          address: t.address,
          balance: 0,
          priceUsd: null,
          valueUsd: null,
        };
      }
    })
  );

  const totalPendingUsd = holdings.reduce(
    (a, h) => a + (h.valueUsd ?? 0),
    0
  );

  return {
    feeWallet: FEE_WALLET,
    holdings,
    totalPendingUsd,
    generatedAt: Date.now(),
  };
}
