import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  CheckCircle2, Building2, Briefcase, Home as HomeIcon,
  ArrowRight, Shield, Star, TrendingUp, Zap, Lock, FileText, Clock, Tag, RefreshCw, AlertCircle, Users, Home, DollarSign
} from "lucide-react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import LiveChatWidget from "@/components/LiveChatWidget";
import ResultsFAQ from "@/components/ResultsFAQ";
import { ContractModal } from "@/components/ContractModal";

interface SearchData {
  fullName: string;
  email: string;
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

export default function ResultsCheckout() {
  const [, navigate] = useLocation();
  const [searchData, setSearchData] = useState<SearchData | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [donationAmount, setDonationAmount] = useState("25.00");
  const [donationError, setDonationError] = useState("");
  const [showPaymentPlanDetails, setShowPaymentPlanDetails] = useState(false);
  const [showApprovalMessage, setShowApprovalMessage] = useState(false);
  const [isLoadingPaymentPlan, setIsLoadingPaymentPlan] = useState(false);
  const [showLearnMore, setShowLearnMore] = useState(false);
  const [usePaymentPlan, setUsePaymentPlan] = useState(false);
  // '500' = $500 down (2 × $250 monthly); '250' = $250 down (3 × $250 monthly)
  const [downPaymentChoice, setDownPaymentChoice] = useState<'500' | '250'>('500');
  const [showContractModal, setShowContractModal] = useState(false);
  
  const createCheckoutSession = trpc.payment.createCheckoutSession.useMutation();

  useEffect(() => {
    const stored = sessionStorage.getItem("searchFormData");
    if (!stored) {
      navigate("/");
      return;
    }
    const data = JSON.parse(stored);
    setSearchData(data);
    // Auto-populate name and email from stored form data
    if (data.fullName) {
      const nameParts = data.fullName.trim().split(' ');
      if (nameParts.length >= 2) {
        setFirstName(nameParts[0]);
        setLastName(nameParts.slice(1).join(' '));
      } else {
        setFirstName(data.fullName);
      }
    }
    if (data.email) {
      setEmail(data.email);
    }
    // Scroll to top of page when results page loads
    window.scrollTo(0, 0);
  }, [navigate]);

      setDonationError("");
      return true;
    }
    
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount < 25) {
      setDonationError("Minimum donation is $25.00");
      return false;
    }
    setDonationError("");
    return true;
  };

  const handleDonationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDonationAmount(value);
    if (value) {
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

      return;
    }

    setIsProcessing(true);

    if (!searchData) {
      toast.error("Search data not found");
      setIsProcessing(false);
      return;
    }

    try {
      // Calculate payment amount
      let paymentAmountCents = 0;
      let donationAmountCents = 0;
      
        if (usePaymentPlan) {
          // Payment Plan: charge chosen down payment today ($500 or $250)
          paymentAmountCents = downPaymentChoice === '500' ? 50000 : 25000;
        } else {
          // Standard: charge $1,000 down payment today
          paymentAmountCents = 100000; // $1,000.00
        }
        donationAmountCents = 0;
      } else {
        // Donation only: charge the donation amount
        const donationValue = donationAmount || "0";
        donationAmountCents = donationValue && parseFloat(donationValue) > 0 ? Math.round(parseFloat(donationValue) * 100) : 0;
        paymentAmountCents = donationAmountCents;
      }
      
      const totalAmountCents = paymentAmountCents;

      const result = await createCheckoutSession.mutateAsync({
        customerEmail: email,
        customerName: `${firstName} ${lastName}`,
        amount: totalAmountCents,
        donationAmount: donationAmountCents,
        orderId: 0,
        submissionId: 0,
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
        // Store order data for success page
        const orderData = {
          orderId: `ORD-${Date.now()}`,
          customerName: `${firstName} ${lastName}`,
          customerEmail: email,
          location: searchData.location,
          donationAmount: donationAmountCents / 100,
          totalAmount: totalAmountCents / 100,
          timestamp: new Date().toISOString(),
          rentalMatches: baseMatches,
        };
        sessionStorage.setItem("orderData", JSON.stringify(orderData));
        // Redirect to Stripe checkout page
        window.location.href = result.checkoutUrl;
      } else {
        toast.error("Failed to create checkout session");
        setIsProcessing(false);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Payment failed. Please try again.";
      console.error("[Payment] Error:", error);
      toast.error(errorMessage);
      setIsProcessing(false);
    }
  };

  if (!searchData) return null;

  // Generate random but consistent match counts
  const baseMatches = Math.floor(Math.random() * 50) + 80;
  const apartmentMatches = Math.floor(baseMatches * 0.30);
  const programMatches = Math.floor(baseMatches * 0.20);
  const privateLandlordMatches = Math.floor(baseMatches * 0.20);
  const rentalPropertyMatches = Math.floor(baseMatches * 0.15);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  const donationAmountNum = parseFloat(donationAmount) || 0;
    ? (usePaymentPlan ? (downPaymentChoice === '500' ? 500.00 : 250.00) : 1000.00)
    : 0;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <div className="flex-1 px-3 py-6 md:py-12 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-20 left-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
            animate={{ x: [0, 30, -30, 0], y: [0, -30, 30, 0] }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-20 right-10 w-96 h-96 bg-slate-500/10 rounded-full blur-3xl"
            animate={{ x: [0, -30, 30, 0], y: [0, 30, -30, 0] }}
            transition={{ duration: 8, repeat: Infinity }}
          />
        </div>

        <div className="container max-w-6xl relative z-10 px-2">
          {/* Success Header */}
          <motion.div
            className="text-center mb-6 md:mb-12"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-green-500/20 border border-green-500/50 mb-3 md:mb-6 mx-auto"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <CheckCircle2 className="w-8 h-8 md:w-10 md:h-10 text-green-400" />
            </motion.div>

            <h1 className="text-2xl md:text-4xl font-bold text-slate-900 mb-2 md:mb-4">
              Congratulations, {firstName || searchData?.fullName?.split(' ')[0] || 'Friend'}!
            </h1>

            <p className="text-sm md:text-lg text-slate-700 mb-1 md:mb-2">
              We found <span className="text-green-600 font-bold">{baseMatches} rental options</span> for you in{" "}
              <span className="text-blue-600 font-semibold">{searchData.location}</span>
            </p>

            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg max-w-2xl mx-auto">
              <p className="text-base font-semibold text-green-900">
                ✓ Your Custom Second Chance Rentals and Program List is <span className="text-green-600">FREE</span>
              </p>
              <p className="text-sm text-green-800 mt-1">
                We accept a donation of your choice to support our mission. Average donation: $25.00, but you decide what works for your budget.
              </p>
            </div>
          </motion.div>

          {/* Two-Column Layout: Results Left, Checkout Right */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
            {/* Results Section - Left (2 columns) */}
            <div className="lg:col-span-2 order-2 lg:order-1">
              {/* What You Get Section */}
              <motion.div
                className="mb-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                <Card className="glass border-emerald-500/30 bg-gradient-to-br from-emerald-50/50 to-teal-50/50">
                  <CardContent className="p-6 md:p-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-black mb-6 flex items-center gap-2">
                      <CheckCircle2 className="w-7 h-7 text-emerald-600" />
                      Select Service
                    </h2>
                    <div className="space-y-4">
                      {/* Donation Only Option */}
                      <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                        <div className="flex items-start gap-3 mb-3">
                          <input
                            type="checkbox"
                            onChange={(e) => {
                              if (e.target.checked) {
                                setDonationAmount('25.00');
                              }
                            }}
                            className="mt-1 w-5 h-5 rounded border-gray-300 cursor-pointer"
                          />
                          <div className="flex-1">
                            <h3 className="font-semibold text-black flex items-center gap-2">
                              <span className="font-bold">Option 1:</span>
                              <span className="text-xl">💰</span>
                              FREE with donation of your choice
                            </h3>
                          </div>
                        </div>
                        <p className="text-sm text-slate-700 mb-3">
                          Get your personalized rental list with <span className="font-semibold">{baseMatches} matching Second Chance Rental Properties and Programs</span> in {searchData.location}. You can apply directly to these properties and programs on your own.
                        </p>
                        <ul className="text-sm text-slate-700 space-y-2 ml-4">
                          <li>✓ {baseMatches} verified rental matches</li>
                          <li>✓ Complete contact details and application links</li>
                          <li>✓ Personalized PDF results</li>
                        </ul>
                      </div>

                      <div className="p-4 bg-purple-50 border-2 border-purple-300 rounded-lg relative">
                        {/* Recommended Badge - Top Left */}
                        <span className="absolute top-2 left-2 text-xs font-bold bg-yellow-400 text-yellow-900 px-3 py-1 rounded">RECOMMENDED</span>
                        
                        {/* Approval Message - FIRST */}
                        <div className="mb-4 p-3 bg-green-100 border border-green-400 rounded-lg">
                          <p className="text-sm font-semibold text-green-900 mb-1">✓ Approved - Good News!</p>
                          <p className="text-xs text-green-800 leading-relaxed">
                          </p>
                        </div>

                        {/* Checkbox and Header */}
                        <div className="flex items-start gap-3 mb-4">
                          <input
                            type="checkbox"
                            onChange={(e) => {
                              if (e.target.checked) {
                                setDonationAmount('');
                              }
                            }}
                            className="mt-1 w-5 h-5 rounded border-gray-300 cursor-pointer"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-black flex items-center gap-2">
                                <span className="font-bold">Option 2:</span>
                                <span className="text-xl">🏢</span>
                              </h3>
                            </div>
                            <p className="text-sm font-bold text-purple-700 mt-1">Total Cost: $1,250.00</p>
                          </div>
                          <span className="text-xs font-bold bg-purple-600 text-white px-2 py-1 rounded">OPTIONAL</span>
                        </div>
                        <div className="flex gap-4 mb-4">
                          <div className="flex-1">
                            <div className="mb-3 space-y-3">
                              {/* Pricing Breakdown */}
                              <div className="bg-purple-100 border border-purple-300 rounded-lg p-3 space-y-3">
                                <div>
                                  <p className="font-bold text-purple-900 text-sm mb-2">$1,000.00 Down Payment</p>
                                  <ul className="text-xs text-purple-800 space-y-1 ml-4">
                                    <li>✓ Generate your Renters ID number</li>
                                    <li>✓ Register Renters ID with rental credit bureaus</li>
                                    <li>✓ Manage your file</li>
                                  </ul>
                                </div>
                                <div className="border-t border-purple-300 pt-2">
                                  <p className="font-bold text-purple-900 text-sm mb-2">$250.00 After Property Selection</p>
                                  <ul className="text-xs text-purple-800 space-y-1 ml-4">
                                    <li>✓ Add positive rental history to your Renters ID</li>
                                    <li>✓ Provide Landlord/Property Manager Verification Services</li>
                                    <li>✓ Consultation and ongoing support</li>
                                  </ul>
                                </div>
                              </div>
                              {/* Key Benefits */}
                              <div className="bg-green-50 border border-green-300 rounded p-2 space-y-1">
                                <p className="font-bold text-green-900 text-xs">✓ GUARANTEED APPROVAL within 30 days or your money back</p>
                                <p className="text-green-800 text-xs">✓ Select ANY rental property of your choice</p>
                                <p className="text-green-800 text-xs">✓ Includes Signed Service Agreement</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        {/* Learn How It Works Dropdown */}
                        <div className="border border-yellow-300 rounded-lg bg-yellow-50 overflow-hidden">
                          <button
                            type="button"
                            onClick={() => setShowLearnMore(!showLearnMore)}
                            className="w-full px-4 py-3 flex items-center justify-between bg-yellow-100 hover:bg-yellow-200 transition-colors"
                          >
                            <span className="font-semibold text-slate-800">Learn How It Works</span>
                            <span className="text-xl">{showLearnMore ? '▼' : '▶'}</span>
                          </button>
                          {showLearnMore && (
                            <div className="p-4 space-y-3 bg-yellow-50">
                              <div className="bg-blue-50 border border-blue-300 rounded p-3">
                                <p className="text-sm text-blue-800 mb-2">The property manager or landlord will screen the corporation's business credit, but the client is placed on the leasing agreement as the official occupant who will be residing in the property.</p>
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-slate-800 mb-2">Select Service - How It Works:</p>
                                <ul className="text-sm text-slate-700 space-y-1 ml-4">
                                  <li>• Pay Required First Payment of $1000.00</li>
                                  <li>• Your Assigned Case Manager will contact you to go over details</li>
                                  <li>• Search and tour rental properties in your desired move-in city</li>
                                  <li>• Pick ANY rental property of your choice, then submit your property choices to us via the proper form links sent to you</li>
                                  <li>• Pay the final fee of $250.00 when you submit your property choice to us</li>
                                  <li>• Your social security number stays private (no credit checks)</li>
                                  <li>• Property managers screen our corporation's excellent business credit</li>
                                  <li>• You're placed on the lease as the official occupant</li>
                                  <li>• We provide you with a Renters ID number</li>
                                  <li>• Your positive rental history helps with future approvals</li>
                                </ul>
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-slate-800 mb-2">Consultant Services:</p>
                                <ul className="text-sm text-slate-700 space-y-1 ml-4">
                                  <li>✓ Dedicated housing consultant works with you throughout the process</li>
                                  <li>✓ Help selecting properties that match your needs</li>
                                  <li>✓ Negotiate with property managers on your behalf</li>
                                  <li>✓ Manage the approval process from application to lease signing</li>
                                </ul>
                              </div>
                              <div className="mt-4 p-3 bg-white rounded border border-purple-100">
                                <p className="text-sm font-semibold text-purple-700 mb-2">Positive Rental History and Income Verification Included:</p>
                                <p className="text-sm text-slate-700">We provide you with prior rental history to place on the rental application and we provide rental history verification services when the property you are applying to contacts us to verify your positive rental history. We also provide income verification by providing documents that present you as a remote employee under our corporation, and if contacted by the property manager or landlord will verify your employment with our corporation. We believe everyone deserves a Second Chance, and we believe in true fair housing practices.</p>
                              </div>
                              <div className="mt-4">
                                <Button onClick={() => setShowContractModal(true)} variant="outline" className="w-full border-blue-600 text-blue-600 hover:bg-blue-50">
                                  <FileText className="w-4 h-4 mr-2" />
                                  View Legally Binding Contract
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Trust Signals */}
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg space-y-2 text-sm text-slate-600">
                        <div className="flex items-center gap-2">
                          <Lock className="w-4 h-4 text-green-600" />
                          <span>SSL Encrypted & Secure Payment</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                          <span className="font-semibold text-green-700">Guaranteed Approval or 30-Day Money-Back Guarantee</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-green-600" />
                          <span>Signed Service Agreement Included</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span>Trusted by 10,000+ Renters</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Checkout Section - Right (1 column) */}
            <div className="lg:col-span-1 order-1 lg:order-2">
              <motion.div
                className="sticky top-20 lg:top-20 top-auto lg:sticky"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                <Card className="glass border-blue-500/30 bg-gradient-to-br from-blue-50/50 to-cyan-50/50">
                  <CardContent className="p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-bold text-black mb-4 sm:mb-6">Complete Your Order</h3>
                    
                    <form onSubmit={handlePayment} className="space-y-3 sm:space-y-4">
                      {/* First Name */}
                      <div>
                        <Label className="text-xs sm:text-sm font-semibold text-black mb-2 block">
                          First Name
                        </Label>
                        <Input
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="John"
                          className="text-base sm:text-lg"
                          required
                        />
                      </div>

                      {/* Last Name */}
                      <div>
                        <Label className="text-xs sm:text-sm font-semibold text-black mb-2 block">
                          Last Name
                        </Label>
                        <Input
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder="Doe"
                          className="text-base sm:text-lg"
                          required
                        />
                      </div>

                      {/* Email */}
                      <div>
                        <Label className="text-xs sm:text-sm font-semibold text-black mb-2 block">
                          Email Address
                        </Label>
                        <Input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="john@example.com"
                          className="text-base sm:text-lg"
                          required
                        />
                      </div>

                      {/* Donation Amount */}
                      <div>
                        <Label className="text-xs sm:text-sm font-semibold text-black mb-2 block">
                          Donation Amount
                        </Label>
                        <div className="relative">
                          <span className="absolute left-3 top-3 text-slate-600">$</span>
                          <Input
                            type="number"
                            step="0.01"
                            min="10"
                            value={donationAmount}
                            onChange={handleDonationChange}
                            placeholder="25.00"
                            className="pl-7 text-base sm:text-lg font-semibold"
                          />
                        </div>
                        {donationError && (
                          <p className="text-xs text-red-600 mt-1">{donationError}</p>
                        )}
                        <p className="text-xs text-slate-600 mt-1 leading-tight">Average donation: $25.00, but donate what works for you.</p>
                      </div>

                      <div className="space-y-3">
                        <div className="p-3 sm:p-4 bg-purple-50 border border-purple-200 rounded-lg">
                          <div className="flex items-start gap-3">
                            <Checkbox
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setDonationAmount("");
                                } else {
                                  setDonationAmount("25.00");
                                }
                              }}
                              className="mt-1 bg-purple-500 border-purple-500"
                            />
                            <div className="flex-1">
                              </Label>
                              <p className="text-xs text-slate-700 mt-1 leading-tight">
                                ✓ $1,000 down payment today<br/>
                                ✓ $250 after property selection<br/>
                                ✓ Guaranteed approval within 30 days or money back
                              </p>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="mt-2 text-purple-600 hover:text-purple-700 p-0 h-auto disabled:opacity-50"
                                disabled={isLoadingPaymentPlan}
                                onClick={async () => {
                                  if (!showPaymentPlanDetails) {
                                    setIsLoadingPaymentPlan(true);
                                    setShowApprovalMessage(false);
                                    // Auto-select Option 2 when Apply for Payment Plan is clicked
                                    await new Promise(resolve => setTimeout(resolve, 2000));
                                    setShowPaymentPlanDetails(true);
                                    setUsePaymentPlan(true);
                                    setShowApprovalMessage(true);
                                    setIsLoadingPaymentPlan(false);
                                    if (typeof window !== 'undefined' && (window as any).gtag) {
                                      (window as any).gtag('event', 'payment_plan_clicked', {
                                        'event_category': 'engagement',
                                        'event_label': 'Apply for Payment Plan'
                                      });
                                    }
                                  } else {
                                    setShowPaymentPlanDetails(false);
                                    setUsePaymentPlan(false);
                                    setShowApprovalMessage(false);
                                    // Don't auto-deselect Option 2, let user manually change it
                                  }
                                }}
                              >
                                {isLoadingPaymentPlan ? '⏳ Processing...' : (showPaymentPlanDetails ? '✕ Remove Payment Plan' : '+ Apply for Payment Plan')}
                              </Button>
                            </div>
                          </div>
                        </div>

                        
                        {showPaymentPlanDetails && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-3 mt-3"
                          >
                            {/* Down payment choice selector */}
                            <div className="p-3 rounded bg-blue-50 border border-blue-200">
                              <p className="text-sm font-semibold text-blue-800 mb-3">Choose your down payment option:</p>
                              <div className="space-y-2">
                                {/* Option A: $500 down */}
                                <label
                                  className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                                    downPaymentChoice === '500'
                                      ? 'border-green-500 bg-green-50'
                                      : 'border-slate-200 bg-white hover:border-blue-300'
                                  }`}
                                >
                                  <input
                                    type="radio"
                                    name="downPaymentChoice"
                                    value="500"
                                    checked={downPaymentChoice === '500'}
                                    onChange={() => setDownPaymentChoice('500')}
                                    className="mt-0.5 accent-green-600"
                                  />
                                  <div className="flex-1">
                                    <p className="text-sm font-bold text-slate-900">$500 Down Today</p>
                                    <div className="mt-2 space-y-1.5">
                                      <div className="flex items-start gap-2 text-xs">
                                        <span className="font-semibold text-slate-800 w-5 flex-shrink-0">1.</span>
                                        <span className="text-slate-700"><strong>$500.00</strong> down payment — due today</span>
                                      </div>
                                      <div className="flex items-start gap-2 text-xs">
                                        <span className="font-semibold text-slate-800 w-5 flex-shrink-0">2.</span>
                                        <span className="text-slate-700"><strong>$250.00</strong> Back-Office Fee — due after property selection to complete your file</span>
                                      </div>
                                      <div className="flex items-start gap-2 text-xs">
                                        <span className="font-semibold text-slate-800 w-5 flex-shrink-0">3.</span>
                                        <span className="text-slate-700"><strong>$250.00/month × 2 months</strong> — remaining balance paid monthly until cleared</span>
                                      </div>
                                    </div>
                                    <p className="text-xs font-bold text-slate-800 mt-2">Grand Total: $1,250</p>
                                  </div>
                                  {downPaymentChoice === '500' && (
                                    <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                                  )}
                                </label>

                                {/* Option B: $250 down */}
                                <label
                                  className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                                    downPaymentChoice === '250'
                                      ? 'border-green-500 bg-green-50'
                                      : 'border-slate-200 bg-white hover:border-blue-300'
                                  }`}
                                >
                                  <input
                                    type="radio"
                                    name="downPaymentChoice"
                                    value="250"
                                    checked={downPaymentChoice === '250'}
                                    onChange={() => setDownPaymentChoice('250')}
                                    className="mt-0.5 accent-green-600"
                                  />
                                  <div className="flex-1">
                                    <p className="text-sm font-bold text-slate-900">$250 Down Today</p>
                                    <div className="mt-2 space-y-1.5">
                                      <div className="flex items-start gap-2 text-xs">
                                        <span className="font-semibold text-slate-800 w-5 flex-shrink-0">1.</span>
                                        <span className="text-slate-700"><strong>$250.00</strong> down payment — due today</span>
                                      </div>
                                      <div className="flex items-start gap-2 text-xs">
                                        <span className="font-semibold text-slate-800 w-5 flex-shrink-0">2.</span>
                                        <span className="text-slate-700"><strong>$250.00</strong> Back-Office Fee — due after property selection to complete your file</span>
                                      </div>
                                      <div className="flex items-start gap-2 text-xs">
                                        <span className="font-semibold text-slate-800 w-5 flex-shrink-0">3.</span>
                                        <span className="text-slate-700"><strong>$250.00/month × 3 months</strong> — remaining balance paid monthly until cleared</span>
                                      </div>
                                    </div>
                                    <p className="text-xs font-bold text-slate-800 mt-2">Grand Total: $1,250</p>
                                  </div>
                                  {downPaymentChoice === '250' && (
                                    <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                                  )}
                                </label>
                              </div>
                            </div>


                          </motion.div>
                        )}
                      </div>

                      {/* Order Summary */}
                      <div className="p-3 sm:p-4 bg-slate-100 rounded-lg space-y-2">
                          <>
                            <div className="text-xs sm:text-sm font-bold text-black mb-2">Option 1:</div>
                            <div className="flex justify-between text-xs sm:text-sm">
                              <span className="text-slate-700">Donation:</span>
                              <span className="font-semibold text-black">${donationAmountNum.toFixed(2)}</span>
                            </div>
                          </>
                        )}
                          <>
                            <div className="text-xs sm:text-sm font-bold text-black mb-2">Option 2: <span className="text-green-600 text-xs font-semibold">RECOMMENDED</span></div>
                            <div className="flex justify-between text-xs sm:text-sm">
                              <span className="text-slate-700">Total Program Cost:</span>
                              <span className="font-semibold text-black">$1,250.00</span>
                            </div>
                            <div className="flex justify-between text-xs sm:text-sm text-slate-600">
                              {usePaymentPlan ? (
                                downPaymentChoice === '500' ? (
                                  <span className="italic">(Down: $500 today, then $250/month × 2 months, + $250 after property selection)</span>
                                ) : (
                                  <span className="italic">(Down: $250 today, then $250/month × 3 months, + $250 after property selection)</span>
                                )
                              ) : (
                                <span className="italic">(Down: $1,000 today + $250 after property selection)</span>
                              )}
                            </div>
                              <div className="mt-2 pt-2 border-t border-slate-300">
                                <Button
                                  type="button"
                                  onClick={async () => {
                                    if (!showPaymentPlanDetails) {
                                      setIsLoadingPaymentPlan(true);
                                      setShowApprovalMessage(false);
                                      await new Promise(resolve => setTimeout(resolve, 2000));
                                      setShowPaymentPlanDetails(true);
                                      setUsePaymentPlan(true);
                                      setShowApprovalMessage(true);
                                      setIsLoadingPaymentPlan(false);
                                    } else {
                                      setShowPaymentPlanDetails(false);
                                      setUsePaymentPlan(false);
                                      setShowApprovalMessage(false);
                                    }
                                  }}
                                  disabled={isLoadingPaymentPlan}
                                  className="w-full text-xs py-1 px-2 bg-transparent text-blue-600 hover:bg-blue-50 border border-blue-600 rounded transition-colors"
                                >
                                  {isLoadingPaymentPlan ? '⏳ Processing...' : (showPaymentPlanDetails ? '✕ Remove Payment Plan' : '+ Apply for Payment Plan')}
                                </Button>
                              </div>
                            )}
                          </>
                        )}
                        <div className="border-t border-slate-300 pt-2 flex justify-between">
                          <span className="text-base sm:text-lg font-bold text-blue-600">
                              ? (usePaymentPlan
                                  ? (downPaymentChoice === '500' ? '$500.00' : '$250.00')
                                  : '$1,000.00')
                              : `$${totalAmount.toFixed(2)}`}
                          </span>
                        </div>
                      </div>

                      {/* Payment Button */}
                      <Button
                        type="submit"
                        disabled={
                          isProcessing ||
                        }
                        className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-2 sm:py-3 rounded-lg text-sm sm:text-base transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isProcessing ? "Processing..." : "Proceed to Checkout"}
                      </Button>

                      <p className="text-xs text-slate-600 text-center flex items-center justify-center gap-1 leading-tight">
                        <Lock className="w-3 h-3 flex-shrink-0" />
                        <span>Secure SSL Encrypted</span>
                      </p>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      <ContractModal isOpen={showContractModal} onClose={() => setShowContractModal(false)} />

      <ResultsFAQ />
      <Footer />
      <LiveChatWidget />
    </div>
  );
}
