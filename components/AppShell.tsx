"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { Navbar } from "@/components/Navbar";
import { DesktopSideNav } from "@/components/DesktopSideNav";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export function AppShell({ children }: { children: React.ReactNode }) {
    const { connected, connecting } = useWallet();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Prevent hydration mismatch by only rendering logic after mount
    if (!mounted) {
        return null;
    }

    if (!connected) {
        return <main className="min-h-screen bg-peach-gradient">{children}</main>;
    }

    return (
        <div className="min-h-screen flex flex-col bg-peach-gradient">
            <Navbar />
            <div className="flex flex-1">
                <DesktopSideNav />
                <main className="flex-1 md:ml-64 pb-16 md:pb-0">
                    {children}
                </main>
            </div>
            <MobileBottomNav />
        </div>
    );
}
