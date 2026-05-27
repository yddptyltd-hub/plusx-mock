"use client";

import React, { useState, useEffect } from "react";
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";
import { generateCandlestickData } from "@/lib/mockChartData";
import { cn } from "@/lib/utils";
import type { Candle } from "@/lib/livePools";

interface CandlestickChartProps {
  id: string;
  pair: string[];
  liveCandles?: Candle[];
  onIntervalChange?: (interval: string) => void;
}

const INTERVALS = ["5m", "15m", "1h", "4h", "1d"];

export function CandlestickChart({ id, pair, liveCandles, onIntervalChange }: CandlestickChartProps) {
  const [interval, setInterval] = useState("15m");
  const [mockData, setMockData] = useState<any[]>([]);

  useEffect(() => {
    if (!liveCandles || liveCandles.length === 0) {
      setMockData(generateCandlestickData(id, interval, 40));
    }
  }, [id, interval, liveCandles]);

  const handleIntervalChange = (int: string) => {
    setInterval(int);
    onIntervalChange?.(int);
  };

  const data: any[] = liveCandles && liveCandles.length > 0
    ? liveCandles.map((c) => ({ time: c.openTS, open: c.open, high: c.high, low: c.low, close: c.close }))
    : mockData;

  return (
    <div className="bg-white border border-border rounded-2xl p-6 shadow-sm flex flex-col h-[320px]">
      <div className="flex-1 relative">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data}>
            <XAxis dataKey="time" hide />
            <YAxis domain={['auto', 'auto']} hide />
            <Bar
              dataKey="high"
              fill="transparent"
              isAnimationActive={false}
              shape={() => null}
            />
          </ComposedChart>
        </ResponsiveContainer>
        
        <div className="absolute inset-0 pr-20 pb-10">
           <CandlestickSVG data={data} />
        </div>
        
        <div className="absolute right-0 top-0 bottom-0 flex flex-col justify-around py-4 pointer-events-none w-20">
          <div className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full self-end">Sell 0.0000073</div>
          <div className="text-text-secondary text-[10px] font-medium self-end">Current 0.0000072</div>
          <div className="bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full self-end">Buy 0.0000070</div>
          <div className="bg-green-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full self-end">Min Buy 0.0000068</div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-lg">
          {INTERVALS.map((int) => (
            <button
              key={int}
              onClick={() => handleIntervalChange(int)}
              className={cn(
                "px-3 py-1 text-xs font-medium rounded-md transition-all",
                interval === int
                  ? "bg-white text-brand-teal shadow-sm"
                  : "text-text-secondary hover:text-text-primary"
              )}
            >
              {int}
            </button>
          ))}
        </div>
        <span className="text-[11px] text-text-tertiary font-medium">
          #1 {pair[0]}/{pair[1]}
        </span>
      </div>
    </div>
  );
}

function CandlestickSVG({ data }: { data: any[] }) {
  if (!data.length) return null;

  const min = Math.min(...data.map(d => d.low));
  const max = Math.max(...data.map(d => d.high));
  const range = max - min || 1;

  return (
    <svg width="100%" height="100%" preserveAspectRatio="none" className="overflow-visible">
      {data.map((d, i) => {
        const x = (i / data.length) * 100;
        const width = (1 / data.length) * 100 * 0.7;
        const yHigh = ((max - d.high) / range) * 100;
        const yLow = ((max - d.low) / range) * 100;
        const yOpen = ((max - d.open) / range) * 100;
        const yClose = ((max - d.close) / range) * 100;
        
        const isUp = d.close >= d.open;
        const color = isUp ? "#22C55E" : "#EF4444";
        
        return (
          <g key={i}>
            <line 
              x1={`${x + width/2}%`} 
              y1={`${yHigh}%`} 
              x2={`${x + width/2}%`} 
              y2={`${yLow}%`} 
              stroke="#94A3B8" 
              strokeWidth="1" 
            />
            <rect 
              x={`${x}%`} 
              y={`${Math.min(yOpen, yClose)}%`} 
              width={`${width}%`} 
              height={`${Math.max(1, Math.abs(yOpen - yClose))}%`} 
              fill={color} 
            />
          </g>
        );
      })}
    </svg>
  );
}
