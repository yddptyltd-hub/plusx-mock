export interface GlossaryEntry {
  term: string;
  short: string;
  long: string;
  aliases?: string[];
}

export const GLOSSARY: GlossaryEntry[] = [
  { term: "LPX", short: "Liquidity Premium eXchange position - your own mini AMM with a no-trade band.", long: "An LPX position is a structured liquidity position on PulseChain. You deposit two tokens (anchor + fund) and set an NTZ band. Inside the band: nothing happens. Outside: the position automatically rebalances and earns the band-width as fee/edge. Different from a 50/50 Uniswap LP because LPX is asymmetric and band-aware." },
  { term: "Anchor token", short: "The stable side of an LPX pool (usually DAI or USDC).", long: "The token used as the price reference. Most PulseChain LPX pools use DAI(ETH) at 0xefd766... as their anchor, anchored at $1. The anchor side stays roughly fixed in USD value while the fund side moves with the market." },
  { term: "Fund token", short: "The volatile side of an LPX pool (the actual asset being traded).", long: "The non-stable token in the pool: WPLS, HEX, PLSX, etc. The fund side absorbs the price movement. When price exits the NTZ band on the upside, fund is sold for anchor at the band edge; on the downside, anchor buys fund at the band edge." },
  { term: "NTZ", short: "No-Trade Zone - the +/-% price band where no LPX swap fires.", long: "The NTZ is a price band around the current center. Width is set per pool (e.g. +/- 0.5%). Inside the band: position is dormant. Outside: rebalance triggers, position earns NTZ% as edge, band re-centers. Narrow NTZ = many small trades; wide NTZ = few big trades. The sweet spot is volatility-dependent." },
  { term: "HEX", short: "Native PulseChain HEX (pHEX). Started life on Ethereum (eHEX).", long: "HEX is a time-locked savings token. On PulseChain it's called pHEX, on Ethereum it's eHEX. Same contract bytecode, separate chains - prices diverge. PulseChain explorers typically just say 'HEX' meaning pHEX." },
  { term: "pHEX", short: "HEX on PulseChain. Aliases: HEX (when context is PulseChain).", long: "Same as HEX above. The 'p' prefix disambiguates from eHEX on Ethereum.", aliases: ["HEX"] },
  // src: TODO
  { term: "eHEX", short: "HEX on Ethereum mainnet. Different price from pHEX.", long: "Ethereum-side HEX, the original token. After PulseChain launched (May 2023) it forked the entire Ethereum state, so eHEX and pHEX exist as separate tokens on separate chains. Bridges allow conversion." },
  { term: "WPLS", short: "Wrapped PLS - ERC-20 version of native PulseChain gas token.", long: "WPLS is the wrapped, tradeable form of native PLS. Required because AMMs can't directly handle native gas tokens. 1 PLS = 1 WPLS, swap-only relationship." },
  { term: "uPLS", short: "ValidatorX-staked PLS receipt token (liquid staking).", long: "When you stake PLS via ValidatorX you receive uPLS - a liquid receipt token that accrues staking yield. Trades freely on PulseX. Different from native PLS / WPLS. Backed by validator-locked PLS plus rewards." },
  { term: "PLSX", short: "PulseX DEX governance + fee-burn token.", long: "PLSX is the PulseX exchange's own token. Fees collected by the DEX buy and burn PLSX, creating deflationary pressure. Separate from PLS (gas) and WPLS (wrapped gas)." },
  { term: "Anchor reserve", short: "How much anchor token (stable side) is parked in the pool.", long: "The current anchor-side liquidity. Combined with fund reserve, this defines the pool's TVL. Moves with every band exit: rises when price exits upward (fund sold for anchor), falls when price exits downward (anchor spent on fund)." },
  { term: "Fund reserve", short: "How much fund token (volatile side) is parked in the pool.", long: "Inverse of anchor reserve. Buying fund (downward exit) increases it; selling fund (upward exit) decreases it." },
  { term: "Manager", short: "Wallet that controls the pool's config (NTZ width, fees, etc).", long: "LPX pools come in three modes: Managed (single wallet sets parameters and earns a cut of fees), Solo (single LP controls their own band), Immutable (no manager, parameters locked at creation). Manager addresses are public on-chain." },
  { term: "Solo", short: "LPX mode where each LP controls their own NTZ + parameters.", long: "Solo mode means the liquidity provider is their own manager - no third party can change the band. Useful when you don't want to trust a manager but also forfeits any expertise." },
  { term: "TVL", short: "Total Value Locked - sum of anchor + fund value in USD.", long: "Standard DeFi metric. For LPX pools, TVL = anchor_reserve_usd + fund_reserve_usd. Changes constantly as fund price moves and as band exits rebalance the ratio." },
  { term: "APR", short: "Annualized yield as a percentage. 30d APR uses the last 30 days.", long: "30d APR = (fees earned in last 30 days / current TVL) * (365 / 30). Higher = more profitable for LPs. LPX APRs can vary widely (1% to 50%+) depending on NTZ width and underlying volatility." },
  { term: "Impermanent Loss (IL)", short: "How much you'd have made by just holding instead of LPing.", long: "IL is the gap between HODL value and LP value. Positive IL = LP wins (band fees more than offset price-divergence). Negative IL = HODL wins. The /hodl-vs-lpx/ page computes this directly with an accuracy score." },
  { term: "Band exit", short: "Price crosses the NTZ boundary, triggering a swap + rebalance.", long: "When candle high > center * (1 + NTZ%) OR candle low < center * (1 - NTZ%), an exit fires. The position swaps a configured fraction of one side into the other at the boundary price, then re-centers the band on that price." },
  { term: "Rebalance fraction", short: "What share of one side gets swapped on a band exit (0-100%).", long: "Common values: 50% (balanced), 100% (full rebalance to neutral). Higher = larger trade per exit, fewer total exits in long trend. Lower = smaller trades, more exits, smoother profile." },
  { term: "Fee capture", short: "What share of the NTZ% edge actually accrues to LP vs protocol.", long: "Defaults to 100% in simulations but real LPX pools take 5-15% as manager + protocol cut. Adjust this slider down to model your specific child config." },
  { term: "packRaw", short: "Bit-packed LPX config (NTZ, profit, fee, manager-reward indices).", long: "Each LPX pool stores its config in a single uint256: 17 bits each for fee, NTZ, profit, manager-reward indices, plus 4 bits for poolType. Decoded by the dashboard to render price bands on the chart." },
  // src: eth_call rpc.pulsechain.com → VController 0xa6dac0df41856AebFbA3Bd68Ef4D032895217C32 countView() word[2] (1e18 scaled) — agy-verified 2026-05-27
  { term: "ValidatorX", short: "Liquid PLS staking protocol that mints uPLS receipts.", long: "Run by the PlusX team. Stake PLS, receive uPLS, earn validator yield. APR currently ~12.55%. See /validatorx/ for live state." },
  { term: "Accuracy score", short: "How confident the simulation is, given candle resolution + window.", long: "15m candles over 7+ days ~ 95/100. 1h over 7d ~ 80. 4h over 7d ~ 60. Daily candles ~ 40. Score reflects how closely OHLC H/L wicks approximate the true tick-level swap stream LPX actually responds to." },
];

export function findTerm(query: string): GlossaryEntry | null {
  const q = query.trim().toLowerCase();
  return GLOSSARY.find((e) => e.term.toLowerCase() === q || e.aliases?.some((a) => a.toLowerCase() === q)) ?? null;
}
