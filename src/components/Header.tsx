"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Wallet } from "lucide-react";
import { useWallet } from "@/lib/useWallet";
import { useChain } from "@/lib/useChain";
import { Button } from "@/components/ui/button";
import { ChainSelector } from "@/components/ChainSelector";
import { ConnectWalletModal } from "@/components/ConnectWalletModal";
import { copyData } from "@/lib/data";
import { cn } from "@/lib/utils";

const TABS = ["LPX", "uDEX", "ValidatorX", "Portfolio", "Docs"];

export function Header() {
  const pathname = usePathname();
  const { isConnected, address } = useWallet();
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);

  const getActiveTab = () => {
    if (pathname === "/") return "LPX";
    if (pathname.startsWith("/pools")) return "LPX";
    const path = pathname.split('/')[1].toLowerCase();
    if (path === 'udex') return 'uDEX';
    const tab = TABS.find((t) => t.toLowerCase() === path);
    return tab || "LPX";
  };

  const activeTab = getActiveTab();

  return (
    <nav className="h-16 bg-white border-b border-border px-12 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-12">
        <Link href="/" className="text-[22px] font-bold text-text-logo">
          PlusX
        </Link>

        <div className="flex items-center gap-8">
          {TABS.map((tab) => (
            <Link
              key={tab}
              href={tab === "LPX" ? "/" : `/${tab.toLowerCase()}`}
              className={cn(
                "text-[15px] font-medium py-2 px-1 relative transition-all border-b-2",
                activeTab === tab
                  ? "text-text-primary border-brand-teal font-semibold"
                  : "text-text-secondary border-transparent hover:text-text-primary"
              )}
            >
              {tab}
            </Link>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <ChainSelector />

        <Button
          onClick={() => (isConnected ? null : setIsConnectModalOpen(true))}
          className="rounded-xl bg-brand-teal text-white hover:bg-brand-teal-dark font-semibold px-5 h-10"
        >
          {isConnected ? (
            <span className="flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              {address?.substring(0, 5)}...{address?.substring(address.length - 4)}
            </span>
          ) : (
            "Connect Wallet"
          )}
        </Button>
      </div>

      <ConnectWalletModal isOpen={isConnectModalOpen} onOpenChange={setIsConnectModalOpen} />
    </nav>
  );
}
