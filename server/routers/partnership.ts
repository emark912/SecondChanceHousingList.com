/**
 * Partnership Program tRPC Router
 * Handles all partnership program operations
 */

import { router, publicProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { deliveredLeads as deliveredLeadsTable, leadPackages as leadPackagesTable, searchSubmissions, lockedLeads } from "../../drizzle/schema";
import { eq, and, gte, count, sql } from "drizzle-orm";
import { 
  createPartner, 
  getPartnerByEmail, 
  getPartnerById,
  updatePartner,
  verifyPartnerEmail,
  getPartnerLeadPackages,
  getActiveLeadPackage,
  createLeadPackage,
  getPackageDeliveredLeads,
  getPartnerAllDeliveredLeads,
} from "../partner-db";
import { 
  sendSignupConfirmationEmail,
  sendTrialStartedEmail,
} from "../partner-email-service";
import { generateVerificationCode } from "../_core/utils";
import { hashPassword } from "../partner-auth-service";

export const partnershipRouter = router({
  /**
   * Partner signup
   */
  signup: publicProcedure
    .input(
      z.object({
        partnerName: z.string().min(2, "Partner name required"),
        businessName: z.string().min(2, "Business name required"),
        email: z.string().email("Valid email required"),
        password: z.string().min(8, "Password must be at least 8 characters"),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Check if partner already exists
        const existingPartner = await getPartnerByEmail(input.email);
        if (existingPartner) {
          return {
            success: false,
            message: "This email is already registered for the partnership program",
          };
        }

        // Generate verification code
        const verificationCode = generateVerificationCode();

        // Hash password
        const passwordHash = hashPassword(input.password);

        // Create partner with password
        const partner = await createPartner({
          partnerName: input.partnerName,
          businessName: input.businessName,
          email: input.email,
          passwordHash,
          verificationCode,
          isVerified: 0,
          status: "pending_verification",
        });

        if (!partner) {
          return {
            success: false,
            message: "Failed to create partnership account",
          };
        }

        // Send verification email
        const emailSent = await sendSignupConfirmationEmail(
          input.partnerName,
          input.businessName,
          input.email,
          verificationCode,
          partner.id
        );

        if (!emailSent) {
          return {
            success: false,
            message: "Account created but verification email failed. Please contact support.",
          };
        }

        return {
          success: true,
          message: "Signup successful! Check your email for verification instructions.",
          partnerId: partner.id,
        };
      } catch (error) {
        console.error("[Partnership] Signup error:", error);
        return {
          success: false,
          message: "An error occurred during signup",
        };
      }
    }),

  /**
   * Verify partner email
   */
  verifyEmail: publicProcedure
    .input(
      z.object({
        code: z.string().length(6, "Invalid verification code"),
        email: z.string().email("Valid email required"),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const partner = await getPartnerByEmail(input.email);
        if (!partner) {
          return {
            success: false,
            message: "Partner account not found",
            partnerId: undefined,
          };
        }

        if (partner.isVerified) {
          return {
            success: false,
            message: "This account is already verified",
            partnerId: undefined,
          };
        }

        const verified = await verifyPartnerEmail(partner.id, input.code);
        if (!verified) {
          return {
            success: false,
            message: "Invalid verification code",
            partnerId: undefined,
          };
        }

        // Create trial lead package (20 leads + 5 bonus = 25 total)
        const trialPackage = await createLeadPackage({
          partnerId: partner.id,
          packageName: "Free Trial Package",
          leadCount: 20,
          bonusLeads: 5,
          totalLeads: 25,
          leadsRemaining: 25,
          pricePerLead: "0.00",
          totalPrice: "0.00",
          paymentStatus: "completed",
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        });

        if (!trialPackage) {
          return {
            success: false,
            message: "Email verified but failed to activate trial package",
            partnerId: undefined,
          };
        }

        // Sync trialLeadsRemaining on the partner record to match the trial package (25 leads)
        await updatePartner(partner.id, {
          trialLeadsRemaining: 25,
          trialStartedAt: new Date(),
          trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          hasUsedTrial: 1,
          status: "active",
        });

        // Send trial started email
        await sendTrialStartedEmail(partner.partnerName, partner.email, partner.id);

        return {
          success: true,
          message: "Email verified! Your free trial has started with 25 leads (20 + 5 bonus).",
          partnerId: Number(partner.id),
        };
      } catch (error) {
        console.error("[Partnership] Email verification error:", error);
        return {
          success: false,
          message: "An error occurred during verification",
          partnerId: undefined,
        };
      }
    }),

  /**
   * Get partner dashboard data
   */
  getDashboard: publicProcedure
    .input(
      z.object({
        partnerId: z.number(),
      })
    )
    .query(async ({ input }) => {
      try {
        const partner = await getPartnerById(input.partnerId);
        if (!partner) {
          return {
            success: false,
            message: "Partner not found",
          };
        }

        const packages = await getPartnerLeadPackages(input.partnerId);
        const activePackage = await getActiveLeadPackage(input.partnerId);

        let deliveredLeads: any[] = [];
        if (activePackage) {
          deliveredLeads = await getPackageDeliveredLeads(activePackage.id);
        }

        // Count queued locked leads (post-trial, not yet unlocked)
        let lockedLeadsCount = 0;
        try {
          const db = await getDb();
          if (db) {
            const [countRow] = await db
              .select({ count: count() })
              .from(lockedLeads)
              .where(and(eq(lockedLeads.partnerId, input.partnerId), eq(lockedLeads.unlocked, 0)));
            lockedLeadsCount = countRow?.count ?? 0;
          }
        } catch (_e) { /* non-critical */ }

        return {
          success: true,
          partner: {
            id: partner.id,
            partnerName: partner.partnerName,
            businessName: partner.businessName,
            email: partner.email,
            status: partner.status,
            isVerified: partner.isVerified,
            trialLeadsRemaining: partner.trialLeadsRemaining,
            trialStartedAt: partner.trialStartedAt,
            trialEndsAt: partner.trialEndsAt,
            hasUsedTrial: partner.hasUsedTrial,
            trialActivated: partner.trialActivated,
            trialEnded: partner.trialEnded ?? 0,
            // Expose whether a saved card is on file (boolean only, not the ID)
            hasCardOnFile: !!partner.stripePaymentMethodId,
            stripePaymentMethodId: partner.stripePaymentMethodId,
          },
          lockedLeadsCount,
          activePackage: activePackage ? {
            id: activePackage.id,
            packageName: activePackage.packageName,
            leadCount: activePackage.leadCount,
            bonusLeads: activePackage.bonusLeads,
            totalLeads: activePackage.totalLeads,
            leadsDelivered: activePackage.leadsDelivered,
            leadsRemaining: activePackage.leadsRemaining,
            isExpired: activePackage.isExpired,
          } : null,
          packages: packages.map((pkg) => ({
            id: pkg.id,
            packageName: pkg.packageName,
            leadCount: pkg.leadCount,
            bonusLeads: pkg.bonusLeads,
            totalLeads: pkg.totalLeads,
            leadsDelivered: pkg.leadsDelivered,
            leadsRemaining: pkg.leadsRemaining,
            paymentStatus: pkg.paymentStatus,
            totalPrice: pkg.totalPrice,
            paidAt: pkg.paidAt,
            isExpired: pkg.isExpired,
            createdAt: pkg.createdAt,
          })),
          deliveredLeads: deliveredLeads.map((lead) => ({
            id: lead.id,
            leadNumber: lead.leadNumber,
            customerName: lead.customerName,
            city: lead.city,
            state: lead.state,
            monthlyIncome: lead.monthlyIncome,
            monthlyBudget: lead.monthlyBudget,
            moveInTimeline: lead.moveInTimeline,
            housingType: lead.housingType,
            bedrooms: lead.bedrooms,
            status: lead.status,
            emailSentAt: lead.emailSentAt,
          })),
        };
      } catch (error) {
        console.error("[Partnership] Dashboard error:", error);
        return {
          success: false,
          message: "Failed to load dashboard",
        };
      }
    }),

  /**
   * Get available lead packages
   */
  getLeadPackages: publicProcedure.query(async () => {
    return {
      packages: [
        { leadCount: 10, bonusLeads: 5, pricePerLead: 5.00, totalPrice: 50.00 },
        { leadCount: 50, bonusLeads: 5, pricePerLead: 5.00, totalPrice: 250.00 },
        { leadCount: 100, bonusLeads: 5, pricePerLead: 5.00, totalPrice: 500.00 },
        { leadCount: 200, bonusLeads: 5, pricePerLead: 5.00, totalPrice: 1000.00 },
        { leadCount: 400, bonusLeads: 5, pricePerLead: 5.00, totalPrice: 2000.00 },
        { leadCount: 800, bonusLeads: 5, pricePerLead: 5.00, totalPrice: 4000.00 },
      ],
    };
  }),

  /**
   * Create checkout session for lead package
   */
  createCheckoutSession: publicProcedure
    .input(
      z.object({
        partnerId: z.number(),
        leadCount: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const { createPartnershipCheckoutSession } = await import("../partnership-stripe-service");
        
        const partner = await getPartnerById(input.partnerId);
        if (!partner) {
          return {
            success: false,
            message: "Partner not found",
          };
        }

        if (!partner.isVerified) {
          return {
            success: false,
            message: "Please verify your email before purchasing",
          };
        }

        const origin = ctx.req.headers.origin || "https://secondchance-3gdukdvh.manus.space";

        const result = await createPartnershipCheckoutSession(
          input.partnerId,
          input.leadCount,
          origin
        );

        if (!result) {
          return {
            success: false,
            message: "Failed to create checkout session",
          };
        }

        return {
          success: true,
          message: "Checkout session created",
          sessionId: result.sessionId,
          url: result.url,
        };
      } catch (error) {
        console.error("[Partnership] Checkout error:", error);
        return {
          success: false,
          message: "Failed to create checkout session",
        };
      }
    }),


  /**
   * Get lead with full contact information
   */
  getLeadContactInfo: publicProcedure
    .input(
      z.object({
        leadId: z.number(),
        partnerId: z.number(),
      })
    )
    .query(async ({ input }) => {
      try {
        const { getLeadWithContactInfo } = await import("../lead-purchase-service");
        const lead = await getLeadWithContactInfo(input.leadId, input.partnerId);
        if (!lead) {
          return {
            success: false,
            message: "Lead not found or package has expired",
          };
        }
        return {
          success: true,
          lead,
        };
      } catch (error) {
        console.error("[Partnership] Error getting lead contact info:", error);
        return {
          success: false,
          message: "Failed to retrieve lead information",
        };
      }
    }),

  /**
   * Get all leads for a partner
   */
  getPartnerLeads: publicProcedure
    .input(
      z.object({
        partnerId: z.number(),
        includeContactInfo: z.boolean().optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        const { getPartnerLeads: getLeads } = await import("../lead-purchase-service");
        const leads = await getLeads(input.partnerId, input.includeContactInfo);
        return {
          success: true,
          leads,
        };
      } catch (error) {
        console.error("[Partnership] Error getting partner leads:", error);
        return {
          success: false,
          message: "Failed to retrieve leads",
          leads: [],
        };
      }
    }),

  /**
   * Get partner purchase history
   */
  getPurchaseHistory: publicProcedure
    .input(
      z.object({
        partnerId: z.number(),
      })
    )
    .query(async ({ input }) => {
      try {
        const { getPartnerPurchaseHistory } = await import("../lead-purchase-service");
        const history = await getPartnerPurchaseHistory(input.partnerId);
        return {
          success: true,
          history,
        };
      } catch (error) {
        console.error("[Partnership] Error getting purchase history:", error);
        return {
          success: false,
          message: "Failed to retrieve purchase history",
          history: [],
        };
      }
    }),

  /**
   * Mark lead as contacted
   */
  markLeadContacted: publicProcedure
    .input(
      z.object({
        leadId: z.number(),
        partnerId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const { markLeadAsContacted } = await import("../lead-purchase-service");
        const success = await markLeadAsContacted(input.leadId, input.partnerId);
        return {
          success,
          message: success ? "Lead marked as contacted" : "Failed to mark lead",
        };
      } catch (error) {
        console.error("[Partnership] Error marking lead contacted:", error);
        return {
          success: false,
          message: "Failed to mark lead as contacted",
        };
      }
    }),

  /**
   * Mark lead as purchased/converted
   */
  markLeadPurchased: publicProcedure
    .input(
      z.object({
        leadId: z.number(),
        partnerId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const { markLeadAsPurchased } = await import("../lead-purchase-service");
        const success = await markLeadAsPurchased(input.leadId, input.partnerId);
        return {
          success,
          message: success ? "Lead marked as purchased" : "Failed to mark lead",
        };
      } catch (error) {
        console.error("[Partnership] Error marking lead purchased:", error);
        return {
          success: false,
          message: "Failed to mark lead as purchased",
        };
      }
    }),

  /**
   * Get partner packages
   */
  getPartnerPackages: publicProcedure
    .input(
      z.object({
        partnerId: z.number(),
      })
    )
    .query(async ({ input }) => {
      try {
        const packages = await getPartnerLeadPackages(input.partnerId);
        return packages || [];
      } catch (error) {
        console.error("[Partnership] Error fetching partner packages:", error);
        return [];
      }
    }),

  /**
   * Get partner delivered leads
   */
  getPartnerDeliveredLeads: publicProcedure
    .input(
      z.object({
        partnerId: z.number(),
      })
    )
    .query(async ({ input }) => {
      try {
        const leads = await getPartnerAllDeliveredLeads(input.partnerId);
        return leads || [];
      } catch (error) {
        console.error("[Partnership] Error fetching delivered leads:", error);
        return [];
      }
    }),
  /**
   * Access Stripe Customer Portal for billing managementt
   */
  accessCustomerPortal: publicProcedure
    .input(
      z.object({
        partnerId: z.number(),
        returnUrl: z.string().url(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const { createCustomerPortalSession, getPartnerStripeCustomerId } = await import("../partnership-customer-portal");
        const stripeCustomerId = await getPartnerStripeCustomerId(input.partnerId);
        if (!stripeCustomerId) {
          return { success: false, message: "No billing account found. Please complete a purchase first." };
        }
        const result = await createCustomerPortalSession(stripeCustomerId, input.returnUrl);
        if (!result.url) {
          return { success: false, message: "Failed to create billing portal session" };
        }
        return { success: true, message: "Portal session created", url: result.url };
      } catch (error) {
        console.error("[Partnership] Error accessing customer portal:", error);
        return { success: false, message: "Failed to access billing portal" };
      }
    }),

  /**
   * Request password reset
   */
  requestPasswordReset: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input }) => {
      try {
        const partner = await getPartnerByEmail(input.email);
        if (!partner) {
          // Return success to avoid email enumeration
          return { success: true, message: "If that email exists, a reset link has been sent." };
        }
        const resetCode = generateVerificationCode();
        const { updatePartner } = await import("../partner-db");
        await updatePartner(partner.id, { verificationCode: resetCode });
        const { sendPasswordResetEmail } = await import("../partner-email-service");
        await sendPasswordResetEmail(partner.partnerName, partner.email, resetCode);
        return { success: true, message: "If that email exists, a reset link has been sent." };
      } catch (error) {
        console.error("[Partnership] Password reset error:", error);
        return { success: false, message: "An error occurred. Please try again." };
      }
    }),

  /**
   * Reset password with code
   */
  resetPassword: publicProcedure
    .input(z.object({ email: z.string().email(), code: z.string(), newPassword: z.string().min(8) }))
    .mutation(async ({ input }) => {
      try {
        const partner = await getPartnerByEmail(input.email);
        if (!partner || partner.verificationCode !== input.code) {
          return { success: false, message: "Invalid or expired reset code" };
        }
        const { hashPassword } = await import("../partner-auth-service");
        const { updatePartner } = await import("../partner-db");
        await updatePartner(partner.id, { passwordHash: hashPassword(input.newPassword), verificationCode: null });
        return { success: true, message: "Password reset successfully" };
      } catch (error) {
        console.error("[Partnership] Reset password error:", error);
        return { success: false, message: "An error occurred. Please try again." };
      }
    }),

  /**
   * Partner Performance Analytics
   * Returns all metrics for the analytics dashboard
   */
  analytics: publicProcedure
    .input(
      z.object({
        partnerId: z.number(),
        startDate: z.string().optional(), // ISO date string
        endDate: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) return { success: false, message: "Database unavailable" };

        const partner = await getPartnerById(input.partnerId);
        if (!partner) return { success: false, message: "Partner not found" };

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const rangeStart = input.startDate ? new Date(input.startDate) : startOfMonth;
        const rangeEnd = input.endDate ? new Date(input.endDate) : now;

        // All packages for this partner
        const packages = await getPartnerLeadPackages(input.partnerId);
        const paidPackages = packages.filter(p => p.paymentStatus === "completed");

        // All delivered leads for this partner
        const allLeads = await db
          .select()
          .from(deliveredLeadsTable)
          .where(eq(deliveredLeadsTable.partnerId, input.partnerId));

        // Leads received this month
        const leadsThisMonth = allLeads.filter(
          l => new Date(l.createdAt) >= startOfMonth
        ).length;

        // Leads received in date range
        const leadsInRange = allLeads.filter(
          l => new Date(l.createdAt) >= rangeStart && new Date(l.createdAt) <= rangeEnd
        ).length;

        // Leads purchased (status = purchased)
        const leadsPurchased = allLeads.filter(l => l.status === "purchased").length;
        const leadsPurchasedThisMonth = allLeads.filter(
          l => l.status === "purchased" && new Date(l.createdAt) >= startOfMonth
        ).length;

        // Conversion rate
        const conversionRate = allLeads.length > 0
          ? Math.round((leadsPurchased / allLeads.length) * 100 * 10) / 10
          : 0;

        // Total investment
        const totalInvestment = paidPackages.reduce(
          (sum, p) => sum + parseFloat(String(p.totalPrice || 0)), 0
        );

        // ROI: assume each converted lead = $500 value
        const estimatedRevenue = leadsPurchased * 500;
        const roi = totalInvestment > 0
          ? Math.round(((estimatedRevenue - totalInvestment) / totalInvestment) * 100 * 10) / 10
          : 0;

        // Average response time (time from emailSentAt to buyButtonClickedAt)
        const respondedLeads = allLeads.filter(l => l.emailSentAt && l.buyButtonClickedAt);
        const avgResponseTimeHours = respondedLeads.length > 0
          ? Math.round(
              respondedLeads.reduce((sum, l) => {
                const diff = new Date(l.buyButtonClickedAt!).getTime() - new Date(l.emailSentAt).getTime();
                return sum + diff / (1000 * 60 * 60);
              }, 0) / respondedLeads.length * 10
            ) / 10
          : null;

        // Monthly trend (last 6 months)
        const monthlyTrend = [];
        for (let i = 5; i >= 0; i--) {
          const mStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const mEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
          const mLeads = allLeads.filter(
            l => new Date(l.createdAt) >= mStart && new Date(l.createdAt) <= mEnd
          );
          const mPurchased = mLeads.filter(l => l.status === "purchased").length;
          monthlyTrend.push({
            month: mStart.toLocaleString("default", { month: "short", year: "numeric" }),
            leadsReceived: mLeads.length,
            leadsPurchased: mPurchased,
            conversionRate: mLeads.length > 0 ? Math.round((mPurchased / mLeads.length) * 100 * 10) / 10 : 0,
          });
        }

        // Lead status breakdown
        const statusBreakdown = {
          sent: allLeads.filter(l => l.status === "sent").length,
          opened: allLeads.filter(l => l.status === "opened").length,
          clicked: allLeads.filter(l => l.status === "clicked").length,
          purchased: leadsPurchased,
        };

        return {
          success: true,
          data: {
            // Summary metrics
            leadsThisMonth,
            leadsInRange,
            leadsPurchased,
            leadsPurchasedThisMonth,
            totalLeadsReceived: allLeads.length,
            conversionRate,
            avgResponseTimeHours,
            totalInvestment,
            estimatedRevenue,
            roi,
            // Breakdowns
            statusBreakdown,
            monthlyTrend,
            // Package summary
            totalPackages: packages.length,
            activePackages: packages.filter(p => !p.isExpired && p.paymentStatus === "completed").length,
            totalLeadsInPackages: packages.reduce((s, p) => s + (p.totalLeads || 0), 0),
            totalLeadsDelivered: packages.reduce((s, p) => s + (p.leadsDelivered || 0), 0),
          },
        };
      } catch (error) {
        console.error("[Partnership] Analytics error:", error);
        return { success: false, message: "Failed to load analytics" };
      }
    }),

  /**
   * Submit rental inquiry (used in tests and partner portal)
   */
  /**
   * Create a Stripe SetupIntent so the partner can save their card
   * The card is required to activate the 20-lead free trial
   */
  createSetupIntent: publicProcedure
    .input(z.object({ partnerId: z.number() }))
    .mutation(async ({ input }) => {
      try {
        const { createPartnerSetupIntent } = await import("../partnership-stripe-service");
        const result = await createPartnerSetupIntent(input.partnerId);
        if (!result) {
          return { success: false, message: "Failed to create setup intent" };
        }
        return { success: true, clientSecret: result.clientSecret, customerId: result.customerId };
      } catch (error) {
        console.error("[Partnership] createSetupIntent error:", error);
        return { success: false, message: "An error occurred" };
      }
    }),

  /**
   * Activate trial after partner saves their card via SetupIntent
   * Stores the paymentMethodId and activates the 20-lead trial
   */
  activateTrial: publicProcedure
    .input(z.object({
      partnerId: z.number(),
      paymentMethodId: z.string(),
      setupIntentId: z.string(),
    }))
    .mutation(async ({ input }) => {
      try {
        const { activatePartnerTrial } = await import("../partnership-stripe-service");
        const result = await activatePartnerTrial(input.partnerId, input.paymentMethodId, input.setupIntentId);
        if (!result.success) {
          return { success: false, message: result.message };
        }
        return { success: true, message: "Trial activated! You will start receiving leads shortly." };
      } catch (error) {
        console.error("[Partnership] activateTrial error:", error);
        return { success: false, message: "An error occurred" };
      }
    }),

  /**
   * Charge the partner's saved card for a lead package (no redirect needed)
   */
  chargeForLeads: publicProcedure
    .input(z.object({
      partnerId: z.number(),
      leadCount: z.number(),
    }))
    .mutation(async ({ input }) => {
      try {
        const { chargePartnerForLeads } = await import("../partnership-stripe-service");
        const result = await chargePartnerForLeads(input.partnerId, input.leadCount);
        if (!result.success) {
          // Fall back to checkout session if no saved card
          if (result.fallbackToCheckout) {
            return { success: false, fallbackToCheckout: true, message: result.message };
          }
          return { success: false, message: result.message };
        }
        return { success: true, message: result.message, packageId: result.packageId };
      } catch (error) {
        console.error("[Partnership] chargeForLeads error:", error);
        return { success: false, message: "An error occurred" };
      }
    }),

  /**
   * Create a new SetupIntent so the partner can replace their saved card
   */
  updateCard: publicProcedure
    .input(z.object({ partnerId: z.number() }))
    .mutation(async ({ input }) => {
      try {
        const { createPartnerSetupIntent } = await import("../partnership-stripe-service");
        const result = await createPartnerSetupIntent(input.partnerId);
        if (!result) {
          return { success: false as const, clientSecret: null, customerId: null, message: "Failed to create card update session" };
        }
        return { success: true as const, clientSecret: result.clientSecret, customerId: result.customerId, message: null };
      } catch (error) {
        console.error("[Partnership] updateCard error:", error);
        return { success: false as const, clientSecret: null, customerId: null, message: "Failed to create card update session" };
      }
    }),

  submitRental: publicProcedure
    .input(
      z.object({
        firstName: z.string().min(1, "First name required"),
        lastName: z.string().min(1, "Last name required"),
        email: z.string().email("Valid email required"),
        phone: z.string(),
        city: z.string().optional(),
        state: z.string().optional(),
        budgetMin: z.number().optional(),
        budgetMax: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const { createRentalSubmission } = await import("../partner-db");
        const submissionId = await createRentalSubmission({
          firstName: input.firstName,
          lastName: input.lastName,
          email: input.email,
          phone: input.phone,
          city: input.city || "",
          state: input.state || "",
          budgetMin: input.budgetMin || 0,
          budgetMax: input.budgetMax || 0,
        });
        return { success: true, submissionId };
      } catch (error) {
        console.error("[Partnership] submitRental error:", error);
        return { success: false, submissionId: null };
      }
    }),

  /**
   * Resend verification email for partners who never received or lost their email
   */
  resendVerificationEmail: publicProcedure
    .input(z.object({ email: z.string().email("Valid email required") }))
    .mutation(async ({ input }) => {
      try {
        const partner = await getPartnerByEmail(input.email);

        // Always return a generic success message to prevent email enumeration
        if (!partner) {
          return { success: true, message: "If that email is registered, a verification email has been sent. Please check your inbox and spam folder." };
        }

        if (partner.isVerified) {
          return { success: false, message: "This account is already verified. Please log in below." };
        }

        // Generate a fresh 6-digit verification code
        const newCode = Math.floor(100000 + Math.random() * 900000).toString();
        await updatePartner(partner.id, { verificationCode: newCode });

        await sendSignupConfirmationEmail(
          partner.partnerName,
          partner.businessName,
          partner.email,
          newCode,
          partner.id
        );

        console.log(`[Partnership] Resent verification email to ${partner.email}`);
        return { success: true, message: "Verification email sent! Please check your inbox and spam folder." };
      } catch (error) {
        console.error("[Partnership] resendVerificationEmail error:", error);
        return { success: false, message: "Failed to resend verification email. Please try again." };
      }
    }),
});
