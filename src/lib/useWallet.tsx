"use client";

import React, { createContext, useContext, useState } from "react";

interface WalletContextType {
  isConnected: boolean;
  address: string | null;
  connect: () => void;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);

  const connect = () => {
    setIsConnected(true);
    setAddress("0x07b2f1ed9b644db28ad7051bef2ba51d443a8b4c");
  };

  const disconnect = () => {
    setIsConnected(false);
    setAddress(null);
  };

  return (
    <WalletContext.Provider value={{ isConnected, address, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}
