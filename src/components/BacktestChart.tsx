"use client";

import React, { useEffect, useRef } from "react";
import {
  createChart,
  CandlestickSeries,
  LineStyle,
  type IChartApi,
  type ISeriesApi,
  type IPriceLine,
} from "lightweight-charts";
import type { BacktestCandle } from "@/lib/useBacktest";

interface Props {
  candles: BacktestCandle[];
  centerPrice: number;
  bandLow: number;
  bandHigh: number;
}

export function BacktestChart({ candles, centerPrice, bandLow, bandHigh }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const linesRef = useRef<IPriceLine[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;
    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height: 420,
      layout: { background: { color: "transparent" }, textColor: "#1f2937" },
      grid: { vertLines: { color: "rgba(0,0,0,0.05)" }, horzLines: { color: "rgba(0,0,0,0.05)" } },
      timeScale: { timeVisible: true, secondsVisible: false, borderColor: "rgba(0,0,0,0.1)" },
      rightPriceScale: { borderColor: "rgba(0,0,0,0.1)" },
      crosshair: { mode: 1 },
    });
    const series = chart.addSeries(CandlestickSeries, {
      upColor: "#10b981",
      downColor: "#ef4444",
      borderUpColor: "#10b981",
      borderDownColor: "#ef4444",
      wickUpColor: "#10b981",
      wickDownColor: "#ef4444",
      priceFormat: { type: "price", precision: 6, minMove: 0.000001 },
    });
    chartRef.current = chart;
    seriesRef.current = series;

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
      seriesRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!seriesRef.current || candles.length === 0) return;
    const sorted = [...candles].sort((a, b) => a.openTS - b.openTS);
    const dedup = new Map<number, BacktestCandle>();
    for (const c of sorted) dedup.set(c.openTS, c);
    const data = Array.from(dedup.values()).map((c) => ({
      time: c.openTS as never,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
    }));
    seriesRef.current.setData(data);
    chartRef.current?.timeScale().fitContent();
  }, [candles]);

  useEffect(() => {
    if (!seriesRef.current) return;
    for (const l of linesRef.current) seriesRef.current.removePriceLine(l);
    linesRef.current = [];
    if (centerPrice > 0) {
      linesRef.current.push(
        seriesRef.current.createPriceLine({ price: centerPrice, color: "#3b82f6", lineWidth: 1, lineStyle: LineStyle.Solid, axisLabelVisible: true, title: "Entry" })
      );
      linesRef.current.push(
        seriesRef.current.createPriceLine({ price: bandHigh, color: "#f59e0b", lineWidth: 1, lineStyle: LineStyle.Dashed, axisLabelVisible: true, title: "NTZ High" })
      );
      linesRef.current.push(
        seriesRef.current.createPriceLine({ price: bandLow, color: "#f59e0b", lineWidth: 1, lineStyle: LineStyle.Dashed, axisLabelVisible: true, title: "NTZ Low" })
      );
    }
  }, [centerPrice, bandLow, bandHigh]);

  return <div ref={containerRef} className="w-full" />;
}
