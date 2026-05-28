"use client";
import { useEffect, useMemo, useState } from "react";
import { Sparkles } from "lucide-react";
import { useLivePools } from "@/lib/useLivePools";
import type { LivePool } from "@/lib/livePools";
import { useVolatilityTop10 } from "@/lib/useVolatility";

interface LanguageModelStatic {
  availability(opts?: object): Promise<"available" | "after-download" | "no" | string>;
  create(opts?: object): Promise<LanguageModelSession>;
}
interface LanguageModelSession {
  prompt(input: string): Promise<string>;
  destroy?: () => void;
}
declare global {
  interface Window { LanguageModel?: LanguageModelStatic }
}

type Status = "checking" | "unsupported" | "available" | "loading" | "ready" | "error";

export function AISummaryCard() {
  const { pools } = useLivePools();
  const { data: vol } = useVolatilityTop10();
  const [status, setStatus] = useState<Status>("checking");
  const [summary, setSummary] = useState<string>("");
  const [errMsg, setErrMsg] = useState<string>("");

  const factSheet = useMemo(() => {
    if (!pools || pools.length === 0) return "";
    const live = pools as LivePool[];
    const totalTvl = live.reduce((a, p) => a + (p.tvlUsd ?? 0), 0);
    const topTvl = [...live].sort((a, b) => (b.tvlUsd ?? 0) - (a.tvlUsd ?? 0))[0];
    const topVol = [...live].sort((a, b) => (b.volume24hUsd ?? 0) - (a.volume24hUsd ?? 0))[0];
    const gainer = vol?.tokens?.find((t) => t.h24Pct > 0) ?? null;
    const loser = [...(vol?.tokens ?? [])].sort((a, b) => a.h24Pct - b.h24Pct)[0] ?? null;
    return [
      `${live.length} PulseChain LPX liquidity pools active`,
      `Total LPX TVL: $${(totalTvl / 1000).toFixed(1)}K`,
      topTvl ? `Largest pool: ${topTvl.pair[0]}/${topTvl.pair[1]} with TVL $${((topTvl.tvlUsd ?? 0) / 1000).toFixed(1)}K` : "",
      topVol ? `Highest 24h volume: ${topVol.pair[0]}/${topVol.pair[1]}` : "",
      gainer ? `Top token gainer 24h: ${gainer.symbol} ${gainer.h24Pct.toFixed(2)}%` : "",
      loser ? `Worst token 24h: ${loser.symbol} ${loser.h24Pct.toFixed(2)}%` : "",
    ].filter(Boolean).join(". ") + ".";
  }, [pools, vol]);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (typeof window === "undefined" || !window.LanguageModel) {
        setStatus("unsupported");
        return;
      }
      try {
        const avail = await window.LanguageModel.availability();
        if (avail === "no") { setStatus("unsupported"); return; }
        if (!factSheet) return;
        setStatus("loading");
        const session = await window.LanguageModel.create();
        if (cancelled) { session.destroy?.(); return; }
        const prompt = `You are a crypto market observer. Given these facts about the PulseChain LPX liquidity protocol right now, write ONE sentence (max 25 words) naming the single most interesting observation a community member should know. No emojis. No hype. No "I think". Plain English.

Facts:
${factSheet}

Your one sentence:`;
        const result = await session.prompt(prompt);
        if (cancelled) { session.destroy?.(); return; }
        setSummary(result.trim().replace(/^["']|["']$/g, ""));
        setStatus("ready");
        session.destroy?.();
      } catch (err) {
        setErrMsg(err instanceof Error ? err.message : "unknown");
        setStatus("error");
      }
    }
    run();
    return () => { cancelled = true; };
  }, [factSheet]);

  // Hide silently on any non-success state. Raw errors must never reach cofounder
  // visitors — the card is "magic if it works, invisible if it doesn't".
  if (status !== "loading" && status !== "ready") return null;

  return (
    <section className="glass-card p-4 border-l-4 border-l-violet-500">
      <div className="flex items-start gap-3">
        <Sparkles className="w-4 h-4 text-violet-600 flex-none mt-0.5" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-[11px] uppercase font-semibold text-violet-700 tracking-wide">AI observation</h3>
            <span className="text-[10px] text-text-tertiary">on-device · Chrome Gemini Nano · no server, no cost</span>
          </div>
          {status === "loading" && <div className="text-sm text-text-tertiary">Reading the data…</div>}
          {status === "ready" && <div className="text-sm text-text-primary leading-snug">{summary}</div>}
        </div>
      </div>
    </section>
  );
}
