/**
 * Admin Partnership Management Router
 * Procedures for managing partnership program from admin dashboard
 */

import { z } from "zod";
import { adminProcedure, router, TRPCError } from "../_core/trpc";
import { getDb } from "../db";
import {
  partnerPrograms,
  leadPackages,
  deliveredLeads,
  partnerEmailLogs,
} from "../../drizzle/schema";
import { eq, desc, and, gte, lte } from "drizzle-orm";
import { getPartnerById } from "../partner-db";

export const adminPartnershipRouter = router({
  /**
   * Get all partners with stats
   */
  getAllPartners: adminProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
        status: z.enum(["all", "active", "inactive", "suspended"]).default("all"),
      })
    )
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database connection failed");

        let partners: any[] = [];
        let allForCount: { id: number }[] = [];
        
        if (input.status !== "all") {
          allForCount = await db
            .select({ id: partnerPrograms.id })
            .from(partnerPrograms)
            .where(eq(partnerPrograms.status, input.status));
          partners = await db
            .select()
            .from(partnerPrograms)
            .where(eq(partnerPrograms.status, input.status))
            .orderBy(desc(partnerPrograms.createdAt))
            .limit(input.limit)
            .offset((input.page - 1) * input.limit);
        } else {
          allForCount = await db
            .select({ id: partnerPrograms.id })
            .from(partnerPrograms);
          partners = await db
            .select()
            .from(partnerPrograms)
            .orderBy(desc(partnerPrograms.createdAt))
            .limit(input.limit)
            .offset((input.page - 1) * input.limit);
        }
        const total = allForCount.length;

        // Get stats for each partner
        const partnersWithStats = await Promise.all(
          partners.map(async (partner) => {
            const packages = await db
              .select()
              .from(leadPackages)
              .where(eq(leadPackages.partnerId, partner.id));

            const totalLeadsDelivered = packages.reduce((sum, pkg) => sum + pkg.leadsDelivered, 0);
            const totalRevenue = packages
              .filter((pkg) => pkg.paymentStatus === "completed")
              .reduce((sum, pkg) => sum + parseFloat(pkg.totalPrice.toString()), 0);

            return {
              ...partner,
              packageCount: packages.length,
              totalLeadsDelivered,
              totalRevenue,
              activePackages: packages.filter((pkg) => pkg.isExpired === 0).length,
            };
          })
        );

        return {
          success: true,
          partners: partnersWithStats,
          page: input.page,
          limit: input.limit,
          total,
          totalPages: Math.max(1, Math.ceil(total / input.limit)),
        };
      } catch (error) {
        console.error("[Admin Partnership] Error getting partners:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get partners",
        });
      }
    }),

  /**
   * Get partner details with full stats
   */
  getPartnerDetails: adminProcedure
    .input(z.object({ partnerId: z.number() }))
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database connection failed");

        const partner = await getPartnerById(input.partnerId);
        if (!partner) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Partner not found",
          });
        }

        const packages = await db
          .select()
          .from(leadPackages)
          .where(eq(leadPackages.partnerId, input.partnerId));

        const deliveredLeadsList = await db
          .select()
          .from(deliveredLeads)
          .where(eq(deliveredLeads.partnerId, input.partnerId))
          .orderBy(desc(deliveredLeads.createdAt))
          .limit(50);

        const emailLogs = await db
          .select()
          .from(partnerEmailLogs)
          .where(eq(partnerEmailLogs.partnerId, input.partnerId))
          .orderBy(desc(partnerEmailLogs.createdAt))
          .limit(20);

        return {
          success: true,
          partner,
          packages,
          recentLeads: deliveredLeadsList,
          emailLogs,
          stats: {
            totalPackages: packages.length,
            activePackages: packages.filter((pkg) => pkg.isExpired === 0).length,
            totalLeadsDelivered: packages.reduce((sum, pkg) => sum + pkg.leadsDelivered, 0),
            totalRevenue: packages
              .filter((pkg) => pkg.paymentStatus === "completed")
              .reduce((sum, pkg) => sum + parseFloat(pkg.totalPrice.toString()), 0),
          },
        };
      } catch (error) {
        console.error("[Admin Partnership] Error getting partner details:", error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get partner details",
        });
      }
    }),

  /**
   * Update partner status
   */
  updatePartnerStatus: adminProcedure
    .input(
      z.object({
        partnerId: z.number(),
        status: z.enum(["active", "inactive", "suspended"]),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database connection failed");

        await db
          .update(partnerPrograms)
          .set({ status: input.status })
          .where(eq(partnerPrograms.id, input.partnerId));

        return {
          success: true,
          message: `Partner status updated to ${input.status}`,
        };
      } catch (error) {
        console.error("[Admin Partnership] Error updating partner status:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update partner status",
        });
      }
    }),

  /**
   * Refund lead package
   */
  refundPackage: adminProcedure
    .input(
      z.object({
        packageId: z.number(),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database connection failed");

        const pkg = await db
          .select()
          .from(leadPackages)
          .where(eq(leadPackages.id, input.packageId))
          .limit(1);

        if (!pkg || pkg.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Package not found",
          });
        }

        // Update package status to refunded
        await db
          .update(leadPackages)
          .set({ paymentStatus: "refunded" })
          .where(eq(leadPackages.id, input.packageId));

        // TODO: Process Stripe refund via API

        return {
          success: true,
          message: "Package refunded successfully",
          refundAmount: pkg[0].totalPrice,
        };
      } catch (error) {
        console.error("[Admin Partnership] Error refunding package:", error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to refund package",
        });
      }
    }),

  /**
   * Get partnership revenue analytics
   */
  getRevenueAnalytics: adminProcedure
    .input(
      z.object({
        days: z.number().min(1).max(365).default(30),
      })
    )
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database connection failed");

        const startDate = new Date(Date.now() - input.days * 24 * 60 * 60 * 1000);

        const packages = await db
          .select()
          .from(leadPackages)
          .where(
            and(
              eq(leadPackages.paymentStatus, "completed"),
              gte(leadPackages.paidAt, startDate)
            )
          );

        const totalRevenue = packages.reduce((sum, pkg) => sum + parseFloat(pkg.totalPrice.toString()), 0);
        const totalPackagesSold = packages.length;
        const totalLeadsDelivered = packages.reduce((sum, pkg) => sum + pkg.leadsDelivered, 0);
        const averagePackageValue = totalPackagesSold > 0 ? totalRevenue / totalPackagesSold : 0;

        return {
          success: true,
          analytics: {
            totalRevenue,
            totalPackagesSold,
            totalLeadsDelivered,
            averagePackageValue,
            days: input.days,
            startDate,
            endDate: new Date(),
          },
        };
      } catch (error) {
        console.error("[Admin Partnership] Error getting revenue analytics:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get revenue analytics",
        });
      }
    }),

  /**
   * Get lead delivery stats
   */
  getLeadDeliveryStats: adminProcedure.query(async () => {
    try {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      const allLeads = await db.select().from(deliveredLeads);

      const stats = {
        totalLeadsDelivered: allLeads.length,
        leadsSent: allLeads.filter((l) => l.status === "sent").length,
        leadsOpened: allLeads.filter((l) => l.status === "opened").length,
        leadsClicked: allLeads.filter((l) => l.status === "clicked").length,
        leadsPurchased: allLeads.filter((l) => l.status === "purchased").length,
      };

      const openRate = stats.totalLeadsDelivered > 0 ? (stats.leadsOpened / stats.totalLeadsDelivered) * 100 : 0;
      const clickRate = stats.totalLeadsDelivered > 0 ? (stats.leadsClicked / stats.totalLeadsDelivered) * 100 : 0;
      const conversionRate = stats.totalLeadsDelivered > 0 ? (stats.leadsPurchased / stats.totalLeadsDelivered) * 100 : 0;

      return {
        success: true,
        stats: {
          ...stats,
          openRate: Math.round(openRate * 100) / 100,
          clickRate: Math.round(clickRate * 100) / 100,
          conversionRate: Math.round(conversionRate * 100) / 100,
        },
      };
    } catch (error) {
      console.error("[Admin Partnership] Error getting lead delivery stats:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to get lead delivery stats",
      });
    }
  }),

  /**
   * Grant additional trial leads to a partner
   */
  grantLeads: adminProcedure
    .input(
      z.object({
        partnerId: z.number(),
        leadsToAdd: z.number().min(1).max(500),
        note: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database connection failed");

        const [partner] = await db
          .select({ id: partnerPrograms.id, trialLeadsRemaining: partnerPrograms.trialLeadsRemaining, partnerName: partnerPrograms.partnerName })
          .from(partnerPrograms)
          .where(eq(partnerPrograms.id, input.partnerId))
          .limit(1);

        if (!partner) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Partner not found" });
        }

        const newTotal = (partner.trialLeadsRemaining ?? 0) + input.leadsToAdd;

        await db
          .update(partnerPrograms)
          .set({ trialLeadsRemaining: newTotal })
          .where(eq(partnerPrograms.id, input.partnerId));

        console.log(`[Admin] Granted ${input.leadsToAdd} leads to partner ${input.partnerId} (${partner.partnerName}). New total: ${newTotal}`);

        return {
          success: true,
          message: `Granted ${input.leadsToAdd} leads. Partner now has ${newTotal} trial leads remaining.`,
          newTotal,
        };
      } catch (error) {
        console.error("[Admin Partnership] Error granting leads:", error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to grant leads",
        });
      }
    }),

  /**
   * Get email logs for a specific partner (last 10)
   */
  getPartnerEmailLogs: adminProcedure
    .input(z.object({ partnerId: z.number(), limit: z.number().min(1).max(50).default(10) }))
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database connection failed");

        const logs = await db
          .select()
          .from(partnerEmailLogs)
          .where(eq(partnerEmailLogs.partnerId, input.partnerId))
          .orderBy(desc(partnerEmailLogs.sentAt))
          .limit(input.limit);

        return { success: true, logs };
      } catch (error) {
        console.error("[Admin Partnership] Error getting email logs:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get email logs",
        });
      }
    }),

  /**
   * Resend a previously failed or bounced email to a partner
   * Uses the stored subject + body from the email log to re-send without regenerating content.
   */
  resendPartnerEmail: adminProcedure
    .input(
      z.object({
        emailLogId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database connection failed");

        // Fetch the original log entry
        const [log] = await db
          .select()
          .from(partnerEmailLogs)
          .where(eq(partnerEmailLogs.id, input.emailLogId))
          .limit(1);

        if (!log) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Email log entry not found" });
        }

        if (log.status === "sent") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "This email was already delivered successfully. Only failed or bounced emails can be resent.",
          });
        }

        if (!log.body) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "No stored email body found for this log entry. Cannot resend.",
          });
        }

        // Import sendPartnerEmail to re-send using the stored content
        const { sendPartnerEmail } = await import("../partner-email-service");

        const success = await sendPartnerEmail({
          to: log.recipientEmail,
          subject: log.subject,
          html: log.body,
          partnerId: log.partnerId,
          emailType: log.emailType,
        });

        if (!success) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Email delivery failed again. Check Gmail credentials and recipient address.",
          });
        }

        console.log(`[Admin] Resent email log #${input.emailLogId} (${log.emailType}) to ${log.recipientEmail}`);

        return {
          success: true,
          message: `Email resent to ${log.recipientEmail}`,
        };
      } catch (error) {
        console.error("[Admin Partnership] Error resending email:", error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to resend email",
        });
      }
    }),

  /**
   * Send a manual test lead to a specific partner by email
   * Used by admins to verify lead delivery is working for a partner
   */
  sendTestLead: adminProcedure
    .input(z.object({ partnerEmail: z.string().email() }))
    .mutation(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });

        const { gt } = await import("drizzle-orm");
        const { sendTrialLeadEmail } = await import("../partner-lead-email-enhanced");

        // Find the partner
        const partners = await db
          .select()
          .from(partnerPrograms)
          .where(eq(partnerPrograms.email, input.partnerEmail))
          .limit(1);

        if (!partners.length) {
          throw new TRPCError({ code: "NOT_FOUND", message: `No partner found with email ${input.partnerEmail}` });
        }

        const partner = partners[0];

        if (!partner.isVerified || partner.status !== "active") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Partner account is not active/verified (status: ${partner.status}, verified: ${partner.isVerified})`,
          });
        }

        if (partner.trialLeadsRemaining <= 0) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Partner has no trial leads remaining" });
        }

        // Insert a realistic test submission
        const { searchSubmissions: ssTable } = await import("../../drizzle/schema");
        const [insertResult] = (await db.execute(
          `INSERT INTO search_submissions 
            (customerName, customerEmail, customerPhone, city, state, searchRadiusMiles,
             creditChallenges, housingType, bedrooms, occupants, totalHouseholdIncome,
             monthlyTakeHomeIncome, employmentDuration, needsMovingLoan, creditRating, status)
           VALUES ('Marcus Johnson (Test Lead)', 'marcus.test@example.com', '(404) 555-0192',
                   'Atlanta', 'GA', 25, '["eviction","low_credit"]', 'apartment', 2, 3,
                   '$3,200/month', '$2,800/month', '1-2 years', 'no', 'fair', 'pending')` as any
        )) as any[];
        const submissionId = insertResult.insertId;

        // Count existing delivered leads for accurate lead numbering
        const [deliveredCount] = await db
          .select({ count: deliveredLeads.id })
          .from(deliveredLeads)
          .where(eq(deliveredLeads.partnerId, partner.id));
        const leadNumber = (deliveredCount ? Number(deliveredCount.count) : 0) + 1;

        // Insert delivered lead record
        await db.insert(deliveredLeads).values({
          partnerId: partner.id,
          leadPackageId: 0,
          submissionId,
          leadNumber,
          customerName: "Marcus Johnson (Test Lead)",
          customerEmail: "marcus.test@example.com",
          customerPhone: "(404) 555-0192",
          city: "Atlanta",
          state: "GA",
          monthlyIncome: "$2,800/month",
          creditChallenges: ["eviction", "low_credit"],
          housingType: "apartment",
          bedrooms: 2,
          status: "sent",
          emailSentAt: new Date(),
        });

        // Decrement trial leads
        await db
          .update(partnerPrograms)
          .set({ trialLeadsRemaining: partner.trialLeadsRemaining - 1 })
          .where(eq(partnerPrograms.id, partner.id));

        // Send the trial lead email
        await sendTrialLeadEmail(
          partner.partnerName,
          partner.email,
          {
            customerName: "Marcus Johnson (Test Lead)",
            customerEmail: "marcus.test@example.com",
            customerPhone: "(404) 555-0192",
            city: "Atlanta",
            state: "GA",
            monthlyIncome: 2800,
            creditChallenges: ["eviction", "low_credit"],
            housingType: "apartment",
            bedrooms: 2,
          },
          leadNumber,
          20,
          partner.id
        );

        console.log(`[Admin] Test lead #${leadNumber} sent to ${partner.email}`);

        return {
          success: true,
          message: `Test lead #${leadNumber} sent to ${partner.email}. Trial leads remaining: ${partner.trialLeadsRemaining - 1}`,
          leadNumber,
          submissionId,
          trialLeadsRemaining: partner.trialLeadsRemaining - 1,
        };
      } catch (error) {
        console.error("[Admin Partnership] Error sending test lead:", error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to send test lead" });
      }
    }),

  /**
   * Alias: allPartners - returns all partners (used in tests)
   */
  allPartners: adminProcedure.query(async () => {
    try {
      const { getAllPartnersWithStats } = await import("../partner-db");
      return await getAllPartnersWithStats();
    } catch (error) {
      console.error("[Admin Partnership] Error in allPartners:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to get partners",
      });
    }
  }),

  /**
   * Alias: overview - returns partnership program overview (used in tests)
   */
  overview: adminProcedure.query(async () => {
    try {
      const { getAllPartnersWithStats } = await import("../partner-db");
      const partners = await getAllPartnersWithStats();
      const totalRevenue = partners.reduce((s: number, p: any) => s + (p.totalRevenue || 0), 0);
      return {
        totalPartners: partners.length,
        activePartners: partners.filter((p: any) => p.status === "active").length,
        totalPackagesSold: partners.reduce((s: number, p: any) => s + (p.packageCount || 0), 0),
        totalLeadsDelivered: partners.reduce((s: number, p: any) => s + (p.totalLeadsDelivered || 0), 0),
        totalRevenue,
      };
    } catch (error) {
      console.error("[Admin Partnership] Error in overview:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to get overview",
      });
    }
  }),
});
