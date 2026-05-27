"use client";

import React from "react";
import { useWallet } from "@/lib/useWallet";
import { Button } from "@/components/ui/button";
import { PoolIconPair } from "@/components/PoolPairIcons";
import { poolsData } from "@/lib/data";

export default function Portfolio() {
  const { isConnected, connect } = useWallet();
  const detail = poolsData.wplsDetail;

  if (!isConnected) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-20 text-center">
        <div className="max-w-md mx-auto p-10 bg-white border border-border rounded-3xl shadow-sm">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <PoolIconPair fundSymbol="WPLS" anchorSymbol="DAI(ETH)" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">Connect Wallet</h1>
          <p className="text-text-secondary mb-8 text-sm leading-relaxed">
            Connect your PulseChain wallet to view your active LPX positions and claim yield.
          </p>
          <Button onClick={connect} className="w-full bg-brand-teal hover:bg-brand-teal-dark text-white font-bold h-12 rounded-xl">
            Connect Wallet
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-6 lg:py-10">
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-2xl font-bold text-text-primary">Portfolio</h1>
        <div className="flex gap-4">
          <div className="bg-white border border-border rounded-2xl px-6 py-4 shadow-sm min-w-[180px]">
            <span className="text-xs font-medium text-text-secondary block mb-1">Total Portfolio Value</span>
            <span className="text-xl font-bold text-text-primary">$2,344.26</span>
          </div>
          <div className="bg-white border border-border rounded-2xl px-6 py-4 shadow-sm min-w-[180px]">
            <span className="text-xs font-medium text-text-secondary block mb-1">Claimable Yield</span>
            <span className="text-xl font-bold text-brand-teal-text">$20.32</span>
          </div>
          <div className="bg-white border border-border rounded-2xl px-6 py-4 shadow-sm min-w-[180px]">
            <span className="text-xs font-medium text-text-secondary block mb-1">PnL vs HODL</span>
            <span className="text-xl font-bold text-down">-2.45%</span>
          </div>
        </div>
      </div>

      <h2 className="text-lg font-bold text-text-primary mb-6">Positions</h2>
      <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border bg-slate-50">
              <th className="px-6 py-4 text-[13px] font-semibold text-text-secondary">Pool</th>
              <th className="px-6 py-4 text-[13px] font-semibold text-text-secondary">Share</th>
              <th className="px-6 py-4 text-[13px] font-semibold text-text-secondary">Fund</th>
              <th className="px-6 py-4 text-[13px] font-semibold text-text-secondary">Anchor</th>
              <th className="px-6 py-4 text-[13px] font-semibold text-text-secondary">Yield (7D)</th>
              <th className="px-6 py-4 text-[13px] font-semibold text-text-secondary">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border hover:bg-bg-row-hover transition-colors last:border-0">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <PoolIconPair fundSymbol="WPLS" anchorSymbol="DAI(ETH)" />
                  <span className="text-sm font-semibold text-text-primary">WPLS / DAI(ETH)</span>
                </div>
              </td>
              <td className="px-6 py-4 text-sm font-medium text-text-primary">{detail.myPosition.shareOfPool}</td>
              <td className="px-6 py-4 text-sm font-medium text-text-primary">{detail.myPosition.fundBalance}</td>
              <td className="px-6 py-4 text-sm font-medium text-text-primary">{detail.myPosition.anchorBalance}</td>
              <td className="px-6 py-4 text-sm font-bold text-brand-teal-text">{detail.myPosition.totalClaimableYield}</td>
              <td className="px-6 py-4">
                <div className="flex gap-2">
                  <Button className="bg-brand-teal hover:bg-brand-teal-dark text-white rounded-xl h-8 px-4 text-xs font-bold">
                    Claim
                  </Button>
                  <Button variant="outline" className="border-border rounded-xl h-8 px-4 text-xs font-bold">
                    View
                  </Button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
