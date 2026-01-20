"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown, Eye, Heart, MessageCircle, Users, DollarSign, Calendar } from "lucide-react";

// Mock data - in real app, this would come from API
const analyticsData = {
  overview: {
    totalViews: 45230,
    totalEngagement: 8920,
    totalEarnings: 2847.69,
    newFans: 156,
    growth: {
      views: 22.1,
      engagement: 18.5,
      earnings: 12.5,
      fans: 8.2
    }
  },
  chartData: [
    { month: 'Jan', views: 12000, earnings: 450, fans: 45 },
    { month: 'Feb', views: 15000, earnings: 620, fans: 52 },
    { month: 'Mar', views: 18000, earnings: 780, fans: 67 },
    { month: 'Apr', views: 22000, earnings: 950, fans: 89 },
    { month: 'May', views: 28000, earnings: 1240, fans: 112 },
    { month: 'Jun', views: 45230, earnings: 2847.69, fans: 156 }
  ],
  topPosts: [
    { id: 1, title: 'Exclusive Behind the Scenes', views: 5420, likes: 234, comments: 45, earnings: 127.50 },
    { id: 2, title: 'New Collection Preview', views: 4890, likes: 198, comments: 32, earnings: 95.20 },
    { id: 3, title: 'Fan Appreciation Post', views: 4120, likes: 312, comments: 67, earnings: 89.30 },
    { id: 4, title: 'Live Session Highlights', views: 3650, likes: 176, comments: 28, earnings: 72.80 },
    { id: 5, title: 'Personal Story Time', views: 2980, likes: 145, comments: 22, earnings: 58.90 }
  ],
  audience: {
    demographics: [
      { age: '18-24', percentage: 35 },
      { age: '25-34', percentage: 42 },
      { age: '35-44', percentage: 18 },
      { age: '45+', percentage: 5 }
    ],
    locations: [
      { country: 'United States', percentage: 45 },
      { country: 'United Kingdom', percentage: 15 },
      { country: 'Germany', percentage: 12 },
      { country: 'Canada', percentage: 10 },
      { country: 'Australia', percentage: 8 },
      { country: 'Others', percentage: 10 }
    ]
  }
};

export function AnalyticsDashboard() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <p className="text-[#121212]/70 mt-2">
          Track your performance and understand your audience better.
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white/80 backdrop-blur-md border-[#121212]/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.overview.totalViews.toLocaleString()}</div>
            <p className="text-xs text-accent flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +{analyticsData.overview.growth.views}% this month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-md border-[#121212]/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement</CardTitle>
            <Heart className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.overview.totalEngagement.toLocaleString()}</div>
            <p className="text-xs text-accent flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +{analyticsData.overview.growth.engagement}% this month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-md border-[#121212]/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${analyticsData.overview.totalEarnings.toFixed(2)}</div>
            <p className="text-xs text-accent flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +{analyticsData.overview.growth.earnings}% this month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-md border-[#121212]/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Fans</CardTitle>
            <Users className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.overview.newFans}</div>
            <p className="text-xs text-accent flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +{analyticsData.overview.growth.fans}% this month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="performance" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="audience">Audience</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-6">
          {/* Growth Chart Placeholder */}
          <Card className="bg-white/80 backdrop-blur-md border-[#121212]/10">
            <CardHeader>
              <CardTitle>Monthly Growth</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-[#121212]/5 rounded-lg">
                <div className="text-center">
                  <TrendingUp className="h-12 w-12 text-primary mx-auto mb-4" />
                  <p className="text-[#121212]/70">Growth Chart Visualization</p>
                  <p className="text-sm text-[#121212]/50 mt-2">
                    Chart component would be implemented here with real data visualization
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Monthly Data Table */}
          <Card className="bg-white/80 backdrop-blur-md border-[#121212]/10">
            <CardHeader>
              <CardTitle>Monthly Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#121212]/10">
                      <th className="text-left py-3 px-4 font-semibold">Month</th>
                      <th className="text-left py-3 px-4 font-semibold">Views</th>
                      <th className="text-left py-3 px-4 font-semibold">Earnings</th>
                      <th className="text-left py-3 px-4 font-semibold">New Fans</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analyticsData.chartData.map((data) => (
                      <tr key={data.month} className="border-b border-[#121212]/5">
                        <td className="py-3 px-4">{data.month}</td>
                        <td className="py-3 px-4">{data.views.toLocaleString()}</td>
                        <td className="py-3 px-4">${data.earnings.toFixed(2)}</td>
                        <td className="py-3 px-4">{data.fans}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audience" className="space-y-6">
          {/* Demographics */}
          <Card className="bg-white/80 backdrop-blur-md border-[#121212]/10">
            <CardHeader>
              <CardTitle>Age Demographics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.audience.demographics.map((demo) => (
                  <div key={demo.age} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{demo.age}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-[#121212]/10 rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${demo.percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-[#121212]/70 w-12">{demo.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Geographic Distribution */}
          <Card className="bg-white/80 backdrop-blur-md border-[#121212]/10">
            <CardHeader>
              <CardTitle>Geographic Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.audience.locations.map((location) => (
                  <div key={location.country} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{location.country}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-[#121212]/10 rounded-full h-2">
                        <div
                          className="bg-accent h-2 rounded-full"
                          style={{ width: `${location.percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-[#121212]/70 w-12">{location.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          {/* Top Performing Posts */}
          <Card className="bg-white/80 backdrop-blur-md border-[#121212]/10">
            <CardHeader>
              <CardTitle>Top Performing Posts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.topPosts.map((post) => (
                  <div key={post.id} className="flex items-center justify-between p-4 border border-[#121212]/10 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium mb-2">{post.title}</h4>
                      <div className="flex items-center gap-4 text-sm text-[#121212]/70">
                        <span className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          {post.views.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="h-4 w-4" />
                          {post.likes}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="h-4 w-4" />
                          {post.comments}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-accent">${post.earnings.toFixed(2)}</div>
                      <div className="text-xs text-[#121212]/60">earned</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Content Insights */}
          <Card className="bg-white/80 backdrop-blur-md border-[#121212]/10">
            <CardHeader>
              <CardTitle>Content Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary mb-2">85%</div>
                  <div className="text-sm text-[#121212]/70">Engagement Rate</div>
                  <div className="text-xs text-accent mt-1">Above average</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent mb-2">4.2min</div>
                  <div className="text-sm text-[#121212]/70">Avg. View Time</div>
                  <div className="text-xs text-accent mt-1">Excellent retention</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary mb-2">67%</div>
                  <div className="text-sm text-[#121212]/70">Conversion Rate</div>
                  <div className="text-xs text-accent mt-1">Strong monetization</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}