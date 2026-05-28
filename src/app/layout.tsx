import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { DisclaimerBanner } from "@/components/Disclaimer";
import { Footer } from "@/components/Footer";
import { WalletProvider } from "@/lib/useWallet";
import { ChainProvider } from "@/lib/useChain";
import { ModeProvider } from "@/lib/useMode";
import { TooltipProvider } from "@/components/ui/tooltip";
import { WebVitalsOverlay } from "@/components/WebVitalsOverlay";

const inter = Inter({ subsets: ["latin"] });

const SITE_URL = "https://plusx-mock.pages.dev";
const OG_TITLE = "PlusX LPX — PulseChain liquidity protocol dashboard";
const OG_DESC = "Live LPX pool data, volatility-driven NTZ optimizer, backtest engine, and PulseChain validator metrics. Community mock, public preview.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "PlusX LPX", template: "%s — PlusX LPX" },
  description: OG_DESC,
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "PlusX LPX",
    title: OG_TITLE,
    description: OG_DESC,
    images: [{ url: "/og/og-default.png", width: 1200, height: 630, alt: "PlusX LPX — PulseChain liquidity protocol" }],
  },
  twitter: {
    card: "summary_large_image",
    title: OG_TITLE,
    description: OG_DESC,
    images: ["/og/og-default.png"],
  },
  icons: { icon: "/favicon.ico" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} min-h-full flex flex-col bg-bg-page antialiased`}>
        <WalletProvider>
          <ChainProvider>
            <ModeProvider>
            <TooltipProvider>
              <DisclaimerBanner />
              <Header />
              <main className="flex-1">
                {children}
              </main>
              <Footer />
              <WebVitalsOverlay />
            </TooltipProvider>
            </ModeProvider>
          </ChainProvider>
        </WalletProvider>
      </body>
    </html>
  );
}
