"use client";
import React, { useState } from "react";
import { Check, Plus, AlertCircle } from "lucide-react";
import { InfoTooltip } from "@/components/Tooltip";

interface EthereumProvider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
}

declare global {
  interface Window { ethereum?: EthereumProvider }
}

const PULSECHAIN_PARAMS = {
  chainId: "0x171",
  chainName: "PulseChain",
  nativeCurrency: { name: "Pulse", symbol: "PLS", decimals: 18 },
  rpcUrls: ["https://rpc.pulsechain.com"],
  blockExplorerUrls: ["https://midgardexplorer.io"],
};

export function AddPulseChainButton() {
  const [status, setStatus] = useState<"idle" | "added" | "error" | "noprovider">("idle");
  const [errMsg, setErrMsg] = useState("");

  const handleAdd = async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      setStatus("noprovider");
      return;
    }
    try {
      await window.ethereum.request({ method: "wallet_addEthereumChain", params: [PULSECHAIN_PARAMS] });
      setStatus("added");
      setTimeout(() => setStatus("idle"), 3000);
    } catch (err) {
      setErrMsg(err instanceof Error ? err.message : "Unknown error");
      setStatus("error");
      setTimeout(() => setStatus("idle"), 4000);
    }
  };

  return (
    <button
      onClick={handleAdd}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
        status === "added" ? "bg-green-500/10 border-green-500 text-green-700"
        : status === "error" || status === "noprovider" ? "bg-red-500/10 border-red-500 text-red-700"
        : "bg-white border-border text-text-primary hover:bg-slate-50"
      }`}
      title={status === "error" ? errMsg : status === "noprovider" ? "Install MetaMask or another EVM wallet" : "Adds PulseChain network (chain 369) to your wallet"}
    >
      {status === "added" ? <><Check className="w-3.5 h-3.5" /> Added!</>
        : status === "error" ? <><AlertCircle className="w-3.5 h-3.5" /> Failed</>
        : status === "noprovider" ? <><AlertCircle className="w-3.5 h-3.5" /> No wallet</>
        : <><Plus className="w-3.5 h-3.5" /> Add PulseChain</>}
      <InfoTooltip contentKey="_inline" text="One-tap adds PulseChain to MetaMask / Rabby / Brave / any EVM wallet. Chain ID 369. Free, takes 5 seconds. After adding, your wallet can route trades through PulseChain LPX pools." />
    </button>
  );
}
