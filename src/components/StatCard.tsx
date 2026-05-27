"use client";

import React from "react";
import { InfoTooltip } from "@/components/Tooltip";

interface StatCardProps {
  label: string;
  value: string;
  subtitle?: string;
  tooltipText?: string;
}

export function StatCard({ label, value, subtitle, tooltipText }: StatCardProps) {
  return (
    <div className="bg-white border border-border rounded-2xl p-6 flex flex-col justify-center h-[120px] shadow-sm">
      <div className="flex items-center gap-1.5 mb-1">
        <span className="text-[13px] font-medium text-text-secondary">{label}</span>
        {tooltipText && <InfoTooltip contentKey="" text={tooltipText} />}
      </div>
      <div className="text-[36px] font-bold text-brand-teal leading-tight">{value}</div>
      {subtitle && (
        <div className="text-[12px] text-text-tertiary mt-1">{subtitle}</div>
      )}
    </div>
  );
}
