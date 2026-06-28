import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, AlertCircle, Clock, CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export function AdminPaymentPlans() {
  const utils = trpc.useUtils();
  const [statusFilter, setStatusFilter] = useState("all");

  const { data, isLoading, error } = trpc.adminInsights.getPaymentPlansDashboard.useQuery();

  const retryMutation = trpc.adminInsights.retryScheduledPayment.useMutation({
    onSuccess: () => {
      toast.success("Payment retry triggered");
      utils.adminInsights.getPaymentPlansDashboard.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  if (isLoading) {
    return <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>;
  }

  if (error || !data) {
    return (
      <div className="flex items-center gap-2 text-red-500 p-4">
        <AlertCircle className="h-5 w-5" />
        <span>Failed to load payment plans.</span>
      </div>
    );
  }

  const { plans, stats, upcomingPayments, failedPayments } = data;

  const filteredPlans = plans.filter(p => statusFilter === "all" || p.status === statusFilter);

  const fmt = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

  const statusColors: Record<string, string> = {
    active: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    completed: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    cancelled: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
    failed: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
    pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
    paid: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    overdue: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{stats.totalPlans}</p>
          <p className="text-sm text-muted-foreground">Total Plans</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{stats.activePlans}</p>
          <p className="text-sm text-muted-foreground">Active</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-purple-600">{fmt(stats.totalCollected)}</p>
          <p className="text-sm text-muted-foreground">Collected</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-red-500">{failedPayments.length}</p>
          <p className="text-sm text-muted-foreground">Failed Payments</p>
        </CardContent></Card>
      </div>

      {/* Failed Payments Alert */}
      {failedPayments.length > 0 && (
        <Card className="border-red-200 dark:border-red-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-red-600 flex items-center gap-2">
              <XCircle className="h-4 w-4" />
              Failed Payments ({failedPayments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Attempts</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {failedPayments.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div>
                        <p className="text-xs text-muted-foreground">{p.customerEmail}</p>
                      </div>
                    </TableCell>
                    <TableCell><span className="font-medium">{fmt(p.amountDollars)}</span></TableCell>
                    <TableCell>
                      <span className="text-sm text-red-500">{new Date(p.scheduledDate).toLocaleDateString()}</span>
                    </TableCell>
                    <TableCell><span className="text-sm">{(p as any).retryCount ?? 0}</span></TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={retryMutation.isPending}
                        onClick={() => retryMutation.mutate({ paymentId: p.id })}
                      >
                        <RefreshCw className="h-3.5 w-3.5 mr-1" />
                        Retry
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Upcoming Payments */}
      {upcomingPayments.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              Upcoming Payments (Next 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {upcomingPayments.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                  <div>
                    <p className="text-xs text-muted-foreground">{p.customerEmail}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{fmt(p.amountDollars)}</p>
                    <p className="text-xs text-muted-foreground">{new Date(p.scheduledDate).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Plans */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">All Payment Plans</h3>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filteredPlans.length === 0 ? (
          <Card><CardContent className="p-8 text-center text-muted-foreground">
            <DollarSign className="h-8 w-8 mx-auto mb-2 opacity-40" />
            <p>{plans.length === 0 ? "No payment plans yet." : "No plans match the filter."}</p>
          </CardContent></Card>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Paid</TableHead>
                  <TableHead>Remaining</TableHead>
                  <TableHead>Installments</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
               {filteredPlans.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{plan.customerName}</p>
                        <p className="text-xs text-muted-foreground">{plan.customerEmail}</p>
                      </div>
                    </TableCell>
                    <TableCell><span className="font-medium">{fmt(plan.totalAmountDollars)}</span></TableCell>
                    <TableCell><span className="text-green-600">{fmt(plan.collectedDollars)}</span></TableCell>
                    <TableCell><span className="text-orange-600">{fmt(plan.remainingBalanceDollars)}</span></TableCell>
                    <TableCell>
                      <span className="text-sm">{plan.paymentSchedule ? (plan.paymentSchedule as Array<unknown>).length : "—"}</span>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[plan.status] || ""}>{plan.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground">{new Date(plan.createdAt).toLocaleDateString()}</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>
    </div>
  );
}
