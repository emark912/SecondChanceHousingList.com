import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Mail, MapPin, DollarSign, Home, Users, Eye, EyeOff, Check, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Lead {
  id: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  city: string;
  state: string;
  monthlyIncome: number;
  creditChallenges: string[];
  housingType: string;
  bedrooms: number;
  criminalHistory?: string;
  leadNumber: number;
  totalLeads: number;
  purchasedAt: Date;
}

interface LeadPackage {
  id: number;
  packageName: string;
  totalLeads: number;
  leadsDelivered: number;
  leadsRemaining: number;
  totalPrice: string;
  paymentStatus: string;
  paidAt: Date | null;
  expiresAt: Date | null;
  isExpired: boolean;
}

export function PartnerDashboardEnhanced() {
  const { data: authData } = trpc.auth.me.useQuery();
  const [partnerId, setPartnerId] = useState<number | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [packages, setPackages] = useState<LeadPackage[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showLeadDetails, setShowLeadDetails] = useState(false);
  const [showContactInfo, setShowContactInfo] = useState(false);

  // Get partner ID from URL or user data
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paramPartnerId = params.get("partnerId");
    if (paramPartnerId) {
      setPartnerId(parseInt(paramPartnerId));
    }
  }, []);

  // Fetch partner leads
  const { data: leadsData, isLoading: leadsLoading } = trpc.partnership.getPartnerLeads.useQuery(
    { partnerId: partnerId || 0, includeContactInfo: true },
    { enabled: !!partnerId }
  );

  // Fetch purchase history
  const { data: historyData, isLoading: historyLoading } = trpc.partnership.getPurchaseHistory.useQuery(
    { partnerId: partnerId || 0 },
    { enabled: !!partnerId }
  );

  // Get lead contact info
  const { data: contactInfoData } = trpc.partnership.getLeadContactInfo.useQuery(
    { leadId: selectedLead?.id || 0, partnerId: partnerId || 0 },
    { enabled: !!selectedLead && showLeadDetails }
  );

  // Mark lead as contacted
  const markContacted = trpc.partnership.markLeadContacted.useMutation();

  // Mark lead as purchased
  const markPurchased = trpc.partnership.markLeadPurchased.useMutation();

  useEffect(() => {
    if (leadsData?.success && leadsData.leads) {
      setLeads(leadsData.leads);
    }
  }, [leadsData]);

  useEffect(() => {
    if (historyData?.success && historyData.history) {
      setPackages(historyData.history);
    }
  }, [historyData]);

  const handleViewLeadDetails = (lead: Lead) => {
    setSelectedLead(lead);
    setShowLeadDetails(true);
  };

  const handleMarkContacted = async (leadId: number) => {
    if (!partnerId) return;
    await markContacted.mutateAsync({ leadId, partnerId });
  };

  const handleMarkPurchased = async (leadId: number) => {
    if (!partnerId) return;
    await markPurchased.mutateAsync({ leadId, partnerId });
  };

  const getLeadStatus = (leadNumber: number, totalLeads: number) => {
    if (leadNumber <= totalLeads) {
      return "active";
    }
    return "expired";
  };

  const formatDate = (date: any) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString();
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "sent":
        return "bg-blue-100 text-blue-800";
      case "opened":
        return "bg-purple-100 text-purple-800";
      case "clicked":
        return "bg-orange-100 text-orange-800";
      case "purchased":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (leadsLoading || historyLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Partner Dashboard</h1>
        <p className="text-gray-600">Manage your leads and track your conversions</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{leads.length}</div>
            <p className="text-xs text-gray-500 mt-1">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Packages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {packages.filter((p) => !p.isExpired).length}
            </div>
            <p className="text-xs text-gray-500 mt-1">Valid packages</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Leads Remaining</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {packages.reduce((sum, p) => sum + (p.leadsRemaining || 0), 0)}
            </div>
            <p className="text-xs text-gray-500 mt-1">Across all packages</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Spent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              ${packages.reduce((sum, p) => sum + parseFloat(p.totalPrice || "0"), 0).toFixed(2)}
            </div>
            <p className="text-xs text-gray-500 mt-1">All purchases</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="leads" className="space-y-4">
        <TabsList className="bg-white border border-gray-200">
          <TabsTrigger value="leads">My Leads ({leads.length})</TabsTrigger>
          <TabsTrigger value="packages">Packages ({packages.length})</TabsTrigger>
        </TabsList>

        {/* Leads Tab */}
        <TabsContent value="leads" className="space-y-4">
          {leads.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Leads Yet</h3>
                  <p className="text-gray-600">
                    You'll receive leads here once you purchase a package or your trial period begins.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {leads.map((lead) => (
                <Card key={lead.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                      {/* Lead Info */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-900">{lead.customerName}</span>
                          <Badge variant="outline" className="text-xs">
                            Lead {lead.leadNumber} of {lead.totalLeads}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="h-4 w-4" />
                          {lead.city}, {lead.state}
                        </div>
                      </div>

                      {/* Housing Details */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Home className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-700">{lead.housingType}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-700">{lead.bedrooms} bed</span>
                        </div>
                      </div>

                      {/* Income */}
                      <div className="space-y-2">
                        <div className="text-sm text-gray-600">Monthly Income</div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <span className="font-semibold text-gray-900">
                            {lead.monthlyIncome ? `$${lead.monthlyIncome.toLocaleString()}` : "N/A"}
                          </span>
                        </div>
                      </div>

                      {/* Contact Info Preview */}
                      <div className="space-y-2">
                        <div className="text-sm text-gray-600">Contact</div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 text-sm font-mono text-gray-700 bg-gray-100 px-2 py-1 rounded">
                            {showContactInfo ? (
                              <>
                                <span>{lead.customerEmail}</span>
                                <EyeOff className="h-4 w-4 cursor-pointer" onClick={() => setShowContactInfo(false)} />
                              </>
                            ) : (
                              <>
                                <span>***@***.***</span>
                                <Eye className="h-4 w-4 cursor-pointer" onClick={() => setShowContactInfo(true)} />
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewLeadDetails(lead)}
                          className="gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Packages Tab */}
        <TabsContent value="packages" className="space-y-4">
          {packages.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Packages</h3>
                  <p className="text-gray-600 mb-4">
                    You don't have any lead packages yet. Purchase one to start receiving leads!
                  </p>
                  <Button onClick={() => window.location.href = "/partnership/dashboard?action=purchase"}>
                    Purchase Package
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {packages.map((pkg) => (
                <Card key={pkg.id} className={pkg.isExpired ? "opacity-60" : ""}>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                      {/* Package Info */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">{pkg.packageName}</h3>
                          {pkg.isExpired ? (
                            <Badge variant="destructive">Expired</Badge>
                          ) : (
                            <Badge variant="default">Active</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">Purchased {formatDate(pkg.paidAt)}</p>
                      </div>

                      {/* Leads Stats */}
                      <div className="space-y-2">
                        <div className="text-sm text-gray-600">Leads Included</div>
                        <div className="text-2xl font-bold text-gray-900">{pkg.totalLeads}</div>
                      </div>

                      {/* Delivered */}
                      <div className="space-y-2">
                        <div className="text-sm text-gray-600">Delivered</div>
                        <div className="text-2xl font-bold text-blue-600">{pkg.leadsDelivered}</div>
                      </div>

                      {/* Remaining */}
                      <div className="space-y-2">
                        <div className="text-sm text-gray-600">Remaining</div>
                        <div className="text-2xl font-bold text-green-600">{pkg.leadsRemaining}</div>
                      </div>

                      {/* Price */}
                      <div className="space-y-2">
                        <div className="text-sm text-gray-600">Price</div>
                        <div className="text-2xl font-bold text-gray-900">${parseFloat(pkg.totalPrice).toFixed(2)}</div>
                      </div>

                      {/* Expiration */}
                      <div className="space-y-2">
                        <div className="text-sm text-gray-600">Expires</div>
                        <div className={`font-semibold ${pkg.isExpired ? "text-red-600" : "text-gray-900"}`}>
                          {formatDate(pkg.expiresAt)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Lead Details Modal */}
      <Dialog open={showLeadDetails} onOpenChange={setShowLeadDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Lead Details</DialogTitle>
            <DialogDescription>
              Full information for {selectedLead?.customerName}
            </DialogDescription>
          </DialogHeader>

          {selectedLead && (
            <div className="space-y-6">
              {/* Contact Information */}
              <div className="bg-blue-50 p-4 rounded-lg space-y-3">
                <h3 className="font-semibold text-gray-900">Contact Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-mono text-gray-900">{selectedLead.customerEmail}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-mono text-gray-900">{selectedLead.customerPhone}</p>
                  </div>
                </div>
              </div>

              {/* Housing Preferences */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">Housing Preferences</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Housing Type</p>
                    <p className="text-gray-900">{selectedLead.housingType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Bedrooms</p>
                    <p className="text-gray-900">{selectedLead.bedrooms}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Location</p>
                    <p className="text-gray-900">
                      {selectedLead.city}, {selectedLead.state}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Monthly Income</p>
                    <p className="text-gray-900">
                      ${selectedLead.monthlyIncome ? selectedLead.monthlyIncome.toLocaleString() : "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Credit Challenges */}
              {selectedLead.creditChallenges && selectedLead.creditChallenges.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900">Credit Challenges</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedLead.creditChallenges.map((challenge, idx) => (
                      <Badge key={idx} variant="secondary">
                        {challenge}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Criminal History */}
              {selectedLead.criminalHistory && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900">Criminal History</h3>
                  <p className="text-gray-900">{selectedLead.criminalHistory}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => handleMarkContacted(selectedLead.id)}
                  variant="outline"
                  className="gap-2"
                  disabled={markContacted.isPending}
                >
                  <Check className="h-4 w-4" />
                  Mark as Contacted
                </Button>
                <Button
                  onClick={() => handleMarkPurchased(selectedLead.id)}
                  className="gap-2"
                  disabled={markPurchased.isPending}
                >
                  <Check className="h-4 w-4" />
                  Mark as Converted
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
