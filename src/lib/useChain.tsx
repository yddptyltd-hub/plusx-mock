"use client";

import React, { createContext, useContext, useState } from "react";

interface Chain {
  id: string;
  name: string;
}

interface ChainContextType {
  selectedChain: Chain;
  setSelectedChain: (chain: Chain) => void;
  chains: Chain[];
}

const chains: Chain[] = [
  { id: "pulsechain", name: "PulseChain" },
  { id: "ethereum", name: "Ethereum" },
  { id: "bsc", name: "BSC" },
  { id: "base", name: "Base" },
];

const ChainContext = createContext<ChainContextType | undefined>(undefined);

export function ChainProvider({ children }: { children: React.ReactNode }) {
  const [selectedChain, setSelectedChain] = useState<Chain>(chains[0]);

  return (
    <ChainContext.Provider value={{ selectedChain, setSelectedChain, chains }}>
      {children}
    </ChainContext.Provider>
  );
}

export function useChain() {
  const context = useContext(ChainContext);
  if (context === undefined) {
    throw new Error("useChain must be used within a ChainProvider");
  }
  return context;
}
