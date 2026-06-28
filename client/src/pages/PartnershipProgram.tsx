/**
 * Partnership Program Landing Page
 * Allows organizations to sign up for the lead generation program
 */

import React, { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function PartnershipProgram() {
  const [, navigate] = useLocation();
  const [formData, setFormData] = useState({
    partnerName: "",
    businessName: "",
    email: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const signupMutation = trpc.partnership.signup.useMutation();
  const checkoutMutation = trpc.partnership.createCheckoutSession.useMutation();
  const [isPurchasing, setIsPurchasing] = useState(false);

  const handleChoosePackage = async (leadCount: number) => {
    // Check if partner is logged in via localStorage (saved by PartnerLogin.tsx as 'partner_id')
    const partnerIdStr = localStorage.getItem('partner_id');
    if (!partnerIdStr) {
      toast.info("Please sign in to your partner account to purchase a package");
      navigate("/partner/login");
      return;
    }
    const partnerId = Number(partnerIdStr);
    setIsPurchasing(true);
    try {
      toast.info("Redirecting to checkout...");
      const result = await checkoutMutation.mutateAsync({
        partnerId,
        leadCount,
      });
      if (result.success && result.url) {
        window.open(result.url, '_blank');
      } else {
        toast.error(result.message || "Failed to create checkout session");
      }
    } catch (error) {
      toast.error("Failed to start checkout. Please try again.");
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await signupMutation.mutateAsync(formData);
      if (result.success) {
        toast.success(result.message);
        navigate(`/partnership/verify?email=${encodeURIComponent(formData.email)}`);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("An error occurred during signup");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Second Chance Program Partnership Program
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-6">
            Access Hot Leads from Credit-Challenged Renters Seeking Housing
          </p>
          <p className="text-lg text-blue-100 mb-8">
            Grow your business by connecting with renters actively searching for second chance housing opportunities
          </p>
          <div className="flex gap-4 flex-wrap">
            <Button
              onClick={() => navigate("/partner/signup")}
              className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-8 py-6 text-lg"
            >
              Create Account
            </Button>
            <Button
              onClick={() => navigate("/partner/login")}
              variant="outline"
              className="border-white text-white hover:bg-blue-700 font-semibold px-8 py-6 text-lg"
            >
              Sign In
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Left Column - Benefits */}
          <div>
            <h2 className="text-3xl font-bold mb-8">Why Partner With Us?</h2>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">🔥 Hot Leads</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    Receive leads as soon as renters submit their profiles. Get first-mover advantage with instant notifications.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">📊 Detailed Profiles</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    Access comprehensive rental profiles including income, budget, location, housing preferences, and background information.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">💰 Affordable Pricing</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    Start with 20 FREE trial leads. Then choose from flexible packages starting at just $5 per lead.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">🎁 Bonus Leads</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    Every package includes 5 bonus leads at no extra cost to account for bad leads.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">📈 Targeted Audience</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    Reach renters with credit challenges, evictions, broken leases, and other housing barriers actively seeking solutions.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right Column - Signup Form */}
          <div>
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Get Started Today</CardTitle>
                <CardDescription>
                  Sign up for free and receive 20 leads to test our service
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="partnerName">Your Name *</Label>
                    <Input
                      id="partnerName"
                      name="partnerName"
                      type="text"
                      placeholder="John Smith"
                      value={formData.partnerName}
                      onChange={handleInputChange}
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <Label htmlFor="businessName">Business Name *</Label>
                    <Input
                      id="businessName"
                      name="businessName"
                      type="text"
                      placeholder="Your Organization Name"
                      value={formData.businessName}
                      onChange={handleInputChange}
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <Label htmlFor="password">Password *</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="At least 8 characters"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      disabled={isSubmitting}
                    />
                    <p className="text-xs text-gray-500 mt-1">Must be at least 8 characters</p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Signing up..." : "Sign Up for Free Trial"}
                  </Button>

                  <p className="text-xs text-gray-600 text-center">
                    We'll send you a verification code to confirm your email
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Pricing Section */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold mb-4 text-center">Simple, Transparent Pricing</h2>
          <p className="text-center text-gray-600 mb-12 text-lg">
            Start with 20 FREE leads, then choose the package that fits your needs
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { leads: 10, price: 50, perLead: 5 },
              { leads: 50, price: 250, perLead: 5, popular: true },
              { leads: 100, price: 500, perLead: 5 },
              { leads: 200, price: 1000, perLead: 5 },
              { leads: 400, price: 2000, perLead: 5 },
              { leads: 800, price: 4000, perLead: 5 },
            ].map((pkg) => (
              <Card key={pkg.leads} className={pkg.popular ? "border-blue-600 border-2" : ""}>
                <CardHeader>
                  {pkg.popular && (
                    <div className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full w-fit mb-2">
                      MOST POPULAR
                    </div>
                  )}
                  <CardTitle>{pkg.leads} Leads</CardTitle>
                  <CardDescription>
                    {pkg.leads + 5} total (includes 5 bonus leads)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <div className="text-3xl font-bold text-blue-600">
                      ${pkg.price}
                    </div>
                    <p className="text-gray-600">${pkg.perLead} per lead</p>
                  </div>
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={() => handleChoosePackage(pkg.leads)}
                    disabled={isPurchasing}
                  >
                    {isPurchasing ? "Processing..." : "Choose Package"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold mb-12 text-center">Frequently Asked Questions</h2>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div>
              <h3 className="font-bold text-lg mb-2">How quickly do I receive leads?</h3>
              <p className="text-gray-600">
                Leads are delivered instantly via email as soon as renters submit their profiles. You get first-mover advantage!
              </p>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-2">What information is included with each lead?</h3>
              <p className="text-gray-600">
                Full rental profile data including name, contact info, location, income, budget, housing preferences, and background information.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-2">Can I cancel anytime?</h3>
              <p className="text-gray-600">
                Yes! You can cancel your partnership at any time. No long-term contracts or hidden fees.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-2">What if I get bad leads?</h3>
              <p className="text-gray-600">
                That's why we include 5 bonus leads with every package at no extra cost to account for bad leads.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-2">How long does the free trial last?</h3>
              <p className="text-gray-600">
                Your 20 FREE leads are available for 30 days. After that, you can purchase additional packages.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-2">Do you offer bulk discounts?</h3>
              <p className="text-gray-600">
                Yes! Larger packages offer better per-lead pricing. Contact us for enterprise pricing options.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 bg-blue-600 text-white rounded-lg p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Grow Your Business?</h2>
          <p className="text-xl mb-8 text-blue-100">
            Join hundreds of organizations already using our partnership program to reach credit-challenged renters
          </p>
          <Button
            className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-8 py-6"
            onClick={() => {
              const form = document.querySelector("form");
              form?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            Start Your Free Trial
          </Button>
        </div>
      </div>
    </div>
  );
}
