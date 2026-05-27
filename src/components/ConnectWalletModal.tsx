"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { copyData } from "@/lib/data";
import { useWallet } from "@/lib/useWallet";

interface ConnectWalletModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ConnectWalletModal({ isOpen, onOpenChange }: ConnectWalletModalProps) {
  const { connect } = useWallet();

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{copyData.modal.connectWallet.title}</DialogTitle>
          <p className="text-sm text-text-secondary">{copyData.modal.connectWallet.subtitle}</p>
        </DialogHeader>
        <div className="grid gap-3 py-4">
          {copyData.modal.connectWallet.wallets.map((wallet: any) => (
            <button
              key={wallet.id}
              onClick={() => {
                connect();
                onOpenChange(false);
              }}
              className="flex items-center justify-between p-4 border border-border rounded-xl hover:bg-brand-teal-light hover:border-brand-teal transition-all group"
            >
              <div className="text-left">
                <div className="font-semibold text-text-primary group-hover:text-brand-teal">
                  {wallet.name}
                </div>
                <div className="text-xs text-text-secondary">{wallet.description}</div>
              </div>
              <div className="w-8 h-8 rounded-lg bg-slate-100" />
            </button>
          ))}
        </div>
        <p className="text-[11px] text-text-tertiary text-center leading-relaxed">
          {copyData.modal.connectWallet.disclaimer}
        </p>
      </DialogContent>
    </Dialog>
  );
}
