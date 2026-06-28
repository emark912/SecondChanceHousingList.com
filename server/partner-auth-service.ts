/**
 * Partner Authentication Service
 * Handles partner signup, login, password management, and session management
 */

import crypto from "crypto";
import { getDb } from "./db";
import { partnerPrograms } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";

const HASH_ALGORITHM = "sha256";
const SALT_LENGTH = 32;
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Hash password with salt
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(SALT_LENGTH).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, salt, 100000, 64, "sha512")
    .toString("hex");
  return `${salt}:${hash}`;
}

/**
 * Verify password against hash
 */
export function verifyPassword(password: string, hash: string): boolean {
  const [salt, storedHash] = hash.split(":");
  if (!salt || !storedHash) return false;

  const computedHash = crypto
    .pbkdf2Sync(password, salt, 100000, 64, "sha512")
    .toString("hex");
  return computedHash === storedHash;
}

/**
 * Generate secure session token
 */
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Create partner account with password
 */
export async function createPartnerAccount(
  partnerName: string,
  businessName: string,
  email: string,
  password: string,
  verificationCode: string
): Promise<{ success: boolean; partnerId?: number; error?: string }> {
  try {
    const db = await getDb();
    if (!db) {
      return { success: false, error: "Database connection failed" };
    }

    // Check if email already exists
    const existingPartner = await db
      .select()
      .from(partnerPrograms)
      .where(eq(partnerPrograms.email, email))
      .limit(1);

    if (existingPartner.length > 0) {
      return { success: false, error: "Email already registered" };
    }

    // Hash password
    const passwordHash = hashPassword(password);

    // Create partner account
    const result = await db.insert(partnerPrograms).values({
      partnerName,
      businessName,
      email,
      passwordHash,
      verificationCode,
      isVerified: 0,
      status: "pending_verification",
      trialLeadsRemaining: 20,
      hasUsedTrial: 0,
      loginAttempts: 0,
    });

    const partnerId = (result as any).insertId || 0;

    console.log(
      `[Partner Auth] Account created for ${email} with ID ${partnerId}`
    );

    return { success: true, partnerId };
  } catch (error) {
    console.error("[Partner Auth] Error creating account:", error);
    return { success: false, error: "Failed to create account" };
  }
}

/**
 * Authenticate partner with email and password
 */
export async function authenticatePartner(
  email: string,
  password: string
): Promise<{ success: boolean; partnerId?: number; error?: string }> {
  try {
    const db = await getDb();
    if (!db) {
      return { success: false, error: "Database connection failed" };
    }

    // Find partner by email
    const partners = await db
      .select()
      .from(partnerPrograms)
      .where(eq(partnerPrograms.email, email))
      .limit(1);

    if (partners.length === 0) {
      return { success: false, error: "Invalid email or password" };
    }

    const partner = partners[0];

    // Check if account is locked
    if (partner.lockedUntil && new Date(partner.lockedUntil) > new Date()) {
      return {
        success: false,
        error: "Account is temporarily locked. Please try again later.",
      };
    }

    // Check if verified
    if (!partner.isVerified) {
      return { success: false, error: "Email not verified" };
    }

    // Check if active
    if (partner.status !== "active") {
      return {
        success: false,
        error: `Account is ${partner.status}. Please contact support.`,
      };
    }

    // Verify password
    if (!partner.passwordHash || !verifyPassword(password, partner.passwordHash)) {
      // Increment login attempts
      const newAttempts = (partner.loginAttempts || 0) + 1;
      let lockUntil = null;

      if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
        lockUntil = new Date(Date.now() + LOCK_DURATION_MS);
      }

      await db
        .update(partnerPrograms)
        .set({
          loginAttempts: newAttempts,
          lockedUntil: lockUntil,
        })
        .where(eq(partnerPrograms.id, partner.id));

      return { success: false, error: "Invalid email or password" };
    }

    // Reset login attempts and update last login
    await db
      .update(partnerPrograms)
      .set({
        loginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
      })
      .where(eq(partnerPrograms.id, partner.id));

    console.log(`[Partner Auth] Partner ${email} authenticated successfully`);

    return { success: true, partnerId: partner.id };
  } catch (error) {
    console.error("[Partner Auth] Error authenticating partner:", error);
    return { success: false, error: "Authentication failed" };
  }
}

/**
 * Verify partner email with code
 */
export async function verifyPartnerEmail(
  email: string,
  verificationCode: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const db = await getDb();
    if (!db) {
      return { success: false, error: "Database connection failed" };
    }

    // Find partner by email
    const partners = await db
      .select()
      .from(partnerPrograms)
      .where(eq(partnerPrograms.email, email))
      .limit(1);

    if (partners.length === 0) {
      return { success: false, error: "Partner not found" };
    }

    const partner = partners[0];

    // Check verification code
    if (partner.verificationCode !== verificationCode) {
      return { success: false, error: "Invalid verification code" };
    }

    // Mark as verified and activate account
    await db
      .update(partnerPrograms)
      .set({
        isVerified: 1,
        verifiedAt: new Date(),
        status: "active",
        trialStartedAt: new Date(),
        trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      })
      .where(eq(partnerPrograms.id, partner.id));

    console.log(`[Partner Auth] Email verified for ${email}`);

    return { success: true };
  } catch (error) {
    console.error("[Partner Auth] Error verifying email:", error);
    return { success: false, error: "Verification failed" };
  }
}

/**
 * Change partner password
 */
export async function changePartnerPassword(
  partnerId: number,
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const db = await getDb();
    if (!db) {
      return { success: false, error: "Database connection failed" };
    }

    // Get partner
    const partners = await db
      .select()
      .from(partnerPrograms)
      .where(eq(partnerPrograms.id, partnerId))
      .limit(1);

    if (partners.length === 0) {
      return { success: false, error: "Partner not found" };
    }

    const partner = partners[0];

    // Verify current password
    if (!partner.passwordHash || !verifyPassword(currentPassword, partner.passwordHash)) {
      return { success: false, error: "Current password is incorrect" };
    }

    // Hash new password
    const newPasswordHash = hashPassword(newPassword);

    // Update password
    await db
      .update(partnerPrograms)
      .set({ passwordHash: newPasswordHash })
      .where(eq(partnerPrograms.id, partnerId));

    console.log(`[Partner Auth] Password changed for partner ${partnerId}`);

    return { success: true };
  } catch (error) {
    console.error("[Partner Auth] Error changing password:", error);
    return { success: false, error: "Failed to change password" };
  }
}

/**
 * Reset partner password (admin or forgot password flow)
 */
export async function resetPartnerPassword(
  email: string,
  resetToken: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const db = await getDb();
    if (!db) {
      return { success: false, error: "Database connection failed" };
    }

    // Find partner by email
    const partners = await db
      .select()
      .from(partnerPrograms)
      .where(eq(partnerPrograms.email, email))
      .limit(1);

    if (partners.length === 0) {
      return { success: false, error: "Partner not found" };
    }

    // TODO: Validate reset token (should be stored in a separate table with expiration)
    // For now, this is a placeholder

    // Hash new password
    const passwordHash = hashPassword(newPassword);

    // Update password and reset login attempts
    await db
      .update(partnerPrograms)
      .set({
        passwordHash,
        loginAttempts: 0,
        lockedUntil: null,
      })
      .where(eq(partnerPrograms.email, email));

    console.log(`[Partner Auth] Password reset for ${email}`);

    return { success: true };
  } catch (error) {
    console.error("[Partner Auth] Error resetting password:", error);
    return { success: false, error: "Failed to reset password" };
  }
}

/**
 * Get partner by ID
 */
export async function getPartnerById(
  partnerId: number
): Promise<(typeof partnerPrograms.$inferSelect) | null> {
  try {
    const db = await getDb();
    if (!db) return null;

    const partners = await db
      .select()
      .from(partnerPrograms)
      .where(eq(partnerPrograms.id, partnerId))
      .limit(1);

    return partners.length > 0 ? partners[0] : null;
  } catch (error) {
    console.error("[Partner Auth] Error getting partner:", error);
    return null;
  }
}

/**
 * Update partner profile
 */
export async function updatePartnerProfile(
  partnerId: number,
  updates: {
    partnerName?: string;
    businessName?: string;
    businessPhone?: string;
    businessAddress?: string;
    businessCity?: string;
    businessState?: string;
    businessZip?: string;
    billingEmail?: string;
    billingName?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const db = await getDb();
    if (!db) {
      return { success: false, error: "Database connection failed" };
    }

    await db
      .update(partnerPrograms)
      .set(updates)
      .where(eq(partnerPrograms.id, partnerId));

    console.log(`[Partner Auth] Profile updated for partner ${partnerId}`);

    return { success: true };
  } catch (error) {
    console.error("[Partner Auth] Error updating profile:", error);
    return { success: false, error: "Failed to update profile" };
  }
}
