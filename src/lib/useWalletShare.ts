"use client";
import useSWR from "swr";
import { fetchWalletShare, WalletShare } from "./walletShare";

export function useWalletShare(walletAddress: string | null | undefined) {
  return useSWR<WalletShare | null>(
    walletAddress ? `wallet-share:${walletAddress.toLowerCase()}` : null,
    () => (walletAddress ? fetchWalletShare(walletAddress) : null),
    { refreshInterval: 60_000, revalidateOnFocus: false }
  );
}
