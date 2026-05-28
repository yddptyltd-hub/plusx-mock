"use client";

import React, { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { useVolatilityTop10 } from "@/lib/useVolatility";
import { AlertTriangle, X } from "lucide-react";
import { useTokenLink } from "@/lib/tokenLink";

const DISMISS_KEY = "plusx_alerts_dismissed_v1";
const DISMISS_TTL = 60 * 60 * 1000;
const ALERT_THRESHOLD = 80;

interface DismissMap { [addr: string]: number }

function readDismissed(): DismissMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(DISMISS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as DismissMap;
    const now = Date.now();
    return Object.fromEntries(Object.entries(parsed).filter(([, ts]) => now - ts < DISMISS_TTL));
  } catch { return {}; }
}

function writeDismissed(map: DismissMap) {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(DISMISS_KEY, JSON.stringify(map)); } catch { /* ignore */ }
}

export function AlertsBanner() {
  const { data } = useVolatilityTop10();
  const tokenLink = useTokenLink();
  const [dismissed, setDismissed] = useState<DismissMap>({});

  useEffect(() => { setDismissed(readDismissed()); }, []);

  const activeAlerts = useMemo(() => {
    if (!data) return [];
    return data.tokens
      .filter((t) => t.volIndex >= ALERT_THRESHOLD && !dismissed[t.addr.toLowerCase()])
      .slice(0, 3);
  }, [data, dismissed]);

  if (activeAlerts.length === 0) return null;

  const dismiss = (addr: string) => {
    const next = { ...dismissed, [addr.toLowerCase()]: Date.now() };
    setDismissed(next);
    writeDismissed(next);
  };

  return (
    <div className="space-y-2 mb-4">
      {activeAlerts.map((t) => {
        const up = t.h24Pct >= 0;
        return (
          <div
            key={t.addr}
            className="glass-card p-3 border-l-4 border-orange-500 flex items-center gap-3"
          >
            <AlertTriangle className="w-5 h-5 text-orange-500 shrink-0" />
            <div className="flex-1 min-w-0">
              {(() => {
                const li = tokenLink(t.addr, t.pairAddress);
                const inner = (
                  <>
                    <span className="font-bold text-text-primary">{t.symbol}{li.external ? " ↗" : ""}</span>
                    <span className="ml-2 text-[11px] text-text-tertiary uppercase">Vol Index {t.volIndex} / 100</span>
                  </>
                );
                return li.external ? (
                  <a href={li.href} target="_blank" rel="noopener noreferrer" className="hover:underline">{inner}</a>
                ) : (
                  <Link href={li.href} className="hover:underline">{inner}</Link>
                );
              })()}
              <span className={`ml-3 font-semibold tabular-nums ${up ? "text-green-600" : "text-red-600"}`}>
                {up ? "+" : ""}{t.h24Pct.toFixed(2)}% / 24h
              </span>
              <span className="ml-3 text-[11px] text-text-tertiary">liq ${(t.liquidityUsd / 1000).toFixed(1)}K</span>
            </div>
            <Link href="/volatility/" className="text-[11px] text-brand-teal hover:underline shrink-0">
              See leaderboard →
            </Link>
            <button
              onClick={() => dismiss(t.addr)}
              className="text-text-tertiary hover:text-text-primary shrink-0 p-1"
              aria-label="Dismiss alert"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
