import { useState } from "react";
import { useLocation } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ChevronLeft, MapPin, Heart, Home, Users, DollarSign } from "lucide-react";
import { trpc } from "@/lib/trpc";

const CREDIT_CHALLENGES = [
  { id: "no-credit", label: "No Credit Score" },
  { id: "low-credit", label: "Low Credit Score" },
  { id: "evictions", label: "Evictions" },
  { id: "loan-defaults", label: "Loan Defaults" },
  { id: "broken-leases", label: "Broken Leases" },
  { id: "criminal-history", label: "Criminal History" },
  { id: "bankruptcy", label: "Bankruptcy" },
];

const HOUSING_TYPES = [
  { id: "apartment", label: "Apartment" },
  { id: "townhome", label: "Townhome" },
  { id: "duplex", label: "Duplex" },
  { id: "house", label: "House" },
  { id: "condo", label: "Condo" },
  { id: "studio", label: "Studio" },
];

export default function SearchFormPage() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState(1);

  // Form data from previous step (passed via location state)
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  // Step 1: Location
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [searchRadius, setSearchRadius] = useState([25]);

  // Step 2: Credit & Housing
  const [creditChallenges, setCreditChallenges] = useState<string[]>([]);
  const [housingType, setHousingType] = useState("");

  // Step 3: Household
  const [bedrooms, setBedrooms] = useState("");
  const [occupants, setOccupants] = useState("");
  const [totalIncome, setTotalIncome] = useState("");
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [employment, setEmployment] = useState("");
  const [movingLoan, setMovingLoan] = useState("no");
  const [additionalInfo, setAdditionalInfo] = useState("");

  const submitMutation = trpc.search.submit.useMutation({
    onSuccess: (data) => {
      // Store customer data for checkout pre-filling
      sessionStorage.setItem("customerFormData", JSON.stringify({
        fullName: customerName,
        email: customerEmail,
        phone: customerPhone
      }));
      navigate(`/searching?submissionId=${data.submissionId}`);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to submit search");
    },
  });

  const handleToggleChallenge = (id: string) => {
    setCreditChallenges((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleNext = () => {
    if (step === 1) {
      if (!city || !state) {
        toast.error("Please enter your city and state");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (creditChallenges.length === 0 || !housingType) {
        toast.error("Please select credit challenges and housing type");
        return;
      }
      setStep(3);
    }
  };

  const handleSubmit = async () => {
    if (!bedrooms || !occupants || !totalIncome || !monthlyIncome || !employment) {
      toast.error("Please fill in all household details");
      return;
    }

    submitMutation.mutate({
      customerName,
      customerEmail,
      customerPhone,
      city,
      state,
      searchRadiusMiles: searchRadius[0],
      creditChallenges,
      housingType,
      bedrooms: parseInt(bedrooms),
      occupants: parseInt(occupants),
      totalHouseholdIncome: totalIncome,
      monthlyTakeHomeIncome: monthlyIncome,
      employmentDuration: employment,
      needsMovingLoan: movingLoan as "yes" | "no" | "maybe",
      additionalInfo,
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <section className="py-8 md:py-12 flex-1">
        <div className="container max-w-2xl">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => (step > 1 ? setStep(step - 1) : navigate("/"))}
              className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors mb-4"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Back</span>
            </button>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {step === 1 && "Where are you looking for housing?"}
              {step === 2 && "Tell us about your situation"}
              {step === 3 && "Household details"}
            </h1>
            <p className="text-black">
              Step {step} of 3
            </p>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-border rounded-full h-2 mb-8">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6 md:p-8">
              {/* Step 1: Location */}
              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <Label className="text-base font-semibold mb-3 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-primary" />
                      City
                    </Label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g., Houston"
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <Label className="text-base font-semibold mb-3 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-primary" />
                      State
                    </Label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="e.g., Texas"
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <Label className="text-base font-semibold mb-4 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-primary" />
                      Search Radius: {searchRadius[0]} miles
                    </Label>
                    <Slider
                      value={searchRadius}
                      onValueChange={setSearchRadius}
                      min={5}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                    <p className="text-xs text-black mt-2">
                      How far are you willing to travel for housing?
                    </p>
                  </div>
                </div>
              )}

              {/* Step 2: Credit & Housing */}
              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <Label className="text-base font-semibold mb-4 flex items-center gap-2">
                      <Heart className="w-5 h-5 text-primary" />
                      Credit Challenges (select all that apply)
                    </Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {CREDIT_CHALLENGES.map((challenge) => (
                        <div key={challenge.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={challenge.id}
                            checked={creditChallenges.includes(challenge.id)}
                            onCheckedChange={() => handleToggleChallenge(challenge.id)}
                          />
                          <Label htmlFor={challenge.id} className="text-sm font-normal cursor-pointer">
                            {challenge.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-base font-semibold mb-4 flex items-center gap-2">
                      <Home className="w-5 h-5 text-primary" />
                      Housing Type
                    </Label>
                    <RadioGroup value={housingType} onValueChange={setHousingType}>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {HOUSING_TYPES.map((type) => (
                          <div key={type.id} className="flex items-center space-x-2">
                            <RadioGroupItem value={type.id} id={type.id} />
                            <Label htmlFor={type.id} className="text-sm font-normal cursor-pointer">
                              {type.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              )}

              {/* Step 3: Household */}
              {step === 3 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-semibold mb-2 flex items-center gap-2">
                        <Home className="w-4 h-4 text-primary" />
                        Bedrooms
                      </Label>
                      <Select value={bedrooms} onValueChange={setBedrooms}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5].map((num) => (
                            <SelectItem key={num} value={num.toString()}>
                              {num} {num === 1 ? "Bedroom" : "Bedrooms"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-sm font-semibold mb-2 flex items-center gap-2">
                        <Users className="w-4 h-4 text-primary" />
                        Occupants
                      </Label>
                      <Select value={occupants} onValueChange={setOccupants}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5, 6].map((num) => (
                            <SelectItem key={num} value={num.toString()}>
                              {num} {num === 1 ? "Person" : "People"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-semibold mb-2 flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-primary" />
                        Annual Household Income
                      </Label>
                      <input
                        type="text"
                        value={totalIncome}
                        onChange={(e) => setTotalIncome(e.target.value)}
                        placeholder="e.g., $45,000"
                        className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-semibold mb-2 flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-primary" />
                        Monthly Take-Home
                      </Label>
                      <input
                        type="text"
                        value={monthlyIncome}
                        onChange={(e) => setMonthlyIncome(e.target.value)}
                        placeholder="e.g., $3,200"
                        className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-semibold mb-2 block">Employment Duration</Label>
                    <Select value={employment} onValueChange={setEmployment}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="less-than-3-months">Less than 3 months</SelectItem>
                        <SelectItem value="3-6-months">3 - 6 months</SelectItem>
                        <SelectItem value="6-months-1-year">6 months - 1 year</SelectItem>
                        <SelectItem value="1-2-years">1 - 2 years</SelectItem>
                        <SelectItem value="2-5-years">2 - 5 years</SelectItem>
                        <SelectItem value="5-plus-years">5+ years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm font-semibold mb-2 block">Do you need a moving loan?</Label>
                    <RadioGroup value={movingLoan} onValueChange={setMovingLoan}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="loan-yes" />
                        <Label htmlFor="loan-yes" className="text-sm font-normal cursor-pointer">
                          Yes
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="loan-no" />
                        <Label htmlFor="loan-no" className="text-sm font-normal cursor-pointer">
                          No
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="maybe" id="loan-maybe" />
                        <Label htmlFor="loan-maybe" className="text-sm font-normal cursor-pointer">
                          Maybe
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div>
                    <Label className="text-sm font-semibold mb-2 block">Additional Information</Label>
                    <Textarea
                      value={additionalInfo}
                      onChange={(e) => setAdditionalInfo(e.target.value)}
                      placeholder="Any other details we should know? (e.g., pet-friendly needed, accessibility requirements)"
                      rows={3}
                      className="resize-none"
                    />
                  </div>
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3 mt-8">
                {step > 1 && (
                  <Button
                    variant="outline"
                    onClick={() => setStep(step - 1)}
                    className="flex-1"
                  >
                    Previous
                  </Button>
                )}
                {step < 3 ? (
                  <Button
                    onClick={handleNext}
                    className="flex-1"
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={submitMutation.isPending}
                    className="flex-1"
                  >
                    {submitMutation.isPending ? "Searching..." : "Start Search"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>


        </div>
      </section>

      <Footer />
    </div>
  );
}
