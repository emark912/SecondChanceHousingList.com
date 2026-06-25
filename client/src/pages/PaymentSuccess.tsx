import { useEffect, useState } from "react";
import { useLocation, useSearch } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Download } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function PaymentSuccess() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const sessionId = new URLSearchParams(search).get("session_id");
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationResult, setVerificationResult] = useState<any>(null);

  const verifyMutation = trpc.donations.verifyDonation.useQuery(
    { sessionId: sessionId || "" },
    { enabled: !!sessionId }
  );

  useEffect(() => {
    if (verifyMutation.data) {
      setVerificationResult(verifyMutation.data);
      setIsVerifying(false);
      if (verifyMutation.data.success) {
        toast.success("Payment confirmed! Your access is now active.");
      }
    }
  }, [verifyMutation.data]);

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <p className="text-lg text-gray-600">Verifying your payment...</p>
        </Card>
      </div>
    );
  }

  if (!verificationResult?.success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <p className="text-lg text-red-600 mb-4">Payment verification failed</p>
          <Button onClick={() => navigate("/")} className="bg-blue-600 hover:bg-blue-700">
            Return Home
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-blue-600">Second Chance Housing List</div>
        </div>
      </nav>

      {/* Success Message */}
      <div className="max-w-2xl mx-auto px-4 py-16 flex items-center justify-center min-h-[calc(100vh-80px)]">
        <Card className="p-12 text-center">
          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="w-12 h-12 text-green-600" />
            </div>
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Thank You for Your Donation!
          </h1>

          <p className="text-xl text-gray-600 mb-2">
            Your donation of <span className="font-bold text-blue-600">${verificationResult.amount}</span> has been received
          </p>

          <p className="text-gray-600 mb-8">
            A confirmation email has been sent to <span className="font-semibold">{verificationResult.userEmail}</span>
          </p>

          {/* Access Confirmation */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-bold text-green-900 mb-2">✓ Your Access is Now Active</h2>
            <p className="text-green-800 mb-4">
              You now have unlimited access to landlord and property manager contact information for all properties in our database.
            </p>
            <p className="text-sm text-green-700">
              This access is permanent and never expires. You can search and contact landlords anytime.
            </p>
          </div>

          {/* What's Next */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8 text-left">
            <h3 className="font-bold text-blue-900 mb-4">What's Next?</h3>
            <ol className="space-y-3 text-blue-900">
              <li className="flex gap-3">
                <span className="font-bold">1.</span>
                <span>Return to search and browse properties in your area</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold">2.</span>
                <span>Click on any property to view landlord contact information</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold">3.</span>
                <span>Contact landlords directly to apply for your rental</span>
              </li>
            </ol>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center">
            <Button
              onClick={() => navigate("/results")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8"
            >
              View Results
            </Button>
            <Button
              onClick={() => navigate("/")}
              variant="outline"
              className="px-8"
            >
              New Search
            </Button>
          </div>

          {/* Confirmation Details */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-4">
              <Download className="w-4 h-4 inline mr-2" />
              Check your email for a receipt and confirmation details
            </p>
            <p className="text-xs text-gray-500">
              Transaction ID: {sessionId}
            </p>
          </div>
        </Card>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-400">
          <p>&copy; 2026 Second Chance Housing List. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
