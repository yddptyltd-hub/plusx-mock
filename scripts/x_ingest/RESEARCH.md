# X Scraping Landscape 2026

## Phase A — Research

| Tool | Repo | Last commit | Login required | Guest-account flow | Confirmed working as of (date + URL) | Confirmed broken as of (date + URL) | Verdict |
|------|------|-------------|----------------|--------------------|--------------------------------------|-------------------------------------|---------|
| twscrape | vladkens/twscrape | 2026-05-23 | Yes | No | | 2026-05-21 (Requires login, crashes on login/bot detection page #305 https://github.com/vladkens/twscrape/issues/305) | BROKEN |
| Scweet | Altimis/Scweet | 2026-05-19 | Yes | No | | 2026-05-18 (Could not locate login Element #116 https://github.com/Altimis/Scweet/issues/116) | BROKEN |
| twikit | d60/twikit | 2026-03-10 | Yes | No | | 2026-05-27 (SearchTimeline 404 #419 https://github.com/d60/twikit/issues/419; Need wait auth_token extractor #427 https://github.com/d60/twikit/issues/427) | BROKEN |
| tweety | mahrtayyab/tweety | 2026-03-22 | Yes | No | | 2026-03-30 (SearchTimeline migrate from GET to POST #292 https://github.com/mahrtayyab/tweety/issues/292) | BROKEN |
| x-tweet-fetcher | ythx-101/x-tweet-fetcher | 2026-05-24 | Yes/Nitter | No | | 2026-05-18 (Nitter and Playwright both fail #67 https://github.com/ythx-101/x-tweet-fetcher/issues/67) | BROKEN |
| snscrape | JustAnotherArchivist/snscrape | 2026-05-26 | No | Yes | | 2026-05-26 (All Twitter scrapes failing blocked 404 #996 https://github.com/JustAnotherArchivist/snscrape/issues/996) | BROKEN |

## Phase B — Empirical bench results

* `twscrape`: FAILED. Requires authenticated accounts (returns `No active accounts. Stopping...` if guest). (Tested in `scripts/x_ingest/probe_twscrape.py`)
* `twikit`: FAILED. `Error: Couldn't get KEY_BYTE indices`. Requires login. (Tested in `scripts/x_ingest/probe_twikit.py`)
* `snscrape`: FAILED. `AttributeError: 'FileFinder' object has no attribute 'find_module'`. Currently incompatible with Python 3.12, and issues report `blocked (404)` regardless. (Tested in `scripts/x_ingest/probe_snscrape.py`)

No tools tested returned any successful tweets.
