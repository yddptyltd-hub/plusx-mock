const DAI = "0xefd766ccb38eaf1dfd701853bfce31359239f305";
const LPX_API = "https://lpx.plusx.app/watcher/LPXWatcher/SearchLPXs";
const DEX_API = "https://api.dexscreener.com/latest/dex/tokens/";

interface TokenMeta { symbol: string; decimals: number; }
interface ResolvedPrice { price_usd: number | null; route: string; hops: number; liquidity_used_usd: number | null; }

export async function buildPriceGraph(): Promise<unknown> {
  // 1. Fetch LPX pools
  const poolsRaw = await fetch(LPX_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ request: { skip: 0, take: 100, sid: "", forWalletAdr: "", forToken: "", isFilterPorfolio: false, isFilterManager: false, isFilterOnlySolo: false } }),
  });
  const pools: unknown[] = poolsRaw.ok ? ((await poolsRaw.json()) as unknown[]) : [];

  // 2. Collect unique tokens
  const tokens: Record<string, TokenMeta> = {};
  for (const p of pools) {
    const pool = p as { fundToken: { erc20Address: string; symbol: string; decimals: number }; anchorToken: { erc20Address: string; symbol: string; decimals: number } };
    for (const t of [pool.fundToken, pool.anchorToken]) {
      const a = t.erc20Address.toLowerCase();
      if (!tokens[a]) tokens[a] = { symbol: t.symbol, decimals: t.decimals };
    }
  }

  // 3. Fetch DexScreener pairs in parallel chunks of 8
  const CHUNK_SIZE = 8;
  const pairCache: Record<string, unknown[]> = { [DAI]: [] };
  const addrs = Object.keys(tokens).filter((a) => a !== DAI);
  for (let i = 0; i < addrs.length; i += CHUNK_SIZE) {
    const chunk = addrs.slice(i, i + CHUNK_SIZE);
    const results = await Promise.allSettled(
      chunk.map((addr) =>
        fetch(DEX_API + encodeURIComponent(addr), { headers: { "User-Agent": "plusx-mock-worker" } })
          .then((r) => (r.ok ? (r.json() as Promise<unknown>) : { pairs: [] }))
      )
    );
    for (let j = 0; j < chunk.length; j++) {
      const r = results[j];
      if (r.status === "fulfilled") {
        const val = r.value as { pairs?: unknown[] };
        pairCache[chunk[j]] = (val.pairs ?? []).filter((pair) => (pair as { chainId: string }).chainId === "pulsechain");
      } else {
        pairCache[chunk[j]] = [];
      }
    }
  }

  // 4. BFS price resolution up to 4 hops
  const prices: Record<string, ResolvedPrice> = {
    [DAI]: { price_usd: 1.0, route: "DAI(ETH) oracle peg", hops: 0, liquidity_used_usd: null },
  };

  function tryResolve(addr: string, maxHops: number): ResolvedPrice | null {
    const pairs = [...(pairCache[addr] ?? [])].sort((a, b) =>
      ((b as { liquidity?: { usd?: number } }).liquidity?.usd ?? 0) -
      ((a as { liquidity?: { usd?: number } }).liquidity?.usd ?? 0)
    );
    for (const pair of pairs) {
      const p = pair as { baseToken: { address: string }; quoteToken: { address: string }; priceNative: string; liquidity?: { usd?: number } };
      const base = p.baseToken.address.toLowerCase();
      const quote = p.quoteToken.address.toLowerCase();
      const other = base === addr ? quote : base;
      if (!prices[other]) continue;
      const oth = prices[other];
      if (oth.price_usd === null || oth.hops + 1 > maxHops) continue;
      const pn = parseFloat(p.priceNative);
      if (!isFinite(pn) || pn === 0) continue;
      const price = base === addr ? pn * oth.price_usd : (1 / pn) * oth.price_usd;
      if (price <= 0) continue;
      const othSym = tokens[other]?.symbol ?? other.slice(0, 6);
      const tokSym = tokens[addr]?.symbol ?? addr.slice(0, 6);
      const liq = p.liquidity?.usd ?? 0;
      return {
        price_usd: price,
        route: other === DAI
          ? `direct ${tokSym}/${othSym} - DAI (liq $${liq.toLocaleString("en-US", { maximumFractionDigits: 0 })})`
          : `${oth.hops + 1}-hop via ${othSym} (liq $${liq.toLocaleString("en-US", { maximumFractionDigits: 0 })})`,
        hops: oth.hops + 1,
        liquidity_used_usd: liq,
      };
    }
    return null;
  }

  for (const maxHops of [1, 2, 3, 4]) {
    let progress = true;
    while (progress) {
      progress = false;
      for (const addr of addrs) {
        if (prices[addr]) continue;
        const r = tryResolve(addr, maxHops);
        if (r) { prices[addr] = r; progress = true; }
      }
    }
  }
  for (const addr of addrs) {
    if (!prices[addr]) {
      prices[addr] = { price_usd: null, route: "UNRESOLVED (no PulseChain pair found)", hops: -1, liquidity_used_usd: null };
    }
  }

  // 5. Total TVL
  let totalTvl = 0;
  let poolCount = 0;
  for (const p of pools) {
    const pool = p as { isClosed?: boolean; fundToken: { erc20Address: string; decimals: number }; anchorToken: { erc20Address: string; decimals: number }; reserves: { fundRaw: string; anchorRaw: string } };
    if (pool.isClosed) continue;
    const fa = pool.fundToken.erc20Address.toLowerCase();
    const aa = pool.anchorToken.erc20Address.toLowerCase();
    const fp = prices[fa]?.price_usd;
    const ap = prices[aa]?.price_usd;
    if (fp == null || ap == null) continue;
    totalTvl += Number(BigInt(pool.reserves.fundRaw)) / 10 ** pool.fundToken.decimals * fp
              + Number(BigInt(pool.reserves.anchorRaw)) / 10 ** pool.anchorToken.decimals * ap;
    poolCount += 1;
  }

  // 6. Output — identical shape to Python script
  const tokenEntries: Record<string, unknown> = {};
  for (const [addr, info] of Object.entries(tokens)) {
    const r = prices[addr] ?? { price_usd: null, route: "?", hops: -1, liquidity_used_usd: null };
    tokenEntries[addr] = { symbol: info.symbol, decimals: info.decimals, price_usd: r.price_usd, route: r.route, hops: r.hops, liquidity_used_usd: r.liquidity_used_usd };
  }
  return {
    generated_at: new Date().toISOString(),
    anchor: { address: DAI, symbol: "DAI(ETH)", price_usd: 1.0, note: "Bridged DAI from Ethereum, ecosystem oracle = $1" },
    tokens: tokenEntries,
    total_tvl_usd: totalTvl,
    pool_count: poolCount,
  };
}
