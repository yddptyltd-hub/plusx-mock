"use client";

import React from "react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";

interface SparklineProps {
  data: Array<{ value: number }>;
  color: string;
}

export function Sparkline({ data, color }: SparklineProps) {
  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.3} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            fill={`url(#gradient-${color})`}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
