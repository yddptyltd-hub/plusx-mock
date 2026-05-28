import { MethodologyPanel } from "@/components/MethodologyPanel";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Methodology — where every PlusX number comes from",
  description:
    "Every stat shown on plusx-mock traces to a live API call or a dated snapshot. This page documents each source, its refresh cadence, and what we do not track.",
  openGraph: {
    title: "Methodology — where every PlusX number comes from",
    description:
      "Every stat shown on plusx-mock traces to a live API call or a dated snapshot.",
    images: [{ url: "/og/og-default.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Methodology — where every PlusX number comes from",
    images: ["/og/og-default.png"],
  },
};

export default function MethodologyPage() {
  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-8 lg:px-12 py-6 lg:py-10">
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-text-primary mb-2">
            Methodology
          </h1>
          <p className="text-sm text-text-secondary max-w-3xl">
            Where every number comes from. Each stat is either pulled live from
            an API at render time or marked with the date of the snapshot it
            came from. We do not invent numbers.
          </p>
        </div>
        <MethodologyPanel />
      </div>
    </div>
  );
}
