/**
 * Unified type exports
 * Import shared types from this single entry point.
 */

export type * from "../drizzle/schema";
export * from "@shared/_core/errors";

export const CREDIT_CHALLENGES = [
  "No Credit Score",
  "Low Credit Score",
  "Evictions",
  "Loan Defaults",
  "Broken Leases",
  "Criminal History",
  "Bankruptcy",
] as const;

export type CreditChallenge = (typeof CREDIT_CHALLENGES)[number];

export const HOUSING_TYPES = [
  "Apartment",
  "Townhome",
  "Duplex",
  "Single Family House",
  "Condo",
  "Studio",
  "Other",
] as const;

export type HousingType = (typeof HOUSING_TYPES)[number];

export const EMPLOYMENT_DURATIONS = [
  "Less than 6 months",
  "6 months - 1 year",
  "1 - 2 years",
  "2 - 5 years",
  "5+ years",
] as const;

export const LOAN_OPTIONS = [
  { value: "yes" as const, label: "Yes, I would like loan assistance" },
  { value: "no" as const, label: "No, I do not need a loan" },
  { value: "maybe" as const, label: "Maybe, I would like more information" },
] as const;

export interface SearchFormData {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  city: string;
  state: string;
  searchRadiusMiles: number;
  creditChallenges: string[];
  housingType: string;
  bedrooms: number;
  occupants: number;
  totalHouseholdIncome: string;
  monthlyTakeHomeIncome: string;
  employmentDuration: string;
  needsMovingLoan: "yes" | "no" | "maybe";
  additionalInfo?: string;
}

export interface SearchResult {
  companyName: string;
  companyWebsite: string;
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
  description: string;
  category: string;
}

export const SEARCH_STEPS = [
  "Scanning Second Chance Housing Programs",
  "Second Chance Apartments",
  "Private Landlords with properties for Rent",
  "Corporate Leasing Programs",
  "Scanning Local and County Laws to develop a custom plan",
  "Scanning programs, rental properties, and resources on review platforms",
  "Removing options associated with excessive negative reviews or high crime areas",
  "Compiling your custom Second Chance Housing Rental List",
] as const;
