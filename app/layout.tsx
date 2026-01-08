import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SolanaProviders } from "@/lib/solana/providers";
import { Toaster } from "@/components/ui/toaster";
import { Navbar } from "@/components/Navbar";
import { DesktopSideNav } from "@/components/DesktopSideNav";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { AppShell } from "@/components/AppShell";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NightStudio - Solana Social Network",
  description: "Twitter clone with paid content unlocks on Solana mainnet",
  manifest: "/manifest.json",
  themeColor: "#9945FF",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <SolanaProviders>
          <AppShell>
            {children}
          </AppShell>
          <Toaster />
        </SolanaProviders>
      </body>
    </html>
  );
}

