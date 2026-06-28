import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapView } from "@/components/Map";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  ArrowRight, ArrowLeft, MapPin, User, Home as HomeIcon,
  Briefcase, MessageSquare, CheckCircle2
} from "lucide-react";
import {
  CREDIT_CHALLENGES,
  HOUSING_TYPES,
  EMPLOYMENT_DURATIONS,
  LOAN_OPTIONS,
} from "@shared/types";

const STEPS = [
  { id: 1, title: "Your Information", icon: User },
  { id: 2, title: "Location & Range", icon: MapPin },
  { id: 3, title: "Credit Challenges", icon: CheckCircle2 },
  { id: 4, title: "Housing Details", icon: HomeIcon },
  { id: 5, title: "Employment & Income", icon: Briefcase },
  { id: 6, title: "Additional Info", icon: MessageSquare },
];

export default function SearchForm() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  const mapRef = useRef<google.maps.Map | null>(null);
  const circleRef = useRef<google.maps.Circle | null>(null);
  const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Form state
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [searchRadius, setSearchRadius] = useState([25]);
  const [creditChallenges, setCreditChallenges] = useState<string[]>([]);
  const [housingType, setHousingType] = useState("");
  const [bedrooms, setBedrooms] = useState("2");
  const [occupants, setOccupants] = useState("2");
  const [totalHouseholdIncome, setTotalHouseholdIncome] = useState("");
  const [monthlyTakeHomeIncome, setMonthlyTakeHomeIncome] = useState("");
  const [employmentDuration, setEmploymentDuration] = useState("");
  const [needsMovingLoan, setNeedsMovingLoan] = useState<"yes" | "no" | "maybe">("no");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [mapCenter, setMapCenter] = useState({ lat: 39.8283, lng: -98.5795 });
  const [locationSelected, setLocationSelected] = useState(false);

  const submitMutation = trpc.search.submit.useMutation({
    onSuccess: (data) => {
      sessionStorage.setItem("searchData", JSON.stringify({
        submissionId: data.submissionId,
        orderId: data.orderId,
        aiSummary: data.aiSummary,
        customerName,
        customerEmail,
        city,
        state,
        searchRadius: searchRadius[0],
        creditChallenges,
      }));
      setLocation("/searching");
    },
    onError: (error) => {
      toast.error("Failed to submit search. Please try again.");
    },
  });

  const handleMapReady = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    map.setZoom(4);
    map.setCenter({ lat: 39.8283, lng: -98.5795 });

    // Set up Places Autocomplete
    if (inputRef.current && window.google) {
      autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
        types: ["(cities)"],
        componentRestrictions: { country: "us" },
      });

      autocompleteRef.current.addListener("place_changed", () => {
        const place = autocompleteRef.current?.getPlace();
        if (place?.geometry?.location) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          setMapCenter({ lat, lng });
          setLocationSelected(true);

          // Extract city and state
          const addressComponents = place.address_components || [];
          let cityName = "";
          let stateName = "";
          for (const component of addressComponents) {
            if (component.types.includes("locality")) {
              cityName = component.long_name;
            }
            if (component.types.includes("administrative_area_level_1")) {
              stateName = component.long_name;
            }
          }
          setCity(cityName || place.name || "");
          setState(stateName);

          map.setCenter({ lat, lng });
          map.setZoom(10);

          // Update marker
          if (markerRef.current) {
            markerRef.current.position = { lat, lng };
          } else {
            markerRef.current = new google.maps.marker.AdvancedMarkerElement({
              map,
              position: { lat, lng },
              title: cityName,
            });
          }

          // Update circle
          updateCircle(map, { lat, lng }, searchRadius[0]);
        }
      });
    }
  }, [searchRadius]);

  const updateCircle = useCallback((map: google.maps.Map, center: { lat: number; lng: number }, radiusMiles: number) => {
    const radiusMeters = radiusMiles * 1609.34;
    if (circleRef.current) {
      circleRef.current.setCenter(center);
      circleRef.current.setRadius(radiusMeters);
    } else {
      circleRef.current = new google.maps.Circle({
        map,
        center,
        radius: radiusMeters,
        fillColor: "#3b82f6",
        fillOpacity: 0.1,
        strokeColor: "#3b82f6",
        strokeOpacity: 0.4,
        strokeWeight: 2,
      });
    }
  }, []);

  useEffect(() => {
    if (mapRef.current && locationSelected) {
      updateCircle(mapRef.current, mapCenter, searchRadius[0]);
    }
  }, [searchRadius, mapCenter, locationSelected, updateCircle]);

  const toggleCreditChallenge = (challenge: string) => {
    setCreditChallenges((prev) =>
      prev.includes(challenge)
        ? prev.filter((c) => c !== challenge)
        : [...prev, challenge]
    );
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return customerName.trim() !== "" && customerEmail.trim() !== "" && customerEmail.includes("@");
      case 2:
        return city.trim() !== "" && state.trim() !== "" && locationSelected;
      case 3:
        return creditChallenges.length > 0;
      case 4:
        return housingType !== "";
      case 5:
        return totalHouseholdIncome.trim() !== "" && monthlyTakeHomeIncome.trim() !== "" && employmentDuration !== "";
      case 6:
        return true;
      default:
        return false;
    }
  };

  const handleSubmit = () => {
    submitMutation.mutate({
      customerName,
      customerEmail,
      customerPhone: customerPhone || undefined,
      city,
      state,
      searchRadiusMiles: searchRadius[0],
      creditChallenges,
      housingType,
      bedrooms: parseInt(bedrooms),
      occupants: parseInt(occupants),
      totalHouseholdIncome,
      monthlyTakeHomeIncome,
      employmentDuration,
      needsMovingLoan,
      additionalInfo: additionalInfo || undefined,
    });
  };

  return (
    <Card className="max-w-3xl mx-auto border-0 shadow-xl bg-white">
      <CardContent className="p-6 md:p-8">
        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-8 overflow-x-auto pb-2">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center shrink-0">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                    step === s.id
                      ? "bg-primary text-white shadow-md"
                      : step > s.id
                      ? "bg-green-100 text-green-700"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {step > s.id ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <s.icon className="w-4 h-4" />
                  )}
                </div>
                <span className="text-[10px] mt-1 text-muted-foreground hidden sm:block whitespace-nowrap">
                  {s.title}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`w-8 md:w-12 h-0.5 mx-1 ${
                    step > s.id ? "bg-green-300" : "bg-muted"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Personal Info */}
        {step === 1 && (
          <div className="space-y-5">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-foreground mb-1">Your Information</h3>
              <p className="text-sm text-muted-foreground">Tell us how to reach you with your results.</p>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-sm font-medium mb-1.5 block">Full Name *</Label>
                <Input
                  id="name"
                  placeholder="Enter your full name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="h-11"
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-sm font-medium mb-1.5 block">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="h-11"
                />
              </div>
              <div>
                <Label htmlFor="phone" className="text-sm font-medium mb-1.5 block">Phone Number (Optional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="h-11"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Location & Range */}
        {step === 2 && (
          <div className="space-y-5">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-foreground mb-1">Location & Search Range</h3>
              <p className="text-sm text-muted-foreground">Where would you like to find housing?</p>
            </div>
            <div>
              <Label htmlFor="location" className="text-sm font-medium mb-1.5 block">City, State *</Label>
              <Input
                ref={inputRef}
                id="location"
                placeholder="Start typing a city name..."
                className="h-11"
              />
            </div>
            {locationSelected && (
              <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg">
                <CheckCircle2 className="w-4 h-4" />
                Selected: {city}, {state}
              </div>
            )}
            <div>
              <Label className="text-sm font-medium mb-3 block">
                Search Radius: <span className="text-primary font-semibold">{searchRadius[0]} miles</span>
              </Label>
              <Slider
                value={searchRadius}
                onValueChange={setSearchRadius}
                min={5}
                max={100}
                step={5}
                className="mb-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>5 miles</span>
                <span>100 miles</span>
              </div>
            </div>
            <div className="rounded-xl overflow-hidden border border-border shadow-sm">
              <MapView
                className="h-[280px] md:h-[350px]"
                initialCenter={mapCenter}
                initialZoom={4}
                onMapReady={handleMapReady}
              />
            </div>
          </div>
        )}

        {/* Step 3: Credit Challenges */}
        {step === 3 && (
          <div className="space-y-5">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-foreground mb-1">Credit Challenges</h3>
              <p className="text-sm text-muted-foreground">Select all that apply to you during approval.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
              {CREDIT_CHALLENGES.map((challenge) => (
                <label
                  key={challenge}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    creditChallenges.includes(challenge)
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border hover:border-primary/30 hover:bg-muted/50"
                  }`}
                >
                  <Checkbox
                    checked={creditChallenges.includes(challenge)}
                    onCheckedChange={() => toggleCreditChallenge(challenge)}
                  />
                  <span className="text-sm font-medium text-foreground">{challenge}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Housing Details */}
        {step === 4 && (
          <div className="space-y-5">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-foreground mb-1">Housing Details</h3>
              <p className="text-sm text-muted-foreground">What type of housing are you seeking?</p>
            </div>
            <div>
              <Label className="text-sm font-medium mb-1.5 block">Housing Type *</Label>
              <Select value={housingType} onValueChange={setHousingType}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select housing type" />
                </SelectTrigger>
                <SelectContent>
                  {HOUSING_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium mb-1.5 block">Bedrooms *</Label>
                <Select value={bedrooms} onValueChange={setBedrooms}>
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <SelectItem key={n} value={String(n)}>{n} {n === 1 ? "Bedroom" : "Bedrooms"}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium mb-1.5 block">Occupants *</Label>
                <Select value={occupants} onValueChange={setOccupants}>
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                      <SelectItem key={n} value={String(n)}>{n} {n === 1 ? "Person" : "People"}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Employment & Income */}
        {step === 5 && (
          <div className="space-y-5">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-foreground mb-1">Employment & Income</h3>
              <p className="text-sm text-muted-foreground">Help us find options within your budget.</p>
            </div>
            <div>
              <Label className="text-sm font-medium mb-1.5 block">Total Household Income *</Label>
              <Input
                placeholder="e.g. $45,000/year"
                value={totalHouseholdIncome}
                onChange={(e) => setTotalHouseholdIncome(e.target.value)}
                className="h-11"
              />
            </div>
            <div>
              <Label className="text-sm font-medium mb-1.5 block">Monthly Take-Home Income *</Label>
              <Input
                placeholder="e.g. $3,200/month"
                value={monthlyTakeHomeIncome}
                onChange={(e) => setMonthlyTakeHomeIncome(e.target.value)}
                className="h-11"
              />
            </div>
            <div>
              <Label className="text-sm font-medium mb-1.5 block">Employment Duration *</Label>
              <Select value={employmentDuration} onValueChange={setEmploymentDuration}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="How long at current employer?" />
                </SelectTrigger>
                <SelectContent>
                  {EMPLOYMENT_DURATIONS.map((dur) => (
                    <SelectItem key={dur} value={dur}>{dur}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium mb-3 block">
                Do you need a small loan to help you move in?
              </Label>
              <RadioGroup value={needsMovingLoan} onValueChange={(v) => setNeedsMovingLoan(v as "yes" | "no" | "maybe")}>
                {LOAN_OPTIONS.map((option) => (
                  <div key={option.value} className="flex items-center space-x-3 py-1">
                    <RadioGroupItem value={option.value} id={`loan-${option.value}`} />
                    <Label htmlFor={`loan-${option.value}`} className="text-sm font-normal cursor-pointer">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>
        )}

        {/* Step 6: Additional Info */}
        {step === 6 && (
          <div className="space-y-5">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-foreground mb-1">Additional Information</h3>
              <p className="text-sm text-muted-foreground">
                Provide any other details about your rental housing needs, concerns, or specifics.
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium mb-1.5 block">
                Additional Details (Optional)
              </Label>
              <Textarea
                placeholder="Tell our AI Agent about any specific needs, concerns, or preferences you have for your rental housing search..."
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                rows={6}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Our AI Agent will summarize your input to ensure it includes these details while compiling your second chance housing list.
              </p>
            </div>

            {/* Summary */}
            <div className="bg-muted/50 rounded-xl p-5 space-y-3">
              <h4 className="text-sm font-semibold text-foreground">Search Summary</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-muted-foreground">Name:</div>
                <div className="font-medium text-foreground">{customerName}</div>
                <div className="text-muted-foreground">Email:</div>
                <div className="font-medium text-foreground">{customerEmail}</div>
                <div className="text-muted-foreground">Location:</div>
                <div className="font-medium text-foreground">{city}, {state}</div>
                <div className="text-muted-foreground">Search Radius:</div>
                <div className="font-medium text-foreground">{searchRadius[0]} miles</div>
                <div className="text-muted-foreground">Housing Type:</div>
                <div className="font-medium text-foreground">{housingType}</div>
                <div className="text-muted-foreground">Challenges:</div>
                <div className="font-medium text-foreground">{creditChallenges.join(", ")}</div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-border/50">
          {step > 1 ? (
            <Button
              variant="outline"
              onClick={() => setStep(step - 1)}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          ) : (
            <div />
          )}

          {step < 6 ? (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className="gap-2 shadow-md"
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={submitMutation.isPending}
              className="gap-2 shadow-md bg-green-600 hover:bg-green-700"
            >
              {submitMutation.isPending ? "Submitting..." : "Submit Search"}
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
