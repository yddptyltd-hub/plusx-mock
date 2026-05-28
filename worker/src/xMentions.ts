// X (Twitter) mentions blob. Populated by external Jules scraper writing to KV at
// "x:mentions:latest". Schema below. Worker only reads + serves.
// Free tier X API is read-only-own-tweets, paid Basic is $200/mo (Yahya banned),
// so we depend on a Jules sandbox running snscrape/twikit to feed this blob.
// If KV is empty, endpoint returns 503 with honest "not_ingested_yet".

export interface XMention {
  id: string;
  url: string;
  author: string;
  authorFollowers: number;
  text: string;
  createdUtc: number;
  favs: number;
  retweets: number;
  replies: number;
  views?: number;
  matchedKeywords: string[];
}

export interface XMentionsBlob {
  ts: number;
  ingestSource: string;
  mentions: XMention[];
}

const STATIC_FALLBACK = "https://plusx-mock.pages.dev/data/x_mentions.json";

export async function handleXMentions(env: { SNAPSHOTS: KVNamespace }): Promise<Response> {
  const fromKv = await env.SNAPSHOTS.get("x:mentions:latest");
  if (fromKv) {
    return new Response(fromKv, {
      headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json", "Cache-Control": "public, max-age=300", "X-Source": "kv" },
    });
  }

  try {
    const r = await fetch(STATIC_FALLBACK, { cf: { cacheTtl: 300, cacheEverything: true } });
    if (r.ok) {
      const body = await r.text();
      return new Response(body, {
        headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json", "Cache-Control": "public, max-age=300", "X-Source": "static-fallback" },
      });
    }
  } catch (_err) {
    // fall through to 503
  }

  return new Response(
    JSON.stringify({
      error: "not_ingested_yet",
      message: "X scrape pending - Jules sandbox dispatched, no PR merged yet. Endpoint hydrates when public/data/x_mentions.json lands in main.",
    }),
    { status: 503, headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json", "Cache-Control": "no-store" } }
  );
}
