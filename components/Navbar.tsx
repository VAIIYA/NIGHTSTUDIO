"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "./Logo";
import { WalletMultiButton } from "./WalletMultiButton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export function Navbar() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-4 gap-4">
        <div className="flex items-center gap-6">
          <Logo />
          <a href="/about" className="hidden md:block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            About
          </a>
        </div>

        {/* Desktop Search */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users..."
              className="pl-10"
            />
          </div>
        </form>

        <div className="md:hidden">
          <WalletMultiButton />
        </div>

        {/* Desktop Wallet */}
        <div className="hidden md:block">
          <WalletMultiButton />
        </div>
      </div>
    </nav>
  );
}

