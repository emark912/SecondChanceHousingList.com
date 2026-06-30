/**
 * Unified type exports
 * Import shared types from this single entry point.
 */

export type * from "../drizzle/schema";
export * from "./_core/errors";

// Form constants
export const CREDIT_CHALLENGES = [
  "Bad Credit",
  "No Credit History",
  "Bankruptcy",
  "Collections",
  "Late Payments",
  "Foreclosure",
  "Eviction",
  "Other"
];

export const HOUSING_TYPES = [
  "Apartment",
  "House",
  "Townhouse",
  "Condo",
  "Mobile Home",
  "Other"
];

export const EMPLOYMENT_DURATIONS = [
  "Less than 3 months",
  "3-6 months",
  "6-12 months",
  "1-2 years",
  "2-5 years",
  "5+ years"
];

export const LOAN_OPTIONS = [
  { value: "yes", label: "Yes, I need a loan" },
  { value: "no", label: "No, I don't need a loan" },
  { value: "maybe", label: "Maybe, I'm not sure" }
];
