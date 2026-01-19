'use client';

import { SolanaProviders } from "@/lib/solana/providers";
import { Toaster } from "@/components/ui/toaster";
import { AppShell } from "@/components/AppShell";
import ErrorBoundary from "@/components/ErrorBoundary";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SolanaProviders>
      <ErrorBoundary>
        <AppShell>
          {children}
        </AppShell>
      </ErrorBoundary>
      <Toaster />
    </SolanaProviders>
  );
}