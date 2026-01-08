"use client";

import { Logo } from "./Logo";
import { WalletMultiButton } from "./WalletMultiButton";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-4">
        <Logo />
        <div className="md:hidden">
          <WalletMultiButton />
        </div>
      </div>
    </nav>
  );
}

