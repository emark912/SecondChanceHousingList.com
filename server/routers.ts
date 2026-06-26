import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, adminProcedure, router, TRPCError } from "./_core/trpc";
import { getDb } from "./db";
import {
  createSearchSubmission,
  getSearchSubmissionById,
  updateSearchSubmissionStatus,
  updateSearchSubmissionAiSummary,
  getAllSearchSubmissions,
  createOrder,
  getOrderById,
  getOrderBySubmissionId,
  updateOrderPayment,
  updateOrderPdf,
  updateOrderEmailSent,
  getAllOrders,
  getTodayOrders,
  getTodaySalesTotal,
  getDailySubmissionAnalytics,
  getDailyOrderAnalytics,
  getAllNationalResults,
  createNationalResult,
  updateNationalResult,
  deleteNationalResult,
  createContactMessage,
  getAllContactMessages,
  markContactMessageRead,
  createEmailTrackingOpen,
  getEmailTrackingOpen,
  createEmailTrackingClick,
  getPageViewsByPage,
  getTrafficByDevice,
  getUniqueVisitors,
  getPageViewStats,
  getTrafficEventStats,
  createFormSubmission,
  getFormSubmissions,
  getFormSubmissionCount,
  getFormSubmissionsByDateRange,
  getFormSubmissionCountByDateRange,
  getTodayFormSubmissionCount,
  getRecentFormSubmissions,
  getEmailConversionAnalytics,
  getAverageTimeToPurchase,
  getReminderEmailRevenue,
  getSuccessMetrics,
  getMonthlyApprovals,
  getEmailDeliveryStats,
  getEmailMetricsByType,
  getAbandonedCartStats,
  getAllAbandonedCarts,
  updateAbandonedCartConversion,
  createEmailTemplate,
  getEmailTemplateById,
  getEmailTemplatesByType,
  getDefaultEmailTemplate,
  getAllEmailTemplates,
  updateEmailTemplate,
  deleteEmailTemplate,
  setDefaultEmailTemplate,
  duplicateEmailTemplate,
} from "./db";
import { invokeLLM } from "./_core/llm";
import { eq } from "drizzle-orm";
import { resumeAbandonedCart } from "./abandoned-cart-job";
import { emailTemplatesRouter } from "./email-templates-router";
import { adminEmailManagementRouter } from "./routers/admin-email-management";
import { adminInsightsRouter } from "./routers/admin-insights";
import { partnershipRouter } from "./routers/partnership";
import { adminPartnershipRouter } from "./routers/admin-partnership";
import { partnerAuthRouter } from "./routers/partner-auth";
import { stripeCheckoutRouter } from "./routers/stripe-checkout";
import { createCheckoutSession } from "./stripe-service";
import { generatePersonalizedPDF, ClientProfile } from "./pdf-generator";
import { notifyOwner } from "./_core/notification";
import { resendPaidOrders } from "./resend-paid-orders";
import { manualSendOrderByEmail } from "./manual-send-order";
import { recoverMissingOrders } from "./stripe-recovery";
import { orders } from "../drizzle/schema";
import { sql } from "drizzle-orm";
import { deliverLeadToPartners } from "./partnership-lead-trigger";

export const appRouter = router({
  system: systemRouter,
  partnership: partnershipRouter,
  partnerAuth: partnerAuthRouter,
  adminPartnership: adminPartnershipRouter,
  stripeCheckout: stripeCheckoutRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  search: router({
    submit: publicProcedure
      .input(z.object({
        customerName: z.string().min(1),
        customerEmail: z.string().email(),
        customerPhone: z.string().optional(),
        city: z.string().min(1),
        state: z.string().min(1),
        searchRadiusMiles: z.number().min(1).max(200),
        creditChallenges: z.array(z.string()).min(1),
        housingType: z.string().min(1),
        bedrooms: z.number().min(1).max(10),
        occupants: z.number().min(1).max(20),
        totalHouseholdIncome: z.string().min(1),
        monthlyTakeHomeIncome: z.string().min(1),
        employmentDuration: z.string().min(1),
        needsMovingLoan: z.enum(["yes", "no", "maybe"]),
        additionalInfo: z.string().optional(),
        criminalHistoryDetails: z.string().optional(),
        personalCircumstances: z.string().optional(),
        canPaySecurityDeposit: z.enum(["yes", "no", "unsure"]).optional(),
        creditRating: z.enum(["poor", "fair", "good", "very_good", "excellent"]).optional(),
      }))
      .mutation(async ({ input }) => {
        // Generate AI summary of additional info
        let aiSummary = "";
        if (input.additionalInfo && input.additionalInfo.trim().length > 0) {
          try {
            const llmResult = await invokeLLM({
              messages: [
                {
                  role: "system",
                  content: "You are a housing search assistant. Summarize the customer's additional housing needs and concerns in 2-3 concise sentences. Focus on key requirements that will help find suitable second chance housing options.",
                },
                {
                  role: "user",
                  content: input.additionalInfo,
                },
              ],
            });
            aiSummary = llmResult.choices[0]?.message?.content as string || "";
          } catch (e) {
            console.warn("LLM summary failed:", e);
            aiSummary = input.additionalInfo;
          }
        }

        const submissionId = await createSearchSubmission({
          ...input,
          aiSummary,
        });

        await updateSearchSubmissionStatus(submissionId, "completed");

        // Create a pending order
        const orderId = await createOrder({
          submissionId,
          customerName: input.customerName,
          customerEmail: input.customerEmail,
          amount: "39.99",
          originalPrice: "99.99",
          paymentStatus: "pending",
        });

        // Deliver lead to active partners asynchronously
        try {
          await deliverLeadToPartners(submissionId);
        } catch (error) {
          console.error("[Rental Submission] Error delivering leads to partners:", error);
          // Don't fail the submission if lead delivery fails
        }

        return { submissionId, orderId, aiSummary };
      }),

    getSubmission: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return getSearchSubmissionById(input.id);
      }),
  }),

  order: router({
    get: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return getOrderById(input.id);
      }),

    getBySubmission: publicProcedure
      .input(z.object({ submissionId: z.number() }))
      .query(async ({ input }) => {
        return getOrderBySubmissionId(input.submissionId);
      }),

    completePayment: publicProcedure
      .input(z.object({
        orderId: z.number(),
        paymentIntentId: z.string().optional(),
        sessionId: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await updateOrderPayment(input.orderId, {
          paymentStatus: "completed",
          stripePaymentIntentId: input.paymentIntentId,
          stripeSessionId: input.sessionId,
        });

        const order = await getOrderById(input.orderId);
        if (order) {
          await updateSearchSubmissionStatus(order.submissionId, "paid");
          
          try {
            const submission = await getSearchSubmissionById(order.submissionId);
            if (submission) {
              const profile: ClientProfile = {
                fullName: submission.customerName,
                email: submission.customerEmail,
                location: `${submission.city}, ${submission.state}`,
                creditChallenges: submission.creditChallenges,
                housingTypes: [submission.housingType],
                bedrooms: submission.bedrooms,
                criminalHistory: "Criminal History",
                evictions: "Evictions",
                annualIncome: submission.totalHouseholdIncome,
                monthlyBudget: submission.monthlyTakeHomeIncome,
                monthlyIncome: submission.monthlyTakeHomeIncome,
              };
              
              const { url: pdfUrl, fileKey: pdfFileKey } = await generatePersonalizedPDF(profile);
              await updateOrderPdf(input.orderId, pdfUrl, pdfFileKey);
            }
          } catch (error) {
            console.error("Error generating personalized PDF:", error);
          }
        }

        return { success: true };
      }),

    updatePdf: adminProcedure
      .input(z.object({
        orderId: z.number(),
        pdfUrl: z.string(),
        pdfFileKey: z.string(),
      }))
      .mutation(async ({ input }) => {
        await updateOrderPdf(input.orderId, input.pdfUrl, input.pdfFileKey);
        return { success: true };
      }),
  }),

  admin: router({
    login: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string().min(1),
      }))
      .mutation(async ({ input }) => {
        const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@secondchancehousing.com";
        const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "SecureAdminPass123!";
        if (input.email === ADMIN_EMAIL && input.password === ADMIN_PASSWORD) {
          const token = Buffer.from(JSON.stringify({ email: input.email, role: "admin", iat: Date.now() })).toString("base64");
          return { success: true, token, message: "Login successful" };
        } else {
          return { success: false, token: "", message: "Invalid email or password" };
        }
      }),

    dashboard: adminProcedure.query(async () => {
      const todaySales = await getTodaySalesTotal();
      const todayOrders = await getTodayOrders();
      const allOrders = await getAllOrders();

      // Stripe real-time revenue sync — auto-heal pending orders
      let stripeToday = 0;
      let stripeTodayCount = 0;
      try {
        const Stripe = (await import("stripe")).default;
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", { apiVersion: "2024-11-20.acacia" as any });
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayTimestamp = Math.floor(todayStart.getTime() / 1000);
        const charges = await stripe.charges.list({ limit: 100, created: { gte: todayTimestamp } });
        for (const charge of charges.data) {
          if (charge.status === "succeeded" && !charge.refunded) {
            stripeToday += charge.amount / 100;
            stripeTodayCount++;
          }
        }
        // Auto-heal any pending orders that Stripe shows as paid
        const db = await (await import("./db")).getDb();
        if (db) {
          const { orders: ordersTable } = await import("../drizzle/schema");
          const { eq } = await import("drizzle-orm");
          const pendingOrders = allOrders.filter(o => o.paymentStatus === "pending" && o.stripeSessionId);
          for (const pendingOrder of pendingOrders) {
            try {
              if (pendingOrder.stripeSessionId) {
                const session = await stripe.checkout.sessions.retrieve(pendingOrder.stripeSessionId);
                if (session.payment_status === "paid") {
                  await db.update(ordersTable).set({
                    paymentStatus: "completed",
                    stripePaymentIntentId: session.payment_intent as string,
                  }).where(eq(ordersTable.id, pendingOrder.id));
                  console.log(`[Admin Dashboard] Auto-healed order ${pendingOrder.id} from Stripe`);
                }
              }
            } catch (_) { /* skip individual order errors */ }
          }
        }
      } catch (stripeErr) {
        console.warn("[Admin Dashboard] Stripe sync failed:", stripeErr);
      }

      return {
        todaySales,
        todayOrders,
        allOrders,
        stripeToday,
        stripeTodayCount,
      };
    }),

    submissions: adminProcedure.query(async () => {
      return getFormSubmissions();
    }),

    orders: adminProcedure.query(async () => {
      return getAllOrders();
    }),

    dailySubmissionAnalytics: adminProcedure
      .input(z.object({
        days: z.number().min(1).max(365).default(30),
      }))
      .query(async ({ input }) => {
        return getDailySubmissionAnalytics(input.days);
      }),

    dailyOrderAnalytics: adminProcedure
      .input(z.object({
        days: z.number().min(1).max(365).default(30),
      }))
      .query(async ({ input }) => {
        return getDailyOrderAnalytics(input.days);
      }),

    nationalResults: adminProcedure.query(async () => {
      return getAllNationalResults();
    }),

    addNationalResult: adminProcedure
      .input(z.object({
        companyName: z.string().min(1),
        companyWebsite: z.string().optional(),
        contactPerson: z.string().optional(),
        contactPhone: z.string().optional(),
        contactEmail: z.string().optional(),
        description: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const id = await createNationalResult(input);
        return { id };
      }),

    updateNationalResult: adminProcedure
      .input(z.object({
        id: z.number(),
        companyName: z.string().min(1).optional(),
        companyWebsite: z.string().optional(),
        contactPerson: z.string().optional(),
        contactPhone: z.string().optional(),
        contactEmail: z.string().optional(),
        description: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await updateNationalResult(id, data);
        return { success: true };
      }),

    deleteNationalResult: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteNationalResult(input.id);
        return { success: true };
      }),

    programs: adminProcedure.query(async () => {
      const { getAllSecondChancePrograms } = await import("./db");
      return getAllSecondChancePrograms();
    }),

    createProgram: adminProcedure
      .input(z.object({
        programName: z.string().min(1),
        website: z.string().optional(),
        contactPerson: z.string().optional(),
        contactPhone: z.string().optional(),
        contactEmail: z.string().optional(),
        description: z.string().optional(),
        states: z.array(z.string()).default([]),
        nationwide: z.number().default(0),
        acceptsNoCreditScore: z.number().default(0),
        acceptsLowCredit: z.number().default(0),
        acceptsEvictions: z.number().default(0),
        acceptsBankruptcy: z.number().default(0),
        acceptsCriminalHistory: z.number().default(0),
        acceptsBrokenLeases: z.number().default(0),
      }))
      .mutation(async ({ input }) => {
        const { createSecondChanceProgram } = await import("./db");
        const id = await createSecondChanceProgram(input);
        return { id };
      }),

    updateProgram: adminProcedure
      .input(z.object({
        id: z.number(),
        programName: z.string().optional(),
        website: z.string().optional(),
        contactPerson: z.string().optional(),
        contactPhone: z.string().optional(),
        contactEmail: z.string().optional(),
        description: z.string().optional(),
        states: z.array(z.string()).optional(),
        nationwide: z.number().optional(),
        acceptsNoCreditScore: z.number().optional(),
        acceptsLowCredit: z.number().optional(),
        acceptsEvictions: z.number().optional(),
        acceptsBankruptcy: z.number().optional(),
        acceptsCriminalHistory: z.number().optional(),
        acceptsBrokenLeases: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { updateSecondChanceProgram } = await import("./db");
        const { id, ...data } = input;
        await updateSecondChanceProgram(id, data);
        return { success: true };
      }),

    deleteProgram: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const { deleteSecondChanceProgram } = await import("./db");
        await deleteSecondChanceProgram(input.id);
        return { success: true };
      }),

    contactMessages: adminProcedure.query(async () => {
      return getAllContactMessages();
    }),

    markMessageRead: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await markContactMessageRead(input.id);
        return { success: true };
      }),

    formSubmissions: adminProcedure
      .input(z.object({
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      }).optional())
      .query(async ({ input }) => {
        if (input?.startDate && input?.endDate) {
          return getFormSubmissions(input.startDate, input.endDate);
        }
        return getFormSubmissions();
      }),

    formSubmissionStats: adminProcedure
      .input(z.object({
        dateRange: z.enum(["today", "7days", "30days", "60days", "custom"]).default("today"),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      }))
      .query(async ({ input }) => {
        let count = 0;
        let submissions: any[] = [];

        if (input.dateRange === "today") {
          count = await getTodayFormSubmissionCount();
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          submissions = await getFormSubmissions(today, tomorrow);
        } else if (input.dateRange === "7days") {
          count = await getFormSubmissionCountByDateRange(7);
          submissions = await getFormSubmissionsByDateRange(7);
        } else if (input.dateRange === "30days") {
          count = await getFormSubmissionCountByDateRange(30);
          submissions = await getFormSubmissionsByDateRange(30);
        } else if (input.dateRange === "60days") {
          count = await getFormSubmissionCountByDateRange(60);
          submissions = await getFormSubmissionsByDateRange(60);
        } else if (input.dateRange === "custom" && input.startDate && input.endDate) {
          count = await getFormSubmissionCount(input.startDate, input.endDate);
          submissions = await getFormSubmissions(input.startDate, input.endDate);
        }

        return {
          count,
          submissions: submissions || [],
          dateRange: input.dateRange,
        };
      }),

    getDailySubmissions: adminProcedure
      .query(async () => {
        const todayCount = await getTodayFormSubmissionCount();
        const recentSubmissions = await getRecentFormSubmissions(10);
        return {
          todayCount,
          recentSubmissions,
        };
      }),

    paymentsList: adminProcedure.query(async () => {
      try {
        const paymentsList = await getAllOrders();
        return paymentsList.map((order: any) => ({
          orderId: order.id,
          submissionId: order.submissionId,
          customerName: order.customerName,
          customerEmail: order.customerEmail,
          amount: parseFloat(order.amount as string),
          paymentStatus: order.paymentStatus,
          pdfUrl: order.pdfUrl,
          emailSent: order.emailSent === 1,
          createdAt: order.createdAt,
        }));
      } catch (error) {
        console.error("[Admin] Error fetching payments:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch payments",
        });
      }
    }),

    paymentDetails: adminProcedure
      .input(z.object({ orderId: z.number() }))
      .query(async ({ input }) => {
        try {
          const order = await getOrderById(input.orderId);
          if (!order) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Order not found",
            });
          }
          return order;
        } catch (error) {
          console.error("[Admin] Error fetching payment details:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch payment details",
          });
        }
      }),

    getPdfUrl: adminProcedure
      .input(z.object({ orderId: z.number() }))
      .query(async ({ input }) => {
        try {
          const order = await getOrderById(input.orderId);
          if (!order) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Order not found",
            });
          }
          if (!order.pdfUrl) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "No PDF available for this order",
            });
          }
          return {
            pdfUrl: order.pdfUrl,
            fileName: `rental-results-${order.customerName}-${order.id}.pdf`,
          };
        } catch (error) {
          console.error("[Admin] Error getting PDF URL:", error);
          if (error instanceof TRPCError) throw error;
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to get PDF URL",
          });
        }
      }),

    resendPdfEmail: adminProcedure
      .input(z.object({ orderId: z.number() }))
      .mutation(async ({ input }) => {
        try {
          const order = await getOrderById(input.orderId);
          if (!order) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Order not found",
            });
          }
          if (!order.pdfUrl) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "No PDF available for this order",
            });
          }
          await updateOrderEmailSent(order.id);
          return {
            success: true,
            message: "Email resend queued successfully",
            sentAt: new Date(),
          };
        } catch (error) {
          console.error("[Admin] Error resending email:", error);
          if (error instanceof TRPCError) throw error;
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to resend email",
          });
        }
      }),

    resendAllPaidOrders: adminProcedure.mutation(async () => {
      try {
        console.log("[Admin] Resending orders to all paid customers...");
        const result = await resendPaidOrders();
        return result;
      } catch (error) {
        console.error("[Admin] Error resending all paid orders:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to resend orders",
        });
      }
    }),

    manualSendOrder: adminProcedure
      .input(z.object({ customerEmail: z.string().email() }))
      .mutation(async ({ input }) => {
        try {
          console.log(`[Admin] Manually sending order to ${input.customerEmail}...`);
          const result = await manualSendOrderByEmail(input.customerEmail);
          return result;
        } catch (error) {
          console.error(`[Admin] Error sending order to ${input.customerEmail}:`, error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to send order",
          });
        }
      }),

    recoverMissingOrders: adminProcedure
      .input(z.object({ daysBack: z.number().min(1).max(90).default(7) }))
      .mutation(async ({ input }) => {
        try {
          console.log(`[Admin] Recovering missing orders from last ${input.daysBack} days...`);
          const result = await recoverMissingOrders(input.daysBack);
          return result;
        } catch (error) {
          console.error(`[Admin] Error recovering missing orders:`, error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to recover missing orders",
          });
        }
      }),

    getEmailStats: adminProcedure.query(async () => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database connection failed");

        const result = await db
          .select({
            totalSent: sql`COUNT(*)`,
            emailSent: sql`SUM(CASE WHEN emailSent = 1 THEN 1 ELSE 0 END)`,
            emailFailed: sql`SUM(CASE WHEN emailSent = 0 THEN 1 ELSE 0 END)`,
          })
          .from(orders);

        const stats = result[0] || { totalSent: 0, emailSent: 0, emailFailed: 0 };
        const totalSent = (stats?.totalSent as number) || 0;
        const emailSent = (stats?.emailSent as number) || 0;
        const successRate = totalSent > 0 ? (emailSent / totalSent) * 100 : 0;

        return {
          totalSent: stats.totalSent || 0,
          totalFailed: stats.emailFailed || 0,
          totalRetrying: 0,
          successRate: Math.round(successRate),
          averageDeliveryTime: 0,
        };
      } catch (error) {
        console.error("[Admin] Error getting email stats:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get email stats",
        });
      }
    }),

    getRetryQueueStatus: adminProcedure.query(async () => {
      try {
        return {
          queueSize: 0,
          items: [],
        };
      } catch (error) {
        console.error("[Admin] Error getting retry queue:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get retry queue",
        });
      }
    }),

    getFailedEmails: adminProcedure.query(async () => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database connection failed");

        const result = await db
          .select({
            orderId: orders.id,
            customerEmail: orders.customerEmail,
            lastError: sql`'Email delivery failed'`,
            failedAt: orders.createdAt,
          })
          .from(orders)
          .where(eq(orders.emailSent, 0))
          .limit(50);

        return result;
      } catch (error) {
        console.error("[Admin] Error getting failed emails:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get failed emails",
        });
      }
    }),
  }),

  traffic: router({
    getStats: adminProcedure
      .input(z.object({ days: z.number().min(1).max(365).default(7) }))
      .query(async ({ input }) => {
        const totalViews = await getPageViewStats(input.days).then(views => views.length);
        const uniqueVisitors = await getUniqueVisitors(input.days);
        const viewsByPage = await getPageViewsByPage(input.days);
        const trafficByDevice = await getTrafficByDevice(input.days);
        const topEvents = await getTrafficEventStats(input.days);
        
        const eventCounts: Record<string, number> = {};
        topEvents.forEach(event => {
          const key = event.eventName;
          eventCounts[key] = (eventCounts[key] || 0) + 1;
        });

        return {
          totalViews,
          uniqueVisitors,
          viewsByPage,
          trafficByDevice,
          topEvents: Object.entries(eventCounts)
            .map(([eventName, count]) => ({ eventName, eventType: 'user_interaction', count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10),
          dateRange: {
            start: new Date(Date.now() - input.days * 24 * 60 * 60 * 1000).toISOString(),
            end: new Date().toISOString(),
          },
        };
      }),
  }),

  contact: router({
    submit: publicProcedure
      .input(z.object({
        name: z.string().min(1),
        email: z.string().email(),
        subject: z.string().min(1),
        message: z.string().min(1),
      }))
      .mutation(async ({ input }) => {
        const id = await createContactMessage(input);
        return { id, success: true };
      }),
  }),

  payment: router({
    createCheckoutSession: publicProcedure
      .input(
        z.object({
          amount: z.number().min(500).max(999999), // Allows $5.00 to $9,999.99 (payment plan is $500)
          orderId: z.number().int().nonnegative().optional(),
          submissionId: z.number().int().nonnegative().optional(),
          customerEmail: z.string().email(),
          customerName: z.string(),
          donationAmount: z.number().min(0).optional(),
          downPaymentChoice: z.enum(['500', '250']).optional(), // '500' = $500 down plan, '250' = $250 down plan
          rentalProfile: z.object({
            location: z.string(),
            searchRadius: z.number(),
            creditChallenges: z.array(z.string()),
            housingTypes: z.array(z.string()),
            bedrooms: z.string(),
            criminalHistory: z.string(),
            criminalHistoryType: z.string().optional(),
            evictions: z.string(),
            income: z.string(),
            monthlyBudget: z.string(),
            monthlyIncome: z.string(),
            petPreference: z.string(),
            smokingStatus: z.string(),
            moveInTimeline: z.string(),
          }),
        })
      )
      .mutation(async ({ input, ctx }) => {
        try {
          console.log("[Payment] Creating checkout with amount:", input.amount, "cents, usePaymentPlan:", input.amount === 50000);
          const origin = ctx.req.headers.origin || "https://secondchance-housing.com";
          const successUrl = `${origin}/payment-confirmation?session_id={CHECKOUT_SESSION_ID}`;
          const cancelUrl = `${origin}/results?canceled=true`;

          // Determine if this is a payment plan down payment
          // Payment plan is $500, standard is $1,000

          // Derive paymentPlan value for the order record
          let paymentPlanValue: 'full' | 'plan_500' | 'plan_250' = 'full';
            if (input.downPaymentChoice === '500') paymentPlanValue = 'plan_500';
            else if (input.downPaymentChoice === '250') paymentPlanValue = 'plan_250';
          }

          const result = await createCheckoutSession({
            amount: input.amount,
            customerEmail: input.customerEmail,
            customerName: input.customerName,
            orderId: input.orderId || 0,
            submissionId: input.submissionId || 0,
            successUrl,
            cancelUrl,
            donationAmount: input.donationAmount,
            isPaymentPlan,
          });

          if (!result || !result.url) {
            throw new Error("Failed to create checkout session");
          }

          // Only update order payment if orderId is provided
          if (input.orderId) {
            await updateOrderPayment(input.orderId, {
              paymentStatus: "pending",
              stripeSessionId: result.sessionId,
            });
            // Save the payment plan choice on the order
            if (paymentPlanValue !== 'full') {
              await (await getDb())!.update(orders).set({ paymentPlan: paymentPlanValue }).where(eq(orders.id, input.orderId));
            }
          }

          return {
            checkoutUrl: result.url,
            success: true,
          };
        } catch (error) {
          console.error("[Payment] Checkout session error:", error);
          throw error;
        }
      }),

    createFlexiblePaymentSession: publicProcedure
      .input(
        z.object({
          customerName: z.string(),
          customerEmail: z.string().email(),
          downPaymentAmount: z.number().min(2500),
          totalAmount: z.number(),
          remainingBalance: z.number(),
          paymentFrequency: z.enum(['weekly', 'biweekly', 'monthly']),
          paymentSchedule: z.array(z.object({
            date: z.string(),
            amount: z.number(),
          })),
          searchData: z.any().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        try {
          const origin = ctx.req.headers.origin || "https://secondchance-housing.com";
          const successUrl = `${origin}/flexible-payment-confirmation?session_id={CHECKOUT_SESSION_ID}`;
          const cancelUrl = `${origin}/flexible-payment?canceled=true`;

          const result = await createCheckoutSession({
            amount: input.downPaymentAmount,
            customerEmail: input.customerEmail,
            customerName: input.customerName,
            orderId: 0,
            submissionId: 0,
            successUrl,
            cancelUrl,
          });

          if (result && input.searchData) {
            console.log(`[FlexiblePayment] Session created with search data for ${input.customerEmail}`);
          }

          if (!result || !result.url) {
            throw new Error("Failed to create flexible payment session");
          }

          return {
            url: result.url,
            sessionId: result.sessionId,
          };
        } catch (error) {
          console.error("Flexible payment session error:", error);
          throw new Error("Failed to create flexible payment session");
        }
      }),

    getPaymentPlans: adminProcedure
      .input(z.object({ status: z.enum(['active', 'paused', 'completed', 'cancelled']).optional() }).optional())
      .query(async ({ input }) => {
        const { getAllFlexiblePaymentPlans } = await import("./db");
        return getAllFlexiblePaymentPlans(input?.status);
      }),

    getFailedPayments: adminProcedure.query(async () => {
      const { getFailedScheduledPayments } = await import("./db");
      return getFailedScheduledPayments();
    }),

    getPaymentPlanDetails: adminProcedure
      .input(z.object({ planId: z.number() }))
      .query(async ({ input }) => {
        const { getFlexiblePaymentPlan, getScheduledPaymentsForPlan, getPaymentProcessingLogsForPlan } = await import("./db");
        const plan = await getFlexiblePaymentPlan(input.planId);
        const payments = await getScheduledPaymentsForPlan(input.planId);
        const logs = await getPaymentProcessingLogsForPlan(input.planId);
        return { plan, payments, logs };
      }),

    getDashboardStats: adminProcedure.query(async () => {
      const { getPaymentDashboardStats } = await import("./db");
      return getPaymentDashboardStats();
    }),

    retryFailedPayment: adminProcedure
      .input(z.object({ paymentId: z.number() }))
      .mutation(async ({ input }) => {
        const { retryScheduledPayment } = await import("./db");
        const success = await retryScheduledPayment(input.paymentId);
        return { success };
      }),

    cancelPaymentPlan: adminProcedure
      .input(z.object({ planId: z.number(), reason: z.string() }))
      .mutation(async ({ input }) => {
        const { cancelFlexiblePaymentPlan } = await import("./db");
        const success = await cancelFlexiblePaymentPlan(input.planId, input.reason);
        return { success };
      }),

    resumeAbandonedCart: publicProcedure
      .input(z.object({ resumeToken: z.string() }))
      .query(async ({ input }) => {
        const { resumeAbandonedCart } = await import("./abandoned-cart-job");
        const result = await resumeAbandonedCart(input.resumeToken);
        if (!result) {
          throw new Error("Invalid or expired resume token");
        }
        return result;
      }),

      .input(
        z.object({
          submissionId: z.number().int().nonnegative(),
          customerEmail: z.string().email(),
          customerName: z.string(),
          rentalProfile: z.object({
            location: z.string(),
            searchRadius: z.number(),
            creditChallenges: z.array(z.string()),
            housingTypes: z.array(z.string()),
            bedrooms: z.string(),
            criminalHistory: z.string(),
            criminalHistoryType: z.string().optional(),
            evictions: z.string(),
            income: z.string(),
            monthlyBudget: z.string(),
            monthlyIncome: z.string(),
            petPreference: z.string(),
            smokingStatus: z.string(),
            moveInTimeline: z.string(),
          }),
        })
      )
      .mutation(async ({ input, ctx }) => {
        try {
          const origin = ctx.req.headers.origin || "https://secondchance-housing.com";
          const cancelUrl = `${origin}/results?canceled=true`;

          // Create checkout session for $1,000 down payment
          const downPaymentAmount = 100000; // $1,000 in cents
          const result = await createCheckoutSession({
            amount: downPaymentAmount,
            customerEmail: input.customerEmail,
            customerName: input.customerName,
            orderId: 0,
            submissionId: input.submissionId,
            successUrl,
            cancelUrl,
          });

          if (!result || !result.url) {
          }

          return {
            checkoutUrl: result.url,
            sessionId: result.sessionId,
            success: true,
          };
        } catch (error) {
          throw error;
        }
      }),

      .input(z.object({ planId: z.number() }))
      .query(async ({ input }) => {
        return { plan, installments };
      }),

      .input(z.object({ status: z.enum(['active', 'paused', 'completed', 'cancelled']).optional() }).optional())
      .query(async ({ input }) => {
      }),

    sendMonthlyPaymentSetupEmail: adminProcedure
      .input(z.object({ planId: z.number() }))
      .mutation(async ({ input }) => {
        try {
          const { sendMonthlyPaymentSetupEmail } = await import("./email-service");
          
          if (!plan) {
            throw new Error("Payment plan not found");
          }

          const emailSent = await sendMonthlyPaymentSetupEmail(
            plan.customerEmail,
            plan.customerName,
            plan.monthlyInstallmentAmount / 100, // Convert cents to dollars
            plan.monthlyInstallmentCount,
            input.planId
          );

          if (!emailSent) {
            throw new Error("Failed to send monthly payment setup email");
          }

          return { success: true, message: "Monthly payment setup email sent" };
        } catch (error) {
          throw error;
        }
      }),

      .input(z.object({ planId: z.number(), reason: z.string() }))
      .mutation(async ({ input }) => {
        try {
          return { success };
        } catch (error) {
          throw error;
        }
      }),
  }),

  email: router({
    trackOpen: publicProcedure
      .input(z.object({
        trackingPixelId: z.string(),
      }))
      .query(async ({ input, ctx }) => {
        try {
          const userAgent = ctx.req.headers['user-agent'] || '';
          const ipAddress = ctx.req.headers['x-forwarded-for']?.toString().split(',')[0] || ctx.req.socket?.remoteAddress || '';
          
          // Check if already tracked
          const existing = await getEmailTrackingOpen(input.trackingPixelId);
          if (!existing) {
            // Extract emailLogId from trackingPixelId format: {emailLogId}-{uuid}
            const emailLogId = parseInt(input.trackingPixelId.split('-')[0], 10);
            if (!isNaN(emailLogId)) {
              await createEmailTrackingOpen({
                emailLogId,
                trackingPixelId: input.trackingPixelId,
                userAgent,
                ipAddress,
              });
            }
          }
          
          // Return 1x1 transparent pixel
          return { pixel: true };
        } catch (error) {
          console.error('Email open tracking error:', error);
          return { pixel: true };
        }
      }),

    trackClick: publicProcedure
      .input(z.object({
        clickTrackingId: z.string(),
        redirect: z.string().url().optional(),
      }))
      .query(async ({ input, ctx }) => {
        try {
          const userAgent = ctx.req.headers['user-agent'] || '';
          const ipAddress = ctx.req.headers['x-forwarded-for']?.toString().split(',')[0] || ctx.req.socket?.remoteAddress || '';
          
          // Extract emailLogId from clickTrackingId format: {emailLogId}-{uuid}
          const emailLogId = parseInt(input.clickTrackingId.split('-')[0], 10);
          if (!isNaN(emailLogId)) {
            await createEmailTrackingClick({
              emailLogId,
              clickTrackingId: input.clickTrackingId,
              linkUrl: input.redirect || '',
              userAgent,
              ipAddress,
            });
          }
          
          return { tracked: true, redirect: input.redirect };
        } catch (error) {
          console.error('Email click tracking error:', error);
          return { tracked: false, redirect: input.redirect };
        }
      }),
  }),
  analytics: router({
    getConversionMetrics: adminProcedure.query(async () => {
      const analytics = await getEmailConversionAnalytics();
      const timeToPurchase = await getAverageTimeToPurchase();
      const revenue = await getReminderEmailRevenue();
      
      return {
        ...analytics,
        ...timeToPurchase,
        ...revenue,
      };
    }),
    emailDelivery: router({
      getStats: adminProcedure.query(async () => {
        return await getEmailDeliveryStats();
      }),
      getByType: adminProcedure.input(z.object({ emailType: z.string() })).query(async ({ input }) => {
        return await getEmailMetricsByType(input.emailType);
      }),
    }),
    abandonedCart: router({
      getStats: adminProcedure.query(async () => {
        return await getAbandonedCartStats();
      }),
      getAll: adminProcedure.query(async () => {
        return await getAllAbandonedCarts();
      }),
      markConverted: adminProcedure
        .input(z.object({ cartId: z.number(), conversionType: z.string(), conversionValue: z.number() }))
        .mutation(async ({ input }) => {
          return await updateAbandonedCartConversion(input.cartId, input.conversionType, input.conversionValue);
        }),
    }),
  }),

  emailTemplates: emailTemplatesRouter,
  adminEmailManagement: adminEmailManagementRouter,
  adminInsights: adminInsightsRouter,

  metrics: router({
    getSuccessMetrics: publicProcedure.query(async () => {
      return await getSuccessMetrics();
    }),
    getMonthlyApprovals: publicProcedure.query(async () => {
      return await getMonthlyApprovals();
    }),
  }),
});

export type AppRouter = typeof appRouter;
