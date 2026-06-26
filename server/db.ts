import { eq, and, gte, lte, like, inArray, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, rentalProperties, propertySearches, payments, propertyViews, emailLogs } from "../drizzle/schema";
import { ENV } from './_core/env';
import { nanoid } from "nanoid";

const generateId = () => nanoid();

let _db: ReturnType<typeof drizzle> | null = null;

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

// Rental Properties Queries

export async function searchProperties(filters: {
  city: string;
  state: string;
  bedrooms?: number;
  maxRent?: number;
  petFriendly?: boolean;
  acceptsNoCredit?: boolean;
  acceptsEvictions?: boolean;
  acceptsCriminalHistory?: boolean;
  acceptsLowIncome?: boolean;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  let conditions = [
    eq(rentalProperties.city, filters.city),
    eq(rentalProperties.state, filters.state),
    eq(rentalProperties.isActive, true)
  ];

  if (filters.bedrooms) {
    conditions.push(eq(rentalProperties.bedrooms, filters.bedrooms));
  }

  if (filters.maxRent) {
    conditions.push(lte(rentalProperties.rentPrice, filters.maxRent));
  }

  if (filters.petFriendly) {
    conditions.push(eq(rentalProperties.petFriendly, true));
  }

  if (filters.acceptsNoCredit) {
    conditions.push(eq(rentalProperties.acceptsNoCredit, true));
  }

  if (filters.acceptsEvictions) {
    conditions.push(eq(rentalProperties.acceptsEvictions, true));
  }

  if (filters.acceptsCriminalHistory) {
    conditions.push(eq(rentalProperties.acceptsCriminalHistory, true));
  }

  if (filters.acceptsLowIncome) {
    conditions.push(eq(rentalProperties.acceptsLowIncome, true));
  }

  return db.select().from(rentalProperties).where(and(...conditions));
}

export async function getPropertyById(id: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.select().from(rentalProperties).where(eq(rentalProperties.id, id)).limit(1);
  return result[0] || null;
}

export async function addProperty(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.insert(rentalProperties).values({
    id: generateId(),
    ...data,
  });
}

export async function updateProperty(id: string, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.update(rentalProperties).set(data).where(eq(rentalProperties.id, id));
}

export async function getAllProperties() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.select().from(rentalProperties).where(eq(rentalProperties.isActive, true));
}

// Property Searches

export async function saveSearch(searchData: {
  searchQuery: any;
  resultsCount: number;
  userEmail?: string;
  userName?: string;
  userPhone?: string;
  creditChallenges?: string[];
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.insert(propertySearches).values({
    id: generateId(),
    ...searchData,
  });
}

export async function getSearches() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.select().from(propertySearches).orderBy(desc(propertySearches.createdAt));
}

// Payments & Donations

export async function saveDonation(donationData: {
  userEmail: string;
  userName?: string;
  amountCents: number;
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.insert(payments).values({
    id: generateId(),
    status: 'pending',
    paymentMethod: 'stripe',
    ...donationData,
  });
}

export async function updateDonationStatus(donationId: string, status: 'completed' | 'failed' | 'refunded') {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.update(payments).set({ status }).where(eq(payments.id, donationId));
}

export async function grantListAccess(donationId: string, expiresIn: number = 36500) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + expiresIn);
  
  return db.update(payments).set({
    status: 'completed',
    listAccessGrantedUntil: expiryDate,
  }).where(eq(payments.id, donationId));
}

export async function hasListAccess(userEmail: string): Promise<boolean> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const donation = await db.select().from(payments).where(
    and(
      eq(payments.userEmail, userEmail),
      eq(payments.status, 'completed'),
      gte(payments.listAccessGrantedUntil, new Date())
    )
  ).limit(1);

  return donation.length > 0;
}

export async function getDonationByEmail(userEmail: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.select().from(payments).where(eq(payments.userEmail, userEmail)).limit(1);
  return result[0] || null;
}

export async function getDonationBySessionId(sessionId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.select().from(payments).where(eq(payments.stripeSessionId, sessionId)).limit(1);
  return result[0] || null;
}

export async function getAllDonations() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.select().from(payments).orderBy(desc(payments.createdAt));
}

// Property Views

export async function recordPropertyView(propertyId: string, userEmail?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.insert(propertyViews).values({
    id: generateId(),
    propertyId,
    userEmail,
  });
}

// Email Logs

export async function logEmail(recipientEmail: string, emailType: string, status: 'sent' | 'failed' | 'bounced' = 'sent') {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.insert(emailLogs).values({
    id: generateId(),
    recipientEmail,
    emailType,
    status,
  });
}

// Analytics

export async function getAnalytics() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const totalSearches = await db.select().from(propertySearches);
  const completedDonations = await db.select().from(payments).where(eq(payments.status, 'completed'));
  const totalProperties = await db.select().from(rentalProperties).where(eq(rentalProperties.isActive, true));

  const totalRevenue = completedDonations.reduce((sum, p) => sum + (p.amountCents || 0), 0) / 100;
  const avgDonation = completedDonations.length > 0 ? totalRevenue / completedDonations.length : 0;
  const conversionRate = totalSearches.length > 0 
    ? ((completedDonations.length / totalSearches.length) * 100)
    : 0;

  return {
    totalSearches: totalSearches.length,
    totalDonations: completedDonations.length,
    totalRevenue: parseFloat(totalRevenue.toFixed(2)),
    averageDonation: parseFloat(avgDonation.toFixed(2)),
    conversionRate: parseFloat(conversionRate.toFixed(2)),
    totalProperties: totalProperties.length,
  };
}
