import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, json, boolean } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const searchSubmissions = mysqlTable("search_submissions", {
  id: int("id").autoincrement().primaryKey(),
  customerName: varchar("customerName", { length: 255 }).notNull(),
  customerEmail: varchar("customerEmail", { length: 320 }).notNull(),
  customerPhone: varchar("customerPhone", { length: 20 }),
  city: varchar("city", { length: 255 }).notNull(),
  state: varchar("state", { length: 100 }).notNull(),
  searchRadiusMiles: int("searchRadiusMiles").notNull(),
  creditChallenges: json("creditChallenges").$type<string[]>().notNull(),
  housingType: varchar("housingType", { length: 100 }).notNull(),
  bedrooms: int("bedrooms").notNull(),
  occupants: int("occupants").notNull(),
  totalHouseholdIncome: varchar("totalHouseholdIncome", { length: 100 }).notNull(),
  monthlyTakeHomeIncome: varchar("monthlyTakeHomeIncome", { length: 100 }).notNull(),
  monthlyIncome: varchar("monthlyIncome", { length: 100 }),
  employmentDuration: varchar("employmentDuration", { length: 100 }).notNull(),
  needsMovingLoan: mysqlEnum("needsMovingLoan", ["yes", "no", "maybe"]).default("no").notNull(),
  additionalInfo: text("additionalInfo"),
  criminalHistory: varchar("criminalHistory", { length: 100 }),
  criminalHistoryDetails: text("criminalHistoryDetails"),
  isRegisteredSexOffender: varchar("isRegisteredSexOffender", { length: 100 }),
  evictions: varchar("evictions", { length: 100 }),
  petPreference: varchar("petPreference", { length: 100 }),
  smokingStatus: varchar("smokingStatus", { length: 100 }),
  personalCircumstances: text("personalCircumstances"),
  canPaySecurityDeposit: mysqlEnum("canPaySecurityDeposit", ["yes", "no", "unsure"]).default("unsure"),
  creditRating: mysqlEnum("creditRating", ["poor", "fair", "good", "very_good", "excellent"]),
  aiSummary: text("aiSummary"),
  status: mysqlEnum("status", ["pending", "completed", "paid"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SearchSubmission = typeof searchSubmissions.$inferSelect;
export type InsertSearchSubmission = typeof searchSubmissions.$inferInsert;

export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  submissionId: int("submissionId").notNull(),
  customerName: varchar("customerName", { length: 255 }).notNull(),
  customerEmail: varchar("customerEmail", { length: 320 }).notNull(),
  // Donation-based pricing
  donationAmount: decimal("donationAmount", { precision: 10, scale: 2 }).default("0"),
  // Case manager add-on
  includeCaseManager: boolean("includeCaseManager").default(false).notNull(),
  caseManagerPrice: decimal("caseManagerPrice", { precision: 10, scale: 2 }).default("0"),
  caseManagerOriginalPrice: decimal("caseManagerOriginalPrice", { precision: 10, scale: 2 }).default("350.00"),
  // Total amount (donation + case manager if selected)
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  originalPrice: decimal("originalPrice", { precision: 10, scale: 2 }).notNull(),
  paymentStatus: mysqlEnum("paymentStatus", ["pending", "completed", "refunded", "failed"]).default("pending").notNull(),
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }),
  stripeSessionId: varchar("stripeSessionId", { length: 255 }),
  pdfUrl: text("pdfUrl"),
  pdfFileKey: varchar("pdfFileKey", { length: 500 }),
  emailSent: int("emailSent").default(0).notNull(),
  // Payment plan tracking: 'full' = paid in full, 'plan_500' = $500 down + 2x$250, 'plan_250' = $250 down + 3x$250
  paymentPlan: mysqlEnum("paymentPlan", ["full", "plan_500", "plan_250"]).default("full").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

export const nationalResults = mysqlTable("national_results", {
  id: int("id").autoincrement().primaryKey(),
  companyName: varchar("companyName", { length: 255 }).notNull(),
  companyWebsite: varchar("companyWebsite", { length: 500 }),
  contactPerson: varchar("contactPerson", { length: 255 }),
  contactPhone: varchar("contactPhone", { length: 50 }),
  contactEmail: varchar("contactEmail", { length: 320 }),
  description: text("description"),
  category: mysqlEnum("category", ["program", "apartment", "landlord", "corporate", "realtor", "other"]).default("other").notNull(),
  isActive: int("isActive").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type NationalResult = typeof nationalResults.$inferSelect;
export type InsertNationalResult = typeof nationalResults.$inferInsert;

export const contactMessages = mysqlTable("contact_messages", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  subject: varchar("subject", { length: 500 }).notNull(),
  message: text("message").notNull(),
  isRead: int("isRead").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ContactMessage = typeof contactMessages.$inferSelect;
export type InsertContactMessage = typeof contactMessages.$inferInsert;

export const formSubmissions = mysqlTable("form_submissions", {
  id: int("id").autoincrement().primaryKey(),
  fullName: varchar("fullName", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  location: varchar("location", { length: 255 }).notNull(),
  creditChallenges: json("creditChallenges").$type<string[]>().notNull(),
  housingTypes: json("housingTypes").$type<string[]>().notNull(),
  bedrooms: int("bedrooms"),
  criminalHistory: varchar("criminalHistory", { length: 50 }),
  evictions: varchar("evictions", { length: 50 }),
  income: varchar("income", { length: 100 }),
  monthlyBudget: varchar("monthlyBudget", { length: 100 }),
  monthlyIncome: varchar("monthlyIncome", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type FormSubmission = typeof formSubmissions.$inferSelect;
export type InsertFormSubmission = typeof formSubmissions.$inferInsert;

export const emailTracking = mysqlTable("email_tracking", {
  id: int("id").autoincrement().primaryKey(),
  submissionId: int("submissionId").notNull(),
  emailType: mysqlEnum("emailType", ["abandoned_checkout_20min", "abandoned_checkout_3day", "payment_confirmation"]).notNull(),
  sentAt: timestamp("sentAt").defaultNow().notNull(),
  recipientEmail: varchar("recipientEmail", { length: 320 }).notNull(),
  status: mysqlEnum("status", ["sent", "failed", "bounced"]).default("sent").notNull(),
});

export type EmailTracking = typeof emailTracking.$inferSelect;
export type InsertEmailTracking = typeof emailTracking.$inferInsert;

export const secondChancePrograms = mysqlTable("second_chance_programs", {
  id: int("id").autoincrement().primaryKey(),
  programName: varchar("programName", { length: 255 }).notNull(),
  website: varchar("website", { length: 500 }),
  contactPerson: varchar("contactPerson", { length: 255 }),
  contactPhone: varchar("contactPhone", { length: 50 }),
  contactEmail: varchar("contactEmail", { length: 320 }),
  description: text("description"),
  category: mysqlEnum("category", ["program", "apartment", "landlord", "corporate", "government", "nonprofit", "other"]).default("program").notNull(),
  
  // Location targeting
  states: json("states").$type<string[]>().notNull().default([]),
  cities: json("cities").$type<string[]>(),
  nationwide: int("nationwide").default(0).notNull(),
  
  // Approval criteria
  acceptsNoCreditScore: int("acceptsNoCreditScore").default(0).notNull(),
  acceptsLowCredit: int("acceptsLowCredit").default(0).notNull(),
  acceptsEvictions: int("acceptsEvictions").default(0).notNull(),
  acceptsBankruptcy: int("acceptsBankruptcy").default(0).notNull(),
  acceptsCriminalHistory: int("acceptsCriminalHistory").default(0).notNull(),
  acceptsBrokenLeases: int("acceptsBrokenLeases").default(0).notNull(),
  
  // Additional info
  minIncome: varchar("minIncome", { length: 100 }),
  maxIncome: varchar("maxIncome", { length: 100 }),
  approvalRate: varchar("approvalRate", { length: 50 }),
  processingTime: varchar("processingTime", { length: 100 }),
  fees: text("fees"),
  
  // Status
  isActive: int("isActive").default(1).notNull(),
  isPremium: int("isPremium").default(0).notNull(),
  displayOrder: int("displayOrder").default(0).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SecondChanceProgram = typeof secondChancePrograms.$inferSelect;
export type InsertSecondChanceProgram = typeof secondChancePrograms.$inferInsert;

export const savedSearches = mysqlTable("saved_searches", {
  id: int("id").autoincrement().primaryKey(),
  submissionId: int("submissionId").notNull().references(() => searchSubmissions.id),
  customerEmail: varchar("customerEmail", { length: 320 }).notNull(),
  paymentToken: varchar("paymentToken", { length: 255 }).notNull().unique(),
  originalPrice: int("originalPrice").notNull(), // in cents
  discountedPrice: int("discountedPrice").notNull(), // in cents (today's price)
  fullPrice: int("fullPrice").notNull(), // in cents (price if paid later)
  status: mysqlEnum("status", ["saved", "paid", "expired"]).default("saved").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  paidAt: timestamp("paidAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SavedSearch = typeof savedSearches.$inferSelect;
export type InsertSavedSearch = typeof savedSearches.$inferInsert;

export const abandonedCarts = mysqlTable("abandoned_carts", {
  id: int("id").autoincrement().primaryKey(),
  submissionId: int("submissionId").notNull().references(() => searchSubmissions.id),
  customerName: varchar("customerName", { length: 255 }).notNull(),
  customerEmail: varchar("customerEmail", { length: 320 }).notNull(),
  location: varchar("location", { length: 255 }).notNull(),
  rentalMatches: int("rentalMatches").notNull(), // Number of matches found
  emailSentAt: timestamp("emailSentAt"),
  emailOpenedAt: timestamp("emailOpenedAt"),
  resumeToken: varchar("resumeToken", { length: 255 }).notNull().unique(),
  discountCode: varchar("discountCode", { length: 50 }),
  discountPercentage: int("discountPercentage").default(0),
  status: mysqlEnum("status", ["pending", "email_sent", "completed", "expired"]).default("pending").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AbandonedCart = typeof abandonedCarts.$inferSelect;
export type InsertAbandonedCart = typeof abandonedCarts.$inferInsert;

export const discountCodes = mysqlTable("discount_codes", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  description: varchar("description", { length: 255 }),
  discountType: mysqlEnum("discountType", ["percentage", "fixed"]).notNull(),
  discountValue: decimal("discountValue", { precision: 10, scale: 2 }).notNull(),
  maxUses: int("maxUses"),
  usedCount: int("usedCount").default(0),
  validFrom: timestamp("validFrom").notNull(),
  validUntil: timestamp("validUntil").notNull(),
  isActive: int("isActive").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DiscountCode = typeof discountCodes.$inferSelect;
export type InsertDiscountCode = typeof discountCodes.$inferInsert;

export const paymentReminders = mysqlTable("payment_reminders", {
  id: int("id").autoincrement().primaryKey(),
  savedSearchId: int("savedSearchId").notNull().references(() => savedSearches.id),
  customerEmail: varchar("customerEmail", { length: 320 }).notNull(),
  reminderNumber: int("reminderNumber").notNull(), // 1, 2, or 3
  scheduledFor: timestamp("scheduledFor").notNull(),
  sentAt: timestamp("sentAt"),
  status: mysqlEnum("status", ["pending", "sent", "failed"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PaymentReminder = typeof paymentReminders.$inferSelect;
export type InsertPaymentReminder = typeof paymentReminders.$inferInsert;

export const gmailConfig = mysqlTable("gmail_config", {
  id: int("id").autoincrement().primaryKey(),
  ownerEmail: varchar("ownerEmail", { length: 320 }).notNull().unique(),
  refreshToken: text("refreshToken").notNull(),
  accessToken: text("accessToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  isActive: int("isActive").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type GmailConfig = typeof gmailConfig.$inferSelect;
export type InsertGmailConfig = typeof gmailConfig.$inferInsert;


export const emailLogs = mysqlTable("email_logs", {
  id: int("id").autoincrement().primaryKey(),
  recipientEmail: varchar("recipientEmail", { length: 320 }).notNull(),
  recipientName: varchar("recipientName", { length: 255 }),
  submissionId: int("submissionId").references(() => searchSubmissions.id),
  savedSearchId: int("savedSearchId").references(() => savedSearches.id),
  emailType: mysqlEnum("emailType", ["pdf_delivery", "payment_reminder_1", "payment_reminder_2", "payment_reminder_3", "order_confirmation", "other"]).notNull(),
  subject: varchar("subject", { length: 255 }).notNull(),
  body: text("body"),
  status: mysqlEnum("status", ["sent", "failed", "bounced", "opened", "clicked"]).default("sent").notNull(),
  sentAt: timestamp("sentAt").defaultNow().notNull(),
  openedAt: timestamp("openedAt"),
  failureReason: text("failureReason"),
  retryCount: int("retryCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type EmailLog = typeof emailLogs.$inferSelect;
export type InsertEmailLog = typeof emailLogs.$inferInsert;


export const emailTrackingOpens = mysqlTable("email_tracking_opens", {
  id: int("id").autoincrement().primaryKey(),
  emailLogId: int("emailLogId").notNull().references(() => emailLogs.id),
  trackingPixelId: varchar("trackingPixelId", { length: 255 }).notNull().unique(),
  openedAt: timestamp("openedAt").defaultNow().notNull(),
  userAgent: text("userAgent"),
  ipAddress: varchar("ipAddress", { length: 45 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type EmailTrackingOpen = typeof emailTrackingOpens.$inferSelect;
export type InsertEmailTrackingOpen = typeof emailTrackingOpens.$inferInsert;

export const emailTrackingClicks = mysqlTable("email_tracking_clicks", {
  id: int("id").autoincrement().primaryKey(),
  emailLogId: int("emailLogId").notNull().references(() => emailLogs.id),
  clickTrackingId: varchar("clickTrackingId", { length: 255 }).notNull(),
  linkUrl: text("linkUrl").notNull(),
  clickedAt: timestamp("clickedAt").defaultNow().notNull(),
  userAgent: text("userAgent"),
  ipAddress: varchar("ipAddress", { length: 45 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type EmailTrackingClick = typeof emailTrackingClicks.$inferSelect;
export type InsertEmailTrackingClick = typeof emailTrackingClicks.$inferInsert;


// Traffic Analytics Tables
export const pageViews = mysqlTable("page_views", {
  id: int("id").autoincrement().primaryKey(),
  pagePath: varchar("pagePath", { length: 500 }).notNull(),
  pageTitle: varchar("pageTitle", { length: 255 }).notNull(),
  referrer: text("referrer"),
  userAgent: text("userAgent"),
  ipAddress: varchar("ipAddress", { length: 45 }),
  deviceType: varchar("deviceType", { length: 50 }),
  sessionId: varchar("sessionId", { length: 255 }),
  viewedAt: timestamp("viewedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PageView = typeof pageViews.$inferSelect;
export type InsertPageView = typeof pageViews.$inferInsert;

export const trafficEvents = mysqlTable("traffic_events", {
  id: int("id").autoincrement().primaryKey(),
  eventType: varchar("eventType", { length: 100 }).notNull(),
  eventName: varchar("eventName", { length: 255 }).notNull(),
  pagePath: varchar("pagePath", { length: 500 }).notNull(),
  sessionId: varchar("sessionId", { length: 255 }),
  ipAddress: varchar("ipAddress", { length: 45 }),
  eventData: json("eventData").$type<Record<string, unknown>>(),
  occurredAt: timestamp("occurredAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TrafficEvent = typeof trafficEvents.$inferSelect;
export type InsertTrafficEvent = typeof trafficEvents.$inferInsert;


// Flexible Payment Plans
export const flexiblePaymentPlans = mysqlTable("flexible_payment_plans", {
  id: int("id").autoincrement().primaryKey(),
  customerEmail: varchar("customerEmail", { length: 320 }).notNull(),
  customerName: varchar("customerName", { length: 255 }).notNull(),
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  stripePaymentMethodId: varchar("stripePaymentMethodId", { length: 255 }),
  downPaymentAmount: int("downPaymentAmount").notNull(), // in cents
  totalAmount: int("totalAmount").notNull(), // in cents
  remainingBalance: int("remainingBalance").notNull(), // in cents
  paymentFrequency: mysqlEnum("paymentFrequency", ["weekly", "biweekly", "monthly"]).notNull(),
  paymentSchedule: json("paymentSchedule").$type<Array<{ date: string; amount: number }>>().notNull(),
  downPaymentStatus: mysqlEnum("downPaymentStatus", ["pending", "completed", "failed"]).default("pending").notNull(),
  downPaymentStripeSessionId: varchar("downPaymentStripeSessionId", { length: 255 }),
  downPaymentIntentId: varchar("downPaymentIntentId", { length: 255 }),
  searchData: json("searchData").$type<Record<string, unknown>>(),
  status: mysqlEnum("status", ["active", "paused", "completed", "cancelled"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FlexiblePaymentPlan = typeof flexiblePaymentPlans.$inferSelect;
export type InsertFlexiblePaymentPlan = typeof flexiblePaymentPlans.$inferInsert;

// Scheduled Payments for Flexible Plans
export const scheduledPayments = mysqlTable("scheduled_payments", {
  id: int("id").autoincrement().primaryKey(),
  flexiblePaymentPlanId: int("flexiblePaymentPlanId").notNull().references(() => flexiblePaymentPlans.id),
  customerEmail: varchar("customerEmail", { length: 320 }).notNull(),
  paymentAmount: int("paymentAmount").notNull(), // in cents
  scheduledDate: timestamp("scheduledDate").notNull(),
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }),
  status: mysqlEnum("status", ["pending", "processing", "completed", "failed", "cancelled"]).default("pending").notNull(),
  failureReason: text("failureReason"),
  retryCount: int("retryCount").default(0).notNull(),
  maxRetries: int("maxRetries").default(3).notNull(),
  lastRetryAt: timestamp("lastRetryAt"),
  processedAt: timestamp("processedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ScheduledPayment = typeof scheduledPayments.$inferSelect;
export type InsertScheduledPayment = typeof scheduledPayments.$inferInsert;

// Payment Processing Logs
export const paymentProcessingLogs = mysqlTable("payment_processing_logs", {
  id: int("id").autoincrement().primaryKey(),
  scheduledPaymentId: int("scheduledPaymentId").notNull().references(() => scheduledPayments.id),
  flexiblePaymentPlanId: int("flexiblePaymentPlanId").notNull().references(() => flexiblePaymentPlans.id),
  customerEmail: varchar("customerEmail", { length: 320 }).notNull(),
  paymentAmount: int("paymentAmount").notNull(), // in cents
  status: mysqlEnum("status", ["initiated", "processing", "succeeded", "failed"]).notNull(),
  stripeEventId: varchar("stripeEventId", { length: 255 }),
  errorMessage: text("errorMessage"),
  retryAttempt: int("retryAttempt").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PaymentProcessingLog = typeof paymentProcessingLogs.$inferSelect;
export type InsertPaymentProcessingLog = typeof paymentProcessingLogs.$inferInsert;


// Email Delivery Metrics Table
export const emailDeliveryMetrics = mysqlTable("email_delivery_metrics", {
  id: int("id").autoincrement().primaryKey(),
  emailTrackingId: int("emailTrackingId").notNull().references(() => emailTracking.id),
  submissionId: int("submissionId").notNull().references(() => formSubmissions.id),
  emailType: varchar("emailType", { length: 100 }).notNull(),
  sent: boolean("sent").default(true).notNull(),
  delivered: boolean("delivered").default(false),
  bounced: boolean("bounced").default(false),
  opened: boolean("opened").default(false),
  clicked: boolean("clicked").default(false),
  converted: boolean("converted").default(false),
  sentAt: timestamp("sentAt").defaultNow().notNull(),
  deliveredAt: timestamp("deliveredAt"),
  openedAt: timestamp("openedAt"),
  clickedAt: timestamp("clickedAt"),
  convertedAt: timestamp("convertedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
});

export type EmailDeliveryMetric = typeof emailDeliveryMetrics.$inferSelect;
export type InsertEmailDeliveryMetric = typeof emailDeliveryMetrics.$inferInsert;

// Abandoned Cart Recovery Analytics Table
export const abandonedCartAnalytics = mysqlTable("abandoned_cart_analytics", {
  id: int("id").autoincrement().primaryKey(),
  submissionId: int("submissionId").notNull().references(() => formSubmissions.id),
  customerEmail: varchar("customerEmail", { length: 320 }).notNull(),
  customerName: varchar("customerName", { length: 255 }).notNull(),
  cartValue: decimal("cartValue", { precision: 10, scale: 2 }).notNull(),
  abandonedAt: timestamp("abandonedAt").defaultNow().notNull(),
  
  // First reminder (20 minutes)
  firstReminderSentAt: timestamp("firstReminderSentAt"),
  firstReminderOpenedAt: timestamp("firstReminderOpenedAt"),
  firstReminderClickedAt: timestamp("firstReminderClickedAt"),
  
  // Second reminder (3 days)
  secondReminderSentAt: timestamp("secondReminderSentAt"),
  secondReminderOpenedAt: timestamp("secondReminderOpenedAt"),
  secondReminderClickedAt: timestamp("secondReminderClickedAt"),
  
  // Conversion tracking
  convertedAt: timestamp("convertedAt"),
  conversionValue: decimal("conversionValue", { precision: 10, scale: 2 }),
  conversionType: mysqlEnum("conversionType", ["full_payment", "flexible_payment", "none"]).default("none").notNull(),
  
  // Recovery metrics
  recoveryAttempts: int("recoveryAttempts").default(0).notNull(),
  recovered: boolean("recovered").default(false).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
});

export type AbandonedCartAnalytic = typeof abandonedCartAnalytics.$inferSelect;
export type InsertAbandonedCartAnalytic = typeof abandonedCartAnalytics.$inferInsert;


// Email Template Customization Table
export const emailTemplates = mysqlTable("email_templates", {
  id: int("id").autoincrement().primaryKey(),
  templateType: varchar("templateType", { length: 100 }).notNull().unique(),
  audience: mysqlEnum("audience", ["customer", "lead", "partner"]).notNull().default("customer"),
  templateName: varchar("templateName", { length: 255 }).notNull(),
  description: text("description"),
  subject: varchar("subject", { length: 255 }).notNull(),
  preheader: varchar("preheader", { length: 255 }),
  bodyHtml: text("bodyHtml").notNull(),
  bodyText: text("bodyText"),
  
  // Template variables for personalization
  includeCustomerName: boolean("includeCustomerName").default(true).notNull(),
  includeCartValue: boolean("includeCartValue").default(true).notNull(),
  includeCartItems: boolean("includeCartItems").default(false).notNull(),
  includeCountdown: boolean("includeCountdown").default(false).notNull(),
  countdownHours: int("countdownHours").default(24),
  
  // CTA customization
  ctaText: varchar("ctaText", { length: 100 }).default("Complete Your Order").notNull(),
  ctaButtonColor: varchar("ctaButtonColor", { length: 7 }).default("#3b82f6").notNull(),
  
  // Template settings
  isActive: boolean("isActive").default(true).notNull(),
  isDefault: boolean("isDefault").default(false).notNull(),
  
  // Metadata
  createdBy: int("createdBy").notNull().references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
});

export type EmailTemplate = typeof emailTemplates.$inferSelect;
export type InsertEmailTemplate = typeof emailTemplates.$inferInsert;


// Corporate Leasing Program Payment Plan
// Payment structure: $500 down, $150 after property selection, $500 monthly installments
export const corporateLeasingPaymentPlans = mysqlTable("corporate_leasing_payment_plans", {
  id: int("id").autoincrement().primaryKey(),
  submissionId: int("submissionId").notNull().references(() => formSubmissions.id),
  customerEmail: varchar("customerEmail", { length: 320 }).notNull(),
  customerName: varchar("customerName", { length: 255 }).notNull(),
  
  // Down payment ($500)
  downPaymentAmount: int("downPaymentAmount").notNull(), // 50000 cents = $500
  downPaymentStatus: mysqlEnum("downPaymentStatus", ["pending", "completed", "failed"]).default("pending").notNull(),
  downPaymentStripeSessionId: varchar("downPaymentStripeSessionId", { length: 255 }),
  downPaymentIntentId: varchar("downPaymentIntentId", { length: 255 }),
  downPaymentCompletedAt: timestamp("downPaymentCompletedAt"),
  
  // Property selection payment ($150)
  propertySelectionPaymentAmount: int("propertySelectionPaymentAmount").notNull(), // 15000 cents = $150
  propertySelectionPaymentStatus: mysqlEnum("propertySelectionPaymentStatus", ["pending", "completed", "failed"]).default("pending").notNull(),
  propertySelectionPaymentIntentId: varchar("propertySelectionPaymentIntentId", { length: 255 }),
  propertySelectionPaymentCompletedAt: timestamp("propertySelectionPaymentCompletedAt"),
  
  // Monthly installments ($500 total, can be split)
  monthlyInstallmentAmount: int("monthlyInstallmentAmount").notNull(), // 50000 cents = $500
  monthlyInstallmentFrequency: mysqlEnum("monthlyInstallmentFrequency", ["monthly", "biweekly", "weekly"]).default("monthly").notNull(),
  monthlyInstallmentCount: int("monthlyInstallmentCount").default(1).notNull(), // How many monthly payments
  monthlyInstallmentsCompleted: int("monthlyInstallmentsCompleted").default(0).notNull(),
  
  // Stripe customer setup for recurring payments
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  stripePaymentMethodId: varchar("stripePaymentMethodId", { length: 255 }),
  
  // PDF and email tracking
  pdfUrl: text("pdfUrl"),
  pdfFileKey: varchar("pdfFileKey", { length: 500 }),
  pdfSentAt: timestamp("pdfSentAt"),
  monthlySetupEmailSentAt: timestamp("monthlySetupEmailSentAt"),
  
  // Status tracking
  status: mysqlEnum("status", ["active", "paused", "completed", "cancelled"]).default("active").notNull(),
  cancelledAt: timestamp("cancelledAt"),
  cancelReason: text("cancelReason"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CorporateLeasingPaymentPlan = typeof corporateLeasingPaymentPlans.$inferSelect;
export type InsertCorporateLeasingPaymentPlan = typeof corporateLeasingPaymentPlans.$inferInsert;

// Corporate Leasing Monthly Installment Schedule
export const corporateLeasingInstallments = mysqlTable("corporate_leasing_installments", {
  id: int("id").autoincrement().primaryKey(),
  paymentPlanId: int("paymentPlanId").notNull().references(() => corporateLeasingPaymentPlans.id),
  customerEmail: varchar("customerEmail", { length: 320 }).notNull(),
  
  // Payment details
  installmentNumber: int("installmentNumber").notNull(), // 1st, 2nd, 3rd monthly payment
  paymentAmount: int("paymentAmount").notNull(), // in cents
  dueDate: timestamp("dueDate").notNull(),
  
  // Payment status
  status: mysqlEnum("status", ["pending", "processing", "completed", "failed", "cancelled"]).default("pending").notNull(),
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }),
  
  // Retry logic
  failureReason: text("failureReason"),
  retryCount: int("retryCount").default(0).notNull(),
  maxRetries: int("maxRetries").default(3).notNull(),
  lastRetryAt: timestamp("lastRetryAt"),
  
  // Completion tracking
  completedAt: timestamp("completedAt"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CorporateLeasingInstallment = typeof corporateLeasingInstallments.$inferSelect;
export type InsertCorporateLeasingInstallment = typeof corporateLeasingInstallments.$inferInsert;



// ===== PARTNERSHIP PROGRAM TABLES =====

export const partnerPrograms = mysqlTable("partner_programs", {
  id: int("id").autoincrement().primaryKey(),
  partnerName: varchar("partnerName", { length: 255 }).notNull(),
  businessName: varchar("businessName", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  verificationCode: varchar("verificationCode", { length: 10 }),
  isVerified: int("isVerified").default(0).notNull(),
  verifiedAt: timestamp("verifiedAt"),
  
  // Trial period tracking
  trialLeadsRemaining: int("trialLeadsRemaining").default(20).notNull(),
  trialStartedAt: timestamp("trialStartedAt"),
  trialEndsAt: timestamp("trialEndsAt"),
  hasUsedTrial: int("hasUsedTrial").default(0).notNull(),
  
  // Account status
  status: mysqlEnum("status", ["pending_verification", "active", "inactive", "suspended"]).default("pending_verification").notNull(),
  
  // Stripe customer ID for recurring billing
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  
  // Saved payment method for automatic charges
  stripePaymentMethodId: varchar("stripePaymentMethodId", { length: 255 }),
  
  // Trial activation — 1 once partner saves card and trial is unlocked
  trialActivated: int("trialActivated").default(0).notNull(),
  trialEnded: int("trialEnded").default(0).notNull(), // 1 when trial leads exhausted — partner still receives locked leads
  
  // Authentication
  passwordHash: varchar("passwordHash", { length: 255 }),
  lastLoginAt: timestamp("lastLoginAt"),
  loginAttempts: int("loginAttempts").default(0).notNull(),
  lockedUntil: timestamp("lockedUntil"),
  
  // Account settings
  businessPhone: varchar("businessPhone", { length: 20 }),
  businessAddress: text("businessAddress"),
  businessCity: varchar("businessCity", { length: 255 }),
  businessState: varchar("businessState", { length: 100 }),
  businessZip: varchar("businessZip", { length: 10 }),
  
  // Billing info
  billingEmail: varchar("billingEmail", { length: 320 }),
  billingName: varchar("billingName", { length: 255 }),
  
  // Admin notes
  adminNotes: text("adminNotes"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PartnerProgram = typeof partnerPrograms.$inferSelect;
export type InsertPartnerProgram = typeof partnerPrograms.$inferInsert;

export const leadPackages = mysqlTable("lead_packages", {
  id: int("id").autoincrement().primaryKey(),
  partnerId: int("partnerId").notNull().references(() => partnerPrograms.id),
  
  // Package details
  packageName: varchar("packageName", { length: 100 }).notNull(), // "10 Leads", "50 Leads", etc.
  leadCount: int("leadCount").notNull(), // 10, 50, 100, 200, 400, 800
  bonusLeads: int("bonusLeads").notNull().default(0), // 5 extra leads per package
  totalLeads: int("totalLeads").notNull(), // leadCount + bonusLeads
  
  // Pricing
  pricePerLead: decimal("pricePerLead", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("totalPrice", { precision: 10, scale: 2 }).notNull(),
  
  // Payment tracking
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }),
  paymentStatus: mysqlEnum("paymentStatus", ["pending", "completed", "failed", "refunded"]).default("pending").notNull(),
  paidAt: timestamp("paidAt"),
  
  // Lead delivery tracking
  leadsDelivered: int("leadsDelivered").default(0).notNull(),
  leadsRemaining: int("leadsRemaining").notNull(), // totalLeads - leadsDelivered
  
  // Package expiration
  expiresAt: timestamp("expiresAt"),
  isExpired: int("isExpired").default(0).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LeadPackage = typeof leadPackages.$inferSelect;
export type InsertLeadPackage = typeof leadPackages.$inferInsert;

export const deliveredLeads = mysqlTable("delivered_leads", {
  id: int("id").autoincrement().primaryKey(),
  leadPackageId: int("leadPackageId").notNull().references(() => leadPackages.id),
  partnerId: int("partnerId").notNull().references(() => partnerPrograms.id),
  submissionId: int("submissionId").notNull().references(() => searchSubmissions.id),
  
  // Lead position in package
  leadNumber: int("leadNumber").notNull(), // 1 of 50, 2 of 50, etc.
  
  // Lead data (stored for audit trail)
  customerName: varchar("customerName", { length: 255 }).notNull(),
  customerEmail: varchar("customerEmail", { length: 320 }).notNull(),
  customerPhone: varchar("customerPhone", { length: 20 }).notNull(),
  city: varchar("city", { length: 255 }).notNull(),
  state: varchar("state", { length: 100 }).notNull(),
  monthlyIncome: varchar("monthlyIncome", { length: 100 }),
  monthlyBudget: varchar("monthlyBudget", { length: 100 }),
  moveInTimeline: varchar("moveInTimeline", { length: 100 }),
  creditChallenges: json("creditChallenges").$type<string[]>(),
  housingType: varchar("housingType", { length: 100 }),
  bedrooms: int("bedrooms"),
  criminalHistory: text("criminalHistory"),
  
  // Email tracking
  emailSentAt: timestamp("emailSentAt").defaultNow().notNull(),
  emailOpenedAt: timestamp("emailOpenedAt"),
  buyButtonClickedAt: timestamp("buyButtonClickedAt"),
  
  status: mysqlEnum("status", ["sent", "opened", "clicked", "purchased"]).default("sent").notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DeliveredLead = typeof deliveredLeads.$inferSelect;
export type InsertDeliveredLead = typeof deliveredLeads.$inferInsert;

export const partnerEmailLogs = mysqlTable("partner_email_logs", {
  id: int("id").autoincrement().primaryKey(),
  partnerId: int("partnerId").notNull().references(() => partnerPrograms.id),
  
  emailType: mysqlEnum("emailType", [
    "signup_confirmation",
    "verification_code",
    "trial_started",
    "trial_lead",
    "lead_delivery",
    "package_purchased",
    "package_expired",
    "reminder_purchase_package",
    "account_status_change"
  ]).notNull(),
  
  recipientEmail: varchar("recipientEmail", { length: 320 }).notNull(),
  subject: varchar("subject", { length: 255 }).notNull(),
  body: text("body"),
  
  status: mysqlEnum("status", ["sent", "failed", "bounced"]).default("sent").notNull(),
  failureReason: text("failureReason"),
  
  sentAt: timestamp("sentAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PartnerEmailLog = typeof partnerEmailLogs.$inferSelect;
export type InsertPartnerEmailLog = typeof partnerEmailLogs.$inferInsert;

// Queue of leads sent to partners after their trial ends (contact info locked until they purchase a package)
export const lockedLeads = mysqlTable("locked_leads", {
  id: int("id").autoincrement().primaryKey(),
  partnerId: int("partnerId").notNull().references(() => partnerPrograms.id),
  submissionId: int("submissionId").notNull(),
  leadNumber: int("leadNumber").notNull(), // sequential number within this partner's locked queue
  leadData: json("leadData").$type<{
    city: string;
    state: string;
    housingType: string;
    bedrooms: number;
    monthlyIncome: string;
    creditChallenges: string[];
    criminalHistory?: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
  }>().notNull(),
  unlocked: int("unlocked").default(0).notNull(), // 1 after partner purchases a package and full info is sent
  unlockedAt: timestamp("unlockedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type LockedLead = typeof lockedLeads.$inferSelect;
export type InsertLockedLead = typeof lockedLeads.$inferInsert;
