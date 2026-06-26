"use client";

import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  CheckCircle2, Building2, Briefcase, Home as HomeIcon,
  ArrowRight, Shield, Star, TrendingUp, Zap, Heart
} from "lucide-react";
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

export default function Results() {
  const [, navigate] = useLocation();
  const [searchData, setSearchData] = useState<SearchData | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("searchFormData");
    if (!stored) {
      navigate("/");
      return;
    }
    setSearchData(JSON.parse(stored));
  }, [navigate]);

  if (!searchData) return null;

  // Generate random but consistent match counts based on location
  const baseMatches = Math.floor(Math.random() * 50) + 80; // 80-130 total matches
  const apartmentMatches = Math.floor(baseMatches * 0.45);
  const programMatches = Math.floor(baseMatches * 0.35);

  const handleViewResults = () => {
    // Store customer data in sessionStorage for checkout form pre-filling
    const customerData = sessionStorage.getItem("customerFormData");
    if (customerData) {
      const parsed = JSON.parse(customerData);
      sessionStorage.setItem("customerData", JSON.stringify({
        firstName: parsed.fullName?.split(" ")[0] || "",
        lastName: parsed.fullName?.split(" ").slice(1).join(" ") || "",
        email: parsed.email || ""
      }));
    }
    navigate("/checkout");
  };

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

      {/* Main Content */}
      <div className="flex-1 px-3 py-6 md:py-12 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-20 left-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
            animate={{
              x: [0, 30, -30, 0],
              y: [0, -30, 30, 0],
            }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-20 right-10 w-96 h-96 bg-slate-500/10 rounded-full blur-3xl"
            animate={{
              x: [0, -30, 30, 0],
              y: [0, 30, -30, 0],
            }}
            transition={{ duration: 8, repeat: Infinity }}
          />
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto relative z-10">
          {/* Header */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl md:text-5xl font-bold text-black mb-4">
              Your Personalized Results
            </h1>
            <p className="text-lg text-slate-700 max-w-2xl mx-auto mb-3">
              We found {baseMatches} rental options in {searchData.location} that match your profile
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-2xl mx-auto">
              <p className="text-base font-semibold text-green-900">
                ✓ Your Custom Second Chance Rentals and Program List in {searchData.location} is <span className="text-green-600">FREE</span>
              </p>
              <p className="text-sm text-green-800 mt-1">
                We accept a donation of your choice to support our mission. Average donation: $25.00, but you decide what works for your budget.
              </p>
            </div>
          </motion.div>

          {/* Match Cards */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Apartments Card */}
            <motion.div variants={itemVariants}>
              <Card className="glass border-blue-500/20 hover:border-blue-500/50 transition-all h-full">
                <CardContent className="p-8">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-blue-400" />
                    </div>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      <TrendingUp className="w-5 h-5 text-green-400" />
                    </motion.div>
                  </div>

                  <h3 className="text-base md:text-lg font-semibold text-slate-900 mb-1 md:mb-2">
                    Second Chance Apartments in {searchData.location}
                  </h3>

                  <motion.div
                    className="text-3xl md:text-4xl font-bold text-blue-600 mb-2 md:mb-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                  >
                    {apartmentMatches}
                  </motion.div>

                  <p className="text-xs md:text-sm text-slate-600 leading-snug">
                    Landlords specializing in approving tenants with credit challenges
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Programs Card */}
            <motion.div variants={itemVariants}>
              <Card className="glass border-purple-500/20 hover:border-purple-500/50 transition-all h-full">
                <CardContent className="p-8">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
                      <HomeIcon className="w-6 h-6 text-purple-400" />
                    </div>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      <TrendingUp className="w-5 h-5 text-green-400" />
                    </motion.div>
                  </div>

                  <h3 className="text-base md:text-lg font-semibold text-slate-900 mb-1 md:mb-2">
                    Housing Programs in {searchData.location}
                  </h3>

                  <motion.div
                    className="text-3xl md:text-4xl font-bold text-purple-600 mb-2 md:mb-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                  >
                    {programMatches}
                  </motion.div>

                  <p className="text-xs md:text-sm text-slate-600 leading-snug">
                    Government and nonprofit housing assistance programs
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="glass border-pink-500/20 hover:border-pink-500/50 transition-all h-full">
                <CardContent className="p-8">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-lg bg-pink-500/20 flex items-center justify-center">
                      <Briefcase className="w-6 h-6 text-pink-400" />
                    </div>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      <TrendingUp className="w-5 h-5 text-green-400" />
                    </motion.div>
                  </div>

                  <h3 className="text-lg font-semibold text-black mb-2">
                  </h3>

                  <motion.div
                    className="text-4xl font-bold text-pink-400 mb-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                  >
                  </motion.div>

                  <p className="text-sm text-black">
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Mission Statement */}
          <motion.div
            className="mb-12 p-8 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <div className="flex items-start gap-4">
              <Heart className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-xl font-bold text-black mb-3">Our Mission: Everyone Deserves a Second Chance</h2>
                <p className="text-slate-700 mb-3">
                  SecondChanceHousingList.com is dedicated to providing advanced AI-powered search technology to help credit-challenged renters find housing options that will approve them. We believe everyone deserves access to quality housing and a second chance.
                </p>
                <p className="text-slate-700 font-semibold">
                  Our service is supported by donations. Your custom rental list is available for a donation of your choice (minimum $10.00). The average donation is $25.00, but you decide what works for your budget.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Key Metrics */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Approval Rate */}
            <motion.div variants={itemVariants}>
              <Card className="glass border-green-500/20">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                    <Star className="w-7 h-7 text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-black mb-1">Approval Rate</p>
                    <p className="text-3xl font-bold text-green-400">95%</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Money Back Guarantee */}
            <motion.div variants={itemVariants}>
              <Card className="glass border-blue-500/20">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-7 h-7 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-black mb-1">Guarantee</p>
                    <p className="text-3xl font-bold text-blue-400">30 Days</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* What's Included */}
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="glass border-cyan-500/20">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-black mb-6">What You'll Get</h2>

                <div className="space-y-6">
                  {/* Rental Options Summary */}
                  <div>
                    <h3 className="font-semibold text-black mb-4">Rental Options Included:</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                        <div className="text-2xl">🏢</div>
                        <div>
                          <p className="font-semibold text-black">{apartmentMatches}</p>
                          <p className="text-xs text-slate-600">Apartments</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                        <div className="text-2xl">🏠</div>
                        <div>
                          <p className="font-semibold text-black">{programMatches}</p>
                          <p className="text-xs text-slate-600">Programs</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-pink-50 rounded-lg">
                        <div className="text-2xl">💼</div>
                        <div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* PDF Download */}
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h3 className="font-semibold text-black mb-2">📄 Personalized PDF Results</h3>
                    <p className="text-sm text-slate-700">Your complete list of {baseMatches} rental options delivered immediately as a PDF you can download and share.</p>
                  </div>


                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="space-y-3 mb-3">
                      {/* Option A: $500 Down */}
                      <div className="bg-white p-3 rounded border border-green-200">
                        <p className="text-sm font-semibold text-green-700 mb-2">Option A: $500 Down Payment</p>
                        <ul className="text-sm text-slate-700 space-y-1 ml-4">
                          <li>• <strong>$500 Down</strong> - Pay today to get started</li>
                          <li>• <strong>$250/month × 2 months</strong> - Month 1 & 2</li>
                          <li className="mt-1 p-2 bg-amber-50 border border-amber-400 rounded text-amber-800 font-semibold">⚠️ $250 mandatory back-office fee due after property selection — required to complete your file.</li>
                          <li className="mt-1 font-bold text-green-800">Grand Total: $1,250</li>
                        </ul>
                      </div>
                      
                      {/* Option B: $250 Down */}
                      <div className="bg-white p-3 rounded border border-blue-200">
                        <p className="text-sm font-semibold text-blue-700 mb-2">Option B: $250 Down Payment</p>
                        <ul className="text-sm text-slate-700 space-y-1 ml-4">
                          <li>• <strong>$250 Down</strong> - Pay today to get started</li>
                          <li>• <strong>$250/month × 3 months</strong> - Month 1, 2 & 3</li>
                          <li className="mt-1 p-2 bg-amber-50 border border-amber-400 rounded text-amber-800 font-semibold">⚠️ $250 mandatory back-office fee due after property selection — required to complete your file.</li>
                          <li className="mt-1 font-bold text-blue-800">Grand Total: $1,250</li>
                        </ul>
                      </div>
                    </div>
                    <p className="text-sm text-slate-700 mb-2"><strong>What's Included:</strong></p>
                    <ul className="text-sm text-slate-700 ml-4 space-y-1">
                      <li>✓ Personalized rental list with {baseMatches}+ matches</li>
                      <li>✓ Dedicated housing consultant support</li>
                      <li>✓ Help with property selection and applications</li>
                      <li>✓ No income verification required</li>
                      <li>✓ Listed as a remote employee of our Corporation</li>
                      <li>✓ Income Verification Included - We provide the renter with income verification as a remote worker under our corporation as an extra layer of privacy and maximizing approval chances</li>
                      <li>✓ Priority support throughout your journey</li>
                    </ul>
                    
                    <div className="mt-4 p-3 bg-white rounded border border-purple-100">
                      <p className="text-sm font-semibold text-purple-700 mb-2">Positive Rental History and Income Verification Included:</p>
                      <p className="text-sm text-slate-700">We provide you with prior rental history to place on the rental application and we provide rental history verification services when the property you are applying to contacts us to verify your positive rental history. We also provide income verification by providing documents that present you as a remote employee under our corporation, and if contacted by the property manager or landlord will verify your employment with our corporation. We believe everyone deserves a Second Chance, and we believe in true fair housing practices.</p>
                    </div>
                  </div>
                  
                  {/* Donation Only Option */}
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h3 className="font-semibold text-black mb-2">💙 Donation Only Option</h3>
                    <p className="text-sm text-slate-700">If you choose to donate instead of adding the case manager, you'll receive your personalized rental list with <span className="font-semibold">{baseMatches} matching Second Chance Rental Properties and Programs</span> in your area. You can apply directly to these properties and programs on your own.</p>
                  </div>

                  {/* Refund Policy */}
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h3 className="font-semibold text-black mb-2">✓ 30-Day Money Back Guarantee</h3>
                    <p className="text-sm text-slate-700">100% refund if you're not approved into a rental property within 30 days.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <div className="mb-6 max-w-2xl mx-auto">
              <p className="text-black mb-4 font-semibold">
                Ready to access your complete list of {baseMatches} rental options?
              </p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-3">
                <p className="text-sm text-slate-800">
                  <span className="font-semibold text-green-700">Donation Only:</span> Get your personalized PDF results for a donation of your choice.
                </p>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-slate-800">
                  <span className="font-semibold text-amber-700">Add Case Manager:</span> For just $125 (regularly $350), get a dedicated housing consultant PLUS credit challenge loan programs and application fee waivers.
                </p>
              </div>
            </div>

            <Button
              onClick={handleViewResults}
              className="bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-600 hover:to-cyan-600 text-black text-lg px-8 py-6 h-auto shadow-lg shadow-green-500/30"
            >
              Proceed to Donation & Checkout
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
