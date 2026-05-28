import { PromotePanel } from "@/components/PromotePanel";
import { XTimelineEmbed } from "@/components/XTimelineEmbed";
import { LivePulse } from "@/components/LivePulse";
import { PulseNewsCard } from "@/components/PulseNewsCard";
import { AddPulseChainButton } from "@/components/AddPulseChainButton";
import { AISummaryCard } from "@/components/AISummaryCard";
import { StoryShareCard } from "@/components/StoryShareCard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Promote LPX — cofounder data hub",
  description: "Copy-pack tweets, Telegram pitches, share-pack URLs and live PulseChain LPX stats. Everything self-updating from on-chain data.",
  openGraph: {
    title: "Promote LPX — cofounder data hub",
    description: "Copy-pack tweets, Telegram pitches, share-pack URLs and live PulseChain LPX stats.",
    url: "https://plusx-mock.pages.dev/promote/",
    images: [{ url: "/og/og-default.png", width: 1200, height: 630, alt: "PlusX LPX cofounder hub" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Promote LPX — cofounder data hub",
    description: "Copy-pack tweets, Telegram pitches, share-pack URLs and live PulseChain LPX stats.",
    images: ["/og/og-default.png"],
  },
};

export default function PromotePage() {
  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 min-h-screen">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 lg:px-12 py-6 lg:py-10">
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-text-primary mb-2">Promote LPX</h1>
          <p className="text-sm text-text-secondary max-w-3xl">
            Cofounder data hub. Live PulseChain LPX stats you can quote anywhere, pre-formatted
            tweet / DM / Telegram copy-packs with real numbers, X mention tracker, and direct share-pack URLs.
            Everything self-updating from on-chain data - no fabrication, no stale screenshots.
          </p>
        </div>
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-brand-teal/30 bg-brand-teal/5 px-4 py-3">
          <div className="text-[13px] text-text-primary">
            <span className="font-semibold">New to PulseChain?</span>
            <span className="text-text-secondary"> Add the network to your wallet in one click — no manual chain ID, no RPC copy-paste.</span>
          </div>
          <div className="flex-none">
            <AddPulseChainButton />
          </div>
        </div>
        <div className="mb-3">
          <AISummaryCard />
        </div>
        <div className="mb-6">
          <LivePulse />
        </div>
        <PromotePanel />
        <div className="mt-6">
          <StoryShareCard />
        </div>
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <XTimelineEmbed />
          <PulseNewsCard />
        </div>
        <div className="mt-8 pt-4 border-t border-border">
          <p className="text-[11px] text-text-tertiary">
            <a
              href="/methodology/"
              className="underline hover:text-text-secondary"
            >
              How we get these numbers
            </a>
            {" "}— every stat on this page traces to a live API or a dated snapshot.
          </p>
        </div>
      </div>
    </div>
  );
}
