/**
 * Partnership Program Database Helpers
 * Handles all database operations for the lead generation partnership program
 */

import { getDb } from "./db";
import { 
  partnerPrograms, 
  leadPackages, 
  deliveredLeads, 
  partnerEmailLogs,
  PartnerProgram,
  InsertPartnerProgram,
  LeadPackage,
  InsertLeadPackage,
  DeliveredLead,
  InsertDeliveredLead,
  PartnerEmailLog,
  InsertPartnerEmailLog
} from "../drizzle/schema";
import { eq, and } from "drizzle-orm";

// ===== PARTNER PROGRAM OPERATIONS =====

export async function createPartner(data: InsertPartnerProgram): Promise<PartnerProgram | null> {
  try {
    const db = await getDb();
    if (!db) return null;

    const result = await db.insert(partnerPrograms).values(data);
    const partnerId = result[0].insertId;
    
    return await getPartnerById(partnerId);
  } catch (error) {
    console.error("[Partner DB] Error creating partner:", error);
    return null;
  }
}

export async function getPartnerById(id: number): Promise<PartnerProgram | null> {
  try {
    const db = await getDb();
    if (!db) return null;

    const result = await db
      .select()
      .from(partnerPrograms)
      .where(eq(partnerPrograms.id, id))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.error("[Partner DB] Error getting partner by ID:", error);
    return null;
  }
}

export async function getPartnerByEmail(email: string): Promise<PartnerProgram | null> {
  try {
    const db = await getDb();
    if (!db) return null;

    const result = await db
      .select()
      .from(partnerPrograms)
      .where(eq(partnerPrograms.email, email))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.error("[Partner DB] Error getting partner by email:", error);
    return null;
  }
}

export async function updatePartner(id: number, data: Partial<PartnerProgram>): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) return false;

    await db
      .update(partnerPrograms)
      .set(data)
      .where(eq(partnerPrograms.id, id));

    return true;
  } catch (error) {
    console.error("[Partner DB] Error updating partner:", error);
    return false;
  }
}

export async function verifyPartnerEmail(id: number, verificationCode: string): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) return false;

    const partner = await getPartnerById(id);
    if (!partner || partner.verificationCode !== verificationCode) {
      return false;
    }

    await db
      .update(partnerPrograms)
      .set({
        isVerified: 1,
        verifiedAt: new Date(),
        status: "active",
        trialStartedAt: new Date(),
        trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      })
      .where(eq(partnerPrograms.id, id));

    return true;
  } catch (error) {
    console.error("[Partner DB] Error verifying partner email:", error);
    return false;
  }
}

// ===== LEAD PACKAGE OPERATIONS =====

export async function createLeadPackage(data: InsertLeadPackage): Promise<LeadPackage | null> {
  try {
    const db = await getDb();
    if (!db) return null;

    const result = await db.insert(leadPackages).values(data);
    const packageId = result[0].insertId;
    
    return await getLeadPackageById(packageId);
  } catch (error) {
    console.error("[Partner DB] Error creating lead package:", error);
    return null;
  }
}

export async function getLeadPackageById(id: number): Promise<LeadPackage | null> {
  try {
    const db = await getDb();
    if (!db) return null;

    const result = await db
      .select()
      .from(leadPackages)
      .where(eq(leadPackages.id, id))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.error("[Partner DB] Error getting lead package by ID:", error);
    return null;
  }
}

export async function getPartnerLeadPackages(partnerId: number): Promise<LeadPackage[]> {
  try {
    const db = await getDb();
    if (!db) return [];

    return await db
      .select()
      .from(leadPackages)
      .where(eq(leadPackages.partnerId, partnerId));
  } catch (error) {
    console.error("[Partner DB] Error getting partner lead packages:", error);
    return [];
  }
}

export async function getActiveLeadPackage(partnerId: number): Promise<LeadPackage | null> {
  try {
    const db = await getDb();
    if (!db) return null;

    const result = await db
      .select()
      .from(leadPackages)
      .where(
        and(
          eq(leadPackages.partnerId, partnerId),
          eq(leadPackages.paymentStatus, "completed"),
          eq(leadPackages.isExpired, 0)
        )
      )
      .orderBy(leadPackages.createdAt)
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.error("[Partner DB] Error getting active lead package:", error);
    return null;
  }
}

export async function updateLeadPackage(id: number, data: Partial<LeadPackage>): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) return false;

    await db
      .update(leadPackages)
      .set(data)
      .where(eq(leadPackages.id, id));

    return true;
  } catch (error) {
    console.error("[Partner DB] Error updating lead package:", error);
    return false;
  }
}

export async function decrementLeadsRemaining(packageId: number): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) return false;

    const pkg = await getLeadPackageById(packageId);
    if (!pkg) return false;

    const newRemaining = Math.max(0, pkg.leadsRemaining - 1);
    const isExpired = newRemaining === 0 ? 1 : 0;

    await db
      .update(leadPackages)
      .set({
        leadsRemaining: newRemaining,
        leadsDelivered: pkg.leadsDelivered + 1,
        isExpired,
      })
      .where(eq(leadPackages.id, packageId));

    return true;
  } catch (error) {
    console.error("[Partner DB] Error decrementing leads remaining:", error);
    return false;
  }
}

// ===== DELIVERED LEADS OPERATIONS =====

export async function createDeliveredLead(data: InsertDeliveredLead): Promise<DeliveredLead | null> {
  try {
    const db = await getDb();
    if (!db) return null;

    const result = await db.insert(deliveredLeads).values(data);
    const leadId = result[0].insertId;
    
    return await getDeliveredLeadById(leadId);
  } catch (error) {
    console.error("[Partner DB] Error creating delivered lead:", error);
    return null;
  }
}

export async function getDeliveredLeadById(id: number): Promise<DeliveredLead | null> {
  try {
    const db = await getDb();
    if (!db) return null;

    const result = await db
      .select()
      .from(deliveredLeads)
      .where(eq(deliveredLeads.id, id))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.error("[Partner DB] Error getting delivered lead by ID:", error);
    return null;
  }
}

export async function getPackageDeliveredLeads(packageId: number): Promise<DeliveredLead[]> {
  try {
    const db = await getDb();
    if (!db) return [];

    return await db
      .select()
      .from(deliveredLeads)
      .where(eq(deliveredLeads.leadPackageId, packageId))
      .orderBy(deliveredLeads.leadNumber);
  } catch (error) {
    console.error("[Partner DB] Error getting package delivered leads:", error);
    return [];
  }
}

export async function getPartnerAllDeliveredLeads(partnerId: number): Promise<DeliveredLead[]> {
  try {
    const db = await getDb();
    if (!db) return [];
    return await db
      .select()
      .from(deliveredLeads)
      .where(eq(deliveredLeads.partnerId, partnerId))
      .orderBy(deliveredLeads.createdAt);
  } catch (error) {
    console.error("[Partner DB] Error getting partner all delivered leads:", error);
    return [];
  }
}

export async function updateDeliveredLead(id: number, data: Partial<DeliveredLead>): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) return false;

    await db
      .update(deliveredLeads)
      .set(data)
      .where(eq(deliveredLeads.id, id));

    return true;
  } catch (error) {
    console.error("[Partner DB] Error updating delivered lead:", error);
    return false;
  }
}

// ===== PARTNER EMAIL LOGS =====

export async function logPartnerEmail(data: InsertPartnerEmailLog): Promise<PartnerEmailLog | null> {
  try {
    const db = await getDb();
    if (!db) return null;

    const result = await db.insert(partnerEmailLogs).values(data);
    const logId = result[0].insertId;
    
    return await getPartnerEmailLogById(logId);
  } catch (error) {
    console.error("[Partner DB] Error logging partner email:", error);
    return null;
  }
}

export async function getPartnerEmailLogById(id: number): Promise<PartnerEmailLog | null> {
  try {
    const db = await getDb();
    if (!db) return null;

    const result = await db
      .select()
      .from(partnerEmailLogs)
      .where(eq(partnerEmailLogs.id, id))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.error("[Partner DB] Error getting partner email log by ID:", error);
    return null;
  }
}

export async function getPartnerEmailLogs(partnerId: number, limit = 50): Promise<PartnerEmailLog[]> {
  try {
    const db = await getDb();
    if (!db) return [];

    return await db
      .select()
      .from(partnerEmailLogs)
      .where(eq(partnerEmailLogs.partnerId, partnerId))
      .orderBy(partnerEmailLogs.createdAt)
      .limit(limit);
  } catch (error) {
    console.error("[Partner DB] Error getting partner email logs:", error);
    return [];
  }
}

// ─── Rental Submission Helpers ────────────────────────────────────────────────

export interface RentalSubmissionInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city?: string;
  state?: string;
  budgetMin?: number;
  budgetMax?: number;
}

/**
 * Create a rental submission record.
 * Returns the new submission ID, or null on failure.
 */
export async function createRentalSubmission(
  data: RentalSubmissionInput
): Promise<number | null> {
  try {
    const db = await getDb();
    if (!db) return null;
    const { searchSubmissions } = await import("../drizzle/schema");
    const result = await db.insert(searchSubmissions).values({
      customerName: `${data.firstName} ${data.lastName}`.trim(),
      customerEmail: data.email,
      customerPhone: data.phone || "",
      city: data.city || "",
      state: data.state || "",
      searchRadiusMiles: 0,
      creditChallenges: [],
      housingType: "any",
      bedrooms: 0,
      occupants: 1,
      totalHouseholdIncome: data.budgetMax ? String(data.budgetMax) : "0",
      monthlyTakeHomeIncome: data.budgetMin ? String(data.budgetMin) : "0",
      employmentDuration: "not_specified",
    });
    return (result as any)[0]?.insertId ?? null;
  } catch (error) {
    console.error("[Partner DB] Error creating rental submission:", error);
    return null;
  }
}

/**
 * Get all partners with aggregate stats (used by admin overview).
 */
export async function getAllPartnersWithStats(): Promise<any[]> {
  try {
    const db = await getDb();
    if (!db) return [];
    const { desc } = await import("drizzle-orm");
    const partners = await db
      .select()
      .from(partnerPrograms)
      .orderBy(desc(partnerPrograms.createdAt));
    return await Promise.all(
      partners.map(async (partner) => {
        const packages = await db
          .select()
          .from(leadPackages)
          .where(eq(leadPackages.partnerId, partner.id));
        const leads = await db
          .select()
          .from(deliveredLeads)
          .where(eq(deliveredLeads.partnerId, partner.id));
        return {
          ...partner,
          packageCount: packages.length,
          totalLeadsDelivered: leads.length,
          totalRevenue: packages
            .filter((p) => p.paymentStatus === "completed")
            .reduce((s, p) => s + parseFloat(String(p.totalPrice || 0)), 0),
        };
      })
    );
  } catch (error) {
    console.error("[Partner DB] Error getting all partners with stats:", error);
    return [];
  }
}
