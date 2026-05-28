export function MethodologyPanel() {
  return (
    <div>
      {/* Section 1 — Live: DAI-anchored price graph */}
      <div id="price-graph" className="glass-card p-5 mb-6">
        <h2 className="text-base font-semibold text-text-primary mb-1">
          Live — DAI-anchored price graph
        </h2>
        <p className="text-xs text-text-secondary mb-3">
          Token prices are resolved by routing each token through LPX pools to DAI, using the
          on-chain oracle peg of $1.00. The worker reruns this graph every 30 minutes.
        </p>
        <table className="w-full text-xs border-collapse mt-3">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left pb-2 pr-4 font-semibold text-text-primary">Metric</th>
              <th className="text-left pb-2 pr-4 font-semibold text-text-primary">Value</th>
              <th className="text-left pb-2 pr-4 font-semibold text-text-primary">Source</th>
              <th className="text-left pb-2 font-semibold text-text-primary">Cadence</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 text-text-secondary">LPX pool count</td>
              <td className="py-2 pr-4 text-text-secondary">live</td>
              <td className="py-2 pr-4">
                <code className="text-[10px] break-all text-text-tertiary">
                  https://plusx-mock-worker.x7t67f8tnq.workers.dev/api/price-graph → pool_count
                </code>
              </td>
              <td className="py-2 text-text-secondary">30 min (worker cron)</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 text-text-secondary">Total TVL (USD)</td>
              <td className="py-2 pr-4 text-text-secondary">live</td>
              <td className="py-2 pr-4">
                <code className="text-[10px] break-all text-text-tertiary">
                  same endpoint → total_tvl_usd
                </code>
              </td>
              <td className="py-2 text-text-secondary">30 min</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 text-text-secondary">Token price (any routable token)</td>
              <td className="py-2 pr-4 text-text-secondary">live</td>
              <td className="py-2 pr-4">
                <code className="text-[10px] break-all text-text-tertiary">
                  same endpoint → tokens[address].price_usd
                </code>
              </td>
              <td className="py-2 text-text-secondary">30 min</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 text-text-secondary">DAI peg anchor</td>
              <td className="py-2 pr-4 text-text-secondary">$1.00 (fixed)</td>
              <td className="py-2 pr-4">
                <code className="text-[10px] break-all text-text-tertiary">
                  PulseX V1 DAI-WPLS peg; on-chain oracle
                </code>
              </td>
              <td className="py-2 text-text-secondary">Fixed — not market rate</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Section 2 — Live: LPX Watcher API */}
      <div id="lpx-watcher" className="glass-card p-5 mb-6">
        <h2 className="text-base font-semibold text-text-primary mb-1">
          Live — LPX Watcher API
        </h2>
        <p className="text-xs text-text-secondary mb-3">
          Pool metadata (pool IDs, fund/anchor token pairs, liquidity ratios) is read from the
          PlusX Watcher service on every page load. TVL and volume are then enriched via
          DexScreener.
        </p>
        <table className="w-full text-xs border-collapse mt-3">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left pb-2 pr-4 font-semibold text-text-primary">Metric</th>
              <th className="text-left pb-2 pr-4 font-semibold text-text-primary">Value</th>
              <th className="text-left pb-2 pr-4 font-semibold text-text-primary">Source</th>
              <th className="text-left pb-2 font-semibold text-text-primary">Cadence</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 text-text-secondary">Active LPX pools</td>
              <td className="py-2 pr-4 text-text-secondary">live</td>
              <td className="py-2 pr-4">
                <code className="text-[10px] break-all text-text-tertiary">
                  https://lpx.plusx.app/watcher/LPXWatcher/SearchLPXs
                </code>
              </td>
              <td className="py-2 text-text-secondary">On page load (60s SWR refresh)</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 text-text-secondary">Pool fund/anchor pair</td>
              <td className="py-2 pr-4 text-text-secondary">live</td>
              <td className="py-2 pr-4">
                <code className="text-[10px] break-all text-text-tertiary">
                  same endpoint → fundToken, anchorToken
                </code>
              </td>
              <td className="py-2 text-text-secondary">On page load</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 text-text-secondary">Pool LP ratio</td>
              <td className="py-2 pr-4 text-text-secondary">live</td>
              <td className="py-2 pr-4">
                <code className="text-[10px] break-all text-text-tertiary">
                  same endpoint → computed from reserves
                </code>
              </td>
              <td className="py-2 text-text-secondary">On page load</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 text-text-secondary">Recent swaps (per pool)</td>
              <td className="py-2 pr-4 text-text-secondary">live</td>
              <td className="py-2 pr-4">
                <code className="text-[10px] break-all text-text-tertiary">
                  https://lpx.plusx.app/watcher/LPXWatcher/GetSwaps?poolId=N&take=200
                </code>
              </td>
              <td className="py-2 text-text-secondary">60s SWR refresh</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Section 3 — Live: DexScreener */}
      <div id="dexscreener" className="glass-card p-5 mb-6">
        <h2 className="text-base font-semibold text-text-primary mb-1">
          Live — DexScreener
        </h2>
        <p className="text-xs text-text-secondary mb-3">
          USD valuations for TVL, 24h volume, and token prices are sourced from DexScreener&apos;s
          public API. DexScreener aggregates on-chain PulseX pair data.
        </p>
        <table className="w-full text-xs border-collapse mt-3">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left pb-2 pr-4 font-semibold text-text-primary">Metric</th>
              <th className="text-left pb-2 pr-4 font-semibold text-text-primary">Value</th>
              <th className="text-left pb-2 pr-4 font-semibold text-text-primary">Source</th>
              <th className="text-left pb-2 font-semibold text-text-primary">Cadence</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 text-text-secondary">Pool TVL (USD)</td>
              <td className="py-2 pr-4 text-text-secondary">live</td>
              <td className="py-2 pr-4">
                <code className="text-[10px] break-all text-text-tertiary">
                  https://api.dexscreener.com/latest/dex/tokens/[address] → liquidity.usd
                </code>
              </td>
              <td className="py-2 text-text-secondary">60s SWR refresh</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 text-text-secondary">24h volume (USD)</td>
              <td className="py-2 pr-4 text-text-secondary">live</td>
              <td className="py-2 pr-4">
                <code className="text-[10px] break-all text-text-tertiary">
                  same endpoint → volume.h24
                </code>
              </td>
              <td className="py-2 text-text-secondary">60s SWR refresh</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 text-text-secondary">Token market price</td>
              <td className="py-2 pr-4 text-text-secondary">live</td>
              <td className="py-2 pr-4">
                <code className="text-[10px] break-all text-text-tertiary">
                  same endpoint → priceUsd
                </code>
              </td>
              <td className="py-2 text-text-secondary">60s SWR refresh</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 text-text-secondary">Pair created date</td>
              <td className="py-2 pr-4 text-text-secondary">live</td>
              <td className="py-2 pr-4">
                <code className="text-[10px] break-all text-text-tertiary">
                  same endpoint → pairCreatedAt
                </code>
              </td>
              <td className="py-2 text-text-secondary">On page load</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 text-text-secondary">Volatility index (top 10/50)</td>
              <td className="py-2 pr-4 text-text-secondary">live</td>
              <td className="py-2 pr-4">
                <code className="text-[10px] break-all text-text-tertiary">
                  https://plusx-mock-worker.x7t67f8tnq.workers.dev/api/volatility/top10
                </code>
              </td>
              <td className="py-2 text-text-secondary">60s SWR refresh</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Section 4 — Live: PulseChain RPC (ValidatorX) */}
      <div id="pulsechain-rpc" className="glass-card p-5 mb-6">
        <h2 className="text-base font-semibold text-text-primary mb-1">
          Live — PulseChain RPC (ValidatorX)
        </h2>
        <p className="text-xs text-text-secondary mb-3">
          ValidatorX staking data is read directly from the VController contract on PulseChain via
          JSON-RPC. Values shown in /validatorx/ are decoded from the raw ABI response.
        </p>
        <table className="w-full text-xs border-collapse mt-3">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left pb-2 pr-4 font-semibold text-text-primary">Metric</th>
              <th className="text-left pb-2 pr-4 font-semibold text-text-primary">Value</th>
              <th className="text-left pb-2 pr-4 font-semibold text-text-primary">Source</th>
              <th className="text-left pb-2 font-semibold text-text-primary">Cadence</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 text-text-secondary">PLS staked (total)</td>
              <td className="py-2 pr-4 text-text-secondary">live</td>
              <td className="py-2 pr-4">
                <code className="text-[10px] break-all text-text-tertiary">
                  eth_call rpc.pulsechain.com 0xa6dac0df... countView() word[0] x word[2]
                </code>
              </td>
              <td className="py-2 text-text-secondary">On page load</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 text-text-secondary">Staking APR</td>
              <td className="py-2 pr-4 text-text-secondary">live</td>
              <td className="py-2 pr-4">
                <code className="text-[10px] break-all text-text-tertiary">
                  same contract → countView() word[2] (1e18 scaled)
                </code>
              </td>
              <td className="py-2 text-text-secondary">On page load</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 text-text-secondary">Validator count</td>
              <td className="py-2 pr-4 text-text-secondary">live</td>
              <td className="py-2 pr-4">
                <code className="text-[10px] break-all text-text-tertiary">
                  same contract → selector 0xed612f8c
                </code>
              </td>
              <td className="py-2 text-text-secondary">On page load</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 text-text-secondary">uPLS exchange rate</td>
              <td className="py-2 pr-4 text-text-secondary">live</td>
              <td className="py-2 pr-4">
                <code className="text-[10px] break-all text-text-tertiary">
                  same contract → countView() word[0] (1e18 scaled)
                </code>
              </td>
              <td className="py-2 text-text-secondary">On page load</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 text-text-secondary">uPLS total supply</td>
              <td className="py-2 pr-4 text-text-secondary">live</td>
              <td className="py-2 pr-4">
                <code className="text-[10px] break-all text-text-tertiary">
                  eth_call uPLS ERC-20 0x7FB5120D... totalSupply() selector 0x18160ddd
                </code>
              </td>
              <td className="py-2 text-text-secondary">On page load</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Section 5 — Snapshot; id=story-card for deep-link from StoryShareCard */}
      <div id="story-card" className="glass-card p-5 mb-6">
        <h2 className="text-base font-semibold text-text-primary mb-1">
          Snapshot — cumulative on-chain metrics (20 March 2026)
        </h2>
        <p className="text-xs text-text-secondary mb-3">
          These figures require event-log scanning that cannot be done at render time. Values are
          from a counted log audit as of 20 March 2026 and will be updated periodically.
        </p>
        <table className="w-full text-xs border-collapse mt-3">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left pb-2 pr-4 font-semibold text-text-primary">Metric</th>
              <th className="text-left pb-2 pr-4 font-semibold text-text-primary">Value</th>
              <th className="text-left pb-2 pr-4 font-semibold text-text-primary">Source</th>
              <th className="text-left pb-2 font-semibold text-text-primary">Cadence</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 text-text-secondary">LPX swaps (cumulative)</td>
              <td className="py-2 pr-4 text-text-secondary">~198,000 · snapshot 20 Mar 2026</td>
              <td className="py-2 pr-4 text-text-tertiary">PulseX V1 + V2 router swap events</td>
              <td className="py-2 text-text-secondary">Point-in-time; updated manually</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 text-text-secondary">LPX routed volume via V1</td>
              <td className="py-2 pr-4 text-text-secondary">$28.3M · snapshot 20 Mar 2026</td>
              <td className="py-2 pr-4 text-text-tertiary">PulseX V1 router events</td>
              <td className="py-2 text-text-secondary">Point-in-time</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 text-text-secondary">LPX routed volume via V2</td>
              <td className="py-2 pr-4 text-text-secondary">$9.8M · snapshot 20 Mar 2026</td>
              <td className="py-2 pr-4 text-text-tertiary">PulseX V2 router events</td>
              <td className="py-2 text-text-secondary">Point-in-time</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 text-text-secondary">Total LPX routed volume</td>
              <td className="py-2 pr-4 text-text-secondary">$38.1M · snapshot 20 Mar 2026</td>
              <td className="py-2 pr-4 text-text-tertiary">V1 + V2 sum (counts every hop in multi-hop swaps)</td>
              <td className="py-2 text-text-secondary">Point-in-time</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 text-text-secondary">Avg impermanent loss</td>
              <td className="py-2 pr-4 text-text-secondary">≈ -0.3% · snapshot 02 Mar 2026</td>
              <td className="py-2 pr-4 text-text-tertiary">Sampled LP positions</td>
              <td className="py-2 text-text-secondary">Point-in-time</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 text-text-secondary">PLSX burn contribution</td>
              <td className="py-2 pr-4 text-text-secondary">$19,060 · snapshot 20 Mar 2026</td>
              <td className="py-2 pr-4 text-text-tertiary">Burn wallet, DAI-anchored</td>
              <td className="py-2 text-text-secondary">Point-in-time</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 text-text-secondary">LPX wallet holders</td>
              <td className="py-2 pr-4 text-text-secondary">1,062 · snapshot 20 Mar 2026</td>
              <td className="py-2 pr-4 text-text-tertiary">Router event log, unique addresses</td>
              <td className="py-2 text-text-secondary">Point-in-time</td>
            </tr>
          </tbody>
        </table>
        <div className="mt-4 pt-3 border-t border-border/50">
          <p className="text-[11px] text-text-tertiary leading-relaxed">
            <span className="font-semibold text-text-secondary">How the $38.1M is denominated.</span>{" "}
            Each swap&apos;s USD value is the DAI-anchored price{" "}
            <span className="italic">at the time of the trade</span>, summed across all V1 and V2
            router swap events. Multi-hop swaps contribute each constituent hop to the total — a
            $100 swap routed through two pools adds $200 to LPX-routed volume. The figure is not
            re-priced at a later snapshot date, so it remains stable against PLS price movements
            since the trade. On-chain proof: block 25412763, tx{" "}
            <code className="text-[10px] break-all">0x229f26314a43a295d8d681d50f7b2c094d198eab2284dd259bbaf9a3b8fc8135</code>.
          </p>
        </div>
      </div>

      {/* Section 6 — Not tracked */}
      <div id="not-tracked" className="glass-card p-5 mb-6">
        <h2 className="text-base font-semibold text-text-primary mb-1">Not tracked</h2>
        <p className="text-xs text-text-secondary mb-3">
          These metrics are sometimes cited elsewhere. We do not display them on plusx-mock because
          we cannot verify a live source or because the figure has no agreed methodology.
        </p>
        <table className="w-full text-xs border-collapse mt-3">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left pb-2 pr-4 font-semibold text-text-primary">Metric</th>
              <th className="text-left pb-2 font-semibold text-text-primary">Why not tracked</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 text-text-secondary">
                PulseChain total transactions (all-time)
              </td>
              <td className="py-2 text-text-tertiary">
                No public RPC endpoint returns this; block explorer APIs are not available for
                programmatic consumption.
              </td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 text-text-secondary">PulseX all-time volume</td>
              <td className="py-2 text-text-tertiary">
                No authenticated API exposes this; figures circulated publicly are unverified
                estimates.
              </td>
            </tr>
            <tr>
              <td className="py-2 pr-4 text-text-secondary">LPX circulating supply</td>
              <td className="py-2 text-text-tertiary">
                Not exposed by the Watcher API; totalSupply includes locked/burned amounts with no
                public breakdown.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
