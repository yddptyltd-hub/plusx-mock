"use client";

import React, { useState } from "react";
import { Settings, ArrowDown, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TokenIcon } from "@/components/PoolPairIcons";
import { poolsData } from "@/lib/data";

export default function UDEX() {
  const [payAmount, setPayAmount] = useState("");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-20 flex justify-center">
      <div className="w-full max-w-[480px] bg-white border border-border rounded-[24px] p-4 sm:p-6 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-text-primary">Swap</h1>
          <Settings className="w-5 h-5 text-text-secondary cursor-pointer hover:text-brand-teal transition-colors" />
        </div>

        <div className="space-y-1 relative">
          <div className="p-4 bg-slate-50 border border-transparent focus-within:border-brand-teal rounded-2xl transition-all">
            <div className="flex justify-between mb-2">
              <span className="text-xs font-medium text-text-secondary">You pay</span>
              <span className="text-xs font-medium text-text-secondary">Balance: 0.00</span>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 bg-white border border-border rounded-full pl-1.5 pr-3 py-1.5 hover:border-brand-teal transition-all">
                <TokenIcon symbol="WPLS" size={24} />
                <span className="text-sm font-bold">WPLS</span>
                <ChevronDown className="w-4 h-4 text-text-tertiary" />
              </button>
              <input
                type="number"
                placeholder="0"
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                className="flex-1 text-2xl font-bold text-right bg-transparent outline-none placeholder:text-text-tertiary"
              />
            </div>
          </div>

          <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 z-10">
            <button className="w-10 h-10 rounded-xl bg-white border border-border flex items-center justify-center shadow-sm hover:border-brand-teal group transition-all">
              <ArrowDown className="w-5 h-5 text-text-tertiary group-hover:text-brand-teal" />
            </button>
          </div>

          <div className="p-4 bg-slate-50 border border-transparent focus-within:border-brand-teal rounded-2xl transition-all pt-6">
            <div className="flex justify-between mb-2">
              <span className="text-xs font-medium text-text-secondary">You receive</span>
              <span className="text-xs font-medium text-text-secondary">Balance: 0.00</span>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 bg-white border border-border rounded-full pl-1.5 pr-3 py-1.5 hover:border-brand-teal transition-all">
                <TokenIcon symbol="DAI(ETH)" size={24} />
                <span className="text-sm font-bold">DAI(ETH)</span>
                <ChevronDown className="w-4 h-4 text-text-tertiary" />
              </button>
              <div className="flex-1 text-2xl font-bold text-right text-text-tertiary">0</div>
            </div>
          </div>
        </div>

        <div className="mt-4 p-4 space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-text-secondary">Route</span>
            <span className="text-text-primary font-medium truncate max-w-[200px] text-right">WPLS → DAI(ETH) via LPX #1</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-text-secondary">Price Impact</span>
            <span className="text-up font-medium">0.12%</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-text-secondary">Slippage</span>
            <span className="text-text-primary font-medium">0.5%</span>
          </div>
        </div>

        <Button className="w-full mt-6 bg-brand-teal hover:bg-brand-teal-dark text-white font-bold h-12 rounded-xl text-[15px]">
          Swap
        </Button>
      </div>
    </div>
  );
}
