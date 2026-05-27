import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { DisclaimerBanner } from "@/components/Disclaimer";
import { Footer } from "@/components/Footer";
import { WalletProvider } from "@/lib/useWallet";
import { ChainProvider } from "@/lib/useChain";
import { TooltipProvider } from "@/components/ui/tooltip";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PlusX LPX Mock",
  description: "Visual mock of PlusX on PulseChain",
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
            <TooltipProvider>
              <DisclaimerBanner />
              <Header />
              <main className="flex-1">
                {children}
              </main>
              <Footer />
            </TooltipProvider>
          </ChainProvider>
        </WalletProvider>
      </body>
    </html>
  );
}
