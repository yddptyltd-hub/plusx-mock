---
target_repo: yddptyltd-hub/plusx-mock
title: v3.0 research — survey free social-listening sources for PlusX + LPX mentions
priority: high
requested_by: yahya
files_touched:
  - research/social_listening_survey.md
  - research/sample_data/twitter_mentions.json
  - research/sample_data/reddit_mentions.json
  - research/sample_data/brave_search_results.json
constraint: find-dont-assume-verify-with-real-queries
contract_invariant: verbatim-tweet-text-only-no-fabrication
mandate: survey-then-report-do-not-build-yet
---

# Research mission: survey free social-listening sources

You are a researcher, not a builder. Your job is to FIND OUT what's actually possible TODAY for monitoring crypto-Twitter/X mentions of PlusX, LPX, and PulseChain liquidity-pool discussions — using only free tools. Report verified findings. Build NOTHING beyond the research output files.

## Context

Yahya is a cofounder of PlusX (a DeFi liquidity-pool product on PulseChain at plusx.app). He wants to:

1. **Defensive**: track who is mentioning PlusX / LPX / PulseChain liquidity online so the team can see sentiment + respond to community.
2. **Offensive (more important)**: learn what tweet styles, topics, formats get traction in crypto-X for similar products. Goal: model successful crypto tweets to grow the PlusX community.

Twitter's official API is paid ($200/month Basic minimum, $5000/month Pro for proper search). Yahya wants free.

## RESEARCH DISCIPLINE — find, don't assume

For every claim you make, quote the verbatim source: URL + the exact returned data (tweet text, JSON keys, error message, screenshot path).

If you cannot find verifiable evidence after a fair attempt at a source, report CANNOT FIND with the attempt log. Do NOT guess. Do NOT infer. Do NOT report a "probable" answer.

Words banned in your output: assume, probably, likely, presumably, should be, I think, I guess, my guess. If you find yourself reaching for these, you have not finished the research. Replace with the quoted evidence or with CANNOT FIND.

## Sources to test (in priority order)

For EACH source: make 1-3 real requests, save the raw response, count the results, quote 3 examples verbatim.

### 1. Nitter mirrors (open-source Twitter frontends, scrapable)
Public list of Nitter instances changes frequently. Test 5-8 different mirrors. Many will be dead or rate-limited.

Test URL pattern: `https://<nitter-instance>/search?f=tweets&q=PlusX&since=2025-01-01`

Suggested instances to try (verify each works first):
- nitter.net
- nitter.poast.org
- nitter.privacydev.net
- nitter.fdn.fr
- nitter.kavin.rocks
- nitter.unixfox.eu
- nitter.1d4.us
- nitter.salastil.com

Queries to run on whatever works:
- `PlusX`
- `LPX PulseChain`
- `PulseChain liquidity pool`
- `WPLS yield`
- `HEX LP`

For each successful query, save the raw HTML to `research/sample_data/nitter_<instance>_<query>.html` and extract tweet count + top 5 tweet texts.

### 2. Brave Search API
Free tier: 2000 queries/month, no credit card. Test endpoint:
- `https://api.search.brave.com/res/v1/web/search?q=PlusX+pulsechain` — needs API key OR
- Without key, scrape Brave Search frontend: `https://search.brave.com/search?q=PlusX+pulsechain`

Test both paths. Save responses.

### 3. Google web (no API)
- Scrape `https://www.google.com/search?q=site%3Ax.com+%22PlusX%22+pulsechain` — Google blocks bots heavily but worth a real attempt.
- Save the response or the CAPTCHA page if blocked.

### 4. Google Custom Search Engine (CSE) — free 100 queries/day, REQUIRES API key
Skip this unless you can self-register a key in your sandbox. If you can't, report "needs key from orchestrator" and move on.

### 5. Reddit JSON feeds (no auth needed)
Test these endpoints:
- `https://www.reddit.com/r/PulseChain/search.json?q=LPX&restrict_sr=1&sort=new&t=year`
- `https://www.reddit.com/r/PulseChain/search.json?q=PlusX&restrict_sr=1&sort=new&t=year`
- `https://www.reddit.com/r/PulseChain/hot.json?limit=50`
- `https://www.reddit.com/r/HEX/search.json?q=liquidity+pool&restrict_sr=1`
- `https://www.reddit.com/r/CryptoCurrency/search.json?q=PulseChain+LPX&restrict_sr=1`

Save full JSON responses. Reddit has CORS restrictions on `.json` but should work from your sandbox (you're server-side).

### 6. LunarCrush (crypto-specific social aggregator)
Has a public read API at `https://lunarcrush.com/api3/` — some endpoints free, some require key. Test their public endpoints for PulseChain / HEX / PlusX coverage:
- `https://lunarcrush.com/api3/coins/insights?symbol=hex`
- `https://lunarcrush.com/api3/coins?symbol=hex`

Save responses. If they have data on PLS or HEX, that's a proxy signal — actual PlusX/LPX would be too niche for LunarCrush.

### 7. RSSHub (open-source, can wrap Twitter)
Many RSSHub instances. Test:
- `https://rsshub.app/twitter/keyword/PlusX`
- `https://rsshub.app/twitter/user/plusx_app` (if account handle exists)

Save responses.

### 8. Verify whether @plusx_app or @plusx have official Twitter accounts
Search the web for "PlusX official Twitter" — verify what handle to track. Save the result.

## Marketing-intel layer (Yahya's bigger goal)

For EACH source where you successfully retrieve tweets, also run these meta-queries:

- `WPLS LP yield` — what tweets in the PulseChain LP space get traction
- `PulseX liquidity pool` (their competitor)
- `HEX LP yield` (related token)
- `DeFi LP impermanent loss` (general topic)

For the TOP 10 highest-engagement tweets (likes or RTs) you find, document:
- Tweet text verbatim
- Author handle
- Engagement counts
- A pattern observation: format (numbered list / thread / image / video / single line), tone (educational / shill / contrarian / meme), CTA present (yes/no), hashtag count

This becomes Yahya's marketing playbook.

## Deliverables

Create these files in the repo:

### `research/social_listening_survey.md`
Long-form report. Required sections:

1. **Sources tested**: table of source → URL → HTTP status → result count → "works/dead/blocked".
2. **Top sources by signal**: ranked 1-N by usefulness for our query set, with the quantitative evidence.
3. **Verbatim sample tweets**: for the top 2-3 working sources, paste 5-10 actual tweet texts (or post titles) we found that mention PlusX, LPX, PulseChain liquidity.
4. **Marketing pattern analysis**: 10-15 high-engagement tweets you found, with the pattern observations.
5. **Architecture recommendation**: based on what actually works, recommend a 3-source pipeline for the CF Worker cron to scrape every N hours.
6. **Known blockers / gaps**: be honest about what we can't reach for free (e.g., Twitter blue-check verification, deep engagement counts, etc.).
7. **CANNOT FIND list**: what we tried that returned nothing.

### `research/sample_data/`
Raw responses for each query. JSON or HTML files. Each ≤ 1MB to keep the PR diff manageable.

## Hard rules — anti-fabrication

- Tweet texts MUST be copy-pasted from the raw response. Do not paraphrase or summarize.
- Engagement numbers MUST come from the response. Do not infer.
- If a source returns 0 results for "PlusX", report 0. Do not pad with "but if we expanded the query, we'd find...".
- If 5 sources fail, the report ends after listing those 5 failures + the 1-2 that worked. Pro is honest about negative results.

## What NOT to do

- Do NOT build the CF Worker. That's v3.0a, separate work after Yahya reviews this research.
- Do NOT modify the /mock app. Research files only.
- Do NOT propose paid sources. We're surveying FREE only. (You can mention them in passing in section 7 "what would unlock if we paid", but the focus is free.)
- Do NOT post or tweet anything yourself. Read-only research.
- Do NOT use the user's wallet, API keys, or any auth. Anonymous scraping only.

## Final step

Open a PR titled `research: v3.0 social listening source survey + marketing-intel sample`. Body:
- Summary: which sources work, top finding (specific tweet or pattern that surprised you)
- Link to the report
- Estimated time to build v3.0a (CF Worker cron + KV + /pulse page) based on what's available

Do not merge. Orchestrator reviews + decides scope.
