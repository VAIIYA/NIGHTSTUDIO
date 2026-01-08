"use client";

import { FC, ReactNode, useMemo } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import {
  SolflareWalletAdapter,
  LedgerWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { getConnection } from "./connection";
import { CLUSTER } from "./constants";

// Import wallet adapter CSS
import "@solana/wallet-adapter-react-ui/styles.css";

interface SolanaProvidersProps {
  children: ReactNode;
}

export const SolanaProviders: FC<SolanaProvidersProps> = ({ children }) => {
  // MAINNET ONLY - NO DEVNET
  const network = WalletAdapterNetwork.Mainnet;

  // Initialize wallets
  // Note: Phantom is auto-detected via Standard Wallet interface, so we don't need to explicitly include it
  const wallets = useMemo(
    () => [
      new SolflareWalletAdapter(),
      new LedgerWalletAdapter(),
    ],
    []
  );

  // Get connection (uses env var or default)
  const connection = useMemo(() => getConnection(), []);

  return (
    <ConnectionProvider endpoint={connection.rpcEndpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

