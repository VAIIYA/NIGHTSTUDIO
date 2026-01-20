'use client';

import { useEffect } from "react";
import { SolanaProviders } from "@/lib/solana/providers";
import { Toaster } from "@/components/ui/toaster";
import { AppShell } from "@/components/AppShell";
import ErrorBoundary from "@/components/ErrorBoundary";
import { SkipLink } from "@/components/Accessibility";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Register service worker for PWA functionality
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    }
  }, []);

  return (
    <SolanaProviders>
      <ErrorBoundary>
        <SkipLink />
        <AppShell>
          {children}
        </AppShell>
      </ErrorBoundary>
      <Toaster />
    </SolanaProviders>
  );
}