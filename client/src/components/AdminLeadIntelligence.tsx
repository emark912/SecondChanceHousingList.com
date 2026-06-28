import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { AlertCircle, MapPin, Home, CreditCard, Users, TrendingUp } from "lucide-react";

const COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#06b6d4", "#ec4899", "#84cc16"];

function SectionCard({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export function AdminLeadIntelligence() {
  const { data, isLoading, error } = trpc.adminInsights.getLeadIntelligence.useQuery();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}><CardContent className="p-5"><Skeleton className="h-48 w-full" /></CardContent></Card>
        ))}
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center gap-2 text-red-500 p-4">
        <AlertCircle className="h-5 w-5" />
        <span>Failed to load lead intelligence data.</span>
      </div>
    );
  }

  const creditLabelMap: Record<string, string> = {
    eviction: "Eviction",
    low_credit: "Low Credit",
    bankruptcy: "Bankruptcy",
    criminal_history: "Criminal History",
    felony: "Felony",
    misdemeanor: "Misdemeanor",
    foreclosure: "Foreclosure",
    collections: "Collections",
    late_payments: "Late Payments",
    no_credit: "No Credit",
  };

  const creditData = data.creditChallenges.map(c => ({
    ...c,
    challenge: creditLabelMap[c.challenge] || c.challenge,
  }));

  const housingLabelMap: Record<string, string> = {
    apartment: "Apartment",
    house: "House",
    condo: "Condo",
    townhouse: "Townhouse",
    studio: "Studio",
    room: "Room",
  };

  const housingData = data.housingTypes.map(h => ({
    ...h,
    type: housingLabelMap[h.type] || h.type,
  }));

  const creditRatingOrder = ["poor", "fair", "good", "very_good", "excellent"];
  const creditRatingLabels: Record<string, string> = {
    poor: "Poor", fair: "Fair", good: "Good", very_good: "Very Good", excellent: "Excellent"
  };
  const creditRatingData = creditRatingOrder
    .map(r => ({ rating: creditRatingLabels[r] || r, count: data.creditRatingDistribution.find(c => c.rating === r)?.count || 0 }))
    .filter(r => r.count > 0);

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-blue-600">{data.totalSubmissions.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground mt-1">Total Submissions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-green-600">{data.conversionFunnel.paid.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground mt-1">Paid Customers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-purple-600">{data.topCities.length > 0 ? data.topCities[0].city : "—"}</p>
            <p className="text-sm text-muted-foreground mt-1">Top City</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-orange-600">
              {data.totalSubmissions > 0
                ? Math.round((data.conversionFunnel.paid / data.totalSubmissions) * 100)
                : 0}%
            </p>
            <p className="text-sm text-muted-foreground mt-1">Conversion Rate</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Cities */}
        <SectionCard title="Top 10 Cities" icon={MapPin}>
          {data.topCities.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.topCities} layout="vertical" margin={{ top: 0, right: 20, left: 80, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="city" type="category" tick={{ fontSize: 10 }} width={80} />
                <Tooltip formatter={(v: number) => [v, "Submissions"]} />
                <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </SectionCard>

        {/* Credit Challenges */}
        <SectionCard title="Credit Challenges" icon={CreditCard}>
          {creditData.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={creditData} layout="vertical" margin={{ top: 0, right: 20, left: 100, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="challenge" type="category" tick={{ fontSize: 10 }} width={100} />
                <Tooltip formatter={(v: number) => [v, "Submissions"]} />
                <Bar dataKey="count" fill="#ef4444" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </SectionCard>

        {/* Housing Types */}
        <SectionCard title="Housing Type Demand" icon={Home}>
          {housingData.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={housingData}
                  dataKey="count"
                  nameKey="type"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ type, percent }) => `${type} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {housingData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => [v, "Submissions"]} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </SectionCard>

        {/* Bedroom Distribution */}
        <SectionCard title="Bedroom Demand" icon={Home}>
          {data.bedroomDistribution.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.bedroomDistribution} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="bedrooms" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => [v, "Submissions"]} />
                <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </SectionCard>

        {/* Credit Rating Distribution */}
        <SectionCard title="Credit Rating Distribution" icon={CreditCard}>
          {creditRatingData.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={creditRatingData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="rating" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => [v, "Submissions"]} />
                <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </SectionCard>

        {/* Top States */}
        <SectionCard title="Top States" icon={MapPin}>
          {data.topStates.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No data yet</p>
          ) : (
            <div className="space-y-2">
              {data.topStates.slice(0, 8).map((s, i) => (
                <div key={s.state} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-4 shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-sm font-medium">{s.state}</span>
                      <span className="text-sm text-muted-foreground">{s.count}</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${(s.count / data.topStates[0].count) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
