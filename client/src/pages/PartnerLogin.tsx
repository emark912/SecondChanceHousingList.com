import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { ChevronDown, ChevronUp, Mail } from "lucide-react";

export default function PartnerLogin() {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Resend verification email state
  const [showResend, setShowResend] = useState(false);
  const [resendEmail, setResendEmail] = useState("");
  const [resendLoading, setResendLoading] = useState(false);

  const loginMutation = trpc.partnerAuth.login.useMutation();
  const resendMutation = trpc.partnership.resendVerificationEmail.useMutation();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await loginMutation.mutateAsync(formData);
      if (result.success) {
        localStorage.setItem("partner_id", String(result.partnerId));
        localStorage.setItem("partner_email", formData.email);
        window.location.href = `/partner/dashboard?partnerId=${result.partnerId}`;
      } else {
        setError((result as any).message || "Invalid email or password");
      }
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendEmail) return;
    setResendLoading(true);
    try {
      const result = await resendMutation.mutateAsync({ email: resendEmail });
      if (result.success) {
        toast.success(result.message);
        setResendEmail("");
        setShowResend(false);
      } else {
        toast.error(result.message);
      }
    } catch (err: any) {
        toast.error("Failed to resend verification email. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4 flex items-center justify-center">
      <div className="max-w-md w-full space-y-4">
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
            <CardTitle className="text-2xl">Partner Login</CardTitle>
            <CardDescription className="text-blue-100">
              Access your lead packages and account
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <Input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                  disabled={loading}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </Button>

              <div className="flex items-center justify-between text-sm">
                <button
                  type="button"
                  onClick={() => setLocation("/partner/forgot-password")}
                  className="text-blue-600 hover:underline"
                >
                  Forgot password?
                </button>
                <button
                  type="button"
                  onClick={() => setLocation("/partner/signup")}
                  className="text-blue-600 hover:underline"
                >
                  Create account
                </button>
              </div>
            </form>

            {/* Resend Verification Email Section */}
            <div className="mt-4 border border-amber-200 rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => setShowResend(!showResend)}
                className="w-full flex items-center justify-between px-4 py-3 bg-amber-50 hover:bg-amber-100 transition-colors text-sm font-medium text-amber-800"
              >
                <span className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Didn't receive your verification email?
                </span>
                {showResend ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showResend && (
                <div className="px-4 py-4 bg-white border-t border-amber-200">
                  <p className="text-sm text-gray-600 mb-3">
                    Enter your registered email address and we'll send a fresh verification link.
                  </p>
                  <form onSubmit={handleResend} className="flex gap-2">
                    <Input
                      type="email"
                      value={resendEmail}
                      onChange={(e) => setResendEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      disabled={resendLoading}
                      className="flex-1"
                    />
                    <Button
                      type="submit"
                      disabled={resendLoading || !resendEmail}
                      className="bg-amber-600 hover:bg-amber-700 text-white whitespace-nowrap"
                    >
                      {resendLoading ? "Sending..." : "Resend"}
                    </Button>
                  </form>
                </div>
              )}
            </div>

            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-700 font-medium mb-2">
                Don't have an account yet?
              </p>
              <p className="text-sm text-gray-600 mb-3">
                Sign up to get 20 free trial leads and start receiving hot leads instantly.
              </p>
              <Button
                onClick={() => setLocation("/partner/signup")}
                variant="outline"
                className="w-full"
              >
                Sign Up Now
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
