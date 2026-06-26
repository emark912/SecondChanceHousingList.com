"use client";

import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  CreditCard, Shield, CheckCircle2, Lock, FileText,
  Clock, ArrowRight, Tag, RefreshCw, Zap, AlertCircle, Heart
} from "lucide-react";
import MoneyBackGuarantee from "@/components/MoneyBackGuarantee";
import OrderSummaryBenefits from "@/components/OrderSummaryBenefits";
import { motion } from "framer-motion";

interface SearchData {
  location: string;
  creditChallenges: string[];
  housingTypes: string[];
  bedrooms: number;
  criminalHistory: string;
  evictions: string;
  income: string;
  monthlyBudget: string;
  monthlyIncome: string;
}

export default function Checkout() {
  const [, navigate] = useLocation();
  const [searchData, setSearchData] = useState<SearchData | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [donationAmount, setDonationAmount] = useState("25.00");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [donationError, setDonationError] = useState("");

  const CORPORATE_LEASING_DOWN_PAYMENT = 1000.00;
  const CORPORATE_LEASING_FINAL_PAYMENT = 250.00;
  const DONATION_MINIMUM = 10.00;

  useEffect(() => {
    const stored = sessionStorage.getItem("searchFormData");
    if (!stored) {
      navigate("/");
      return;
    }
    const data = JSON.parse(stored);
    setSearchData(data);
    
    // Pre-fill customer data from sessionStorage
    const customerData = sessionStorage.getItem("customerData");
    if (customerData) {
      const parsed = JSON.parse(customerData);
      if (parsed.firstName) setFirstName(parsed.firstName);
      if (parsed.lastName) setLastName(parsed.lastName);
      if (parsed.email) setEmail(parsed.email);
    }
  }, [navigate]);

  const downloadPDF = () => {
    if (pdfUrl) {
      window.open(pdfUrl, "_blank");
    } else {
      toast.error("PDF not available yet. Please try again in a moment.");
    }
  };

  const createCheckoutSession = trpc.payment.createCheckoutSession.useMutation();

  const calculateTotal = () => {
    const donation = parseFloat(donationAmount) || 0;
  };

  const handleDonationChange = (value: string) => {
    setDonationAmount(value);
    const amount = parseFloat(value) || 0;
    if (amount > 0 && amount < DONATION_MINIMUM) {
      setDonationError(`Minimum donation is $${DONATION_MINIMUM.toFixed(2)}`);
    } else {
      setDonationError("");
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    if (!email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    const donation = parseFloat(donationAmount) || 0;
      toast.error(`Minimum donation is $${DONATION_MINIMUM.toFixed(2)}`);
      return;
    }

    setIsProcessing(true);

    if (!searchData) {
      toast.error("Search data not found");
      setIsProcessing(false);
      return;
    }

    try {
      const totalAmount = calculateTotal();
      const result = await createCheckoutSession.mutateAsync({
        customerEmail: email,
        customerName: `${firstName} ${lastName}`,
        amount: Math.round(totalAmount * 100),
        orderId: 0,
        submissionId: 0,
        donationAmount: donation,
        rentalProfile: {
          location: searchData.location,
          searchRadius: 25,
          creditChallenges: searchData.creditChallenges,
          housingTypes: searchData.housingTypes,
          bedrooms: searchData.bedrooms.toString(),
          criminalHistory: searchData.criminalHistory,
          evictions: searchData.evictions,
          income: searchData.income,
          monthlyBudget: searchData.monthlyBudget,
          monthlyIncome: searchData.monthlyIncome,
          petPreference: "",
          smokingStatus: "",
          moveInTimeline: "",
        },
      });

      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
      } else {
        toast.error("Failed to create checkout session");
        setIsProcessing(false);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("Payment error:", errorMessage, error);
      toast.error(`Payment failed: ${errorMessage}`);
      setIsProcessing(false);
    }
  };

  if (!searchData) {
    return null;
  }

  const totalAmount = calculateTotal();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <div className="flex-1 px-3 py-6 md:py-12 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-20 left-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"
            animate={{
              x: [0, 30, -30, 0],
              y: [0, -30, 30, 0],
            }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
            animate={{
              x: [0, -30, 30, 0],
              y: [0, 30, -30, 0],
            }}
            transition={{ duration: 8, repeat: Infinity }}
          />
        </div>

        <div className="container max-w-5xl relative z-10 px-2">
          {paymentComplete ? (
            <motion.div
              className="text-center py-6 md:py-12"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
            >
              <motion.div
                className="inline-flex items-center justify-center w-16 h-16 md:w-24 md:h-24 rounded-full bg-green-500/20 border border-green-500/50 mb-4 md:mb-8 mx-auto"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <CheckCircle2 className="w-8 h-8 md:w-12 md:h-12 text-green-400" />
              </motion.div>

              <h1 className="text-2xl md:text-4xl font-bold text-black mb-2 md:mb-4">
                Payment Successful!
              </h1>

              <p className="text-sm md:text-lg text-black mb-1 md:mb-2">
                Your personalized PDF has been sent to <span className="text-cyan-300 font-semibold">{email}</span>
              </p>

              <p className="text-sm md:text-base text-black mb-4 md:mb-8 leading-snug">
                Check your inbox (and spam folder) for your complete housing results
              </p>

              <div className="flex flex-col sm:flex-row gap-2 md:gap-4 justify-center mb-4 md:mb-8">
                <Button
                  onClick={() => downloadPDF()}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white text-sm md:text-lg px-4 md:px-8 py-3 md:py-6 h-auto"
                >
                  <FileText className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />
                  Download Your Results PDF
                </Button>
                <Button
                  onClick={() => navigate("/")}
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-black text-sm md:text-lg px-4 md:px-8 py-3 md:py-6 h-auto"
                >
                  Return to Home
                  <ArrowRight className="w-4 h-4 md:w-5 md:h-5 ml-1 md:ml-2" />
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div className="lg:col-span-2" variants={itemVariants}>
                <Card className="glass border-cyan-500/20">
                  <CardContent className="p-8">
                    <h2 className="text-2xl font-bold text-black mb-6">
                      Complete Your Order
                    </h2>

                    <form onSubmit={handlePayment} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="firstName" className="text-black mb-2 block">
                            First Name
                          </Label>
                          <Input
                            id="firstName"
                            type="text"
                            placeholder="John"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className="bg-white border-cyan-500/20 text-black placeholder:text-black"
                            disabled={isProcessing}
                          />
                        </div>

                        <div>
                          <Label htmlFor="lastName" className="text-black mb-2 block">
                            Last Name
                          </Label>
                          <Input
                            id="lastName"
                            type="text"
                            placeholder="Doe"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            className="bg-white border-cyan-500/20 text-black placeholder:text-black"
                            disabled={isProcessing}
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="email" className="text-black mb-2 block">
                          Email Address
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="john@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="bg-white border-cyan-500/20 text-black placeholder:text-black"
                          disabled={isProcessing}
                        />
                        <p className="text-xs text-black mt-2">
                          Your personalized PDF results will be sent to this email
                        </p>
                      </div>

                      <div className="bg-white/5 border border-cyan-500/20 rounded-lg p-4">
                        <h3 className="font-semibold text-black mb-3">Search Summary</h3>
                        <div className="space-y-2 text-sm text-black">
                          <div className="flex justify-between">
                            <span>Location:</span>
                            <span className="text-cyan-300">{searchData.location}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Housing Types:</span>
                            <span className="text-cyan-300">{searchData.housingTypes.join(", ")}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Bedrooms:</span>
                            <span className="text-cyan-300">{searchData.bedrooms}+</span>
                          </div>
                        </div>
                      </div>

                      {/* Donation Section */}
                      <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-lg p-6">
                        <div className="flex items-center gap-2 mb-4">
                          <Heart className="w-5 h-5 text-red-500" />
                          <h3 className="font-semibold text-black text-lg">Your Donation</h3>
                        </div>
                        <p className="text-sm text-slate-700 mb-4">
                          Our service is supported by donations. Your custom rental list is free, but we appreciate any donation you can make.
                        </p>
                        <div>
                          <Label htmlFor="donation" className="text-black mb-2 block">
                            Donation Amount (Minimum: ${DONATION_MINIMUM.toFixed(2)})
                          </Label>
                          <div className="flex items-center gap-2">
                            <span className="text-black font-semibold">$</span>
                            <Input
                              id="donation"
                              type="number"
                              step="0.01"
                              min={DONATION_MINIMUM}
                              placeholder="25.00"
                              value={donationAmount}
                              onChange={(e) => handleDonationChange(e.target.value)}
                              className="bg-white border-red-200 text-black placeholder:text-slate-500"
                              disabled={isProcessing}
                            />
                          </div>
                          {donationError && (
                            <p className="text-xs text-red-600 mt-2">{donationError}</p>
                          )}
                          <p className="text-xs text-slate-600 mt-2">
                            Average donation: $25.00 (but you decide what works for your budget)
                          </p>
                        </div>
                      </div>

                      {/* Case Manager Add-on */}
                      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-lg p-6">
                        <div className="flex items-start gap-3 mb-4">
                          <input
                            type="checkbox"
                            className="mt-1 w-5 h-5 rounded border-amber-300 text-amber-600 cursor-pointer"
                            disabled={isProcessing}
                          />
                          <div className="flex-1">
                            </Label>
                            <p className="text-sm text-slate-700 mt-1">
                            </p>
                          </div>
                        </div>

                        <div className="ml-8 space-y-2 text-sm text-slate-700 mb-4">
                          <p className="font-semibold text-amber-900 mb-2">Consultant Services:</p>
                          <p>✓ Work with you until approved into a rental property</p>
                          <p>✓ Help facilitate the approval process</p>
                          <p>✓ Set tour appointments and negotiate with property managers</p>
                          <p>✓ Ensure you get approved into your chosen property</p>
                          <p className="font-semibold text-amber-900 mt-3 mb-2">Exclusive Perks:</p>
                          <p>✓ Access to credit challenge loan programs for moving expenses</p>
                          <p>✓ Application fee waivers for select second chance programs</p>
                        </div>

                        <div className="ml-8 p-3 bg-white rounded border border-amber-200">
                          <p className="text-sm text-slate-700 mb-1">
                            <span className="line-through text-slate-500">Was $350.00</span> <span className="text-green-600 font-bold ml-2">Now just $125.00</span>
                          </p>
                          <p className="text-xs text-amber-600 font-semibold">Limited time discount!</p>
                        </div>
                      </div>

                      <Button
                        type="submit"
                        disabled={isProcessing || donationError !== ""}
                        className="w-full bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-600 hover:to-cyan-600 text-black text-lg py-6 h-auto disabled:opacity-50"
                      >
                        {isProcessing ? (
                          <>
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity }}
                            >
                              <CreditCard className="w-5 h-5 mr-2" />
                            </motion.div>
                            Processing Payment...
                          </>
                        ) : (
                          <>
                            <CreditCard className="w-5 h-5 mr-2" />
                            Complete Payment
                          </>
                        )}
                      </Button>

                      <div className="flex items-center justify-center gap-2 text-xs text-black">
                        <Lock className="w-4 h-4" />
                        <span>Your payment information is secure and encrypted</span>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card className="glass border-cyan-500/20 sticky top-20">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-black mb-6">Order Summary</h3>

                    <div className="space-y-4 mb-6 pb-6 border-b border-cyan-500/20">
                      <div className="flex justify-between text-black">
                        <span>Donation:</span>
                        <span className="font-semibold">${parseFloat(donationAmount || "0").toFixed(2)}</span>
                      </div>

                        <>
                          <div className="flex justify-between text-black">
                            <span className="font-semibold text-purple-600">${CORPORATE_LEASING_DOWN_PAYMENT.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-sm text-slate-600">
                            <span>+ $150 after property selection</span>
                          </div>
                          <motion.div
                            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/30"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                          >
                            <Tag className="w-4 h-4 text-green-400" />
                            <span className="text-sm text-green-300">Limited Time Discount</span>
                          </motion.div>
                        </>
                      )}
                    </div>

                    <div className="mb-6">
                      <div className="flex justify-between items-baseline mb-1">
                        <span className="text-black">Total:</span>
                        <div>
                          <span className="text-3xl font-bold text-cyan-300">${totalAmount.toFixed(2)}</span>
                          <span className="text-sm text-black ml-2">USD</span>
                        </div>
                      </div>
                    </div>

                    <MoneyBackGuarantee />

                    <div className="mb-6 pb-6 border-b border-cyan-500/20">
                      <OrderSummaryBenefits city={searchData?.location || "your area"} />
                    </div>

                    <div className="space-y-3 mb-6 pb-6 border-b border-cyan-500/20">
                      <h4 className="font-semibold text-black text-sm">What's Included with Your Donation:</h4>
                      {[
                        { icon: "📋", text: "100+ Rental Options" },
                        { icon: "📄", text: "Instant PDF Delivery" },
                        { icon: "📧", text: "Email Results" },
                        { icon: "📞", text: "Complete Contact Info" },
                        { icon: "🔗", text: "Direct Application Links" },
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3 text-sm text-black">
                          <span className="text-lg">{item.icon}</span>
                          <span>{item.text}</span>
                        </div>
                      ))}
                    </div>

                      <div className="space-y-3 mb-6 pb-6 border-b border-purple-500/20">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3 text-sm text-amber-900">
                            <span className="text-lg">👤</span>
                            <span>Dedicated Housing Consultant</span>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-amber-900">
                            <span className="text-lg">💰</span>
                            <span>Credit Challenge Loan Programs</span>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-amber-900">
                            <span className="text-lg">💳</span>
                            <span>Application Fee Waivers</span>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-amber-900">
                            <span className="text-lg">📞</span>
                            <span>Personal Support Until Approved</span>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-amber-900">
                            <span className="text-lg">🤝</span>
                            <span>Landlord Negotiation</span>
                          </div>
                        </div>
                      </div>
                    )}

                      <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded">
                        <p className="text-xs text-blue-900 font-semibold mb-1">Donation Only Includes:</p>
                        <p className="text-xs text-blue-800">Your personalized rental list with 100+ matching Second Chance Rental Properties and Programs in your area.</p>
                      </div>
                    )}

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-black">
                        <RefreshCw className="w-4 h-4 text-blue-400" />
                        <span>30-Day Money Back Guarantee</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-black">
                        <Shield className="w-4 h-4 text-green-400" />
                        <span>95% Approval Rate</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-black">
                        <Zap className="w-4 h-4 text-yellow-400" />
                        <span>Instant Results</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
