'use client';

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