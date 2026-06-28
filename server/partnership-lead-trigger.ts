/**
 * Partnership Lead Delivery Trigger
 * Automatically delivers rental leads to partners when new submissions are received.
 * After a partner's trial ends, leads continue to arrive but contact info is locked
 * until they purchase a package.
 */

import { getDb } from "./db";
import { eq, gt, and, isNotNull, sql } from "drizzle-orm";
import {
  partnerPrograms,
  leadPackages,
  deliveredLeads,
  searchSubmissions,
  lockedLeads,
} from "../drizzle/schema";
import { sendPartnerEmail } from "./partner-email-service";
import {
  sendTrialLeadEmail,
  sendPurchasedLeadEmail,
  sendPackageExpiredNotification,
} from "./partner-lead-email-enhanced";
import { getPartnerById } from "./partner-db";
import { notifyOwner } from "./_core/notification";

/**
 * Build the lead data object from a rental submission row.
 */
function buildLeadData(rental: any) {
  return {
    customerName: rental.customerName as string,
    customerEmail: rental.customerEmail as string,
    customerPhone: (rental.customerPhone || "") as string,
    city: rental.city as string,
    state: rental.state as string,
    monthlyIncome: typeof rental.monthlyTakeHomeIncome === "number"
      ? rental.monthlyTakeHomeIncome
      : 0,
    creditChallenges: rental.creditChallenges
      ? JSON.parse(rental.creditChallenges as any)
      : [],
    housingType: rental.housingType as string,
    bedrooms: typeof rental.bedrooms === "number" ? rental.bedrooms : 0,
    criminalHistory: rental.criminalHistoryDetails || undefined,
  };
}

/**
 * Send a "Trial Ended" email to a partner who just used their last trial lead.
 */
async function sendTrialEndedEmail(
  partnerName: string,
  partnerEmail: string,
  partnerId: number,
  totalLeadsReceived: number
): Promise<void> {
  const dashboardUrl = `https://secondchancehousinglocator.com/partnership/dashboard?partnerId=${partnerId}&action=purchase`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; background-color: #f9f9f9; padding: 20px; border-radius: 8px;">
      <h2 style="color: #1e40af; margin-bottom: 10px;">Your Trial Period Has Ended</h2>
      <p style="color: #374151; font-size: 15px;">Hi ${partnerName},</p>
      <p style="color: #374151; font-size: 15px;">
        You have received all <strong>${totalLeadsReceived} trial leads</strong> from your SecondChance Housing Locator partnership trial.
        We hope the leads demonstrated the quality and volume of renters actively searching for housing in your market.
      </p>

      <div style="background-color: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #1e40af;">
        <h3 style="margin-top: 0; color: #1e40af;">Leads Are Still Coming — But Contact Info Is Locked</h3>
        <p style="color: #1e3a8a; margin: 0;">
          You will continue to receive lead notifications for every new renter submission in your area.
          However, the renter's name, email, and phone number will remain hidden until you activate a lead package.
          <strong>Purchase a package to instantly unlock all pending leads and every future lead.</strong>
        </p>
      </div>

      <div style="text-align: center; margin: 25px 0;">
        <a href="${dashboardUrl}"
           style="display: inline-block; background-color: #1e40af; color: white; padding: 14px 36px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
          🔓 Activate My Lead Package
        </a>
      </div>

      <div style="background-color: #f0fdf4; padding: 15px; border-radius: 8px; border-left: 4px solid #16a34a; margin-top: 20px;">
        <strong style="color: #15803d;">What happens when you purchase?</strong>
        <ul style="color: #166534; margin: 8px 0 0 0; padding-left: 20px;">
          <li>All locked leads you have already received will be instantly unlocked with full contact details.</li>
          <li>Every new submission will arrive with full contact info immediately.</li>
          <li>Leads count against your package starting from your first unlock.</li>
        </ul>
      </div>

      <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280;">
        <p style="margin: 5px 0;">SecondChance Housing Locator Partnership Program</p>
        <p style="margin: 5px 0;">Questions? Reply to this email or visit your partner dashboard.</p>
      </div>
    </div>
  `;

  await sendPartnerEmail({
    to: partnerEmail,
    subject: `Your trial has ended — ${totalLeadsReceived} leads received | Activate to unlock contact info`,
    html,
    partnerId,
    emailType: "trial_ended",
  });
}

/**
 * Send a locked lead email (contact info blocked, upgrade CTA).
 */
async function sendLockedLeadEmail(
  partnerName: string,
  partnerEmail: string,
  leadData: ReturnType<typeof buildLeadData>,
  lockedLeadNumber: number,
  partnerId: number
): Promise<void> {
  const purchaseUrl = `https://secondchancehousinglocator.com/partnership/dashboard?partnerId=${partnerId}&action=purchase`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; background-color: #f9f9f9; padding: 20px; border-radius: 8px;">
      <h2 style="color: #1e40af; margin-bottom: 20px;">🔥 HOT LEAD #${lockedLeadNumber} — Contact Info Locked</h2>

      <div style="background-color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #1e40af;">
        <h3 style="margin-top: 0; color: #1e40af;">Lead Profile Summary</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
          <div><strong>Location:</strong><br>${leadData.city}, ${leadData.state}</div>
          <div><strong>Housing Type:</strong><br>${leadData.housingType}</div>
          <div><strong>Bedrooms:</strong><br>${leadData.bedrooms}</div>
          <div><strong>Monthly Income:</strong><br>${leadData.monthlyIncome ? `$${Number(leadData.monthlyIncome).toLocaleString()}` : "Not specified"}</div>
        </div>
        ${leadData.creditChallenges && leadData.creditChallenges.length > 0 ? `
          <div style="margin-bottom: 15px;">
            <strong>Credit Challenges:</strong><br>${leadData.creditChallenges.join(", ")}
          </div>` : ""}
        ${leadData.criminalHistory ? `
          <div style="margin-bottom: 15px;">
            <strong>Criminal History:</strong><br>${leadData.criminalHistory}
          </div>` : ""}

        <div style="background-color: #fee2e2; padding: 15px; border-radius: 6px; margin-top: 15px; border: 1px solid #fca5a5;">
          <strong style="color: #991b1b;">🔒 Contact Information Locked</strong><br>
          <span style="color: #7f1d1d; font-size: 14px;">
            Name, email, and phone number are hidden. Activate a lead package to view full contact details for this lead and all future leads.
          </span>
        </div>
      </div>

      <div style="background-color: #dbeafe; padding: 20px; border-radius: 8px; margin-bottom: 20px; text-align: center; border: 2px solid #1e40af;">
        <h3 style="margin-top: 0; color: #1e40af;">Unlock This Lead's Full Contact Details</h3>
        <p style="margin: 10px 0; color: #1e3a8a;">
          You must sign up and activate a lead package to view this lead's full contact details.
          Once activated, <strong>all locked leads are instantly unlocked</strong> — including this one.
        </p>
        <a href="${purchaseUrl}"
           style="display: inline-block; background-color: #1e40af; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 10px; font-size: 15px;">
          🔓 You must sign up and activate for a lead package to view this lead's full contact details
        </a>
      </div>

      <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280;">
        <p style="margin: 5px 0;">This lead is being held for you. Purchase a package to unlock it and all future leads.</p>
        <p style="margin: 5px 0;">SecondChance Housing Locator Partnership Program</p>
      </div>
    </div>
  `;

  await sendPartnerEmail({
    to: partnerEmail,
    subject: `🔒 Locked Lead #${lockedLeadNumber} — ${leadData.city}, ${leadData.state} | Activate to unlock`,
    html,
    partnerId,
    emailType: "locked_lead",
  });
}

/**
 * Deliver a rental lead to all active partners.
 * Called when a new rental submission is created.
 */
export async function deliverLeadToPartners(submissionId: number): Promise<void> {
  try {
    const db = await getDb();
    if (!db) {
      console.error("[Lead Trigger] Database connection failed");
      return;
    }

    // Get the rental submission
    const submission = await db
      .select()
      .from(searchSubmissions)
      .where(eq(searchSubmissions.id, submissionId))
      .limit(1);

    if (!submission || submission.length === 0) {
      console.error("[Lead Trigger] Submission not found:", submissionId);
      return;
    }

    const rental = submission[0];

    // Get all active partners with available paid lead packages
    const activePartners = await db
      .select({
        partner: partnerPrograms,
        package: leadPackages,
      })
      .from(partnerPrograms)
      .innerJoin(
        leadPackages,
        and(
          eq(leadPackages.partnerId, partnerPrograms.id),
          gt(leadPackages.leadsRemaining, 0),
          isNotNull(leadPackages.expiresAt)
        )
      )
      .where(
        and(
          eq(partnerPrograms.isVerified, 1),
          eq(partnerPrograms.status, "active")
        )
      );

    const paidPartnerIds = new Set(activePartners.map(({ partner }) => partner.id));

    // Trial partners: still have trial leads remaining
    const trialPartners = await db
      .select()
      .from(partnerPrograms)
      .where(
        and(
          eq(partnerPrograms.isVerified, 1),
          eq(partnerPrograms.status, "active"),
          gt(partnerPrograms.trialLeadsRemaining, 0)
        )
      );
    const trialOnlyPartners = trialPartners.filter(p => !paidPartnerIds.has(p.id));

    // Post-trial partners: trial ended, no paid package — receive locked leads
    const postTrialPartners = await db
      .select()
      .from(partnerPrograms)
      .where(
        and(
          eq(partnerPrograms.isVerified, 1),
          eq(partnerPrograms.status, "active"),
          eq(partnerPrograms.trialEnded, 1)
        )
      );
    const postTrialOnlyPartners = postTrialPartners.filter(p => !paidPartnerIds.has(p.id));

    console.log(
      `[Lead Trigger] Paid: ${activePartners.length}, Trial: ${trialOnlyPartners.length}, Post-trial (locked): ${postTrialOnlyPartners.length}`
    );

    // ── 1. Deliver trial leads ──────────────────────────────────────────────
    for (const partner of trialOnlyPartners) {
      try {
        const [deliveredCount] = await db
          .select({ count: sql<number>`count(*)` })
          .from(deliveredLeads)
          .where(eq(deliveredLeads.partnerId, partner.id));
        const leadNumber = (deliveredCount ? Number(deliveredCount.count) : 0) + 1;
        const leadData = buildLeadData(rental);

        // Log the delivered lead
        await db.insert(deliveredLeads).values({
          partnerId: partner.id,
          leadPackageId: 0,
          submissionId,
          leadNumber,
          customerName: rental.customerName,
          customerEmail: rental.customerEmail,
          customerPhone: rental.customerPhone || "",
          city: rental.city,
          state: rental.state,
          monthlyIncome: rental.monthlyTakeHomeIncome,
          creditChallenges: rental.creditChallenges,
          housingType: rental.housingType,
          bedrooms: rental.bedrooms,
          criminalHistory: rental.criminalHistoryDetails,
          status: "sent",
          emailSentAt: new Date(),
        });

        const newRemaining = partner.trialLeadsRemaining - 1;

        // Decrement trial leads remaining; mark trialEnded if this was the last one
        if (newRemaining <= 0) {
          await db
            .update(partnerPrograms)
            .set({ trialLeadsRemaining: 0, trialEnded: 1 })
            .where(eq(partnerPrograms.id, partner.id));
        } else {
          await db
            .update(partnerPrograms)
            .set({ trialLeadsRemaining: newRemaining })
            .where(eq(partnerPrograms.id, partner.id));
        }

        // Send trial lead email
        await sendTrialLeadEmail(
          partner.partnerName,
          partner.email,
          leadData,
          leadNumber,
          20,
          partner.id
        );

        // If this was the last trial lead, send the "Trial Ended" email and notify owner
        if (newRemaining <= 0) {
          await sendTrialEndedEmail(
            partner.partnerName,
            partner.email,
            partner.id,
            leadNumber
          );
          try {
            await notifyOwner({
              title: `Trial Ended: ${partner.partnerName}`,
              content: `Partner ${partner.partnerName} (${partner.email}) has exhausted their ${leadNumber}-lead trial. They are now receiving locked leads. Follow up to convert them to a paid package.`,
            });
          } catch (_) { /* non-critical */ }
          console.log(`[Lead Trigger] Trial ended for partner ${partner.id} — "Trial Ended" email sent`);
        }

        console.log(`[Lead Trigger] Trial lead #${leadNumber} delivered to partner ${partner.id} (${partner.email})`);
      } catch (error) {
        console.error(`[Lead Trigger] Error delivering trial lead to partner ${partner.id}:`, error);
      }
    }

    // ── 2. Deliver locked leads to post-trial partners ──────────────────────
    for (const partner of postTrialOnlyPartners) {
      try {
        // Count existing locked leads for this partner to get the next number
        const [lockedCount] = await db
          .select({ count: sql<number>`count(*)` })
          .from(lockedLeads)
          .where(eq(lockedLeads.partnerId, partner.id));
        const lockedLeadNumber = (lockedCount ? Number(lockedCount.count) : 0) + 1;

        const leadData = buildLeadData(rental);

        // Store in locked_leads queue
        await db.insert(lockedLeads).values({
          partnerId: partner.id,
          submissionId,
          leadNumber: lockedLeadNumber,
          leadData: {
            city: rental.city,
            state: rental.state,
            housingType: rental.housingType,
            bedrooms: typeof rental.bedrooms === "number" ? rental.bedrooms : 0,
            monthlyIncome: String(rental.monthlyTakeHomeIncome || ""),
            creditChallenges: rental.creditChallenges
              ? JSON.parse(rental.creditChallenges as any)
              : [],
            criminalHistory: rental.criminalHistoryDetails || undefined,
            customerName: rental.customerName,
            customerEmail: rental.customerEmail,
            customerPhone: rental.customerPhone || "",
          },
          unlocked: 0,
        });

        // Send locked lead email
        await sendLockedLeadEmail(
          partner.partnerName,
          partner.email,
          leadData,
          lockedLeadNumber,
          partner.id
        );

        console.log(`[Lead Trigger] Locked lead #${lockedLeadNumber} sent to post-trial partner ${partner.id}`);
      } catch (error) {
        console.error(`[Lead Trigger] Error delivering locked lead to partner ${partner.id}:`, error);
      }
    }

    // ── 3. Deliver paid leads ───────────────────────────────────────────────
    for (const { partner, package: pkg } of activePartners) {
      try {
        await db.insert(deliveredLeads).values({
          partnerId: partner.id,
          leadPackageId: pkg.id,
          submissionId,
          leadNumber: pkg.leadsDelivered + 1,
          customerName: rental.customerName,
          customerEmail: rental.customerEmail,
          customerPhone: rental.customerPhone || "",
          city: rental.city,
          state: rental.state,
          monthlyIncome: rental.monthlyTakeHomeIncome,
          creditChallenges: rental.creditChallenges,
          housingType: rental.housingType,
          bedrooms: rental.bedrooms,
          criminalHistory: rental.criminalHistoryDetails,
          status: "sent",
          emailSentAt: new Date(),
        });

        await db
          .update(leadPackages)
          .set({
            leadsRemaining: pkg.leadsRemaining - 1,
            leadsDelivered: pkg.leadsDelivered + 1,
          })
          .where(eq(leadPackages.id, pkg.id));

        const leadData = buildLeadData(rental);
        const isTrial = pkg.paymentStatus === "pending";

        if (isTrial) {
          await sendTrialLeadEmail(
            partner.partnerName,
            partner.email,
            leadData,
            (pkg.leadsDelivered || 0) + 1,
            pkg.totalLeads,
            partner.id
          );
        } else {
          await sendPurchasedLeadEmail(
            partner.partnerName,
            partner.email,
            leadData,
            (pkg.leadsDelivered || 0) + 1,
            pkg.totalLeads,
            partner.id
          );
        }

        console.log(`[Lead Trigger] Paid lead delivered to partner ${partner.id}`);
      } catch (error) {
        console.error(`[Lead Trigger] Error delivering paid lead to partner ${partner.id}:`, error);
      }
    }
  } catch (error) {
    console.error("[Lead Trigger] Error in deliverLeadToPartners:", error);
  }
}

/**
 * Unlock all queued locked leads for a partner after they purchase a package.
 * Sends the full contact info for each locked lead and counts them against the new package.
 * Call this from the Stripe webhook after a successful purchase.
 */
export async function unlockLockedLeadsForPartner(
  partnerId: number,
  leadPackageId: number
): Promise<number> {
  let leadsUnlocked = 0;
  try {
    const db = await getDb();
    if (!db) return 0;
    const partner = await getPartnerById(partnerId);
    if (!partner) return 0;;

    // Get all undelivered locked leads for this partner
    const pending = await db
      .select()
      .from(lockedLeads)
      .where(
        and(
          eq(lockedLeads.partnerId, partnerId),
          eq(lockedLeads.unlocked, 0)
        )
      );

    if (pending.length === 0) {
      console.log(`[Unlock] No locked leads to unlock for partner ${partnerId}`);
      return 0;
    }

    // Get the package to count leads against it
    const [pkg] = await db
      .select()
      .from(leadPackages)
      .where(eq(leadPackages.id, leadPackageId))
      .limit(1);

    let leadsUnlocked = 0;

    for (const locked of pending) {
      try {
        const ld = locked.leadData as any;
        const leadNumber = (pkg?.leadsDelivered || 0) + leadsUnlocked + 1;

        // Insert into delivered_leads with full contact info
        await db.insert(deliveredLeads).values({
          leadPackageId,
          partnerId,
          submissionId: locked.submissionId,
          leadNumber,
          customerName: ld.customerName,
          customerEmail: ld.customerEmail,
          customerPhone: ld.customerPhone || "",
          city: ld.city,
          state: ld.state,
          monthlyIncome: ld.monthlyIncome ? String(ld.monthlyIncome) : null,
          creditChallenges: ld.creditChallenges || [],
          housingType: ld.housingType,
          bedrooms: ld.bedrooms,
          criminalHistory: ld.criminalHistory,
          status: "sent",
          emailSentAt: new Date(),
        });

        // Send full contact info email
        await sendPurchasedLeadEmail(
          partner.partnerName,
          partner.email,
          {
            customerName: ld.customerName,
            customerEmail: ld.customerEmail,
            customerPhone: ld.customerPhone || "",
            city: ld.city,
            state: ld.state,
            monthlyIncome: ld.monthlyIncome ? Number(ld.monthlyIncome) : 0,
            creditChallenges: ld.creditChallenges || [],
            housingType: ld.housingType,
            bedrooms: ld.bedrooms,
            criminalHistory: ld.criminalHistory,
          },
          leadNumber,
          pkg?.totalLeads || 0,
          partnerId
        );

        // Mark locked lead as unlocked
        await db
          .update(lockedLeads)
          .set({ unlocked: 1, unlockedAt: new Date() })
          .where(eq(lockedLeads.id, locked.id));

        leadsUnlocked++;
      } catch (err) {
        console.error(`[Unlock] Error unlocking lead ${locked.id}:`, err);
      }
    }

    // Deduct unlocked leads from the package
    if (pkg && leadsUnlocked > 0) {
      await db
        .update(leadPackages)
        .set({
          leadsRemaining: Math.max(0, (pkg.leadsRemaining || 0) - leadsUnlocked),
          leadsDelivered: (pkg.leadsDelivered || 0) + leadsUnlocked,
        })
        .where(eq(leadPackages.id, leadPackageId));
    }

    // Clear trialEnded flag now that partner has a paid package
    await db
      .update(partnerPrograms)
      .set({ trialEnded: 0 })
      .where(eq(partnerPrograms.id, partnerId));

    console.log(`[Unlock] Unlocked ${leadsUnlocked} locked leads for partner ${partnerId}`);
    return leadsUnlocked;
  } catch (error) {
    console.error("[Unlock] Error in unlockLockedLeadsForPartner:", error);
    return 0;
  }
}

/**
 * Check and expire lead packages that have passed their expiration date.
 * Can be called periodically (e.g., via cron job).
 */
export async function expireLeadPackages(): Promise<void> {
  try {
    const db = await getDb();
    if (!db) {
      console.error("[Lead Trigger] Database connection failed");
      return;
    }

    const now = new Date();

    const expiredPackages = await db
      .select()
      .from(leadPackages)
      .where(
        and(
          isNotNull(leadPackages.expiresAt),
          eq(leadPackages.isExpired, 0)
        )
      );

    for (const pkg of expiredPackages) {
      if (pkg.expiresAt && pkg.expiresAt < now) {
        await db
          .update(leadPackages)
          .set({ isExpired: 1 })
          .where(eq(leadPackages.id, pkg.id));

        const partner = await getPartnerById(pkg.partnerId);
        if (partner) {
          await sendPackageExpiredNotification(
            partner.partnerName,
            partner.email,
            pkg.packageName,
            pkg.totalLeads,
            pkg.leadsDelivered,
            partner.id
          );
        }

        console.log(`[Lead Trigger] Package ${pkg.id} expired`);
      }
    }
  } catch (error) {
    console.error("[Lead Trigger] Error in expireLeadPackages:", error);
  }
}
