/**
 * Lead Purchase Service
 * Handles lead purchases and full contact info access
 */

import { getDb } from "./db";
import { eq, and } from "drizzle-orm";
import { deliveredLeads, leadPackages } from "../drizzle/schema";

export interface LeadWithContactInfo {
  id: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  city: string;
  state: string;
  monthlyIncome: number;
  creditChallenges: string[];
  housingType: string;
  bedrooms: number;
  criminalHistory?: string;
  leadNumber: number;
  totalLeads: number;
  purchasedAt: Date;
}

/**
 * Get a lead with full contact information (after purchase)
 */
export async function getLeadWithContactInfo(
  leadId: number,
  partnerId: number
): Promise<LeadWithContactInfo | null> {
  try {
    const db = await getDb();
    if (!db) {
      console.error("[Lead Purchase] Database connection failed");
      return null;
    }

    // Get the lead
    const lead = await db
      .select()
      .from(deliveredLeads)
      .where(
        and(
          eq(deliveredLeads.id, leadId),
          eq(deliveredLeads.partnerId, partnerId)
        )
      )
      .limit(1);

    if (!lead || lead.length === 0) {
      console.error("[Lead Purchase] Lead not found:", leadId);
      return null;
    }

    const leadData = lead[0];

    // Check if partner has purchased this lead or has active package
    const pkg = await db
      .select()
      .from(leadPackages)
      .where(eq(leadPackages.id, leadData.leadPackageId))
      .limit(1);

    if (!pkg || pkg.length === 0) {
      console.error("[Lead Purchase] Package not found");
      return null;
    }

    const packageData = pkg[0];

    // Check if package is still active and not expired
    if (packageData.isExpired === 1 || (packageData.expiresAt && packageData.expiresAt < new Date())) {
      console.error("[Lead Purchase] Package has expired");
      return null;
    }

    // Parse credit challenges if stored as JSON
    let creditChallenges: string[] = [];
    if (leadData.creditChallenges) {
      try {
        const parsed = JSON.parse(leadData.creditChallenges as any);
        creditChallenges = Array.isArray(parsed) ? parsed : [parsed];
      } catch (e) {
        creditChallenges = [leadData.creditChallenges as unknown as string];
      }
    }

    return {
      id: leadData.id,
      customerName: leadData.customerName,
      customerEmail: leadData.customerEmail ?? "",
      customerPhone: leadData.customerPhone ?? "",
      city: leadData.city,
      state: leadData.state,
      monthlyIncome: typeof leadData.monthlyIncome === 'number' ? leadData.monthlyIncome : 0,
      creditChallenges,
      housingType: leadData.housingType || "",
      bedrooms: typeof leadData.bedrooms === 'number' ? leadData.bedrooms : 0,
      criminalHistory: leadData.criminalHistory || undefined,
      leadNumber: leadData.leadNumber,
      totalLeads: packageData.totalLeads,
      purchasedAt: leadData.createdAt,
    };
  } catch (error) {
    console.error("[Lead Purchase] Error getting lead with contact info:", error);
    return null;
  }
}

/**
 * Get all leads for a partner (with contact info if package is active)
 */
export async function getPartnerLeads(
  partnerId: number,
  includeContactInfo: boolean = false
): Promise<LeadWithContactInfo[]> {
  try {
    const db = await getDb();
    if (!db) {
      console.error("[Lead Purchase] Database connection failed");
      return [];
    }

    // Get all delivered leads for this partner
    const leads = await db
      .select()
      .from(deliveredLeads)
      .where(eq(deliveredLeads.partnerId, partnerId));

    if (!leads || leads.length === 0) {
      return [];
    }

    const result: LeadWithContactInfo[] = [];

    for (const lead of leads) {
      // Get the package
      const pkg = await db
        .select()
        .from(leadPackages)
        .where(eq(leadPackages.id, lead.leadPackageId))
        .limit(1);

      if (!pkg || pkg.length === 0) continue;

      const packageData = pkg[0];

      // Check if we should include contact info
      const shouldIncludeContactInfo =
        includeContactInfo &&
        packageData.isExpired === 0 &&
        (!packageData.expiresAt || packageData.expiresAt > new Date());

      // Parse credit challenges
      let creditChallenges: string[] = [];
      if (lead.creditChallenges) {
        try {
          const parsed = JSON.parse(lead.creditChallenges as any);
          creditChallenges = Array.isArray(parsed) ? parsed : [parsed];
        } catch (e) {
          creditChallenges = [lead.creditChallenges as unknown as string];
        }
      }

      result.push({
        id: lead.id,
        customerName: lead.customerName,
        customerEmail: shouldIncludeContactInfo ? (lead.customerEmail ?? "***@***.***") : "***@***.***",
        customerPhone: shouldIncludeContactInfo ? (lead.customerPhone ?? "***-****") : "***-****",
        city: lead.city,
        state: lead.state,
        monthlyIncome: typeof lead.monthlyIncome === 'number' ? lead.monthlyIncome : 0,
        creditChallenges,
        housingType: lead.housingType || "",
        bedrooms: typeof lead.bedrooms === 'number' ? lead.bedrooms : 0,
        criminalHistory: lead.criminalHistory || undefined,
        leadNumber: lead.leadNumber,
        totalLeads: packageData.totalLeads,
        purchasedAt: lead.createdAt,
      });
    }

    return result;
  } catch (error) {
    console.error("[Lead Purchase] Error getting partner leads:", error);
    return [];
  }
}

/**
 * Get lead purchase history for a partner
 */
export async function getPartnerPurchaseHistory(partnerId: number) {
  try {
    const db = await getDb();
    if (!db) {
      console.error("[Lead Purchase] Database connection failed");
      return [];
    }

    const packages = await db
      .select()
      .from(leadPackages)
      .where(eq(leadPackages.partnerId, partnerId));

    return packages.map((pkg) => ({
      id: pkg.id,
      packageName: pkg.packageName,
      totalLeads: pkg.totalLeads,
      leadsDelivered: pkg.leadsDelivered,
      leadsRemaining: pkg.leadsRemaining,
      totalPrice: pkg.totalPrice.toString(),
      paymentStatus: pkg.paymentStatus,
      paidAt: pkg.paidAt,
      expiresAt: pkg.expiresAt,
      isExpired: pkg.isExpired === 1,
    }));
  } catch (error) {
    console.error("[Lead Purchase] Error getting purchase history:", error);
    return [];
  }
}

/**
 * Mark a lead as contacted
 */
export async function markLeadAsContacted(
  leadId: number,
  partnerId: number
): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) {
      console.error("[Lead Purchase] Database connection failed");
      return false;
    }

    await db
      .update(deliveredLeads)
      .set({ status: "opened" })
      .where(
        and(
          eq(deliveredLeads.id, leadId),
          eq(deliveredLeads.partnerId, partnerId)
        )
      );

    return true;
  } catch (error) {
    console.error("[Lead Purchase] Error marking lead as contacted:", error);
    return false;
  }
}

/**
 * Mark a lead as purchased/converted
 */
export async function markLeadAsPurchased(
  leadId: number,
  partnerId: number
): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) {
      console.error("[Lead Purchase] Database connection failed");
      return false;
    }

    await db
      .update(deliveredLeads)
      .set({ status: "purchased", buyButtonClickedAt: new Date() })
      .where(
        and(
          eq(deliveredLeads.id, leadId),
          eq(deliveredLeads.partnerId, partnerId)
        )
      );

    return true;
  } catch (error) {
    console.error("[Lead Purchase] Error marking lead as purchased:", error);
    return false;
  }
}
