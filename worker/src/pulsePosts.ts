import type { ChatterMention } from "./chatterPulsechain";

const SUBS = ["pulsechain", "PulseChainHEX", "pulsex"];
const SEARCHES = ["pulsechain", "PLSX", "PlusX", "LPX liquidity"];
const TAGS = ["pulsechain", "plsx", "plusxapp", "hexcrypto"];

const KEYWORDS = [
  "pulsechain", "pulse chain", "$PLS", "PLSX", "$PLSX", "HEX", "$HEX",
  "PlusX", "LPX", "liquidity", "manager", "solo", "new token", "launch",
  "wPLS", "uPLS", "ValidatorX", "vault", "yield",
];

interface RedditChild { data: { id: string; title: string; permalink: string; score: number; num_comments: number; created_utc: number; subreddit: string; selftext?: string } }
interface MastodonStatus { id: string; content: string; url: string; created_at: string; favourites_count: number; replies_count: number; reblogs_count: number; account: { acct: string } }

function detect(text: string): string[] {
  const lower = text.toLowerCase();
  return KEYWORDS.filter((k) => lower.includes(k.toLowerCase()));
}
function stripHtml(s: string): string { return s.replace(/<[^>]+>/g, "").trim(); }

async function fetchReddit(env: { SNAPSHOTS: KVNamespace }, out: ChatterMention[], seen: Set<string>) {
  void env;
  for (const sub of SUBS) {
    try {
      const r = await fetch(`https://www.reddit.com/r/${sub}/hot.json?limit=25`, { headers: { "User-Agent": "plusx-mock-pulse/1.0" } });
      if (!r.ok) continue;
      const data = await r.json() as { data?: { children?: RedditChild[] } };
      for (const c of data.data?.children ?? []) {
        const d = c.data;
        if (!d?.id) continue;
        const key = `reddit:${d.id}`;
        if (seen.has(key)) continue;
        seen.add(key);
        const matched = detect(`${d.title} ${d.selftext ?? ""}`);
        out.push({ id: key, title: d.title, source: `r/${d.subreddit}`, url: `https://www.reddit.com${d.permalink}`, score: d.score, comments: d.num_comments, rankScore: d.score + d.num_comments * 2, createdUtc: d.created_utc, matchedKeywords: matched });
      }
    } catch { /* skip */ }
  }
  for (const q of SEARCHES) {
    try {
      const r = await fetch(`https://www.reddit.com/search.json?q=${encodeURIComponent(q)}&sort=new&limit=25&t=week`, { headers: { "User-Agent": "plusx-mock-pulse/1.0" } });
      if (!r.ok) continue;
      const data = await r.json() as { data?: { children?: RedditChild[] } };
      for (const c of data.data?.children ?? []) {
        const d = c.data;
        const key = `reddit:${d.id}`;
        if (!d?.id || seen.has(key)) continue;
        const matched = detect(`${d.title} ${d.selftext ?? ""}`);
        if (matched.length === 0) continue;
        seen.add(key);
        out.push({ id: key, title: d.title, source: `r/${d.subreddit}`, url: `https://www.reddit.com${d.permalink}`, score: d.score, comments: d.num_comments, rankScore: d.score + d.num_comments * 2, createdUtc: d.created_utc, matchedKeywords: matched });
      }
    } catch { /* skip */ }
  }
}

async function fetchMastodon(out: ChatterMention[], seen: Set<string>) {
  for (const tag of TAGS) {
    try {
      const r = await fetch(`https://mastodon.social/api/v1/timelines/tag/${tag}?limit=20`, { headers: { "User-Agent": "plusx-mock-pulse/1.0" } });
      if (!r.ok) continue;
      const data = await r.json() as MastodonStatus[];
      for (const s of data) {
        const key = `mastodon:${s.id}`;
        if (seen.has(key)) continue;
        seen.add(key);
        const text = stripHtml(s.content);
        const matched = detect(text);
        if (matched.length === 0 && tag !== "pulsechain") continue;
        out.push({ id: key, title: text.slice(0, 200), source: `mastodon @${s.account.acct}`, url: s.url, score: s.favourites_count + s.reblogs_count, comments: s.replies_count, rankScore: (s.favourites_count + s.reblogs_count) * 3 + s.replies_count * 2, createdUtc: Math.floor(new Date(s.created_at).getTime() / 1000), matchedKeywords: matched });
      }
    } catch { /* skip */ }
  }
}

export async function ingestPulse(env: { SNAPSHOTS: KVNamespace }): Promise<{ ingested: number; sources: Record<string, number> }> {
  const fresh: ChatterMention[] = [];
  const seen = new Set<string>();
  await fetchReddit(env, fresh, seen);
  await fetchMastodon(fresh, seen);

  const existingRaw = await env.SNAPSHOTS.get("pulse:rolling100:latest");
  const existing: ChatterMention[] = existingRaw ? (JSON.parse(existingRaw) as { posts: ChatterMention[] }).posts ?? [] : [];
  const merged = new Map<string, ChatterMention>();
  for (const p of existing) merged.set(p.id, p);
  for (const p of fresh) merged.set(p.id, p);
  const all = Array.from(merged.values()).sort((a, b) => b.createdUtc - a.createdUtc).slice(0, 100);

  const sources: Record<string, number> = {};
  for (const p of all) {
    const k = p.source.startsWith("r/") ? "reddit" : p.source.startsWith("mastodon") ? "mastodon" : "other";
    sources[k] = (sources[k] ?? 0) + 1;
  }
  await env.SNAPSHOTS.put("pulse:rolling100:latest", JSON.stringify({ ts: Math.floor(Date.now() / 1000), posts: all, sources }), { expirationTtl: 14 * 86400 });
  return { ingested: all.length, sources };
}

export async function handlePulse(env: { SNAPSHOTS: KVNamespace }): Promise<Response> {
  let value = await env.SNAPSHOTS.get("pulse:rolling100:latest");
  if (!value) {
    await ingestPulse(env);
    value = await env.SNAPSHOTS.get("pulse:rolling100:latest");
  }
  if (!value) {
    return new Response(JSON.stringify({ error: "ingest_failed" }), { status: 503, headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json", "Cache-Control": "no-store" } });
  }
  return new Response(value, { headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json", "Cache-Control": "public, max-age=300" } });
}
