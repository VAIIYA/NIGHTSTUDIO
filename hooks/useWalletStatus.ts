"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { getUSDCBalance } from "@/lib/solana/usdc";
import { getConnection } from "@/lib/solana/connection";
import { useEffect, useState } from "react";

export function useWalletStatus() {
  const { publicKey, connected } = useWallet();
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!connected || !publicKey) {
      setBalance(null);
      return;
    }

    setIsLoading(true);
    getUSDCBalance(getConnection(), publicKey)
      .then(({ balance }) => {
        setBalance(balance);
      })
      .catch((error) => {
        console.error("Failed to fetch balance:", error);
        setBalance(0);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [connected, publicKey]);

  return {
    connected,
    publicKey: publicKey?.toString() || null,
    balance,
    isLoading,
  };
}

