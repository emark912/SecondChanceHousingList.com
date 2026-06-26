/**
 * Partner Trial Activation Page
 * Partners must save a debit/credit card to activate their 20 free leads trial.
 * Uses Stripe SetupIntent (no charge today — card is saved for future purchases).
 */

import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Loader2, ShieldCheck, Gift, CreditCard } from "lucide-react";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// ─── Inner form (must be inside <Elements>) ──────────────────────────────────
function CardSaveForm({
  partnerId,
  clientSecret,
  onSuccess,
}: {
  partnerId: number;
  clientSecret: string;
  onSuccess: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activateTrialMutation = trpc.partnership.activateTrial.useMutation({
    onSuccess: (data) => {
      setIsSubmitting(false);
      if (data.success) {
        toast.success("Trial activated! You now have 20 free leads.");
        onSuccess();
      } else {
        toast.error(data.message || "Failed to activate trial");
      }
    },
    onError: () => {
      setIsSubmitting(false);
      toast.error("Failed to activate trial. Please try again.");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsSubmitting(true);

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setIsSubmitting(false);
      return;
    }

    // Confirm the SetupIntent with the card
    const { error, setupIntent } = await stripe.confirmCardSetup(clientSecret, {
      payment_method: { card: cardElement },
    });

    if (error) {
      toast.error(error.message || "Card setup failed");
      setIsSubmitting(false);
      return;
    }

    if (setupIntent?.status === "succeeded" && setupIntent.payment_method) {
      // Activate the trial on the server
      activateTrialMutation.mutate({
        partnerId,
        paymentMethodId: setupIntent.payment_method as string,
        setupIntentId: setupIntent.id,
      });
    } else {
      toast.error("Card setup did not complete. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="border rounded-lg p-4 bg-white">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: "16px",
                color: "#1f2937",
                fontFamily: "system-ui, -apple-system, sans-serif",
                "::placeholder": { color: "#9ca3af" },
              },
              invalid: { color: "#dc2626" },
            },
            hidePostalCode: false,
          }}
        />
      </div>

      <div className="flex items-start gap-2 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
        <ShieldCheck className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
        <span>
          <strong>No charge today.</strong> Your card is saved securely for future lead package
          purchases. You will only be charged when you choose to buy more leads.
        </span>
      </div>

      <Button
        type="submit"
        disabled={isSubmitting || !stripe}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 text-base font-semibold"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Activating Trial...
          </>
        ) : (
          <>
            <Gift className="w-4 h-4 mr-2" />
            Save Card & Activate 20 Free Leads
          </>
        )}
      </Button>
    </form>
  );
}

// ─── Page wrapper ─────────────────────────────────────────────────────────────
export default function PartnerActivateTrial() {
  const [, navigate] = useLocation();
  const [partnerId, setPartnerId] = useState<number | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoadingIntent, setIsLoadingIntent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setupIntentMutation = trpc.partnership.createSetupIntent.useMutation({
    onSuccess: (data) => {
      setIsLoadingIntent(false);
      if (data.success && data.clientSecret) {
        setClientSecret(data.clientSecret);
      } else {
        setError(data.message || "Failed to initialize card setup");
      }
    },
    onError: () => {
      setIsLoadingIntent(false);
      setError("Failed to initialize card setup. Please try again.");
    },
  });

  useEffect(() => {
    const id = parseInt(
      new URLSearchParams(window.location.search).get("partnerId") ||
        localStorage.getItem("partnerId") ||
        "0"
    );
    if (id) {
      setPartnerId(id);
      setIsLoadingIntent(true);
      setupIntentMutation.mutate({ partnerId: id });
    } else {
      setError("Partner account not found. Please log in again.");
    }
  }, []);

  const handleSuccess = () => {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get("mode") || "activate"; // "update" = replacing card, "activate" = first card
    setTimeout(() => {
      navigate(`/partner/card-updated?partnerId=${partnerId}&mode=${mode}`);
    }, 1200);
  };

  // Detect if this is a card update vs initial activation
  const isUpdateMode = new URLSearchParams(window.location.search).get("mode") === "update";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <Gift className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isUpdateMode ? "Update Payment Card" : "Activate Your Free Trial"}
          </h1>
          <p className="text-gray-600">
            {isUpdateMode
              ? "Replace your saved card. Your new card will be used for all future lead purchases."
              : <>Save a payment method to unlock your <strong>20 free leads</strong>. No charge today.</>}
          </p>
        </div>

        {/* What you get */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { icon: "🎯", title: "20 Free Leads", desc: "Instant access" },
            { icon: "💳", title: "No Charge Today", desc: "Card saved for later" },
            { icon: "⚡", title: "Leads via Email", desc: "Delivered instantly" },
          ].map((item) => (
            <div key={item.title} className="bg-white rounded-lg p-3 text-center shadow-sm border">
              <div className="text-2xl mb-1">{item.icon}</div>
              <div className="text-xs font-semibold text-gray-800">{item.title}</div>
              <div className="text-xs text-gray-500">{item.desc}</div>
            </div>
          ))}
        </div>

        {/* Card form */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-600" />
              Add Payment Method
            </CardTitle>
            <CardDescription>
              {isUpdateMode
                ? "Your new card will replace the existing one on file. No charge today."
                : "Required to activate your trial. Your card will be charged only when you purchase additional lead packages."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="text-center py-6">
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={() => navigate("/partner/login")} variant="outline">
                  Back to Login
                </Button>
              </div>
            ) : isLoadingIntent || !clientSecret ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600 mr-2" />
                <span className="text-gray-600">Setting up secure card form...</span>
              </div>
            ) : (
              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret,
                  appearance: {
                    theme: "stripe",
                    variables: {
                      colorPrimary: "#2563eb",
                      colorBackground: "#ffffff",
                      colorText: "#1f2937",
                      borderRadius: "8px",
                    } as any,
                  },
                }}
              >
                <CardSaveForm
                  partnerId={partnerId!}
                  clientSecret={clientSecret}
                  onSuccess={handleSuccess}
                />
              </Elements>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-xs text-gray-500 mt-4">
          Secured by Stripe. We never store your full card number.
        </p>
      </div>
    </div>
  );
}
