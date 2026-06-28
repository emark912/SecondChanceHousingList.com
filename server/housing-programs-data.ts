// Housing Programs Database for PDF Generation
// Extracted from Second Chance Housing Programs & Resources Database

export interface HousingProgram {
  name: string;
  website: string;
  description: string;
  category: string;
}

export const housingPrograms: HousingProgram[] = [
  // SECOND CHANCE APARTMENT LOCATOR SERVICES
  {
    name: "Second Chance Apartments",
    website: "secondchanceapartments.org",
    description: "Nationwide directory of 1000+ apartments accepting evictions, bad credit, criminal records",
    category: "Second Chance Apartments",
  },
  {
    name: "Second Chance Locators",
    website: "secondchancelocators.com",
    description: "Helps renters with bad credit, broken leases, evictions, criminal history find apartments nationwide",
    category: "Second Chance Apartments",
  },
  {
    name: "Bad Credit Apartments",
    website: "badcreditapartments.org",
    description: "Exclusive database of 1000+ apartments for challenging rental histories",
    category: "Second Chance Apartments",
  },
  {
    name: "Second Chance Apartments",
    website: "secondchanceapartments.com",
    description: "Specializes in evictions, broken leases, slow pays, repossessions",
    category: "Second Chance Apartments",
  },
  {
    name: "Second Chance Aparts",
    website: "secondchanceaparts.com",
    description: "Locators access databases not available to public",
    category: "Second Chance Apartments",
  },
  {
    name: "Second Chance Housing List",
    website: "secondchancehousinglist.com",
    description: "Free national database of second chance housing options",
    category: "Second Chance Apartments",
  },
  {
    name: "How 2 Rent Again",
    website: "how2rentagain.com",
    description: "Get approved with eviction, bad credit, broken leases, foreclosures, bankruptcies",
    category: "Second Chance Apartments",
  },

  // RENT GUARANTEE & LEASE GUARANTEE SERVICES
  {
    name: "Liberty Rent",
    website: "libertyrent.com",
    description: "Second chance lease approval for multifamily properties nationwide",
    category: "Rent Guarantee Programs",
  },
  {
    name: "TheGuarantors",
    website: "theguarantors.com",
    description: "Helps renters get approved while providing landlord coverage against defaults",
    category: "Rent Guarantee Programs",
  },
  {
    name: "OneApp",
    website: "oneapp.rentals",
    description: "Second-chance approval assistance service breaking the denial cycle",
    category: "Rent Guarantee Programs",
  },
  {
    name: "Insurent",
    website: "insurent.com",
    description: "Lease guarantor service for renters not meeting strict financial requirements (NYC, NJ, DC, and more)",
    category: "Rent Guarantee Programs",
  },
  {
    name: "LeaseGuarantee",
    website: "leaseguarantee.com",
    description: "Rent guarantee program backing leases for tenants with poor credit",
    category: "Rent Guarantee Programs",
  },
  {
    name: "Flex",
    website: "flex.com",
    description: "Rent now, pay later service for lower-income renters with weaker credit profiles",
    category: "Rent Guarantee Programs",
  },
  {
    name: "Tenant Screening Plus",
    website: "tenantscreeningplus.com",
    description: "Second chance rental program",
    category: "Rent Guarantee Programs",
  },
  {
    name: "CorporateLeaser.com",
    website: "corporateleaser.com",
    description: "Uses corporate leasing loophole to get credit-challenged renters approved",
    category: "Corporate Leasing",
  },

  // GOVERNMENT HOUSING ASSISTANCE PROGRAMS
  {
    name: "HUD Public Housing Program",
    website: "hud.gov",
    description: "Safe and affordable rental housing for low-income families, seniors, people with disabilities",
    category: "Government Programs",
  },
  {
    name: "Housing Choice Voucher Program (Section 8)",
    website: "hud.gov",
    description: "Federal program providing housing assistance to 2.3+ million American families",
    category: "Government Programs",
  },
  {
    name: "Emergency Rental Assistance Program (ERA)",
    website: "hud.gov",
    description: "Treasury program providing $46+ billion for housing stability",
    category: "Government Programs",
  },
  {
    name: "USA.gov Rental Housing Programs",
    website: "usa.gov",
    description: "Comprehensive information on Section 8, subsidized housing, rental assistance",
    category: "Government Programs",
  },
  {
    name: "HUD Resource Locator",
    website: "hud.gov",
    description: "Find local housing agencies and landlord lists",
    category: "Government Programs",
  },
  {
    name: "Eviction Protection Grant Program (EPGP)",
    website: "hud.gov",
    description: "Increases housing stability for low-income tenants at risk of eviction",
    category: "Government Programs",
  },
  {
    name: "Federal Housing Administration (FHA) Loans",
    website: "fha.gov",
    description: "Reduced rates, low down payments, easier credit qualifications",
    category: "Government Programs",
  },
  {
    name: "211.org",
    website: "211.org",
    description: "Nationwide resource for rental assistance, utilities, housing expenses help",
    category: "Government Programs",
  },

  // NON-PROFIT HOUSING ORGANIZATIONS
  {
    name: "Safer Foundation",
    website: "saferfoundation.org",
    description: "Reentry assistance, job placement, housing for formerly incarcerated",
    category: "Non-Profit Programs",
  },
  {
    name: "Second Chance Society",
    website: "secondchancesociety.org",
    description: "Programs breaking cycle of poverty",
    category: "Non-Profit Programs",
  },
  {
    name: "Second Chance-Last Opportunity (SCLO)",
    website: "secondchancelastopportunity.org",
    description: "Life management skills and housing support",
    category: "Non-Profit Programs",
  },
  {
    name: "Hope through Housing Foundation",
    website: "hthf.org",
    description: "Housing-based services for families rebuilding lives",
    category: "Non-Profit Programs",
  },
  {
    name: "Second Heart Homes",
    website: "secondhearthomes.org",
    description: "Housing and support services for homeless adults with mental health illnesses",
    category: "Non-Profit Programs",
  },
  {
    name: "Solid Ground",
    website: "solid-ground.org",
    description: "Housing search assistance for those with credit issues, eviction history, criminal records",
    category: "Non-Profit Programs",
  },
  {
    name: "National Low Income Housing Coalition (NLIHC)",
    website: "nlihc.org",
    description: "Rental assistance and housing programs database",
    category: "Non-Profit Programs",
  },
  {
    name: "Local Housing Solutions",
    website: "localhousingsolutions.org",
    description: "Federal and local affordable housing programs information",
    category: "Non-Profit Programs",
  },
  {
    name: "United Way 211",
    website: "211.org",
    description: "Local resource for housing expenses, rent, utilities assistance",
    category: "Non-Profit Programs",
  },

  // APARTMENT SEARCH & RENTAL PLATFORMS
  {
    name: "Apartments.com",
    website: "apartments.com",
    description: "Largest apartment listing site, filter by 'second chance' friendly",
    category: "Rental Properties",
  },
  {
    name: "Zillow",
    website: "zillow.com",
    description: "Major rental platform with credit-challenged renter resources",
    category: "Rental Properties",
  },
  {
    name: "Realtor.com",
    website: "realtor.com",
    description: "Rental listings including affordable housing",
    category: "Rental Properties",
  },
  {
    name: "Rent.com",
    website: "rent.com",
    description: "Rental platform with second chance options",
    category: "Rental Properties",
  },
  {
    name: "HotPads",
    website: "hotpads.com",
    description: "Apartment search with various rental criteria",
    category: "Rental Properties",
  },
  {
    name: "Craigslist",
    website: "craigslist.org",
    description: "Private landlord listings (use caution, verify legitimacy)",
    category: "Rental Properties",
  },
  {
    name: "Facebook Housing Groups",
    website: "facebook.com",
    description: "Local community groups for rentals and housing assistance",
    category: "Rental Properties",
  },
  {
    name: "Nextdoor",
    website: "nextdoor.com",
    description: "Neighborhood app with local rental listings",
    category: "Rental Properties",
  },

  // CREDIT REPAIR & FINANCIAL RECOVERY
  {
    name: "Credit Repair Organizations",
    website: "various",
    description: "Help remove evictions, collections from credit reports",
    category: "Credit Services",
  },
  {
    name: "Eviction Removal Services",
    website: "various",
    description: "Nationwide services cleaning up eviction records",
    category: "Credit Services",
  },
  {
    name: "Collection Removal Services",
    website: "various",
    description: "Help dispute and remove collections accounts",
    category: "Credit Services",
  },
  {
    name: "Credit Score Improvement Programs",
    website: "various",
    description: "Memberships and tools for credit recovery",
    category: "Credit Services",
  },
  {
    name: "Rent Reporting Services",
    website: "various",
    description: "Report on-time rent payments to credit bureaus",
    category: "Credit Services",
  },
  {
    name: "Credit Counseling Services",
    website: "various",
    description: "Non-profit credit counseling and budgeting assistance",
    category: "Credit Services",
  },

  // RENTAL ASSISTANCE & EMERGENCY HOUSING
  {
    name: "Emergency Rental Assistance (ERA)",
    website: "era.treasury.gov",
    description: "Direct financial assistance for rent, utilities, arrears",
    category: "Rental Assistance",
  },
  {
    name: "Eviction Prevention Programs",
    website: "various",
    description: "Legal aid and financial assistance preventing eviction",
    category: "Rental Assistance",
  },
  {
    name: "Utility Assistance Programs",
    website: "various",
    description: "Help paying electric, gas, water bills",
    category: "Rental Assistance",
  },
  {
    name: "Emergency Housing Programs",
    website: "various",
    description: "Temporary shelter and transitional housing",
    category: "Rental Assistance",
  },
  {
    name: "Homelessness Prevention Programs",
    website: "various",
    description: "Rapid rehousing and stabilization services",
    category: "Rental Assistance",
  },
  {
    name: "Foreclosure Prevention Programs",
    website: "various",
    description: "Assistance for homeowners facing foreclosure",
    category: "Rental Assistance",
  },
];

export function getProgramsByCategory(category: string): HousingProgram[] {
  return housingPrograms.filter((p) => p.category === category);
}

export function getAllCategories(): string[] {
  return Array.from(new Set(housingPrograms.map((p) => p.category)));
}
