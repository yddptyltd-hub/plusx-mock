export interface ChatterMention {
  id: string;
  title: string;
  source: string;
  url: string;
  score: number;
  comments: number;
  rankScore: number;
  createdUtc: number;
  matchedKeywords: string[];
}

const SUBREDDITS = ["pulsechain", "PulseChainHEX", "pulsex"];
const SEARCH_QUERIES = [
  "pulsechain",
  "PLSX",
  "PlusX",
  "LPX liquidity",
];

const KEYWORDS = [
  "pulsechain", "pulse chain", "$PLS", "PLSX", "$PLSX", "HEX", "$HEX",
  "PlusX", "LPX", "liquidity", "manager", "solo", "new token", "launch",
  "wPLS", "uPLS", "ValidatorX", "vault", "yield",
];

interface RedditChild {
  data: {
    id: string;
    title: string;
    permalink: string;
    score: number;
    num_comments: number;
    created_utc: number;
    subreddit: string;
    selftext?: string;
  };
}

interface RedditListing {
  data?: { children?: RedditChild[] };
}

function detectKeywords(text: string): string[] {
  const lower = text.toLowerCase();
  return KEYWORDS.filter((k) => lower.includes(k.toLowerCase()));
}

async function fetchRedditJson(url: string): Promise<RedditChild[]> {
  const res = await fetch(url, {
    headers: { "User-Agent": "plusx-mock-chatter/1.0 by plusx" },
  });
  if (!res.ok) return [];
  const data = await res.json() as RedditListing;
  return data.data?.children ?? [];
}

export async function ingestPulsechainChatter(env: { SNAPSHOTS: KVNamespace }): Promise<{ ingested: number }> {
  const items: ChatterMention[] = [];
  const seen = new Set<string>();

  for (const sub of SUBREDDITS) {
    const children = await fetchRedditJson(`https://www.reddit.com/r/${sub}/hot.json?limit=25`);
    for (const c of children) {
      const d = c.data;
      if (!d?.id || seen.has(d.id)) continue;
      seen.add(d.id);
      const text = `${d.title} ${d.selftext ?? ""}`;
      const matched = detectKeywords(text);
      items.push({
        id: d.id,
        title: d.title,
        source: `r/${d.subreddit}`,
        url: `https://www.reddit.com${d.permalink}`,
        score: d.score,
        comments: d.num_comments,
        rankScore: d.score + d.num_comments * 2,
        createdUtc: d.created_utc,
        matchedKeywords: matched,
      });
    }
  }

  for (const q of SEARCH_QUERIES) {
    const url = `https://www.reddit.com/search.json?q=${encodeURIComponent(q)}&sort=new&limit=25&t=week`;
    const children = await fetchRedditJson(url);
    for (const c of children) {
      const d = c.data;
      if (!d?.id || seen.has(d.id)) continue;
      seen.add(d.id);
      const text = `${d.title} ${d.selftext ?? ""}`;
      const matched = detectKeywords(text);
      if (matched.length === 0) continue;
      items.push({
        id: d.id,
        title: d.title,
        source: `r/${d.subreddit}`,
        url: `https://www.reddit.com${d.permalink}`,
        score: d.score,
        comments: d.num_comments,
        rankScore: d.score + d.num_comments * 2,
        createdUtc: d.created_utc,
        matchedKeywords: matched,
      });
    }
  }

  items.sort((a, b) => b.rankScore - a.rankScore);
  const top20 = items.slice(0, 20);

  await env.SNAPSHOTS.put(
    "chatter:pulsechain:latest",
    JSON.stringify({ ts: Math.floor(Date.now() / 1000), tokens: top20 }),
    { expirationTtl: 3 * 86400 }
  );
  return { ingested: top20.length };
}

export async function handlePulsechainChatter(env: { SNAPSHOTS: KVNamespace }): Promise<Response> {
  let value = await env.SNAPSHOTS.get("chatter:pulsechain:latest");
  if (!value) {
    await ingestPulsechainChatter(env);
    value = await env.SNAPSHOTS.get("chatter:pulsechain:latest");
  }
  if (!value) {
    return new Response(JSON.stringify({ error: "ingest_failed" }), {
      status: 503,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    });
  }
  return new Response(value, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=300",
    },
  });
}
