/**
 * Partnership Dashboard
 * Shows partner stats, leads, package management, and payment history
 */

import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function PartnershipDashboard() {
  const [, navigate] = useLocation();
  const [partnerId, setPartnerId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isUpdatingCard, setIsUpdatingCard] = useState(false);
  const [isRechargingNow, setIsRechargingNow] = useState(false);
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);

  const dashboardQuery = trpc.partnership.getDashboard.useQuery(
    { partnerId: partnerId || 0 },
    { enabled: !!partnerId }
  );

  const packagesQuery = trpc.partnership.getLeadPackages.useQuery();

  const [pendingLeadCount, setPendingLeadCount] = React.useState(0);

  // Update Card mutation — creates a new SetupIntent and redirects to card-save page
  const updateCardMutation = trpc.partnership.updateCard.useMutation({
    onSuccess: (data) => {
      setIsUpdatingCard(false);
      if (data.success && data.clientSecret) {
        sessionStorage.setItem("updateCardSecret", data.clientSecret);
        navigate(`/partner/activate-trial?partnerId=${partnerId}&mode=update`);
      } else {
        toast.error(data.message || "Failed to start card update. Please try again.");
      }
    },
    onError: () => {
      setIsUpdatingCard(false);
      toast.error("Failed to start card update. Please try again.");
    },
  });

  const handleUpdateCard = () => {
    if (!partnerId) return;
    setIsUpdatingCard(true);
    updateCardMutation.mutate({ partnerId });
  };

  // Recharge Now — quick charge using the smallest available package (10 leads)
  const handleRechargeNow = () => {
    if (!partnerId) return;
    const hasCard = !!(dashboardQuery.data?.partner as any)?.stripePaymentMethodId;
    if (!hasCard) {
      toast.error("No card on file. Please save a card first.");
      navigate(`/partner/activate-trial?partnerId=${partnerId}`);
      return;
    }
    setIsRechargingNow(true);
    chargeForLeadsMutation.mutate({ partnerId, leadCount: 10 });
  };

  const checkoutMutation = trpc.partnership.createCheckoutSession.useMutation({
    onSuccess: (data) => {
      setIsPurchasing(false);
      if (data.success && data.url) {
        toast.info("Redirecting to secure checkout...");
        window.open(data.url, "_blank");
        setPurchaseDialogOpen(false);
      } else {
        toast.error(data.message || "Failed to create checkout session");
      }
    },
    onError: () => {
      setIsPurchasing(false);
      toast.error("Failed to start checkout. Please try again.");
    },
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const idParam = params.get("partnerId");
    const paymentStatus = params.get("payment");
    if (idParam) {
      setPartnerId(parseInt(idParam));
      setIsLoading(false);
    }
    if (paymentStatus === "success") {
      setTimeout(() => {
        toast.success("Payment successful! Your lead package has been activated. You will start receiving leads shortly.", {
          duration: 7000,
        });
      }, 800);
    } else if (paymentStatus === "cancelled") {
      setTimeout(() => {
        toast.error("Payment was cancelled. Your package was not activated.", {
          duration: 4000,
        });
      }, 500);
    }
  }, []);

  // Instant charge using saved card (no redirect)
  const chargeForLeadsMutation = trpc.partnership.chargeForLeads.useMutation({
    onSuccess: (data) => {
      setIsPurchasing(false);
      setIsRechargingNow(false);
      if (data.success) {
        toast.success(data.message || "Payment successful! Leads activated.", { duration: 6000 });
        setPurchaseDialogOpen(false);
        dashboardQuery.refetch();
      } else if ((data as any).fallbackToCheckout) {
        // Fall back to Stripe Checkout if card needs authentication
        toast.info("Redirecting to checkout for card authentication...");
        if (partnerId) checkoutMutation.mutate({ partnerId, leadCount: pendingLeadCount });
      } else {
        toast.error(data.message || "Payment failed. Please try again.");
      }
    },
    onError: () => {
      setIsPurchasing(false);
      setIsRechargingNow(false);
      toast.error("Payment failed. Please try again.");
    },
  });

  /**
   * Smart purchase: use saved card if available, otherwise open Stripe Checkout
   */
  const handlePurchase = (leadCount: number) => {
    if (!partnerId) return;
    setIsPurchasing(true);
    setPendingLeadCount(leadCount);
    const hasCard = !!(dashboardQuery.data?.partner as any)?.stripePaymentMethodId;
    if (hasCard) {
      chargeForLeadsMutation.mutate({ partnerId, leadCount });
    } else {
      checkoutMutation.mutate({ partnerId, leadCount });
    }
  };

  if (isLoading || !partnerId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading dashboard...</p>
      </div>
    );
  }

  if (dashboardQuery.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading your dashboard...</p>
      </div>
    );
  }

  if (!dashboardQuery.data?.success) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600 mb-4">{dashboardQuery.data?.message}</p>
            <Button onClick={() => navigate("/partnership")} className="w-full">
              Back to Partnership Program
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { partner, activePackage, packages, deliveredLeads } = dashboardQuery.data;

  // Separate payment history: paid packages only (exclude free trial)
  const paymentHistory = (packages || []).filter(
    (pkg: any) => pkg.paymentStatus === "completed" && parseFloat(String(pkg.totalPrice || "0")) > 0
  );

  const totalSpent = paymentHistory.reduce(
    (sum: number, pkg: any) => sum + parseFloat(String(pkg.totalPrice || "0")),
    0
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-1">{partner?.businessName}</h1>
            <p className="text-gray-600">Welcome back, {partner?.partnerName}!</p>
            {/* Card-on-file indicator + Update Card button */}
            {(partner as any)?.hasCardOnFile ? (
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <div className="flex items-center gap-1.5 text-xs text-green-700 bg-green-50 border border-green-200 rounded-full px-3 py-1">
                  <span>💳</span>
                  <span>Card on file — instant checkout enabled</span>
                </div>
                <button
                  className="text-xs text-blue-600 underline hover:text-blue-800 font-medium"
                  onClick={handleUpdateCard}
                  disabled={isUpdatingCard}
                >
                  {isUpdatingCard ? "Loading..." : "Update Card"}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 mt-1">
                <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-3 py-1">
                  ⚠️ No card saved —{" "}
                  <button
                    className="underline font-medium"
                    onClick={() => navigate(`/partner/activate-trial?partnerId=${partnerId}`)}
                  >
                    Save card to activate trial
                  </button>
                </div>
              </div>
            )}
          </div>
          {/* Purchase More Leads button — always visible in header */}
          <Dialog open={purchaseDialogOpen} onOpenChange={setPurchaseDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 text-base font-semibold shadow">
                + Purchase More Leads
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle className="text-2xl">Choose a Lead Package</DialogTitle>
                <DialogDescription>
                  Select the package that fits your needs. All packages include 5 bonus leads at no extra cost.
                </DialogDescription>
              </DialogHeader>
              <div className="grid md:grid-cols-3 gap-4 mt-2">
                {packagesQuery.data?.packages.map((pkg: any) => (
                  <Card
                    key={pkg.leadCount}
                    className="border-2 hover:border-blue-500 transition-colors cursor-pointer"
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{pkg.leadCount} Leads</CardTitle>
                      <CardDescription>
                        {pkg.leadCount + pkg.bonusLeads} total (incl. {pkg.bonusLeads} bonus)
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-4">
                        <div className="text-3xl font-bold text-blue-600">
                          ${pkg.totalPrice.toLocaleString()}
                        </div>
                        <p className="text-sm text-gray-500">${pkg.pricePerLead}/lead</p>
                      </div>
                      <Button
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        disabled={isPurchasing}
                        onClick={() => handlePurchase(pkg.leadCount)}
                      >
                        {isPurchasing ? "Processing..." : "Select Package"}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Trial Leads Remaining</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{partner?.trialLeadsRemaining || 0}</div>
              <p className="text-xs text-gray-500 mt-1">Free trial leads</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Active Package</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{activePackage?.leadsRemaining || 0}</div>
              <p className="text-xs text-gray-500 mt-1">Leads remaining</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Leads Received</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{deliveredLeads?.length || 0}</div>
              <p className="text-xs text-gray-500 mt-1">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Spent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                ${totalSpent.toFixed(2)}
              </div>
              <p className="text-xs text-gray-500 mt-1">{paymentHistory.length} purchase{paymentHistory.length !== 1 ? "s" : ""}</p>
            </CardContent>
          </Card>
        </div>

        {/* Low-Leads Warning Banner — shown when total leads remaining < 5 */}
        {(() => {
          const totalLeadsLeft = (activePackage?.leadsRemaining || 0) + (partner?.trialLeadsRemaining || 0);
          const hasCard = !!(partner as any)?.hasCardOnFile;
          if (totalLeadsLeft < 5) {
            return (
              <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-red-50 border border-red-300 rounded-xl px-5 py-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl mt-0.5">🚨</span>
                  <div>
                    <p className="font-semibold text-red-800 text-sm">
                      Only {totalLeadsLeft} lead{totalLeadsLeft !== 1 ? "s" : ""} remaining!
                    </p>
                    <p className="text-red-600 text-xs mt-0.5">
                      {hasCard
                        ? "Recharge now to keep receiving tenant leads without interruption."
                        : "Save a payment card to instantly recharge your leads."}
                    </p>
                  </div>
                </div>
                {hasCard ? (
                  <Button
                    className="bg-red-600 hover:bg-red-700 text-white text-sm font-semibold whitespace-nowrap shrink-0"
                    disabled={isRechargingNow}
                    onClick={handleRechargeNow}
                  >
                    {isRechargingNow ? "Charging..." : "⚡ Recharge Now — 10 Leads ($50)"}
                  </Button>
                ) : (
                  <Button
                    className="bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold whitespace-nowrap shrink-0"
                    onClick={() => navigate(`/partner/activate-trial?partnerId=${partnerId}`)}
                  >
                    Save Card to Recharge
                  </Button>
                )}
              </div>
            );
          }
          return null;
        })()}

        {/* Active Package Section */}
        {activePackage ? (
          <Card className="mb-8">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Active Lead Package</CardTitle>
                <CardDescription>{activePackage.packageName}</CardDescription>
              </div>
              <Dialog open={purchaseDialogOpen} onOpenChange={setPurchaseDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                    + Buy More Leads
                  </Button>
                </DialogTrigger>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Leads</p>
                  <p className="text-2xl font-bold">{activePackage.totalLeads}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Delivered</p>
                  <p className="text-2xl font-bold">{activePackage.leadsDelivered}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Remaining</p>
                  <p className="text-2xl font-bold text-blue-600">{activePackage.leadsRemaining}</p>
                </div>
              </div>
              <div className="mt-4 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, (activePackage.leadsDelivered / activePackage.totalLeads) * 100)}%`,
                  }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {activePackage.leadsDelivered} of {activePackage.totalLeads} leads delivered
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-8 border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle>No Active Package</CardTitle>
              <CardDescription>Your free trial is complete or expired</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                Purchase a lead package to continue receiving leads
              </p>
              <Dialog open={purchaseDialogOpen} onOpenChange={setPurchaseDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700">Purchase Lead Package</Button>
                </DialogTrigger>
              </Dialog>
            </CardContent>
          </Card>
        )}

        {/* Recent Leads */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Recent Leads</CardTitle>
            <CardDescription>
              {deliveredLeads?.length || 0} leads received
            </CardDescription>
          </CardHeader>
          <CardContent>
            {deliveredLeads && deliveredLeads.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-2">Lead #</th>
                      <th className="text-left py-2 px-2">Name</th>
                      <th className="text-left py-2 px-2">Location</th>
                      <th className="text-left py-2 px-2">Budget</th>
                      <th className="text-left py-2 px-2">Status</th>
                      <th className="text-left py-2 px-2">Received</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deliveredLeads.map((lead: any) => (
                      <tr key={lead.id} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-2 font-medium">{lead.leadNumber}</td>
                        <td className="py-2 px-2">{lead.customerName}</td>
                        <td className="py-2 px-2">
                          {lead.city}, {lead.state}
                        </td>
                        <td className="py-2 px-2">${lead.monthlyBudget}</td>
                        <td className="py-2 px-2">
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                            {lead.status}
                          </span>
                        </td>
                        <td className="py-2 px-2 text-gray-600 text-xs">
                          {new Date(lead.emailSentAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-600 text-center py-8">
                No leads received yet. Check back soon!
              </p>
            )}
          </CardContent>
        </Card>

        {/* Payment History */}
        <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
            <CardDescription>
              All lead package purchases — {paymentHistory.length} transaction{paymentHistory.length !== 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {paymentHistory.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left py-3 px-3 font-semibold text-gray-700">Package</th>
                      <th className="text-left py-3 px-3 font-semibold text-gray-700">Leads</th>
                      <th className="text-left py-3 px-3 font-semibold text-gray-700">Amount</th>
                      <th className="text-left py-3 px-3 font-semibold text-gray-700">Status</th>
                      <th className="text-left py-3 px-3 font-semibold text-gray-700">Date</th>
                      <th className="text-left py-3 px-3 font-semibold text-gray-700">Progress</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentHistory.map((pkg: any) => {
                      const paidDate = pkg.paidAt
                        ? new Date(pkg.paidAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : pkg.createdAt
                        ? new Date(pkg.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "—";
                      const progress = pkg.totalLeads > 0
                        ? Math.round((pkg.leadsDelivered / pkg.totalLeads) * 100)
                        : 0;
                      return (
                        <tr key={pkg.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-3 font-medium">{pkg.packageName}</td>
                          <td className="py-3 px-3">
                            <span className="font-semibold">{pkg.totalLeads}</span>
                            <span className="text-gray-500 text-xs ml-1">
                              ({pkg.leadCount} + {pkg.bonusLeads} bonus)
                            </span>
                          </td>
                          <td className="py-3 px-3 font-semibold text-green-700">
                            ${parseFloat(String(pkg.totalPrice || "0")).toFixed(2)}
                          </td>
                          <td className="py-3 px-3">
                            <Badge
                              variant={pkg.isExpired ? "destructive" : "default"}
                              className={
                                pkg.isExpired
                                  ? "bg-red-100 text-red-700 border-red-200"
                                  : "bg-green-100 text-green-700 border-green-200"
                              }
                            >
                              {pkg.isExpired ? "Expired" : "Active"}
                            </Badge>
                          </td>
                          <td className="py-3 px-3 text-gray-600">{paidDate}</td>
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2">
                              <div className="w-20 bg-gray-200 rounded-full h-1.5">
                                <div
                                  className="bg-blue-500 h-1.5 rounded-full"
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                              <span className="text-xs text-gray-500">
                                {pkg.leadsDelivered}/{pkg.totalLeads}
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 bg-gray-50">
                      <td className="py-3 px-3 font-bold" colSpan={2}>Total</td>
                      <td className="py-3 px-3 font-bold text-green-700">
                        ${totalSpent.toFixed(2)}
                      </td>
                      <td colSpan={3} />
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-500 mb-4">No purchases yet.</p>
                <Dialog open={purchaseDialogOpen} onOpenChange={setPurchaseDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      Purchase Your First Lead Package
                    </Button>
                  </DialogTrigger>
                </Dialog>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
