#!/usr/bin/env python3
"""Snapshot DexScreener prices for every token in the LPX universe.
Writes public/data/prices.json with the same shape the worker expects.

LPX pools are managed bid/ask market liquidity — NOT 50/50 AMMs.
Prices are derived ONLY from external PulseX V1/V2 pairs via DexScreener BFS to DAI(ETH).
LPX_MAIN reserve ratios are NEVER used for price (they reflect zone positioning, not market price).
"""

import json
import requests
import time
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
DAI = "0xefd766ccb38eaf1dfd701853bfce31359239f305"
UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/130.0.0.0 Safari/537.36"

# 1. Fetch the LPX pool list to discover the token universe
pools_resp = requests.post(
    "https://lpx.plusx.app/watcher/LPXWatcher/SearchLPXs",
    json={
        "request": {
            "skip": 0,
            "take": 100,
            "sid": "",
            "forWalletAdr": "",
            "forToken": "",
            "isFilterPorfolio": False,
            "isFilterManager": False,
            "isFilterOnlySolo": False,
        }
    },
    headers={"Content-Type": "application/json"},
    timeout=30,
)
pools = pools_resp.json()
tokens = {}
for p in pools:
    for t in (p["fundToken"], p["anchorToken"]):
        a = t["erc20Address"].lower()
        if a not in tokens:
            tokens[a] = {"symbol": t["symbol"], "decimals": t["decimals"]}

print(f"Discovered {len(tokens)} unique tokens across {len(pools)} LPX pools")

# 2. Fetch DexScreener for each token. Filter to pulsechain chainId pairs.
pair_cache = {DAI: []}
for addr in tokens:
    if addr == DAI:
        continue
    r = requests.get(
        f"https://api.dexscreener.com/latest/dex/tokens/{addr}",
        headers={"User-Agent": UA},
        timeout=15,
    )
    if r.ok:
        data = r.json()
        pair_cache[addr] = [
            p for p in (data.get("pairs") or []) if p.get("chainId") == "pulsechain"
        ]
    else:
        pair_cache[addr] = []
    time.sleep(0.2)  # gentle rate limit

# 3. BFS price resolution to DAI, up to 4 hops
prices = {
    DAI: {
        "price_usd": 1.0,
        "route": "DAI(ETH) oracle peg",
        "hops": 0,
        "liquidity_used_usd": None,
    }
}


def try_resolve(addr, max_hops):
    pairs = sorted(
        pair_cache.get(addr, []),
        key=lambda p: -(p.get("liquidity", {}).get("usd") or 0),
    )
    for p in pairs:
        base = p["baseToken"]["address"].lower()
        quote = p["quoteToken"]["address"].lower()
        other = quote if base == addr else base
        if other not in prices:
            continue
        oth = prices[other]
        if oth["price_usd"] is None or oth["hops"] + 1 > max_hops:
            continue
        try:
            pn = float(p["priceNative"])
        except:
            continue
        if pn <= 0:
            continue
        price = pn * oth["price_usd"] if base == addr else (1 / pn) * oth["price_usd"]
        if price <= 0:
            continue
        liq = (p.get("liquidity") or {}).get("usd") or 0
        return {
            "price_usd": price,
            "route": f"{oth['hops'] + 1}-hop via {tokens.get(other, {}).get('symbol', other[:6])} (liq ${liq:,.0f})",
            "hops": oth["hops"] + 1,
            "liquidity_used_usd": liq,
        }
    return None


for max_hops in [1, 2, 3, 4]:
    progress = True
    while progress:
        progress = False
        for addr in tokens:
            if addr in prices:
                continue
            r = try_resolve(addr, max_hops)
            if r:
                prices[addr] = r
                progress = True

# 4. Mark unresolved — NO reserve-ratio fallback (LPX pools are NOT 50/50 AMMs)
for addr in tokens:
    if addr not in prices:
        prices[addr] = {
            "price_usd": None,
            "route": "UNRESOLVED (no 50/50 PulseX pair found)",
            "hops": -1,
            "liquidity_used_usd": None,
        }

# 5. Write to public/data/prices.json
output = {
    "ts": int(time.time()),
    "snapshot_source": "DexScreener via host (macOS)",
    "anchor": {"address": DAI, "symbol": "DAI(ETH)", "price_usd": 1.00},
    "tokens": {addr: {**tokens[addr], **prices[addr]} for addr in tokens},
}
out_path = REPO / "public" / "data" / "prices.json"
out_path.parent.mkdir(parents=True, exist_ok=True)
out_path.write_text(json.dumps(output, indent=2))
resolved = sum(1 for t in output["tokens"].values() if t["price_usd"] is not None)
print(f"Wrote {out_path}: {resolved}/{len(tokens)} tokens resolved")

# Print WPLS price as sanity check
WPLS = "0xa1077a294dde1b09bb078844df40758a5d0f9a27"
wpls_entry = output["tokens"].get(WPLS)
if wpls_entry:
    print(f"WPLS price: ${wpls_entry['price_usd']:.6e}  route: {wpls_entry['route']}")
else:
    print("WPLS not found in token universe")
