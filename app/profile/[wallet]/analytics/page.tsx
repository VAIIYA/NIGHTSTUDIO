"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Subscription, Post, Unlock } from "@/types";
import { getCreatorSubscribers, getPostsByAuthor } from "@/lib/server-actions";
import { formatDate } from "@/lib/utils";
import {
  TrendingUp,
  Users,
  DollarSign,
  FileText,
  Eye,
  Calendar,
  Crown,
  Loader2
} from "lucide-react";

interface AnalyticsData {
  totalEarnings: number;
  totalSubscribers: number;
  totalPosts: number;
  totalUnlocks: number;
  monthlyEarnings: number;
  monthlySubscribers: number;
  topPosts: Post[];
  recentSubscribers: Subscription[];
  earningsOverTime: { date: string; amount: number }[];
}

export default function AnalyticsPage() {
  const params = useParams();
  const { publicKey, connected } = useWallet();
  const wallet = params.wallet as string;

  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isOwnProfile = publicKey?.toString() === wallet;

  useEffect(() => {
    if (connected && publicKey && isOwnProfile) {
      loadAnalytics();
    } else {
      setIsLoading(false);
    }
  }, [connected, publicKey, wallet, isOwnProfile]);

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);

      // Get subscribers
      const subscribers = await getCreatorSubscribers(wallet);

      // Get posts
      const posts = await getPostsByAuthor(wallet, 100, 0);

      // Calculate analytics
      const totalEarnings = subscribers.reduce((sum, sub) => sum + sub.totalPaid, 0);
      const totalSubscribers = subscribers.length;
      const totalPosts = posts.length;

      // Calculate unlocks (posts with paid images that have been unlocked)
      const totalUnlocks = posts.reduce((sum, post) => {
        // This is a simplified calculation - in reality we'd need to query unlocks
        return sum + (post.imagePrice ? Math.floor(Math.random() * 10) : 0); // Mock data
      }, 0);

      // Calculate monthly data (last 30 days)
      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
      const monthlySubscribers = subscribers.filter(sub => sub.createdAt > thirtyDaysAgo).length;
      const monthlyEarnings = subscribers
        .filter(sub => sub.createdAt > thirtyDaysAgo)
        .reduce((sum, sub) => sum + sub.totalPaid, 0);

      // Get top posts (by assumed engagement - in reality this would be calculated)
      const topPosts = posts
        .sort((a, b) => (b.likes + b.comments + b.reposts) - (a.likes + a.comments + a.reposts))
        .slice(0, 5);

      // Get recent subscribers
      const recentSubscribers = subscribers
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 10);

      // Mock earnings over time data
      const earningsOverTime = [];
      for (let i = 29; i >= 0; i--) {
        const date = new Date(Date.now() - (i * 24 * 60 * 60 * 1000));
        const amount = Math.floor(Math.random() * 50) + 10; // Mock data
        earningsOverTime.push({
          date: date.toISOString().split('T')[0],
          amount
        });
      }

      setAnalytics({
        totalEarnings,
        totalSubscribers,
        totalPosts,
        totalUnlocks,
        monthlyEarnings,
        monthlySubscribers,
        topPosts,
        recentSubscribers,
        earningsOverTime
      });
    } catch (error) {
      console.error("Failed to load analytics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!connected || !publicKey) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Please connect your wallet to view analytics</p>
        </div>
      </div>
    );
  }

  if (!isOwnProfile) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Only the profile owner can view analytics</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Failed to load analytics data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <TrendingUp className="h-8 w-8 text-primary" />
          Analytics Dashboard
        </h1>
        <p className="text-muted-foreground">
          Track your content performance and earnings
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalEarnings.toFixed(2)} USDC</div>
            <p className="text-xs text-muted-foreground">
              +{analytics.monthlyEarnings.toFixed(2)} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subscribers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalSubscribers}</div>
            <p className="text-xs text-muted-foreground">
              +{analytics.monthlySubscribers} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Posts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalPosts}</div>
            <p className="text-xs text-muted-foreground">
              Content created
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unlocks</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalUnlocks}</div>
            <p className="text-xs text-muted-foreground">
              Paid content views
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Earnings Over Time */}
        <Card>
          <CardHeader>
            <CardTitle>Earnings Over Time (30 days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 mx-auto mb-2" />
                <p>Chart visualization would go here</p>
                <p className="text-sm">Last 30 days: {analytics.monthlyEarnings.toFixed(2)} USDC</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Subscribers */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Subscribers</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.recentSubscribers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Crown className="h-8 w-8 mx-auto mb-2" />
                <p>No subscribers yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {analytics.recentSubscribers.slice(0, 5).map((subscriber) => (
                  <div key={subscriber.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-xs font-mono">
                          {subscriber.subscriber.slice(-4)}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {subscriber.subscriber.slice(0, 8)}...
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(subscriber.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{subscriber.totalPaid} USDC</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Posts */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Posts</CardTitle>
        </CardHeader>
        <CardContent>
          {analytics.topPosts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-8 w-8 mx-auto mb-2" />
              <p>No posts yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {analytics.topPosts.map((post, index) => (
                <div key={post.id} className="flex items-center gap-4 p-4 border border-border rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">
                      {post.content || "No text content"}
                    </p>
                    <div className="flex gap-4 text-xs text-muted-foreground mt-1">
                      <span>{post.likes} likes</span>
                      <span>{post.comments} comments</span>
                      <span>{post.reposts} reposts</span>
                      {post.imagePrice && <span>{post.imagePrice} USDC</span>}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatDate(post.createdAt)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}