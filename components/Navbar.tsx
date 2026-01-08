"use client";

import { WalletMultiButton } from "./WalletMultiButton";
import { Sparkles } from "lucide-react";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-bold">NightStudio</h1>
        </div>
        <div className="md:hidden">
          <WalletMultiButton />
        </div>
      </div>
    </nav>
  );
}

