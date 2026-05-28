"use client";
import { useEffect, useState } from "react";

interface Vitals {
  lcp?: number;
  cls?: number;
  inp?: number;
  fcp?: number;
  softNavCount: number;
  lastSoftNav?: { name: string; durationMs: number };
}

const POLY_MAX_INP_PERF_KEYS = ["event", "first-input"] as const;

export function WebVitalsOverlay() {
  const [enabled, setEnabled] = useState(false);
  const [v, setV] = useState<Vitals>({ softNavCount: 0 });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("vitals") !== "1") return;
    setEnabled(true);
    const obs: PerformanceObserver[] = [];
    const safeObs = (type: string, cb: (l: PerformanceObserverEntryList) => void) => {
      try {
        const o = new PerformanceObserver(cb);
        o.observe({ type, buffered: true } as PerformanceObserverInit);
        obs.push(o);
      } catch {}
    };
    safeObs("largest-contentful-paint", (l) => {
      const last = l.getEntries().at(-1) as PerformanceEntry & { renderTime?: number; startTime: number };
      if (last) setV((p) => ({ ...p, lcp: Math.round(last.renderTime ?? last.startTime) }));
    });
    safeObs("layout-shift", (l) => {
      let cls = 0;
      for (const e of l.getEntries() as Array<PerformanceEntry & { value?: number; hadRecentInput?: boolean }>) {
        if (!e.hadRecentInput && typeof e.value === "number") cls += e.value;
      }
      setV((p) => ({ ...p, cls: Math.round((p.cls ?? 0) * 1000 + cls * 1000) / 1000 }));
    });
    safeObs("paint", (l) => {
      const fcp = l.getEntries().find((e) => e.name === "first-contentful-paint");
      if (fcp) setV((p) => ({ ...p, fcp: Math.round(fcp.startTime) }));
    });
    for (const t of POLY_MAX_INP_PERF_KEYS) {
      safeObs(t, (l) => {
        const max = Math.max(...l.getEntries().map((e) => e.duration || 0));
        if (max > 0) setV((p) => ({ ...p, inp: Math.max(p.inp ?? 0, Math.round(max)) }));
      });
    }
    safeObs("soft-navigation", (l) => {
      const arr = l.getEntries();
      const last = arr.at(-1);
      if (!last) return;
      setV((p) => ({
        ...p,
        softNavCount: p.softNavCount + arr.length,
        lastSoftNav: { name: last.name, durationMs: Math.round(last.duration) },
      }));
    });
    return () => { for (const o of obs) o.disconnect(); };
  }, []);

  if (!enabled) return null;

  const fmt = (n?: number, unit = "ms") => (n == null ? "—" : `${n}${unit}`);
  const cls = (n?: number) => (n == null ? "—" : n.toFixed(3));

  return (
    <div className="fixed bottom-3 right-3 z-50 rounded-lg border border-slate-300 bg-white/95 backdrop-blur px-3 py-2 text-[11px] font-mono shadow-lg max-w-[260px]">
      <div className="font-semibold text-text-primary mb-1">Web Vitals · live</div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-text-secondary tabular-nums">
        <div>LCP</div><div className="text-right">{fmt(v.lcp)}</div>
        <div>FCP</div><div className="text-right">{fmt(v.fcp)}</div>
        <div>CLS</div><div className="text-right">{cls(v.cls)}</div>
        <div>INP</div><div className="text-right">{fmt(v.inp)}</div>
        <div>Soft navs</div><div className="text-right">{v.softNavCount}</div>
      </div>
      {v.lastSoftNav && (
        <div className="mt-1 text-[10px] text-text-tertiary truncate">
          last soft-nav: {v.lastSoftNav.durationMs}ms
        </div>
      )}
      <div className="mt-1 text-[9px] text-text-tertiary">add ?vitals=1 to any page · powered by PerformanceObserver + Soft Navigations API</div>
    </div>
  );
}
