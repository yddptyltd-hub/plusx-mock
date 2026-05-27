import React from "react";
import Link from "next/link";
import { copyData } from "@/lib/data";

export function Footer() {
  return (
    <footer className="px-12 py-10 bg-white border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto">
        <p className="text-[12px] text-text-secondary leading-relaxed text-center max-w-5xl mx-auto">
          {copyData.disclaimer.footer}{" "}
          <Link href="/docs#terms-of-use" className="text-brand-teal hover:underline">
            LPX Terms of Use
          </Link>.
        </p>
      </div>
    </footer>
  );
}
