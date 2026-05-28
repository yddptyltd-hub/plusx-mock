"use client";

import React, { useEffect, useRef } from "react";
import { createChart, LineSeries, type IChartApi, type ISeriesApi } from "lightweight-charts";
import type { SeriesPoint } from "@/lib/hodlVsLpx";

export function HodlVsLpxChart({ series }: { series: SeriesPoint[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const hodlRef = useRef<ISeriesApi<"Line"> | null>(null);
  const lpxRef = useRef<ISeriesApi<"Line"> | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height: 360,
      layout: { background: { color: "transparent" }, textColor: "#1f2937" },
      grid: { vertLines: { color: "rgba(0,0,0,0.05)" }, horzLines: { color: "rgba(0,0,0,0.05)" } },
      timeScale: { timeVisible: true, secondsVisible: false, borderColor: "rgba(0,0,0,0.1)" },
      rightPriceScale: { borderColor: "rgba(0,0,0,0.1)" },
      crosshair: { mode: 1 },
    });
    const hodl = chart.addSeries(LineSeries, { color: "#94a3b8", lineWidth: 2, title: "HODL" });
    const lpx = chart.addSeries(LineSeries, { color: "#0ea5e9", lineWidth: 2, title: "LPX" });
    chartRef.current = chart;
    hodlRef.current = hodl;
    lpxRef.current = lpx;
    const onResize = () => {
      if (containerRef.current && chartRef.current) {
        chartRef.current.applyOptions({ width: containerRef.current.clientWidth });
      }
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      chart.remove();
      chartRef.current = null;
      hodlRef.current = null;
      lpxRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!hodlRef.current || !lpxRef.current || series.length === 0) return;
    const dedupe = new Map<number, SeriesPoint>();
    for (const p of series) dedupe.set(p.ts, p);
    const points = Array.from(dedupe.values()).sort((a, b) => a.ts - b.ts);
    hodlRef.current.setData(points.map((p) => ({ time: p.ts as never, value: p.hodlUsd })));
    lpxRef.current.setData(points.map((p) => ({ time: p.ts as never, value: p.lpxUsd })));
    chartRef.current?.timeScale().fitContent();
  }, [series]);

  return <div ref={containerRef} className="w-full" />;
}
