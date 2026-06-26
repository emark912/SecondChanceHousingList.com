/**
 * Lead Delivery Service
 * Handles automated delivery of leads to partners
 */

import { getDb } from "./db";
import { 
  searchSubmissions,
  partnerPrograms,
  leadPackages,
  deliveredLeads,
} from "../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { 
  sendLeadDeliveryEmail,
  sendPackageExpiredEmail,
  sendPackageExpiredEmail as sendReminderEmail,
  sendLowLeadsWarningEmail,
} from "./partner-email-service";
import { 
  getPartnerById,
  getActiveLeadPackage,
  createDeliveredLead,
  decrementLeadsRemaining,
  updatePartner,
  updateLeadPackage,
} from "./partner-db";

/**
 * Deliver a new lead to all active partners
 * Called when a new rental submission is received
 */
export async function deliverLeadToPartners(submissionId: number): Promise<void> {
  try {
    const db = await getDb();
    if (!db) return;

    // Get the submission
    const submissions = await db
      .select()
      .from(searchSubmissions)
      .where(eq(searchSubmissions.id, submissionId))
      .limit(1);

    const submission = submissions[0];
    if (!submission) {
      console.log("[Lead Delivery] Submission not found:", submissionId);
      return;
    }

    // Get all active verified partners
    const partners = await db
      .select()
      .from(partnerPrograms)
      .where(
        and(
          eq(partnerPrograms.isVerified, 1),
          eq(partnerPrograms.status, "active")
        )
      );

    console.log(`[Lead Delivery] Delivering lead to ${partners.length} partners`);

    for (const partner of partners) {
      try {
        // Check if partner has trial leads remaining
        if (partner.trialLeadsRemaining > 0) {
          await deliverTrialLead(partner, submission);
          continue;
        }

        // Check if partner has active paid package
        const activePackage = await getActiveLeadPackage(partner.id);
        if (activePackage && activePackage.leadsRemaining > 0) {
          await deliverPaidLead(partner, submission, activePackage);
          continue;
        }

        // Partner has no active leads, skip
      } catch (error) {
        console.error(`[Lead Delivery] Error delivering lead to partner ${partner.id}:`, error);
      }
    }
  } catch (error) {
    console.error("[Lead Delivery] Error in deliverLeadToPartners:", error);
  }
}

/**
 * Deliver a trial lead to a partner
 */
async function deliverTrialLead(partner: any, submission: any): Promise<void> {
  try {
    // Send email with full contact info (trial leads get full access)
    const leadData = {
      customerName: submission.customerName,
      customerEmail: submission.customerEmail,
      customerPhone: submission.customerPhone,
      city: submission.city,
      state: submission.state,
      monthlyIncome: submission.monthlyTakeHomeIncome,
      monthlyBudget: submission.totalHouseholdIncome,
      moveInTimeline: "ASAP", // Default
      creditChallenges: submission.creditChallenges,
      housingType: submission.housingType,
      bedrooms: submission.bedrooms,
      criminalHistory: submission.criminalHistoryDetails,
    };

    const leadNumber = 20 - partner.trialLeadsRemaining + 1;

    await sendLeadDeliveryEmail(
      partner.partnerName,
      partner.email,
      leadData,
      leadNumber,
      20,
      true, // hasFullContact = true for trial leads
      partner.id
    );

    // Decrement trial leads
    const newTrialLeadsRemaining = Math.max(0, partner.trialLeadsRemaining - 1);
    await updatePartner(partner.id, {
      trialLeadsRemaining: newTrialLeadsRemaining,
    });

    // Send low-leads warning when trial leads drop to 1, 2, or 4
    if (newTrialLeadsRemaining > 0 && newTrialLeadsRemaining < 5) {
      const hasCard = !!(partner.stripePaymentMethodId);
      sendLowLeadsWarningEmail(
        partner.partnerName,
        partner.email,
        partner.id,
        newTrialLeadsRemaining,
        hasCard
      ).catch((e: Error) => console.error("[Lead Delivery] Low-leads warning email failed:", e));
    }

    // Log the delivered lead
    await createDeliveredLead({
      leadPackageId: 0, // No package for trial leads
      partnerId: partner.id,
      submissionId: submission.id,
      leadNumber,
      customerName: submission.customerName,
      customerEmail: submission.customerEmail,
      customerPhone: submission.customerPhone,
      city: submission.city,
      state: submission.state,
      monthlyIncome: submission.monthlyTakeHomeIncome,
      monthlyBudget: submission.totalHouseholdIncome,
      moveInTimeline: "ASAP",
      creditChallenges: submission.creditChallenges,
      housingType: submission.housingType,
      bedrooms: submission.bedrooms,
      criminalHistory: submission.criminalHistoryDetails,
      status: "sent",
    });

    console.log(`[Lead Delivery] Trial lead delivered to ${partner.email}`);
  } catch (error) {
    console.error("[Lead Delivery] Error delivering trial lead:", error);
  }
}

/**
 * Deliver a paid lead to a partner
 */
async function deliverPaidLead(partner: any, submission: any, activePackage: any): Promise<void> {
  try {
    // Send email WITHOUT full contact info (they need to buy to see)
    const leadData = {
      customerName: submission.customerName,
      customerEmail: submission.customerEmail,
      customerPhone: submission.customerPhone,
      city: submission.city,
      state: submission.state,
      monthlyIncome: submission.monthlyTakeHomeIncome,
      monthlyBudget: submission.totalHouseholdIncome,
      moveInTimeline: "ASAP",
      creditChallenges: submission.creditChallenges,
      housingType: submission.housingType,
      bedrooms: submission.bedrooms,
      criminalHistory: submission.criminalHistoryDetails,
    };

    const leadNumber = activePackage.leadsDelivered + 1;

    await sendLeadDeliveryEmail(
      partner.partnerName,
      partner.email,
      leadData,
      leadNumber,
      activePackage.totalLeads,
      true, // hasFullContact = true for paid leads
      partner.id
    );

    // Decrement leads remaining
    await decrementLeadsRemaining(activePackage.id);

    // Log the delivered lead
    await createDeliveredLead({
      leadPackageId: activePackage.id,
      partnerId: partner.id,
      submissionId: submission.id,
      leadNumber,
      customerName: submission.customerName,
      customerEmail: submission.customerEmail,
      customerPhone: submission.customerPhone,
      city: submission.city,
      state: submission.state,
      monthlyIncome: submission.monthlyTakeHomeIncome,
      monthlyBudget: submission.totalHouseholdIncome,
      moveInTimeline: "ASAP",
      creditChallenges: submission.creditChallenges,
      housingType: submission.housingType,
      bedrooms: submission.bedrooms,
      criminalHistory: submission.criminalHistoryDetails,
      status: "sent",
    });

    // Fetch updated package to check remaining leads
    const updatedPackage = await getActiveLeadPackage(partner.id);

    // Send low-leads warning when paid package drops below 5
    if (updatedPackage && updatedPackage.leadsRemaining > 0 && updatedPackage.leadsRemaining < 5) {
      const hasCard = !!(partner.stripePaymentMethodId);
      sendLowLeadsWarningEmail(
        partner.partnerName,
        partner.email,
        partner.id,
        updatedPackage.leadsRemaining,
        hasCard
      ).catch((e: Error) => console.error("[Lead Delivery] Low-leads warning email failed:", e));
    }

    // Check if package is now expired
    if (updatedPackage && updatedPackage.leadsRemaining === 0) {
      await updateLeadPackage(activePackage.id, {
        isExpired: 1,
      });

      // Send package expired email
      await sendPackageExpiredEmail(
        partner.partnerName,
        partner.email,
        activePackage.packageName,
        partner.id
      );

      console.log(`[Lead Delivery] Package expired for partner ${partner.email}`);
    }

    console.log(`[Lead Delivery] Paid lead delivered to ${partner.email}`);
  } catch (error) {
    console.error("[Lead Delivery] Error delivering paid lead:", error);
  }
}

/**
 * Send reminders to partners without active packages
 * Scheduled to run daily
 */
export async function sendPackageExpiredReminders(): Promise<void> {
  try {
    const db = await getDb();
    if (!db) return;

    // Get partners with expired packages
    const partners = await db
      .select()
      .from(partnerPrograms)
      .where(
        and(
          eq(partnerPrograms.isVerified, 1),
          eq(partnerPrograms.status, "active")
        )
      );

    for (const partner of partners) {
      // Check if they have active package
      const activePackage = await getActiveLeadPackage(partner.id);
      
      // If no active package and trial is used, send reminder
      if (!activePackage && partner.hasUsedTrial) {
        await sendReminderEmail(
          partner.partnerName,
          partner.email,
          "Your Lead Package",
          partner.id
        );

        console.log(`[Lead Delivery] Reminder sent to ${partner.email}`);
      }
    }
  } catch (error) {
    console.error("[Lead Delivery] Error sending reminders:", error);
  }
}
