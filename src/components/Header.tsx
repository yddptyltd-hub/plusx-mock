"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Wallet } from "lucide-react";
import { useWallet } from "@/lib/useWallet";
import { Button } from "@/components/ui/button";
import { ChainSelector } from "@/components/ChainSelector";
import { ConnectWalletModal } from "@/components/ConnectWalletModal";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const TABS = ["LPX", "uDEX", "ValidatorX", "Portfolio", "Docs"];

function tabHref(tab: string) {
  return tab === "LPX" ? "/" : `/${tab.toLowerCase()}`;
}

export function Header() {
  const pathname = usePathname();
  const { isConnected, address } = useWallet();
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getActiveTab = () => {
    if (pathname === "/") return "LPX";
    if (pathname.startsWith("/pools")) return "LPX";
    const path = pathname.split("/")[1].toLowerCase();
    if (path === "udex") return "uDEX";
    const tab = TABS.find((t) => t.toLowerCase() === path);
    return tab || "LPX";
  };

  const activeTab = getActiveTab();

  return (
    <nav className="h-16 bg-white border-b border-border px-4 sm:px-8 lg:px-12 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-8 lg:gap-12">
        <Link href="/" className="text-[22px] font-bold text-text-logo shrink-0">
          PlusX
        </Link>
        <div className="hidden md:flex items-center gap-6 lg:gap-8">
          {TABS.map((tab) => (
            <Link
              key={tab}
              href={tabHref(tab)}
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

      <div className="flex items-center gap-2 sm:gap-3">
        <div className="hidden sm:block">
          <ChainSelector />
        </div>
        <div className="sm:hidden">
          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 border border-border" title="PulseChain" />
        </div>

        <Button
          onClick={() => (isConnected ? null : setIsConnectModalOpen(true))}
          className="rounded-xl bg-brand-teal text-white hover:bg-brand-teal-dark font-semibold px-3 sm:px-5 h-9 sm:h-10 text-[13px] sm:text-sm"
        >
          {isConnected ? (
            <span className="flex items-center gap-1.5">
              <Wallet className="w-3.5 h-3.5" />
              {address?.substring(0, 4)}...{address?.substring(address.length - 3)}
            </span>
          ) : (
            <span>
              <span className="hidden sm:inline">Connect Wallet</span>
              <span className="sm:hidden">Connect</span>
            </span>
          )}
        </Button>

        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger
            className="md:hidden inline-flex items-center justify-center h-9 w-9 shrink-0 rounded-md hover:bg-slate-100 transition-colors"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </SheetTrigger>
          <SheetContent side="right" className="w-[260px] pt-12 px-0" showCloseButton>
            <nav className="flex flex-col">
              {TABS.map((tab) => (
                <Link
                  key={tab}
                  href={tabHref(tab)}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "px-6 py-4 text-[16px] font-medium border-b border-border transition-colors",
                    activeTab === tab
                      ? "text-brand-teal font-semibold bg-brand-teal-light"
                      : "text-text-primary hover:bg-slate-50"
                  )}
                >
                  {tab}
                </Link>
              ))}
              <div className="px-6 py-4 sm:hidden">
                <ChainSelector />
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>

      <ConnectWalletModal
        isOpen={isConnectModalOpen}
        onOpenChange={setIsConnectModalOpen}
      />
    </nav>
  );
}
