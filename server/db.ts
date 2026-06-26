import { eq, desc, sql, and, gte, lte, count, sum, avg } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, searchSubmissions, orders, nationalResults, contactMessages, secondChancePrograms, emailLogs, emailTrackingOpens, emailTrackingClicks, pageViews, trafficEvents, formSubmissions, emailTracking, flexiblePaymentPlans, scheduledPayments, paymentProcessingLogs, emailDeliveryMetrics, abandonedCartAnalytics, emailTemplates, corporateLeasingPaymentPlans, corporateLeasingInstallments } from "../drizzle/schema";
import type { InsertSearchSubmission, InsertOrder, InsertNationalResult, InsertContactMessage, InsertSecondChanceProgram, SecondChanceProgram, InsertEmailLog, InsertEmailTrackingOpen, InsertEmailTrackingClick, InsertPageView, InsertTrafficEvent, InsertFormSubmission, FormSubmission, InsertEmailTracking, InsertFlexiblePaymentPlan, FlexiblePaymentPlan, InsertScheduledPayment, ScheduledPayment, InsertPaymentProcessingLog, InsertEmailDeliveryMetric, InsertAbandonedCartAnalytic, EmailTemplate, InsertEmailTemplate, CorporateLeasingPaymentPlan, InsertCorporateLeasingPaymentPlan, CorporateLeasingInstallment, InsertCorporateLeasingInstallment } from "../drizzle/schema";

import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

/** Reset the cached DB connection so the next getDb() call creates a fresh one. */
export function resetDb() {
  _db = null;
}

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Search Submissions
export async function createSearchSubmission(data: InsertSearchSubmission) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(searchSubmissions).values(data);
  return result[0].insertId;
}

export async function getSearchSubmissionById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(searchSubmissions).where(eq(searchSubmissions.id, id)).limit(1);
  return result[0] ?? null;
}

export async function updateSearchSubmissionStatus(id: number, status: "pending" | "completed" | "paid") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(searchSubmissions).set({ status }).where(eq(searchSubmissions.id, id));
}

export async function updateSearchSubmissionAiSummary(id: number, aiSummary: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(searchSubmissions).set({ aiSummary }).where(eq(searchSubmissions.id, id));
}

export async function getAllSearchSubmissions() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(searchSubmissions).orderBy(desc(searchSubmissions.createdAt));
}

// Orders
export async function createOrder(data: InsertOrder) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(orders).values(data);
  return result[0].insertId;
}

export async function getOrderById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  return result[0] ?? null;
}

export async function getOrderBySubmissionId(submissionId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(orders).where(eq(orders.submissionId, submissionId)).limit(1);
  return result[0] ?? null;
}

export async function getOrderBySessionId(stripeSessionId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(orders).where(eq(orders.stripeSessionId, stripeSessionId)).limit(1);
  return result[0] ?? null;
}

export async function updateOrderPayment(id: number, data: { paymentStatus: "pending" | "completed" | "refunded" | "failed"; stripePaymentIntentId?: string; stripeSessionId?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(orders).set(data).where(eq(orders.id, id));
}

export async function updateOrderPdf(id: number, pdfUrl: string, pdfFileKey: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(orders).set({ pdfUrl, pdfFileKey }).where(eq(orders.id, id));
}

export async function updateOrderEmailSent(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(orders).set({ emailSent: 1 }).where(eq(orders.id, id));
}

export async function getAllOrders() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(orders).orderBy(desc(orders.createdAt));
}

export async function getTodayOrders() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return db.select().from(orders).where(gte(orders.createdAt, today)).orderBy(desc(orders.createdAt));
}

export async function getTodaySalesTotal() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const result = await db.select({
    total: sql<string>`COALESCE(SUM(CASE WHEN ${orders.paymentStatus} = 'completed' THEN ${orders.amount} ELSE 0 END), 0)`,
    count: sql<number>`COUNT(CASE WHEN ${orders.paymentStatus} = 'completed' THEN 1 END)`,
    totalOrders: sql<number>`COUNT(*)`,
  }).from(orders).where(gte(orders.createdAt, today));
  return result[0];
}

// National Results
export async function getAllNationalResults() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(nationalResults).where(eq(nationalResults.isActive, 1)).orderBy(desc(nationalResults.createdAt));
}

export async function createNationalResult(data: InsertNationalResult) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(nationalResults).values(data);
  return result[0].insertId;
}

export async function updateNationalResult(id: number, data: Partial<InsertNationalResult>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(nationalResults).set(data).where(eq(nationalResults.id, id));
}

export async function deleteNationalResult(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(nationalResults).set({ isActive: 0 }).where(eq(nationalResults.id, id));
}

// Contact Messages
export async function createContactMessage(data: InsertContactMessage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(contactMessages).values(data);
  return result[0].insertId;
}

export async function getAllContactMessages() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt));
}

export async function markContactMessageRead(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(contactMessages).set({ isRead: 1 }).where(eq(contactMessages.id, id));
}


// Second Chance Programs
export async function createSecondChanceProgram(data: InsertSecondChanceProgram) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(secondChancePrograms).values(data);
  return result[0].insertId;
}

export async function getAllSecondChancePrograms() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(secondChancePrograms).where(eq(secondChancePrograms.isActive, 1)).orderBy(desc(secondChancePrograms.displayOrder), desc(secondChancePrograms.createdAt));
}

export async function getSecondChanceProgramById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(secondChancePrograms).where(eq(secondChancePrograms.id, id));
  return result[0] || null;
}

export async function getProgramsByLocation(state: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(secondChancePrograms).where(
    and(
      eq(secondChancePrograms.isActive, 1),
      sql`(${secondChancePrograms.nationwide} = 1 OR JSON_CONTAINS(${secondChancePrograms.states}, JSON_QUOTE(${state})))`
    )
  ).orderBy(desc(secondChancePrograms.displayOrder));
}

export async function getProgramsByCategory(category: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(secondChancePrograms).where(
    and(
      eq(secondChancePrograms.isActive, 1),
      eq(secondChancePrograms.category, category as any)
    )
  ).orderBy(desc(secondChancePrograms.displayOrder));
}

export async function getProgramsByLocationAndCategory(state: string, category: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(secondChancePrograms).where(
    and(
      eq(secondChancePrograms.isActive, 1),
      eq(secondChancePrograms.category, category as any),
      sql`(${secondChancePrograms.nationwide} = 1 OR JSON_CONTAINS(${secondChancePrograms.states}, JSON_QUOTE(${state})))`
    )
  ).orderBy(desc(secondChancePrograms.displayOrder));
}

export async function updateSecondChanceProgram(id: number, data: Partial<InsertSecondChanceProgram>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(secondChancePrograms).set(data).where(eq(secondChancePrograms.id, id));
}

export async function deleteSecondChanceProgram(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(secondChancePrograms).set({ isActive: 0 }).where(eq(secondChancePrograms.id, id));
}

export async function restoreSecondChanceProgram(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(secondChancePrograms).set({ isActive: 1 }).where(eq(secondChancePrograms.id, id));
}

// Email Management Functions
export async function getEmailLogs(filters?: {
  recipientEmail?: string;
  emailType?: string;
  status?: string;
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(emailLogs).orderBy(desc(emailLogs.sentAt));
  
  let filtered = result;
  if (filters?.recipientEmail) {
    filtered = filtered.filter(e => e.recipientEmail === filters.recipientEmail);
  }
  if (filters?.emailType) {
    filtered = filtered.filter(e => e.emailType === filters.emailType);
  }
  if (filters?.status) {
    filtered = filtered.filter(e => e.status === filters.status);
  }
  
  if (filters?.offset) {
    filtered = filtered.slice(filters.offset);
  }
  if (filters?.limit) {
    filtered = filtered.slice(0, filters.limit);
  }
  
  return filtered;
}

export async function getEmailLogById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(emailLogs).where(eq(emailLogs.id, id)).limit(1);
  return result[0] ?? null;
}

export async function createEmailLog(data: InsertEmailLog) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(emailLogs).values(data);
  return result[0].insertId;
}

export async function updateEmailLog(id: number, data: Partial<InsertEmailLog>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(emailLogs).set(data).where(eq(emailLogs.id, id));
}

export async function getEmailLogsByCustomer(customerEmail: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(emailLogs)
    .where(eq(emailLogs.recipientEmail, customerEmail))
    .orderBy(desc(emailLogs.sentAt));
}

export async function getEmailLogsBySubmission(submissionId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(emailLogs)
    .where(eq(emailLogs.submissionId, submissionId))
    .orderBy(desc(emailLogs.sentAt));
}

export async function countEmailLogs(filters?: {
  recipientEmail?: string;
  emailType?: string;
  status?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(emailLogs);
  
  let filtered = result;
  if (filters?.recipientEmail) {
    filtered = filtered.filter(e => e.recipientEmail === filters.recipientEmail);
  }
  if (filters?.emailType) {
    filtered = filtered.filter(e => e.emailType === filters.emailType);
  }
  if (filters?.status) {
    filtered = filtered.filter(e => e.status === filters.status);
  }
  
  return filtered.length;
}

// Email Tracking Functions
export async function createEmailTrackingOpen(data: {
  emailLogId: number;
  trackingPixelId: string;
  userAgent?: string;
  ipAddress?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(emailTrackingOpens).values(data);
  return result[0].insertId;
}

export async function getEmailTrackingOpen(trackingPixelId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(emailTrackingOpens)
    .where(eq(emailTrackingOpens.trackingPixelId, trackingPixelId))
    .limit(1);
  return result[0] ?? null;
}

export async function createEmailTrackingClick(data: {
  emailLogId: number;
  clickTrackingId: string;
  linkUrl: string;
  userAgent?: string;
  ipAddress?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(emailTrackingClicks).values(data);
  return result[0].insertId;
}

export async function getEmailTrackingClicksByEmail(emailLogId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(emailTrackingClicks)
    .where(eq(emailTrackingClicks.emailLogId, emailLogId))
    .orderBy(desc(emailTrackingClicks.clickedAt));
}

export async function getEmailTrackingOpensByEmail(emailLogId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(emailTrackingOpens)
    .where(eq(emailTrackingOpens.emailLogId, emailLogId))
    .orderBy(desc(emailTrackingOpens.openedAt));
}


// Traffic Tracking Functions
export async function createPageView(data: InsertPageView) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(pageViews).values(data);
  return result[0].insertId;
}

export async function createTrafficEvent(data: InsertTrafficEvent) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(trafficEvents).values(data);
  return result[0].insertId;
}

export async function getPageViewStats(days: number = 7) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return db.select().from(pageViews)
    .where(gte(pageViews.viewedAt, startDate))
    .orderBy(desc(pageViews.viewedAt));
}

export async function getTrafficEventStats(days: number = 7) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return db.select().from(trafficEvents)
    .where(gte(trafficEvents.occurredAt, startDate))
    .orderBy(desc(trafficEvents.occurredAt));
}

export async function getUniqueVisitors(days: number = 7) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const result = await db.select({ count: sql<number>`COUNT(DISTINCT sessionId)` })
    .from(pageViews)
    .where(gte(pageViews.viewedAt, startDate));
  
  return result[0]?.count || 0;
}

export async function getPageViewsByPage(days: number = 7) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return db.select({
    pagePath: pageViews.pagePath,
    pageTitle: pageViews.pageTitle,
    views: sql<number>`COUNT(*)`,
  })
    .from(pageViews)
    .where(gte(pageViews.viewedAt, startDate))
    .groupBy(pageViews.pagePath, pageViews.pageTitle)
    .orderBy(sql`COUNT(*) DESC`)
    .limit(20);
}

export async function getTrafficByDevice(days: number = 7) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return db.select({
    deviceType: pageViews.deviceType,
    views: sql<number>`COUNT(*)`,
  })
    .from(pageViews)
    .where(gte(pageViews.viewedAt, startDate))
    .groupBy(pageViews.deviceType);
}


// Form Submissions
export async function createFormSubmission(data: InsertFormSubmission) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(formSubmissions).values(data);
  return result[0].insertId;
}

export async function getFormSubmissions(startDate?: Date, endDate?: Date) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  if (startDate && endDate) {
    return db.select().from(formSubmissions)
      .where(and(
        gte(formSubmissions.createdAt, startDate),
        lte(formSubmissions.createdAt, endDate)
      ))
      .orderBy(desc(formSubmissions.createdAt));
  }
  
  return db.select().from(formSubmissions).orderBy(desc(formSubmissions.createdAt));
}

export async function getFormSubmissionCount(startDate?: Date, endDate?: Date) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  let result;
  if (startDate && endDate) {
    result = await db.select({ count: count() }).from(formSubmissions)
      .where(and(
        gte(formSubmissions.createdAt, startDate),
        lte(formSubmissions.createdAt, endDate)
      ));
  } else {
    result = await db.select({ count: count() }).from(formSubmissions);
  }
  
  return result[0]?.count || 0;
}

export async function getFormSubmissionsByDateRange(days: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return db.select().from(formSubmissions)
    .where(gte(formSubmissions.createdAt, startDate))
    .orderBy(desc(formSubmissions.createdAt));
}

export async function getFormSubmissionCountByDateRange(days: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const result = await db.select({ count: count() }).from(formSubmissions)
    .where(gte(formSubmissions.createdAt, startDate));
  
  return result[0]?.count || 0;
}

export async function getTodayFormSubmissionCount() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const result = await db.select({ count: count() }).from(formSubmissions)
    .where(and(
      gte(formSubmissions.createdAt, today),
      lte(formSubmissions.createdAt, tomorrow)
    ));
  
  return result[0]?.count || 0;
}

export async function getFormSubmissionById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(formSubmissions).where(eq(formSubmissions.id, id));
  return result[0] || null;
}


/**
 * Get email conversion analytics
 */
export async function getEmailConversionAnalytics() {
  const db = await getDb();
  if (!db) return null;

  // Get total submissions
  const totalSubmissions = await db
    .select({ count: sql`COUNT(*)` })
    .from(formSubmissions);

  // Get conversions (orders with completed status)
  const totalConversions = await db
    .select({ count: sql`COUNT(DISTINCT ${orders.submissionId})` })
    .from(orders)
    .where(sql`${orders.paymentStatus} = 'completed'`);

  // Get 30-minute email conversions
  const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000);
  const thirtyMinConversions = await db
    .select({ count: sql`COUNT(DISTINCT ${orders.submissionId})` })
    .from(orders)
    .innerJoin(formSubmissions, sql`${orders.submissionId} = ${formSubmissions.id}`)
    .where(
      and(
        sql`${orders.paymentStatus} = 'completed'`,
        sql`${orders.createdAt} >= ${thirtyMinAgo}`
      )
    );

  // Get 3-day email conversions
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
  const threeDayConversions = await db
    .select({ count: sql`COUNT(DISTINCT ${orders.submissionId})` })
    .from(orders)
    .innerJoin(formSubmissions, sql`${orders.submissionId} = ${formSubmissions.id}`)
    .where(
      and(
        sql`${orders.paymentStatus} = 'completed'`,
        sql`${orders.createdAt} >= ${thirtyMinAgo}`,
        sql`${orders.createdAt} < ${threeDaysAgo}`
      )
    );

  const totalCount = Number(totalSubmissions[0]?.count || 0);
  const conversionCount = Number(totalConversions[0]?.count || 0);
  const thirtyMinCount = Number(thirtyMinConversions[0]?.count || 0);
  const threeDayCount = Number(threeDayConversions[0]?.count || 0);

  return {
    totalSubmissions: totalCount,
    totalConversions: conversionCount,
    overallConversionRate: totalCount > 0 ? (conversionCount / totalCount) * 100 : 0,
    thirtyMinConversions: thirtyMinCount,
    thirtyMinConversionRate: totalCount > 0 ? (thirtyMinCount / totalCount) * 100 : 0,
    threeDayConversions: threeDayCount,
    threeDayConversionRate: totalCount > 0 ? (threeDayCount / totalCount) * 100 : 0,
    noEmailConversions: conversionCount - thirtyMinCount - threeDayCount,
  };
}

/**
 * Get average time to purchase
 */
export async function getAverageTimeToPurchase() {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select({
      avgMinutes: sql`AVG(EXTRACT(EPOCH FROM (${orders.createdAt} - ${formSubmissions.createdAt})) / 60)`,
    })
    .from(orders)
    .innerJoin(formSubmissions, sql`${orders.submissionId} = ${formSubmissions.id}`)
    .where(sql`${orders.paymentStatus} = 'completed'`);

  return {
    averageMinutes: Math.round(Number(result[0]?.avgMinutes || 0)),
  };
}

/**
 * Get revenue from reminder emails
 */
export async function getReminderEmailRevenue() {
  const db = await getDb();
  if (!db) return null;

  const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000);
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

  // Revenue from 30-minute reminders
  const thirtyMinRevenue = await db
    .select({ total: sql`SUM(${orders.amount})` })
    .from(orders)
    .innerJoin(formSubmissions, sql`${orders.submissionId} = ${formSubmissions.id}`)
    .where(
      and(
        sql`${orders.paymentStatus} = 'completed'`,
        sql`${orders.createdAt} >= ${thirtyMinAgo}`
      )
    );

  // Revenue from 3-day reminders
  const threeDayRevenue = await db
    .select({ total: sql`SUM(${orders.amount})` })
    .from(orders)
    .innerJoin(formSubmissions, sql`${orders.submissionId} = ${formSubmissions.id}`)
    .where(
      and(
        sql`${orders.paymentStatus} = 'completed'`,
        sql`${orders.createdAt} >= ${threeDaysAgo}`,
        sql`${orders.createdAt} < ${thirtyMinAgo}`
      )
    );

  return {
    thirtyMinRevenue: Number(thirtyMinRevenue[0]?.total || 0),
    threeDayRevenue: Number(threeDayRevenue[0]?.total || 0),
    totalReminderRevenue: Number(thirtyMinRevenue[0]?.total || 0) + Number(threeDayRevenue[0]?.total || 0),
  };
}


/**
 * Get recent form submissions for admin dashboard
 */
export async function getRecentFormSubmissions(limit: number = 10) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db
    .select()
    .from(formSubmissions)
    .orderBy(sql`${formSubmissions.createdAt} DESC`)
    .limit(limit);
  
  return result;
}


// Success Metrics Functions
export async function getSuccessMetrics() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const now = new Date();
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisYear = new Date(now.getFullYear(), 0, 1);
  
  // Get completed orders this month
  const completedThisMonth = await db.select({ count: count() }).from(orders)
    .where(and(
      eq(orders.paymentStatus, 'completed'),
      gte(orders.createdAt, thisMonth)
    ));
  
  // Get total completed orders
  const totalCompleted = await db.select({ count: count() }).from(orders)
    .where(eq(orders.paymentStatus, 'completed'));
  
  // Get total national results/housing options
  const totalOptions = await db.select({ count: count() }).from(nationalResults)
    .where(eq(nationalResults.isActive, 1));
  
  // Get total form submissions this month
  const submissionsThisMonth = await db.select({ count: count() }).from(formSubmissions)
    .where(gte(formSubmissions.createdAt, thisMonth));
  
  // Get total form submissions
  const totalSubmissions = await db.select({ count: count() }).from(formSubmissions);
  
  // Get unique customers this month
  const uniqueCustomersThisMonth = await db.select({ count: sql<number>`COUNT(DISTINCT customerEmail)` })
    .from(orders)
    .where(and(
      eq(orders.paymentStatus, 'completed'),
      gte(orders.createdAt, thisMonth)
    ));
  
  return {
    rentersApprovedThisMonth: completedThisMonth[0]?.count || 0,
    totalRentersApproved: totalCompleted[0]?.count || 0,
    totalRentalOptions: totalOptions[0]?.count || 0,
    formSubmissionsThisMonth: submissionsThisMonth[0]?.count || 0,
    totalFormSubmissions: totalSubmissions[0]?.count || 0,
    uniqueCustomersThisMonth: uniqueCustomersThisMonth[0]?.count || 0,
  };
}

export async function getMonthlyApprovals() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  
  return db.select({
    month: sql<string>`DATE_FORMAT(createdAt, '%Y-%m')`,
    approvals: sql<number>`COUNT(*)`,
  })
    .from(orders)
    .where(and(
      eq(orders.paymentStatus, 'completed'),
      gte(orders.createdAt, sixMonthsAgo)
    ))
    .groupBy(sql`DATE_FORMAT(createdAt, '%Y-%m')`)
    .orderBy(sql`DATE_FORMAT(createdAt, '%Y-%m')`);
}


/**
 * Track an email send for duplicate prevention
 */
export async function trackEmailSent(data: InsertEmailTracking): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) {
      console.warn("[Database] Cannot track email: database not available");
      return false;
    }

    await db.insert(emailTracking).values(data);
    return true;
  } catch (error) {
    console.error("[Database] Error tracking email:", error);
    return false;
  }
}

/**
 * Check if an email has already been sent for a specific submission and type
 */
export async function hasEmailBeenSent(submissionId: number, emailType: string): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) {
      console.warn("[Database] Cannot check email: database not available");
      return false;
    }

    const result = await db
      .select()
      .from(emailTracking)
      .where(
        and(
          eq(emailTracking.submissionId, submissionId),
          eq(emailTracking.emailType, emailType as any)
        )
      )
      .limit(1);

    return result.length > 0;
  } catch (error) {
    console.error("[Database] Error checking email:", error);
    return false;
  }
}

/**
 * Get all emails sent for a submission
 */
export async function getEmailsForSubmission(submissionId: number): Promise<any[]> {
  try {
    const db = await getDb();
    if (!db) {
      console.warn("[Database] Cannot get emails: database not available");
      return [];
    }

    return await db
      .select()
      .from(emailTracking)
      .where(eq(emailTracking.submissionId, submissionId))
      .orderBy(desc(emailTracking.sentAt));
  } catch (error) {
    console.error("[Database] Error getting emails:", error);
    return [];
  }
}

/**
 * Update order with PDF URL and mark email as sent
 */
export async function updateOrderWithPDF(orderId: number, pdfUrl: string, pdfFileKey: string): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) {
      console.warn("[Database] Cannot update order: database not available");
      return false;
    }

    await db
      .update(orders)
      .set({
        pdfUrl,
        pdfFileKey,
        emailSent: 1,
      })
      .where(eq(orders.id, orderId));

    return true;
  } catch (error) {
    console.error("[Database] Error updating order:", error);
    return false;
  }
}


/**
 * Create a flexible payment plan
 */
export async function createFlexiblePaymentPlan(data: InsertFlexiblePaymentPlan): Promise<FlexiblePaymentPlan | null> {
  try {
    const db = await getDb();
    if (!db) {
      console.warn("[Database] Cannot create flexible payment plan: database not available");
      return null;
    }
    const result = await db.insert(flexiblePaymentPlans).values(data);
    const planId = result[0];
    if (!planId) return null;
    
    const plan = await db.select().from(flexiblePaymentPlans).where(eq(flexiblePaymentPlans.id, planId as any)).limit(1);
    return plan[0] || null;
  } catch (error) {
    console.error("[Database] Error creating flexible payment plan:", error);
    return null;
  }
}

/**
 * Get a flexible payment plan by ID
 */
export async function getFlexiblePaymentPlan(id: number): Promise<FlexiblePaymentPlan | null> {
  try {
    const db = await getDb();
    if (!db) {
      console.warn("[Database] Cannot get flexible payment plan: database not available");
      return null;
    }
    const result = await db.select().from(flexiblePaymentPlans).where(eq(flexiblePaymentPlans.id, id)).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("[Database] Error getting flexible payment plan:", error);
    return null;
  }
}

/**
 * Create scheduled payments for a flexible payment plan
 */
export async function createScheduledPayments(planId: number, payments: Array<{ date: string; amount: number }>, customerEmail: string): Promise<ScheduledPayment[]> {
  try {
    const db = await getDb();
    if (!db) {
      console.warn("[Database] Cannot create scheduled payments: database not available");
      return [];
    }

    const scheduledPaymentsList: InsertScheduledPayment[] = payments.map(payment => ({
      flexiblePaymentPlanId: planId,
      customerEmail,
      paymentAmount: payment.amount,
      scheduledDate: new Date(payment.date),
      status: "pending" as const,
    }));

    await db.insert(scheduledPayments).values(scheduledPaymentsList);
    
    // Retrieve and return the created payments
    const result = await db.select().from(scheduledPayments).where(eq(scheduledPayments.flexiblePaymentPlanId, planId));
    return result;
  } catch (error) {
    console.error("[Database] Error creating scheduled payments:", error);
    return [];
  }
}

/**
 * Get pending scheduled payments due for processing
 */
export async function getPendingScheduledPayments(beforeDate: Date): Promise<ScheduledPayment[]> {
  try {
    const db = await getDb();
    if (!db) {
      console.warn("[Database] Cannot get pending payments: database not available");
      return [];
    }
    const result = await db
      .select()
      .from(scheduledPayments)
      .where(
        and(
          eq(scheduledPayments.status, "pending"),
          lte(scheduledPayments.scheduledDate, beforeDate)
        )
      )
      .orderBy(scheduledPayments.scheduledDate);
    return result;
  } catch (error) {
    console.error("[Database] Error getting pending payments:", error);
    return [];
  }
}

/**
 * Update scheduled payment status
 */
export async function updateScheduledPaymentStatus(id: number, status: "pending" | "processing" | "completed" | "failed" | "cancelled", data?: Partial<ScheduledPayment>): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) {
      console.warn("[Database] Cannot update scheduled payment: database not available");
      return false;
    }
    await db.update(scheduledPayments).set({
      status,
      ...data,
      updatedAt: new Date(),
    }).where(eq(scheduledPayments.id, id));
    return true;
  } catch (error) {
    console.error("[Database] Error updating scheduled payment:", error);
    return false;
  }
}

/**
 * Log payment processing attempt
 */
export async function logPaymentProcessing(data: InsertPaymentProcessingLog): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) {
      console.warn("[Database] Cannot log payment processing: database not available");
      return false;
    }
    await db.insert(paymentProcessingLogs).values(data);
    return true;
  } catch (error) {
    console.error("[Database] Error logging payment processing:", error);
    return false;
  }
}

/**
 * Get flexible payment plan by Stripe session ID
 */
export async function getFlexiblePaymentPlanBySessionId(sessionId: string): Promise<FlexiblePaymentPlan | null> {
  try {
    const db = await getDb();
    if (!db) {
      console.warn("[Database] Cannot get flexible payment plan: database not available");
      return null;
    }
    const result = await db
      .select()
      .from(flexiblePaymentPlans)
      .where(eq(flexiblePaymentPlans.downPaymentStripeSessionId, sessionId))
      .limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("[Database] Error getting flexible payment plan:", error);
    return null;
  }
}

/**
 * Update flexible payment plan status
 */
export async function updateFlexiblePaymentPlanStatus(id: number, status: "active" | "paused" | "completed" | "cancelled"): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) {
      console.warn("[Database] Cannot update flexible payment plan: database not available");
      return false;
    }
    await db.update(flexiblePaymentPlans).set({
      status,
      updatedAt: new Date(),
    }).where(eq(flexiblePaymentPlans.id, id));
    return true;
  } catch (error) {
    console.error("[Database] Error updating flexible payment plan:", error);
    return false;
  }
}


/**
 * Get all flexible payment plans with optional filtering
 */
export async function getAllFlexiblePaymentPlans(status?: string): Promise<FlexiblePaymentPlan[]> {
  try {
    const db = await getDb();
    if (!db) {
      console.warn("[Database] Cannot get flexible payment plans: database not available");
      return [];
    }
    
    if (status) {
      const result = await db
        .select()
        .from(flexiblePaymentPlans)
        .where(eq(flexiblePaymentPlans.status, status as any))
        .orderBy(desc(flexiblePaymentPlans.createdAt));
      return result;
    }
    
    const result = await db
      .select()
      .from(flexiblePaymentPlans)
      .orderBy(desc(flexiblePaymentPlans.createdAt));
    return result;
  } catch (error) {
    console.error("[Database] Error getting flexible payment plans:", error);
    return [];
  }
}

/**
 * Get all failed scheduled payments
 */
export async function getFailedScheduledPayments(): Promise<ScheduledPayment[]> {
  try {
    const db = await getDb();
    if (!db) {
      console.warn("[Database] Cannot get failed payments: database not available");
      return [];
    }
    
    const result = await db
      .select()
      .from(scheduledPayments)
      .where(eq(scheduledPayments.status, "failed"))
      .orderBy(desc(scheduledPayments.scheduledDate));
    
    return result;
  } catch (error) {
    console.error("[Database] Error getting failed payments:", error);
    return [];
  }
}

/**
 * Get scheduled payments for a specific plan
 */
export async function getScheduledPaymentsForPlan(planId: number): Promise<ScheduledPayment[]> {
  try {
    const db = await getDb();
    if (!db) {
      console.warn("[Database] Cannot get scheduled payments: database not available");
      return [];
    }
    
    const result = await db
      .select()
      .from(scheduledPayments)
      .where(eq(scheduledPayments.flexiblePaymentPlanId, planId))
      .orderBy(scheduledPayments.scheduledDate);
    
    return result;
  } catch (error) {
    console.error("[Database] Error getting scheduled payments:", error);
    return [];
  }
}

/**
 * Get payment processing logs for a specific plan
 */
export async function getPaymentProcessingLogsForPlan(planId: number): Promise<InsertPaymentProcessingLog[]> {
  try {
    const db = await getDb();
    if (!db) {
      console.warn("[Database] Cannot get payment logs: database not available");
      return [];
    }
    
    const result = await db
      .select()
      .from(paymentProcessingLogs)
      .where(eq(paymentProcessingLogs.flexiblePaymentPlanId, planId))
      .orderBy(desc(paymentProcessingLogs.createdAt));
    
    return result;
  } catch (error) {
    console.error("[Database] Error getting payment logs:", error);
    return [];
  }
}

/**
 * Get admin dashboard statistics
 */
export async function getPaymentDashboardStats(): Promise<{
  totalPlans: number;
  activePlans: number;
  completedPlans: number;
  pausedPlans: number;
  failedPayments: number;
  totalCollected: number;
  totalScheduled: number;
}> {
  try {
    const db = await getDb();
    if (!db) {
      console.warn("[Database] Cannot get dashboard stats: database not available");
      return {
        totalPlans: 0,
        activePlans: 0,
        completedPlans: 0,
        pausedPlans: 0,
        failedPayments: 0,
        totalCollected: 0,
        totalScheduled: 0,
      };
    }

    const plans = await db.select().from(flexiblePaymentPlans);
    const failedPayments = await db
      .select()
      .from(scheduledPayments)
      .where(eq(scheduledPayments.status, "failed"));

    const activePlans = plans.filter(p => p.status === "active").length;
    const completedPlans = plans.filter(p => p.status === "completed").length;
    const pausedPlans = plans.filter(p => p.status === "paused").length;

    const totalCollected = plans.reduce((sum, p) => sum + (p.totalAmount - p.remainingBalance), 0);
    const totalScheduled = plans.reduce((sum, p) => sum + p.remainingBalance, 0);

    return {
      totalPlans: plans.length,
      activePlans,
      completedPlans,
      pausedPlans,
      failedPayments: failedPayments.length,
      totalCollected,
      totalScheduled,
    };
  } catch (error) {
    console.error("[Database] Error getting dashboard stats:", error);
    return {
      totalPlans: 0,
      activePlans: 0,
      completedPlans: 0,
      pausedPlans: 0,
      failedPayments: 0,
      totalCollected: 0,
      totalScheduled: 0,
    };
  }
}

/**
 * Update scheduled payment to retry
 */
export async function retryScheduledPayment(paymentId: number): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) {
      console.warn("[Database] Cannot retry payment: database not available");
      return false;
    }

    const payment = await db
      .select()
      .from(scheduledPayments)
      .where(eq(scheduledPayments.id, paymentId))
      .limit(1);

    if (!payment[0]) {
      console.warn(`[Database] Payment ${paymentId} not found`);
      return false;
    }

    // Reset to pending if retries haven't been exceeded
    if (payment[0].retryCount < payment[0].maxRetries) {
      await db
        .update(scheduledPayments)
        .set({
          status: "pending",
          failureReason: null,
          lastRetryAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(scheduledPayments.id, paymentId));

      return true;
    } else {
      console.warn(`[Database] Payment ${paymentId} exceeded max retries`);
      return false;
    }
  } catch (error) {
    console.error("[Database] Error retrying payment:", error);
    return false;
  }
}

/**
 * Cancel a flexible payment plan
 */
export async function cancelFlexiblePaymentPlan(planId: number, reason: string): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) {
      console.warn("[Database] Cannot cancel plan: database not available");
      return false;
    }

    // Cancel the plan
    await db
      .update(flexiblePaymentPlans)
      .set({
        status: "cancelled",
        updatedAt: new Date(),
      })
      .where(eq(flexiblePaymentPlans.id, planId));

    // Cancel all pending payments for this plan
    await db
      .update(scheduledPayments)
      .set({
        status: "cancelled",
        failureReason: `Plan cancelled: ${reason}`,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(scheduledPayments.flexiblePaymentPlanId, planId),
          eq(scheduledPayments.status, "pending")
        )
      );

    return true;
  } catch (error) {
    console.error("[Database] Error cancelling plan:", error);
    return false;
  }
}


/**
 * Email Delivery Metrics Functions
 */
export async function trackEmailDeliveryMetric(data: InsertEmailDeliveryMetric): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) {
      console.warn("[Database] Cannot track email metric: database not available");
      return false;
    }
    await db.insert(emailDeliveryMetrics).values(data);
    return true;
  } catch (error) {
    console.error("[Database] Error tracking email metric:", error);
    return false;
  }
}

export async function getEmailDeliveryStats(): Promise<{
  totalSent: number;
  totalDelivered: number;
  totalBounced: number;
  totalOpened: number;
  totalClicked: number;
  totalConverted: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  conversionRate: number;
}> {
  try {
    const db = await getDb();
    if (!db) {
      console.warn("[Database] Cannot get email stats: database not available");
      return {
        totalSent: 0,
        totalDelivered: 0,
        totalBounced: 0,
        totalOpened: 0,
        totalClicked: 0,
        totalConverted: 0,
        deliveryRate: 0,
        openRate: 0,
        clickRate: 0,
        conversionRate: 0,
      };
    }

    const metrics = await db
      .select({
        sent: count(emailDeliveryMetrics.id),
        delivered: count(emailDeliveryMetrics.delivered),
        bounced: count(emailDeliveryMetrics.bounced),
        opened: count(emailDeliveryMetrics.opened),
        clicked: count(emailDeliveryMetrics.clicked),
        converted: count(emailDeliveryMetrics.converted),
      })
      .from(emailDeliveryMetrics);

    const totalSent = metrics[0]?.sent || 0;
    const totalDelivered = metrics[0]?.delivered || 0;
    const totalBounced = metrics[0]?.bounced || 0;
    const totalOpened = metrics[0]?.opened || 0;
    const totalClicked = metrics[0]?.clicked || 0;
    const totalConverted = metrics[0]?.converted || 0;

    return {
      totalSent,
      totalDelivered,
      totalBounced,
      totalOpened,
      totalClicked,
      totalConverted,
      deliveryRate: totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0,
      openRate: totalDelivered > 0 ? (totalOpened / totalDelivered) * 100 : 0,
      clickRate: totalOpened > 0 ? (totalClicked / totalOpened) * 100 : 0,
      conversionRate: totalClicked > 0 ? (totalConverted / totalClicked) * 100 : 0,
    };
  } catch (error) {
    console.error("[Database] Error getting email stats:", error);
    return {
      totalSent: 0,
      totalDelivered: 0,
      totalBounced: 0,
      totalOpened: 0,
      totalClicked: 0,
      totalConverted: 0,
      deliveryRate: 0,
      openRate: 0,
      clickRate: 0,
      conversionRate: 0,
    };
  }
}

export async function getEmailMetricsByType(emailType: string): Promise<any[]> {
  try {
    const db = await getDb();
    if (!db) {
      console.warn("[Database] Cannot get email metrics by type: database not available");
      return [];
    }

    return await db
      .select()
      .from(emailDeliveryMetrics)
      .where(eq(emailDeliveryMetrics.emailType, emailType));
  } catch (error) {
    console.error("[Database] Error getting email metrics by type:", error);
    return [];
  }
}

/**
 * Abandoned Cart Analytics Functions
 */
export async function trackAbandonedCart(data: InsertAbandonedCartAnalytic): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) {
      console.warn("[Database] Cannot track abandoned cart: database not available");
      return false;
    }
    await db.insert(abandonedCartAnalytics).values(data);
    return true;
  } catch (error) {
    console.error("[Database] Error tracking abandoned cart:", error);
    return false;
  }
}

export async function getAbandonedCartStats(): Promise<{
  totalAbandoned: number;
  totalRecovered: number;
  recoveryRate: number;
  totalCartValue: number;
  totalRecoveredValue: number;
  averageCartValue: number;
  averageRecoveryValue: number;
}> {
  try {
    const db = await getDb();
    if (!db) {
      console.warn("[Database] Cannot get abandoned cart stats: database not available");
      return {
        totalAbandoned: 0,
        totalRecovered: 0,
        recoveryRate: 0,
        totalCartValue: 0,
        totalRecoveredValue: 0,
        averageCartValue: 0,
        averageRecoveryValue: 0,
      };
    }

    const stats = await db
      .select({
        totalAbandoned: count(abandonedCartAnalytics.id),
        totalRecovered: count(abandonedCartAnalytics.recovered),
        totalCartValue: sum(abandonedCartAnalytics.cartValue),
        totalRecoveredValue: sum(abandonedCartAnalytics.conversionValue),
        averageCartValue: avg(abandonedCartAnalytics.cartValue),
        averageRecoveryValue: avg(abandonedCartAnalytics.conversionValue),
      })
      .from(abandonedCartAnalytics);

    const totalAbandoned = stats[0]?.totalAbandoned || 0;
    const totalRecovered = stats[0]?.totalRecovered || 0;

    return {
      totalAbandoned,
      totalRecovered,
      recoveryRate: totalAbandoned > 0 ? (totalRecovered / totalAbandoned) * 100 : 0,
      totalCartValue: parseFloat(stats[0]?.totalCartValue || "0"),
      totalRecoveredValue: parseFloat(stats[0]?.totalRecoveredValue || "0"),
      averageCartValue: parseFloat(stats[0]?.averageCartValue || "0"),
      averageRecoveryValue: parseFloat(stats[0]?.averageRecoveryValue || "0"),
    };
  } catch (error) {
    console.error("[Database] Error getting abandoned cart stats:", error);
    return {
      totalAbandoned: 0,
      totalRecovered: 0,
      recoveryRate: 0,
      totalCartValue: 0,
      totalRecoveredValue: 0,
      averageCartValue: 0,
      averageRecoveryValue: 0,
    };
  }
}

export async function getAllAbandonedCarts(): Promise<any[]> {
  try {
    const db = await getDb();
    if (!db) {
      console.warn("[Database] Cannot get abandoned carts: database not available");
      return [];
    }

    return await db
      .select()
      .from(abandonedCartAnalytics)
      .where(eq(abandonedCartAnalytics.recovered, false));
  } catch (error) {
    console.error("[Database] Error getting abandoned carts:", error);
    return [];
  }
}

export async function updateAbandonedCartConversion(cartId: number, conversionType: string, conversionValue: number): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) {
      console.warn("[Database] Cannot update cart conversion: database not available");
      return false;
    }

    await db
      .update(abandonedCartAnalytics)
      .set({
        recovered: true,
        convertedAt: new Date(),
        conversionType: conversionType as any,
        conversionValue: conversionValue.toString() as any,
        updatedAt: new Date(),
      })
      .where(eq(abandonedCartAnalytics.id, cartId));

    return true;
  } catch (error) {
    console.error("[Database] Error updating cart conversion:", error);
    return false;
  }
}


// Email Template Management Functions
export async function createEmailTemplate(data: InsertEmailTemplate) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(emailTemplates).values(data);
  return result[0].insertId;
}

export async function getEmailTemplateById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(emailTemplates).where(eq(emailTemplates.id, id)).limit(1);
  return result[0] ?? null;
}

export async function getEmailTemplatesByType(templateType: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(emailTemplates)
    .where(eq(emailTemplates.templateType, templateType as any))
    .orderBy(desc(emailTemplates.isDefault), desc(emailTemplates.createdAt));
}

export async function getDefaultEmailTemplate(templateType: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(emailTemplates)
    .where(and(
      eq(emailTemplates.templateType, templateType as any),
      eq(emailTemplates.isDefault, true),
      eq(emailTemplates.isActive, true)
    ))
    .limit(1);
  return result[0] ?? null;
}

export async function getAllEmailTemplates() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(emailTemplates).orderBy(desc(emailTemplates.createdAt));
}

export async function updateEmailTemplate(id: number, data: Partial<InsertEmailTemplate>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(emailTemplates).set(data).where(eq(emailTemplates.id, id));
}

export async function deleteEmailTemplate(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(emailTemplates).where(eq(emailTemplates.id, id));
}

export async function setDefaultEmailTemplate(id: number, templateType: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // First, unset all other defaults for this template type
  await db.update(emailTemplates)
    .set({ isDefault: false })
    .where(eq(emailTemplates.templateType, templateType as any));
  
  // Then set this one as default
  return db.update(emailTemplates)
    .set({ isDefault: true })
    .where(eq(emailTemplates.id, id));
}

export async function duplicateEmailTemplate(id: number, newName: string, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const original = await getEmailTemplateById(id);
  if (!original) throw new Error("Template not found");
  
  const newTemplate: InsertEmailTemplate = {
    templateType: original.templateType,
    templateName: newName,
    subject: original.subject,
    preheader: original.preheader,
    bodyHtml: original.bodyHtml,
    bodyText: original.bodyText,
    includeCustomerName: original.includeCustomerName,
    includeCartValue: original.includeCartValue,
    includeCartItems: original.includeCartItems,
    includeCountdown: original.includeCountdown,
    countdownHours: original.countdownHours,
    ctaText: original.ctaText,
    ctaButtonColor: original.ctaButtonColor,
    isActive: original.isActive,
    isDefault: false,
    createdBy: userId,
  };
  
  return createEmailTemplate(newTemplate);
}


// Daily Analytics
export async function getDailySubmissionAnalytics(days: number = 30) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);
  
  const result = await db.select({
    date: sql<string>`DATE(${searchSubmissions.createdAt})`,
    totalSubmissions: count(),
    paidSubmissions: sql<number>`COUNT(CASE WHEN ${searchSubmissions.status} = 'paid' THEN 1 END)`,
    completedSubmissions: sql<number>`COUNT(CASE WHEN ${searchSubmissions.status} = 'completed' THEN 1 END)`,
    pendingSubmissions: sql<number>`COUNT(CASE WHEN ${searchSubmissions.status} = 'pending' THEN 1 END)`,
  })
    .from(searchSubmissions)
    .where(gte(searchSubmissions.createdAt, startDate))
    .groupBy(sql`DATE(${searchSubmissions.createdAt})`)
    .orderBy(sql`DATE(${searchSubmissions.createdAt}) DESC`);
  
  return result;
}

export async function getDailyOrderAnalytics(days: number = 30) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);
  
  const result = await db.select({
    date: sql<string>`DATE(${orders.createdAt})`,
    totalOrders: count(),
    completedOrders: sql<number>`COUNT(CASE WHEN ${orders.paymentStatus} = 'completed' THEN 1 END)`,
    failedOrders: sql<number>`COUNT(CASE WHEN ${orders.paymentStatus} = 'failed' THEN 1 END)`,
    pendingOrders: sql<number>`COUNT(CASE WHEN ${orders.paymentStatus} = 'pending' THEN 1 END)`,
    totalRevenue: sql<string>`COALESCE(SUM(CASE WHEN ${orders.paymentStatus} = 'completed' THEN ${orders.amount} ELSE 0 END), 0)`,
    caseManagerCount: sql<number>`COUNT(CASE WHEN ${orders.paymentStatus} = 'completed' AND ${orders.includeCaseManager} = true THEN 1 END)`,
  })
    .from(orders)
    .where(gte(orders.createdAt, startDate))
    .groupBy(sql`DATE(${orders.createdAt})`)
    .orderBy(sql`DATE(${orders.createdAt}) DESC`);
  
  return result;
}


// Corporate Leasing Payment Plan Functions
export async function createCorporateLeasingPaymentPlan(data: InsertCorporateLeasingPaymentPlan) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(corporateLeasingPaymentPlans).values(data);
  return result[0].insertId;
}

export async function getCorporateLeasingPaymentPlan(planId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(corporateLeasingPaymentPlans).where(eq(corporateLeasingPaymentPlans.id, planId));
  return result[0] || null;
}

export async function getAllCorporateLeasingPaymentPlans(status?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  if (status) {
    return db.select().from(corporateLeasingPaymentPlans)
      .where(eq(corporateLeasingPaymentPlans.status, status as any))
      .orderBy(desc(corporateLeasingPaymentPlans.createdAt));
  }
  
  return db.select().from(corporateLeasingPaymentPlans)
    .orderBy(desc(corporateLeasingPaymentPlans.createdAt));
}

export async function updateCorporateLeasingPaymentPlan(planId: number, data: Partial<CorporateLeasingPaymentPlan>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(corporateLeasingPaymentPlans).set(data).where(eq(corporateLeasingPaymentPlans.id, planId));
  return true;
}

export async function cancelCorporateLeasingPaymentPlan(planId: number, reason: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(corporateLeasingPaymentPlans)
    .set({
      status: 'cancelled',
      cancelledAt: new Date(),
      cancelReason: reason,
    })
    .where(eq(corporateLeasingPaymentPlans.id, planId));
  
  return true;
}

// Corporate Leasing Installment Functions
export async function createCorporateLeasingInstallment(data: InsertCorporateLeasingInstallment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(corporateLeasingInstallments).values(data);
  return result[0].insertId;
}

export async function getCorporateLeasingInstallments(planId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.select()
    .from(corporateLeasingInstallments)
    .where(eq(corporateLeasingInstallments.paymentPlanId, planId))
    .orderBy(sql`${corporateLeasingInstallments.dueDate} ASC`);
}

export async function getPendingCorporateLeasingInstallments() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.select()
    .from(corporateLeasingInstallments)
    .where(and(
      eq(corporateLeasingInstallments.status, 'pending'),
      lte(corporateLeasingInstallments.dueDate, new Date())
    ))
    .orderBy(sql`${corporateLeasingInstallments.dueDate} ASC`);
}

export async function updateCorporateLeasingInstallment(installmentId: number, data: Partial<CorporateLeasingInstallment>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(corporateLeasingInstallments)
    .set(data)
    .where(eq(corporateLeasingInstallments.id, installmentId));
  
  return true;
}

export async function getCorporateLeasingDashboardStats() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const totalPlans = await db.select({ count: count() }).from(corporateLeasingPaymentPlans);
  const activePlans = await db.select({ count: count() }).from(corporateLeasingPaymentPlans).where(eq(corporateLeasingPaymentPlans.status, 'active'));
  const completedPlans = await db.select({ count: count() }).from(corporateLeasingPaymentPlans).where(eq(corporateLeasingPaymentPlans.status, 'completed'));
  
  const totalDownPayments = await db.select({
    total: sql<number>`COALESCE(SUM(${corporateLeasingPaymentPlans.downPaymentAmount}), 0)`
  }).from(corporateLeasingPaymentPlans).where(eq(corporateLeasingPaymentPlans.downPaymentStatus, 'completed'));
  
  const totalPropertySelectionPayments = await db.select({
    total: sql<number>`COALESCE(SUM(${corporateLeasingPaymentPlans.propertySelectionPaymentAmount}), 0)`
  }).from(corporateLeasingPaymentPlans).where(eq(corporateLeasingPaymentPlans.propertySelectionPaymentStatus, 'completed'));
  
  const totalInstallmentsCompleted = await db.select({
    total: sql<number>`COALESCE(SUM(${corporateLeasingInstallments.paymentAmount}), 0)`
  }).from(corporateLeasingInstallments).where(eq(corporateLeasingInstallments.status, 'completed'));
  
  return {
    totalPlans: totalPlans[0]?.count || 0,
    activePlans: activePlans[0]?.count || 0,
    completedPlans: completedPlans[0]?.count || 0,
    totalDownPayments: (totalDownPayments[0]?.total || 0) / 100,
    totalPropertySelectionPayments: (totalPropertySelectionPayments[0]?.total || 0) / 100,
    totalInstallmentsCompleted: (totalInstallmentsCompleted[0]?.total || 0) / 100,
  };
}
