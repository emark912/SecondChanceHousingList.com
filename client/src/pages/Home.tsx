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
import { Check } from "lucide-react";

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

  const toggleChallenge = (challenge: string) => {
    setCreditChallenges((prev) =>
      prev.includes(challenge)
        ? prev.filter((c) => c !== challenge)
        : [...prev, challenge]
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white">
      <Navbar />

      {/* HERO SECTION */}
      <section className="bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 py-16 px-4">
        <div className="max-w-6xl mx-auto text-center space-y-6 mb-12">
          <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight">
            Get Approved for Housing in 15 Seconds
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Our AI-powered matching system helps you find quality housing even with credit challenges, evictions, or criminal history.
          </p>
          
          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center gap-6 pt-4">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-400" />
              <span className="text-gray-200">95% Approval Rate</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-400" />
              <span className="text-gray-200">30-Day Refund Guarantee</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-400" />
              <span className="text-gray-200">Free to Search</span>
            </div>
          </div>
        </div>

        {/* Property Showcase Images */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="rounded-lg overflow-hidden shadow-xl h-64 md:h-80 bg-gray-700">
            <img 
              src="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&h=400&fit=crop" 
              alt="Modern apartment interior"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="rounded-lg overflow-hidden shadow-xl h-64 md:h-80 bg-gray-700">
            <img 
              src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&h=400&fit=crop" 
              alt="Modern house exterior"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* APPLICATION FORM SECTION */}
      <section className="bg-gray-800 py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-900 rounded-lg p-8 shadow-2xl border border-gray-700">
            <h2 className="text-3xl font-bold text-white mb-2">Second Chance Housing Application</h2>
            <p className="text-gray-400 mb-8">Complete this application and our AI will match you with properties that will approve you.</p>

            <div className="space-y-8">
              {/* SECTION 1: Personal Information */}
              <div className="space-y-6 pb-8 border-b border-gray-700">
                <h3 className="text-xl font-bold text-white">Personal Information</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-gray-300">First Name *</Label>
                    <Input
                      id="firstName"
                      placeholder="John"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-gray-300">Last Name *</Label>
                    <Input
                      id="lastName"
                      placeholder="Doe"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-300">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-gray-300">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="(555) 123-4567"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-500"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: Desired Rental */}
              <div className="space-y-6 pb-8 border-b border-gray-700">
                <h3 className="text-xl font-bold text-white">Desired Rental</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-gray-300">City *</Label>
                    <Input
                      id="city"
                      placeholder="Austin"
                      value={desiredCity}
                      onChange={(e) => setDesiredCity(e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state" className="text-gray-300">State *</Label>
                    <Input
                      id="state"
                      placeholder="TX"
                      value={desiredState}
                      onChange={(e) => setDesiredState(e.target.value.toUpperCase())}
                      maxLength={2}
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-500"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-gray-300">Desired Number of Bedrooms</Label>
                  <div className="grid grid-cols-5 gap-2">
                    {[0, 1, 2, 3, 4].map((num) => (
                      <button
                        key={num}
                        onClick={() => setBedrooms(num)}
                        className={`py-2 px-3 rounded font-semibold transition-all text-sm ${
                          bedrooms === num
                            ? "bg-green-500 text-white"
                            : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                        }`}
                      >
                        {num === 4 ? "4+" : num}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-gray-300">
                    Maximum Monthly Rent: ${maxRent[0]}
                  </Label>
                  <Slider
                    value={maxRent}
                    onValueChange={setMaxRent}
                    min={300}
                    max={3000}
                    step={50}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="moveIn" className="text-gray-300">Desired Move-in Date</Label>
                  <Input
                    id="moveIn"
                    type="date"
                    value={moveInDate}
                    onChange={(e) => setMoveInDate(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              </div>

              {/* SECTION 3: Household Information */}
              <div className="space-y-6 pb-8 border-b border-gray-700">
                <h3 className="text-xl font-bold text-white">Household Information</h3>

                <div className="space-y-3">
                  <Label className="text-gray-300">Do you have pets?</Label>
                  <RadioGroup value={hasPets} onValueChange={setHasPets}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="pets-yes" />
                      <Label htmlFor="pets-yes" className="text-gray-300 font-normal cursor-pointer">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="pets-no" />
                      <Label htmlFor="pets-no" className="text-gray-300 font-normal cursor-pointer">No</Label>
                    </div>
                  </RadioGroup>
                </div>

                {hasPets === "yes" && (
                  <div className="space-y-2">
                    <Label htmlFor="petDetails" className="text-gray-300">Please describe your pets</Label>
                    <Input
                      id="petDetails"
                      placeholder="e.g., 1 dog (30 lbs), 2 cats"
                      value={petDetails}
                      onChange={(e) => setPetDetails(e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-500"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="employment" className="text-gray-300">Employment Status</Label>
                  <Select value={employmentStatus} onValueChange={setEmploymentStatus}>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue placeholder="Select employment status" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600">
                      <SelectItem value="employed-full-time">Employed (Full-time)</SelectItem>
                      <SelectItem value="employed-part-time">Employed (Part-time)</SelectItem>
                      <SelectItem value="self-employed">Self-Employed</SelectItem>
                      <SelectItem value="unemployed">Unemployed</SelectItem>
                      <SelectItem value="retired">Retired</SelectItem>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="disability">Disability</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="income" className="text-gray-300">Approximate Monthly Gross Income</Label>
                  <Input
                    id="income"
                    type="number"
                    placeholder="$3,000"
                    value={monthlyIncome}
                    onChange={(e) => setMonthlyIncome(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-500"
                  />
                </div>
              </div>

              {/* SECTION 4: Rental History & Challenges */}
              <div className="space-y-6 pb-8 border-b border-gray-700">
                <h3 className="text-xl font-bold text-white">Rental History & Challenges</h3>

                <div className="space-y-3">
                  <Label className="text-gray-300">Select any challenges that apply *</Label>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { id: "no-credit", label: "No Credit History" },
                      { id: "poor-credit", label: "Poor Credit Score" },
                      { id: "evictions", label: "Previous Eviction(s)" },
                      { id: "bankruptcy", label: "Bankruptcy" },
                      { id: "criminal", label: "Criminal Record" },
                      { id: "broken-lease", label: "Broken Lease" },
                      { id: "late-payments", label: "Late Rent Payments" },
                      { id: "low-income", label: "Low Income" },
                    ].map((challenge) => (
                      <div key={challenge.id} className="flex items-center space-x-3">
                        <Checkbox
                          id={challenge.id}
                          checked={creditChallenges.includes(challenge.id)}
                          onCheckedChange={() => toggleChallenge(challenge.id)}
                          className="border-gray-500"
                        />
                        <Label
                          htmlFor={challenge.id}
                          className="text-gray-300 font-normal cursor-pointer"
                        >
                          {challenge.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rentalHistory" className="text-gray-300">Rental History</Label>
                  <Select value={rentalHistory} onValueChange={setRentalHistory}>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue placeholder="Select your rental history" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600">
                      <SelectItem value="first-time">First-time Renter</SelectItem>
                      <SelectItem value="current-renter">Currently Renting</SelectItem>
                      <SelectItem value="previous-renter">Previous Renter</SelectItem>
                      <SelectItem value="homeowner">Homeowner</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* SECTION 5: Additional Information */}
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-white">Additional Information</h3>

                <div className="space-y-2">
                  <Label htmlFor="additionalInfo" className="text-gray-300">Anything else you'd like us to know?</Label>
                  <textarea
                    id="additionalInfo"
                    placeholder="Tell us about yourself or your situation..."
                    value={additionalInfo}
                    onChange={(e) => setAdditionalInfo(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-500 focus:border-green-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* CTA Button */}
              <div className="pt-6 space-y-4">
                <Button
                  onClick={handleSearch}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded text-lg"
                >
                  Submit Application
                </Button>
                <p className="text-center text-sm text-gray-400">
                  Your payment information is secure and encrypted by Stripe.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="bg-gray-900 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-16">How It Works</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: "1",
                title: "Complete Application",
                description: "Fill out your rental profile",
              },
              {
                step: "2",
                title: "AI Matching",
                description: "Our AI scans 50,000+ properties",
              },
              {
                step: "3",
                title: "Get Results",
                description: "Receive your matched properties",
              },
              {
                step: "4",
                title: "Get Approved",
                description: "Contact landlords and get approved",
              },
            ].map((item) => (
              <div key={item.step} className="bg-gray-800 rounded-lg p-6 border border-gray-700 text-center">
                <div className="text-4xl font-bold text-green-400 mb-4">{item.step}</div>
                <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                <p className="text-gray-400">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* KEY BENEFITS SECTION */}
      <section className="bg-gray-800 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-16">Key Benefits</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: "15-Second Match", description: "Get instant AI-powered results" },
              { title: "95% Approval Rate", description: "Real properties that approve you" },
              { title: "No Credit Check", description: "We don't run your personal credit" },
              { title: "Verified Income", description: "We provide employment verification" },
              { title: "Private & Secure", description: "Your data is protected" },
              { title: "30-Day Guarantee", description: "Full refund if not satisfied" },
            ].map((benefit, idx) => (
              <div key={idx} className="bg-gray-900 rounded-lg p-6 border border-gray-700">
                <div className="flex items-start gap-3 mb-3">
                  <Check className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                  <h3 className="text-lg font-bold text-white">{benefit.title}</h3>
                </div>
                <p className="text-gray-400">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section className="bg-gray-900 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-16">Simple, Transparent Pricing</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                price: "$20",
                title: "Starting Donation",
                description: "Unlock landlord contact information",
                features: ["Access to 50,000+ properties", "Landlord contact details", "30-day refund guarantee"],
              },
              {
                price: "$50",
                title: "Application Fee",
                description: "Get matched with properties",
                features: ["Profile analysis", "AI matching", "Case manager support"],
                featured: true,
              },
              {
                price: "$100+",
                title: "Premium Support",
                description: "Full application assistance",
                features: ["Priority matching", "Dedicated support", "Income verification"],
              },
            ].map((tier, idx) => (
              <div 
                key={idx} 
                className={`rounded-lg p-8 border ${
                  tier.featured 
                    ? "bg-green-900 border-green-500 shadow-lg" 
                    : "bg-gray-800 border-gray-700"
                }`}
              >
                <div className="text-3xl font-bold text-white mb-2">{tier.price}</div>
                <h3 className="text-xl font-bold text-white mb-2">{tier.title}</h3>
                <p className="text-gray-400 mb-6">{tier.description}</p>
                <ul className="space-y-3">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-gray-300">
                      <Check className="w-4 h-4 text-green-400" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
