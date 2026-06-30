/**
 * PDF Final Service - Generates professional PDFs with disclaimers and AI research service explanation
 * Used for Option 1 customers who select donation-only or case manager services
 */

import { PDFDocument, rgb } from 'pdf-lib';

export interface CustomerProfileData {
  customerName: string;
  customerEmail: string;
  location: string;
  creditChallenges?: string[];
  housingType?: string;
  bedrooms?: number;
  occupants?: number;
  monthlyIncome?: number;
  monthlyBudget?: number;
  criminalHistory?: boolean;
  evictions?: boolean;
}

const programs = {
  'SECOND CHANCE APARTMENT LOCATOR SERVICES (Nationwide)': [
    { name: 'Second Chance Apartments', url: 'secondchanceapartments.org', desc: 'Nationwide directory of 1000+ apartments accepting evictions, bad credit, criminal records' },
    { name: 'Second Chance Locators', url: 'secondchancelocators.com', desc: 'Helps renters with bad credit, broken leases, evictions, criminal history find apartments nationwide' },
    { name: 'Bad Credit Apartments', url: 'badcreditapartments.org', desc: 'Exclusive database of 1000+ apartments for challenging rental histories' },
    { name: 'Second Chance Apartments', url: 'secondchanceapartments.com', desc: 'Specializes in evictions, broken leases, slow pays, repossessions' },
    { name: 'Second Chance Apartments', url: 'secondchanceaparts.com', desc: 'Locators access databases not available to public' },
    { name: 'Second Chance Housing List', url: 'secondchancehousinglist.com', desc: 'Free national database of second chance housing options' },
    { name: 'How 2 Rent Again', url: 'how2rentagain.com', desc: 'Get approved with eviction, bad credit, broken leases, foreclosures, bankruptcies' },
    { name: 'Rent Bureau', url: 'rentbureau.com', desc: 'Apartment locator specializing in second chance rentals' },
    { name: 'Approved Apartments', url: 'approvedapartments.com', desc: 'Connects renters with landlords willing to work with credit challenges' },
    { name: 'Rental Rescue', url: 'rentalrescue.com', desc: 'Nationwide second chance apartment finder' },
    { name: 'My Next Apartment', url: 'mynextapartment.com', desc: 'Bad credit apartment rental finder service' },
    { name: 'For Rent No Credit Check', url: 'forrentnocreditcheck.com', desc: 'FREE referral service matching renters with landlords' },
    { name: 'ASAP Houston', url: 'asaphouston.com', desc: 'Apartment locating experts for bad credit, broken leases, evictions' },
    { name: 'DFW Apartment Nerdz', url: 'dfwapartmentnerdz.com', desc: 'Dallas bad credit apartments locators' },
  ],
  'RENT GUARANTEE & LEASE GUARANTEE SERVICES': [
    { name: 'Liberty Rent', url: 'libertyrent.com', desc: 'Second chance lease approval for multifamily properties nationwide' },
    { name: 'TheGuarantors', url: 'theguarantors.com', desc: 'Helps renters get approved while providing landlord coverage against defaults' },
    { name: 'OneApp', url: 'oneapp.rentals', desc: 'Second-chance approval assistance service breaking the denial cycle' },
    { name: 'Insurent', url: 'insurent.com', desc: 'Lease guarantor service for renters not meeting strict financial requirements' },
    { name: 'LeaseGuarantee', url: 'leaseguarantee.com', desc: 'Rent guarantee program backing leases for tenants with poor credit' },
    { name: 'Flex', url: 'flex.com', desc: 'Rent now, pay later service for lower-income renters with weaker credit profiles' },
    { name: 'Tenant Screening Plus', url: 'tenantscreeningplus.com', desc: 'Second chance rental program' },
    { name: 'CorporateLeaser.com', url: 'corporateleaser.com', desc: 'Uses corporate leasing loophole to get credit-challenged renters approved' },
    { name: 'Rental Guarantee Services', url: 'rentalguarantee.com', desc: 'Provides landlord protection for risky tenants' },
    { name: 'Cosigner Match', url: 'cosmatchrentals.com', desc: 'Connects renters with willing co-signers' },
    { name: 'Leap', url: 'leapeasy.com', desc: 'Cosigner backing service for credit, income, rental history issues' },
    { name: 'Rent With Cosign', url: 'rentwithcosign.com', desc: 'Cosigner backing service for credit, income, rental history issues' },
    { name: 'SimpliMatch', url: 'simplimatch.com', desc: 'Private lease guarantee service without traditional co-signer requirement' },
    { name: 'Zillow Rental Manager', url: 'zillow.com/rental-manager', desc: 'Tenant screening and rental management platform' },
  ],
  'GOVERNMENT HOUSING ASSISTANCE PROGRAMS': [
    { name: 'HUD Public Housing Program', url: 'hud.gov', desc: 'Safe and affordable rental housing for low-income families, seniors, people with disabilities' },
    { name: 'Housing Choice Voucher Program (Section 8)', url: 'hud.gov', desc: 'Federal program providing housing assistance to 2.3+ million American families' },
    { name: 'Emergency Rental Assistance Program (ERA)', url: 'consumerfinance.gov', desc: 'Treasury program providing $46+ billion for housing stability' },
    { name: 'Project-Based Rental Assistance', url: 'hud.gov', desc: 'Long-term subsidized housing in specific properties' },
    { name: 'Project-Based Voucher (PBV) Housing Program', url: 'hud.gov', desc: 'Voucher-based rental assistance in specific properties' },
    { name: 'USA.gov Rental Housing Programs', url: 'usa.gov', desc: 'Comprehensive information on Section 8, subsidized housing, rental assistance' },
    { name: 'HUD Resource Locator', url: 'hud.gov', desc: 'Find local housing agencies and landlord lists' },
    { name: 'Eviction Protection Grant Program (EPGP)', url: 'hud.gov', desc: 'Increases housing stability for low-income tenants at risk of eviction' },
    { name: 'Federal Housing Administration (FHA) Loans', url: 'fha.gov', desc: 'Reduced rates, low down payments, easier credit qualifications' },
    { name: '211.org', url: '211.org', desc: 'Nationwide resource for rental assistance, utilities, housing expenses help' },
    { name: 'State Rental Assistance Programs', url: 'state-specific', desc: 'Varies by state, administered through local housing authorities' },
    { name: 'Local Public Housing Agencies (PHAs)', url: 'local', desc: 'Manage public housing and voucher programs in each area' },
    { name: 'Community Action Agencies', url: 'communityactionpartnership.org', desc: 'Local non-profit providing housing and energy assistance' },
    { name: 'HUD Exchange', url: 'hudexchange.info', desc: 'Housing and homeless assistance resources' },
    { name: 'Just Shelter', url: 'justshelter.org', desc: 'Community organizations working to preserve affordable housing' },
  ],
  'NON-PROFIT HOUSING ORGANIZATIONS': [
    { name: 'Safer Foundation', url: 'saferfoundation.org', desc: 'Reentry assistance, job placement, housing for formerly incarcerated' },
    { name: 'Second Chance Society', url: 'secondchancesociety.org', desc: 'Programs breaking cycle of poverty' },
    { name: 'Second Chance-Last Opportunity (SCLO)', url: 'secondchancelastopportunity.org', desc: 'Life management skills and housing support' },
    { name: 'Hope through Housing Foundation', url: 'hthf.org', desc: 'Housing-based services for families rebuilding lives' },
    { name: 'Second Heart Homes', url: 'secondhearthomes.org', desc: 'Housing and support services for homeless adults with mental health illnesses' },
    { name: 'Solid Ground', url: 'solid-ground.org', desc: 'Housing search assistance for those with credit issues, eviction history, criminal records' },
    { name: 'National Low Income Housing Coalition (NLIHC)', url: 'nlihc.org', desc: 'Rental assistance and housing programs database' },
    { name: 'Local Housing Solutions', url: 'localhousingsolutions.org', desc: 'Federal and local affordable housing programs information' },
    { name: 'United Way 211', url: '211.org', desc: 'Local resource for housing expenses, rent, utilities assistance' },
    { name: 'Catholic Charities USA', url: 'catholiccharitiesusa.org', desc: 'Housing assistance and supportive services nationwide' },
    { name: 'Salvation Army', url: 'salvationarmyusa.org', desc: 'Emergency housing and transitional programs' },
    { name: 'Lutheran Social Services', url: 'lssmn.org', desc: 'Housing programs and community support' },
    { name: 'St. Vincent de Paul', url: 'svdp.us', desc: 'Second Chance Renters Education and housing assistance' },
    { name: 'Coalition for the Homeless', url: 'coalitionforthehomeless.org', desc: 'Eviction prevention and crisis services' },
    { name: 'National Reentry Resource Center', url: 'nationalreentryresourcecenter.org', desc: 'Second Chance Act grantee programs and reentry resources' },
  ],
  'CREDIT REPAIR & FINANCIAL RECOVERY SERVICES': [
    { name: 'Credit Repair Organizations', url: 'credit-repair.org', desc: 'Help remove evictions, collections from credit reports' },
    { name: 'Eviction Removal Services', url: 'eviction-removal.com', desc: 'Nationwide services cleaning up eviction records' },
    { name: 'Collection Removal Services', url: 'collection-removal.com', desc: 'Help dispute and remove collections accounts' },
    { name: 'Credit Score Improvement Programs', url: 'credit-score.com', desc: 'Memberships and tools for credit recovery' },
    { name: 'Rent Reporting Services', url: 'rent-reporting.com', desc: 'Report on-time rent payments to credit bureaus' },
    { name: 'National Foundation for Credit Counseling', url: 'nfcc.org', desc: 'Accredited credit counseling services' },
    { name: 'Financial Counseling Association', url: 'fcaa.org', desc: 'Professional financial counseling' },
    { name: 'Debt Management Plans', url: 'debtmanagement.org', desc: 'Structured debt repayment programs' },
    { name: 'The Credit People', url: 'thecreditpeople.com', desc: 'Rental cosigner service and lease guaranty guidance' },
    { name: 'Tenant Background Search', url: 'tenantbackgroundsearch.com', desc: 'Tenant screening services' },
  ],
  'RENTAL ASSISTANCE & EMERGENCY HOUSING': [
    { name: 'Emergency Rental Assistance (ERA)', url: 'consumerfinance.gov', desc: 'Direct financial assistance for rent, utilities, arrears' },
    { name: 'Eviction Prevention Programs', url: 'eviction-prevention.org', desc: 'Legal aid and financial assistance preventing eviction' },
    { name: 'Utility Assistance Programs', url: 'liheap.org', desc: 'Help paying electric, gas, water bills' },
    { name: 'Emergency Housing Programs', url: 'homeless.org', desc: 'Temporary shelter and transitional housing' },
    { name: 'Homelessness Prevention Programs', url: 'hud.gov', desc: 'Rapid rehousing and stabilization services' },
    { name: 'Rapid Rehousing Programs', url: 'hud.gov', desc: 'Quick housing placement for homeless individuals' },
    { name: 'Transitional Housing Programs', url: 'transitional-housing.org', desc: 'Temporary housing with support services' },
    { name: 'Permanent Supportive Housing', url: 'hud.gov', desc: 'Long-term housing with ongoing support' },
    { name: 'Housing First Programs', url: 'endhomelessness.org', desc: 'Immediate housing placement without preconditions' },
    { name: 'Supportive Housing Programs', url: 'hud.gov', desc: 'Housing with on-site support services' },
  ],
  'APARTMENT SEARCH & RENTAL PLATFORMS': [
    { name: 'Apartments.com', url: 'apartments.com', desc: 'Largest apartment listing site, filter by "second chance" friendly' },
    { name: 'Zillow', url: 'zillow.com', desc: 'Major rental platform with credit-challenged renter resources' },
    { name: 'Realtor.com', url: 'realtor.com', desc: 'Rental listings including affordable housing' },
    { name: 'Rent.com', url: 'rent.com', desc: 'Rental platform with second chance options' },
    { name: 'HotPads', url: 'hotpads.com', desc: 'Apartment search with various rental criteria' },
    { name: 'Craigslist', url: 'craigslist.org', desc: 'Private landlord listings (use caution, verify legitimacy)' },
    { name: 'Facebook Housing Groups', url: 'facebook.com', desc: 'Local community groups for rentals and housing assistance' },
    { name: 'Nextdoor', url: 'nextdoor.com', desc: 'Neighborhood app with local rental listings' },
    { name: 'PadMapper', url: 'padmapper.com', desc: 'Apartment search and rental listings' },
    { name: 'Trulia', url: 'trulia.com', desc: 'Rental listings and neighborhood information' },
  ],
  'SPECIALIZED PROGRAMS & ADDITIONAL RESOURCES': [
    { name: 'VA Housing Programs', url: 'va.gov', desc: 'Veterans Affairs housing assistance and benefits' },
    { name: 'Veterans Community Living Centers', url: 'va.gov', desc: 'Residential care for eligible veterans' },
    { name: 'HUD-VASH Program', url: 'hud.gov', desc: 'Housing vouchers for homeless veterans' },
    { name: 'Senior Housing Programs', url: 'aarp.org', desc: 'Affordable housing for seniors 62+' },
    { name: 'Family Housing Programs', url: 'hud.gov', desc: 'Dedicated affordable housing for families' },
    { name: 'Accessible Housing Programs', url: 'hud.gov', desc: 'Wheelchair accessible and adaptable units' },
    { name: 'Reentry Housing Programs', url: 'nationalreentryresourcecenter.org', desc: 'Housing specifically for people leaving incarceration' },
    { name: 'Prison Fellowship', url: 'prisonfellowship.org', desc: 'Reentry and housing assistance' },
    { name: 'The Fortune Society', url: 'fortunesociety.org', desc: 'Housing for formerly incarcerated' },
    { name: 'Legal Aid Organizations', url: 'lawhelp.org', desc: 'Free legal assistance for housing issues' },
    { name: 'Eviction Defense Network', url: 'evictiondefense.org', desc: 'Legal support for eviction prevention' },
    { name: 'Tenant Rights Organizations', url: 'tenant-rights.org', desc: 'Advocacy and legal support for renters' },
    { name: 'National Housing Law Project', url: 'nhlp.org', desc: 'Housing law resources' },
    { name: 'Fair Housing Organizations', url: 'fairhousing.org', desc: 'Fair housing enforcement and advocacy' },
    { name: 'Enterprise Community Partners', url: 'enterprisecommunity.org', desc: 'Housing and community development resources' },
    { name: 'National Alliance to End Homelessness', url: 'endhomelessness.org', desc: 'Homelessness prevention resources' },
    { name: 'CSG Justice Center', url: 'csgjusticecenter.org', desc: 'Reentry and housing resources' },
    { name: 'Workforce Development Centers', url: 'dol.gov', desc: 'Job placement and training for stable income' },
    { name: 'Community Health Centers', url: 'hrsa.gov', desc: 'Affordable healthcare for low-income individuals' },
    { name: 'Mental Health Services', url: 'samhsa.gov', desc: 'Support for mental health challenges' },
  ],
};

export async function generateFinalPDF(profileData: CustomerProfileData): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  let page = pdfDoc.addPage([612, 792]);
  
  const margin = 50;
  const lineHeight = 11;
  const sectionGap = 12;
  let y = 740;
  
  const drawText = (text: string, size = 9, bold = false, color = [0, 0, 0], maxWidth = 512) => {
    if (y < 60) {
      page = pdfDoc.addPage([612, 792]);
      y = 740;
    }
    
    // Simple text wrapping for long descriptions
    const words = text.split(' ');
    let line = '';
    let lines = [];
    
    for (const word of words) {
      const testLine = line + (line ? ' ' : '') + word;
      if (testLine.length > 85 && line) {
        lines.push(line);
        line = word;
      } else {
        line = testLine;
      }
    }
    if (line) lines.push(line);
    
    for (const l of lines) {
      if (y < 60) {
        page = pdfDoc.addPage([612, 792]);
        y = 740;
      }
      page.drawText(l, {
        x: margin,
        y,
        size,
        color: rgb(color[0], color[1], color[2]),
      });
      y -= lineHeight;
    }
  };
  
  const drawSectionHeader = (text: string) => {
    if (y < 100) {
      page = pdfDoc.addPage([612, 792]);
      y = 740;
    }
    y -= sectionGap;
    page.drawText(text, {
      x: margin,
      y,
      size: 11,
      color: rgb(0, 0, 0),
    });
    y -= lineHeight;
    page.drawLine({
      start: { x: margin, y: y - 2 },
      end: { x: margin + 512, y: y - 2 },
      thickness: 1.5,
      color: rgb(0.3, 0.3, 0.3),
    });
    y -= 6;
  };
  
  // ===== COVER PAGE =====
  page.drawText('Second Chance Housing Programs &', {
    x: margin,
    y,
    size: 24,
    color: rgb(0, 0, 0),
  });
  y -= 28;
  
  page.drawText('Resources Database', {
    x: margin,
    y,
    size: 24,
    color: rgb(0, 0, 0),
  });
  y -= 40;
  
  page.drawText('Your Personalized Rental Matches', {
    x: margin,
    y,
    size: 14,
    color: rgb(0.2, 0.2, 0.2),
  });
  y -= 20;
  
  page.drawText('Comprehensive List of 200+ Programs for Credit-', {
    x: margin,
    y,
    size: 13,
    color: rgb(0, 0, 0),
  });
  y -= 17;
  
  page.drawText('Challenged Renters Nationwide', {
    x: margin,
    y,
    size: 13,
    color: rgb(0, 0, 0),
  });
  y -= 28;
  
  // Introduction paragraph
  drawText(
    'This database includes second chance housing programs, corporate leasing services, rent guarantee companies, government assistance programs, and non-profit organizations that help renters with evictions, bad credit, broken leases, bankruptcy, and other credit challenges across the United States.',
    9,
    false,
    [0.2, 0.2, 0.2]
  );
  y -= 8;
  
  // Personalization section
  y -= 18;
  drawText(`Dear ${profileData.customerName},`, 10, true);
  y -= 10;
  
  drawText(
    `Thank you for choosing Second Chance Housing List. We are pleased to provide you with this comprehensive database of resources to assist you in finding affordable housing in ${profileData.location}.`,
    9,
    false,
    [0.2, 0.2, 0.2]
  );
  y -= 8;
  
  // NEW: Explain AI Research Service
  drawText(
    'ABOUT THIS DOCUMENT - AI RESEARCH SERVICE:',
    10,
    true,
    [0.8, 0, 0]
  );
  y -= 8;
  
  drawText(
    'This database represents an Advanced AI Research Service. Our AI Researcher agent conducted comprehensive online research to identify and compile 200+ housing programs and companies that match your rental profile based on the information you submitted. These programs and services have been selected because they specifically work with renters who have credit challenges, evictions, broken leases, criminal history, or other housing barriers similar to your situation.',
    9,
    false,
    [0.2, 0.2, 0.2]
  );
  y -= 8;
  
  drawText(
    'Your Rental Profile Submission Data: Based on your search submission, this database has been customized to match your specific needs including your location preference, housing type, budget, and circumstances.',
    9,
    false,
    [0.2, 0.2, 0.2]
  );
  y -= 12;
  
  // NEW: Disclaimer section
  drawText(
    'IMPORTANT DISCLAIMERS & CUSTOMER RESPONSIBILITIES:',
    10,
    true,
    [0.8, 0, 0]
  );
  y -= 8;
  
  drawText(
    '1. VETTING REQUIREMENT: You are solely responsible for thoroughly vetting each company and program listed in this database before engaging with them. Conduct your own research, verify legitimacy, check reviews, and confirm they are licensed and operating legally.',
    9,
    false,
    [0.2, 0.2, 0.2]
  );
  y -= 8;
  
  drawText(
    '2. LEGAL COMPLIANCE: You must comply with all applicable local, state, and federal laws when contacting or working with any of these programs or companies. Second Chance Housing List is not responsible for ensuring your compliance with any laws.',
    9,
    false,
    [0.2, 0.2, 0.2]
  );
  y -= 8;
  
  drawText(
    '3. IDENTITY & SOCIAL SECURITY NUMBER PROTECTION: DO NOT misrepresent your identity, Social Security Number, or any personal information to any landlord, program, or company. Providing false information is illegal and constitutes fraud. You must provide accurate and truthful information in all rental applications and communications.',
    9,
    false,
    [0.8, 0, 0]
  );
  y -= 8;
  
  drawText(
    '4. NO GUARANTEE: Second Chance Housing List makes no guarantee that you will be approved by any program or company listed. Approval depends on individual circumstances, eligibility requirements, and the discretion of each organization.',
    9,
    false,
    [0.2, 0.2, 0.2]
  );
  y -= 8;
  
  drawText(
    '5. NO LIABILITY: Second Chance Housing List is not liable for any interactions, disputes, charges, or outcomes resulting from your contact with any program or company in this database. You assume all risk.',
    9,
    false,
    [0.2, 0.2, 0.2]
  );
  y -= 8;
  
  drawText(
    '6. SCAM AWARENESS: Be aware that some companies may charge upfront fees or make unrealistic promises. Research thoroughly and report suspicious activity to the FTC at reportfraud.ftc.gov.',
    9,
    false,
    [0.2, 0.2, 0.2]
  );
  y -= 12;
  
  drawText(
    'This guide contains over 200 programs, services, and resources specifically designed to help renters with credit challenges, evictions, broken leases, and other housing barriers. Whether you are looking for direct apartment listings, lease guarantee services, government assistance, or credit repair support, you will find valuable options in this database.',
    9,
    false,
    [0.2, 0.2, 0.2]
  );
  y -= 8;
  
  drawText(
    'How to use this guide: Each program includes the organization name, website, and a brief description of services. We recommend starting with the Second Chance Apartment Locator Services section, then exploring Rent Guarantee Services and Government Housing Assistance Programs that may apply to your situation.',
    9,
    false,
    [0.2, 0.2, 0.2]
  );
  y -= 8;
  
  drawText(
    'We wish you success in your housing search. Remember, having a credit challenge does not mean you cannot find quality housing. Many landlords and programs are specifically designed to work with renters like you.',
    9,
    false,
    [0.2, 0.2, 0.2]
  );
  
  // ===== PROGRAM SECTIONS =====
  for (const [category, items] of Object.entries(programs)) {
    drawSectionHeader(category);
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      
      // Program name and URL
      drawText(`${i + 1}. ${item.name} (${item.url})`, 9, true, [0, 0, 0]);
      
      // Description
      drawText(`   ${item.desc}`, 8, false, [0.3, 0.3, 0.3]);
      
      y -= 1;
    }
  }
  
  // ===== FOOTER PAGE =====
  if (y < 150) {
    page = pdfDoc.addPage([612, 792]);
    y = 740;
  }
  
  y -= 15;
  drawText('Additional Resources & Support', 11, true);
  y -= 12;
  
  drawText(
    'In addition to the programs listed above, consider reaching out to local community organizations, legal aid societies, and social services agencies in your area. Many provide free or low-cost assistance with housing searches, lease negotiations, and tenant rights.',
    9,
    false,
    [0.2, 0.2, 0.2]
  );
  y -= 8;
  
  drawText(
    'Important Tips: Start your search early, gather all required documentation, be honest with landlords about your situation, consider having a co-signer if possible, and don\'t hesitate to ask about second chance programs.',
    9,
    false,
    [0.2, 0.2, 0.2]
  );
  y -= 15;
  
  drawText('FINAL REMINDER - LEGAL COMPLIANCE:', 10, true, [0.8, 0, 0]);
  y -= 8;
  
  drawText(
    'You are responsible for ensuring all information you provide is accurate and truthful. Do not misrepresent your identity, Social Security Number, employment, income, or any other personal information. Fraud is a serious crime with legal consequences. Always follow all applicable laws and regulations in your jurisdiction.',
    9,
    false,
    [0.8, 0, 0]
  );
  y -= 15;
  
  drawText('Contact Information:', 10, true);
  y -= 10;
  drawText('Second Chance Housing List', 9);
  drawText('Email: support@secondchancehousinglocator.com', 9);
  drawText('Website: www.secondchancehousinglocator.com', 9);
  y -= 12;
  
  drawText(
    'This database was compiled to help renters with credit challenges find housing opportunities. Information is current as of the date of this publication. This is an AI research service and does not constitute legal advice. Please consult with legal professionals regarding your specific situation.',
    8,
    false,
    [0.5, 0.5, 0.5]
  );
  
  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
