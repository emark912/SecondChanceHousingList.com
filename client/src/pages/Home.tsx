import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { ChevronRight, ChevronDown, Check, Zap, Target, Lock } from "lucide-react";
import { AIVisualization } from "@/components/AIVisualization";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Home() {
  const [, navigate] = useLocation();
  const [formData, setFormData] = useState({
    city: "",
    state: "",
    bedrooms: "",
    maxRent: 1500,
    petFriendly: false,
    creditChallenges: [] as string[],
    moveInTimeline: "",
    userName: "",
    userEmail: "",
    userPhone: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const creditChallengeOptions = [
    "No Credit",
    "Low Credit",
    "Evictions",
    "Bankruptcy",
    "Criminal History",
    "Broken Leases",
  ];

  const moveInOptions = [
    "ASAP",
    "1-2 weeks",
    "1 month",
    "2-3 months",
    "3+ months",
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.state.trim()) newErrors.state = "State is required";
    if (formData.creditChallenges.length === 0) {
      newErrors.creditChallenges = "Select at least one credit challenge";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    sessionStorage.setItem("searchFormData", JSON.stringify(formData));
    navigate("/searching");
  };

  const toggleCreditChallenge = (challenge: string) => {
    setFormData(prev => ({
      ...prev,
      creditChallenges: prev.creditChallenges.includes(challenge)
        ? prev.creditChallenges.filter(c => c !== challenge)
        : [...prev.creditChallenges, challenge],
    }));
    if (errors.creditChallenges) {
      setErrors(prev => ({ ...prev, creditChallenges: "" }));
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-green-50 to-purple-50">
        {/* Animated background gradient */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-green-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* LEFT SIDE - Content */}
            <div className="space-y-8">
              {/* AI Badge */}
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full font-semibold text-sm">
                <span className="text-lg">🤖</span>
                ADVANCED AI HOUSING SEARCH
              </div>

              {/* Main Headline */}
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Advanced AI Scans 50,000+ Rental Properties, Second Chance Programs & Corporate Leasing to Find Your Perfect Match
              </h1>

              {/* Subheadline */}
              <p className="text-xl text-gray-700 leading-relaxed">
                Our intelligent AI searches court records, housing databases, rental credit systems, landlord records, and property management databases to understand the approval standards of every property it scans. Then it matches YOU with rentals that will approve you. Get matched in 15 seconds.
              </p>

              {/* Key Benefits */}
              <div className="grid grid-cols-3 gap-4 py-6">
                <div className="flex items-center gap-2">
                  <Zap className="w-6 h-6 text-blue-600" />
                  <span className="font-semibold text-gray-800">15-Second Match</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="w-6 h-6 text-green-600" />
                  <span className="font-semibold text-gray-800">95% Approval</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="w-6 h-6 text-purple-600" />
                  <span className="font-semibold text-gray-800">Private</span>
                </div>
              </div>

              {/* Donation Model Messaging */}
              <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
                <p className="font-semibold text-gray-900">Donation-Based Service (Starting at $20)</p>
                <p className="text-gray-700 text-sm mt-2">Refundable if you're not approved from our resources and rental properties</p>
              </div>

              {/* CTA Button */}
              <Button
                onClick={() => window.scrollTo({ top: document.getElementById("search-form")?.offsetTop || 0, behavior: "smooth" })}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 text-lg font-bold rounded-lg shadow-lg"
              >
                START YOUR AI SEARCH
              </Button>
            </div>

            {/* RIGHT SIDE - AI Visualization */}
            <div className="hidden lg:flex items-center justify-center">
              <AIVisualization />
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-8 h-8 text-gray-600" />
        </div>
      </section>

      {/* HOW OUR AI WORKS SECTION */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">How Our Advanced AI Housing Search Works</h2>

          <div className="space-y-8">
            {/* Step 1 */}
            <Card className="p-8 border-l-4 border-blue-600">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Step 1: AI Scans Multiple Databases</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex gap-4">
                  <span className="text-3xl">📋</span>
                  <div>
                    <p className="font-semibold text-gray-900">Court Records</p>
                    <p className="text-gray-600 text-sm">Eviction history, bankruptcy, criminal records</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <span className="text-3xl">🏠</span>
                  <div>
                    <p className="font-semibold text-gray-900">Housing Databases</p>
                    <p className="text-gray-600 text-sm">50,000+ rental properties nationwide</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <span className="text-3xl">💳</span>
                  <div>
                    <p className="font-semibold text-gray-900">Rental Credit Systems</p>
                    <p className="text-gray-600 text-sm">Credit scores, payment history, rental reports</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <span className="text-3xl">🏢</span>
                  <div>
                    <p className="font-semibold text-gray-900">Landlord Records & Property Management</p>
                    <p className="text-gray-600 text-sm">Landlord approval criteria and policies</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <span className="text-3xl">🔍</span>
                  <div>
                    <p className="font-semibold text-gray-900">Second Chance Programs & Corporate Leasing</p>
                    <p className="text-gray-600 text-sm">Specialized programs for credit challenges</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <span className="text-3xl">👥</span>
                  <div>
                    <p className="font-semibold text-gray-900">Private Landlord Networks</p>
                    <p className="text-gray-600 text-sm">Individual landlords who approve second chances</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Step 2 */}
            <Card className="p-8 border-l-4 border-green-600">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Step 2: AI Understands Approval Standards</h3>
              <p className="text-gray-700 mb-6">Our AI analyzes each rental property and program to understand:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  "What credit situations they accept",
                  "What eviction history they allow",
                  "What criminal history they consider",
                  "What income requirements they have",
                  "What deposit/fees they charge",
                  "What approval timeline they offer",
                  "What special programs they provide",
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                    <p className="text-gray-700">{item}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Step 3 */}
            <Card className="p-8 border-l-4 border-purple-600">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Step 3: AI Matches With Your Situation</h3>
              <p className="text-gray-700 mb-6">You tell us about YOUR situation:</p>
              <ul className="space-y-3 mb-6">
                {[
                  "Your credit challenges",
                  "Your rental history",
                  "Your budget and location",
                  "Your move-in timeline",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-700">
                    <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
                    {item}
                  </li>
                ))}
              </ul>
              <p className="text-gray-700">
                Our AI compares YOUR profile with the approval standards of 50,000+ properties and programs to find the PERFECT MATCHES for you.
              </p>
            </Card>

            {/* Step 4 */}
            <Card className="p-8 border-l-4 border-orange-600">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Step 4: You Get Your Personalized Results</h3>
              <p className="text-gray-700 mb-6">In just 15 seconds, you receive:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { icon: "🏠", title: "Rental Properties", desc: "Direct landlords who will approve you" },
                  { icon: "🤝", title: "Second Chance Programs", desc: "Specialized housing programs for your situation" },
                  { icon: "💼", title: "Corporate Leasing Programs", desc: "Companies that specialize in second chances" },
                  { icon: "👨‍💼", title: "Private Landlords", desc: "Individual landlords open to your situation" },
                  { icon: "🏘️", title: "Second Chance Realtors", desc: "Real estate professionals specializing in second chance housing" },
                  { icon: "📋", title: "And More...", desc: "Additional housing resources and programs" },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <span className="text-3xl">{item.icon}</span>
                    <div>
                      <p className="font-semibold text-gray-900">{item.title}</p>
                      <p className="text-gray-600 text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* WHAT YOU'LL FIND SECTION */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">Your Personalized Results Include</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: "🏠",
                title: "Rental Properties",
                desc: "Direct landlords who approve tenants with credit challenges",
                contact: "Phone, Email, Address",
              },
              {
                icon: "🤝",
                title: "Second Chance Programs",
                desc: "Nonprofits & organizations specializing in second chance housing",
                contact: "Phone, Email, Address",
              },
              {
                icon: "💼",
                title: "Corporate Leasing",
                desc: "Companies specializing in second chance employment & housing",
                contact: "Phone, Email",
              },
              {
                icon: "👨‍💼",
                title: "Private Landlords",
                desc: "Individual landlords open to your situation",
                contact: "Phone, Email, Address",
              },
              {
                icon: "🏘️",
                title: "Second Chance Realtors",
                desc: "Real estate professionals specializing in second chance housing",
                contact: "Phone, Email, Address",
              },
              {
                icon: "📋",
                title: "And More",
                desc: "Additional housing resources & programs tailored to your needs",
                contact: "Various",
              },
            ].map((item, i) => (
              <Card key={i} className="p-6 hover:shadow-lg transition">
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-700 mb-4">{item.desc}</p>
                <p className="text-sm text-gray-600 font-semibold">Contact: {item.contact}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST INDICATORS */}
      <section className="py-16 bg-white border-t border-gray-200">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-4xl font-bold text-green-600">95%</p>
              <p className="text-gray-700 font-semibold mt-2">Approval Rate</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-blue-600">50+</p>
              <p className="text-gray-700 font-semibold mt-2">States Covered</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-purple-600">FREE</p>
              <p className="text-gray-700 font-semibold mt-2">Search is Free</p>
            </div>
          </div>
        </div>
      </section>

      {/* REFUND GUARANTEE */}
      <section className="py-16 bg-blue-50 border-t border-gray-200">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Refund Guarantee</h2>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto">
            If you're not approved from our resources and rental properties, we'll refund your donation. We're confident in our AI matching, and we stand behind our results.
          </p>
        </div>
      </section>

      {/* SEARCH FORM SECTION */}
      <section id="search-form" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">Start Your Search Now</h2>

          <Card className="bg-white shadow-xl p-8 max-w-4xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Location */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Location (City, State) *
                </label>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <Input
                      placeholder="City"
                      value={formData.city}
                      onChange={(e) => {
                        setFormData({ ...formData, city: e.target.value });
                        if (errors.city) setErrors(prev => ({ ...prev, city: "" }));
                      }}
                      className={errors.city ? "border-red-500" : ""}
                    />
                    {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                  </div>
                  <div className="w-24">
                    <Input
                      placeholder="State"
                      value={formData.state}
                      onChange={(e) => {
                        setFormData({ ...formData, state: e.target.value.toUpperCase() });
                        if (errors.state) setErrors(prev => ({ ...prev, state: "" }));
                      }}
                      maxLength={2}
                      className={errors.state ? "border-red-500" : ""}
                    />
                    {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
                  </div>
                </div>
              </div>

              {/* Bedrooms */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Bedrooms
                </label>
                <div className="flex gap-2 flex-wrap">
                  {["Studio", "1BR", "2BR", "3BR", "4BR+"].map((option) => (
                    <Button
                      key={option}
                      type="button"
                      variant={formData.bedrooms === option ? "default" : "outline"}
                      onClick={() => setFormData({ ...formData, bedrooms: option })}
                      className="px-4"
                    >
                      {option}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Max Rent */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Max Monthly Rent: ${formData.maxRent}
                </label>
                <input
                  type="range"
                  min="300"
                  max="3000"
                  step="100"
                  value={formData.maxRent}
                  onChange={(e) => setFormData({ ...formData, maxRent: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>

              {/* Credit Challenges */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Credit Challenges * (Select at least one)
                </label>
                <div className="space-y-2">
                  {creditChallengeOptions.map((challenge) => (
                    <label key={challenge} className="flex items-center gap-3 cursor-pointer">
                      <Checkbox
                        checked={formData.creditChallenges.includes(challenge)}
                        onCheckedChange={() => toggleCreditChallenge(challenge)}
                      />
                      <span className="text-gray-700">{challenge}</span>
                    </label>
                  ))}
                </div>
                {errors.creditChallenges && (
                  <p className="text-red-500 text-sm mt-2">{errors.creditChallenges}</p>
                )}
              </div>

              {/* Pet Friendly */}
              <label className="flex items-center gap-3 cursor-pointer">
                <Checkbox
                  checked={formData.petFriendly}
                  onCheckedChange={(checked) => setFormData({ ...formData, petFriendly: checked as boolean })}
                />
                <span className="text-gray-700">Pet Friendly</span>
              </label>

              {/* Move-in Timeline */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Move-in Timeline
                </label>
                <select
                  value={formData.moveInTimeline}
                  onChange={(e) => setFormData({ ...formData, moveInTimeline: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                >
                  <option value="">Select timeline...</option>
                  {moveInOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              {/* Contact Info (Optional) */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700 mb-3">Optional: Share your info to get updates</p>
                <div className="space-y-3">
                  <Input
                    placeholder="Your Name"
                    value={formData.userName}
                    onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                  />
                  <Input
                    placeholder="Your Email"
                    type="email"
                    value={formData.userEmail}
                    onChange={(e) => setFormData({ ...formData, userEmail: e.target.value })}
                  />
                  <Input
                    placeholder="Your Phone"
                    type="tel"
                    value={formData.userPhone}
                    onChange={(e) => setFormData({ ...formData, userPhone: e.target.value })}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                size="lg"
                className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-lg font-semibold"
              >
                Search Properties
                <ChevronRight className="ml-2" />
              </Button>
            </form>
          </Card>
        </div>
      </section>

      <Footer />

      {/* Blob animations */}
      <style>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
