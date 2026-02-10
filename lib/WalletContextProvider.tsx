"use client"

import React, { useMemo } from 'react'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import {
    PhantomWalletAdapter,
    SolflareWalletAdapter,
    SafeWalletAdapter,
    TorusWalletAdapter
} from '@solana/wallet-adapter-wallets'
import { clusterApiUrl } from '@solana/web3.js'

// Import styles
require('@solana/wallet-adapter-react-ui/styles.css')

export default function WalletContextProvider({ children }: { children: React.ReactNode }) {
    // Ideally use a private RPC in production (Helius, Alchemy, etc.)
    const endpoint = useMemo(() =>
        process.env.NEXT_PUBLIC_SOLANA_RPC || clusterApiUrl('mainnet-beta'),
        [])

    const wallets = useMemo(() => [
        new PhantomWalletAdapter(),
        new SolflareWalletAdapter(),
        new SafeWalletAdapter(),
        new TorusWalletAdapter()
    ], [])

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>
                    {children}
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    )
}
