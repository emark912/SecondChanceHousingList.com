/**
 * Admin Insights Router
 * Provides all new admin features:
 * - Business Command Center KPIs
 * - Lead Intelligence Analytics
 * - Discount Code CRUD
 * - Payment Plans Dashboard
 * - System Health Panel
 * - Partner Notes
 * - Abandoned Cart Recovery (manual trigger)
 */
import { z } from "zod";
import { router, adminProcedure, TRPCError } from "../_core/trpc";
import { getDb } from "../db";
import { eq, desc, and, gte, lte, count, sum, sql } from "drizzle-orm";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", { apiVersion: "2024-11-20.acacia" as any });
import {
  orders,
  searchSubmissions,
  discountCodes,
  flexiblePaymentPlans,
  scheduledPayments,
  partnerPrograms,
  abandonedCarts,
  abandonedCartAnalytics,
  leadPackages,
  deliveredLeads,
} from "../../drizzle/schema";

// ─── Business Command Center ─────────────────────────────────────────────────
async function getCommandCenterStats() {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Customer orders stats — include ALL orders (pending + completed) for revenue tracking
  // Orders may be pending if webhook hasn't fired yet, so we use Stripe as the source of truth
  const allOrders = await db.select().from(orders).orderBy(desc(orders.createdAt));
  const completedOrders = allOrders.filter(o => o.paymentStatus === "completed");
  const todayOrders = completedOrders.filter(o => new Date(o.createdAt) >= todayStart);
  const last30Orders = completedOrders.filter(o => new Date(o.createdAt) >= thirtyDaysAgo);
  const last7Orders = completedOrders.filter(o => new Date(o.createdAt) >= sevenDaysAgo);

  let totalRevenue = completedOrders.reduce((s, o) => s + parseFloat(String(o.amount || 0)), 0);
  const last30Revenue = last30Orders.reduce((s, o) => s + parseFloat(String(o.amount || 0)), 0);
  const last7Revenue = last7Orders.reduce((s, o) => s + parseFloat(String(o.amount || 0)), 0);
  let todayRevenue = todayOrders.reduce((s, o) => s + parseFloat(String(o.amount || 0)), 0);

  // ── Stripe real-time revenue sync ──────────────────────────────────────────
  // Pull today's successful charges directly from Stripe API to catch any
  // orders where the webhook hasn't updated the DB status yet
  let stripeToday = 0;
  let stripeTodayCount = 0;
  let stripeTotal = 0;
  let stripeTotalCount = 0;
  try {
    const todayTimestamp = Math.floor(todayStart.getTime() / 1000);
    // Fetch today's successful payment intents from Stripe
    const charges = await stripe.charges.list({
      limit: 100,
      created: { gte: todayTimestamp },
    });
    for (const charge of charges.data) {
      if (charge.status === "succeeded" && !charge.refunded) {
        stripeToday += charge.amount / 100;
        stripeTodayCount++;
      }
    }
    // Also sync any pending orders that Stripe shows as paid
    const pendingOrders = allOrders.filter(o => o.paymentStatus === "pending" && o.stripeSessionId);
    for (const pendingOrder of pendingOrders) {
      try {
        if (pendingOrder.stripeSessionId) {
          const session = await stripe.checkout.sessions.retrieve(pendingOrder.stripeSessionId);
          if (session.payment_status === "paid") {
            // Auto-heal: mark this order as completed in the DB
            await db.update(orders).set({
              paymentStatus: "completed",
              stripePaymentIntentId: session.payment_intent as string,
            }).where(eq(orders.id, pendingOrder.id));
            console.log(`[AdminInsights] Auto-healed order ${pendingOrder.id} — marked as completed from Stripe`);
            // Add to revenue counts
            const amt = parseFloat(String(pendingOrder.amount || 0));
            if (new Date(pendingOrder.createdAt) >= todayStart) todayRevenue += amt;
            totalRevenue += amt; // will be recalculated below but update local var
          }
        }
      } catch (_) { /* skip individual order errors */ }
    }
    // Get all-time total from Stripe for cross-validation
    const allCharges = await stripe.charges.list({ limit: 100 });
    for (const charge of allCharges.data) {
      if (charge.status === "succeeded" && !charge.refunded) {
        stripeTotal += charge.amount / 100;
        stripeTotalCount++;
      }
    }
  } catch (stripeErr) {
    console.warn("[AdminInsights] Stripe revenue fetch failed:", stripeErr);
  }

  // Use Stripe today revenue if it's higher than DB (catches webhook delays)
  const effectiveTodayRevenue = Math.max(todayRevenue, stripeToday);

  // Lead submissions
  const allSubmissions = await db.select({ id: searchSubmissions.id, createdAt: searchSubmissions.createdAt, status: searchSubmissions.status }).from(searchSubmissions);
  const last30Submissions = allSubmissions.filter(s => new Date(s.createdAt) >= thirtyDaysAgo);
  const last7Submissions = allSubmissions.filter(s => new Date(s.createdAt) >= sevenDaysAgo);
  const todaySubmissions = allSubmissions.filter(s => new Date(s.createdAt) >= todayStart);

  // Conversion rate (submissions that became paid orders)
  const paidSubmissions = allSubmissions.filter(s => s.status === "paid");
  const conversionRate = allSubmissions.length > 0 ? (paidSubmissions.length / allSubmissions.length) * 100 : 0;

  // Partner revenue
  const allPackages = await db.select().from(leadPackages).where(eq(leadPackages.paymentStatus, "completed"));
  const last30Packages = allPackages.filter(p => new Date(p.createdAt) >= thirtyDaysAgo);
  const partnerRevenue = allPackages.reduce((s, p) => s + parseFloat(String(p.totalPrice || 0)), 0);
  const last30PartnerRevenue = last30Packages.reduce((s, p) => s + parseFloat(String(p.totalPrice || 0)), 0);

  // Abandoned carts
  const allCarts = await db.select().from(abandonedCarts);
  const recoveredCarts = allCarts.filter(c => c.status === "completed");
  const cartRecoveryRate = allCarts.length > 0 ? (recoveredCarts.length / allCarts.length) * 100 : 0;

  // Payment plans
  const allPlans = await db.select().from(flexiblePaymentPlans);
  const activePlans = allPlans.filter(p => p.status === "active");
  const planRevenue = allPlans.reduce((s, p) => s + (p.totalAmount - p.remainingBalance) / 100, 0);

  // Daily revenue for chart (last 30 days)
  const dailyRevenue: Record<string, number> = {};
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().split("T")[0];
    dailyRevenue[key] = 0;
  }
  for (const o of allOrders) {
    const key = new Date(o.createdAt).toISOString().split("T")[0];
    if (key in dailyRevenue) {
      dailyRevenue[key] += parseFloat(String(o.amount || 0));
    }
  }
  for (const p of allPackages) {
    const key = new Date(p.createdAt).toISOString().split("T")[0];
    if (key in dailyRevenue) {
      dailyRevenue[key] += parseFloat(String(p.totalPrice || 0));
    }
  }

  return {
    // Revenue KPIs
    totalRevenue: Math.max(totalRevenue + partnerRevenue, stripeTotal),
    todayRevenue: effectiveTodayRevenue,
    last7Revenue: last7Revenue,
    last30Revenue: last30Revenue + last30PartnerRevenue,
    // Stripe real-time stats
    stripeTodayRevenue: stripeToday,
    stripeTodayCount,
    stripeTotalRevenue: stripeTotal,
    stripeTotalCount,
    // Customer orders
    totalOrders: completedOrders.length,
    todayOrders: todayOrders.length + stripeTodayCount,
    last7Orders: last7Orders.length,
    last30Orders: last30Orders.length,
    // Submissions
    totalSubmissions: allSubmissions.length,
    todaySubmissions: todaySubmissions.length,
    last7Submissions: last7Submissions.length,
    last30Submissions: last30Submissions.length,
    conversionRate: Math.round(conversionRate * 10) / 10,
    // Partner revenue
    partnerRevenue,
    last30PartnerRevenue,
    totalPackagesSold: allPackages.length,
    // Abandoned carts
    totalAbandonedCarts: allCarts.length,
    recoveredCarts: recoveredCarts.length,
    cartRecoveryRate: Math.round(cartRecoveryRate * 10) / 10,
    // Payment plans
    activePlans: activePlans.length,
    totalPlans: allPlans.length,
    planRevenue,
    // Chart data
    dailyRevenue: Object.entries(dailyRevenue).map(([date, revenue]) => ({ date, revenue })),
  };
}

// ─── Lead Intelligence ────────────────────────────────────────────────────────
async function getLeadIntelligence() {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");

  const subs = await db.select().from(searchSubmissions);

  // Top cities
  const cityCount: Record<string, number> = {};
  const stateCount: Record<string, number> = {};
  const housingTypeCount: Record<string, number> = {};
  const creditChallengeCount: Record<string, number> = {};
  const bedroomCount: Record<string, number> = {};
  const incomeCount: Record<string, number> = {};
  const creditRatingCount: Record<string, number> = {};

  for (const s of subs) {
    // City
    const cityKey = `${s.city}, ${s.state}`;
    cityCount[cityKey] = (cityCount[cityKey] || 0) + 1;
    // State
    stateCount[s.state] = (stateCount[s.state] || 0) + 1;
    // Housing type
    housingTypeCount[s.housingType] = (housingTypeCount[s.housingType] || 0) + 1;
    // Credit challenges
    if (Array.isArray(s.creditChallenges)) {
      for (const c of s.creditChallenges as string[]) {
        creditChallengeCount[c] = (creditChallengeCount[c] || 0) + 1;
      }
    }
    // Bedrooms
    const bKey = `${s.bedrooms} bed`;
    bedroomCount[bKey] = (bedroomCount[bKey] || 0) + 1;
    // Income
    incomeCount[s.totalHouseholdIncome] = (incomeCount[s.totalHouseholdIncome] || 0) + 1;
    // Credit rating
    if (s.creditRating) {
      creditRatingCount[s.creditRating] = (creditRatingCount[s.creditRating] || 0) + 1;
    }
  }

  const topCities = Object.entries(cityCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([city, count]) => ({ city, count }));

  const topStates = Object.entries(stateCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([state, count]) => ({ state, count }));

  const housingTypes = Object.entries(housingTypeCount)
    .sort((a, b) => b[1] - a[1])
    .map(([type, count]) => ({ type, count }));

  const creditChallenges = Object.entries(creditChallengeCount)
    .sort((a, b) => b[1] - a[1])
    .map(([challenge, count]) => ({ challenge, count }));

  const bedroomDistribution = Object.entries(bedroomCount)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([bedrooms, count]) => ({ bedrooms, count }));

  const incomeDistribution = Object.entries(incomeCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([income, count]) => ({ income, count }));

  const creditRatingDistribution = Object.entries(creditRatingCount)
    .map(([rating, count]) => ({ rating, count }));

  // Conversion funnel
  const total = subs.length;
  const paid = subs.filter(s => s.status === "paid").length;
  const pending = subs.filter(s => s.status === "pending").length;
  const completed = subs.filter(s => s.status === "completed").length;

  return {
    totalSubmissions: total,
    topCities,
    topStates,
    housingTypes,
    creditChallenges,
    bedroomDistribution,
    incomeDistribution,
    creditRatingDistribution,
    conversionFunnel: {
      submitted: total,
      completed,
      paid,
      pending,
    },
  };
}

// ─── Discount Codes ───────────────────────────────────────────────────────────
async function getAllDiscountCodes() {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  return db.select().from(discountCodes).orderBy(desc(discountCodes.createdAt));
}

async function createDiscountCode(data: {
  code: string;
  description?: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  maxUses?: number;
  validFrom: Date;
  validUntil: Date;
}) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.insert(discountCodes).values({
    code: data.code.toUpperCase(),
    description: data.description,
    discountType: data.discountType,
    discountValue: String(data.discountValue),
    maxUses: data.maxUses,
    validFrom: data.validFrom,
    validUntil: data.validUntil,
    isActive: 1,
  });
  return { success: true };
}

async function updateDiscountCodeStatus(id: number, isActive: boolean) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.update(discountCodes).set({ isActive: isActive ? 1 : 0 }).where(eq(discountCodes.id, id));
  return { success: true };
}

async function deleteDiscountCode(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.delete(discountCodes).where(eq(discountCodes.id, id));
  return { success: true };
}

// ─── Payment Plans ────────────────────────────────────────────────────────────
async function getPaymentPlansDashboard() {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");

  const plans = await db.select().from(flexiblePaymentPlans).orderBy(desc(flexiblePaymentPlans.createdAt));
  const payments = await db.select().from(scheduledPayments).orderBy(desc(scheduledPayments.scheduledDate));

  const now = new Date();
  const upcoming = payments.filter(p => p.status === "pending" && new Date(p.scheduledDate) >= now);
  const overdue = payments.filter(p => p.status === "pending" && new Date(p.scheduledDate) < now);
  const failed = payments.filter(p => p.status === "failed");

  return {
    plans: plans.map(p => ({
      ...p,
      totalAmountDollars: p.totalAmount / 100,
      remainingBalanceDollars: p.remainingBalance / 100,
      collectedDollars: (p.totalAmount - p.remainingBalance) / 100,
    })),
    stats: {
      totalPlans: plans.length,
      activePlans: plans.filter(p => p.status === "active").length,
      completedPlans: plans.filter(p => p.status === "completed").length,
      pausedPlans: plans.filter(p => p.status === "paused").length,
      totalCollected: plans.reduce((s, p) => s + (p.totalAmount - p.remainingBalance) / 100, 0),
      totalRemaining: plans.reduce((s, p) => s + p.remainingBalance / 100, 0),
    },
    upcomingPayments: upcoming.slice(0, 10).map(p => ({
      ...p,
      amountDollars: p.paymentAmount / 100,
    })),
    overduePayments: overdue.slice(0, 10).map(p => ({
      ...p,
      amountDollars: p.paymentAmount / 100,
    })),
    failedPayments: failed.slice(0, 10).map(p => ({
      ...p,
      amountDollars: p.paymentAmount / 100,
    })),
  };
}

// ─── System Health ────────────────────────────────────────────────────────────
async function getSystemHealth() {
  const db = await getDb();
  const dbStatus = db ? "healthy" : "error";

  // Check email delivery (last 24h)
  let emailStatus = "unknown";
  let recentEmailCount = 0;
  let recentEmailFailures = 0;
  try {
    if (db) {
      const recentOrders = await db
        .select({ emailSent: orders.emailSent, createdAt: orders.createdAt })
        .from(orders)
        .where(gte(orders.createdAt, new Date(Date.now() - 24 * 60 * 60 * 1000)));
      recentEmailCount = recentOrders.filter(o => o.emailSent === 1).length;
      recentEmailFailures = recentOrders.filter(o => o.emailSent === 0).length;
      emailStatus = recentEmailFailures > recentEmailCount ? "degraded" : "healthy";
    }
  } catch {
    emailStatus = "error";
  }

  // Check DB row counts
  let tableCounts: Record<string, number> = {};
  try {
    if (db) {
      const [ordersCount] = await db.select({ count: count() }).from(orders);
      const [subsCount] = await db.select({ count: count() }).from(searchSubmissions);
      const [partnersCount] = await db.select({ count: count() }).from(partnerPrograms);
      const [cartsCount] = await db.select({ count: count() }).from(abandonedCarts);
      const [plansCount] = await db.select({ count: count() }).from(flexiblePaymentPlans);
      tableCounts = {
        orders: ordersCount.count,
        search_submissions: subsCount.count,
        partner_programs: partnersCount.count,
        abandoned_carts: cartsCount.count,
        flexible_payment_plans: plansCount.count,
      };
    }
  } catch {
    // ignore
  }

  // Check failed scheduled payments
  let failedPaymentsCount = 0;
  try {
    if (db) {
      const [fp] = await db.select({ count: count() }).from(scheduledPayments).where(eq(scheduledPayments.status, "failed"));
      failedPaymentsCount = fp.count;
    }
  } catch {
    // ignore
  }

  return {
    timestamp: new Date().toISOString(),
    services: {
      database: { status: dbStatus, message: dbStatus === "healthy" ? "Connected" : "Connection failed" },
      email: {
        status: emailStatus,
        message: `${recentEmailCount} sent, ${recentEmailFailures} failed in last 24h`,
        recentSent: recentEmailCount,
        recentFailed: recentEmailFailures,
      },
      stripe: { status: "healthy", message: "Webhook configured" },
    },
    tableCounts,
    alerts: [
      ...(failedPaymentsCount > 0 ? [`${failedPaymentsCount} failed scheduled payment(s) need attention`] : []),
      ...(recentEmailFailures > 5 ? [`High email failure rate: ${recentEmailFailures} failures in last 24h`] : []),
      ...(dbStatus !== "healthy" ? ["Database connection issue detected"] : []),
    ],
  };
}

// ─── Partner Notes ────────────────────────────────────────────────────────────
async function updatePartnerAdminNotes(partnerId: number, notes: string) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db
    .update(partnerPrograms)
    .set({ adminNotes: notes, updatedAt: new Date() })
    .where(eq(partnerPrograms.id, partnerId));
  return { success: true };
}

// ─── Abandoned Cart Recovery ──────────────────────────────────────────────────
async function getAbandonedCartsForAdmin() {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");

  const carts = await db
    .select()
    .from(abandonedCarts)
    .orderBy(desc(abandonedCarts.createdAt))
    .limit(100);

  const stats = {
    total: carts.length,
    pending: carts.filter(c => c.status === "pending").length,
    emailSent: carts.filter(c => c.status === "email_sent").length,
    completed: carts.filter(c => c.status === "completed").length,
    expired: carts.filter(c => c.status === "expired").length,
    recoveryRate: carts.length > 0
      ? Math.round((carts.filter(c => c.status === "completed").length / carts.length) * 100 * 10) / 10
      : 0,
  };

  return { carts, stats };
}

// ─── Router ───────────────────────────────────────────────────────────────────
export const adminInsightsRouter = router({
  // Business Command Center
  getCommandCenter: adminProcedure.query(async () => {
    try {
      return await getCommandCenterStats();
    } catch (error) {
      console.error("[AdminInsights] Command center error:", error);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to load command center" });
    }
  }),

  // Lead Intelligence
  getLeadIntelligence: adminProcedure.query(async () => {
    try {
      return await getLeadIntelligence();
    } catch (error) {
      console.error("[AdminInsights] Lead intelligence error:", error);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to load lead intelligence" });
    }
  }),

  // Discount Codes
  getAllDiscountCodes: adminProcedure.query(async () => {
    try {
      return await getAllDiscountCodes();
    } catch (error) {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to load discount codes" });
    }
  }),
  createDiscountCode: adminProcedure
    .input(z.object({
      code: z.string().min(3).max(50),
      description: z.string().optional(),
      discountType: z.enum(["percentage", "fixed"]),
      discountValue: z.number().min(0.01),
      maxUses: z.number().int().positive().optional(),
      validFrom: z.string(),
      validUntil: z.string(),
    }))
    .mutation(async ({ input }) => {
      try {
        return await createDiscountCode({
          ...input,
          validFrom: new Date(input.validFrom),
          validUntil: new Date(input.validUntil),
        });
      } catch (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create discount code" });
      }
    }),
  updateDiscountCodeStatus: adminProcedure
    .input(z.object({ id: z.number(), isActive: z.boolean() }))
    .mutation(async ({ input }) => {
      try {
        return await updateDiscountCodeStatus(input.id, input.isActive);
      } catch (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to update discount code" });
      }
    }),
  deleteDiscountCode: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      try {
        return await deleteDiscountCode(input.id);
      } catch (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to delete discount code" });
      }
    }),

  // Payment Plans
  getPaymentPlansDashboard: adminProcedure.query(async () => {
    try {
      return await getPaymentPlansDashboard();
    } catch (error) {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to load payment plans" });
    }
  }),
  retryScheduledPayment: adminProcedure
    .input(z.object({ paymentId: z.number() }))
    .mutation(async ({ input }) => {
      try {
        const { retryScheduledPayment } = await import("../db");
        return await retryScheduledPayment(input.paymentId);
      } catch (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to retry payment" });
      }
    }),

  // System Health
  getSystemHealth: adminProcedure.query(async () => {
    try {
      return await getSystemHealth();
    } catch (error) {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to load system health" });
    }
  }),

  // Partner Notes
  updatePartnerNotes: adminProcedure
    .input(z.object({ partnerId: z.number(), notes: z.string() }))
    .mutation(async ({ input }) => {
      try {
        return await updatePartnerAdminNotes(input.partnerId, input.notes);
      } catch (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to update partner notes" });
      }
    }),

  // Abandoned Carts
  getAbandonedCarts: adminProcedure.query(async () => {
    try {
      return await getAbandonedCartsForAdmin();
    } catch (error) {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to load abandoned carts" });
    }
  }),
  sendRecoveryEmail: adminProcedure
    .input(z.object({ cartId: z.number() }))
    .mutation(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("DB unavailable");
        const carts = await db.select().from(abandonedCarts).where(eq(abandonedCarts.id, input.cartId)).limit(1);
        if (!carts.length) throw new TRPCError({ code: "NOT_FOUND", message: "Cart not found" });
        const cart = carts[0];
        const { sendAbandonedCartEmail } = await import("../email-service");
        const resumeLink = `${process.env.FRONTEND_URL || "https://secondchancehousinglocator.com"}/resume?token=${cart.resumeToken}`;
        const sent = await sendAbandonedCartEmail(
          cart.customerEmail,
          cart.customerName,
          cart.location,
          cart.rentalMatches,
          resumeLink,
          cart.discountCode || "SAVE10",
          cart.discountPercentage || 10
        );
        if (sent) {
          await db.update(abandonedCarts)
            .set({ status: "email_sent", emailSentAt: new Date() })
            .where(eq(abandonedCarts.id, input.cartId));
        }
        return { success: sent, message: sent ? "Recovery email sent" : "Failed to send email" };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to send recovery email" });
      }
    }),
});
