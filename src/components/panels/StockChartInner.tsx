"use client";

import { useEffect, useRef } from "react";
import {
  createChart,
  type IChartApi,
  type ISeriesApi,
  CandlestickSeries,
  HistogramSeries,
  LineSeries,
} from "lightweight-charts";
import type { ChartDataPoint } from "@/types";

interface Props {
  data: ChartDataPoint[];
  compareData: ChartDataPoint[];
  showSma20: boolean;
  showSma50: boolean;
}

export default function StockChartInner({
  data,
  compareData,
  showSma20,
  showSma50,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volumeRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  const sma20Ref = useRef<ISeriesApi<"Line"> | null>(null);
  const sma50Ref = useRef<ISeriesApi<"Line"> | null>(null);
  const compareRef = useRef<ISeriesApi<"Line"> | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const chart = createChart(container, {
      width: container.clientWidth,
      height: container.clientHeight,
      layout: {
        background: { color: "#12121a" },
        textColor: "#6b7280",
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 11,
      },
      grid: {
        vertLines: { color: "#1e1e2e" },
        horzLines: { color: "#1e1e2e" },
      },
      crosshair: {
        vertLine: { color: "#ff8c00", width: 1, style: 2 },
        horzLine: { color: "#ff8c00", width: 1, style: 2 },
      },
      rightPriceScale: { borderColor: "#1e1e2e" },
      timeScale: { borderColor: "#1e1e2e", timeVisible: true },
      handleScroll: true,
      handleScale: true,
    });

    const candle = chart.addSeries(CandlestickSeries, {
      upColor: "#00dc82",
      downColor: "#ff4757",
      borderUpColor: "#00dc82",
      borderDownColor: "#ff4757",
      wickUpColor: "#00dc82",
      wickDownColor: "#ff4757",
    });

    const volume = chart.addSeries(HistogramSeries, {
      priceFormat: { type: "volume" },
      priceScaleId: "volume",
    });
    volume.priceScale().applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
    });

    chartRef.current = chart;
    candleRef.current = candle;
    volumeRef.current = volume;

    sma20Ref.current = chart.addSeries(LineSeries, {
      color: "#facc15",
      lineWidth: 2,
      priceLineVisible: false,
    });
    sma50Ref.current = chart.addSeries(LineSeries, {
      color: "#60a5fa",
      lineWidth: 2,
      priceLineVisible: false,
    });
    compareRef.current = chart.addSeries(LineSeries, {
      color: "#a78bfa",
      lineWidth: 2,
      lineStyle: 2,
      priceLineVisible: false,
      priceScaleId: "compare",
    });
    compareRef.current.priceScale().applyOptions({
      scaleMargins: { top: 0.15, bottom: 0.25 },
    });

    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      if (width > 0 && height > 0) {
        chart.applyOptions({ width, height });
      }
    });
    ro.observe(container);

    return () => {
      ro.disconnect();
      chart.remove();
      chartRef.current = null;
      candleRef.current = null;
      volumeRef.current = null;
      sma20Ref.current = null;
      sma50Ref.current = null;
      compareRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!data || data.length === 0 || !candleRef.current || !volumeRef.current)
      return;

    // Deduplicate by time (keep last occurrence) and sort ascending
    const seen = new Map<string, ChartDataPoint>();
    for (const d of data) {
      seen.set(d.time, d);
    }
    const unique = Array.from(seen.values()).sort(
      (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()
    );

    candleRef.current.setData(
      unique.map((d) => ({
        time: d.time,
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close,
      }))
    );

    volumeRef.current.setData(
      unique.map((d) => ({
        time: d.time,
        value: d.volume,
        color:
          d.close >= d.open
            ? "rgba(0,220,130,0.3)"
            : "rgba(255,71,87,0.3)",
      }))
    );

    if (sma20Ref.current) {
      sma20Ref.current.applyOptions({ visible: showSma20 });
      sma20Ref.current.setData(makeSMA(unique, 20));
    }
    if (sma50Ref.current) {
      sma50Ref.current.applyOptions({ visible: showSma50 });
      sma50Ref.current.setData(makeSMA(unique, 50));
    }
    if (compareRef.current) {
      compareRef.current.setData(normalizeCompare(compareData));
      compareRef.current.applyOptions({ visible: compareData.length > 0 });
    }

    chartRef.current?.timeScale().fitContent();
  }, [data, compareData, showSma20, showSma50]);

  return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
}

function makeSMA(data: ChartDataPoint[], period: number) {
  let rollingSum = 0;
  return data.map((d, i) => {
    rollingSum += d.close;
    if (i >= period) rollingSum -= data[i - period].close;
    const value = i >= period - 1 ? rollingSum / period : d.close;
    return { time: d.time, value };
  });
}

function normalizeCompare(data: ChartDataPoint[]) {
  if (!data.length) return [];
  const base = data[0].close || 1;
  return data.map((d) => ({
    time: d.time,
    value: (d.close / base) * 100,
  }));
}
