import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { DailyAnalytics } from "@/components/DailyAnalytics";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  DollarSign, ShoppingCart, Users, TrendingUp,
  Plus, FileText, Mail, Eye, CheckCircle2, Clock,
  XCircle, Building2
} from "lucide-react";
import { PaymentAccountability } from "@/components/PaymentAccountability";
import { AdminPartnersPanel } from "@/components/AdminPartnersPanel";
import { AdminEmailManagement } from "@/components/AdminEmailManagement";
import { AdminCommandCenter } from "@/components/AdminCommandCenter";
import { AdminLeadIntelligence } from "@/components/AdminLeadIntelligence";
import { AdminDiscountCodes } from "@/components/AdminDiscountCodes";
import { AdminAbandonedCarts } from "@/components/AdminAbandonedCarts";
import { AdminPaymentPlans } from "@/components/AdminPaymentPlans";
import { AdminSystemHealth } from "@/components/AdminSystemHealth";

function AdminContent() {
  const { data: dashboardData, isLoading: dashLoading } = trpc.admin.dashboard.useQuery();
  const { data: submissions } = trpc.admin.submissions.useQuery();
  const { data: nationalResults, refetch: refetchResults } = trpc.admin.nationalResults.useQuery();
  const { data: contactMessages } = trpc.admin.contactMessages.useQuery();

  const [showAddResult, setShowAddResult] = useState(false);
  const [newResult, setNewResult] = useState({
    companyName: "",
    companyWebsite: "",
    contactPerson: "",
    contactPhone: "",
    contactEmail: "",
    description: "",
    category: "other" as const,
  });

  const addResultMutation = trpc.admin.addNationalResult.useMutation({
    onSuccess: () => {
      toast.success("Result added successfully");
      setShowAddResult(false);
      setNewResult({
        companyName: "", companyWebsite: "", contactPerson: "",
        contactPhone: "", contactEmail: "", description: "", category: "other",
      });
      refetchResults();
    },
    onError: () => toast.error("Failed to add result"),
  });

  const deleteResultMutation = trpc.admin.deleteNationalResult.useMutation({
    onSuccess: () => {
      toast.success("Result removed");
      refetchResults();
    },
  });

  const markReadMutation = trpc.admin.markMessageRead.useMutation({
    onSuccess: () => toast.success("Marked as read"),
  });

  const todaySales = dashboardData?.todaySales;
  const todayOrders = dashboardData?.todayOrders || [];
  const allOrders = dashboardData?.allOrders || [];
  const stripeToday = dashboardData?.stripeToday || 0;
  const stripeTodayCount = dashboardData?.stripeTodayCount || 0;
  // Use Stripe revenue if it's higher than DB (catches webhook delays)
  const effectiveTodayRevenue = stripeToday > parseFloat(String(todaySales?.total || "0"))
    ? stripeToday.toFixed(2)
    : todaySales?.total || "0.00";
  const effectiveTodayCount = Math.max(todaySales?.count || 0, stripeTodayCount);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100"><CheckCircle2 className="w-3 h-3 mr-1" />Completed</Badge>;
      case "pending":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case "failed":
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Failed</Badge>;
      case "refunded":
        return <Badge variant="outline"><XCircle className="w-3 h-3 mr-1" />Refunded</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your SecondChanceHousingList.com business
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Today's Revenue</p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  ${effectiveTodayRevenue}
                </p>
                {stripeToday > 0 && <p className="text-xs text-green-600 mt-0.5">Live from Stripe</p>}
              </div>
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Today's Paid Orders</p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {effectiveTodayCount}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Total Orders Today</p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {todaySales?.totalOrders || 0}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">National Results</p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {nationalResults?.length || 0}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Form Submissions</p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {submissions?.length || 0}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-cyan-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-cyan-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="orders" className="space-y-4">
        <TabsList className="bg-muted/50 h-auto flex flex-wrap gap-1 p-1">
            <TabsTrigger value="command">🏠 Overview</TabsTrigger>
            <TabsTrigger value="analytics">📊 Analytics</TabsTrigger>
            <TabsTrigger value="leads">🎯 Lead Intelligence</TabsTrigger>
            <TabsTrigger value="orders">🛒 Orders</TabsTrigger>
            <TabsTrigger value="payments">💳 Payments</TabsTrigger>
            <TabsTrigger value="plans">📅 Payment Plans</TabsTrigger>
            <TabsTrigger value="partners">🤝 Partners</TabsTrigger>
            <TabsTrigger value="carts">🛍️ Abandoned Carts</TabsTrigger>
            <TabsTrigger value="discounts">🏷️ Discount Codes</TabsTrigger>
            <TabsTrigger value="submissions">📋 Submissions</TabsTrigger>
            <TabsTrigger value="results">🏢 National Results</TabsTrigger>
            <TabsTrigger value="programs">📌 Programs</TabsTrigger>
            <TabsTrigger value="messages">✉️ Messages</TabsTrigger>
            <TabsTrigger value="email">📧 Email Mgmt</TabsTrigger>
            <TabsTrigger value="health">⚙️ System Health</TabsTrigger>
          </TabsList>

        {/* Command Center Tab */}
        <TabsContent value="command">
          <AdminCommandCenter />
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <DailyAnalytics />
        </TabsContent>

        {/* Lead Intelligence Tab */}
        <TabsContent value="leads">
          <AdminLeadIntelligence />
        </TabsContent>

        {/* Payment Accountability Tab */}
        <TabsContent value="payments">
          <PaymentAccountability />
        </TabsContent>

        {/* Partners Tab */}
        <TabsContent value="partners">
          <AdminPartnersPanel />
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Payment Plan</TableHead>
                      <TableHead>Payment Status</TableHead>
                      <TableHead>Email Sent</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allOrders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          No orders yet
                        </TableCell>
                      </TableRow>
                    ) : (
                      allOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">#{order.id}</TableCell>
                          <TableCell>{order.customerName}</TableCell>
                          <TableCell className="text-sm">{order.customerEmail}</TableCell>
                          <TableCell>${order.amount}</TableCell>
                          <TableCell>
                            {(order as any).paymentPlan === 'plan_500' ? (
                              <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100 text-xs whitespace-nowrap">$500 Down Plan</Badge>
                            ) : (order as any).paymentPlan === 'plan_250' ? (
                              <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 text-xs whitespace-nowrap">$250 Down Plan</Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs">Full Payment</Badge>
                            )}
                          </TableCell>
                          <TableCell>{getStatusBadge(order.paymentStatus)}</TableCell>
                          <TableCell>
                            {order.emailSent ? (
                              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                                <Mail className="w-3 h-3 mr-1" />Sent
                              </Badge>
                            ) : (
                              <Badge variant="secondary">Pending</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Submissions Tab */}
        <TabsContent value="submissions">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Housing Types</TableHead>
                      <TableHead>Credit Challenges</TableHead>
                      <TableHead>Bedrooms</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {!submissions || submissions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No submissions yet
                        </TableCell>
                      </TableRow>
                    ) : (
                      submissions.map((sub) => (
                        <TableRow key={sub.id}>
                          <TableCell className="font-medium">#{sub.id}</TableCell>
                          <TableCell>
                            <div>{sub.fullName}</div>
                            <div className="text-xs text-muted-foreground">{sub.email}</div>
                          </TableCell>
                          <TableCell>{sub.location}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {(sub.housingTypes as string[]).slice(0, 2).map((h, i) => (
                                <Badge key={i} variant="secondary" className="text-[10px]">{h}</Badge>
                              ))}
                              {(sub.housingTypes as string[]).length > 2 && (
                                <Badge variant="secondary" className="text-[10px]">
                                  +{(sub.housingTypes as string[]).length - 2}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {(sub.creditChallenges as string[]).slice(0, 2).map((c, i) => (
                                <Badge key={i} variant="secondary" className="text-[10px]">{c}</Badge>
                              ))}
                              {(sub.creditChallenges as string[]).length > 2 && (
                                <Badge variant="secondary" className="text-[10px]">
                                  +{(sub.creditChallenges as string[]).length - 2}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{sub.bedrooms || "N/A"}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(sub.createdAt).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* National Results Tab */}
        <TabsContent value="results">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">
              National Results ({nationalResults?.length || 0})
            </h3>
            <Dialog open={showAddResult} onOpenChange={setShowAddResult}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add Result
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Add National Result</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label className="text-sm mb-1.5 block">Company Name *</Label>
                    <Input
                      value={newResult.companyName}
                      onChange={(e) => setNewResult({ ...newResult, companyName: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label className="text-sm mb-1.5 block">Category *</Label>
                    <Select
                      value={newResult.category}
                      onValueChange={(v) => setNewResult({ ...newResult, category: v as any })}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="program">Program</SelectItem>
                        <SelectItem value="apartment">Apartment</SelectItem>
                        <SelectItem value="landlord">Landlord</SelectItem>
                        <SelectItem value="realtor">Realtor</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm mb-1.5 block">Website</Label>
                    <Input
                      value={newResult.companyWebsite}
                      onChange={(e) => setNewResult({ ...newResult, companyWebsite: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-sm mb-1.5 block">Contact Person</Label>
                      <Input
                        value={newResult.contactPerson}
                        onChange={(e) => setNewResult({ ...newResult, contactPerson: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label className="text-sm mb-1.5 block">Phone</Label>
                      <Input
                        value={newResult.contactPhone}
                        onChange={(e) => setNewResult({ ...newResult, contactPhone: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm mb-1.5 block">Email</Label>
                    <Input
                      value={newResult.contactEmail}
                      onChange={(e) => setNewResult({ ...newResult, contactEmail: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label className="text-sm mb-1.5 block">Description</Label>
                    <Textarea
                      value={newResult.description}
                      onChange={(e) => setNewResult({ ...newResult, description: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => addResultMutation.mutate(newResult)}
                    disabled={!newResult.companyName || addResultMutation.isPending}
                  >
                    {addResultMutation.isPending ? "Adding..." : "Add Result"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Company</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Website</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {!nationalResults || nationalResults.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          No national results added yet. Click "Add Result" to start building your list.
                        </TableCell>
                      </TableRow>
                    ) : (
                      nationalResults.map((result) => (
                        <TableRow key={result.id}>
                          <TableCell>
                            <div className="font-medium">{result.companyName}</div>
                            <div className="text-xs text-muted-foreground line-clamp-1">{result.description}</div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="capitalize">{result.category}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{result.contactPerson}</div>
                            <div className="text-xs text-muted-foreground">{result.contactEmail}</div>
                          </TableCell>
                          <TableCell className="text-sm text-primary">
                            {result.companyWebsite ? (
                              <a href={result.companyWebsite} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                Visit
                              </a>
                            ) : "-"}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => deleteResultMutation.mutate({ id: result.id })}
                            >
                              Remove
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
        </TabsContent>

        {/* Programs Tab */}
        <TabsContent value="programs">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Manage Second Chance Programs</h3>
                    <p className="text-sm text-muted-foreground mt-1">Add, edit, and manage programs in your database</p>
                  </div>
                  <Button 
                    onClick={() => window.location.href = '/admin/programs'}
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                  >
                    <Building2 className="w-4 h-4 mr-2" />
                    Manage Programs
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact Messages Tab */}
        <TabsContent value="messages">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {!contactMessages || contactMessages.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No contact messages yet
                        </TableCell>
                      </TableRow>
                    ) : (
                      contactMessages.map((msg) => (
                        <TableRow key={msg.id}>
                          <TableCell className="font-medium">{msg.name}</TableCell>
                          <TableCell className="text-sm">{msg.email}</TableCell>
                          <TableCell>{msg.subject}</TableCell>
                          <TableCell className="max-w-xs truncate text-sm">{msg.message}</TableCell>
                          <TableCell>
                            {msg.isRead ? (
                              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Read</Badge>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => markReadMutation.mutate({ id: msg.id })}
                              >
                                Mark Read
                              </Button>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(msg.createdAt).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        {/* Email Management Tab */}
        <TabsContent value="email">
          <AdminEmailManagement />
        </TabsContent>

        {/* Abandoned Carts Tab */}
        <TabsContent value="carts">
          <AdminAbandonedCarts />
        </TabsContent>

        {/* Discount Codes Tab */}
        <TabsContent value="discounts">
          <AdminDiscountCodes />
        </TabsContent>

        {/* Payment Plans Tab */}
        <TabsContent value="plans">
          <AdminPaymentPlans />
        </TabsContent>

        {/* System Health Tab */}
        <TabsContent value="health">
          <AdminSystemHealth />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <DashboardLayout>
      <AdminContent />
    </DashboardLayout>
  );
}
