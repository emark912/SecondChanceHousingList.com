/**
 * Partnership Lead Package Expiration Cron Job
 * Marks packages as expired when all leads have been delivered
 * Sends expiration notification emails to partners
 */

import { getDb } from "./db";
import { eq, and, lte } from "drizzle-orm";
import { leadPackages, partnerPrograms } from "../drizzle/schema";
import { sendPartnerEmail } from "./partner-email-service";

/**
 * Check and expire lead packages where all leads have been delivered
 * Should be called periodically (e.g., via cron job)
 */
export async function expireLeadPackagesJob(): Promise<void> {
  try {
    console.log("[Partnership Expiration] Starting lead package expiration check");
    const db = await getDb();
    if (!db) {
      console.error("[Partnership Expiration] Database connection failed");
      return;
    }

    // Find packages where all leads have been delivered
    const packagesToExpire = await db
      .select({
        package: leadPackages,
        partner: partnerPrograms,
      })
      .from(leadPackages)
      .innerJoin(partnerPrograms, eq(partnerPrograms.id, leadPackages.partnerId))
      .where(
        and(
          eq(leadPackages.isExpired, 0), // Not already expired
          lte(leadPackages.leadsRemaining, 0) // All leads delivered
        )
      );

    console.log(
      `[Partnership Expiration] Found ${packagesToExpire.length} packages to expire`
    );

    for (const { package: pkg, partner } of packagesToExpire) {
      try {
        // Mark package as expired
        await db
          .update(leadPackages)
          .set({
            isExpired: 1,
            expiresAt: new Date(),
          })
          .where(eq(leadPackages.id, pkg.id));

        // Send expiration notification email
        await sendPackageExpiredEmail(
          partner.partnerName,
          partner.email,
          pkg.packageName,
          pkg.totalLeads,
          pkg.leadsDelivered || 0,
          partner.id
        );

        console.log(
          `[Partnership Expiration] Package ${pkg.id} marked as expired and notification sent`
        );
      } catch (error) {
        console.error(
          `[Partnership Expiration] Error expiring package ${pkg.id}:`,
          error
        );
      }
    }

    console.log("[Partnership Expiration] Lead package expiration check completed");
  } catch (error) {
    console.error("[Partnership Expiration] Error in expireLeadPackagesJob:", error);
  }
}

/**
 * Send package expired notification email to partner
 */
async function sendPackageExpiredEmail(
  partnerName: string,
  email: string,
  packageName: string,
  totalLeads: number,
  leadsDelivered: number,
  partnerId: number
): Promise<void> {
  try {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">Lead Package Expired</h1>
        </div>
        
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
          <p style="font-size: 16px; margin-bottom: 20px;">Dear ${partnerName},</p>
          
          <p style="font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
            Your lead package <strong>"${packageName}"</strong> has expired. You have received all <strong>${leadsDelivered} leads</strong> from your package of <strong>${totalLeads} leads</strong> (including 5 bonus leads).
          </p>
          
          <p style="font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
            <strong>What happens next:</strong> You will continue to receive lead data, but without full contact information (phone number and email address blocked). To access the complete contact information for new leads, you'll need to purchase another lead package.
          </p>
          
          <div style="background: white; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 4px;">
            <h3 style="margin-top: 0; color: #667eea;">Ready to keep getting hot leads?</h3>
            <p style="margin-bottom: 15px; font-size: 14px;">
              Purchase a new lead package to continue receiving full contact information for all incoming leads.
            </p>
            <a href="${process.env.VITE_FRONTEND_URL || "https://secondchance-3gdukdvh.manus.space"}/partnership/dashboard-enhanced" 
               style="display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; font-weight: bold;">
              Purchase New Package
            </a>
          </div>
          
          <p style="font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
            <strong>Why our leads are valuable:</strong>
            <ul style="margin: 10px 0; padding-left: 20px;">
              <li>Hot leads delivered instantly when customers submit their rental profiles</li>
              <li>Complete rental profile data with credit challenges and housing needs</li>
              <li>5 bonus leads included in every package</li>
              <li>No expiration date on leads - use them at your own pace</li>
            </ul>
          </p>
          
          <p style="font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
            Questions? Contact us at <a href="mailto:support@secondchancehousing.com" style="color: #667eea; text-decoration: none;">support@secondchancehousing.com</a>
          </p>
          
          <p style="font-size: 12px; color: #999; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px;">
            Best regards,<br>
            <strong>Second Chance Housing List Partnership Team</strong>
          </p>
        </div>
      </div>
    `;

    await sendPartnerEmail({
      to: email,
      subject: `Your Lead Package "${packageName}" Has Expired`,
      html,
      partnerId,
      emailType: "package_expired",
    });

    console.log(
      `[Partnership Expiration] Expiration email sent to ${email}`
    );
  } catch (error) {
    console.error(
      "[Partnership Expiration] Error sending expiration email:",
      error
    );
    throw error;
  }
}
