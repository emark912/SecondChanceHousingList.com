import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function TestPaymentPage() {
  const [email, setEmail] = useState("test@example.com");
  const [name, setName] = useState("Test User");
  const [isLoading, setIsLoading] = useState(false);
  
  const createCheckoutMutation = trpc.payment.createCheckoutSession.useMutation();

  const handleStartPayment = async () => {
    if (!email || !name) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      const result = await createCheckoutMutation.mutateAsync({
        customerEmail: email,
        customerName: name,
        amount: 4900,
        rentalProfile: {
          location: "Atlanta, Georgia",
          searchRadius: 25,
          creditChallenges: ["no-credit"],
          housingTypes: ["apartment"],
          bedrooms: "2",
          criminalHistory: "none",
          evictions: "0",
          petPreference: "no-pets",
          smokingStatus: "non-smoker",
          moveInTimeline: "asap",
          income: "30000",
          monthlyBudget: "1500",
          monthlyIncome: "65000",
        },
      });

      if (result.checkoutUrl) {
        window.open(result.checkoutUrl, "_blank");
        toast.success("Redirecting to Stripe checkout...");
      } else {
        toast.error("Failed to create checkout session");
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Failed to start payment. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-cyan-50">
      <Navbar />
      
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Test Payment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                <strong>Test Card:</strong> 4242 4242 4242 4242<br/>
                <strong>Expiry:</strong> Any future date<br/>
                <strong>CVC:</strong> Any 3 digits
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  disabled={isLoading}
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Amount: <span className="font-bold text-lg">$49.00</span></p>
              </div>

              <Button
                onClick={handleStartPayment}
                disabled={isLoading}
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              >
                {isLoading ? "Processing..." : "Start Payment"}
              </Button>

              <p className="text-xs text-gray-500 text-center">
                You will be redirected to Stripe's secure checkout page
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}
