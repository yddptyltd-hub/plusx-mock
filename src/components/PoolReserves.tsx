import React from "react";
import { TokenIcon } from "@/components/PoolPairIcons";

interface PoolReservesProps {
  reserves: {
    fund: { symbol: string; amount: string; amountUsd: string };
    anchor: { symbol: string; amount: string; amountUsd: string };
  };
}

export function PoolReserves({ reserves }: PoolReservesProps) {
  return (
    <div className="bg-slate-50 rounded-2xl p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <TokenIcon symbol={reserves.fund.symbol} size={32} />
        <div className="flex flex-col">
          <span className="text-sm font-bold text-text-primary">
            {reserves.fund.amount} {reserves.fund.symbol}
          </span>
          <span className="text-[11px] text-text-secondary">{reserves.fund.amountUsd}</span>
        </div>
      </div>
      <div className="w-px h-8 bg-slate-200" />
      <div className="flex items-center gap-3 text-right">
        <div className="flex flex-col items-end">
          <span className="text-sm font-bold text-text-primary">
            {reserves.anchor.amount} {reserves.anchor.symbol}
          </span>
          <span className="text-[11px] text-text-secondary">{reserves.anchor.amountUsd}</span>
        </div>
        <TokenIcon symbol={reserves.anchor.symbol} size={32} />
      </div>
    </div>
  );
}
