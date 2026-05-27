"use client";

import React from "react";
import { InfoTooltip } from "@/components/Tooltip";
import { cn } from "@/lib/utils";

interface DetailStatCardProps {
  label: string;
  value: string;
  subValue?: string;
  subValueColor?: "up" | "down";
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  tooltipKey: string;
}

export function DetailStatCard({
  label,
  value,
  subValue,
  subValueColor,
  icon,
  iconBg,
  iconColor,
  tooltipKey,
}: DetailStatCardProps) {
  return (
    <div className="bg-white border border-border rounded-2xl p-4 flex items-center gap-4 shadow-sm flex-1">
      <div
        className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
          iconBg
        )}
        style={{ color: iconColor }}
      >
        {icon}
      </div>
      <div className="flex flex-col">
        <div className="flex items-center gap-1">
          <span className="text-[13px] font-medium text-text-secondary">{label}</span>
          <InfoTooltip contentKey={tooltipKey} />
        </div>
        <div className="text-[20px] font-bold text-text-primary leading-tight">{value}</div>
        {subValue && (
          <div
            className={cn(
              "text-[11px] font-medium",
              subValueColor === "up" ? "text-up" : subValueColor === "down" ? "text-down" : "text-text-tertiary"
            )}
          >
            {subValue}
          </div>
        )}
      </div>
    </div>
  );
}
