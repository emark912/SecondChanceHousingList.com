'use client';

import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import { Check, Zap, Shield, Users, Clock } from "lucide-react";

export default function Home() {
  const [, navigate] = useLocation();
  
  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [desiredCity, setDesiredCity] = useState("");
  const [desiredState, setDesiredState] = useState("");
  const [bedrooms, setBedrooms] = useState<number | null>(null);
  const [maxRent, setMaxRent] = useState([1500]);
  const [moveInDate, setMoveInDate] = useState("");
  const [hasPets, setHasPets] = useState("");
  const [petDetails, setPetDetails] = useState("");
  const [employmentStatus, setEmploymentStatus] = useState("");
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [creditChallenges, setCreditChallenges] = useState<string[]>([]);
  const [rentalHistory, setRentalHistory] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");

  const handleSearch = async () => {
    if (!firstName || !lastName || !email || !desiredCity || !desiredState) {
      toast.error("Please fill in all required fields");
      return;
    }

    sessionStorage.setItem("searchParams", JSON.stringify({
      firstName,
      lastName,
      email,
      phone,
      desiredCity,
      desiredState,
      bedrooms,
      maxRent: maxRent[0],
      moveInDate,
      hasPets,
      petDetails,
      employmentStatus,
      monthlyIncome,
      creditChallenges,
      rentalHistory,
      additionalInfo,
    }));

    navigate("/searching");
  };

  const toggleCreditChallenge = (challenge: string) => {
    setCreditChallenges(prev =>
      prev.includes(challenge)
        ? prev.filter(c => c !== challenge)
        : [...prev, challenge]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#e8f1f8] via-[#d4e5f0] to-[#e8f1f8] text-gray-900">
      <Navbar />
      
      {/* Hero Section with Headline and Benefits */}
      <div className="pt-16 pb-12 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gray-900">Get Approved for Housing in 15 Seconds</h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-8">Our AI-powered matching system helps you find quality housing even with credit challenges, evictions, or criminal history.</p>
          
          <div className="flex flex-col md:flex-row gap-4 justify-center mb-12 text-sm">
            <div className="flex items-center gap-2 text-green-600">
              <Check size={20} />
              <span>95% Approval Rate</span>
            </div>
            <div className="flex items-center gap-2 text-green-600">
              <Check size={20} />
              <span>30-Day Refund Guarantee</span>
            </div>
            <div className="flex items-center gap-2 text-green-600">
              <Check size={20} />
              <span>Free to Search</span>
            </div>
          </div>
        </div>

        {/* How Our AI Works Section */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-900">How Our AI Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <div className="bg-blue-500 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Complete Your Profile</h3>
              <p className="text-gray-700">Tell us about your situation, budget, and preferences in just a few minutes.</p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <div className="bg-blue-500 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Zap size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">AI Analyzes 50,000+ Properties</h3>
              <p className="text-gray-700">Our system instantly scans landlords and their acceptance criteria across the nation.</p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <div className="bg-blue-500 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">We Find Your Matches</h3>
              <p className="text-gray-700">Discover properties and landlords that specifically accept renters like you.</p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <div className="bg-blue-500 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Clock size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Get Landlord Contact Info</h3>
              <p className="text-gray-700">One-time donation unlocks direct contact details for all your matches.</p>
            </div>
          </div>
        </div>

        {/* Why Choose Us Section */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-900">Why Choose Second Chance Housing List?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <Shield className="text-blue-500 mb-4" size={40} />
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">AI-Powered Matching</h3>
              <p className="text-gray-700 mb-4">Advanced algorithms analyze landlord policies to find properties that accept your situation.</p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center gap-2">
                  <Check size={18} className="text-green-600" />
                  <span>Intelligent filtering</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={18} className="text-green-600" />
                  <span>Accurate matches</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={18} className="text-green-600" />
                  <span>Time-saving results</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-8">
              <Users className="text-blue-500 mb-4" size={40} />
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">50+ States Covered</h3>
              <p className="text-gray-700 mb-4">Our nationwide database includes landlords and properties across the entire United States.</p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center gap-2">
                  <Check size={18} className="text-green-600" />
                  <span>Nationwide coverage</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={18} className="text-green-600" />
                  <span>50,000+ properties</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={18} className="text-green-600" />
                  <span>Constantly updated</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-8">
              <Clock className="text-blue-500 mb-4" size={40} />
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">30-Day Money Back</h3>
              <p className="text-gray-700 mb-4">Not satisfied with your results? We offer a full refund within 30 days, no questions asked.</p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center gap-2">
                  <Check size={18} className="text-green-600" />
                  <span>Full refund guarantee</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={18} className="text-green-600" />
                  <span>No questions asked</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={18} className="text-green-600" />
                  <span>Risk-free trial</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Rental Profile Form Section */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-900">Start Your Search Today</h2>
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl mx-auto">
            {/* Personal Information Section */}
            <div className="border-b border-gray-300 pb-6 mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm">1</span>
                Personal Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-700">First Name *</Label>
                  <Input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="John"
                    className="mt-1 bg-gray-50 border-gray-300 text-gray-900"
                  />
                </div>
                <div>
                  <Label className="text-gray-700">Last Name *</Label>
                  <Input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Doe"
                    className="mt-1 bg-gray-50 border-gray-300 text-gray-900"
                  />
                </div>
                <div>
                  <Label className="text-gray-700">Email *</Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                    className="mt-1 bg-gray-50 border-gray-300 text-gray-900"
                  />
                </div>
                <div>
                  <Label className="text-gray-700">Phone</Label>
                  <Input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(555) 123-4567"
                    className="mt-1 bg-gray-50 border-gray-300 text-gray-900"
                  />
                </div>
              </div>
            </div>

            {/* Desired Rental Section */}
            <div className="border-b border-gray-300 pb-6 mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm">2</span>
                Desired Rental
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-700">City *</Label>
                  <Input
                    value={desiredCity}
                    onChange={(e) => setDesiredCity(e.target.value)}
                    placeholder="Los Angeles"
                    className="mt-1 bg-gray-50 border-gray-300 text-gray-900"
                  />
                </div>
                <div>
                  <Label className="text-gray-700">State *</Label>
                  <Input
                    value={desiredState}
                    onChange={(e) => setDesiredState(e.target.value)}
                    placeholder="CA"
                    className="mt-1 bg-gray-50 border-gray-300 text-gray-900"
                  />
                </div>
                <div>
                  <Label className="text-gray-700">Bedrooms</Label>
                  <Select value={bedrooms?.toString() || ""} onValueChange={(v) => setBedrooms(v ? parseInt(v) : null)}>
                    <SelectTrigger className="mt-1 bg-gray-50 border-gray-300 text-gray-900">
                      <SelectValue placeholder="Select bedrooms" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Bedroom</SelectItem>
                      <SelectItem value="2">2 Bedrooms</SelectItem>
                      <SelectItem value="3">3 Bedrooms</SelectItem>
                      <SelectItem value="4">4+ Bedrooms</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-gray-700">Move-In Date</Label>
                  <Input
                    type="date"
                    value={moveInDate}
                    onChange={(e) => setMoveInDate(e.target.value)}
                    className="mt-1 bg-gray-50 border-gray-300 text-gray-900"
                  />
                </div>
              </div>
              <div className="mt-4">
                <Label className="text-gray-700">Max Monthly Rent: ${maxRent[0]}</Label>
                <Slider
                  value={maxRent}
                  onValueChange={setMaxRent}
                  min={500}
                  max={5000}
                  step={100}
                  className="mt-2"
                />
              </div>
            </div>

            {/* Household Information Section */}
            <div className="border-b border-gray-300 pb-6 mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm">3</span>
                Household Information
              </h3>
              <div className="space-y-4">
                <div>
                  <Label className="text-gray-700">Do you have pets?</Label>
                  <RadioGroup value={hasPets} onValueChange={setHasPets} className="mt-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="pets-yes" />
                      <Label htmlFor="pets-yes" className="text-gray-700 cursor-pointer">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="pets-no" />
                      <Label htmlFor="pets-no" className="text-gray-700 cursor-pointer">No</Label>
                    </div>
                  </RadioGroup>
                </div>
                {hasPets === "yes" && (
                  <div>
                    <Label className="text-gray-700">Pet Details</Label>
                    <Input
                      value={petDetails}
                      onChange={(e) => setPetDetails(e.target.value)}
                      placeholder="e.g., 1 dog, 2 cats"
                      className="mt-1 bg-gray-50 border-gray-300 text-gray-900"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Rental History & Challenges Section */}
            <div className="border-b border-gray-300 pb-6 mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm">4</span>
                Rental History & Challenges
              </h3>
              <div className="space-y-4">
                <div>
                  <Label className="text-gray-700">Employment Status</Label>
                  <Select value={employmentStatus} onValueChange={setEmploymentStatus}>
                    <SelectTrigger className="mt-1 bg-gray-50 border-gray-300 text-gray-900">
                      <SelectValue placeholder="Select employment status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="employed">Employed</SelectItem>
                      <SelectItem value="self-employed">Self-Employed</SelectItem>
                      <SelectItem value="unemployed">Unemployed</SelectItem>
                      <SelectItem value="retired">Retired</SelectItem>
                      <SelectItem value="student">Student</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-gray-700">Monthly Income</Label>
                  <Input
                    type="number"
                    value={monthlyIncome}
                    onChange={(e) => setMonthlyIncome(e.target.value)}
                    placeholder="$3,000"
                    className="mt-1 bg-gray-50 border-gray-300 text-gray-900"
                  />
                </div>
                <div>
                  <Label className="text-gray-700 block mb-3">Rental Challenges (Select all that apply)</Label>
                  <div className="space-y-2">
                    {["Bad Credit", "Eviction History", "Criminal Record", "Low Income", "No Rental History", "Bankruptcy"].map((challenge) => (
                      <div key={challenge} className="flex items-center space-x-2">
                        <Checkbox
                          id={challenge}
                          checked={creditChallenges.includes(challenge)}
                          onCheckedChange={() => toggleCreditChallenge(challenge)}
                        />
                        <Label htmlFor={challenge} className="text-gray-700 cursor-pointer">{challenge}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Information Section */}
            <div className="pb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm">5</span>
                Additional Information
              </h3>
              <div>
                <Label className="text-gray-700">Anything else we should know?</Label>
                <textarea
                  value={additionalInfo}
                  onChange={(e) => setAdditionalInfo(e.target.value)}
                  placeholder="Tell us more about your situation..."
                  className="mt-1 w-full p-3 border border-gray-300 rounded-md bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                />
              </div>
            </div>

            <Button
              onClick={handleSearch}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold rounded-lg"
            >
              Find My Perfect Home
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
