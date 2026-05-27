"use client";

import React from "react";
import { ChevronDown } from "lucide-react";
import { useChain } from "@/lib/useChain";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ChainSelector() {
  const { selectedChain, setSelectedChain, chains } = useChain();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="border border-border rounded-full px-3 py-1.5 text-[13px] font-medium flex items-center gap-2 hover:bg-slate-50 transition-colors cursor-pointer">
        <div className="w-4 h-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500" />
        {selectedChain.name}
        <ChevronDown className="w-3.5 h-3.5 text-text-tertiary" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {chains.map((chain) => (
          <DropdownMenuItem
            key={chain.id}
            onClick={() => setSelectedChain(chain)}
            className="text-[13px]"
          >
            {chain.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
