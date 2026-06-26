import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Mail, Send, CheckCircle, AlertCircle, TrendingUp } from "lucide-react";
import { trpc } from "@/lib/trpc";

export function EmailDeliveryDashboard() {
  const [selectedEmailType, setSelectedEmailType] = useState("abandoned_checkout_20min");
  
  const emailStatsQuery = trpc.analytics.emailDelivery.getStats.useQuery();
  const emailByTypeQuery = trpc.analytics.emailDelivery.getByType.useQuery({ emailType: selectedEmailType });

  const emailStats = emailStatsQuery.data || {
    totalSent: 0,
    totalDelivered: 0,
    totalBounced: 0,
    totalOpened: 0,
    totalClicked: 0,
    totalConverted: 0,
    deliveryRate: 0,
    openRate: 0,
    clickRate: 0,
    conversionRate: 0,
  };

  const emailByType = emailByTypeQuery.data || [];

  // Prepare data for funnel chart
  const funnelData = [
    { name: "Sent", value: emailStats.totalSent, fill: "#3b82f6" },
    { name: "Delivered", value: emailStats.totalDelivered, fill: "#10b981" },
    { name: "Opened", value: emailStats.totalOpened, fill: "#f59e0b" },
    { name: "Clicked", value: emailStats.totalClicked, fill: "#8b5cf6" },
    { name: "Converted", value: emailStats.totalConverted, fill: "#ec4899" },
  ];

  // Prepare data for metrics chart
  const metricsData = [
    { metric: "Delivery", value: emailStats.deliveryRate.toFixed(1) },
    { metric: "Open", value: emailStats.openRate.toFixed(1) },
    { metric: "Click", value: emailStats.clickRate.toFixed(1) },
    { metric: "Conversion", value: emailStats.conversionRate.toFixed(1) },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Email Delivery Monitoring</h1>
        <p className="text-gray-600 mt-2">Track email performance, delivery rates, and conversion metrics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Sent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{emailStats.totalSent}</div>
              <Mail className="h-8 w-8 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Delivery Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{emailStats.deliveryRate.toFixed(1)}%</div>
              <Send className="h-8 w-8 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Open Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{emailStats.openRate.toFixed(1)}%</div>
              <CheckCircle className="h-8 w-8 text-amber-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Conversion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{emailStats.conversionRate.toFixed(1)}%</div>
              <TrendingUp className="h-8 w-8 text-pink-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="funnel" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="funnel">Email Funnel</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>

        <TabsContent value="funnel" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Funnel Analysis</CardTitle>
              <CardDescription>Track emails through each stage of the customer journey</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={funnelData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics (%)</CardTitle>
              <CardDescription>Email performance rates across all stages</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={metricsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="metric" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Bar dataKey="value" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Statistics</CardTitle>
              <CardDescription>Detailed breakdown of email performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4">
                    <div className="text-sm text-gray-600">Total Sent</div>
                    <div className="text-2xl font-bold">{emailStats.totalSent}</div>
                  </div>
                  <div className="border rounded-lg p-4">
                    <div className="text-sm text-gray-600">Delivered</div>
                    <div className="text-2xl font-bold">{emailStats.totalDelivered}</div>
                  </div>
                  <div className="border rounded-lg p-4">
                    <div className="text-sm text-gray-600">Bounced</div>
                    <div className="text-2xl font-bold text-red-600">{emailStats.totalBounced}</div>
                  </div>
                  <div className="border rounded-lg p-4">
                    <div className="text-sm text-gray-600">Opened</div>
                    <div className="text-2xl font-bold">{emailStats.totalOpened}</div>
                  </div>
                  <div className="border rounded-lg p-4">
                    <div className="text-sm text-gray-600">Clicked</div>
                    <div className="text-2xl font-bold">{emailStats.totalClicked}</div>
                  </div>
                  <div className="border rounded-lg p-4">
                    <div className="text-sm text-gray-600">Converted</div>
                    <div className="text-2xl font-bold text-green-600">{emailStats.totalConverted}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
