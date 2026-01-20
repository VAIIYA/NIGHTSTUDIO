"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { WalletMultiButton } from "@/components/WalletMultiButton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type TabType = 'overview' | 'subscriptions' | 'analytics';

interface DashboardLayoutProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  children: ReactNode;
}

const tabs = [
  { id: 'overview' as TabType, label: 'Overview', href: '/dashboard' },
  { id: 'subscriptions' as TabType, label: 'Subscriptions', href: '/dashboard/subscriptions' },
  { id: 'analytics' as TabType, label: 'Analytics', href: '/dashboard/analytics' },
];

export function DashboardLayout({ activeTab, onTabChange, children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-peach-gradient text-[#121212] overflow-hidden">
      {/* Background Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px]" />
      </div>

      {/* Navbar */}
      <header className="relative z-10 container mx-auto px-6 py-6 flex items-center justify-between" role="banner">
        <Logo />
        <nav className="hidden md:flex items-center gap-8" role="navigation" aria-label="Dashboard navigation">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded px-2 py-1",
                activeTab === tab.id
                  ? "text-primary"
                  : "text-[#121212]/70 hover:text-primary"
              )}
              aria-current={activeTab === tab.id ? "page" : undefined}
              aria-label={`Navigate to ${tab.label} tab`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
        <div className="hidden md:block">
          <WalletMultiButton />
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 pt-8 pb-32">
        <div className="container mx-auto px-6">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-primary/5 py-12 relative z-10">
        <div className="container mx-auto px-6 text-center text-[#121212]/40 text-xs font-semibold">
          <p>&copy; {new Date().getFullYear()} NightStudio. Built on Solana.</p>
          <div className="mt-4 flex items-center justify-center gap-6">
            <Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="/dmca" className="hover:text-primary transition-colors">DMCA</Link>
            <Link href="/contract" className="hover:text-primary transition-colors">Creator Contract</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}