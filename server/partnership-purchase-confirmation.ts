/**
 * Partnership Purchase Confirmation Email Service
 * Sends confirmation emails when partners purchase lead packages
 */

import { sendPartnerEmail } from "./partner-email-service";

export interface PurchaseConfirmationData {
  partnerName: string;
  partnerEmail: string;
  packageName: string;
  totalLeads: number;
  bonusLeads: number;
  pricePerLead: number;
  totalPrice: number;
  transactionId: string;
  partnerId: number;
}

/**
 * Send purchase confirmation email to partner
 */
export async function sendPurchaseConfirmationEmail(
  data: PurchaseConfirmationData
): Promise<void> {
  try {
    const totalLeadsWithBonus = data.totalLeads + data.bonusLeads;
    const effectivePricePerLead = (data.totalPrice / totalLeadsWithBonus).toFixed(2);

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">✓ Purchase Confirmed</h1>
          <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">Your lead package is now active</p>
        </div>
        
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
          <p style="font-size: 16px; margin-bottom: 20px;">Dear ${data.partnerName},</p>
          
          <p style="font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
            Thank you for your purchase! Your lead package is now active and you'll start receiving hot leads immediately.
          </p>
          
          <div style="background: white; border: 2px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 4px;">
            <h3 style="margin-top: 0; color: #667eea; text-align: center;">Order Summary</h3>
            
            <table style="width: 100%; margin: 15px 0;">
              <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 10px 0; font-size: 14px;"><strong>Package Name:</strong></td>
                <td style="padding: 10px 0; font-size: 14px; text-align: right;">${data.packageName}</td>
              </tr>
              <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 10px 0; font-size: 14px;"><strong>Leads Purchased:</strong></td>
                <td style="padding: 10px 0; font-size: 14px; text-align: right;">${data.totalLeads} leads</td>
              </tr>
              <tr style="border-bottom: 1px solid #eee; background: #f0f7ff;">
                <td style="padding: 10px 0; font-size: 14px;"><strong>Bonus Leads (5%):</strong></td>
                <td style="padding: 10px 0; font-size: 14px; text-align: right; color: #667eea;"><strong>+${data.bonusLeads} leads</strong></td>
              </tr>
              <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 10px 0; font-size: 14px;"><strong>Total Leads:</strong></td>
                <td style="padding: 10px 0; font-size: 14px; text-align: right;"><strong>${totalLeadsWithBonus} leads</strong></td>
              </tr>
              <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 10px 0; font-size: 14px;"><strong>Price Per Lead:</strong></td>
                <td style="padding: 10px 0; font-size: 14px; text-align: right;">$${data.pricePerLead.toFixed(2)}</td>
              </tr>
              <tr style="background: #f0f7ff;">
                <td style="padding: 15px 0; font-size: 16px;"><strong>Total Amount Paid:</strong></td>
                <td style="padding: 15px 0; font-size: 16px; text-align: right; color: #667eea;"><strong>$${data.totalPrice.toFixed(2)}</strong></td>
              </tr>
            </table>
            
            <p style="font-size: 12px; color: #999; margin: 10px 0 0 0;">
              <strong>Effective Price Per Lead:</strong> $${effectivePricePerLead} (with bonus leads included)
            </p>
          </div>
          
          <div style="background: #e8f5e9; border-left: 4px solid #4caf50; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; font-size: 14px; color: #2e7d32;">
              <strong>🚀 Your leads are being delivered now!</strong> You'll receive new leads as soon as customers submit their rental profiles. Each email will show which lead number it is (e.g., "Lead 1 of 55").
            </p>
          </div>
          
          <h3 style="color: #667eea; margin-top: 25px; margin-bottom: 15px;">What to Expect:</h3>
          <ul style="font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
            <li><strong>Instant Lead Delivery:</strong> Leads are sent within seconds of customer submission</li>
            <li><strong>Complete Profile Data:</strong> Full rental profile with contact information, income, credit challenges, and housing needs</li>
            <li><strong>Lead Counter:</strong> Each lead shows its position (e.g., "Lead 1 of 55")</li>
            <li><strong>No Expiration:</strong> Use your leads at your own pace - they don't expire</li>
            <li><strong>Dashboard Access:</strong> Track your leads and purchase history in your partner dashboard</li>
          </ul>
          
          <div style="background: white; border: 1px solid #ddd; padding: 20px; margin: 20px 0; border-radius: 4px;">
            <h3 style="margin-top: 0; color: #333;">Transaction Details:</h3>
            <p style="font-size: 14px; margin: 10px 0;">
              <strong>Transaction ID:</strong> ${data.transactionId}
            </p>
            <p style="font-size: 12px; color: #999; margin: 10px 0 0 0;">
              A receipt has been sent to your email address. Please keep this for your records.
            </p>
          </div>
          
          <div style="background: white; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 4px;">
            <h3 style="margin-top: 0; color: #667eea;">Access Your Dashboard</h3>
            <p style="font-size: 14px; margin-bottom: 15px;">
              View your leads, track conversions, and manage your account:
            </p>
            <a href="${process.env.VITE_FRONTEND_URL || "https://secondchance-3gdukdvh.manus.space"}/partnership/dashboard-enhanced" 
               style="display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; font-weight: bold;">
              Go to Partner Dashboard
            </a>
          </div>
          
          <p style="font-size: 14px; line-height: 1.6; margin-top: 25px; margin-bottom: 20px;">
            <strong>Questions or need support?</strong> Contact us at <a href="mailto:support@secondchancehousing.com" style="color: #667eea; text-decoration: none;">support@secondchancehousing.com</a>
          </p>
          
          <p style="font-size: 12px; color: #999; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px;">
            Best regards,<br>
            <strong>Second Chance Housing List Partnership Team</strong><br>
            <br>
            <em>This is an automated email. Please do not reply directly to this message.</em>
          </p>
        </div>
      </div>
    `;

    await sendPartnerEmail({
      to: data.partnerEmail,
      subject: `Purchase Confirmation: ${data.packageName} - ${totalLeadsWithBonus} Leads`,
      html,
      partnerId: data.partnerId,
      emailType: "purchase_confirmation",
    });

    console.log(
      `[Purchase Confirmation] Email sent to ${data.partnerEmail} for transaction ${data.transactionId}`
    );
  } catch (error) {
    console.error("[Purchase Confirmation] Error sending confirmation email:", error);
    throw error;
  }
}
