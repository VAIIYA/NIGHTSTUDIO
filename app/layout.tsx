import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { SolanaProviders } from "@/lib/solana/providers";
import { Toaster } from "@/components/ui/toaster";
import { Navbar } from "@/components/Navbar";
import { DesktopSideNav } from "@/components/DesktopSideNav";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { AppShell } from "@/components/AppShell";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "NightStudio - Solana Social Network",
  description: "Twitter clone with paid content unlocks on Solana mainnet",
  manifest: "/manifest.json",
  themeColor: "#9945FF",
  icons: {
    icon: "/logo.jpg",
    shortcut: "/logo.jpg",
    apple: "/logo.jpg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${outfit.variable} font-sans`}>
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

