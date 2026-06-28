import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, XCircle, AlertTriangle, Database, Mail, CreditCard, Clock, RefreshCw, Server } from "lucide-react";
import { toast } from "sonner";

const statusConfig = {
  healthy: { color: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300", icon: CheckCircle2, label: "Healthy" },
  degraded: { color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300", icon: AlertTriangle, label: "Degraded" },
  error: { color: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300", icon: XCircle, label: "Error" },
  unknown: { color: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400", icon: AlertCircle, label: "Unknown" },
};

const serviceIcons: Record<string, React.ElementType> = {
  database: Database,
  email: Mail,
  stripe: CreditCard,
};

function ServiceCard({ name, service }: { name: string; service: { status: string; message: string } }) {
  const config = statusConfig[service.status as keyof typeof statusConfig] || statusConfig.unknown;
  const StatusIcon = config.icon;
  const ServiceIcon = serviceIcons[name] || Server;
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted">
              <ServiceIcon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium capitalize">{name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{service.message}</p>
            </div>
          </div>
          <Badge className={config.color}>
            <StatusIcon className="h-3 w-3 mr-1" />
            {config.label}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

export function AdminSystemHealth() {
  const { data, isLoading, error, refetch, isFetching } = trpc.adminInsights.getSystemHealth.useQuery(undefined, {
    refetchInterval: 60_000, // auto-refresh every 60s
  });

  if (isLoading) {
    return <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}</div>;
  }

  if (error || !data) {
    return (
      <div className="flex items-center gap-2 text-red-500 p-4">
        <AlertCircle className="h-5 w-5" />
        <span>Failed to load system health data.</span>
      </div>
    );
  }

  const allHealthy = Object.values(data.services).every(s => s.status === "healthy");

  return (
    <div className="space-y-6">
      {/* Header with refresh */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${allHealthy ? "bg-green-500" : "bg-yellow-500"} animate-pulse`} />
          <span className="text-sm text-muted-foreground">
            Last checked: {new Date(data.timestamp).toLocaleTimeString()}
          </span>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={`h-3.5 w-3.5 mr-1 ${isFetching ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Overall Status Banner */}
      {!allHealthy && (
        <Card className="border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 shrink-0" />
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              One or more services are reporting issues. Review the service status below.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Services */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Services</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(data.services).map(([name, service]) => (
            <ServiceCard key={name} name={name} service={service} />
          ))}
        </div>
      </div>

      {/* Email Stats */}
      {data.services.email && (
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Email Delivery (Last 24h)</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card><CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-green-600">{(data.services.email as { recentSent?: number }).recentSent ?? 0}</p>
              <p className="text-sm text-muted-foreground">Sent</p>
            </CardContent></Card>
            <Card><CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-red-500">{(data.services.email as { recentFailed?: number }).recentFailed ?? 0}</p>
              <p className="text-sm text-muted-foreground">Failed</p>
            </CardContent></Card>
          </div>
        </div>
      )}

      {/* Database Table Counts */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Database Row Counts</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {Object.entries(data.tableCounts).map(([table, count]) => (
            <Card key={table}>
              <CardContent className="p-3 text-center">
                <p className="text-xl font-bold">{count.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-0.5 capitalize">{table.replace(/_/g, " ")}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Alerts */}
      {data.alerts && data.alerts.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Alerts</h3>
          <div className="space-y-2">
            {data.alerts.map((alert: string, i: number) => (
              <Card key={i} className="border-yellow-200 dark:border-yellow-800">
                <CardContent className="p-3 flex items-center gap-3">
                  <AlertTriangle className="h-4 w-4 text-yellow-500 shrink-0" />
                  <p className="text-sm">{alert}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Cron Jobs */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Scheduled Jobs</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { name: "Lead Expiration", schedule: "Every 6 hours", description: "Expires old unmatched leads" },
            { name: "Abandoned Cart Recovery", schedule: "Every 2 hours", description: "Sends recovery emails to abandoned carts" },
            { name: "Scheduled Payments", schedule: "Every hour", description: "Processes installment payments" },
            { name: "Email Reminders", schedule: "Daily at 9am", description: "Sends payment reminder emails" },
          ].map((job) => (
            <Card key={job.name}>
              <CardContent className="p-3 flex items-start gap-3">
                <Clock className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium">{job.name}</p>
                  <p className="text-xs text-muted-foreground">{job.schedule}</p>
                  <p className="text-xs text-muted-foreground">{job.description}</p>
                </div>
                <Badge className="ml-auto bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 shrink-0">
                  Running
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
