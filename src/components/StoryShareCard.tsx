"use client";
import { useState } from "react";
import { Download, Film } from "lucide-react";

const GIF_PATH = "/share/lpx-story-v2.gif";
const MP4_PATH = "/share/lpx-story-v2.mp4";

export function StoryShareCard() {
  const [missing, setMissing] = useState(false);

  return (
    <section className="glass-card p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Film className="w-4 h-4 text-brand-teal" />
          <h2 className="text-sm font-semibold text-text-primary">Story-card video — drop into X / Instagram / Telegram</h2>
        </div>
        <span className="text-[10px] uppercase font-semibold text-text-tertiary">1080×1920 · 5.5s loop</span>
      </div>
      <p className="text-[12px] text-text-tertiary mb-4 leading-relaxed">
        Animated PulseChain LPX stat card with count-up numbers. Save the GIF for X / Telegram (loops automatically) or the MP4 for Instagram / TikTok stories (better quality).
      </p>
      <div className="flex flex-wrap gap-2 items-center">
        <a
          href={GIF_PATH}
          download="plusx-lpx-story-v2.gif"
          onError={() => setMissing(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md border border-brand-teal/40 bg-brand-teal/10 text-brand-teal-dark hover:bg-brand-teal/20"
        >
          <Download className="w-3.5 h-3.5" /> Download GIF
        </a>
        <a
          href={MP4_PATH}
          download="plusx-lpx-story.mp4"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md border border-violet-500/40 bg-violet-500/10 text-violet-700 hover:bg-violet-500/20"
        >
          <Download className="w-3.5 h-3.5" /> Download MP4
        </a>
        <a
          href={GIF_PATH}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] text-text-tertiary hover:text-text-secondary underline"
        >
          Preview
        </a>
      </div>
      <p className="mt-3 text-[11px] text-text-tertiary">
        Numbers in this card:{" "}
        <a
          href="/methodology/#story-card"
          className="underline hover:text-text-secondary"
        >
          How we get these numbers
        </a>
      </p>
      {missing && (
        <div className="mt-3 text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1">
          Render pending — Jules is generating this asset. Refresh in ~15 min.
        </div>
      )}
    </section>
  );
}
