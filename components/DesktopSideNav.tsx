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
    <aside className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 md:left-0 md:border-r md:border-primary/10 md:bg-white/50 md:backdrop-blur-xl">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center gap-2 p-6 border-b border-primary/5">
          <Sparkles className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold font-outfit">NightStudio</h1>
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
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold",
                  isActive
                    ? "bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]"
                    : "text-[#121212]/50 hover:bg-primary/5 hover:text-primary"
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

