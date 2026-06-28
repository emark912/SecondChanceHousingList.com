import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  CreditCard,
  TrendingUp,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Shield,
  ShieldOff,
  Mail,
  Plus,
  RefreshCw,
} from "lucide-react";

type PartnerStatus = "all" | "active" | "inactive" | "suspended";

// ─── Badge helpers ─────────────────────────────────────────────────────────────

function getStatusBadge(status: string) {
  switch (status) {
    case "active":
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          <CheckCircle2 className="w-3 h-3 mr-1" />Active
        </Badge>
      );
    case "pending_verification":
      return (
        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
          <Clock className="w-3 h-3 mr-1" />Pending
        </Badge>
      );
    case "inactive":
      return (
        <Badge variant="secondary">
          <XCircle className="w-3 h-3 mr-1" />Inactive
        </Badge>
      );
    case "suspended":
      return (
        <Badge variant="destructive">
          <AlertCircle className="w-3 h-3 mr-1" />Suspended
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function getVerificationBadge(isVerified: number) {
  return isVerified ? (
    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
      <CheckCircle2 className="w-3 h-3 mr-1" />Verified
    </Badge>
  ) : (
    <Badge variant="outline" className="text-gray-500">
      <Clock className="w-3 h-3 mr-1" />Unverified
    </Badge>
  );
}

function getCardBadge(hasCard: boolean) {
  return hasCard ? (
    <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">
      <CreditCard className="w-3 h-3 mr-1" />Card on File
    </Badge>
  ) : (
    <Badge variant="outline" className="text-gray-400">No Card</Badge>
  );
}

function getEmailStatusBadge(status: string) {
  switch (status) {
    case "sent":
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100 text-xs">Sent</Badge>;
    case "failed":
      return <Badge variant="destructive" className="text-xs">Failed</Badge>;
    case "bounced":
      return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100 text-xs">Bounced</Badge>;
    default:
      return <Badge variant="outline" className="text-xs">{status}</Badge>;
  }
}

function formatEmailType(type: string) {
  return type
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// ─── Partner Detail Dialog ──────────────────────────────────────────────────────

interface PartnerDetailDialogProps {
  partner: any;
  open: boolean;
  onClose: () => void;
  onStatusChange: () => void;
}

function PartnerDetailDialog({ partner, open, onClose, onStatusChange }: PartnerDetailDialogProps) {
  const [leadsToAdd, setLeadsToAdd] = useState("");
  const utils = trpc.useUtils();

  const updateStatusMutation = trpc.adminPartnership.updatePartnerStatus.useMutation({
    onSuccess: (data) => {
      toast.success(data.message || "Partner status updated");
      onStatusChange();
      onClose();
    },
    onError: (err) => toast.error(err.message || "Failed to update status"),
  });

  const grantLeadsMutation = trpc.adminPartnership.grantLeads.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      setLeadsToAdd("");
      // Refresh the partner list so the table reflects new lead count
      utils.adminPartnership.getAllPartners.invalidate();
      onStatusChange();
    },
    onError: (err) => toast.error(err.message || "Failed to grant leads"),
  });

  const { data: emailLogsData, isLoading: logsLoading, refetch: refetchLogs } =
    trpc.adminPartnership.getPartnerEmailLogs.useQuery(
      { partnerId: partner?.id ?? 0, limit: 10 },
      { enabled: open && !!partner?.id }
    );

  const resendEmailMutation = trpc.adminPartnership.resendPartnerEmail.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      refetchLogs();
    },
    onError: (err) => toast.error(err.message || "Failed to resend email"),
  });

  if (!partner) return null;

  const handleStatusChange = (newStatus: string) => {
    updateStatusMutation.mutate({
      partnerId: partner.id,
      status: newStatus as "active" | "inactive" | "suspended",
    });
  };

  const handleGrantLeads = () => {
    const n = parseInt(leadsToAdd, 10);
    if (!n || n < 1) {
      toast.error("Enter a valid number of leads (minimum 1)");
      return;
    }
    grantLeadsMutation.mutate({ partnerId: partner.id, leadsToAdd: n });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{partner.businessName}</DialogTitle>
          <p className="text-sm text-muted-foreground">{partner.partnerName} · {partner.email}</p>
        </DialogHeader>

        <Tabs defaultValue="overview" className="mt-2">
          <TabsList className="w-full">
            <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
            <TabsTrigger value="grant" className="flex-1">Grant Leads</TabsTrigger>
            <TabsTrigger value="emails" className="flex-1">Email Log</TabsTrigger>
          </TabsList>

          {/* ── Overview Tab ── */}
          <TabsContent value="overview" className="space-y-4 mt-4">
            {/* Identity grid */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Phone</p>
                <p className="font-medium mt-1">{partner.businessPhone || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Location</p>
                <p className="font-medium mt-1">
                  {[partner.businessCity, partner.businessState].filter(Boolean).join(", ") || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Joined</p>
                <p className="font-medium mt-1">{new Date(partner.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Last Login</p>
                <p className="font-medium mt-1">
                  {partner.lastLoginAt ? new Date(partner.lastLoginAt).toLocaleDateString() : "Never"}
                </p>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-4 gap-3 bg-muted/40 rounded-lg p-4">
              <div className="text-center">
                <p className={`text-2xl font-bold ${partner.trialLeadsRemaining < 5 ? "text-red-600" : "text-blue-600"}`}>
                  {partner.trialLeadsRemaining}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Trial Leads Left</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{partner.totalLeadsDelivered}</p>
                <p className="text-xs text-muted-foreground mt-1">Leads Delivered</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{partner.packageCount}</p>
                <p className="text-xs text-muted-foreground mt-1">Packages Bought</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">
                  ${Number(partner.totalRevenue || 0).toFixed(0)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Total Spent</p>
              </div>
            </div>

            {/* Status badges */}
            <div className="flex flex-wrap gap-2">
              {getStatusBadge(partner.status)}
              {getVerificationBadge(partner.isVerified)}
              {getCardBadge(!!partner.stripePaymentMethodId)}
              {partner.trialActivated ? (
                <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-100">Trial Activated</Badge>
              ) : (
                <Badge variant="outline" className="text-gray-400">Trial Not Activated</Badge>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 pt-2 border-t">
              {partner.status !== "active" && (
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => handleStatusChange("active")}
                  disabled={updateStatusMutation.isPending}
                >
                  <Shield className="w-4 h-4 mr-1" />Activate
                </Button>
              )}
              {partner.status !== "suspended" && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleStatusChange("suspended")}
                  disabled={updateStatusMutation.isPending}
                >
                  <ShieldOff className="w-4 h-4 mr-1" />Suspend
                </Button>
              )}
              {partner.status !== "inactive" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleStatusChange("inactive")}
                  disabled={updateStatusMutation.isPending}
                >
                  Deactivate
                </Button>
              )}
            </div>
          </TabsContent>

          {/* ── Grant Leads Tab ── */}
          <TabsContent value="grant" className="space-y-4 mt-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm font-medium text-blue-900 mb-1">Current Trial Leads Remaining</p>
              <p className={`text-3xl font-bold ${partner.trialLeadsRemaining < 5 ? "text-red-600" : "text-blue-700"}`}>
                {partner.trialLeadsRemaining}
              </p>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Enter the number of leads to add to this partner's trial balance. This is instant and does not charge the partner.
              </p>
              <div className="flex gap-3">
                <Input
                  type="number"
                  min={1}
                  max={500}
                  placeholder="e.g. 25"
                  value={leadsToAdd}
                  onChange={(e) => setLeadsToAdd(e.target.value)}
                  className="w-36"
                  onKeyDown={(e) => e.key === "Enter" && handleGrantLeads()}
                />
                <Button
                  onClick={handleGrantLeads}
                  disabled={grantLeadsMutation.isPending || !leadsToAdd}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  {grantLeadsMutation.isPending ? "Granting..." : "Grant Leads"}
                </Button>
              </div>

              {/* Quick preset buttons */}
              <div className="flex gap-2 flex-wrap">
                {[5, 10, 25, 50, 100].map((n) => (
                  <Button
                    key={n}
                    variant="outline"
                    size="sm"
                    onClick={() => setLeadsToAdd(String(n))}
                    className="text-xs"
                  >
                    +{n}
                  </Button>
                ))}
              </div>

              {leadsToAdd && !isNaN(parseInt(leadsToAdd)) && (
                <p className="text-xs text-muted-foreground">
                  After granting: <span className="font-semibold text-foreground">
                    {partner.trialLeadsRemaining + parseInt(leadsToAdd)} leads
                  </span>
                </p>
              )}
            </div>
          </TabsContent>

          {/* ── Email Log Tab ── */}
          <TabsContent value="emails" className="mt-4">
            {logsLoading ? (
              <div className="text-center py-8 text-muted-foreground text-sm">Loading email logs...</div>
            ) : !emailLogsData?.logs || emailLogsData.logs.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <Mail className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No emails sent to this partner yet.</p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground mb-3">
                  Showing last {emailLogsData.logs.length} emails sent to {partner.email}
                </p>
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Type</TableHead>
                        <TableHead className="text-xs">Subject</TableHead>
                        <TableHead className="text-xs">Status</TableHead>
                        <TableHead className="text-xs">Sent At</TableHead>
                        <TableHead className="text-xs text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {emailLogsData.logs.map((log: any) => (
                        <TableRow key={log.id}>
                          <TableCell className="text-xs">
                            <span className="font-medium">{formatEmailType(log.emailType)}</span>
                          </TableCell>
                          <TableCell className="text-xs max-w-[180px] truncate" title={log.subject}>
                            {log.subject}
                          </TableCell>
                          <TableCell>{getEmailStatusBadge(log.status)}</TableCell>
                          <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                            {new Date(log.sentAt).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right">
                            {(log.status === "failed" || log.status === "bounced") && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                disabled={resendEmailMutation.isPending}
                                onClick={() => resendEmailMutation.mutate({ emailLogId: log.id })}
                                title="Resend this email"
                              >
                                <RefreshCw className="w-3 h-3 mr-1" />
                                Resend
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {emailLogsData.logs.some((l: any) => l.status === "failed" || l.status === "bounced") && (
                  <p className="text-xs text-red-600 mt-2">
                    ⚠ Some emails failed or bounced. Click <strong>Resend</strong> on any row to retry delivery.
                  </p>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Panel ─────────────────────────────────────────────────────────────────

export function AdminPartnersPanel() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<PartnerStatus>("all");
  const [search, setSearch] = useState("");
  const [selectedPartner, setSelectedPartner] = useState<any>(null);

  const { data, isLoading, refetch } = trpc.adminPartnership.getAllPartners.useQuery({
    page,
    limit: 20,
    status: statusFilter,
  });

  const partners = data?.partners ?? [];
  const totalPages = data?.totalPages ?? 1;
  const totalPartners = data?.total ?? 0;

  // Client-side search filter
  const filtered = search.trim()
    ? partners.filter(
        (p: any) =>
          p.businessName.toLowerCase().includes(search.toLowerCase()) ||
          p.email.toLowerCase().includes(search.toLowerCase()) ||
          p.partnerName.toLowerCase().includes(search.toLowerCase())
      )
    : partners;

  // Summary stats for this page
  const activeCount = partners.filter((p: any) => p.status === "active").length;
  const totalRevenue = partners.reduce((sum: number, p: any) => sum + Number(p.totalRevenue || 0), 0);
  const withCard = partners.filter((p: any) => !!p.stripePaymentMethodId).length;

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center">
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Partners</p>
                <p className="text-xl font-bold">{totalPartners}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Active (page)</p>
                <p className="text-xl font-bold">{activeCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Card on File</p>
                <p className="text-xl font-bold">{withCard}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-orange-100 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Revenue (page)</p>
                <p className="text-xl font-bold">${totalRevenue.toFixed(0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, business, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v as PartnerStatus);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Business / Contact</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-center">Trial Leads</TableHead>
                  <TableHead className="text-center">Delivered</TableHead>
                  <TableHead className="text-center">Packages</TableHead>
                  <TableHead className="text-right">Total Spent</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Card</TableHead>
                  <TableHead>Verified</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-10 text-muted-foreground">
                      Loading partners...
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-10 text-muted-foreground">
                      {search ? "No partners match your search." : "No partners found."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((partner: any) => (
                    <TableRow key={partner.id} className="hover:bg-muted/30">
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{partner.businessName}</p>
                          <p className="text-xs text-muted-foreground">{partner.partnerName}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{partner.email}</TableCell>
                      <TableCell className="text-center">
                        <span className={`font-semibold ${partner.trialLeadsRemaining < 5 ? "text-red-600" : "text-blue-600"}`}>
                          {partner.trialLeadsRemaining}
                        </span>
                      </TableCell>
                      <TableCell className="text-center text-sm">{partner.totalLeadsDelivered}</TableCell>
                      <TableCell className="text-center text-sm">{partner.packageCount}</TableCell>
                      <TableCell className="text-right font-medium">
                        ${Number(partner.totalRevenue || 0).toFixed(2)}
                      </TableCell>
                      <TableCell>{getStatusBadge(partner.status)}</TableCell>
                      <TableCell>{getCardBadge(!!partner.stripePaymentMethodId)}</TableCell>
                      <TableCell>{getVerificationBadge(partner.isVerified)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {new Date(partner.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedPartner(partner)}
                          title="View details"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Page {page} of {totalPages} · {totalPartners} total partners
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="w-4 h-4" />Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next<ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Partner Detail Dialog */}
      <PartnerDetailDialog
        partner={selectedPartner}
        open={!!selectedPartner}
        onClose={() => setSelectedPartner(null)}
        onStatusChange={() => refetch()}
      />
    </div>
  );
}
