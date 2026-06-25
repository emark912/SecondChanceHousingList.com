import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MapPin, DollarSign, Bed, Bath, Home, Lock, Check } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function PropertyDetail() {
  const [, navigate] = useLocation();
  const [, params] = useRoute("/property/:id");
  const propertyId = params?.id;

  const [property, setProperty] = useState<any>(null);
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [donationAmount, setDonationAmount] = useState(50);
  const [hasAccess, setHasAccess] = useState(false);

  // Check if user has access
  const checkAccessQuery = trpc.donations.hasAccess.useQuery(
    { userEmail },
    { enabled: !!userEmail, refetchInterval: 2000 }
  );

  // Get property details
  const propertyQuery = trpc.search.getById.useQuery(
    { id: propertyId || "" },
    { enabled: !!propertyId }
  );

  // Get landlord info (only if has access)
  const landlordQuery = trpc.donations.getLandlordInfo.useQuery(
    { propertyId: propertyId || "", userEmail },
    { enabled: !!propertyId && hasAccess && !!userEmail }
  );

  // Create checkout session
  const checkoutMutation = trpc.donations.createCheckoutSession.useMutation({
    onSuccess: (data: any) => {
      if (data?.url) {
        window.open(data.url, "_blank");
        toast.success("Redirecting to secure checkout...");
      }
    },
    onError: (error) => {
      toast.error("Failed to create checkout session");
      console.error(error);
    },
  });

  useEffect(() => {
    if (propertyQuery.data) {
      setProperty(propertyQuery.data);
    }
  }, [propertyQuery.data]);

  useEffect(() => {
    if (checkAccessQuery.data) {
      setHasAccess(checkAccessQuery.data);
    }
  }, [checkAccessQuery.data]);

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading property details...</p>
      </div>
    );
  }

  const getChallengesBadges = () => {
    const badges = [];
    if (property.acceptsNoCredit) badges.push("No Credit");
    if (property.acceptsEvictions) badges.push("Evictions OK");
    if (property.acceptsCriminalHistory) badges.push("Criminal History OK");
    if (property.acceptsLowIncome) badges.push("Low Income OK");
    if (property.petFriendly) badges.push("Pets OK");
    return badges;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-blue-600">Second Chance Housing List</div>
          <Button variant="outline" onClick={() => navigate("/results")}>
            Back to Results
          </Button>
        </div>
      </nav>

      {/* Property Details */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Property Header */}
        <Card className="p-8 mb-8">
          <div className="mb-6">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {property.title}
            </h1>
            <div className="flex items-center gap-2 text-gray-600 mb-4">
              <MapPin className="w-5 h-5" />
              <span className="text-lg">{property.address}</span>
            </div>
          </div>

          {/* Price and Features */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Monthly Rent</div>
              <div className="text-3xl font-bold text-blue-600">${property.rentPrice}</div>
            </div>
            {property.bedrooms && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Bedrooms</div>
                <div className="text-3xl font-bold text-gray-900">{property.bedrooms}</div>
              </div>
            )}
            {property.bathrooms && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Bathrooms</div>
                <div className="text-3xl font-bold text-gray-900">{property.bathrooms}</div>
              </div>
            )}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Type</div>
              <div className="text-lg font-bold text-gray-900 capitalize">{property.propertyType}</div>
            </div>
          </div>

          {/* Acceptance Badges */}
          <div className="flex flex-wrap gap-2">
            {getChallengesBadges().map((badge) => (
              <Badge key={badge} variant="secondary" className="bg-green-100 text-green-800 text-sm py-1 px-3">
                <Check className="w-3 h-3 mr-1" />
                {badge}
              </Badge>
            ))}
          </div>
        </Card>

        {/* Contact Information Section */}
        <Card className={`p-8 mb-8 ${!hasAccess ? "relative overflow-hidden" : ""}`}>
          {!hasAccess && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10">
              <div className="text-center">
                <Lock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Contact Info Locked</h3>
                <p className="text-gray-600 mb-6">
                  Make a donation to unlock landlord contact information
                </p>
                <Button
                  onClick={() => setShowDonationModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Unlock with Donation
                </Button>
              </div>
            </div>
          )}

          <div className={hasAccess ? "" : "blur-sm pointer-events-none"}>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Landlord Information</h2>

            {property.landlordName && (
              <div className="mb-4">
                <label className="block text-sm text-gray-600 mb-1">Landlord Name</label>
                <p className="text-lg text-gray-900">{property.landlordName}</p>
              </div>
            )}

            {property.landlordPhone && (
              <div className="mb-4">
                <label className="block text-sm text-gray-600 mb-1">Landlord Phone</label>
                <p className="text-lg text-gray-900">{property.landlordPhone}</p>
              </div>
            )}

            {property.landlordEmail && (
              <div className="mb-4">
                <label className="block text-sm text-gray-600 mb-1">Landlord Email</label>
                <p className="text-lg text-gray-900">{property.landlordEmail}</p>
              </div>
            )}

            {property.propertyManagerName && (
              <div className="mb-4">
                <label className="block text-sm text-gray-600 mb-1">Property Manager Name</label>
                <p className="text-lg text-gray-900">{property.propertyManagerName}</p>
              </div>
            )}

            {property.propertyManagerPhone && (
              <div className="mb-4">
                <label className="block text-sm text-gray-600 mb-1">Property Manager Phone</label>
                <p className="text-lg text-gray-900">{property.propertyManagerPhone}</p>
              </div>
            )}

            {property.propertyManagerEmail && (
              <div className="mb-4">
                <label className="block text-sm text-gray-600 mb-1">Property Manager Email</label>
                <p className="text-lg text-gray-900">{property.propertyManagerEmail}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Property Description */}
        {property.description && (
          <Card className="p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Property</h2>
            <p className="text-gray-700 leading-relaxed">{property.description}</p>
          </Card>
        )}

        {/* Amenities */}
        {property.amenities && property.amenities.length > 0 && (
          <Card className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Amenities</h2>
            <div className="grid grid-cols-2 gap-3">
              {property.amenities.map((amenity: string, idx: number) => (
                <div key={idx} className="flex items-center gap-2 text-gray-700">
                  <Check className="w-5 h-5 text-green-600" />
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Donation Modal */}
      <Dialog open={showDonationModal} onOpenChange={setShowDonationModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Support Our Mission & Unlock Contact Info</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Your Name
              </label>
              <Input
                placeholder="Enter your name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Your Email
              </label>
              <Input
                placeholder="Enter your email"
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Donation Amount: ${donationAmount}
              </label>
              <input
                type="range"
                min="20"
                max="500"
                step="10"
                value={donationAmount}
                onChange={(e) => setDonationAmount(parseInt(e.target.value))}
                className="w-full"
              />
              <p className="text-sm text-gray-600 mt-2">Minimum donation: $20</p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-700">
                Your donation directly supports our mission to help renters with credit challenges find quality housing.
              </p>
            </div>

            <Button
              onClick={() => {
                if (!userName.trim() || !userEmail.trim()) {
                  toast.error("Please enter your name and email");
                  return;
                }
                checkoutMutation.mutate({
                  userEmail,
                  userName,
                  amountDollars: donationAmount,
                } as any);
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              disabled={checkoutMutation.isPending}
            >
              {checkoutMutation.isPending ? "Processing..." : `Donate $${donationAmount}`}
            </Button>

            <Button
              variant="outline"
              onClick={() => setShowDonationModal(false)}
              className="w-full"
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-400">
          <p>&copy; 2026 Second Chance Housing List. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
