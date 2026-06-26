import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";
import { DollarSign, Search, Heart, TrendingUp } from "lucide-react";
import { toast } from "sonner";

export default function AdminDashboard() {
  const [, navigate] = useLocation();
  const { user, loading } = useAuth();
  const [analytics, setAnalytics] = useState<any>(null);

  const analyticsQuery = trpc.admin.getAnalytics.useQuery(
    undefined,
    { enabled: !!user && user.role === "admin" }
  );

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      toast.error("Admin access required");
      navigate("/");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (analyticsQuery.data) {
      setAnalytics(analyticsQuery.data);
    }
  }, [analyticsQuery.data]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return null;
  }

  const chartData = [
    { month: "Jan", searches: 400, donations: 240 },
    { month: "Feb", searches: 300, donations: 221 },
    { month: "Mar", searches: 200, donations: 229 },
    { month: "Apr", searches: 278, donations: 200 },
    { month: "May", searches: 189, donations: 229 },
    { month: "Jun", searches: 239, donations: 200 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-blue-600">Admin Dashboard</div>
          <Button
            variant="outline"
            onClick={() => {
              sessionStorage.clear();
              navigate("/");
            }}
          >
            Logout
          </Button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Total Searches</p>
                <p className="text-4xl font-bold text-gray-900 mt-2">
                  {analytics?.totalSearches || 0}
                </p>
              </div>
              <Search className="w-12 h-12 text-blue-600 opacity-20" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Total Donations</p>
                <p className="text-4xl font-bold text-gray-900 mt-2">
                  {analytics?.totalDonations || 0}
                </p>
              </div>
              <Heart className="w-12 h-12 text-red-600 opacity-20" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Total Revenue</p>
                <p className="text-4xl font-bold text-gray-900 mt-2">
                  ${analytics?.totalRevenue || 0}
                </p>
              </div>
              <DollarSign className="w-12 h-12 text-green-600 opacity-20" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Conversion Rate</p>
                <p className="text-4xl font-bold text-gray-900 mt-2">
                  {analytics?.conversionRate?.toFixed(1) || 0}%
                </p>
              </div>
              <TrendingUp className="w-12 h-12 text-purple-600 opacity-20" />
            </div>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          {/* Searches and Donations Chart */}
          <Card className="p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Searches & Donations</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="searches" fill="#3b82f6" />
                <Bar dataKey="donations" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Revenue Trend */}
          <Card className="p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Revenue Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="donations" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-3 gap-4">
            <Button
              onClick={() => navigate("/admin/properties")}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Manage Properties
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/")}
            >
              View Platform
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                const data = JSON.stringify(analytics, null, 2);
                const element = document.createElement("a");
                element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(data));
                element.setAttribute("download", "analytics.json");
                element.style.display = "none";
                document.body.appendChild(element);
                element.click();
                document.body.removeChild(element);
              }}
            >
              Export Analytics
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
