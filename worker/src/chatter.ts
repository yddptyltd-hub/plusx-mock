export interface Mention {
  source: "reddit" | "nitter";
  title: string;
  text: string;
  url: string;
  author: string;
  timestamp: number;
  engagement?: {
    score?: number;
    comments?: number;
  };
}

export interface ChatterCache {
  symbol: string;
  mentions: Mention[];
  generatedAt: number;
  sources: { reddit: number; nitter: number; failed: string[] };
}

// Short symbols get co-searched with "pulsechain" to reduce noise
function searchQuery(symbol: string): string {
  if (symbol.length <= 3) return `${symbol} pulsechain`;
  return symbol;
}

async function fetchReddit(symbol: string): Promise<Mention[]> {
  const q = encodeURIComponent(searchQuery(symbol));
  const url = `https://www.reddit.com/r/PulseChain+CryptoCurrency+Defi/search.json?q=${q}&restrict_sr=on&sort=new&t=week&limit=15`;
  try {
    const r = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (compatible; plusx-research/1.0)" } });
    if (!r.ok) return [];
    const data = await r.json() as { data?: { children?: Array<{ data: { title?: string; selftext?: string; permalink?: string; author?: string; created_utc?: number; score?: number; num_comments?: number } }> } };
    const children = data?.data?.children ?? [];
    return children.map((c) => ({
      source: "reddit" as const,
      title: c.data.title ?? "",
      text: (c.data.selftext ?? "").substring(0, 280),
      url: "https://reddit.com" + (c.data.permalink ?? ""),
      author: c.data.author ?? "?",
      timestamp: c.data.created_utc ?? 0,
      engagement: {
        score: c.data.score ?? 0,
        comments: c.data.num_comments ?? 0,
      },
    }));
  } catch {
    return [];
  }
}

// Nitter is unreliable — try multiple instances, RSS is more parseable than HTML
const NITTER_INSTANCES = [
  "nitter.net",
  "nitter.privacydev.net",
  "nitter.poast.org",
];

async function fetchNitter(symbol: string): Promise<Mention[]> {
  const q = encodeURIComponent(searchQuery(symbol));
  for (const host of NITTER_INSTANCES) {
    const url = `https://${host}/search/rss?f=tweets&q=${q}`;
    try {
      const r = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; plusx-research/1.0)" },
        signal: AbortSignal.timeout(8000),
      });
      if (!r.ok) continue;
      const xml = await r.text();
      const items: Mention[] = [];
      const itemMatches = xml.matchAll(/<item>([\s\S]*?)<\/item>/g);
      for (const m of itemMatches) {
        const block = m[1];
        const title = (block.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? "")
          .replace(/<!\[CDATA\[|\]\]>/g, "").trim();
        const link = (block.match(/<link>([\s\S]*?)<\/link>/)?.[1] ?? "").trim();
        const author = (block.match(/<dc:creator>([\s\S]*?)<\/dc:creator>/)?.[1] ?? "")
          .replace(/<!\[CDATA\[|\]\]>/g, "").trim();
        const pubDate = (block.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1] ?? "").trim();
        const description = (block.match(/<description>([\s\S]*?)<\/description>/)?.[1] ?? "")
          .replace(/<!\[CDATA\[|\]\]>/g, "").replace(/<[^>]+>/g, "").trim();
        if (!title || !link) continue;
        items.push({
          source: "nitter",
          title: title.substring(0, 120),
          text: description.substring(0, 280),
          url: link,
          author: author || "?",
          timestamp: pubDate ? Math.floor(new Date(pubDate).getTime() / 1000) : 0,
        });
        if (items.length >= 15) break;
      }
      if (items.length > 0) return items;
    } catch {
      continue;
    }
  }
  return [];
}

const SKIP_SYMBOLS = new Set(["DAI", "USDC", "USDT", "DAI(ETH)"]);

export async function ingestChatter(env: { SNAPSHOTS: KVNamespace }): Promise<{ tokensProcessed: number; mentionsWritten: number }> {
  const lpxRes = await fetch("https://lpx.plusx.app/watcher/LPXWatcher/SearchLPXs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      request: {
        skip: 0, take: 100, sid: "", forWalletAdr: "", forToken: "",
        isFilterPorfolio: false, isFilterManager: false, isFilterOnlySolo: false,
      },
    }),
  });
  const pools: Array<{ fundToken?: { symbol?: string }; anchorToken?: { symbol?: string } }> =
    lpxRes.ok ? (await lpxRes.json() as Array<{ fundToken?: { symbol?: string }; anchorToken?: { symbol?: string } }>) : [];

  const symbols = new Set<string>();
  for (const p of pools) {
    if (p.fundToken?.symbol) symbols.add(p.fundToken.symbol);
    if (p.anchorToken?.symbol) symbols.add(p.anchorToken.symbol);
  }
  SKIP_SYMBOLS.forEach((s) => symbols.delete(s));

  let mentionsWritten = 0;
  const symbolArray = Array.from(symbols);

  // Process in chunks of 4 with 1s pause between chunks to be polite to free APIs
  for (let i = 0; i < symbolArray.length; i += 4) {
    const chunk = symbolArray.slice(i, i + 4);
    await Promise.allSettled(
      chunk.map(async (sym) => {
        const [reddit, nitter] = await Promise.allSettled([
          fetchReddit(sym),
          fetchNitter(sym),
        ]);
        const rArr = reddit.status === "fulfilled" ? reddit.value : [];
        const nArr = nitter.status === "fulfilled" ? nitter.value : [];
        const mentions = [...rArr, ...nArr]
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, 30);
        const cache: ChatterCache = {
          symbol: sym,
          mentions,
          generatedAt: Math.floor(Date.now() / 1000),
          sources: {
            reddit: rArr.length,
            nitter: nArr.length,
            failed: [
              reddit.status === "rejected" ? "reddit" : "",
              nitter.status === "rejected" ? "nitter" : "",
            ].filter(Boolean),
          },
        };
        await env.SNAPSHOTS.put(
          `chatter:${sym.toLowerCase()}:latest`,
          JSON.stringify(cache),
          { expirationTtl: 2 * 86400 }
        );
        mentionsWritten += mentions.length;
      })
    );
    if (i + 4 < symbolArray.length) {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  return { tokensProcessed: symbols.size, mentionsWritten };
}

export async function getChatter(env: { SNAPSHOTS: KVNamespace }, symbol: string): Promise<ChatterCache | null> {
  const raw = await env.SNAPSHOTS.get(`chatter:${symbol.toLowerCase()}:latest`);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ChatterCache;
  } catch {
    return null;
  }
}
