/**
 * PDF Generator for personalized housing search results
 * Uses reportlab-style HTML/CSS approach with template rendering
 * Generates professional Option 1 design PDFs
 */

import { storagePut } from "./storage";

interface PropertyListing {
  name: string;
  location: string;
  phone: string;
  website: string;
  description: string;
}

interface PDFData {
  customerName: string;
  searchDate: string;
  location: string;
  totalMatches: number;
  apartments: number;
  programs: number;
  properties: PropertyListing[];
}

/**
 * Generate HTML for PDF (will be converted to PDF by the system)
 */
export function generatePDFHTML(data: PDFData): string {
  const propertyRows = data.properties
    .map(
      (prop) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; color: #1a1a1a;">${prop.name}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; color: #1a1a1a;">${prop.location}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; color: #1a1a1a;">${prop.phone}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; color: #1a1a1a;">
        <a href="${prop.website}" style="color: #0891b2; text-decoration: none;">${prop.website}</a>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; color: #1a1a1a; font-size: 12px;">${prop.description}</td>
    </tr>
  `
    )
    .join("");

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color: #333;
      background: white;
    }
    
    .page {
      width: 8.5in;
      height: 11in;
      margin: 0 auto;
      padding: 0.5in;
      background: white;
      page-break-after: always;
    }
    
    .header {
      background: linear-gradient(135deg, #003d82 0%, #0891b2 100%);
      color: white;
      padding: 30px;
      border-radius: 8px;
      margin-bottom: 30px;
      position: relative;
      overflow: hidden;
    }
    
    .header::before {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      width: 200px;
      height: 200px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 50%;
      transform: translate(50%, -50%);
    }
    
    .header-content {
      position: relative;
      z-index: 1;
    }
    
    .logo {
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 15px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .logo-icon {
      width: 24px;
      height: 24px;
      background: white;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      color: #0891b2;
      font-size: 12px;
    }
    
    .header h1 {
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 10px;
      line-height: 1.2;
    }
    
    .header-meta {
      font-size: 12px;
      opacity: 0.95;
      border-top: 1px solid rgba(255, 255, 255, 0.3);
      padding-top: 10px;
      margin-top: 10px;
    }
    
    .summary {
      margin-bottom: 30px;
    }
    
    .summary-title {
      font-size: 18px;
      font-weight: 700;
      color: #003d82;
      margin-bottom: 15px;
      border-bottom: 2px solid #0891b2;
      padding-bottom: 8px;
    }
    
    .summary-stats {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
    }
    
    .stat-box {
      border: 2px solid #0891b2;
      border-radius: 6px;
      padding: 12px;
      text-align: center;
      background: #f0f9fb;
    }
    
    .stat-icon {
      font-size: 20px;
      margin-bottom: 6px;
    }
    
    .stat-number {
      font-size: 24px;
      font-weight: 700;
      color: #0891b2;
      margin-bottom: 4px;
    }
    
    .stat-label {
      font-size: 11px;
      color: #666;
      font-weight: 600;
    }
    
    .section {
      margin-bottom: 25px;
    }
    
    .section-title {
      font-size: 16px;
      font-weight: 700;
      color: #003d82;
      margin-bottom: 12px;
      border-bottom: 2px solid #0891b2;
      padding-bottom: 6px;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 10px;
    }
    
    th {
      background: #003d82;
      color: white;
      padding: 10px;
      text-align: left;
      font-weight: 600;
      border-bottom: 2px solid #0891b2;
    }
    
    td {
      padding: 10px;
      border-bottom: 1px solid #e0e0e0;
      color: #333;
    }
    
    a {
      color: #0891b2;
      text-decoration: none;
    }
    
    .footer {
      margin-top: 30px;
      padding-top: 15px;
      border-top: 1px solid #ddd;
      font-size: 9px;
      color: #666;
      text-align: center;
    }
    
    .page-number {
      text-align: right;
      font-size: 10px;
      color: #999;
      margin-top: 20px;
    }
    
    .disclaimer {
      background: #f5f5f5;
      border-left: 4px solid #0891b2;
      padding: 12px;
      margin-top: 20px;
      font-size: 8px;
      color: #666;
      line-height: 1.4;
    }
  </style>
</head>
<body>
  <div class="page">
    <!-- Header -->
    <div class="header">
      <div class="header-content">
        <div class="logo">
          <div class="logo-icon">SC</div>
          <span>SecondChance Housing Locator</span>
        </div>
        <h1>Your Personalized Housing Search Results</h1>
        <div class="header-meta">
          <strong>Search Date:</strong> ${data.searchDate} | <strong>Location:</strong> ${data.location}
        </div>
      </div>
    </div>

    <!-- Summary Section -->
    <div class="summary">
      <div class="summary-title">Summary</div>
      <div class="summary-stats">
        <div class="stat-box">
          <div class="stat-icon">🔍</div>
          <div class="stat-number">${data.totalMatches}</div>
          <div class="stat-label">Total Matches</div>
        </div>
        <div class="stat-box">
          <div class="stat-icon">🏢</div>
          <div class="stat-number">${data.apartments}</div>
          <div class="stat-label">Apartments</div>
        </div>
        <div class="stat-box">
          <div class="stat-icon">🏠</div>
          <div class="stat-number">${data.programs}</div>
          <div class="stat-label">Programs</div>
        </div>
        <div class="stat-box">
          <div class="stat-icon">💼</div>
        </div>
      </div>
    </div>

    <!-- Top Recommendations Section -->
    <div class="section">
      <div class="section-title">Top Recommendations</div>
      <table>
        <thead>
          <tr>
            <th>Property Name</th>
            <th>Type</th>
            <th>Location</th>
            <th>Contact Phone</th>
            <th>Website URL</th>
            <th>Brief Description</th>
          </tr>
        </thead>
        <tbody>
          ${propertyRows}
        </tbody>
      </table>
    </div>

    <!-- Disclaimer -->
    <div class="disclaimer">
      <strong>Disclaimer:</strong> The information provided in this report is based on the user's personalized search criteria and is subject to availability. SecondChance Housing Locator does not guarantee the accuracy or availability of any listed property. Please verify all details with the property management or landlord. This report is for informational purposes only and should not be considered legal or financial advice.
    </div>

    <div class="page-number">Page 1 of 1</div>
  </div>
</body>
</html>
  `;
}

/**
 * Generate and upload PDF to S3
 */
export async function generateAndUploadPDF(data: PDFData): Promise<{ url: string; key: string }> {
  try {
    const htmlContent = generatePDFHTML(data);

    // In production, you would use a PDF library like puppeteer or weasyprint
    // For now, we'll return the HTML as a placeholder
    // The actual PDF generation would happen server-side

    const fileName = `housing-results-${data.customerName.replace(/\s+/g, "-")}-${Date.now()}.pdf`;
    const fileKey = `pdfs/${fileName}`;

    // Simulate PDF generation (in production, convert HTML to PDF bytes first)
    const pdfBytes = Buffer.from(htmlContent, "utf-8");

    const result = await storagePut(fileKey, pdfBytes, "application/pdf");

    return {
      url: result.url,
      key: result.key,
    };
  } catch (error) {
    console.error("PDF generation error:", error);
    throw error;
  }
}

/**
 * Generate sample properties for demo
 */
export function generateSampleProperties(count: number): PropertyListing[] {
  const apartments: PropertyListing[] = [
    {
      name: "Aurora Heights Apartments",
      type: "apartment",
      location: "1200 Main St, Metro City",
      phone: "(555) 123-4567",
      website: "www.auroraheights.com",
      description: "Modern units, pet-friendly, close to public transport with on-site laundry and community garden.",
    },
    {
      name: "Riverside Lofts",
      type: "apartment",
      location: "456 River Ave, Downtown",
      phone: "(555) 234-5678",
      website: "www.riveridelofts.com",
      description: "Studio and 1-bed lofts, friendly, close to public transport, on-site laundry and community garden.",
    },
    {
      name: "Oakwood Townhomes",
      type: "apartment",
      location: "789 Oak Blvd, Westside",
      phone: "(555) 345-6789",
      website: "www.oakwoodtownhomes.com",
      description: "Spacious 2-3 bed townhouses with private gardens, pet-friendly community.",
    },
  ];

  const programs: PropertyListing[] = [
    {
      name: "Pathways Community Program",
      type: "program",
      location: "450 Oak Ave, Westville",
      phone: "(555) 987-6543",
      website: "www.pathwayshousing.org",
      description: "Transitional housing support with case management, life skills training, and job placement assistance.",
    },
    {
      name: "Fresh Start Housing Initiative",
      type: "program",
      location: "321 Hope St, Eastside",
      phone: "(555) 876-5432",
      website: "www.freshstarthousing.org",
      description: "Supportive housing program offering subsidized units and comprehensive support services.",
    },
  ];

    {
      location: "789 Pine Blvd, Eastside",
      phone: "(555) 456-7890",
      website: "www.executivesuites.com",
    },
  ];

  return allProperties.slice(0, count);
}


// ============= PERSONALIZED PDF GENERATION =============

export interface ClientProfile {
  fullName: string;
  email: string;
  location: string;
  creditChallenges: string[];
  housingTypes: string[];
  bedrooms: number;
  criminalHistory: string;
  evictions: string;
  annualIncome: string;
  monthlyBudget: string;
  monthlyIncome: string;
  petPreference?: string;
  smokingStatus?: string;
  moveInTimeline?: string;
}

export async function generatePersonalizedPDF(profile: ClientProfile): Promise<{ url: string; fileKey: string }> {
  try {
    const timestamp = Date.now();
    const sanitizedName = profile.fullName.toLowerCase().replace(/\s+/g, '-');
    const fileKey = `second-chance-results/${sanitizedName}-${timestamp}.pdf`;
    const htmlContent = generatePersonalizedHTML(profile);
    const pdfBytes = Buffer.from(htmlContent, 'utf-8');
    const result = await storagePut(fileKey, pdfBytes, 'application/pdf');
    return { url: result.url, fileKey: result.key };
  } catch (error) {
    console.error('Error generating personalized PDF:', error);
    throw error;
  }
}

function generatePersonalizedHTML(profile: ClientProfile): string {
  const creditChallengesText = profile.creditChallenges.join(', ');
  const housingTypesText = profile.housingTypes.join(', ');
  
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Your Personalized Second Chance Housing List</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 20px; }
    h1 { color: #003d82; border-bottom: 3px solid #0891b2; padding-bottom: 10px; }
    h2 { color: #0891b2; margin-top: 25px; }
    h3 { color: #666; }
    table { width: 100%; border-collapse: collapse; margin: 15px 0; }
    th { background: #003d82; color: white; padding: 12px; text-align: left; }
    td { padding: 10px; border-bottom: 1px solid #ddd; }
    .profile-box { background: #f0f9fb; border-left: 4px solid #0891b2; padding: 15px; margin: 15px 0; }
    .section { page-break-inside: avoid; margin: 20px 0; }
    strong { color: #003d82; }
  </style>
</head>
<body>
  <h1>Your Personalized Second Chance Housing Search Results</h1>
  
  <div class="profile-box">
    <h2>Welcome, ${profile.fullName}!</h2>
    <p>Thank you for using <strong>SecondChanceHousingLocator.com</strong> – the first and only Advanced AI-Powered Search Engine designed specifically for credit-challenged renters.</p>
  </div>

  <div class="section">
    <h2>Your Rental Profile Summary</h2>
    <table>
      <tr><th>Profile Detail</th><th>Your Information</th></tr>
      <tr><td><strong>Location</strong></td><td>${profile.location}</td></tr>
      <tr><td><strong>Credit Challenges</strong></td><td>${creditChallengesText}</td></tr>
      <tr><td><strong>Desired Housing Types</strong></td><td>${housingTypesText}</td></tr>
      <tr><td><strong>Bedrooms Needed</strong></td><td>${profile.bedrooms}</td></tr>
      <tr><td><strong>Criminal History</strong></td><td>${profile.criminalHistory}</td></tr>
      <tr><td><strong>Evictions in Last 5 Years</strong></td><td>${profile.evictions}</td></tr>
      <tr><td><strong>Annual Income</strong></td><td>$${profile.annualIncome}</td></tr>
      <tr><td><strong>Monthly Rental Budget</strong></td><td>$${profile.monthlyBudget}</td></tr>
      <tr><td><strong>Monthly Housing Income</strong></td><td>$${profile.monthlyIncome}</td></tr>
    </table>
  </div>

  <div class="section">
    <h2>What Your Service Fee Includes</h2>
    <ul>
      <li>Comprehensive Second Chance Housing Programs List</li>
      <li>Research & Data Compilation Services</li>
      <li>Custom Approval Strategy tailored to your profile</li>
    </ul>
  </div>

  <div class="section">
    <h2>Your Custom Approval Strategy</h2>
    <h3>STEP 1: Search for Rental Properties</h3>
    <p>Select from these housing search websites:</p>
    <ul>
      <li>Zillow.com</li>
      <li>Apartments.com</li>
      <li>On-Site.com</li>
      <li>RentCafe.com</li>
      <li>Renterswarehouse.com</li>
    </ul>
    <p>Pick <strong>3 rental properties</strong> and note their contact details.</p>

    <h3>STEP 2: Contact Recommended Programs</h3>
    <p><strong>Top Recommendations for ${profile.location}:</strong></p>
    <ol>
      <li><strong>GetLeaseReady.com</strong> – Specializes in lease approval for renters with credit challenges</li>
      <li><strong>ForRentNoCreditCheck.com</strong> – Dedicated to helping renters with no credit or bad credit</li>
      <li><strong>SecondChanceHousingList.com</strong> – Free national database of second chance housing options</li>
    </ol>

    <h3>STEP 3: Get Approved and Move In</h3>
    <p>Submit your properties to your chosen program and get approved for your selected rental property!</p>
  </div>

  <div class="section">
    <h2>Important Notes</h2>
    <ul>
      <li>Each program is an independent third-party company with their own requirements</li>
      <li>We have researched and vetted each company on this list</li>
      <li>Always verify program eligibility before applying</li>
      <li>Keep records of all applications and communications</li>
    </ul>
  </div>

  <div class="profile-box">
    <p><strong>Best of luck, ${profile.fullName}!</strong></p>
    <p>If you have questions, contact us at support@secondchancehousinglocator.com</p>
    <p><em>Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</em></p>
  </div>
</body>
</html>`;
}
