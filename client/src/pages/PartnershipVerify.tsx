/**
 * Partnership Email Verification Page
 */

import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function PartnershipVerify() {
  const [location, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const verifyMutation = trpc.partnership.verifyEmail.useMutation();

  useEffect(() => {
    // Get email from URL params - use window.location.search since wouter only provides pathname
    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get("email");
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await verifyMutation.mutateAsync({
        code,
        email,
      });

      if (result.success) {
        toast.success(result.message);
        setTimeout(() => {
          navigate(`/partnership/dashboard?partnerId=${result.partnerId}`);
        }, 2000);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("An error occurred during verification");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Verify Your Email</CardTitle>
          <CardDescription>
            Enter the verification code sent to {email}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled
                className="bg-gray-100"
              />
            </div>

            <div>
              <Label htmlFor="code">Verification Code</Label>
              <Input
                id="code"
                type="text"
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                maxLength={6}
                disabled={isSubmitting}
                className="text-center text-2xl tracking-widest"
              />
              <p className="text-xs text-gray-600 mt-2">
                Check your email for the 6-digit code
              </p>
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={isSubmitting || code.length !== 6}
            >
              {isSubmitting ? "Verifying..." : "Verify Email"}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => navigate("/partnership")}
              disabled={isSubmitting}
            >
              Back to Signup
            </Button>
          </form>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>What happens next?</strong>
            </p>
            <ul className="text-sm text-gray-600 mt-2 space-y-1">
              <li>✓ Your account will be activated</li>
              <li>✓ Your free 20-lead trial begins</li>
              <li>✓ You'll access your partner dashboard</li>
              <li>✓ Leads will be delivered via email</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
