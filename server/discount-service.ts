import { getDb } from "./db";
import { discountCodes } from "../drizzle/schema";
import { eq, and, gt, lt } from "drizzle-orm";

export interface DiscountCodeInfo {
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  isValid: boolean;
  message: string;
}

/**
 * Validate a discount code
 */
export async function validateDiscountCode(
  code: string
): Promise<DiscountCodeInfo> {
  try {
    const db = await getDb();
    if (!db) {
      return {
        code,
        discountType: "percentage",
        discountValue: 0,
        isValid: false,
        message: "Database not available",
      };
    }

    const now = new Date();

    const result = await db
      .select()
      .from(discountCodes)
      .where(
        and(
          eq(discountCodes.code, code.toUpperCase()),
          eq(discountCodes.isActive, 1),
          gt(discountCodes.validUntil, now),
          lt(discountCodes.validFrom, now)
        )
      );

    if (result.length === 0) {
      return {
        code,
        discountType: "percentage",
        discountValue: 0,
        isValid: false,
        message: "Discount code not found or expired",
      };
    }

    const discountCode = result[0];

    // Check if max uses reached
    if (
      discountCode.maxUses &&
      discountCode.usedCount &&
      discountCode.usedCount >= discountCode.maxUses
    ) {
      return {
        code,
        discountType: discountCode.discountType as "percentage" | "fixed",
        discountValue: parseFloat(discountCode.discountValue.toString()),
        isValid: false,
        message: "Discount code has reached maximum uses",
      };
    }

    return {
      code,
      discountType: discountCode.discountType as "percentage" | "fixed",
      discountValue: parseFloat(discountCode.discountValue.toString()),
      isValid: true,
      message: "Discount code is valid",
    };
  } catch (error) {
    console.error("[DiscountService] Error validating discount code:", error);
    return {
      code,
      discountType: "percentage",
      discountValue: 0,
      isValid: false,
      message: "Error validating discount code",
    };
  }
}

/**
 * Apply discount to an amount
 */
export function applyDiscount(
  amount: number,
  discountType: "percentage" | "fixed",
  discountValue: number
): number {
  if (discountType === "percentage") {
    return Math.max(0, amount - (amount * discountValue) / 100);
  } else {
    return Math.max(0, amount - discountValue);
  }
}

/**
 * Calculate discount amount
 */
export function calculateDiscountAmount(
  amount: number,
  discountType: "percentage" | "fixed",
  discountValue: number
): number {
  if (discountType === "percentage") {
    return (amount * discountValue) / 100;
  } else {
    return Math.min(discountValue, amount);
  }
}

/**
 * Increment discount code usage
 */
export async function incrementDiscountCodeUsage(code: string): Promise<void> {
  try {
    const db = await getDb();
    if (!db) {
      console.error("[DiscountService] Database not available");
      return;
    }

    // Get current usage count
    const current = await db
      .select()
      .from(discountCodes)
      .where(eq(discountCodes.code, code.toUpperCase()));

    if (current.length > 0) {
      const newCount = (current[0].usedCount || 0) + 1;
      await db
        .update(discountCodes)
        .set({
          usedCount: newCount,
        })
        .where(eq(discountCodes.code, code.toUpperCase()));
    }

    console.log(`[DiscountService] Incremented usage for code: ${code}`);
  } catch (error) {
    console.error(
      "[DiscountService] Error incrementing discount code usage:",
      error
    );
  }
}

/**
 * Create a new discount code
 */
export async function createDiscountCode(
  code: string,
  discountType: "percentage" | "fixed",
  discountValue: number,
  validFrom: Date,
  validUntil: Date,
  description?: string,
  maxUses?: number
): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) {
      console.error("[DiscountService] Database not available");
      return false;
    }

    await db.insert(discountCodes).values({
      code: code.toUpperCase(),
      description,
      discountType,
      discountValue: discountValue.toString(),
      validFrom,
      validUntil,
      maxUses,
      isActive: 1,
    });

    console.log(`[DiscountService] Created discount code: ${code}`);
    return true;
  } catch (error) {
    console.error("[DiscountService] Error creating discount code:", error);
    return false;
  }
}

/**
 * Get discount code details
 */
export async function getDiscountCodeDetails(
  code: string
): Promise<DiscountCodeInfo> {
  return validateDiscountCode(code);
}
