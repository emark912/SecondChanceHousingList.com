import React, { useState, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell
} from "recharts";
import {
  LayoutDashboard, Package, BarChart3, LogOut, TrendingUp,
  TrendingDown, Users, DollarSign, Clock, Target, ShoppingBag,
  Calendar, ArrowUpRight, ArrowDownRight, Minus
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { usePartner } from "@/contexts/PartnerContext";

const DATE_RANGES = [
  { label: "This Month", days: 30 },
  { label: "Last 3 Months", days: 90 },
  { label: "Last 6 Months", days: 180 },
  { label: "This Year", days: 365 },
];

const CHART_COLORS = {
  primary: "#2563eb",
  accent: "#1d4ed8",
  green: "#22c55e",
  blue: "#3b82f6",
  purple: "#a855f7",
  amber: "#f59e0b",
};

function MetricCard({
  title, value, subtitle, icon, trend, trendValue, color = "primary"
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  color?: "primary" | "accent" | "green" | "amber";
}) {
  const colorMap = {
    primary: "text-primary bg-primary/10",
    accent: "text-orange-600 bg-orange-50",
    green: "text-green-600 bg-green-50",
    amber: "text-amber-600 bg-amber-50",
  };

  const trendIcon = trend === "up"
    ? <ArrowUpRight className="h-3 w-3 text-green-500" />
    : trend === "down"
    ? <ArrowDownRight className="h-3 w-3 text-red-500" />
    : <Minus className="h-3 w-3 text-muted-foreground" />;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorMap[color]}`}>
            {icon}
          </div>
          {trendValue && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {trendIcon}
              <span className={trend === "up" ? "text-green-600" : trend === "down" ? "text-red-500" : ""}>
                {trendValue}
              </span>
            </div>
          )}
        </div>
        <div className="text-2xl font-bold text-foreground mb-0.5">{value}</div>
        <div className="text-sm font-medium text-muted-foreground">{title}</div>
        {subtitle && <div className="text-xs text-muted-foreground mt-1">{subtitle}</div>}
      </CardContent>
    </Card>
  );
}

export default function PartnerAnalytics() {
  const [, navigate] = useLocation();
  const { partner, isLoading: partnerLoading, refetch } = usePartner();
  const [selectedRange, setSelectedRange] = useState(0);

  const dateRange = useMemo(() => {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - DATE_RANGES[selectedRange].days);
    return { from, to };
  }, [selectedRange]);

  const [stablePartnerId] = useState(() => partner?.id ?? 0);
  const { data: analyticsRaw, isLoading } = trpc.partnership.analytics.useQuery(
    { partnerId: partner?.id ?? 0, startDate: dateRange.from.toISOString(), endDate: dateRange.to.toISOString() },
    { enabled: !!partner }
  );
  const analytics = analyticsRaw?.success ? analyticsRaw.data : null;

  const { data: purchasesRaw, isLoading: purchasesLoading } = trpc.partnership.getPurchaseHistory.useQuery(
    { partnerId: partner?.id ?? 0 },
    { enabled: !!partner }
  );
  const purchases = purchasesRaw?.success ? purchasesRaw.history : [];

  const handleLogout = () => { localStorage.removeItem("partner_id"); localStorage.removeItem("partner_email"); localStorage.removeItem("partner_business_name"); navigate("/partnership/login"); };

  if (partnerLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Skeleton className="h-8 w-48" />
      </div>
    );
  }

  if (!partner) {
    navigate("/partnership/login");
    return null;
  }

  // Prepare chart data
  const dailyData: Array<{date: string; delivered: number; purchased: number}> = [];
  const chartData = dailyData.map((d) => ({
    date: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    delivered: Number(d.delivered),
    purchased: Number(d.purchased),
    conversionRate: Number(d.delivered) > 0
      ? Math.round((Number(d.purchased) / Number(d.delivered)) * 100)
      : 0,
  }));

  // Package distribution for pie chart
  const packageData: Array<{name: string; value: number; remaining: number}> = [];

  const PIE_COLORS = [CHART_COLORS.primary, CHART_COLORS.accent, CHART_COLORS.green, CHART_COLORS.blue, CHART_COLORS.purple];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar text-sidebar-foreground flex-col shrink-0 hidden md:flex">
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-sidebar-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">SC</span>
            </div>
            <div>
              <div className="font-bold text-sm text-sidebar-foreground">Second Chance</div>
              <div className="text-xs text-sidebar-foreground/60">Partner Program</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          <Link href="/partnership/dashboard">
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground cursor-pointer">
              <LayoutDashboard className="h-4 w-4" /> Dashboard
            </div>
          </Link>
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium bg-sidebar-accent text-sidebar-accent-foreground cursor-pointer">
            <BarChart3 className="h-4 w-4" /> Analytics
          </div>
          <Link href="/partnership/packages">
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground cursor-pointer">
              <Package className="h-4 w-4" /> Lead Packages
            </div>
          </Link>
        </nav>
        <div className="p-3 border-t border-sidebar-border">
          <div className="px-4 py-2 text-sm text-sidebar-foreground/70">
            <div className="font-medium text-sidebar-foreground">{partner.partnerName}</div>
            <div className="text-xs truncate">{partner.email}</div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground w-full transition-colors"
          >
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-white border-b px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h1 className="text-xl font-bold text-primary">Performance Analytics</h1>
            <p className="text-sm text-muted-foreground">{partner.businessName}</p>
          </div>
          {/* Date Range Selector */}
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div className="flex gap-1">
              {DATE_RANGES.map((range, i) => (
                <Button
                  key={range.label}
                  size="sm"
                  variant={selectedRange === i ? "default" : "outline"}
                  className={`text-xs px-3 ${selectedRange === i ? "bg-primary text-white" : ""}`}
                  onClick={() => setSelectedRange(i)}
                >
                  {range.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Key Metrics Row */}
          {isLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-32" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title="Leads Received"
                value={analytics?.leadsInRange ?? 0}
                subtitle={`In ${DATE_RANGES[selectedRange].label.toLowerCase()}`}
                icon={<Users className="h-5 w-5" />}
                color="primary"
              />
              <MetricCard
                title="Leads Purchased"
                value={analytics?.leadsPurchased ?? 0}
                subtitle="Full contact unlocked"
                icon={<ShoppingBag className="h-5 w-5" />}
                color="accent"
              />
              <MetricCard
                title="Conversion Rate"
                value={`${analytics?.conversionRate ?? 0}%`}
                subtitle="Leads purchased / received"
                icon={<Target className="h-5 w-5" />}
                color="green"
                trend={
                  (analytics?.conversionRate ?? 0) >= 30 ? "up"
                  : (analytics?.conversionRate ?? 0) >= 15 ? "neutral"
                  : "down"
                }
                trendValue={
                  (analytics?.conversionRate ?? 0) >= 30 ? "Strong"
                  : (analytics?.conversionRate ?? 0) >= 15 ? "Average"
                  : "Low"
                }
              />
              <MetricCard
                title="Avg. Response Time"
                value={
                  analytics?.avgResponseTimeHours
                    ? analytics.avgResponseTimeHours < 1
                      ? `${Math.round(analytics.avgResponseTimeHours * 60)}m`
                      : `${analytics.avgResponseTimeHours}h`
                    : "N/A"
                }
                subtitle="Time to purchase after delivery"
                icon={<Clock className="h-5 w-5" />}
                color="amber"
              />
            </div>
          )}

          {/* ROI Metrics Row */}
          {!isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-gradient-to-br from-primary to-primary/80 text-white">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-5 w-5 text-white/70" />
                    <span className="text-sm text-white/70">Total Invested</span>
                  </div>
                  <div className="text-3xl font-bold">${(analytics?.totalInvestment ?? 0).toFixed(2)}</div>
                  <div className="text-sm text-white/60 mt-1">Lead purchases</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-green-600 to-green-500 text-white">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-white/70" />
                    <span className="text-sm text-white/70">Est. Revenue Value</span>
                  </div>
                  <div className="text-3xl font-bold">${(analytics?.estimatedRevenue ?? 0).toFixed(0)}</div>
                  <div className="text-sm text-white/60 mt-1">Based on $500/conversion</div>
                </CardContent>
              </Card>
              <Card className={`bg-gradient-to-br text-white ${(analytics?.roi ?? 0) >= 0 ? "from-accent to-orange-500" : "from-red-600 to-red-500"}`}>
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    {(analytics?.roi ?? 0) >= 0
                      ? <TrendingUp className="h-5 w-5 text-white/70" />
                      : <TrendingDown className="h-5 w-5 text-white/70" />}
                    <span className="text-sm text-white/70">Return on Investment</span>
                  </div>
                  <div className="text-3xl font-bold">
                    {(analytics?.roi ?? 0) >= 0 ? "+" : ""}{analytics?.roi ?? 0}%
                  </div>
                  <div className="text-sm text-white/60 mt-1">
                    {(analytics?.roi ?? 0) >= 100 ? "Excellent ROI" : (analytics?.roi ?? 0) >= 0 ? "Positive ROI" : "Needs improvement"}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Charts */}
          <Tabs defaultValue="leads" className="space-y-4">
            <TabsList className="bg-muted">
              <TabsTrigger value="leads">Lead Activity</TabsTrigger>
              <TabsTrigger value="conversion">Conversion Rate</TabsTrigger>
              <TabsTrigger value="packages">Package Usage</TabsTrigger>
              <TabsTrigger value="history">Purchase History</TabsTrigger>
            </TabsList>

            {/* Lead Activity Chart */}
            <TabsContent value="leads">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base text-primary">Leads Received vs. Purchased</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-64" />
                  ) : chartData.length === 0 ? (
                    <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">
                      No lead data for this period
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={280}>
                      <AreaChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                        <defs>
                          <linearGradient id="colorDelivered" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.15} />
                            <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="colorPurchased" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={CHART_COLORS.accent} stopOpacity={0.15} />
                            <stop offset="95%" stopColor={CHART_COLORS.accent} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip
                          contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "12px" }}
                        />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="delivered"
                          name="Leads Received"
                          stroke={CHART_COLORS.primary}
                          strokeWidth={2}
                          fill="url(#colorDelivered)"
                        />
                        <Area
                          type="monotone"
                          dataKey="purchased"
                          name="Leads Purchased"
                          stroke={CHART_COLORS.accent}
                          strokeWidth={2}
                          fill="url(#colorPurchased)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Conversion Rate Chart */}
            <TabsContent value="conversion">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base text-primary">Daily Conversion Rate (%)</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-64" />
                  ) : chartData.length === 0 ? (
                    <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">
                      No conversion data for this period
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={280}>
                      <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} unit="%" domain={[0, 100]} />
                        <Tooltip
                          formatter={(v) => [`${v}%`, "Conversion Rate"]}
                          contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "12px" }}
                        />
                        <Line
                          type="monotone"
                          dataKey="conversionRate"
                          name="Conversion Rate"
                          stroke={CHART_COLORS.green}
                          strokeWidth={2.5}
                          dot={{ r: 3 }}
                          activeDot={{ r: 5 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Package Usage Pie Chart */}
            <TabsContent value="packages">
              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base text-primary">Lead Package Usage</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {packageData.length === 0 ? (
                      <div className="h-64 flex flex-col items-center justify-center text-muted-foreground text-sm gap-3">
                        <Package className="h-12 w-12 text-muted-foreground/30" />
                        <p>No active packages</p>
                        <Link href="/partnership/packages">
                          <Button size="sm" className="bg-accent hover:bg-accent/90 text-white">
                            Purchase a Package
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height={240}>
                        <PieChart>
                          <Pie
                            data={packageData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={3}
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            labelLine={false}
                          >
                            {packageData.map((_, index) => (
                              <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(v, n, p) => [`${v} used / ${p.payload.remaining} remaining`, p.payload.name]}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base text-primary">Package Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(purchases ?? []).length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground text-sm">No packages found</div>
                    ) : (
                      <div className="space-y-3">
                        {(purchases ?? []).map((pkg) => (
                          <div key={pkg.id} className="flex items-center gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium text-foreground truncate">{pkg.packageName}</span>
                                <Badge
                                  variant="outline"
                                  className={
                                    pkg.paymentStatus === "completed"
                                      ? "text-green-600 border-green-200 text-xs"
                                      : "text-muted-foreground text-xs"
                                  }
>
                                  {pkg.paymentStatus}
                                </Badge>
                              </div>
                              <div className="bg-muted rounded-full h-1.5 overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${pkg.paymentStatus === "completed" ? "bg-primary" : "bg-muted-foreground/30"}`}
                                  style={{ width: `${(pkg.totalLeads ?? 1) > 0 ? ((pkg.totalLeads - (pkg.leadsRemaining ?? 0)) / pkg.totalLeads) * 100 : 0}%` }}
                                />
                              </div>
                              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                <span>{(pkg.totalLeads ?? 0) - (pkg.leadsRemaining ?? 0)} used</span>
                                <span>{pkg.leadsRemaining ?? 0} remaining</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Purchase History */}
            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base text-primary">Lead Purchase History</CardTitle>
                </CardHeader>
                <CardContent>
                  {purchasesLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16" />)}
                    </div>
                  ) : !purchases || purchases.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <ShoppingBag className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
                      <p className="text-sm">No lead purchases in this period</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {(purchases ?? []).map((pkg) => (
                        <div
                          key={pkg.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                        >
                          <div>
                            <div className="font-medium text-sm text-foreground">
                              {pkg.packageName}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {pkg.totalLeads} leads •{" "}
                              {pkg.paidAt ? new Date(pkg.paidAt).toLocaleDateString() : "N/A"}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-sm text-foreground">
                              ${Number(pkg.totalPrice).toFixed(2)}
                            </div>
                            <Badge className="text-xs bg-green-100 text-green-700 border-green-200">
                              {pkg.paymentStatus}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Response Time Insight */}
          {!isLoading && analytics && (analytics.avgResponseTimeHours ?? 0) > 0 && (
            <Card className="border-blue-100 bg-blue-50/30">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                    <Clock className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold text-primary text-sm">Response Time Insight</div>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Your average response time is{" "}
                      <strong>
                        {(analytics.avgResponseTimeHours ?? 0) < 1
                          ? `${Math.round((analytics.avgResponseTimeHours ?? 0) * 60)} minutes`
                          : `${analytics.avgResponseTimeHours ?? 0} hours`}
                      </strong>.{"\ "}
                      {(analytics.avgResponseTimeHours ?? 0) <= 4
                        ? "Excellent! Fast responses significantly improve conversion rates."
                        : (analytics.avgResponseTimeHours ?? 0) <= 24
                        ? "Good response time. Aim for under 4 hours for best results."
                        : "Consider responding faster — leads contacted within 4 hours convert 3x better."}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
