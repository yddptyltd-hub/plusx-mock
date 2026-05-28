/**
 * plsxBurnTracker.ts — Live on-chain read of PulseX PLSX burns
 *
 * Every PulseX swap routes 0.05% protocol fee → accumulates in LP pair K-value
 * → minted to feeTo on next mint/burn → batch-burned by sending PLSX to address(0).
 *
 * We query Transfer events from the PLSX token contract where `to` = zero address.
 * Window: last 5000 blocks (~14h at ~10s/block on PulseChain).
 */

const PLSX = "0x95b303987a60c71504d99aa1b13b4da07b0790ab";
const ZERO_TOPIC =
  "0x0000000000000000000000000000000000000000000000000000000000000000";
const TRANSFER_SIG =
  "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

const FEE_TO: Record<string, "V1" | "V2" | "AUX"> = {
  "0xd6ca7ee047a6f45d20d2962e4394e070cf27724f": "V1",
  "0xd46bd969d995a122ad5b803a45d309021a647b87": "V2",
  "0xb8394685e168b16707140c1f97475167ab5d2aec": "AUX",
};

export interface BurnLogEntry {
  block: number;
  txHash: string;
  burner: string;
  amount: number;
  source: "V1" | "V2" | "AUX" | "OTHER";
}

export interface PlsxBurnState {
  windowBlocks: number;
  windowHours: number;
  events: BurnLogEntry[];
  totalBurned: number;
  bySource: { V1: number; V2: number; AUX: number; OTHER: number };
  latestBlock: number;
  generatedAt: number;
  plsxPriceUsd: number | null;
  totalBurnedUsd: number | null;
}

const RPC = "https://rpc.pulsechain.com";

async function rpcCall(method: string, params: unknown): Promise<unknown> {
  const r = await fetch(RPC, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
    cache: "no-store",
  });
  if (!r.ok) throw new Error("rpc " + r.status);
  const j = await r.json();
  if (j.error) throw new Error("rpc error: " + JSON.stringify(j.error));
  return j.result;
}

export async function fetchPlsxBurns(
  windowBlocks = 5000,
  plsxPriceUsd: number | null = null
): Promise<PlsxBurnState> {
  const latestHex = (await rpcCall("eth_blockNumber", [])) as string;
  const latest = parseInt(latestHex, 16);
  const fromBlock = "0x" + Math.max(0, latest - windowBlocks).toString(16);

  const logs = (await rpcCall("eth_getLogs", [
    {
      fromBlock,
      toBlock: latestHex,
      address: PLSX,
      topics: [TRANSFER_SIG, null, ZERO_TOPIC],
    },
  ])) as Array<{
    topics: string[];
    data: string;
    blockNumber: string;
    transactionHash: string;
  }>;

  const events: BurnLogEntry[] = logs.map((log) => {
    const burner = "0x" + log.topics[1].slice(-40).toLowerCase();
    const amount = Number(BigInt(log.data)) / 1e18;
    const source: BurnLogEntry["source"] = FEE_TO[burner] ?? "OTHER";
    return {
      block: parseInt(log.blockNumber, 16),
      txHash: log.transactionHash,
      burner,
      amount,
      source,
    };
  });

  events.sort((a, b) => b.block - a.block);

  const bySource = { V1: 0, V2: 0, AUX: 0, OTHER: 0 };
  let totalBurned = 0;
  for (const e of events) {
    totalBurned += e.amount;
    bySource[e.source] += e.amount;
  }

  return {
    windowBlocks,
    windowHours: (windowBlocks * 10) / 3600,
    events,
    totalBurned,
    bySource,
    latestBlock: latest,
    generatedAt: Date.now(),
    plsxPriceUsd,
    totalBurnedUsd: plsxPriceUsd !== null ? totalBurned * plsxPriceUsd : null,
  };
}
