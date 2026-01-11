"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { Button } from "@/components/ui/button";
import { Wallet, LogOut } from "lucide-react";
import { shortenAddress } from "@/lib/utils";
import { useWalletStatus } from "@/hooks/useWalletStatus";

export function WalletMultiButton() {
  const { publicKey, disconnect, connected } = useWallet();
  const { setVisible } = useWalletModal();
  const { balance, isLoading } = useWalletStatus();

  const handleClick = () => {
    if (connected) {
      disconnect();
    } else {
      setVisible(true);
    }
  };

  if (connected && publicKey) {
    return (
      <div className="flex items-center gap-2">
        <div className="text-right text-sm">
          <div className="text-muted-foreground">USDC</div>
          <div className="font-semibold">
            {isLoading ? "..." : (balance ?? 0).toFixed(2)}
          </div>
        </div>
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
      </div>
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

