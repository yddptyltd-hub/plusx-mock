// Token address -> icon path map. Icons sourced from mirror.lpx.plusx.app
// and cached locally in public/tokens/. Generated 2026-05-27 from
// lpx.plusx.app/watcher/LPXWatcher/SearchLPXs response (15 active pools, 12 unique tokens).
// Regenerate via: scripts/sync-token-icons.ts (v1.1)

import manifest from "../../public/tokens/manifest.json";

export type TokenInfo = {
  symbol: string;
  name: string;
  decimals: number;
  iconPath: string;
};

const TOKEN_BY_ADDRESS: Record<string, TokenInfo> = manifest as Record<string, TokenInfo>;

// Symbol -> first matching address (used when only symbol is known, e.g. from data/pools.json)
const TOKEN_BY_SYMBOL: Record<string, TokenInfo> = (() => {
  const out: Record<string, TokenInfo> = {};
  for (const [addr, info] of Object.entries(TOKEN_BY_ADDRESS)) {
    const sym = info.symbol;
    // DAI from ETH bridged shows as "DAI(ETH)" in pools.json but "DAI" in API. Map both.
    if (!out[sym]) out[sym] = info;
    if (sym === "DAI") out["DAI(ETH)"] = info;
    // eHEX(ETH) is one of the HEX contracts (the bridged one).
    if (sym === "HEX" && info.name.toLowerCase().includes("from ethereum")) {
      out["eHEX(ETH)"] = info;
    }
  }
  return out;
})();

export function getTokenIcon(symbolOrAddress: string): string {
  const key = symbolOrAddress.toLowerCase();
  if (key.startsWith("0x") && TOKEN_BY_ADDRESS[key]) {
    return TOKEN_BY_ADDRESS[key].iconPath;
  }
  const bySymbol = TOKEN_BY_SYMBOL[symbolOrAddress];
  return bySymbol?.iconPath ?? "";
}

export function getTokenInfo(symbolOrAddress: string): TokenInfo | null {
  const key = symbolOrAddress.toLowerCase();
  if (key.startsWith("0x") && TOKEN_BY_ADDRESS[key]) {
    return TOKEN_BY_ADDRESS[key];
  }
  return TOKEN_BY_SYMBOL[symbolOrAddress] ?? null;
}
