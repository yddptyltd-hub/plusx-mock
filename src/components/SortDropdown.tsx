"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type SortKey = "tvlRaw" | "volume24hRaw" | "ageDays" | "apr30dRaw" | "arbYieldAnchor";
export type SortDirection = "asc" | "desc";

interface SortOption {
  key: SortKey;
  label: string;
}

const OPTIONS: SortOption[] = [
  { key: "tvlRaw", label: "TVL" },
  { key: "volume24hRaw", label: "Volume" },
  { key: "ageDays", label: "Age" },
  { key: "apr30dRaw", label: "APR" },
  { key: "arbYieldAnchor", label: "Arb Yield" },
];

interface Props {
  sortKey: SortKey | null;
  direction: SortDirection | null;
  onChange: (key: SortKey, direction: SortDirection) => void;
}

export function SortDropdown({ sortKey, direction, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const activeLabel = OPTIONS.find((o) => o.key === sortKey)?.label ?? "Default";
  const dirArrow = direction === "asc" ? "↑" : direction === "desc" ? "↓" : "";

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        aria-label="Sort pools"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-full border border-border bg-white text-text-secondary hover:text-text-primary hover:bg-slate-50 transition text-[13px] font-medium"
      >
        <ArrowUpDown className="w-3.5 h-3.5" />
        <span>Sort: {activeLabel} {dirArrow}</span>
        <ChevronDown className="w-3.5 h-3.5" />
      </button>
      {open && (
        <div className="absolute right-0 mt-1 z-20 min-w-[160px] rounded-xl border border-border bg-white shadow-md py-1">
          {OPTIONS.map((opt) => {
            const isActive = sortKey === opt.key;
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => {
                  const nextDir: SortDirection =
                    isActive && direction === "desc" ? "asc" : "desc";
                  onChange(opt.key, nextDir);
                  setOpen(false);
                }}
                className={cn(
                  "w-full text-left px-3 py-2 text-[13px] hover:bg-slate-50 flex items-center justify-between",
                  isActive && "text-text-primary font-semibold"
                )}
              >
                <span>{opt.label}</span>
                {isActive && (
                  <span className="text-text-tertiary text-[11px]">
                    {direction === "asc" ? "Low → High" : "High → Low"}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
