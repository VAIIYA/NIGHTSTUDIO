"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Users, TrendingUp, Eye, Heart, MessageCircle } from "lucide-react";

export function DashboardOverview() {
  const stats = [
    {
      title: "Total Earnings",
      value: "$2,847.69",
      change: "+12.5%",
      changeType: "positive" as const,
      icon: DollarSign,
    },
    {
      title: "Total Fans",
      value: "1,247",
      change: "+8.2%",
      changeType: "positive" as const,
      icon: Users,
    },
    {
      title: "Posts This Month",
      value: "23",
      change: "+15.3%",
      changeType: "positive" as const,
      icon: TrendingUp,
    },
    {
      title: "Total Views",
      value: "45.2K",
      change: "+22.1%",
      changeType: "positive" as const,
      icon: Eye,
    },
  ];

  const recentActivity = [
    { type: "new_fan", message: "New fan subscribed: @cryptoqueen", time: "2 hours ago" },
    { type: "payment", message: "Received $5.00 from @blockchainfan", time: "4 hours ago" },
    { type: "engagement", message: "Post received 25 likes and 8 comments", time: "6 hours ago" },
    { type: "unlock", message: "Content unlocked by 3 fans", time: "1 day ago" },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <section className="text-center space-y-4" aria-labelledby="dashboard-welcome">
        <h1 id="dashboard-welcome" className="text-4xl font-bold">Welcome to your Dashboard</h1>
        <p className="text-[#121212]/70 max-w-2xl mx-auto">
          Manage your content, track your earnings, and grow your creator community.
        </p>
      </section>

      {/* Stats Grid */}
      <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-6" aria-labelledby="stats-heading">
        <h2 id="stats-heading" className="sr-only">Performance Statistics</h2>
        {stats.map((stat) => (
          <Card key={stat.title} className="bg-white/80 backdrop-blur-md border-[#121212]/10" role="article">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-primary" aria-hidden="true" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" aria-label={`${stat.title}: ${stat.value}`}>
                {stat.value}
              </div>
              <p className={`text-xs ${
                stat.changeType === 'positive' ? 'text-accent' : 'text-red-500'
              }`} aria-label={`Change: ${stat.change}`}>
                {stat.change} from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Recent Activity */}
      <Card className="bg-white/80 backdrop-blur-md border-[#121212]/10">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-[#121212]/5">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{activity.message}</p>
                  <p className="text-xs text-[#121212]/60">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="bg-white/80 backdrop-blur-md border-[#121212]/10">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <button className="p-4 text-left border border-[#121212]/10 rounded-lg hover:bg-primary/5 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Heart className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Create Post</p>
                  <p className="text-xs text-[#121212]/60">Share new content</p>
                </div>
              </div>
            </button>
            <button className="p-4 text-left border border-[#121212]/10 rounded-lg hover:bg-primary/5 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="font-medium">Manage Tiers</p>
                  <p className="text-xs text-[#121212]/60">Update subscriptions</p>
                </div>
              </div>
            </button>
            <button className="p-4 text-left border border-[#121212]/10 rounded-lg hover:bg-primary/5 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <MessageCircle className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Fan Messages</p>
                  <p className="text-xs text-[#121212]/60">Check inbox</p>
                </div>
              </div>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}