/**
 * Admin Partnership Management Page
 * Dashboard for managing partnership program, partners, and revenue
 */

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { DollarSign, Users, TrendingUp, Mail } from "lucide-react";

export default function AdminPartnershipManagement() {
  const [selectedPartnerId, setSelectedPartnerId] = useState<number | null>(null);
  const [page, setPage] = useState(1);

  // Queries
  const allPartnersQuery = trpc.adminPartnership.getAllPartners.useQuery({
    page,
    limit: 20,
    status: "all",
  });

  const revenueQuery = trpc.adminPartnership.getRevenueAnalytics.useQuery({
    days: 30,
  });

  const leadStatsQuery = trpc.adminPartnership.getLeadDeliveryStats.useQuery();

  const partnerDetailsQuery = trpc.adminPartnership.getPartnerDetails.useQuery(
    { partnerId: selectedPartnerId! },
    { enabled: !!selectedPartnerId }
  );

  // Mutations
  const updateStatusMutation = trpc.adminPartnership.updatePartnerStatus.useMutation({
    onSuccess: () => {
      toast.success("Partner status updated");
      allPartnersQuery.refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const refundPackageMutation = trpc.adminPartnership.refundPackage.useMutation({
    onSuccess: () => {
      toast.success("Package refunded successfully");
      if (selectedPartnerId) {
        partnerDetailsQuery.refetch();
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleUpdateStatus = (partnerId: number, newStatus: "active" | "inactive" | "suspended") => {
    updateStatusMutation.mutate({ partnerId, status: newStatus });
  };

  const handleRefundPackage = (packageId: number) => {
    if (confirm("Are you sure you want to refund this package?")) {
      refundPackageMutation.mutate({ packageId, reason: "Admin refund" });
    }
  };

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Partnership Management</h1>
        <p className="text-gray-600">Manage partners, track revenue, and monitor lead delivery</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Partners</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allPartnersQuery.data?.partners.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="w-4 h-4" /> Revenue (30d)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${revenueQuery.data?.analytics.totalRevenue.toFixed(2) || "0.00"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Packages Sold (30d)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{revenueQuery.data?.analytics.totalPackagesSold || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Leads Delivered (30d)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{revenueQuery.data?.analytics.totalLeadsDelivered || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Lead Delivery Stats */}
      {leadStatsQuery.data && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Lead Delivery Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <div className="text-sm text-gray-600">Total Delivered</div>
                <div className="text-2xl font-bold">{leadStatsQuery.data.stats.totalLeadsDelivered}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Opened</div>
                <div className="text-2xl font-bold">{leadStatsQuery.data.stats.leadsOpened}</div>
                <div className="text-xs text-gray-500">{leadStatsQuery.data.stats.openRate}%</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Clicked</div>
                <div className="text-2xl font-bold">{leadStatsQuery.data.stats.leadsClicked}</div>
                <div className="text-xs text-gray-500">{leadStatsQuery.data.stats.clickRate}%</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Purchased</div>
                <div className="text-2xl font-bold">{leadStatsQuery.data.stats.leadsPurchased}</div>
                <div className="text-xs text-gray-500">{leadStatsQuery.data.stats.conversionRate}%</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Partners List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>All Partners</CardTitle>
              <CardDescription>Click a partner to view details</CardDescription>
            </CardHeader>
            <CardContent>
              {allPartnersQuery.isLoading ? (
                <div className="text-center py-8">Loading partners...</div>
              ) : allPartnersQuery.data?.partners.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No partners found</div>
              ) : (
                <div className="space-y-4">
                  {allPartnersQuery.data?.partners.map((partner) => (
                    <div
                      key={partner.id}
                      className={`p-4 border rounded-lg cursor-pointer transition ${
                        selectedPartnerId === partner.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => setSelectedPartnerId(partner.id)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold">{partner.partnerName}</h3>
                          <p className="text-sm text-gray-600">{partner.businessName}</p>
                        </div>
                        <Badge variant={partner.status === "active" ? "default" : "secondary"}>
                          {partner.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="text-gray-600">Packages</div>
                          <div className="font-semibold">{partner.packageCount}</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Leads Delivered</div>
                          <div className="font-semibold">{partner.totalLeadsDelivered}</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Revenue</div>
                          <div className="font-semibold">${partner.totalRevenue.toFixed(2)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Partner Details */}
        {selectedPartnerId && partnerDetailsQuery.data && (
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Partner Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <p className="text-sm text-gray-600">{partnerDetailsQuery.data.partner.email}</p>
                </div>

                <div>
                  <label className="text-sm font-medium">Status</label>
                  <div className="flex gap-2 mt-2">
                    {["active", "inactive", "suspended"].map((status) => (
                      <Button
                        key={status}
                        size="sm"
                        variant={partnerDetailsQuery.data.partner.status === status ? "default" : "outline"}
                        onClick={() => handleUpdateStatus(selectedPartnerId, status as any)}
                        disabled={updateStatusMutation.isPending}
                      >
                        {status}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Stats</label>
                  <div className="space-y-2 mt-2 text-sm">
                    <div className="flex justify-between">
                      <span>Total Packages:</span>
                      <span className="font-semibold">{partnerDetailsQuery.data.stats.totalPackages}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Active Packages:</span>
                      <span className="font-semibold">{partnerDetailsQuery.data.stats.activePackages}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Leads Delivered:</span>
                      <span className="font-semibold">{partnerDetailsQuery.data.stats.totalLeadsDelivered}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Revenue:</span>
                      <span className="font-semibold">${partnerDetailsQuery.data.stats.totalRevenue.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Packages */}
                <div>
                  <label className="text-sm font-medium">Packages</label>
                  <div className="space-y-2 mt-2">
                    {partnerDetailsQuery.data.packages.map((pkg) => (
                      <div key={pkg.id} className="p-2 bg-gray-50 rounded text-sm">
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-semibold">{pkg.packageName}</span>
                          <Badge variant="outline">{pkg.paymentStatus}</Badge>
                        </div>
                        <div className="text-xs text-gray-600 mb-2">
                          ${pkg.totalPrice.toString()} • {pkg.leadsRemaining} leads remaining
                        </div>
                        {pkg.paymentStatus === "completed" && (
                          <Button
                            size="sm"
                            variant="destructive"
                            className="w-full"
                            onClick={() => handleRefundPackage(pkg.id)}
                            disabled={refundPackageMutation.isPending}
                          >
                            Refund
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
