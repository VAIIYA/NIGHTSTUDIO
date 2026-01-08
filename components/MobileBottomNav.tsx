"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Plus, Bell, User } from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { cn } from "@/lib/utils";

export function MobileBottomNav() {
  const pathname = usePathname();
  const { publicKey } = useWallet();

  const navItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/compose", icon: Plus, label: "Compose" },
    { href: "/notifications", icon: Bell, label: "Notifications" },
    {
      href: publicKey ? `/profile/${publicKey.toString()}` : "/",
      icon: User,
      label: "Profile",
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border md:hidden">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || 
            (item.href.startsWith("/profile") && pathname?.startsWith("/profile"));
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5 mb-1" />
              <span className="text-xs">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

