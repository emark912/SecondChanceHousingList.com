import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Spinner } from "@/components/ui/spinner";

export default function Searching() {
  const [, navigate] = useLocation();
  const [progress, setProgress] = useState(0);

  const formData = JSON.parse(sessionStorage.getItem("searchFormData") || "{}");

  const searchMutation = trpc.search.properties.useMutation({
    onSuccess: (data) => {
      sessionStorage.setItem("searchResults", JSON.stringify(data));
      navigate("/results");
    },
    onError: (error) => {
      console.error("Search error:", error);
      navigate("/");
    },
  });

  useEffect(() => {
    // Simulate progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return 90;
        return prev + Math.random() * 30;
      });
    }, 300);

    // Execute search
    searchMutation.mutate({
      city: formData.city,
      state: formData.state,
      bedrooms: formData.bedrooms ? parseInt(formData.bedrooms.match(/\d+/)?.[0] || "0") : undefined,
      maxRent: formData.maxRent,
      petFriendly: formData.petFriendly,
      creditChallenges: formData.creditChallenges,
      userEmail: formData.userEmail,
      userName: formData.userName,
      userPhone: formData.userPhone,
    });

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (searchMutation.isSuccess) {
      setProgress(100);
    }
  }, [searchMutation.isSuccess]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
      <div className="text-center">
        <Spinner className="w-16 h-16 mx-auto mb-8 text-blue-600" />
        
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Searching for Your Perfect Home...
        </h1>
        
        <p className="text-xl text-gray-600 mb-8">
          We're looking through landlords in {formData.city}, {formData.state} who match your criteria
        </p>

        {/* Progress Bar */}
        <div className="w-full max-w-md mx-auto bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className="bg-blue-600 h-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="text-gray-500 mt-4 text-sm">
          {Math.round(progress)}% complete
        </p>

        {/* Animated dots */}
        <div className="mt-8 flex justify-center gap-2">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "0s" }} />
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
        </div>
      </div>
    </div>
  );
}
