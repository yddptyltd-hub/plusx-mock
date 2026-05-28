// ── ValidatorX on-chain discovery log (Playwright probe 2026-05-27) ─────────
//
// 9 eth_call requests captured from https://vx.plusx.app initial load:
//
// Contract 0xa6dac0df41856AebFbA3Bd68Ef4D032895217C32 (VController — VX Stats/Staking):
//   0x4e8c0bd6 → 0x...7fb5120d...dbd9b  → getTokenAddress() returns uPLS ERC-20 address
//   0xe18eb80f → 0x...c7ea05e9...dc60   → secondary contract address (VPool)
//   0x203fbae2 → countView() — 3-word ABI struct (each 32 bytes, 1e18 scaled):
//       word[0] = vxRatio (exchange rate) — 0x10ddb7a14a594e93 → 1.2153958944135888 PLS/uPLS
//                 *** CONFIRMED agy RPC read 2026-05-27 ***
//       word[1] = countedBalance (instant withdrawal reserve) — decoded by agy: 1,042,383,506.7304263 PLS
//       word[2] = apr (staking APR) — decoded by agy: 0.12551053240853546 = 12.551%
//   0xed612f8c → 2911  (small uint — validator count, not wei-scaled)
//   0x21074204 → 3     (validators exiting — small uint, not wei-scaled)
//   0x4dc42fdd → 0     (boolean flag)
//
// Contract 0x7FB5120D2DB148e91f572d2f69bC04FE454Dbd9b (uPLS ERC-20 token):
//   0x18160ddd (totalSupply) → 0xf80276699dfc3e85c8b3abea
//       = 76,755,259,474,869,955,362,137,811,946 raw = 76,755,259,474.87 uPLS
//   0x495ffd7c → large bigint (unknown purpose, unused)
//
// Contract 0x51e1649422b8ad4E68cBDb2aDDB571038F136c15 (swap router):
//   0xe7572230(1e18) → 6937695656909 — swap quote, NOT exchange rate (too small)
//
// Contract 0xc7EA05E91eB81776d63D073D196E72349082Dc60 (VPool — validator withdrawal pool):
//   Identified via 0xe18eb80f return value on VController.
//
// VERIFIED against live dApp UI (Playwright snapshot, same session):
//   dApp displays "PLS Staked: 93.2B PLS" and "Rate: 1.21532 PLS/uPLS"
//   Computed: totalPLS = 76755259474.87 * 1.21532938 = 93,282,921,742 PLS ✓
//   Rate: 1.21532938 displayed as 1.21532 ✓
//   USD (PLS @ $6.914e-6): 93,282,921,742 * 6.914e-6 = $644,958
//   agy-verified 2026-05-27: vxRatio=1.2153958944135888, countedBalance=1042383506.73, apr=0.12551
// ──────────────────────────────────────────────────────────────────────────────

const RPC = "https://rpc.pulsechain.com";

export async function ethCall(to: string, data: string): Promise<string | null> {
  try {
    const r = await fetch(RPC, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "eth_call",
        params: [{ to, data }, "latest"],
      }),
      cache: "no-store",
    });
    if (!r.ok) return null;
    const j = await r.json();
    return j.result ?? null;
  } catch {
    return null;
  }
}

export function hexToBigInt(hex: string | null): bigint | null {
  if (!hex || hex === "0x" || hex.length < 3) return null;
  try {
    return BigInt(hex);
  } catch {
    return null;
  }
}

export function bigIntToDecimal(value: bigint, decimals: number): number {
  if (value === 0n) return 0;
  const divisor = 10n ** BigInt(decimals);
  const whole = Number(value / divisor);
  const frac = Number(value % divisor) / Number(divisor);
  return whole + frac;
}

/** Read one 32-byte ABI word (0-indexed) from an eth_call hex result. */
export function readWord(hex: string, wordIndex: number): bigint | null {
  if (!hex || hex.length < 2 + 64 * (wordIndex + 1)) return null;
  const start = 2 + 64 * wordIndex;
  const end = start + 64;
  try {
    return BigInt("0x" + hex.slice(start, end));
  } catch {
    return null;
  }
}

export function formatLargeNumber(n: number, suffix = ""): string {
  if (n >= 1e12) return `${(n / 1e12).toFixed(2)}T${suffix}`;
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B${suffix}`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M${suffix}`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(2)}K${suffix}`;
  return n.toFixed(2);
}
