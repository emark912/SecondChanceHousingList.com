import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AIVisualization } from "@/components/AIVisualization";
import { toast } from "sonner";

export default function Home() {
  const [, navigate] = useLocation();
  
  // Form state
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [bedrooms, setBedrooms] = useState<number | null>(null);
  const [maxRent, setMaxRent] = useState([1500]);
  const [moveIn, setMoveIn] = useState("");
  const [hasPets, setHasPets] = useState(false);
  const [challenges, setChallenges] = useState<string[]>([]);

  const handleSearch = async () => {
    if (!city || !state) {
      toast.error("Please enter a city and state");
      return;
    }

    // Store search params in session storage
    sessionStorage.setItem("searchParams", JSON.stringify({
      city,
      state,
      bedrooms,
      maxRent: maxRent[0],
      moveIn,
      hasPets,
      challenges,
    }));

    // Navigate to searching page
    navigate("/searching");
  };

  const toggleChallenge = (challenge: string) => {
    setChallenges((prev) =>
      prev.includes(challenge)
        ? prev.filter((c) => c !== challenge)
        : [...prev, challenge]
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      {/* HERO SECTION: Rental Profile Form */}
      <section className="relative py-16 px-4 overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-green-50 to-purple-50 opacity-60"></div>
        
        {/* Animated nodes background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-32 h-32 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-32 h-32 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: "2s" }}></div>
          <div className="absolute bottom-20 left-1/3 w-32 h-32 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: "4s" }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* LEFT COLUMN: Form */}
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-blue-200 shadow-sm">
                  <span className="text-2xl">🤖</span>
                  <span className="text-sm font-semibold text-blue-600">AI-POWERED MATCHING</span>
                </div>
                
                <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                  Rental Profile Form
                </h1>
                
                <p className="text-xl text-gray-600">
                  Tell us about your rental needs and situation. Our AI will match you with 50,000+ properties that will approve you in 15 seconds.
                </p>
              </div>

              {/* Form Container */}
              <div className="bg-white rounded-2xl shadow-lg p-8 space-y-8 border border-gray-100">
                {/* Section 1: Rental Needs */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📍</span>
                    <h2 className="text-lg font-bold text-gray-900">Your Rental Needs</h2>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city" className="text-sm font-semibold text-gray-700">City</Label>
                      <Input
                        id="city"
                        placeholder="Austin"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state" className="text-sm font-semibold text-gray-700">State</Label>
                      <Input
                        id="state"
                        placeholder="TX"
                        value={state}
                        onChange={(e) => setState(e.target.value.toUpperCase())}
                        maxLength={2}
                        className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-gray-700">Bedrooms</Label>
                    <div className="grid grid-cols-5 gap-2">
                      {[0, 1, 2, 3, 4].map((num) => (
                        <button
                          key={num}
                          onClick={() => setBedrooms(num)}
                          className={`py-2 px-3 rounded-lg font-semibold transition-all ${
                            bedrooms === num
                              ? "bg-blue-600 text-white shadow-md"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          {num === 4 ? "4+" : num}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-gray-700">
                      Max Monthly Rent: ${maxRent[0]}
                    </Label>
                    <Slider
                      value={maxRent}
                      onValueChange={setMaxRent}
                      min={300}
                      max={3000}
                      step={50}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>$300</span>
                      <span>$3,000</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="moveIn" className="text-sm font-semibold text-gray-700">Move-in Timeline</Label>
                    <Select value={moveIn} onValueChange={setMoveIn}>
                      <SelectTrigger className="rounded-lg border-gray-300">
                        <SelectValue placeholder="Select timeline" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="asap">ASAP</SelectItem>
                        <SelectItem value="1-2-weeks">1-2 Weeks</SelectItem>
                        <SelectItem value="1-month">1 Month</SelectItem>
                        <SelectItem value="flexible">Flexible</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-gray-700">Pets</Label>
                    <div className="flex gap-4">
                      <button
                        onClick={() => setHasPets(true)}
                        className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
                          hasPets
                            ? "bg-green-600 text-white shadow-md"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => setHasPets(false)}
                        className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
                          !hasPets
                            ? "bg-green-600 text-white shadow-md"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        No
                      </button>
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-gray-200"></div>

                {/* Section 2: Rental Situation */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">💪</span>
                    <h2 className="text-lg font-bold text-gray-900">Your Rental Situation</h2>
                  </div>

                  <p className="text-sm text-gray-600">Select all that apply</p>

                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { id: "no-credit", label: "No Credit" },
                      { id: "evictions", label: "Evictions" },
                      { id: "bankruptcy", label: "Bankruptcy" },
                      { id: "criminal", label: "Criminal Record" },
                      { id: "broken-lease", label: "Broken Lease" },
                      { id: "low-income", label: "Low Income" },
                    ].map((challenge) => (
                      <div key={challenge.id} className="flex items-center space-x-3">
                        <Checkbox
                          id={challenge.id}
                          checked={challenges.includes(challenge.id)}
                          onCheckedChange={() => toggleChallenge(challenge.id)}
                          className="rounded"
                        />
                        <Label
                          htmlFor={challenge.id}
                          className="text-sm font-medium text-gray-700 cursor-pointer"
                        >
                          {challenge.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA Button */}
                <Button
                  onClick={handleSearch}
                  className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-bold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all text-lg"
                >
                  🚀 Find My Matches
                </Button>

                <p className="text-center text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">15-second AI match</span> • <span className="font-semibold text-gray-900">95% approval rate</span>
                </p>
              </div>
            </div>

            {/* RIGHT COLUMN: AI Visualization + Benefits */}
            <div className="space-y-8">
              {/* AI Visualization */}
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                <AIVisualization />
              </div>

              {/* Key Benefits */}
              <div className="space-y-4">
                <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">⚡</span>
                    <div>
                      <p className="font-bold text-gray-900">15-Second Match</p>
                      <p className="text-sm text-gray-600">Get instant results</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">🎯</span>
                    <div>
                      <p className="font-bold text-gray-900">95% Approval Rate</p>
                      <p className="text-sm text-gray-600">Real properties that approve you</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">🔒</span>
                    <div>
                      <p className="font-bold text-gray-900">Private & Secure</p>
                      <p className="text-sm text-gray-600">Your data is protected</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">💝</span>
                    <div>
                      <p className="font-bold text-gray-900">Donation-Based ($20+)</p>
                      <p className="text-sm text-gray-600">Unlock landlord contact info</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">✅</span>
                    <div>
                      <p className="font-bold text-green-900">Refund Guarantee</p>
                      <p className="text-sm text-green-700">Not satisfied? Full refund within 30 days</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW OUR AI WORKS */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How Our AI Works</h2>
            <p className="text-xl text-gray-600">Advanced database matching in 4 simple steps</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: "1",
                title: "Your Profile",
                description: "You tell us your rental needs and situation",
                icon: "👤",
              },
              {
                step: "2",
                title: "Database Scan",
                description: "Our AI scans 50,000+ rental properties",
                icon: "🔍",
              },
              {
                step: "3",
                title: "AI Matching",
                description: "Advanced algorithms find your perfect matches",
                icon: "🤖",
              },
              {
                step: "4",
                title: "Your Results",
                description: "Get landlord contact info after donation",
                icon: "✨",
              },
            ].map((item) => (
              <div key={item.step} className="bg-white rounded-xl p-6 shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-4">{item.icon}</div>
                <div className="text-3xl font-bold text-blue-600 mb-2">{item.step}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHAT YOU'LL FIND */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">What You'll Find in Your Results</h2>
            <p className="text-xl text-gray-600">Multiple types of housing and assistance options</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Rental Properties",
                description: "Direct landlords who accept second chance renters",
                icon: "🏠",
              },
              {
                title: "Second Chance Programs",
                description: "Non-profits and organizations offering rental assistance",
                icon: "🤝",
              },
              {
                title: "Corporate Housing",
                description: "Corporate leasing companies with flexible policies",
                icon: "🏢",
              },
              {
                title: "Landlord Networks",
                description: "Vetted landlords specializing in second chance rentals",
                icon: "👥",
              },
              {
                title: "Real Estate Agents",
                description: "Agents experienced with credit-challenged renters",
                icon: "🎯",
              },
              {
                title: "Government Programs",
                description: "Federal and state rental assistance programs",
                icon: "📋",
              },
            ].map((item, idx) => (
              <div key={idx} className="bg-gradient-to-br from-blue-50 to-green-50 rounded-xl p-6 border border-blue-200 hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST INDICATORS */}
      <section className="py-16 px-4 bg-gradient-to-r from-blue-600 to-green-600">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center text-white">
            <div>
              <div className="text-4xl font-bold mb-2">95%</div>
              <p className="text-lg">Approval Rate</p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">50+</div>
              <p className="text-lg">States Covered</p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">Free</div>
              <p className="text-lg">To Search</p>
            </div>
          </div>
        </div>
      </section>

      {/* REFUND GUARANTEE */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-white rounded-2xl p-12 shadow-lg border border-gray-200">
            <div className="text-5xl mb-6">🛡️</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">30-Day Refund Guarantee</h2>
            <p className="text-lg text-gray-600 mb-6">
              Not satisfied with your results? We'll refund your full donation within 30 days, no questions asked. We're confident you'll find what you're looking for.
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-900 font-semibold">✓ Hassle-free refunds • ✓ No questions asked • ✓ 30-day window</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
