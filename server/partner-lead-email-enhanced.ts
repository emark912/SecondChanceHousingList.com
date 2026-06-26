/**
 * Enhanced Partner Lead Email Service
 * Sends lead emails with contact info blocking and purchase options
 */

import { sendPartnerEmail } from "./partner-email-service";

export interface LeadEmailData {
  customerName: string;
  city: string;
  state: string;
  housingType: string;
  bedrooms: number;
  monthlyIncome?: number;
  creditChallenges?: string[];
  criminalHistory?: string;
  moveInTimeline?: string;
  customerEmail?: string;
  customerPhone?: string;
}

/**
 * Send trial lead email (blocks contact info, shows BUY button)
 */
export async function sendTrialLeadEmail(
  partnerName: string,
  partnerEmail: string,
  leadData: LeadEmailData,
  leadNumber: number,
  totalLeads: number,
  partnerId: number
): Promise<void> {
  try {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; background-color: #f9f9f9; padding: 20px; border-radius: 8px;">
        <h2 style="color: #1e40af; margin-bottom: 20px;">🔥 HOT LEAD - Trial Lead ${leadNumber} of ${totalLeads}</h2>
        
        <div style="background-color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #1e40af;">
          <h3 style="margin-top: 0; color: #1e40af;">Lead Profile Summary</h3>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
            <div>
              <strong>Location:</strong><br>
              ${leadData.city}, ${leadData.state}
            </div>
            <div>
              <strong>Housing Type:</strong><br>
              ${leadData.housingType}
            </div>
            <div>
              <strong>Bedrooms:</strong><br>
              ${leadData.bedrooms}
            </div>
            <div>
              <strong>Monthly Income:</strong><br>
              ${leadData.monthlyIncome ? `$${leadData.monthlyIncome.toLocaleString()}` : 'Not specified'}
            </div>
          </div>

          ${leadData.creditChallenges && leadData.creditChallenges.length > 0 ? `
            <div style="margin-bottom: 15px;">
              <strong>Credit Challenges:</strong><br>
              ${leadData.creditChallenges.join(', ')}
            </div>
          ` : ''}

          ${leadData.criminalHistory ? `
            <div style="margin-bottom: 15px;">
              <strong>Criminal History:</strong><br>
              ${leadData.criminalHistory}
            </div>
          ` : ''}

          <div style="background-color: #fef3c7; padding: 15px; border-radius: 6px; margin-top: 15px;">
            <strong style="color: #92400e;">⚠️ Contact Information Blocked</strong><br>
            <span style="color: #78350f; font-size: 14px;">This is a trial lead. To view the full contact information (name, email, phone), you must purchase a lead package.</span>
          </div>
        </div>

        <div style="background-color: #dbeafe; padding: 20px; border-radius: 8px; margin-bottom: 20px; text-align: center; border: 2px solid #1e40af;">
          <h3 style="margin-top: 0; color: #1e40af;">Ready to Contact This Lead?</h3>
          <p style="margin: 10px 0; color: #1e3a8a;">Purchase a lead package to unlock full contact information and start reaching out to qualified prospects immediately.</p>
          <a href="https://secondchance-3gdukdvh.manus.space/partnership/dashboard?partnerId=${partnerId}&action=purchase" 
             style="display: inline-block; background-color: #1e40af; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 10px;">
            🔓 BUY THIS LEAD
          </a>
        </div>

        <div style="background-color: #f0fdf4; padding: 15px; border-radius: 8px; border-left: 4px solid #16a34a;">
          <strong style="color: #15803d;">💡 Bonus Leads Included</strong><br>
          <span style="color: #166534; font-size: 14px;">Every lead package includes 5 bonus leads at no extra cost to account for lead quality variations.</span>
        </div>

        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280;">
          <p style="margin: 5px 0;">This is a trial lead from your partnership with SecondChance Housing Locator.</p>
          <p style="margin: 5px 0;">Trial leads are provided to help you evaluate lead quality before purchasing a package.</p>
        </div>
      </div>
    `;

    await sendPartnerEmail({
      to: partnerEmail,
      subject: `🔥 HOT LEAD #${leadNumber} - ${leadData.city}, ${leadData.state} | Trial Lead`,
      html,
      partnerId,
      emailType: "trial_lead",
    });
  } catch (error) {
    console.error("[Lead Email] Error sending trial lead email:", error);
  }
}

/**
 * Send purchased lead email (includes full contact info)
 */
export async function sendPurchasedLeadEmail(
  partnerName: string,
  partnerEmail: string,
  leadData: LeadEmailData,
  leadNumber: number,
  totalLeads: number,
  partnerId: number
): Promise<void> {
  try {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; background-color: #f9f9f9; padding: 20px; border-radius: 8px;">
        <h2 style="color: #16a34a; margin-bottom: 20px;">✅ PURCHASED LEAD - Lead ${leadNumber} of ${totalLeads}</h2>
        
        <div style="background-color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #16a34a;">
          <h3 style="margin-top: 0; color: #16a34a;">Complete Lead Profile</h3>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
            <div>
              <strong>Full Name:</strong><br>
              ${leadData.customerName}
            </div>
            <div>
              <strong>Email:</strong><br>
              <a href="mailto:${leadData.customerEmail}" style="color: #1e40af; text-decoration: none;">${leadData.customerEmail}</a>
            </div>
            <div>
              <strong>Phone:</strong><br>
              <a href="tel:${leadData.customerPhone}" style="color: #1e40af; text-decoration: none;">${leadData.customerPhone}</a>
            </div>
            <div>
              <strong>Location:</strong><br>
              ${leadData.city}, ${leadData.state}
            </div>
            <div>
              <strong>Housing Type:</strong><br>
              ${leadData.housingType}
            </div>
            <div>
              <strong>Bedrooms:</strong><br>
              ${leadData.bedrooms}
            </div>
            <div>
              <strong>Monthly Income:</strong><br>
              ${leadData.monthlyIncome ? `$${leadData.monthlyIncome.toLocaleString()}` : 'Not specified'}
            </div>
            <div>
              <strong>Move-in Timeline:</strong><br>
              ${leadData.moveInTimeline || 'Flexible'}
            </div>
          </div>

          ${leadData.creditChallenges && leadData.creditChallenges.length > 0 ? `
            <div style="margin-bottom: 15px;">
              <strong>Credit Challenges:</strong><br>
              ${leadData.creditChallenges.join(', ')}
            </div>
          ` : ''}

          ${leadData.criminalHistory ? `
            <div style="margin-bottom: 15px;">
              <strong>Criminal History:</strong><br>
              ${leadData.criminalHistory}
            </div>
          ` : ''}
        </div>

        <div style="background-color: #dcfce7; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #16a34a;">
          <strong style="color: #166534;">✅ Full Contact Information Unlocked</strong><br>
          <span style="color: #166534; font-size: 14px;">You now have access to this lead's complete contact information. Reach out today to promote your Second Chance Housing Program!</span>
        </div>

        <div style="background-color: #f0fdf4; padding: 15px; border-radius: 8px; border-left: 4px solid #16a34a;">
          <strong style="color: #15803d;">💡 Quick Outreach Tips</strong><br>
          <ul style="margin: 10px 0; padding-left: 20px; color: #166534; font-size: 14px;">
            <li>Personalize your message with the lead's name and location</li>
            <li>Mention specific programs that match their credit challenges</li>
            <li>Lead was submitted within the last 24 hours - strike while it's hot!</li>
            <li>Track your conversions to measure ROI</li>
          </ul>
        </div>

        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280;">
          <p style="margin: 5px 0;">This is a purchased lead from your partnership with SecondChance Housing Locator.</p>
          <p style="margin: 5px 0;">Leads remain valid for 90 days from purchase. After that, your package will expire and you'll need to purchase a new one.</p>
        </div>
      </div>
    `;

    await sendPartnerEmail({
      to: partnerEmail,
      subject: `✅ PURCHASED LEAD #${leadNumber} - ${leadData.customerName} | ${leadData.city}, ${leadData.state}`,
      html,
      partnerId,
      emailType: "purchased_lead",
    });
  } catch (error) {
    console.error("[Lead Email] Error sending purchased lead email:", error);
  }
}

/**
 * Send expired package notification
 */
export async function sendPackageExpiredNotification(
  partnerName: string,
  partnerEmail: string,
  packageName: string,
  totalLeads: number,
  leadsUsed: number,
  partnerId: number
): Promise<void> {
  try {
    const leadsRemaining = totalLeads - leadsUsed;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; background-color: #f9f9f9; padding: 20px; border-radius: 8px;">
        <h2 style="color: #dc2626; margin-bottom: 20px;">⏰ Your Lead Package Has Expired</h2>
        
        <div style="background-color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #dc2626;">
          <p>Hi ${partnerName},</p>
          
          <p>Your lead package "${packageName}" has expired and is no longer active.</p>
          
          <div style="background-color: #fef2f2; padding: 15px; border-radius: 6px; margin-bottom: 15px;">
            <strong style="color: #7f1d1d;">Package Summary:</strong><br>
            <div style="margin-top: 10px; font-size: 14px; color: #7f1d1d;">
              <div>Total Leads Purchased: ${totalLeads}</div>
              <div>Leads Delivered: ${leadsUsed}</div>
              <div>Leads Remaining: ${leadsRemaining}</div>
            </div>
          </div>

          <p>To continue receiving hot leads from credit-challenged renters seeking housing, you'll need to purchase a new lead package.</p>
        </div>

        <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin-bottom: 20px; text-align: center; border: 2px solid #d97706;">
          <h3 style="margin-top: 0; color: #b45309;">Ready to Get More Leads?</h3>
          <p style="margin: 10px 0; color: #92400e;">Don't miss out on qualified prospects. Purchase a new lead package today!</p>
          <a href="https://secondchance-3gdukdvh.manus.space/partnership/dashboard?partnerId=${partnerId}&action=purchase" 
             style="display: inline-block; background-color: #d97706; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 10px;">
            🛒 Purchase New Package
          </a>
        </div>

        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px;">
          <strong style="color: #374151;">Our Lead Packages:</strong><br>
          <ul style="margin: 10px 0; padding-left: 20px; color: #4b5563; font-size: 14px;">
            <li>10 Leads + 5 Bonus = $50.00</li>
            <li>50 Leads + 5 Bonus = $250.00</li>
            <li>100 Leads + 5 Bonus = $500.00</li>
            <li>200 Leads + 5 Bonus = $1,000.00</li>
            <li>400 Leads + 5 Bonus = $2,000.00</li>
            <li>800 Leads + 5 Bonus = $4,000.00</li>
          </ul>
        </div>

        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280;">
          <p style="margin: 5px 0;">All packages include 5 bonus leads at no extra cost.</p>
        </div>
      </div>
    `;

    await sendPartnerEmail({
      to: partnerEmail,
      subject: `⏰ Your Lead Package "${packageName}" Has Expired`,
      html,
      partnerId,
      emailType: "package_expired",
    });
  } catch (error) {
    console.error("[Lead Email] Error sending expired package notification:", error);
  }
}

/**
 * Send purchase confirmation email
 */
export async function sendPurchaseConfirmationEmail(
  partnerName: string,
  partnerEmail: string,
  packageName: string,
  totalLeads: number,
  bonusLeads: number,
  price: number,
  partnerId: number
): Promise<void> {
  try {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; background-color: #f9f9f9; padding: 20px; border-radius: 8px;">
        <h2 style="color: #16a34a; margin-bottom: 20px;">✅ Purchase Confirmed!</h2>
        
        <div style="background-color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #16a34a;">
          <p>Hi ${partnerName},</p>
          
          <p>Thank you for purchasing a lead package! Your payment has been processed successfully.</p>
          
          <div style="background-color: #dcfce7; padding: 20px; border-radius: 6px; margin-bottom: 15px;">
            <strong style="color: #166534;">Order Summary:</strong><br>
            <div style="margin-top: 10px; font-size: 14px; color: #166534;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span>Package:</span>
                <strong>${packageName}</strong>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span>Leads Included:</span>
                <strong>${totalLeads - bonusLeads}</strong>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span>Bonus Leads:</span>
                <strong>+ ${bonusLeads}</strong>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px; padding-top: 8px; border-top: 1px solid #86efac;">
                <span>Total Leads:</span>
                <strong>${totalLeads}</strong>
              </div>
              <div style="display: flex; justify-content: space-between; margin-top: 10px; font-size: 16px;">
                <span>Amount Paid:</span>
                <strong>$${price.toFixed(2)}</strong>
              </div>
            </div>
          </div>

          <div style="background-color: #f0fdf4; padding: 15px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid #16a34a;">
            <strong style="color: #15803d;">🎉 You're All Set!</strong><br>
            <span style="color: #166534; font-size: 14px;">Your lead package is now active. You'll start receiving hot leads immediately as renters submit their profiles. Each lead will be sent to your email with full contact information.</span>
          </div>

          <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px;">
            <strong style="color: #92400e;">⏱️ Package Valid For:</strong><br>
            <span style="color: #78350f; font-size: 14px;">90 days from today. After expiration, you'll need to purchase a new package to continue receiving leads.</span>
          </div>
        </div>

        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
          <strong style="color: #374151;">What Happens Next:</strong><br>
          <ol style="margin: 10px 0; padding-left: 20px; color: #4b5563; font-size: 14px;">
            <li>You'll receive leads as soon as renters submit their profiles</li>
            <li>Each lead email includes full contact information (name, email, phone)</li>
            <li>Reach out to leads within 24 hours for best results</li>
            <li>Track your conversions and ROI</li>
          </ol>
        </div>

        <div style="text-align: center; margin-top: 20px;">
          <a href="https://secondchance-3gdukdvh.manus.space/partnership/dashboard?partnerId=${partnerId}" 
             style="display: inline-block; background-color: #1e40af; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            📊 View Your Dashboard
          </a>
        </div>

        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280;">
          <p style="margin: 5px 0;">Questions? Contact our partnership team for support.</p>
        </div>
      </div>
    `;

    await sendPartnerEmail({
      to: partnerEmail,
      subject: `✅ Purchase Confirmed - ${packageName}`,
      html,
      partnerId,
      emailType: "purchase_confirmation",
    });
  } catch (error) {
    console.error("[Lead Email] Error sending purchase confirmation:", error);
  }
}
