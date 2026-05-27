"use client";

import React from "react";
import { InfoTooltip } from "@/components/Tooltip";
import { Sparkline } from "./Sparkline";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  changePercent: number;
  changeDirection: "up" | "down";
  changeLabel: string;
  sparklineData: Array<{ value: number }>;
  sparklineColor: string;
  tooltipKey: string;
}

export function StatCard({
  label,
  value,
  changePercent,
  changeDirection,
  changeLabel,
  sparklineData,
  sparklineColor,
  tooltipKey,
}: StatCardProps) {
  return (
    <div className="bg-white border border-border rounded-2xl p-6 flex flex-row items-center justify-between h-[120px] shadow-sm relative overflow-hidden">
      <div className="flex flex-col gap-1 z-10">
        <div className="flex items-center gap-1.5">
          <span className="text-[13px] font-medium text-text-secondary">{label}</span>
          <InfoTooltip contentKey={tooltipKey} />
        </div>
        <div className="text-[36px] font-bold text-brand-teal leading-tight">{value}</div>
        <div className="flex items-center gap-1.5 text-[12px]">
          <span
            className={cn(
              "font-medium flex items-center gap-0.5",
              changeDirection === "up" ? "text-up" : "text-down"
            )}
          >
            {changeDirection === "up" ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5" />
            )}
            {changeDirection === "up" ? "▲" : "▼"} {changePercent.toFixed(2)}%
          </span>
          <span className="text-text-tertiary">{changeLabel}</span>
        </div>
      </div>
      <div className="absolute right-0 bottom-0 w-1/2 h-[60px] opacity-60">
        <Sparkline data={sparklineData} color={sparklineColor} />
      </div>
    </div>
  );
}
