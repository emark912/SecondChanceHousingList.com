/**
 * PartnerCardUpdated — Confirmation page shown after a partner saves or updates their card.
 * Auto-redirects to the partner dashboard after 5 seconds.
 */

import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export default function PartnerCardUpdated() {
  const [, navigate] = useLocation();
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(5);
  const [isNewCard, setIsNewCard] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("partnerId");
    const mode = params.get("mode"); // "update" = replacing existing card, "activate" = first card
    setPartnerId(id);
    setIsNewCard(mode === "activate");
  }, []);

  // Countdown and auto-redirect
  useEffect(() => {
    if (!partnerId) return;
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          navigate(`/partnership/dashboard?partnerId=${partnerId}`);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [partnerId, navigate]);

  const handleGoNow = () => {
    if (partnerId) {
      navigate(`/partnership/dashboard?partnerId=${partnerId}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Success icon */}
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-12 h-12 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          {isNewCard ? "Card Saved Successfully!" : "Card Updated Successfully!"}
        </h1>

        <p className="text-gray-600 mb-2">
          {isNewCard
            ? "Your payment card has been saved and your 20-lead free trial is now active. You will start receiving tenant leads shortly."
            : "Your payment card has been updated. Future lead purchases will be charged to your new card automatically."}
        </p>

        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 text-left">
          <div className="flex items-start gap-3">
            <span className="text-green-600 text-xl mt-0.5">💳</span>
            <div>
              <p className="font-semibold text-green-800 text-sm">
                {isNewCard ? "Instant checkout enabled" : "Card on file updated"}
              </p>
              <p className="text-green-700 text-xs mt-0.5">
                {isNewCard
                  ? "When you purchase more leads, your card will be charged instantly — no checkout redirect needed."
                  : "Your new card is now on file and will be used for all future lead purchases."}
              </p>
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-500 mb-4">
          Redirecting to your dashboard in{" "}
          <span className="font-bold text-blue-600">{countdown}</span> second{countdown !== 1 ? "s" : ""}...
        </p>

        <Button
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 text-base"
          onClick={handleGoNow}
        >
          Go to Dashboard Now →
        </Button>

        <p className="text-xs text-gray-400 mt-4">
          Second Chance Housing List Partnership Program
        </p>
      </div>
    </div>
  );
}
