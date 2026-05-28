"use client";
import React, { useRef, useState } from "react";
import { Download, ImageIcon } from "lucide-react";

interface Props {
  title: string;
  body: string;
  brand?: string;
}

export function PromoSnapshot({ title, body, brand = "plusx-mock.pages.dev" }: Props) {
  const ref = useRef<SVGSVGElement>(null);
  const [downloading, setDownloading] = useState(false);

  const download = async () => {
    if (!ref.current) return;
    setDownloading(true);
    try {
      const svg = ref.current;
      const xml = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([xml], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(svgBlob);
      const img = new Image();
      img.crossOrigin = "anonymous";
      await new Promise<void>((res, rej) => { img.onload = () => res(); img.onerror = rej; img.src = url; });
      const canvas = document.createElement("canvas");
      canvas.width = 1200; canvas.height = 675;
      const ctx = canvas.getContext("2d");
      if (!ctx) { setDownloading(false); return; }
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      const png = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = png;
      a.download = `plusx-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40)}.png`;
      a.click();
    } finally { setDownloading(false); }
  };

  const lines: string[] = [];
  let buf = "";
  for (const w of body.split(/\s+/)) {
    if ((buf + " " + w).trim().length > 52) { lines.push(buf.trim()); buf = w; }
    else buf = (buf + " " + w).trim();
  }
  if (buf) lines.push(buf);
  const maxLines = 14;
  const shown = lines.slice(0, maxLines);

  return (
    <div className="mt-2">
      <button onClick={download} disabled={downloading} className="text-[11px] flex items-center gap-1 px-2 py-1 rounded-md border border-orange-500/40 bg-orange-500/10 text-orange-700 hover:bg-orange-500/20 disabled:opacity-50">
        <ImageIcon className="w-3 h-3" /> {downloading ? "..." : "Download PNG"}
        <Download className="w-3 h-3" />
      </button>
      <svg ref={ref} xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675" style={{ display: "none" }}>
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0ea5e9" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
        </defs>
        <rect width="1200" height="675" fill="url(#bg)" />
        <rect x="40" y="40" width="1120" height="595" rx="32" fill="white" fillOpacity="0.96" />
        <text x="80" y="110" fontFamily="-apple-system, system-ui, sans-serif" fontSize="20" fontWeight="600" fill="#0f766e">PlusX · LPX on PulseChain</text>
        <text x="80" y="170" fontFamily="-apple-system, system-ui, sans-serif" fontSize="42" fontWeight="800" fill="#0f172a">{title}</text>
        {shown.map((line, i) => (
          <text key={i} x="80" y={250 + i * 36} fontFamily="-apple-system, system-ui, sans-serif" fontSize="26" fontWeight="500" fill="#1e293b">{line}</text>
        ))}
        <text x="80" y="615" fontFamily="-apple-system, system-ui, monospace" fontSize="22" fontWeight="600" fill="#0ea5e9">{brand}</text>
      </svg>
    </div>
  );
}
