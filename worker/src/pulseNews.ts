// PulseChain community news aggregator.
// Source: r/PulseChain RSS (public, free, no API key). Refreshed hourly via the
// existing `0 * * * *` cron trigger. Returns 10 latest threads.

export interface PulseNewsItem {
  title: string;
  url: string;
  publishedUnix: number;
  author: string;
  source: "reddit";
}

export interface PulseNewsBlob {
  ts: number;
  items: PulseNewsItem[];
}

// Reddit blocks Cloudflare Worker IPs server-side (verified 2026-05-28: 403 to
// direct fetch with any UA). Pivot via rss2json public proxy — free tier, no
// key required for low-volume reads. CF Worker -> rss2json -> Reddit.
// Reddit blocks CF Worker IPs (403). rss2json rate-limits (429). feed2json.org
// works empirically — JSONFeed-format output, no key required. Verified 2026-05-28.
const FEED2JSON = "https://feed2json.org/convert?url=https%3A%2F%2Fwww.reddit.com%2Fr%2FPulseChain%2F.rss";
const KV_KEY = "pulse_news:latest";

interface JsonFeedItem {
  title?: string;
  url?: string;
  date_published?: string;
  author?: { name?: string } | string;
}

interface JsonFeedResponse {
  items?: JsonFeedItem[];
}

export async function refreshPulseNews(env: { SNAPSHOTS: KVNamespace }): Promise<{ ingested: number }> {
  const r = await fetch(FEED2JSON);
  if (!r.ok) throw new Error(`feed2json ${r.status}`);
  const json = (await r.json()) as JsonFeedResponse;
  const raw = json.items ?? [];
  const items: PulseNewsItem[] = raw
    .filter((it) => it.title && it.url && it.date_published)
    .slice(0, 10)
    .map((it) => {
      const authorRaw = typeof it.author === "string" ? it.author : it.author?.name ?? "";
      return {
        title: it.title!,
        url: it.url!,
        publishedUnix: Math.floor(new Date(it.date_published!).getTime() / 1000),
        author: authorRaw.replace(/^\/u\//, "") || "unknown",
        source: "reddit",
      };
    });
  const blob: PulseNewsBlob = { ts: Math.floor(Date.now() / 1000), items };
  await env.SNAPSHOTS.put(KV_KEY, JSON.stringify(blob), { expirationTtl: 7 * 86400 });
  return { ingested: items.length };
}

export async function handlePulseNews(env: { SNAPSHOTS: KVNamespace }): Promise<Response> {
  const value = await env.SNAPSHOTS.get(KV_KEY);
  if (!value) {
    return new Response(
      JSON.stringify({ error: "not_ingested_yet", message: "First cron tick pending" }),
      { status: 503, headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" } }
    );
  }
  return new Response(value, {
    headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json", "Cache-Control": "public, max-age=300" },
  });
}
