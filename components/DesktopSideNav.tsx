"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Plus, Bell, User, Sparkles, Search } from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { cn } from "@/lib/utils";
import { WalletMultiButton } from "./WalletMultiButton";

export function DesktopSideNav() {
  const pathname = usePathname();
  const { publicKey } = useWallet();

  const navItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/search", icon: Search, label: "Search" },
    { href: "/compose", icon: Plus, label: "Compose" },
    { href: "/notifications", icon: Bell, label: "Notifications" },
    {
      href: publicKey ? `/profile/${publicKey.toString()}` : "/",
      icon: User,
      label: "Profile",
    },
  ];

  return (
    <aside className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 md:left-0 md:border-r md:border-border md:bg-background">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center gap-2 p-6 border-b border-border">
          <Sparkles className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold">NightStudio</h1>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || 
              (item.href.startsWith("/profile") && pathname?.startsWith("/profile"));
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent/10 hover:text-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Wallet Button */}
        <div className="p-4 border-t border-border">
          <WalletMultiButton />
        </div>
      </div>
    </aside>
  );
}

