"use client";

import React, { useState } from "react";
import { TokenIcon } from "@/components/PoolPairIcons";
import { Button } from "@/components/ui/button";
import { Plus, ChevronDown } from "lucide-react";
import { useWallet } from "@/lib/useWallet";

interface AddLiquidityPanelProps {
  pair: string[];
}

export function AddLiquidityPanel({ pair }: AddLiquidityPanelProps) {
  const { isConnected } = useWallet();
  const [amount1, setAmount1] = useState("");
  const [amount2, setAmount2] = useState("");

  const handleAmount1Change = (val: string) => {
    setAmount1(val);
    setAmount2(val); // Mock proportional input
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="p-4 bg-white border border-border rounded-2xl flex items-center justify-between focus-within:border-brand-teal focus-within:ring-2 focus-within:ring-brand-teal/10 transition-all">
          <div className="flex items-center gap-3">
            <TokenIcon symbol={pair[0]} size={32} />
            <div className="flex flex-col">
              <span className="text-sm font-bold text-text-primary flex items-center gap-1 cursor-pointer">
                {pair[0]} <ChevronDown className="w-4 h-4 text-text-tertiary" />
              </span>
              <span className="text-xs text-text-secondary">Balance: 0.00</span>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <input
              type="number"
              placeholder="0.00"
              value={amount1}
              onChange={(e) => handleAmount1Change(e.target.value)}
              className="text-2xl font-bold text-right w-full bg-transparent outline-none placeholder:text-text-tertiary"
            />
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-tertiary">$0.00</span>
              <button className="bg-brand-teal-light text-brand-teal text-[10px] font-bold px-2 py-0.5 rounded-md hover:bg-brand-teal hover:text-white transition-all">
                MAX
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-center -my-2 relative z-10">
          <div className="w-8 h-8 rounded-full bg-white border border-border flex items-center justify-center shadow-sm">
            <Plus className="w-4 h-4 text-text-tertiary" />
          </div>
        </div>

        <div className="p-4 bg-white border border-border rounded-2xl flex items-center justify-between focus-within:border-brand-teal focus-within:ring-2 focus-within:ring-brand-teal/10 transition-all">
          <div className="flex items-center gap-3">
            <TokenIcon symbol={pair[1]} size={32} />
            <div className="flex flex-col">
              <span className="text-sm font-bold text-text-primary flex items-center gap-1 cursor-pointer">
                {pair[1]} <ChevronDown className="w-4 h-4 text-text-tertiary" />
              </span>
              <span className="text-xs text-text-secondary">Balance: 0.00</span>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <input
              type="number"
              placeholder="0.00"
              value={amount2}
              readOnly
              className="text-2xl font-bold text-right w-full bg-transparent outline-none placeholder:text-text-tertiary"
            />
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-tertiary">$0.00</span>
              <button className="bg-brand-teal-light text-brand-teal text-[10px] font-bold px-2 py-0.5 rounded-md hover:bg-brand-teal hover:text-white transition-all">
                MAX
              </button>
            </div>
          </div>
        </div>
      </div>

      <Button
        disabled={!isConnected || !amount1}
        onClick={() => {}}
        className="w-full bg-brand-teal hover:bg-brand-teal-dark text-white font-bold h-12 rounded-xl text-[15px] disabled:bg-slate-100 disabled:text-text-tertiary"
      >
        {isConnected ? (amount1 ? "Add Liquidity" : "Enter an Amount") : "Connect Wallet to Continue"}
      </Button>
    </div>
  );
}
