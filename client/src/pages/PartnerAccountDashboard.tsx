import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { usePartnerSession } from "@/contexts/PartnerContext";

export default function PartnerAccountDashboard() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");
  const { session } = usePartnerSession();

  // Get partnerId from URL params (preferred) or from session
  const urlParams = new URLSearchParams(window.location.search);
  const urlPartnerId = urlParams.get("partnerId");
  const partnerId = urlPartnerId ? parseInt(urlPartnerId) : session.partnerId;

  // Only redirect if session has finished loading and there's no partnerId from URL or session
  if (!session.isLoading && !partnerId) {
    setLocation("/partner/login");
    return null;
  }

  // Show loading while session is being restored
  if (session.isLoading && !partnerId) {
    return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">Loading...</p></div>;
  }

  // Fetch partner data
  const { data: packages } = trpc.partnership.getPartnerPackages.useQuery({ partnerId: partnerId || 0 }, { enabled: !!partnerId });
  const { data: leads } = trpc.partnership.getPartnerDeliveredLeads.useQuery({ partnerId: partnerId || 0 }, { enabled: !!partnerId });
  const { data: dashboardData } = trpc.partnership.getDashboard.useQuery({ partnerId: partnerId || 0 }, { enabled: !!partnerId });
  const trialEnded = !!(dashboardData?.partner as any)?.trialEnded;
  const lockedLeadsCount = (dashboardData as any)?.lockedLeadsCount ?? 0;
  const logoutMutation = trpc.partnerAuth.logout.useMutation();

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      setLocation("/partner/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Calculate statistics
  const activePackages = packages?.filter((p: any) => !p.isExpired) || [];
  const totalLeadsRemaining = activePackages.reduce(
    (sum: number, p: any) => sum + (p.leadsRemaining || 0),
    0
  );
  const totalLeadsDelivered = leads?.length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Partner Dashboard</h1>
            <p className="text-blue-100 mt-1">Manage your leads and packages</p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="bg-white text-blue-600 hover:bg-blue-50"
          >
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Trial Ended Upgrade Banner */}
        {trialEnded && (
          <div className="mb-6 rounded-xl border-2 border-orange-400 bg-gradient-to-r from-orange-50 to-amber-50 p-6 shadow-md">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-2xl">
                  🔒
                </div>
                <div>
                  <h2 className="text-xl font-bold text-orange-900">Your Free Trial Has Ended</h2>
                  <p className="text-orange-800 mt-1">
                    You are still receiving new leads — but contact details are locked until you activate a package.
                  </p>
                  {lockedLeadsCount > 0 && (
                    <p className="mt-2 text-sm font-semibold text-orange-700 bg-orange-100 inline-block px-3 py-1 rounded-full">
                      🔓 {lockedLeadsCount} locked lead{lockedLeadsCount !== 1 ? 's' : ''} waiting — activate now to unlock full contact info
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setLocation("/partnership/dashboard-enhanced")}
                className="flex-shrink-0 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg shadow transition-colors text-sm whitespace-nowrap"
              >
                Activate a Lead Package →
              </button>
            </div>
          </div>
        )}
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-gray-600 text-sm font-medium">Active Packages</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">
                  {activePackages.length}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-gray-600 text-sm font-medium">Leads Remaining</p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {totalLeadsRemaining || 0}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-gray-600 text-sm font-medium">Leads Delivered</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">
                  {totalLeadsDelivered}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-gray-600 text-sm font-medium">Total Spent</p>
                <p className="text-3xl font-bold text-orange-600 mt-2">
                  ${packages?.reduce((sum: number, p: any) => sum + parseFloat(p.totalPrice?.toString() || "0"), 0).toFixed(2)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="packages">Packages</TabsTrigger>
            <TabsTrigger value="leads">Leads</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Welcome to Your Partner Account</CardTitle>
                <CardDescription>
                  Manage your lead packages and track your leads
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h3 className="font-semibold text-blue-900 mb-2">
                      How It Works
                    </h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>✓ Receive leads as soon as customers submit</li>
                      <li>✓ Trial leads show partial contact info</li>
                      <li>✓ Purchase packages to get full contact details</li>
                      <li>✓ 5 bonus leads included with every package</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h3 className="font-semibold text-green-900 mb-2">
                      Available Packages
                    </h3>
                    <ul className="text-sm text-green-800 space-y-1">
                      <li>• 10 Leads - $50</li>
                      <li>• 50 Leads - $250</li>
                      <li>• 100 Leads - $500</li>
                      <li>• 200+ Leads - Custom pricing</li>
                    </ul>
                  </div>
                </div>

                <Button
                  onClick={() => setLocation("/partnership/dashboard-enhanced")}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Browse Lead Packages
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Packages Tab */}
          <TabsContent value="packages" className="space-y-4">
            {activePackages.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-gray-600 mb-4">No active packages</p>
                  <Button
                    onClick={() => setLocation("/partnership/dashboard-enhanced")}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Purchase Package
                  </Button>
                </CardContent>
              </Card>
            ) : (
              activePackages.map((pkg: any) => (
                <Card key={pkg.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{pkg.packageName}</CardTitle>
                        <CardDescription>
                          Purchased on{" "}
                          {new Date(pkg.paidAt || pkg.createdAt).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-600">
                          {pkg.leadsRemaining || 0}
                        </p>
                        <p className="text-sm text-gray-600">Leads Remaining</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Total Leads:</span>
                        <span className="font-medium">{pkg.totalLeads}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Delivered:</span>
                        <span className="font-medium">{pkg.leadsDelivered}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Price Paid:</span>
                        <span className="font-medium">
                          ${pkg.totalPrice?.toString() || "0.00"}
                        </span>
                      </div>
                      {pkg.expiresAt && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Expires:</span>
                          <span className="font-medium">
                            {new Date(pkg.expiresAt).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Leads Tab */}
          <TabsContent value="leads" className="space-y-4">
            {leads && leads.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-gray-600">No leads delivered yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {leads?.slice(0, 10).map((lead: any) => (
                  <Card key={lead.id}>
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-xs text-gray-600 uppercase">Name</p>
                          <p className="font-medium">{lead.customerName}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 uppercase">Location</p>
                          <p className="font-medium">
                            {lead.city}, {lead.state}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 uppercase">Status</p>
                          <p className="font-medium capitalize">{lead.status}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-600 uppercase">Lead #</p>
                          <p className="font-medium">{lead.leadNumber}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Billing & Payment Methods</CardTitle>
                <CardDescription>
                  Manage your payment methods and view billing history
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <BillingManagementSection partnerId={partnerId || 0} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function BillingManagementSection({ partnerId }: { partnerId: number }) {
  const [, setLocation] = useLocation();
  const portalMutation = trpc.partnership.accessCustomerPortal.useMutation();
  const [isLoading, setIsLoading] = useState(false);

  const handleAccessPortal = async () => {
    setIsLoading(true);
    try {
      const result = await portalMutation.mutateAsync({
        partnerId,
        returnUrl: window.location.origin + "/partner/dashboard",
      });

      if (result.success && result.url) {
        window.open(result.url, "_blank");
      } else {
        alert(result.message || "Failed to access billing portal");
      }
    } catch (error) {
      console.error("Error accessing portal:", error);
      alert("Failed to access billing portal");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-2">Stripe Billing Portal</h3>
        <p className="text-sm text-blue-800 mb-4">
          Access your Stripe billing portal to manage payment methods, view invoices, and update your billing information.
        </p>
        <Button
          onClick={handleAccessPortal}
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isLoading ? "Loading..." : "Access Billing Portal"}
        </Button>
      </div>
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-2">What you can do:</h3>
        <ul className="text-sm text-gray-700 space-y-2">
          <li>✓ Update or add payment methods</li>
          <li>✓ View and download invoices</li>
          <li>✓ Update billing address</li>
          <li>✓ View payment history</li>
          <li>✓ Manage subscriptions</li>
        </ul>
      </div>
    </div>
  );
}
