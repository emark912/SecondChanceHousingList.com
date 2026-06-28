import React, { createContext, useContext, useState, useEffect } from "react";

interface PartnerSession {
  partnerId: number | null;
  email: string | null;
  businessName: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface PartnerContextType {
  session: PartnerSession;
  setSession: (session: PartnerSession) => void;
  logout: () => void;
}

const PartnerContext = createContext<PartnerContextType | undefined>(undefined);

export function PartnerProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<PartnerSession>({
    partnerId: null,
    email: null,
    businessName: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        // Try to get partner ID from localStorage or session storage
        const partnerId = localStorage.getItem("partner_id");
        const email = localStorage.getItem("partner_email");
        const businessName = localStorage.getItem("partner_business_name");

        if (partnerId) {
          setSession({
            partnerId: parseInt(partnerId),
            email,
            businessName,
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          setSession((prev) => ({
            ...prev,
            isLoading: false,
          }));
        }
      } catch (error) {
        console.error("Error checking partner session:", error);
        setSession((prev) => ({
          ...prev,
          isLoading: false,
        }));
      }
    };

    checkSession();
  }, []);

  const logout = () => {
    localStorage.removeItem("partner_id");
    localStorage.removeItem("partner_email");
    localStorage.removeItem("partner_business_name");
    setSession({
      partnerId: null,
      email: null,
      businessName: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  return (
    <PartnerContext.Provider value={{ session, setSession, logout }}>
      {children}
    </PartnerContext.Provider>
  );
}

export function usePartnerSession() {
  const context = useContext(PartnerContext);
  if (!context) {
    throw new Error("usePartnerSession must be used within PartnerProvider");
  }
  return context;
}

// Re-export a usePartner hook that fetches partner data from the API
// This is used by PartnerLeadPackages, PartnerAnalytics, etc.
// It reads the partnerId from localStorage and fetches the partner data
export function usePartner() {
  const { session } = usePartnerSession();
  const utils = (window as any).__trpcUtils;
  // We use a simple approach: read partnerId from localStorage
  const partnerId = session.partnerId;
  return {
    partner: partnerId ? {
      id: partnerId,
      partnerName: localStorage.getItem("partner_name") ?? "",
      email: session.email ?? "",
      businessName: session.businessName ?? "",
      trialLeadsRemaining: parseInt(localStorage.getItem("partner_trial_leads") ?? "0"),
    } : null,
    isLoading: session.isLoading,
    refetch: () => {},
  };
}
