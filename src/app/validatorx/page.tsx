"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { TokenIcon } from "@/components/PoolPairIcons";
import { ShieldCheck } from "lucide-react";

const VALIDATORS = [
  { id: 1, name: "Alpha Node", status: "Active", staked: "1.2B PLS", apr: "8.4%", uptime: "99.9%" },
  { id: 2, name: "Nexus Staking", status: "Active", staked: "850M PLS", apr: "8.2%", uptime: "99.8%" },
  { id: 3, name: "Validator Prime", status: "Active", staked: "2.1B PLS", apr: "8.5%", uptime: "100%" },
  { id: 4, name: "Pulse Guard", status: "Active", staked: "430M PLS", apr: "8.1%", uptime: "99.7%" },
  { id: 5, name: "Zenith Node", status: "Active", staked: "1.5B PLS", apr: "8.3%", uptime: "99.9%" },
];

export default function ValidatorX() {
  return (
    <div className="max-w-7xl mx-auto px-12 py-10">
      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-8">
          <h2 className="text-xl font-bold text-text-primary mb-6">Validators</h2>
          <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border bg-slate-50">
                  <th className="px-6 py-4 text-[13px] font-semibold text-text-secondary">Validator</th>
                  <th className="px-6 py-4 text-[13px] font-semibold text-text-secondary">Status</th>
                  <th className="px-6 py-4 text-[13px] font-semibold text-text-secondary">Staked</th>
                  <th className="px-6 py-4 text-[13px] font-semibold text-text-secondary">APR</th>
                  <th className="px-6 py-4 text-[13px] font-semibold text-text-secondary">Uptime</th>
                  <th className="px-6 py-4 text-[13px] font-semibold text-text-secondary">Actions</th>
                </tr>
              </thead>
              <tbody>
                {VALIDATORS.map((v) => (
                  <tr key={v.id} className="border-b border-border hover:bg-bg-row-hover transition-colors last:border-0">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                          <ShieldCheck className="w-4 h-4 text-brand-teal" />
                        </div>
                        <span className="text-sm font-semibold text-text-primary">{v.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-0.5 rounded-full border border-brand-teal text-[11px] font-bold text-brand-teal">
                        {v.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-text-primary">{v.staked}</td>
                    <td className="px-6 py-4 text-sm font-bold text-brand-teal-text">{v.apr}</td>
                    <td className="px-6 py-4 text-sm text-text-secondary">{v.uptime}</td>
                    <td className="px-6 py-4">
                      <Button variant="outline" className="border-brand-teal text-brand-teal hover:bg-brand-teal-light rounded-xl h-8 px-4 text-xs font-bold">
                        Stake
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="col-span-4">
          <div className="bg-white border border-border rounded-2xl p-6 shadow-sm sticky top-24">
            <h2 className="text-lg font-bold text-text-primary mb-6">Stake PLS</h2>
            <div className="space-y-6">
              <div className="p-4 bg-slate-50 border border-transparent focus-within:border-brand-teal rounded-xl transition-all">
                <div className="flex justify-between mb-2">
                  <span className="text-xs font-medium text-text-secondary">Amount</span>
                  <span className="text-xs font-medium text-text-secondary">Balance: 0.00 PLS</span>
                </div>
                <div className="flex items-center gap-3">
                  <TokenIcon symbol="WPLS" size={24} />
                  <input
                    type="number"
                    placeholder="0"
                    className="flex-1 text-xl font-bold text-right bg-transparent outline-none placeholder:text-text-tertiary"
                  />
                  <button className="bg-brand-teal-light text-brand-teal text-[10px] font-bold px-2 py-0.5 rounded-md hover:bg-brand-teal hover:text-white transition-all">
                    MAX
                  </button>
                </div>
              </div>

              <div className="p-4 bg-brand-teal-light/30 border border-brand-teal/20 rounded-xl">
                <span className="text-xs text-text-secondary block mb-1">Estimated Yield</span>
                <div className="text-xl font-bold text-brand-teal">0.00 PLS / year</div>
                <span className="text-[10px] text-text-tertiary">Approx. 8.32% APR</span>
              </div>

              <Button className="w-full bg-brand-teal hover:bg-brand-teal-dark text-white font-bold h-12 rounded-xl text-[15px]">
                Connect Wallet to Continue
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
