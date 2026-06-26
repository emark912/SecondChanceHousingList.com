import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
  Users, DollarSign, TrendingUp, Package, Search, CheckCircle,
  XCircle, Mail, Clock, BarChart3, Shield, RefreshCw
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";

function StatCard({ title, value, icon, color = "primary" }: {
  title: string; value: string | number; icon: React.ReactNode; color?: string;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm text-muted-foreground">{title}</div>
          <div className={`text-${color}-600`}>{icon}</div>
        </div>
        <div className="text-3xl font-bold text-foreground">{value}</div>
      </CardContent>
    </Card>
  );
}

export default function AdminPartnership() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [search, setSearch] = useState("");

  const { data: partners, isLoading, refetch } = trpc.adminPartnership.getAllPartners.useQuery({});
  const { data: overview } = trpc.adminPartnership.getRevenueAnalytics.useQuery({ days: 30 });

  const toggleActive = trpc.adminPartnership.updatePartnerStatus.useMutation({
    onSuccess: () => { toast.success("Partner status updated"); refetch(); },
    onError: (err) => toast.error(err.message),
  });

  const grantTrialLeads = trpc.adminPartnership.refundPackage.useMutation({
    onSuccess: () => { toast.success("Trial leads granted"); refetch(); },
    onError: (err) => toast.error(err.message),
  });

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-8 pb-8">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-bold text-primary mb-2">Admin Access Required</h2>
            <p className="text-muted-foreground text-sm">You must be an admin to view this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filteredPartners = (partners?.partners ?? []).filter(
    (p: any) =>
      p.partnerName.toLowerCase().includes(search.toLowerCase()) ||
      p.businessName.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-white px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Partnership Admin Panel</h1>
            <p className="text-primary-foreground/70 text-sm">Manage partners, leads, and revenue</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="text-white border-white/30 hover:bg-white/10"
            onClick={() => refetch()}
          >
            <RefreshCw className="h-4 w-4 mr-1" /> Refresh
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Overview Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Partners"
            value={overview?.analytics?.totalPackagesSold ?? 0}
            icon={<Users className="h-5 w-5" />}
          />
          <StatCard
            title="Verified Partners"
            value={0}
            icon={<CheckCircle className="h-5 w-5" />}
            color="green"
          />
          <StatCard
            title="Total Revenue"
            value={`$${(overview?.analytics?.totalRevenue ?? 0).toFixed(2)}`}
            icon={<DollarSign className="h-5 w-5" />}
            color="accent"
          />
          <StatCard
            title="Leads Delivered"
            value={overview?.analytics?.totalLeadsDelivered ?? 0}
            icon={<TrendingUp className="h-5 w-5" />}
            color="blue"
          />
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="partners">
          <TabsList>
            <TabsTrigger value="partners">Partners</TabsTrigger>
            <TabsTrigger value="leads">Recent Leads</TabsTrigger>
            <TabsTrigger value="packages">Packages</TabsTrigger>
          </TabsList>

          {/* Partners Tab */}
          <TabsContent value="partners" className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search partners..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Badge variant="outline">{filteredPartners.length} partners</Badge>
            </div>

            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16" />)}
              </div>
            ) : (
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Partner</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Trial Leads</TableHead>
                      <TableHead>Leads Delivered</TableHead>
                      <TableHead>Leads Purchased</TableHead>
                      <TableHead>Revenue</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPartners.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          No partners found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredPartners.map((partner: any) => (
                        <TableRow key={partner.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium text-foreground">{partner.partnerName}</div>
                              <div className="text-xs text-muted-foreground">{partner.email}</div>
                              <div className="text-xs text-muted-foreground">{partner.businessName}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              {partner.isVerified ? (
                                <Badge className="bg-green-100 text-green-700 text-xs w-fit">Verified</Badge>
                              ) : (
                                <Badge variant="outline" className="text-xs w-fit">Unverified</Badge>
                              )}
                              {partner.isActive ? (
                                <Badge className="bg-blue-100 text-blue-700 text-xs w-fit">Active</Badge>
                              ) : (
                                <Badge variant="outline" className="text-red-600 border-red-200 text-xs w-fit">Inactive</Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <span className="font-medium">{partner.trialLeadsRemaining}</span>
                              <span className="text-muted-foreground"> / {partner.trialLeadsUsed + partner.trialLeadsRemaining} used</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{partner.totalLeadsDelivered}</TableCell>
                          <TableCell className="font-medium text-accent">{partner.totalLeadsPurchased}</TableCell>
                          <TableCell className="font-medium text-green-600">
                            ${partner.totalRevenue.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(partner.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs h-7"
                                onClick={() => toggleActive.mutate({ partnerId: partner.id, status: (partner.status === 'active' ? 'inactive' : 'active') as 'active' | 'inactive' | 'suspended' })}
                                disabled={toggleActive.isPending}
                              >
                                {partner.isActive ? <XCircle className="h-3 w-3 mr-1" /> : <CheckCircle className="h-3 w-3 mr-1" />}
                                {partner.isActive ? "Deactivate" : "Activate"}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs h-7"
                                onClick={() => grantTrialLeads.mutate({ packageId: 0 })}
                                disabled={grantTrialLeads.isPending}
                              >
                                +5 Trials
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </Card>
            )}
          </TabsContent>

          {/* Leads Tab */}
          <TabsContent value="leads">
            <AdminLeadsTab />
          </TabsContent>

          {/* Packages Tab */}
          <TabsContent value="packages">
            <AdminPackagesTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function AdminLeadsTab() {
  const { data: leads, isLoading } = trpc.adminPartnership.getLeadDeliveryStats.useQuery();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base text-primary">Recent Lead Deliveries</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-12" />)}</div>
        ) : !leads || !leads.success ? (
          <div className="text-center py-8 text-muted-foreground text-sm">No leads delivered yet</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Renter</TableHead>
                <TableHead>Partner</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Purchased</TableHead>
                <TableHead>Delivered</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Lead delivery stats - no individual leads available */
                  leads?.stats && (<div className="p-4 text-sm text-muted-foreground">Stats: {leads.stats.totalLeadsDelivered} delivered, {leads.stats.leadsSent} sent, {leads.stats.leadsPurchased} purchased</div>)
                  }
                  {false && [].map(({ lead, submission, partner }: any) => (
                <TableRow key={lead.id}>
                  <TableCell>
                    <div className="font-medium text-sm">{submission?.firstName} {submission?.lastName}</div>
                    <div className="text-xs text-muted-foreground">{submission?.email}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{partner?.partnerName}</div>
                    <div className="text-xs text-muted-foreground">{partner?.email}</div>
                  </TableCell>
                  <TableCell className="text-sm">{submission?.city}, {submission?.state}</TableCell>
                  <TableCell>
                    {lead.isTrial ? (
                      <Badge variant="outline" className="text-xs">Trial</Badge>
                    ) : (
                      <Badge className="bg-blue-100 text-blue-700 text-xs">Package</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {lead.leadPurchased ? (
                      <Badge className="bg-green-100 text-green-700 text-xs">Yes</Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">No</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(lead.emailSentAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function AdminPackagesTab() {
  const { data: packages, isLoading } = trpc.adminPartnership.getAllPartners.useQuery({});

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base text-primary">All Lead Packages</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-12" />)}</div>
        ) : !packages || (packages?.partners ?? []).length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">No packages purchased yet</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Package</TableHead>
                <TableHead>Partner</TableHead>
                <TableHead>Leads</TableHead>
                <TableHead>Total Paid</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Expires</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(packages?.partners ?? []).map((partner: any) => (
                    <div key={partner.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <div><div className="font-medium text-sm">{partner.businessName}</div><div className="text-xs text-muted-foreground">{partner.email}</div></div>
                      <div className="text-right"><div className="font-semibold text-sm">${Number(partner.totalRevenue ?? 0).toFixed(2)}</div><Badge variant="outline" className="text-xs">{partner.packageCount} packages</Badge></div>
                    </div>
                  ))}
                  {false && [].map(({ pkg, partner }: any) => (
                <TableRow key={pkg.id}>
                  <TableCell className="font-medium text-sm">{pkg.packageName}</TableCell>
                  <TableCell>
                    <div className="text-sm">{partner?.partnerName}</div>
                    <div className="text-xs text-muted-foreground">{partner?.email}</div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{pkg.leadsRemaining}</span>
                    <span className="text-muted-foreground text-xs"> / {pkg.leadsIncluded}</span>
                  </TableCell>
                  <TableCell className="font-medium text-green-600">${Number(pkg.totalPrice).toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        pkg.status === "active"
                          ? "bg-green-100 text-green-700 text-xs"
                          : "bg-muted text-muted-foreground text-xs"
                      }
                    >
                      {pkg.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(pkg.expiresAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
