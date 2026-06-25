import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";

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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-blue-600">Second Chance Housing List</div>
          <div className="flex gap-6">
            <a href="#how-it-works" className="text-gray-700 hover:text-blue-600">How It Works</a>
            <a href="#faq" className="text-gray-700 hover:text-blue-600">FAQ</a>
            <a href="#apply" className="text-gray-700 hover:text-blue-600">Apply</a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Find Your Second Chance Rental in Minutes
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Search properties from landlords who approve tenants with credit challenges, eviction history, and more
          </p>
          <div className="flex justify-center gap-4">
            <div className="flex items-center gap-2 text-gray-700">
              <span className="text-2xl">✓</span>
              <span>95% Approval Rate</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <span className="text-2xl">✓</span>
              <span>50+ States</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <span className="text-2xl">✓</span>
              <span>Search is Free</span>
            </div>
          </div>
        </div>

        {/* Search Form */}
        <Card className="bg-white shadow-xl p-8 mb-12">
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
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
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg font-semibold"
            >
              Search Properties
              <ChevronRight className="ml-2" />
            </Button>
          </form>
        </Card>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="font-semibold mb-4">About</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#how-it-works" className="hover:text-white">How It Works</a></li>
                <li><a href="#faq" className="hover:text-white">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#contact" className="hover:text-white">Contact Us</a></li>
                <li><a href="#apply" className="hover:text-white">Apply</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#privacy" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#terms" className="hover:text-white">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2026 Second Chance Housing List. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
