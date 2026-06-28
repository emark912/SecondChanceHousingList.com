import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckCircle, Package, LayoutDashboard, BarChart3, LogOut,
  CreditCard, ExternalLink, ShoppingCart, Loader2
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { usePartner } from "@/contexts/PartnerContext";
import { toast } from "sonner";

const PACKAGES = [
  { id: "starter", name: "Starter", leads: 10, bonus: 2, total: 12, price: 50, perLead: 4.17, popular: false },
  { id: "growth", name: "Growth", leads: 25, bonus: 5, total: 30, price: 100, perLead: 3.33, popular: false },
  { id: "professional", name: "Professional", leads: 75, bonus: 15, total: 90, price: 250, perLead: 2.78, popular: true },
  { id: "business", name: "Business", leads: 175, bonus: 25, total: 200, price: 500, perLead: 2.50, popular: false },
  { id: "enterprise", name: "Enterprise", leads: 400, bonus: 50, total: 450, price: 1000, perLead: 2.22, popular: false },
  { id: "premium", name: "Premium", leads: 1800, bonus: 200, total: 2000, price: 4000, perLead: 2.00, popular: false },
];

export default function PartnerLeadPackages() {
  const [, navigate] = useLocation();
  const { partner, isLoading: partnerLoading, refetch } = usePartner();
  const [checkingOut, setCheckingOut] = useState<string | null>(null);

  const { data: myPackages, isLoading: packagesLoading } = trpc.stripeCheckout.myPackages.useQuery(undefined, {
    enabled: !!partner,
  });

  const createCheckout = trpc.stripeCheckout.createCheckout.useMutation({
    onSuccess: ({ checkoutUrl }) => {
      if (checkoutUrl) {
        toast.info("Redirecting to secure checkout...");
        window.open(checkoutUrl, "_blank");
      }
      setCheckingOut(null);
    },
    onError: (err) => {
      toast.error(err.message);
      setCheckingOut(null);
    },
  });

  const customerPortal = trpc.stripeCheckout.customerPortal.useMutation({
    onSuccess: ({ portalUrl }) => {
      window.open(portalUrl, "_blank");
    },
    onError: (err) => toast.error(err.message),
  });

  const logout = trpc.partnerAuth.logout.useMutation({
    onSuccess: () => { refetch(); navigate("/partnership/login"); },
  });

  if (partnerLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Skeleton className="h-8 w-48" />
      </div>
    );
  }

  if (!partner) {
    navigate("/partnership/login");
    return null;
  }

  const handlePurchase = (packageId: string) => {
    setCheckingOut(packageId);
    createCheckout.mutate({ packageId, origin: window.location.origin });
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar text-sidebar-foreground flex-col shrink-0 hidden md:flex">
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-sidebar-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">SC</span>
            </div>
            <div>
              <div className="font-bold text-sm text-sidebar-foreground">Second Chance</div>
              <div className="text-xs text-sidebar-foreground/60">Partner Program</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          <Link href="/partnership/dashboard">
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground cursor-pointer">
              <LayoutDashboard className="h-4 w-4" /> Dashboard
            </div>
          </Link>
          <Link href="/partnership/analytics">
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground cursor-pointer">
              <BarChart3 className="h-4 w-4" /> Analytics
            </div>
          </Link>
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium bg-sidebar-accent text-sidebar-accent-foreground cursor-pointer">
            <Package className="h-4 w-4" /> Lead Packages
          </div>
        </nav>
        <div className="p-3 border-t border-sidebar-border">
          <div className="px-4 py-2 text-sm text-sidebar-foreground/70">
            <div className="font-medium text-sidebar-foreground">{partner.partnerName}</div>
            <div className="text-xs truncate">{partner.email}</div>
          </div>
          <button
            onClick={() => logout.mutate()}
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground w-full transition-colors"
          >
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="bg-white border-b px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h1 className="text-xl font-bold text-primary">Lead Packages</h1>
            <p className="text-sm text-muted-foreground">Purchase leads to unlock full contact information</p>
          </div>
          {myPackages && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => customerPortal.mutate({ origin: window.location.origin })}
              disabled={customerPortal.isPending}
            >
              <CreditCard className="h-4 w-4 mr-1" />
              {customerPortal.isPending ? "Loading..." : "Billing Portal"}
              <ExternalLink className="h-3 w-3 ml-1" />
            </Button>
          )}
        </div>

        <div className="p-6 space-y-8">
          {/* Trial Leads Status */}
          {partner.trialLeadsRemaining > 0 && (
            <Alert className="border-blue-200 bg-blue-50">
              <CheckCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                You have <strong>{partner.trialLeadsRemaining} free trial leads</strong> remaining. Trial leads show renter profiles but contact info is blocked. Purchase a package to unlock full contact details.
              </AlertDescription>
            </Alert>
          )}

          {/* Active Packages */}
          {!packagesLoading && myPackages && (
            <div>
              <h2 className="text-lg font-semibold text-primary mb-4">Your Active Packages</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {[myPackages].map((pkg: any) => (
                  <Card key={pkg.id} className="border-green-200 bg-green-50/30">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="font-semibold text-primary">{pkg.packageName}</div>
                          <div className="text-sm text-muted-foreground">
                            {pkg.leadsRemaining} of {pkg.leadsIncluded} leads remaining
                          </div>
                        </div>
                        <Badge className="bg-green-100 text-green-700 border-green-200">Active</Badge>
                      </div>
                      <div className="bg-white rounded-full h-2 overflow-hidden mb-2">
                        <div
                          className="h-full bg-green-500 rounded-full"
                          style={{ width: `${(pkg.leadsRemaining / pkg.leadsIncluded) * 100}%` }}
                        />
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Expires: {new Date(pkg.expiresAt).toLocaleDateString()}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Package Selection */}
          <div>
            <h2 className="text-lg font-semibold text-primary mb-2">Purchase Lead Package</h2>
            <p className="text-sm text-muted-foreground mb-6">
              All packages include bonus leads and a 90-day expiration. Test with card <code className="bg-muted px-1 rounded">4242 4242 4242 4242</code>.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {PACKAGES.map((pkg) => (
                <Card
                  key={pkg.id}
                  className={`relative ${pkg.popular ? "border-accent shadow-lg ring-2 ring-accent/20" : "border-border"}`}
                >
                  {pkg.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-accent text-white">Most Popular</Badge>
                    </div>
                  )}
                  <CardContent className="p-5">
                    <div className="mb-4">
                      <h3 className="font-bold text-primary">{pkg.name}</h3>
                      <div className="text-3xl font-bold text-primary mt-1">${pkg.price}</div>
                      <div className="text-xs text-muted-foreground">${pkg.perLead.toFixed(2)}/lead</div>
                    </div>
                    <div className="space-y-1.5 mb-5 text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-3.5 w-3.5 text-green-500 shrink-0" />
                        <span>{pkg.leads} leads + {pkg.bonus} bonus</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-3.5 w-3.5 text-green-500 shrink-0" />
                        <span className="font-medium">{pkg.total} total leads</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-3.5 w-3.5 text-green-500 shrink-0" />
                        <span>Full contact info</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-3.5 w-3.5 text-green-500 shrink-0" />
                        <span>90-day expiration</span>
                      </div>
                    </div>
                    <Button
                      className={`w-full ${pkg.popular ? "bg-accent hover:bg-accent/90 text-white" : ""}`}
                      variant={pkg.popular ? "default" : "outline"}
                      onClick={() => handlePurchase(pkg.id)}
                      disabled={checkingOut === pkg.id}
                    >
                      {checkingOut === pkg.id ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Redirecting...</>
                      ) : (
                        <><ShoppingCart className="mr-2 h-4 w-4" /> Purchase</>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
