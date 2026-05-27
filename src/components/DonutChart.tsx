"use client";

import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface DonutChartProps {
  shareOfPool: string;
}

export function DonutChart({ shareOfPool }: DonutChartProps) {
  const chartData = [
    { name: "Fund", value: 50, color: "#8B5CF6" },
    { name: "Anchor", value: 50, color: "#00D4AA" },
  ];

  return (
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
          {shareOfPool}
        </span>
        <span className="text-[11px] text-text-secondary">Share of Pool</span>
      </div>
    </div>
  );
}
