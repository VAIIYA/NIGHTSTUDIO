"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { LandingPage } from "@/components/LandingPage";
import { FeedView } from "@/components/FeedView";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export default function HomePage() {
  const { connected } = useWallet();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#9945FF]" />
      </div>
    );
  }

  if (!connected) {
    return <LandingPage />;
  }

  return <FeedView />;
}
