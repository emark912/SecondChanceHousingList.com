import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";

export default function PartnerVerifyEmail() {
  const [, setLocation] = useLocation();
  const [searchParams] = useLocation();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Get email from URL params - use window.location.search since wouter only provides pathname
  const email = new URLSearchParams(window.location.search).get("email") || "";

  const verifyMutation = trpc.partnership.verifyEmail.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!email) {
        throw new Error("Email not found");
      }

      const result = await verifyMutation.mutateAsync({
        email,
        code: code,
      });

      if (result.success) {
        setSuccess(true);
        // Store partner ID and redirect to trial activation (card-save) page
        if (result.partnerId !== undefined) {
          // Save with both keys for compatibility across all dashboard components
          localStorage.setItem("partner_id", result.partnerId.toString());
          localStorage.setItem("partnerId", result.partnerId.toString());
          setTimeout(() => {
            setLocation(`/partner/activate-trial?partnerId=${result.partnerId}`);
          }, 1500);
        } else {
          setTimeout(() => {
            setLocation("/partner/login");
          }, 1500);
        }
      }
    } catch (err: any) {
      setError(err.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4 flex items-center justify-center">
      <div className="max-w-md w-full">
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-t-lg">
            <CardTitle className="text-2xl">Verify Your Email</CardTitle>
            <CardDescription className="text-green-100">
              Enter the code sent to your email
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            {success ? (
              <div className="text-center py-6">
                <div className="text-4xl mb-4">✓</div>
                <h3 className="text-lg font-semibold text-green-600 mb-2">
                  Email Verified!
                </h3>
                <p className="text-gray-600 mb-4">
                  Your email is verified! Redirecting to activate your 20 free leads...
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                    {error}
                  </div>
                )}

                <div>
                  <p className="text-sm text-gray-600 mb-4">
                    We sent a 6-digit code to <strong>{email}</strong>
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Verification Code
                  </label>
                  <Input
                    type="text"
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value.toUpperCase());
                      setError("");
                    }}
                    placeholder="000000"
                    maxLength={6}
                    required
                    disabled={loading}
                    className="text-center text-2xl tracking-widest"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled={loading || code.length !== 6}
                >
                  {loading ? "Verifying..." : "Verify Email"}
                </Button>

                <p className="text-center text-sm text-gray-600">
                  Didn't receive the code?{" "}
                  <button
                    type="button"
                    onClick={() => setLocation("/partner/signup")}
                    className="text-blue-600 hover:underline"
                  >
                    Sign up again
                  </button>
                </p>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
