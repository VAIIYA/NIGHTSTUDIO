import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SolanaProviders } from "@/lib/solana/providers";
import { Toaster } from "@/components/ui/toaster";
import { Navbar } from "@/components/Navbar";
import { DesktopSideNav } from "@/components/DesktopSideNav";
import { MobileBottomNav } from "@/components/MobileBottomNav";

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
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <div className="flex flex-1">
              <DesktopSideNav />
              <main className="flex-1 md:ml-64 pb-16 md:pb-0">
                {children}
              </main>
            </div>
            <MobileBottomNav />
          </div>
          <Toaster />
        </SolanaProviders>
      </body>
    </html>
  );
}

