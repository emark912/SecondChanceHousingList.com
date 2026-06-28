import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import FormFieldError from "@/components/FormFieldError";
import ValidationFeedback from "@/components/ValidationFeedback";
import SuccessIndicator from "@/components/SuccessIndicator";
import { Checkbox } from "@/components/ui/checkbox";
// Removed unused Select component - using native HTML select instead
import { toast } from "sonner";
import { Search, Zap, Database, Building2, Key, HomeIcon, Briefcase, Radar } from "lucide-react";
import { AIBackgroundEffects, GlowingText, AnimatedCounter } from "@/components/AIEffects";
import { formatNumberWithCommas } from "@/lib/numberFormatter";

import { AIChatbot } from "@/components/AIChatbot";
import { FormIntelligence, ProgressIndicator } from "@/components/FormIntelligence";
import TrustIndicators from "@/components/TrustIndicators";
import SocialProofBadges from "@/components/SocialProofBadges";
import { trpc } from "@/lib/trpc";

// Google Places API will be used for location autocomplete

const CREDIT_CHALLENGES = [
  { id: "no-credit", label: "No Credit" },
  { id: "low-credit", label: "Low Credit" },
  { id: "evictions", label: "Evictions" },
  { id: "bankruptcy", label: "Bankruptcy" },
  { id: "broken-leases", label: "Broken Leases" },
  { id: "loan-defaults", label: "Loan Defaults" },
  { id: "criminal-history", label: "Criminal History" },
];

const HOUSING_TYPES = [
  { id: "apartment", label: "Apartment" },
  { id: "house", label: "House" },
  { id: "townhome", label: "Townhome" },
  { id: "condo", label: "Condo" },
  { id: "mobile", label: "Mobile Home" },
  { id: "other", label: "Other" },
];

const CRIMINAL_HISTORY_OPTIONS = [
  { id: "none", label: "No Criminal History" },
  { id: "misdemeanor", label: "Misdemeanor" },
  { id: "felony", label: "Felony" },
  { id: "prefer-not", label: "Prefer Not to Say" },
];

const EVICTION_OPTIONS = [
  { id: "0", label: "0 Evictions" },
  { id: "1", label: "1 Eviction" },
  { id: "2", label: "2 Evictions" },
  { id: "3-plus", label: "3+ Evictions" },
];

const PET_OPTIONS = [
  { id: "no-pets", label: "No Pets" },
  { id: "dogs", label: "Dogs" },
  { id: "cats", label: "Cats" },
  { id: "both", label: "Dogs & Cats" },
  { id: "exotic", label: "Exotic Animals" },
];

const SMOKING_OPTIONS = [
  { id: "non-smoker", label: "Non-Smoker" },
  { id: "smoker", label: "Smoker" },
  { id: "vape", label: "Vape Only" },
];

const MOVE_IN_TIMELINE = [
  { id: "asap", label: "ASAP - Today to 1 week" },
  { id: "within-2-weeks", label: "Within 2 weeks" },
  { id: "within-30-days", label: "Within 30 days" },
  { id: "within-60-days", label: "Within 60 days" },
  { id: "within-3-months", label: "Within 3 months+" },
];

const CRIMINAL_HISTORY_TYPE = [
  { id: "violent", label: "Violent Offense" },
  { id: "non-violent", label: "Non-Violent Offense" },
  { id: "drug-related", label: "Drug-Related" },
  { id: "other", label: "Other" },
]

const AI_CAPABILITIES = [
  {
    icon: Database,
    title: "Real-Time Rental Housing Data",
    description: "Monitors real-time rental housing data nationally of rental properties for rent",
  },
  {
    icon: Building2,
    title: "Credit Standard Verification",
    description: "Monitors the real-time credit standard property management companies approve renters",
  },
  {
    icon: Key,
    title: "Verified Private Landlords",
    description: "Verifies private landlords that have historically approved credit challenged renters",
  },
  {
    icon: HomeIcon,
    title: "Second Chance Apartments",
    description: "Massive database of verified second chance apartments",
  },
  {
    icon: Briefcase,
    title: "Second Chance Programs",
    description: "Researches and verifies the legitimacy of second chance programs",
  },
  {
    icon: Building2,
    title: "Corporate Leasing Programs",
    description: "Massive database of verified corporate leasing programs that use business credit",
  },
  {
    icon: Search,
    title: "Public and Private Records",
    description: "Access to public and private records to pinpoint second chance housing rentals",
  },
];

const CREDIT_ISSUES = [
  "No Credit Score",
  "Low Credit Score",
  "Evictions",
  "Broken Leases",
  "Loan Defaults",
  "Criminal History",
  "Bankruptcy",
  "And More",
];

// Global function for testing form submission
if (typeof window !== 'undefined') {
  (window as any).fillFormForTesting = function() {
    // This will be set by the component instance
  };
};


export default function Home() {
  const [, navigate] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const searchSubmitMutation = trpc.search.submit.useMutation();
  const locationInputRef = useRef<HTMLInputElement>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);

  // Form fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [searchRadius, setSearchRadius] = useState(25);
  const [creditChallenges, setCreditChallenges] = useState<string[]>([]);
  const [housingTypes, setHousingTypes] = useState<string[]>([]);
  const [bedrooms, setBedrooms] = useState("");
  const [criminalHistory, setCriminalHistory] = useState("");
  const [criminalHistoryType, setCriminalHistoryType] = useState("");
  const [evictions, setEvictions] = useState("");
  const [income, setIncome] = useState("");
  const [monthlyBudget, setMonthlyBudget] = useState("");
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [petPreference, setPetPreference] = useState("");
  const [smokingStatus, setSmokingStatus] = useState("");
  const [moveInTimeline, setMoveInTimeline] = useState("");
  const [criminalHistoryDetails, setCriminalHistoryDetails] = useState("");
  const [isRegisteredSexOffender, setIsRegisteredSexOffender] = useState("");
  const [criminalBackgroundExplanation, setCriminalBackgroundExplanation] = useState("");
  const [personalCircumstances, setPersonalCircumstances] = useState("");
  const [canPaySecurityDeposit, setCanPaySecurityDeposit] = useState("");
  const [creditRating, setCreditRating] = useState("");

  // Error state tracking
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  
  // Success state tracking
  const [successFields, setSuccessFields] = useState<Record<string, boolean>>({});

  // Expose form filling function to window for testing
  useEffect(() => {
    (window as any).fillFormForTesting = () => {
      setFullName('Michael Johnson');
      setEmail('michael.johnson@email.com');
      setLocation('Denver, Colorado');
      setSearchRadius(25);
      setCreditChallenges(['no-credit']);
      setHousingTypes(['apartment']);
      setBedrooms('1');
      setCriminalHistory('none');
      setEvictions('0');
      setIncome('45000');
      setMonthlyBudget('1200');
      setMonthlyIncome('65000');
      setPetPreference('no-pets');
      setSmokingStatus('non-smoker');
      setMoveInTimeline('asap');
      setIsRegisteredSexOffender('no');
      setCanPaySecurityDeposit('yes');
      setCreditRating('good');
      console.log('Form filled with test data');
    };
    
    (window as any).submitForm = () => {
      const form = document.querySelector('form');
      if (form) {
        form.dispatchEvent(new Event('submit', { bubbles: true }));
        console.log('Form submission triggered');
      }
    };
  }, []);

  // Calculate form progress (5 major sections)
  const calculateProgress = () => {
    let filledFields = 0;
    const totalFields = 5;
    if (fullName.trim() && email.trim()) filledFields++;
    if (creditChallenges.length > 0 && housingTypes.length > 0) filledFields++;
    if (income && monthlyBudget) filledFields++;
    if (criminalHistory && evictions) filledFields++;
    if (personalCircumstances.trim() || creditRating) filledFields++;
    return Math.round((filledFields / totalFields) * 100);
  };

  const progress = calculateProgress();
  const currentStep = Math.ceil((progress / 100) * 5) || 1;

  const handleLocationChange = async (value: string) => {
    setLocation(value);
    if (value.trim().length > 2) {
      try {
        // Use Nominatim (OpenStreetMap) for free location autocomplete - no API key needed
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            value
          )}&countrycodes=us&limit=10`
        );
        const data = await response.json();
        
        if (data && data.length > 0) {
          const suggestions = data
            .map((result: any) => {
              // Parse display_name to extract city and state
              // Format is typically: "City, County, State, Country"
              const parts = result.display_name.split(',').map((p: string) => p.trim());
              
              // Find the state (second to last part before "United States")
              let city = parts[0];
              let state = '';
              
              // Look for state abbreviation or full name
              for (let i = parts.length - 1; i >= 0; i--) {
                if (parts[i] === 'United States') continue;
                // Check if it's a US state (2 letter code or full name)
                if (parts[i].length === 2 || ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'].includes(parts[i])) {
                  state = parts[i];
                  break;
                }
              }
              
              return city && state ? `${city}, ${state}` : null;
            })
            .filter((s: string | null) => s !== null && s.includes(','))
            .slice(0, 10);
          
          setFilteredSuggestions(Array.from(new Set(suggestions)));
          setShowSuggestions(true);
        }
      } catch (error) {
        console.error('Error fetching location suggestions:', error);
      }
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSelectLocation = (selectedLocation: string) => {
    setLocation(selectedLocation);
    setShowSuggestions(false);
  };

  const handleToggleChallenge = (id: string) => {
    setCreditChallenges((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleToggleHousingType = (id: string) => {
    setHousingTypes((prev) =>
      prev.includes(id) ? prev.filter((h) => h !== id) : [...prev, id]
    );
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!fullName.trim()) newErrors.fullName = "Full name is required";
    if (!email.trim()) newErrors.email = "Email is required";
    if (email.trim() && !email.includes("@")) newErrors.email = "Please enter a valid email address";
    if (!location.trim()) newErrors.location = "Location is required";
    if (creditChallenges.length === 0) newErrors.creditChallenges = "Please select at least one credit challenge";
    if (housingTypes.length === 0) newErrors.housingTypes = "Please select at least one housing type";
    if (!bedrooms) newErrors.bedrooms = "Please select number of bedrooms";
    if (!criminalHistory) newErrors.criminalHistory = "Please select your criminal history status";
    if (!evictions) newErrors.evictions = "Please select number of evictions";
    if (!petPreference) newErrors.petPreference = "Please select pet preference";
    if (!smokingStatus) newErrors.smokingStatus = "Please select smoking status";
    if (!moveInTimeline) newErrors.moveInTimeline = "Please select move-in timeline";
    if (!income.trim()) newErrors.income = "Annual income is required";
    if (!monthlyBudget.trim()) newErrors.monthlyBudget = "Monthly rental budget is required";
    if (!monthlyIncome.trim()) newErrors.monthlyIncome = "Household monthly income is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFieldBlur = (fieldName: string) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    const isValid = validateFieldValue(fieldName);
    if (isValid) {
      setSuccessFields(prev => ({ ...prev, [fieldName]: true }));
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  const validateFieldValue = (fieldName: string): boolean => {
    if (fieldName === 'fullName') return fullName.trim().length > 0;
    if (fieldName === 'email') return email.trim().length > 0 && email.includes("@");
    if (fieldName === 'location') return location.trim().length > 0;
    if (fieldName === 'income') return income.trim().length > 0 && !isNaN(parseFloat(income));
    if (fieldName === 'monthlyBudget') return monthlyBudget.trim().length > 0 && !isNaN(parseFloat(monthlyBudget));
    if (fieldName === 'monthlyIncome') return monthlyIncome.trim().length > 0 && !isNaN(parseFloat(monthlyIncome));
    return false;
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    
    try {
      // Parse location to extract city and state
      const locationParts = location.split(',').map(p => p.trim());
      const city = locationParts[0];
      const state = locationParts[1] || '';
      
      // Map form values to tRPC input
      const searchInput = {
        customerName: fullName,
        customerEmail: email,
        city,
        state,
        searchRadiusMiles: searchRadius,
        creditChallenges,
        housingType: housingTypes[0] || 'apartment',
        bedrooms: parseInt(bedrooms),
        occupants: 1,
        totalHouseholdIncome: income,
        monthlyTakeHomeIncome: monthlyBudget,
        employmentDuration: moveInTimeline || 'asap',
        needsMovingLoan: 'no' as const,
        additionalInfo: personalCircumstances,
        criminalHistoryDetails,
        personalCircumstances,
        canPaySecurityDeposit: (canPaySecurityDeposit || 'unsure') as 'yes' | 'no' | 'unsure',
        creditRating: (creditRating || 'good') as 'poor' | 'fair' | 'good' | 'very_good' | 'excellent',
      };
      
      // Submit the search form
      const result = await searchSubmitMutation.mutateAsync(searchInput);
      
      // Store submission data for results page
      sessionStorage.setItem(
        "searchFormData",
        JSON.stringify({
          fullName,
          email,
          location,
          creditChallenges,
          housingTypes,
          bedrooms: parseInt(bedrooms),
          criminalHistory,
          criminalHistoryDetails,
          evictions,
          income,
          monthlyBudget,
          monthlyIncome,
          personalCircumstances,
          canPaySecurityDeposit,
          creditRating,
        })
      );
      
      // Track form submission (non-blocking)
      try {
        const formSubmissionData = {
          fullName,
          email,
          location,
          creditChallenges,
          housingTypes,
          bedrooms: parseInt(bedrooms),
          criminalHistory,
          evictions,
          income,
          monthlyBudget,
          monthlyIncome,
        };
        
        await fetch('/api/form-submission', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formSubmissionData),
        }).catch(() => {});
      } catch (error) {
        console.error('Form submission tracking error:', error);
      }
      
      // Navigate to results page with order ID
      navigate(`/results/${result.orderId}`);
    } catch (error) {
      console.error('Search submission error:', error);
      toast.error("Failed to submit search. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Hero Section with Search Bar */}
      <section className="relative py-8 md:py-12 lg:py-16 px-3 sm:px-4 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
        </div>

        {/* Background Images Grid */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-15">
          <div className="grid grid-cols-4 gap-4 p-4 h-full">
            <div className="rounded-lg overflow-hidden">
              <img src="/apartment-1.jpg" alt="Apartment" className="w-full h-full object-cover" />
            </div>
            <div className="rounded-lg overflow-hidden">
              <img src="/house-1.jpg" alt="House" className="w-full h-full object-cover" />
            </div>
            <div className="rounded-lg overflow-hidden">
              <img src="/apartment-2.jpg" alt="Apartment" className="w-full h-full object-cover" />
            </div>
            <div className="rounded-lg overflow-hidden">
              <img src="/apartment-3.jpg" alt="Apartment" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>

        <div className="container max-w-4xl relative z-10 px-2 sm:px-4">
          {/* Hero Headline */}
            <div className="text-center mb-6 md:mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-blue-900 border border-blue-700 mb-6">
              <Zap className="w-4 h-4 text-white" />
              <span className="text-xs sm:text-sm font-semibold text-white">Advanced AI Technology</span>
            </div>

          </div>

          {/* Merged Images & Text Section */}
          <div className="mb-6 md:mb-8 grid md:grid-cols-2 gap-6 items-center">
            {/* Images Column */}
            <div className="order-2 md:order-1 grid grid-cols-2 gap-3 md:gap-4">
              <div className="rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow col-span-2">
                <img src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663281720582/fauEgbBjPqqzWwFB.jpg" alt="Apartment Complex" className="w-full h-32 sm:h-40 md:h-48 object-cover" />
              </div>
              <div className="rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                <img src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663281720582/idQVbSvMbBUettev.jpg" alt="House for Rent" className="w-full h-32 sm:h-40 object-cover" />
              </div>
              <div className="rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                <img src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663281720582/BjyYnLuAOZHqdIOX.jpg" alt="Townhome" className="w-full h-32 sm:h-40 object-cover" />
              </div>
            </div>

            {/* Text Column */}
            <div className="order-1 md:order-2 p-4 sm:p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
              <div className="flex items-start gap-3 mb-4">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-10 h-10 rounded-lg bg-blue-900 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-white animate-pulse" />
                  </div>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-black">AI-Powered Housing Search - FREE</h3>
              </div>
              <p className="text-black text-sm sm:text-base leading-relaxed mb-3">
                SecondChanceHousingLocator.com is the first and only Advanced AI Powered Search Engine for Credit Challenged Renters who may have credit issues such as Evictions, Broken Leases, Low Credit Score, Bankruptcy, Loan Defaults, and more. After you submit your exact rental profile details below, the Advanced AI Search Engine generates a customized list of real-time local Second Chance Housing Rentals, Second Chance Apartments, Second Chance Programs, Second Chance Private Landlords, and/or Corporate Leasing Programs that will APPROVE your rental application based on the details listed on your rental profile.
              </p>
              <div className="bg-white border-l-4 border-green-500 p-3 rounded">
                <p className="text-xs font-semibold text-black mb-1">✓ Your personalized rental list is FREE</p>
              </div>
            </div>
          </div>

          {/* Trust Indicators */}
          <TrustIndicators />

          {/* Social Proof Badges */}
          <SocialProofBadges />

          {/* Advanced Search Card - Full Form Visible */}
          <Card className="glass border-cyan-500/20 shadow-2xl mb-8 md:mb-12 overflow-hidden">
            <CardContent className="p-0">
              {/* Header */}
              <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border-b border-cyan-500/20 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                    <Radar className="w-5 h-5 text-cyan-400 animate-spin" style={{ animationDuration: "3s" }} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">Rental Profile Form</h2>
                    <p className="text-xs text-blue-900 font-semibold">Advanced Search, Scanning at maximum speed</p>
                  </div>
                </div>
                <p className="text-sm text-foreground mb-3 mt-4">Provide your Rental Profile Details Below and our Advanced AI Search tool will match your rental profile to local rental properties, private landlords, and second chance programs that are likely to approve your rental application.</p>
                  <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded">
                  <p className="text-xs font-semibold text-foreground">✓ Your personalized rental list is FREE. We accept donations to support our mission to give all renters access to quality housing regardless of their financial or credit background. We believe everyone deserves a Second Chance.</p>
                </div>
              </div>

              {/* Progress Indicator */}
              <div className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-cyan-500/20 px-4 sm:px-6 md:px-8 py-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs sm:text-sm font-semibold text-blue-900 uppercase tracking-wider">Form Progress</h3>
                  <span className="text-xs sm:text-sm font-bold text-blue-900">Step {currentStep} of 5</span>
                </div>
                <div className="w-full bg-gray-300 rounded-full h-2 overflow-hidden">
                  <div className="bg-gradient-to-r from-cyan-500 to-blue-600 h-full rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                </div>
                <p className="text-xs text-gray-600 mt-2">{progress}% Complete</p>
              </div>

              {/* Form Content - All Fields Visible */}
              <form onSubmit={handleSearch} className="p-4 sm:p-6 md:p-8 space-y-5 sm:space-y-6">
                {/* Name and Email Section */}
                <div className="space-y-4">
                  <h3 className="text-xs sm:text-sm font-semibold text-blue-900 uppercase tracking-wider">Your Information</h3>
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded mb-4">
                    <p className="text-xs font-medium text-foreground">We need your name and email to send you your personalized Second Chance Housing List and to prevent abuse on our platform. Your information is secure and will never be shared.</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="form-field-wrapper relative">
                      <Label htmlFor="fullName" className="text-xs sm:text-sm font-medium mb-2 block text-foreground">
                        Full Name
                      </Label>
                      <div className="relative">
                        <Input
                          id="fullName"
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          onBlur={() => handleFieldBlur('fullName')}
                          placeholder="John Smith (First and Last Name)"
                          className={`h-10 sm:h-11 bg-white border-cyan-500/30 text-black text-sm placeholder:text-gray-400 pr-10 ${errors.fullName && touched.fullName ? 'field-error' : ''}`}
                          disabled={isLoading}
                        />
                        <ValidationFeedback
                          isValid={successFields.fullName}
                          isTouched={touched.fullName}
                          hasError={!!errors.fullName}
                        />
                      </div>
                      <FormFieldError error={errors.fullName} touched={touched.fullName} />
                    </div>
                    <div className="form-field-wrapper">
                      <Label htmlFor="email" className="text-xs sm:text-sm font-medium mb-2 block text-foreground">
                        Email Address
                      </Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="relative">
                              <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onBlur={() => handleFieldBlur('email')}
                                placeholder="Enter your email address"
                                className={`h-10 sm:h-11 bg-white border-cyan-500/30 text-black text-sm placeholder:text-gray-400 cursor-help pr-10 ${errors.email && touched.email ? 'field-error' : ''}`}
                                disabled={isLoading}
                              />
                              <ValidationFeedback
                                isValid={successFields.email}
                                isTouched={touched.email}
                                hasError={!!errors.email}
                              />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="bg-blue-900 text-white border-blue-700">
                            <div className="text-sm font-medium">Email Format Required</div>
                            <div className="text-xs mt-1">Example: john.smith@email.com</div>
                            <div className="text-xs mt-1">Format: yourname@domain.com</div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <FormFieldError error={errors.email} touched={touched.email} />
                    </div>
                  </div>
                </div>

                {/* Location with Autocomplete */}
                <div className="space-y-4">
                  <h3 className="text-xs sm:text-sm font-semibold text-blue-900 uppercase tracking-wider">Location</h3>
                  <div className="relative">
                    <Label htmlFor="location" className="text-xs sm:text-sm font-medium mb-1 block text-foreground">
                      Desired Move-In Location
                    </Label>
                    <p className="text-xs text-muted-foreground mb-2">Enter the city and state where you are seeking housing</p>
                    <Input
                      ref={locationInputRef}
                      id="location"
                      type="text"
                      value={location}
                      onChange={(e) => handleLocationChange(e.target.value)}
                      onFocus={() => location && setShowSuggestions(true)}
                      placeholder="Atlanta, Georgia"
                      className="h-10 sm:h-10 sm:h-11 bg-white border-cyan-500/30 text-black text-sm text-sm placeholder:text-gray-400"
                      disabled={isLoading}
                      autoComplete="off"
                    />
                    
                    {/* Location Suggestions Dropdown */}
                    {showSuggestions && filteredSuggestions.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-cyan-500/30 rounded-lg shadow-lg z-50">
                        {filteredSuggestions.map((suggestion, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSelectLocation(suggestion)}
                            className="w-full text-left px-4 py-2.5 text-gray-300 hover:bg-cyan-500/20 hover:text-cyan-300 transition-colors first:rounded-t-lg last:rounded-b-lg"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Search Radius Slider */}
                  {location && (
                    <div className="mt-6 space-y-3">
                      <Label className="text-xs sm:text-sm font-medium text-foreground">
                        How many miles from your desired rental property city would you like to include in your rental property search?
                      </Label>
                      <div className="flex items-center gap-4">
                        <input
                          type="range"
                          min="1"
                          max="100"
                          value={searchRadius}
                          onChange={(e) => setSearchRadius(Number(e.target.value))}
                          className="flex-1 h-2 bg-cyan-500/20 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                        />
                        <div className="min-w-fit">
                          <span className="text-lg font-semibold text-cyan-400">{searchRadius}</span>
                          <span className="text-sm text-gray-400 ml-1">miles</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 mt-2">
                        Searching within {searchRadius} miles of {location}
                      </p>
                    </div>
                  )}
                </div>

                {/* Credit Challenges */}
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-xs sm:text-sm font-semibold text-blue-900 uppercase tracking-wider">Credit Challenges</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                    {CREDIT_CHALLENGES.map((challenge) => (
                      <div key={challenge.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={challenge.id}
                          checked={creditChallenges.includes(challenge.id)}
                          onCheckedChange={() => handleToggleChallenge(challenge.id)}
                          className="border-cyan-500/50"
                        />
                        <Label htmlFor={challenge.id} className="text-xs sm:text-sm font-normal cursor-pointer text-foreground">
                          {challenge.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Housing Type - Multiple Choice */}
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-xs sm:text-sm font-semibold text-blue-900 uppercase tracking-wider">Housing Type (Select All That Apply)</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
                    {HOUSING_TYPES.map((type) => (
                      <div key={type.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={type.id}
                          checked={housingTypes.includes(type.id)}
                          onCheckedChange={() => handleToggleHousingType(type.id)}
                          className="border-cyan-500/50"
                        />
                        <Label htmlFor={type.id} className="text-xs sm:text-sm font-normal cursor-pointer text-foreground">
                          {type.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bedrooms */}
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-xs sm:text-sm font-semibold text-blue-900 uppercase tracking-wider">Bedrooms</h3>
                  <select
                    value={bedrooms}
                    onChange={(e) => setBedrooms(e.target.value)}
                    onBlur={() => handleFieldBlur('bedrooms')}
                    className={`h-10 sm:h-11 w-full bg-white border text-black text-sm rounded-md px-3 py-2 focus:outline-none focus:ring-2 ${
                      errors.bedrooms && touched.bedrooms
                        ? 'border-red-500 focus:ring-red-500/50'
                        : 'border-cyan-500/30 focus:ring-cyan-500/50'
                    }`}
                    disabled={isLoading}
                  >
                    <option value="">Select number of bedrooms</option>
                    {[1, 2, 3, 4, 5].map((num) => (
                      <option key={num} value={num.toString()}>
                        {num} {num === 1 ? "Bedroom" : "Bedrooms"}
                      </option>
                    ))}
                  </select>
                  <FormFieldError error={errors.bedrooms} touched={touched.bedrooms} />
                </div>

                {/* Criminal History */}
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-xs sm:text-sm font-semibold text-blue-900 uppercase tracking-wider">Criminal History</h3>
                  <select
                    value={criminalHistory}
                    onChange={(e) => setCriminalHistory(e.target.value)}
                    onBlur={() => handleFieldBlur('criminalHistory')}
                    className={`h-10 sm:h-11 w-full bg-white border text-black text-sm rounded-md px-3 py-2 focus:outline-none focus:ring-2 ${
                      errors.criminalHistory && touched.criminalHistory
                        ? 'border-red-500 focus:ring-red-500/50'
                        : 'border-cyan-500/30 focus:ring-cyan-500/50'
                    }`}
                    disabled={isLoading}
                  >
                    <option value="">Select criminal history status</option>
                    {CRIMINAL_HISTORY_OPTIONS.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <FormFieldError error={errors.criminalHistory} touched={touched.criminalHistory} />
                </div>

                {/* Criminal Background Explanation - Show if criminal history selected */}
                {criminalHistory && criminalHistory !== 'none' && (
                  <div className="space-y-3 sm:space-y-4">
                    <h3 className="text-xs sm:text-sm font-semibold text-blue-900 uppercase tracking-wider">Explain Your Criminal Background</h3>
                    <textarea
                      value={criminalBackgroundExplanation}
                      onChange={(e) => setCriminalBackgroundExplanation(e.target.value)}
                      placeholder="Please provide details about your criminal background (optional)"
                      className="w-full h-20 sm:h-24 p-2 sm:p-3 bg-white border border-cyan-500/30 text-black text-sm rounded-md placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                      disabled={isLoading}
                    />
                  </div>
                )}

                {/* Registered Sex Offender Question */}
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-xs sm:text-sm font-semibold text-blue-900 uppercase tracking-wider">Are you a registered Sex Offender?</h3>
                  <div className="flex gap-4 sm:gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="sexOffender"
                        value="yes"
                        checked={isRegisteredSexOffender === 'yes'}
                        onChange={(e) => setIsRegisteredSexOffender(e.target.value)}
                        disabled={isLoading}
                        className="w-4 h-4"
                      />
                      <span className="text-xs sm:text-sm text-foreground">Yes</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="sexOffender"
                        value="no"
                        checked={isRegisteredSexOffender === 'no'}
                        onChange={(e) => setIsRegisteredSexOffender(e.target.value)}
                        disabled={isLoading}
                        className="w-4 h-4"
                      />
                      <span className="text-xs sm:text-sm text-foreground">No</span>
                    </label>
                  </div>
                </div>

                {/* Evictions in Last 5 Years */}
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-xs sm:text-sm font-semibold text-blue-900 uppercase tracking-wider">Evictions in Last 5 Years</h3>
                  <select
                    value={evictions}
                    onChange={(e) => setEvictions(e.target.value)}
                    onBlur={() => handleFieldBlur('evictions')}
                    className={`h-10 sm:h-11 w-full bg-white border text-black text-sm rounded-md px-3 py-2 focus:outline-none focus:ring-2 ${
                      errors.evictions && touched.evictions
                        ? 'border-red-500 focus:ring-red-500/50'
                        : 'border-cyan-500/30 focus:ring-cyan-500/50'
                    }`}
                    disabled={isLoading}
                  >
                    <option value="">Select number of evictions</option>
                    {EVICTION_OPTIONS.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <FormFieldError error={errors.evictions} touched={touched.evictions} />
                </div>

                {/* Annual Income */}
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-xs sm:text-sm font-semibold text-blue-900 uppercase tracking-wider">Annual Income</h3>
                  <div>
                    <Label htmlFor="income" className="text-xs sm:text-sm font-medium mb-2 block text-foreground">
                      Annual Income ($)
                    </Label>
                    <div className="relative">
                      <Input
                        id="income"
                        type="text"
                        value={income}
                        onChange={(e) => {
                          // Format with commas as user types
                          const formatted = formatNumberWithCommas(e.target.value);
                          setIncome(formatted);
                        }}
                        onBlur={() => handleFieldBlur('income')}
                        placeholder="30,000"
                        className="h-10 sm:h-11 bg-white border-cyan-500/30 text-black text-sm placeholder:text-gray-400 pr-10"
                        disabled={isLoading}
                      />
                      <ValidationFeedback
                        isValid={successFields.income}
                        isTouched={touched.income}
                        hasError={!!errors.income}
                      />
                    </div>
                    <FormFieldError error={errors.income} touched={touched.income} />
                  </div>
                </div>

                {/* Monthly Rental Budget */}
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-xs sm:text-sm font-semibold text-blue-900 uppercase tracking-wider">Monthly Rental Budget</h3>
                  <div>
                    <Label htmlFor="monthlyBudget" className="text-xs sm:text-sm font-medium mb-2 block text-foreground">
                      What is your monthly rental budget?
                    </Label>
                    <div className="relative">
                      <Input
                        id="monthlyBudget"
                        type="text"
                        value={monthlyBudget}
                        onChange={(e) => {
                          // Format with commas as user types
                          const formatted = formatNumberWithCommas(e.target.value);
                          setMonthlyBudget(formatted);
                        }}
                        onBlur={() => handleFieldBlur('monthlyBudget')}
                        placeholder="1,500"
                        className="h-10 sm:h-11 bg-white border-cyan-500/30 text-black text-sm placeholder:text-gray-400 pr-10"
                        disabled={isLoading}
                      />
                      <ValidationFeedback
                        isValid={successFields.monthlyBudget}
                        isTouched={touched.monthlyBudget}
                        hasError={!!errors.monthlyBudget}
                      />
                    </div>
                    <FormFieldError error={errors.monthlyBudget} touched={touched.monthlyBudget} />
                  </div>
                </div>

                {/* Pet Preference */}
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-xs sm:text-sm font-semibold text-blue-900 uppercase tracking-wider">Pet Preference</h3>
                  <select
                    value={petPreference}
                    onChange={(e) => setPetPreference(e.target.value)}
                    onBlur={() => handleFieldBlur('petPreference')}
                    className={`h-10 sm:h-11 w-full bg-white border text-black text-sm rounded-md px-3 py-2 focus:outline-none focus:ring-2 ${
                      errors.petPreference && touched.petPreference
                        ? 'border-red-500 focus:ring-red-500/50'
                        : 'border-cyan-500/30 focus:ring-cyan-500/50'
                    }`}
                    disabled={isLoading}
                  >
                    <option value="">Select pet preference</option>
                    {PET_OPTIONS.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <FormFieldError error={errors.petPreference} touched={touched.petPreference} />
                </div>

                {/* Smoking Status */}
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-xs sm:text-sm font-semibold text-blue-900 uppercase tracking-wider">Smoking Status</h3>
                  <select
                    value={smokingStatus}
                    onChange={(e) => setSmokingStatus(e.target.value)}
                    onBlur={() => handleFieldBlur('smokingStatus')}
                    className={`h-10 sm:h-11 w-full bg-white border text-black text-sm rounded-md px-3 py-2 focus:outline-none focus:ring-2 ${
                      errors.smokingStatus && touched.smokingStatus
                        ? 'border-red-500 focus:ring-red-500/50'
                        : 'border-cyan-500/30 focus:ring-cyan-500/50'
                    }`}
                    disabled={isLoading}
                  >
                    <option value="">Select smoking status</option>
                    {SMOKING_OPTIONS.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <FormFieldError error={errors.smokingStatus} touched={touched.smokingStatus} />
                </div>

                {/* Move-In Timeline */}
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-xs sm:text-sm font-semibold text-blue-900 uppercase tracking-wider">Move-In Timeline</h3>
                  <select
                    value={moveInTimeline}
                    onChange={(e) => setMoveInTimeline(e.target.value)}
                    onBlur={() => handleFieldBlur('moveInTimeline')}
                    className={`h-10 sm:h-11 w-full bg-white border text-black text-sm rounded-md px-3 py-2 focus:outline-none focus:ring-2 ${
                      errors.moveInTimeline && touched.moveInTimeline
                        ? 'border-red-500 focus:ring-red-500/50'
                        : 'border-cyan-500/30 focus:ring-cyan-500/50'
                    }`}
                    disabled={isLoading}
                  >
                    <option value="">Select move-in timeline</option>
                    {MOVE_IN_TIMELINE.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <FormFieldError error={errors.moveInTimeline} touched={touched.moveInTimeline} />
                </div>

                {/* Household Monthly Income */}
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-xs sm:text-sm font-semibold text-blue-900 uppercase tracking-wider">Household Monthly Income</h3>
                  <div>
                    <Label htmlFor="monthlyIncome" className="text-xs sm:text-sm font-medium mb-2 block text-foreground">
                      What is the collective income of your household members and income sources?
                    </Label>
                    <div className="relative">
                      <Input
                        id="monthlyIncome"
                        type="text"
                        value={monthlyIncome}
                        onChange={(e) => {
                          // Format with commas as user types
                          const formatted = formatNumberWithCommas(e.target.value);
                          setMonthlyIncome(formatted);
                        }}
                        onBlur={() => handleFieldBlur('monthlyIncome')}
                        placeholder="65,000"
                        className="h-10 sm:h-11 bg-white border-cyan-500/30 text-black text-sm placeholder:text-gray-400 pr-10"
                        disabled={isLoading}
                      />
                      <ValidationFeedback
                        isValid={successFields.monthlyIncome}
                        isTouched={touched.monthlyIncome}
                        hasError={!!errors.monthlyIncome}
                      />
                    </div>
                    <FormFieldError error={errors.monthlyIncome} touched={touched.monthlyIncome} />
                  </div>
                </div>

                {/* Criminal History Details - Only show if user has criminal history */}
                {criminalHistory === "yes" && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <h3 className="text-xs sm:text-sm font-semibold text-blue-900 uppercase tracking-wider">Criminal History Details</h3>
                  <div>
                    <Label htmlFor="criminalHistoryDetails" className="text-xs sm:text-sm font-medium mb-2 block text-foreground">
                      Please provide details about your criminal history (optional)
                    </Label>
                    <p className="text-xs text-muted-foreground mb-2">If applicable, describe the offense, when it occurred, and any rehabilitation efforts</p>
                    <textarea
                      id="criminalHistoryDetails"
                      value={criminalHistoryDetails}
                      onChange={(e) => setCriminalHistoryDetails(e.target.value)}
                      placeholder="e.g., Misdemeanor in 2018, completed community service in 2019..."
                      className="w-full h-24 sm:h-28 p-3 bg-white border border-cyan-500/30 rounded-md text-black text-sm placeholder:text-gray-400 focus:outline-none focus:border-cyan-500"
                      disabled={isLoading}
                    />
                  </div>
                </div>
                )}

                {/* Personal Circumstances */}
                <div className="space-y-4">
                  <h3 className="text-xs sm:text-sm font-semibold text-blue-900 uppercase tracking-wider">Personal Circumstances</h3>
                  <div>
                    <Label htmlFor="personalCircumstances" className="text-xs sm:text-sm font-medium mb-2 block text-foreground">
                      Additional Information for Advanced AI Search Engine Consideration (Optional)
                    </Label>
                    <p className="text-xs text-muted-foreground mb-2">Share any other relevant details about your situation that could help in your housing search</p>
                    <textarea
                      id="personalCircumstances"
                      value={personalCircumstances}
                      onChange={(e) => setPersonalCircumstances(e.target.value)}
                      placeholder="e.g., Recently employed, working with social services, family support available, etc."
                      className="w-full h-24 sm:h-28 p-3 bg-white border border-cyan-500/30 rounded-md text-black text-sm placeholder:text-gray-400 focus:outline-none focus:border-cyan-500"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Security Deposit Question */}
                <div className="space-y-4">
                  <h3 className="text-xs sm:text-sm font-semibold text-blue-900 uppercase tracking-wider">Security Deposit</h3>
                  <div className="space-y-3">
                    <Label className="text-xs sm:text-sm font-medium text-foreground">
                      Can you pay a security deposit equal to 1 month's rent if required?
                    </Label>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setCanPaySecurityDeposit("yes")}
                        className={`flex-1 py-2.5 px-3 rounded-md text-sm font-medium transition-colors ${canPaySecurityDeposit === "yes" ? "bg-green-500 text-white border border-green-600" : "bg-white border border-cyan-500/30 text-black hover:bg-cyan-50"}`}
                        disabled={isLoading}
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        onClick={() => setCanPaySecurityDeposit("no")}
                        className={`flex-1 py-2.5 px-3 rounded-md text-sm font-medium transition-colors ${canPaySecurityDeposit === "no" ? "bg-red-500 text-white border border-red-600" : "bg-white border border-cyan-500/30 text-black hover:bg-cyan-50"}`}
                        disabled={isLoading}
                      >
                        No
                      </button>
                      <button
                        type="button"
                        onClick={() => setCanPaySecurityDeposit("unsure")}
                        className={`flex-1 py-2.5 px-3 rounded-md text-sm font-medium transition-colors ${canPaySecurityDeposit === "unsure" ? "bg-yellow-500 text-white border border-yellow-600" : "bg-white border border-cyan-500/30 text-black hover:bg-cyan-50"}`}
                        disabled={isLoading}
                      >
                        Unsure
                      </button>
                    </div>
                  </div>
                </div>

                {/* Credit Rating */}
                <div className="space-y-4">
                  <h3 className="text-xs sm:text-sm font-semibold text-blue-900 uppercase tracking-wider">What is your credit rating?</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {[
                      { value: "poor", label: "Poor", color: "bg-red-500" },
                      { value: "fair", label: "Fair", color: "bg-orange-500" },
                      { value: "good", label: "Good", color: "bg-yellow-500" },
                      { value: "very_good", label: "Very Good", color: "bg-blue-500" },
                      { value: "excellent", label: "Excellent", color: "bg-green-500" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setCreditRating(option.value)}
                        className={`py-2.5 px-2 rounded-md text-xs sm:text-sm font-medium transition-all ${
                          creditRating === option.value
                            ? `${option.color} text-white border-2 border-white shadow-lg`
                            : "bg-white border border-cyan-500/30 text-black hover:bg-cyan-50"
                        }`}
                        disabled={isLoading}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full h-11 sm:h-12 text-sm sm:text-base font-semibold gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg shadow-cyan-500/30 pulse-glow"
                  disabled={isLoading}
                >
                  <Search className="w-5 h-5" />
                  {isLoading ? "Starting AI Search..." : "Start AI Search"}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  ✓ Free to search. We accept donations to support our mission.
                </p>
              </form>
            </CardContent>
          </Card>

          {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 mb-6 md:mb-8 md:mb-8 md:mb-12">
            {[
              { icon: Database, label: "100M+ Records", desc: "Scanned" },
              { icon: Zap, label: "20 Seconds", desc: "Max Speed" },
              { icon: Radar, label: "95% Success", desc: "Approval Rate" },
            ].map((stat, idx) => (
              <div key={idx} className="glass border-cyan-500/20 rounded-lg p-4 text-center">
                <stat.icon className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                <div className="text-base sm:text-lg font-bold text-foreground">{stat.label}</div>
                <div className="text-xs text-muted-foreground">{stat.desc}</div>
              </div>
            ))}
          </div>


        </div>
      </section>


      {/* Expanded FAQ Section */}
      <section className="py-12 md:py-20 bg-white">
        <div className="container max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Common Questions</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Have questions? We have answers. For more details, visit our full FAQ page.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {[
              {
                q: "Is it really free to search?",
                a: "Yes! Searching is completely free. We're donation-supported. You can donate any amount to unlock landlord contact details.",
              },
              {
                q: "What credit challenges do you help with?",
                a: "We help with no credit, low credit, evictions, bankruptcy, broken leases, criminal history, and more.",
              },
              {
                q: "How quickly will I get my results?",
                a: "Our AI compiles your personalized list in seconds. After payment, results are emailed immediately as a PDF.",
              },
              {
                q: "What's your refund policy?",
                a: "We offer a 100% money-back guarantee. If you're not approved within 30 days, we refund you completely.",
              },
            ].map((item, idx) => (
              <div key={idx} className="p-6 border border-cyan-200/50 rounded-lg hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-foreground mb-3 text-lg">{item.q}</h3>
                <p className="text-muted-foreground">{item.a}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Button 
              variant="outline" 
              className="border-cyan-500 text-cyan-600 hover:bg-cyan-50"
              onClick={() => navigate('/faq')}
            >
              View Full FAQ
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-12 md:py-20 bg-gradient-to-b from-white to-cyan-50/30">
        <div className="container max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Success Stories</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Hear from renters who found their perfect home through our AI-powered search service
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: "Sarah Martinez",
                location: "Denver, CO",
                challenge: "Eviction on Record",
                testimonial: "I was devastated after my eviction, thinking I'd never rent again. The AI search found me a landlord willing to work with me. I got approved in just 2 weeks!",
                rating: 5,
              },
              {
                name: "James Chen",
                location: "Austin, TX",
                challenge: "Low Credit Score",
                testimonial: "With a 520 credit score, I thought my options were limited. This service found 50+ properties that would consider me. I'm now in my dream apartment!",
                rating: 5,
              },
              {
                name: "Maria Rodriguez",
                location: "Phoenix, AZ",
                challenge: "Criminal History",
                testimonial: "The consultant was amazing. They helped me understand which properties would be open to my situation and guided me through the entire process. Highly recommend!",
                rating: 5,
              },
              {
                name: "David Thompson",
                location: "Atlanta, GA",
                challenge: "Multiple Evictions",
                testimonial: "I had 2 evictions and thought I was done. The AI found programs specifically designed for people like me. I'm grateful for this service.",
                rating: 5,
              },
              {
                name: "Lisa Wong",
                location: "Portland, OR",
                challenge: "Bankruptcy",
                testimonial: "After bankruptcy, I was lost. This service showed me there were still options available. The personalized list was incredibly helpful and thorough.",
                rating: 5,
              },
              {
                name: "Robert Jackson",
                location: "Miami, FL",
                challenge: "No Credit History",
                testimonial: "As a young adult with no credit, I didn't know where to start. The AI search found me several options and I got approved within 3 weeks!",
                rating: 5,
              },
            ].map((testimonial, idx) => (
              <Card key={idx} className="border-cyan-200/50 hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <span key={i} className="text-yellow-400">★</span>
                    ))}
                  </div>
                  <p className="text-foreground mb-4 italic">"{testimonial.testimonial}"</p>
                  <div className="border-t border-cyan-100 pt-4">
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                    <p className="text-xs text-cyan-600 font-medium mt-2">Challenge: {testimonial.challenge}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* AI Chatbot Widget */}
      <AIChatbot />

      <Footer />
    </div>
  );
}
