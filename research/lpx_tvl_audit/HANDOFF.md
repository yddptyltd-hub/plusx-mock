<!-- LPX TVL audit — research/lpx_tvl_audit/HANDOFF.md -->
<!-- Started: 2026-05-27T12:15:00+10:00 -->
<!-- Owner agent: agy -->
<!-- Status: DONE — shipped 2026-05-27 -->

# Handoff — LPX TVL research — status=DONE

Canonical formula shipped in src/lib/livePools.ts:
  tvlUsd = fundReserveAmount * getTokenPriceUsd(fund)
         + anchorReserveAmount * getTokenPriceUsd(anchor)

DAI(ETH) oracle peg = exactly $1.00. fundImgRaw/anchorImgRaw = virtual, never included.

Live-verified (Playwright 2026-05-27):
- WPLS/DAI TVL: $18.6K (range $15K-$25K) PASS
- Total TVL KPI: $3.1M (range $2.5M-$4M) PASS
- No $2.7B anywhere PASS

Tests: npm run test 7/7, npm run test:live 4/4, npm run build OK.
Screenshots: ~/plusx_mock_refs/v1_1_2_FINAL_dashboard.png + _detail.png
