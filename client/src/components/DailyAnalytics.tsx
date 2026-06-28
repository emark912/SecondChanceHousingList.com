import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";
import { TrendingUp, Calendar } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface DailyData {
  date: string;
  totalSubmissions?: number;
  paidSubmissions?: number;
  completedSubmissions?: number;
  pendingSubmissions?: number;
  totalOrders?: number;
  completedOrders?: number;
  failedOrders?: number;
  pendingOrders?: number;
  totalRevenue?: string;
  caseManagerCount?: number;
}

export function DailyAnalytics() {
  const [days, setDays] = useState("30");
  const [activeTab, setActiveTab] = useState<"submissions" | "orders">("submissions");

  const submissionAnalytics = trpc.admin.dailySubmissionAnalytics.useQuery({ days: parseInt(days) });
  const orderAnalytics = trpc.admin.dailyOrderAnalytics.useQuery({ days: parseInt(days) });

  const isLoading = submissionAnalytics.isLoading || orderAnalytics.isLoading;
  const submissionData = submissionAnalytics.data || [];
  const orderData = orderAnalytics.data || [];

  const formatCurrency = (value: string | number) => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const getTotalStats = (data: DailyData[]) => {
    if (activeTab === "submissions") {
      return {
        total: data.reduce((sum, d) => sum + (d.totalSubmissions || 0), 0),
        paid: data.reduce((sum, d) => sum + (d.paidSubmissions || 0), 0),
        completed: data.reduce((sum, d) => sum + (d.completedSubmissions || 0), 0),
        pending: data.reduce((sum, d) => sum + (d.pendingSubmissions || 0), 0),
      };
    } else {
      return {
        total: data.reduce((sum, d) => sum + (d.totalOrders || 0), 0),
        completed: data.reduce((sum, d) => sum + (d.completedOrders || 0), 0),
        failed: data.reduce((sum, d) => sum + (d.failedOrders || 0), 0),
        pending: data.reduce((sum, d) => sum + (d.pendingOrders || 0), 0),
        revenue: data.reduce((sum, d) => sum + parseFloat(d.totalRevenue || "0"), 0),
        caseManagers: data.reduce((sum, d) => sum + (d.caseManagerCount || 0), 0),
      };
    }
  };

  const stats = getTotalStats(activeTab === "submissions" ? submissionData : orderData);
  const chartData = activeTab === "submissions" ? submissionData : orderData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-blue-600" />
            Daily Analytics
          </h2>
          <p className="text-gray-600 text-sm mt-1">Track submissions and orders by day</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Select value={days} onValueChange={setDays}>
            <SelectTrigger className="w-full sm:w-40">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tab Buttons */}
      <div className="flex gap-2">
        <Button
          onClick={() => setActiveTab("submissions")}
          variant={activeTab === "submissions" ? "default" : "outline"}
          className="flex-1 sm:flex-none"
        >
          Form Submissions
        </Button>
        <Button
          onClick={() => setActiveTab("orders")}
          variant={activeTab === "orders" ? "default" : "outline"}
          className="flex-1 sm:flex-none"
        >
          Orders & Revenue
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {activeTab === "submissions" ? (
          <>
            <Card>
              <CardContent className="pt-6">
                <p className="text-gray-600 text-sm font-medium">Total Submissions</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-gray-600 text-sm font-medium">Paid</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{stats.paid}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-gray-600 text-sm font-medium">Completed</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{stats.completed}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-gray-600 text-sm font-medium">Pending</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.pending}</p>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <Card>
              <CardContent className="pt-6">
                <p className="text-gray-600 text-sm font-medium">Total Orders</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-gray-600 text-sm font-medium">Completed</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{stats.completed}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-gray-600 text-sm font-medium">Total Revenue</p>
                <p className="text-2xl font-bold text-blue-600 mt-2">{formatCurrency(stats.revenue || 0)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-gray-600 text-sm font-medium">Case Managers</p>
                <p className="text-3xl font-bold text-indigo-600 mt-2">{stats.caseManagers}</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>
            {activeTab === "submissions" ? "Daily Form Submissions" : "Daily Orders & Revenue"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-80 flex items-center justify-center text-gray-500">
              Loading chart data...
            </div>
          ) : chartData.length === 0 ? (
            <div className="h-80 flex items-center justify-center text-gray-500">
              No data available for the selected period
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              {activeTab === "submissions" ? (
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="totalSubmissions" fill="#3b82f6" name="Total Submissions" />
                  <Bar dataKey="paidSubmissions" fill="#10b981" name="Paid" />
                  <Bar dataKey="completedSubmissions" fill="#8b5cf6" name="Completed" />
                  <Bar dataKey="pendingSubmissions" fill="#f59e0b" name="Pending" />
                </BarChart>
              ) : (
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="totalOrders" stroke="#3b82f6" name="Total Orders" strokeWidth={2} />
                  <Line yAxisId="left" type="monotone" dataKey="completedOrders" stroke="#10b981" name="Completed Orders" strokeWidth={2} />
                  <Line yAxisId="right" type="monotone" dataKey="caseManagerCount" stroke="#6366f1" name="Case Managers" strokeWidth={2} />
                </LineChart>
              )}
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Detailed Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {activeTab === "submissions" ? "Daily Submission Details" : "Daily Order Details"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold text-gray-900">Date</th>
                  {activeTab === "submissions" ? (
                    <>
                      <th className="px-4 py-2 text-right font-semibold text-gray-900">Total</th>
                      <th className="px-4 py-2 text-right font-semibold text-gray-900">Paid</th>
                      <th className="px-4 py-2 text-right font-semibold text-gray-900">Completed</th>
                      <th className="px-4 py-2 text-right font-semibold text-gray-900">Pending</th>
                    </>
                  ) : (
                    <>
                      <th className="px-4 py-2 text-right font-semibold text-gray-900">Total Orders</th>
                      <th className="px-4 py-2 text-right font-semibold text-gray-900">Completed</th>
                      <th className="px-4 py-2 text-right font-semibold text-gray-900">Failed</th>
                      <th className="px-4 py-2 text-right font-semibold text-gray-900">Revenue</th>
                      <th className="px-4 py-2 text-right font-semibold text-gray-900">Case Managers</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y">
                {chartData.length === 0 ? (
                  <tr>
                    <td colSpan={activeTab === "submissions" ? 5 : 6} className="px-4 py-3 text-center text-gray-500">
                      No data available
                    </td>
                  </tr>
                ) : (
                  chartData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{row.date}</td>
                      {activeTab === "submissions" ? (
                        <>
                          <td className="px-4 py-3 text-right text-gray-900">{(row as any).totalSubmissions}</td>
                          <td className="px-4 py-3 text-right text-green-600 font-medium">{(row as any).paidSubmissions}</td>
                          <td className="px-4 py-3 text-right text-blue-600 font-medium">{(row as any).completedSubmissions}</td>
                          <td className="px-4 py-3 text-right text-yellow-600 font-medium">{(row as any).pendingSubmissions}</td>
                        </>
                      ) : (
                        <>
                          <td className="px-4 py-3 text-right text-gray-900">{(row as any).totalOrders}</td>
                          <td className="px-4 py-3 text-right text-green-600 font-medium">{(row as any).completedOrders}</td>
                          <td className="px-4 py-3 text-right text-red-600 font-medium">{(row as any).failedOrders}</td>
                          <td className="px-4 py-3 text-right text-blue-600 font-medium">{formatCurrency((row as any).totalRevenue || 0)}</td>
                          <td className="px-4 py-3 text-right text-indigo-600 font-medium">{(row as any).caseManagerCount}</td>
                        </>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
