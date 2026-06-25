import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean, json } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
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

/**
 * Rental properties table with landlord information and acceptance criteria
 */
export const rentalProperties = mysqlTable("rental_properties", {
  id: varchar("id", { length: 36 }).primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  address: varchar("address", { length: 255 }).notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  state: varchar("state", { length: 2 }).notNull(),
  zipCode: varchar("zip_code", { length: 10 }),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  propertyType: mysqlEnum("property_type", ["apartment", "house", "townhome", "condo", "mobile_home", "other"]).notNull(),
  bedrooms: int("bedrooms"),
  bathrooms: decimal("bathrooms", { precision: 3, scale: 1 }),
  rentPrice: int("rent_price").notNull(),
  petFriendly: boolean("pet_friendly").default(false),
  acceptsNoCredit: boolean("accepts_no_credit").default(true),
  acceptsEvictions: boolean("accepts_evictions").default(false),
  acceptsCriminalHistory: boolean("accepts_criminal_history").default(false),
  acceptsLowIncome: boolean("accepts_low_income").default(true),
  landlordName: varchar("landlord_name", { length: 255 }),
  landlordPhone: varchar("landlord_phone", { length: 255 }),
  landlordEmail: varchar("landlord_email", { length: 255 }),
  propertyManagerName: varchar("property_manager_name", { length: 255 }),
  propertyManagerPhone: varchar("property_manager_phone", { length: 255 }),
  propertyManagerEmail: varchar("property_manager_email", { length: 255 }),
  applicationFee: int("application_fee"),
  leaseTerms: varchar("lease_terms", { length: 255 }),
  moveInDate: timestamp("move_in_date"),
  images: json("images").$type<string[]>(),
  amenities: json("amenities").$type<string[]>(),
  approvalNotes: text("approval_notes"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
  createdByUserId: int("created_by_user_id"),
});

export type RentalProperty = typeof rentalProperties.$inferSelect;
export type InsertRentalProperty = typeof rentalProperties.$inferInsert;

/**
 * Property searches table for tracking user searches and analytics
 */
export const propertySearches = mysqlTable("property_searches", {
  id: varchar("id", { length: 36 }).primaryKey(),
  searchQuery: json("search_query").notNull(),
  resultsCount: int("results_count").default(0),
  userEmail: varchar("user_email", { length: 255 }),
  userName: varchar("user_name", { length: 255 }),
  userPhone: varchar("user_phone", { length: 20 }),
  creditChallenges: json("credit_challenges").$type<string[]>(),
  createdAt: timestamp("created_at").defaultNow(),
  convertedToDonation: boolean("converted_to_donation").default(false),
  paymentId: varchar("payment_id", { length: 36 }),
});

export type PropertySearch = typeof propertySearches.$inferSelect;
export type InsertPropertySearch = typeof propertySearches.$inferInsert;

/**
 * Payments table for tracking donations and access grants
 */
export const payments = mysqlTable("payments", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userEmail: varchar("user_email", { length: 255 }).notNull().unique(),
  userName: varchar("user_name", { length: 255 }),
  amountCents: int("amount_cents").notNull(),
  paymentMethod: varchar("payment_method", { length: 50 }).default("stripe"),
  stripeSessionId: varchar("stripe_session_id", { length: 255 }),
  stripePaymentIntentId: varchar("stripe_payment_intent_id", { length: 255 }),
  status: mysqlEnum("status", ["pending", "completed", "failed", "refunded"]).default("pending"),
  listAccessGrantedUntil: timestamp("list_access_granted_until"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;

/**
 * Property views table for tracking user interactions
 */
export const propertyViews = mysqlTable("property_views", {
  id: varchar("id", { length: 36 }).primaryKey(),
  propertyId: varchar("property_id", { length: 36 }).notNull(),
  userEmail: varchar("user_email", { length: 255 }),
  viewedAt: timestamp("viewed_at").defaultNow(),
  contactRequested: boolean("contact_requested").default(false),
});

export type PropertyView = typeof propertyViews.$inferSelect;
export type InsertPropertyView = typeof propertyViews.$inferInsert;

/**
 * Email logs table for tracking sent emails
 */
export const emailLogs = mysqlTable("email_logs", {
  id: varchar("id", { length: 36 }).primaryKey(),
  recipientEmail: varchar("recipient_email", { length: 255 }).notNull(),
  emailType: varchar("email_type", { length: 50 }).notNull(),
  status: mysqlEnum("status", ["sent", "failed", "bounced"]).default("sent"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type EmailLog = typeof emailLogs.$inferSelect;
export type InsertEmailLog = typeof emailLogs.$inferInsert;
