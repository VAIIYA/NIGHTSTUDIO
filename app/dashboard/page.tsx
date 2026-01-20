"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DashboardOverview } from "@/components/dashboard/DashboardOverview";
import { SubscriptionManager } from "@/components/dashboard/SubscriptionManager";
import { AnalyticsDashboard } from "@/components/dashboard/AnalyticsDashboard";

type TabType = 'overview' | 'subscriptions' | 'analytics';

export default function DashboardPage() {
  const { connected, publicKey } = useWallet();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !connected) {
      router.push('/');
    }
  }, [connected, mounted, router]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-peach-gradient flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!connected) {
    return null; // Will redirect
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <DashboardOverview />;
      case 'subscriptions':
        return <SubscriptionManager />;
      case 'analytics':
        return <AnalyticsDashboard />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <DashboardLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {renderTabContent()}
    </DashboardLayout>
  );
}