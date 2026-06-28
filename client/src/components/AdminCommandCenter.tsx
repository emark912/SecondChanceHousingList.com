import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { DollarSign, ShoppingCart, Users, TrendingUp, Package, AlertCircle, ArrowUpRight, ArrowDownRight } from "lucide-react";

function KPICard({
  title,
  value,
  sub,
  icon: Icon,
  trend,
  trendLabel,
  color = "blue",
}: {
  title: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
  trend?: number;
  trendLabel?: string;
  color?: "blue" | "green" | "orange" | "purple" | "red";
}) {
  const colorMap = {
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400",
    green: "bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400",
    orange: "bg-orange-50 text-orange-600 dark:bg-orange-950 dark:text-orange-400",
    purple: "bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400",
    red: "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400",
  };
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-sm text-muted-foreground font-medium truncate">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
            {trend !== undefined && (
              <div className={`flex items-center gap-1 mt-1 text-xs font-medium ${trend >= 0 ? "text-green-600" : "text-red-500"}`}>
                {trend >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {Math.abs(trend).toFixed(1)}% {trendLabel}
              </div>
            )}
          </div>
          <div className={`p-2.5 rounded-lg shrink-0 ml-3 ${colorMap[color]}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

export function AdminCommandCenter() {
  const { data, isLoading, error } = trpc.adminInsights.getCommandCenter.useQuery();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}><CardContent className="p-5"><Skeleton className="h-16 w-full" /></CardContent></Card>
          ))}
        </div>
        <Card><CardContent className="p-5"><Skeleton className="h-64 w-full" /></CardContent></Card>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center gap-2 text-red-500 p-4">
        <AlertCircle className="h-5 w-5" />
        <span>Failed to load command center data.</span>
      </div>
    );
  }

  const conversionFunnelData = [
    { stage: "Submitted", count: data.totalSubmissions, fill: "#3b82f6" },
    { stage: "Completed", count: data.totalSubmissions - (data.totalOrders), fill: "#8b5cf6" },
    { stage: "Paid", count: data.totalOrders, fill: "#10b981" },
  ];

  return (
    <div className="space-y-6">
      {/* Revenue KPIs */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Revenue</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard
            title="Total Revenue"
            value={fmt(data.totalRevenue)}
            sub="All time (orders + partners)"
            icon={DollarSign}
            color="green"
          />
          <KPICard
            title="Today's Revenue"
            value={fmt(data.todayRevenue)}
            sub={
              data.stripeTodayRevenue > 0
                ? `${data.stripeTodayCount} orders (Stripe live)`
                : `${data.todayOrders} orders today`
            }
            icon={DollarSign}
            color="blue"
          />
          <KPICard
            title="Last 7 Days"
            value={fmt(data.last7Revenue)}
            sub={`${data.last7Orders} orders`}
            icon={TrendingUp}
            color="purple"
          />
          <KPICard
            title="Last 30 Days"
            value={fmt(data.last30Revenue)}
            sub={`${data.last30Orders} orders`}
            icon={TrendingUp}
            color="orange"
          />
        </div>
      </div>

      {/* Lead & Conversion KPIs */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Leads & Conversions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard
            title="Total Submissions"
            value={data.totalSubmissions.toLocaleString()}
            sub={`${data.todaySubmissions} today`}
            icon={Users}
            color="blue"
          />
          <KPICard
            title="Conversion Rate"
            value={`${data.conversionRate}%`}
            sub="Submissions → Paid orders"
            icon={TrendingUp}
            color="green"
          />
          <KPICard
            title="Cart Recovery Rate"
            value={`${data.cartRecoveryRate}%`}
            sub={`${data.recoveredCarts} of ${data.totalAbandonedCarts} recovered`}
            icon={ShoppingCart}
            color="orange"
          />
          <KPICard
            title="Partner Revenue"
            value={fmt(data.partnerRevenue)}
            sub={`${data.totalPackagesSold} packages sold`}
            icon={Package}
            color="purple"
          />
        </div>
      </div>

      {/* Payment Plans KPIs */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Payment Plans</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard
            title="Active Plans"
            value={data.activePlans.toLocaleString()}
            sub={`${data.totalPlans} total plans`}
            icon={Package}
            color="blue"
          />
          <KPICard
            title="Collected via Plans"
            value={fmt(data.planRevenue)}
            sub="Total installment revenue"
            icon={DollarSign}
            color="green"
          />
        </div>
      </div>

      {/* Revenue Trend Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Daily Revenue — Last 30 Days</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={data.dailyRevenue} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => {
                  const d = new Date(v);
                  return `${d.getMonth() + 1}/${d.getDate()}`;
                }}
              />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
              <Tooltip
                formatter={(v: number) => [fmt(v), "Revenue"]}
                labelFormatter={(l) => new Date(l).toLocaleDateString()}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#revenueGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Conversion Funnel */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Conversion Funnel</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={conversionFunnelData} layout="vertical" margin={{ top: 5, right: 20, left: 60, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis dataKey="stage" type="category" tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v: number) => [v.toLocaleString(), "Count"]} />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {conversionFunnelData.map((entry, index) => (
                  <rect key={index} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
