"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { Button } from "@/components/ui/button";
import { Wallet, LogOut } from "lucide-react";
import { shortenAddress } from "@/lib/utils";

export function WalletMultiButton() {
  const { publicKey, disconnect, connected } = useWallet();
  const { setVisible } = useWalletModal();

  const handleClick = () => {
    if (connected) {
      disconnect();
    } else {
      setVisible(true);
    }
  };

  if (connected && publicKey) {
    return (
      <Button
        variant="outline"
        onClick={handleClick}
        className="gap-2"
      >
        <Wallet className="h-4 w-4" />
        <span className="hidden sm:inline">{shortenAddress(publicKey.toString())}</span>
        <span className="sm:hidden">{publicKey.toString().slice(0, 4)}...</span>
        <LogOut className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Button
      onClick={handleClick}
      className="bg-primary hover:bg-primary/90"
    >
      <Wallet className="h-4 w-4 mr-2" />
      Connect Wallet
    </Button>
  );
}

