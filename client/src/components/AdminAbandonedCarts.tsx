import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShoppingCart, Mail, AlertCircle, CheckCircle2, Clock, XCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  email_sent: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  completed: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  expired: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

const statusIcons: Record<string, React.ElementType> = {
  pending: Clock,
  email_sent: Mail,
  completed: CheckCircle2,
  expired: XCircle,
};

export function AdminAbandonedCarts() {
  const utils = trpc.useUtils();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data, isLoading, error } = trpc.adminInsights.getAbandonedCarts.useQuery();

  const sendRecoveryMutation = trpc.adminInsights.sendRecoveryEmail.useMutation({
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Recovery email sent successfully");
      } else {
        toast.error(result.message || "Failed to send recovery email");
      }
      utils.adminInsights.getAbandonedCarts.invalidate();
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
        <span>Failed to load abandoned carts.</span>
      </div>
    );
  }

  const { carts, stats } = data;

  const filtered = carts.filter(c => {
    const matchesSearch = !search ||
      c.customerName.toLowerCase().includes(search.toLowerCase()) ||
      c.customerEmail.toLowerCase().includes(search.toLowerCase()) ||
      c.location.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
          <p className="text-sm text-muted-foreground">Total Carts</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          <p className="text-sm text-muted-foreground">Pending</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-blue-500">{stats.emailSent}</p>
          <p className="text-sm text-muted-foreground">Email Sent</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
          <p className="text-sm text-muted-foreground">Recovered</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-purple-600">{stats.recoveryRate}%</p>
          <p className="text-sm text-muted-foreground">Recovery Rate</p>
        </CardContent></Card>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <Input
          placeholder="Search by name, email, or location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="email_sent">Email Sent</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground">
          <ShoppingCart className="h-8 w-8 mx-auto mb-2 opacity-40" />
          <p>{carts.length === 0 ? "No abandoned carts yet." : "No carts match your filters."}</p>
        </CardContent></Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Matches</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Abandoned</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((cart) => {
                const StatusIcon = statusIcons[cart.status] || Clock;
                const canSendEmail = cart.status === "pending" || cart.status === "email_sent";
                return (
                  <TableRow key={cart.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{cart.customerName}</p>
                        <p className="text-xs text-muted-foreground">{cart.customerEmail}</p>
                      </div>
                    </TableCell>
                    <TableCell><span className="text-sm">{cart.location}</span></TableCell>
                    <TableCell><span className="text-sm font-medium">{cart.rentalMatches}</span></TableCell>
                    <TableCell>
                      {cart.discountCode ? (
                        <div>
                          <span className="font-mono text-xs">{cart.discountCode}</span>
                          <span className="text-xs text-muted-foreground ml-1">({cart.discountPercentage}% off)</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[cart.status] || ""}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {cart.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground">
                        {new Date(cart.createdAt).toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {canSendEmail && (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={sendRecoveryMutation.isPending}
                          onClick={() => sendRecoveryMutation.mutate({ cartId: cart.id })}
                        >
                          <Mail className="h-3.5 w-3.5 mr-1" />
                          {sendRecoveryMutation.isPending ? "Sending..." : "Send Recovery"}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
