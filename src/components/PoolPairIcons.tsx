"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { getTokenIcon } from "@/lib/tokenIcons";

interface TokenIconProps {
  symbol: string;
  size?: number;
  className?: string;
}

const FALLBACK_COLORS: Record<string, string> = {
  WPLS: "bg-gradient-to-br from-[#8B5CF6] to-[#00D4AA]",
  DAI: "bg-[#F59E0B]",
  "DAI(ETH)": "bg-[#F59E0B]",
  HEX: "bg-[#DC2626]",
  PLSX: "bg-[#7C3AED]",
  "eHEX(ETH)": "bg-[#EA580C]",
  INC: "bg-[#059669]",
  uPLS: "bg-[#0891B2]",
  uPX: "bg-[#4F46E5]",
  uP: "bg-[#7C3AED]",
  AXIS: "bg-[#64748B]",
  SOLIDX: "bg-[#2563EB]",
  FIRE: "bg-[#EF4444]",
};

export function TokenIcon({ symbol, size = 32, className }: TokenIconProps) {
  const iconPath = getTokenIcon(symbol);
  const [errored, setErrored] = useState(false);
  const showFallback = !iconPath || errored;

  if (showFallback) {
    const colorClass = FALLBACK_COLORS[symbol] || "bg-[#64748B]";
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-full text-[10px] font-bold text-white shadow-sm shrink-0",
          colorClass,
          className,
        )}
        style={{ width: size, height: size }}
        aria-label={symbol}
      >
        {symbol.substring(0, 2).toUpperCase()}
      </div>
    );
  }

  return (
    <img
      src={iconPath}
      alt={symbol}
      width={size}
      height={size}
      onError={() => setErrored(true)}
      className={cn("rounded-full shrink-0 bg-white object-cover", className)}
      style={{ width: size, height: size }}
    />
  );
}

export function PoolIconPair({
  fundSymbol,
  anchorSymbol,
  size = 32,
}: {
  fundSymbol: string;
  anchorSymbol: string;
  size?: number;
}) {
  return (
    <div className="flex -space-x-2">
      <TokenIcon symbol={fundSymbol} size={size} className="ring-2 ring-white z-10" />
      <TokenIcon symbol={anchorSymbol} size={size} className="ring-2 ring-white z-0" />
    </div>
  );
}
