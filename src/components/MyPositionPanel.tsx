"use client";

import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { InfoTooltip } from "@/components/Tooltip";
import { Button } from "@/components/ui/button";

interface MyPositionPanelProps {
  data: {
    shareOfPool: string;
    fundBalance: string;
    anchorBalance: string;
    makerYield7d: string;
    arbitrageYield7d: string;
    totalClaimableYield: string;
  };
}

export function MyPositionPanel({ data }: MyPositionPanelProps) {
  const chartData = [
    { name: "Fund", value: 50, color: "#8B5CF6" },
    { name: "Anchor", value: 50, color: "#00D4AA" },
  ];

  return (
    <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-semibold text-text-primary">My Position</h3>
        <InfoTooltip contentKey="myPosition" />
      </div>

      <div className="flex items-center gap-8 mb-8">
        <div className="w-[130px] h-[130px] relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                innerRadius={40}
                outerRadius={65}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[20px] font-bold text-text-primary leading-none">
              {data.shareOfPool}
            </span>
            <span className="text-[11px] text-text-secondary">Share of Pool</span>
          </div>
        </div>

        <div className="flex-1 grid gap-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-text-secondary">Fund Balance</span>
            <span className="font-medium text-text-primary">{data.fundBalance}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-text-secondary">Anchor Balance</span>
            <span className="font-medium text-text-primary">{data.anchorBalance}</span>
          </div>
          <div className="h-px bg-slate-50 my-1" />
          <div className="flex justify-between items-center text-sm">
            <span className="text-text-secondary">Maker Yield (7D)</span>
            <span className="font-semibold text-brand-teal-text">{data.makerYield7d}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-text-secondary">Arbitrage Yield (7D)</span>
            <span className="font-semibold text-brand-teal-text">{data.arbitrageYield7d}</span>
          </div>
          <div className="flex justify-between items-center text-sm font-bold">
            <span className="text-text-primary">Total Claimable Yield</span>
            <span className="text-brand-teal-text">{data.totalClaimableYield}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <Button className="w-full bg-brand-teal hover:bg-brand-teal-dark text-white font-semibold rounded-xl h-11 transition-all">
          Claim Yield
        </Button>
        <Button variant="outline" className="w-full border-2 border-border hover:border-brand-teal hover:text-brand-teal font-semibold rounded-xl h-11 transition-all">
          Zap Yield into Pool
        </Button>
      </div>
    </div>
  );
}
