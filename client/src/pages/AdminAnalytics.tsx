import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export default function AdminAnalytics() {
  const [, navigate] = useLocation();
  const { data: user, isLoading } = trpc.auth.me.useQuery();

  const { data: metrics, isLoading: metricsLoading } = trpc.analytics.getConversionMetrics.useQuery(undefined, {
    enabled: !!user && user?.role === "admin",
  });

  const { data: dailyData, isLoading: dailyLoading } = trpc.admin.getDailySubmissions.useQuery(undefined, {
    enabled: !!user && user?.role === "admin",
  });

  useEffect(() => {
    if (!isLoading && (!user || user?.role !== "admin")) {
      navigate("/");
    }
  }, [user, isLoading, navigate]);

  if (isLoading || metricsLoading || dailyLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!user || user?.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h1>
          <p>You do not have permission to view this page.</p>
        </div>
      </div>
    );
  }

  // Prepare data for charts
  const conversionData = [
    {
      name: "30-Min Email",
      conversions: metrics?.thirtyMinConversions || 0,
      rate: (metrics?.thirtyMinConversionRate || 0).toFixed(2),
    },
    {
      name: "3-Day Email",
      conversions: metrics?.threeDayConversions || 0,
      rate: (metrics?.threeDayConversionRate || 0).toFixed(2),
    },
    {
      name: "No Email",
      conversions: metrics?.noEmailConversions || 0,
      rate: ((metrics?.noEmailConversions || 0) / (metrics?.totalSubmissions || 1) * 100).toFixed(2),
    },
  ];

  const revenueData = [
    {
      name: "30-Min Email",
      revenue: metrics?.thirtyMinRevenue || 0,
    },
    {
      name: "3-Day Email",
      revenue: metrics?.threeDayRevenue || 0,
    },
  ];

  const pieData = [
    { name: "30-Min Conversions", value: metrics?.thirtyMinConversions || 0, fill: "#3b82f6" },
    { name: "3-Day Conversions", value: metrics?.threeDayConversions || 0, fill: "#10b981" },
    { name: "No Email Conversions", value: metrics?.noEmailConversions || 0, fill: "#f59e0b" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Email Conversion Analytics</h1>
          <p className="text-slate-600">Track conversion rates and customer purchase behavior from reminder emails</p>
        </div>

        {/* Daily Submissions Widget */}
        <Card className="mb-8 border-2 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-2xl text-blue-900">Todays Form Submissions</CardTitle>
            <CardDescription>New leads received today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-bold text-blue-600 mb-6">{dailyData?.todayCount || 0}</div>
            
            {dailyData?.recentSubmissions && dailyData.recentSubmissions.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-4">Recent Submissions</h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {dailyData.recentSubmissions.map((submission: any) => (
                    <div key={submission.id} className="p-3 bg-white rounded border border-blue-100">
                      <p className="font-medium text-slate-900">{submission.name || "Unknown"}</p>
                      <p className="text-sm text-slate-600">{submission.location || "No location"}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {new Date(submission.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Total Submissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{metrics?.totalSubmissions || 0}</div>
              <p className="text-xs text-slate-500 mt-2">Form submissions received</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Total Conversions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{metrics?.totalConversions || 0}</div>
              <p className="text-xs text-slate-500 mt-2">
                {(metrics?.overallConversionRate || 0).toFixed(2)}% conversion rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Total Reminder Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">
                ${(Number(metrics?.totalReminderRevenue || 0) / 100).toFixed(2)}
              </div>
              <p className="text-xs text-slate-500 mt-2">From email reminders</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Avg Time to Purchase</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{metrics?.averageMinutes || 0}</div>
              <p className="text-xs text-slate-500 mt-2">minutes</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Conversion by Email Type */}
          <Card>
            <CardHeader>
              <CardTitle>Conversions by Email Type</CardTitle>
              <CardDescription>Number of conversions from each email reminder</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={conversionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="conversions" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Revenue by Email Type */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Email Type</CardTitle>
              <CardDescription>Total revenue generated from each email reminder</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => `$${(Number(value) / 100).toFixed(2)}`} />
                  <Bar dataKey="revenue" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Conversion Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Conversion Distribution</CardTitle>
              <CardDescription>Breakdown of conversions by email type</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Conversion Rates */}
          <Card>
            <CardHeader>
              <CardTitle>Conversion Rates by Email Type</CardTitle>
              <CardDescription>Percentage of submissions converting to purchases</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">30-Minute Email</span>
                    <span className="text-sm font-bold text-blue-600">
                      {(metrics?.thirtyMinConversionRate || 0).toFixed(2)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${Math.min(metrics?.thirtyMinConversionRate || 0, 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">3-Day Email</span>
                    <span className="text-sm font-bold text-green-600">
                      {(metrics?.threeDayConversionRate || 0).toFixed(2)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${Math.min(metrics?.threeDayConversionRate || 0, 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">Overall</span>
                    <span className="text-sm font-bold text-purple-600">
                      {(metrics?.overallConversionRate || 0).toFixed(2)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full"
                      style={{ width: `${Math.min(metrics?.overallConversionRate || 0, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Summary */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Revenue Summary</CardTitle>
            <CardDescription>Total revenue generated from reminder emails</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-slate-600 mb-2">30-Minute Email Revenue</p>
                <p className="text-2xl font-bold text-blue-600">
                  ${(Number(metrics?.thirtyMinRevenue || 0) / 100).toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-2">3-Day Email Revenue</p>
                <p className="text-2xl font-bold text-green-600">
                  ${(Number(metrics?.threeDayRevenue || 0) / 100).toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-2">Total Reminder Revenue</p>
                <p className="text-2xl font-bold text-purple-600">
                  ${(Number(metrics?.totalReminderRevenue || 0) / 100).toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
