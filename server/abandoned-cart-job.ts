import { getDb } from "./db";
import { abandonedCarts, searchSubmissions, discountCodes } from "../drizzle/schema";
import { sendAbandonedCartEmail } from "./email-service";
import { eq, and, lt } from "drizzle-orm";
import { randomBytes } from "crypto";

/**
 * Generate a unique resume token for abandoned cart recovery
 */
function generateResumeToken(): string {
  return randomBytes(32).toString("hex");
}

/**
 * Generate a unique discount code
 */
function generateDiscountCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "SAVE";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Check for abandoned carts (30 minutes without checkout) and send recovery emails
 */
export async function processAbandonedCarts(): Promise<void> {
  try {
    console.log("[AbandonedCart] Starting abandoned cart recovery job");

    const db = await getDb();
    if (!db) {
      console.error("[AbandonedCart] Database not available");
      return;
    }

    // Find search submissions that haven't been paid for 30 minutes
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

    const abandonedSubmissions = await db
      .select({
        id: searchSubmissions.id,
        customerName: searchSubmissions.customerName,
        customerEmail: searchSubmissions.customerEmail,
        city: searchSubmissions.city,
        state: searchSubmissions.state,
        createdAt: searchSubmissions.createdAt,
      })
      .from(searchSubmissions)
      .where(
        and(
          eq(searchSubmissions.status, "pending"),
          lt(searchSubmissions.createdAt, thirtyMinutesAgo)
        )
      );

    console.log(
      `[AbandonedCart] Found ${abandonedSubmissions.length} abandoned submissions`
    );

    for (const submission of abandonedSubmissions) {
      try {
        // Check if we already sent an email for this submission
        const existingCart = await db
          .select()
          .from(abandonedCarts)
          .where(eq(abandonedCarts.submissionId, submission.id));

        if (existingCart.length > 0) {
          console.log(
            `[AbandonedCart] Already processed submission ${submission.id}, skipping`
          );
          continue;
        }

        // Generate discount code (10% off)
        const discountCode = generateDiscountCode();
        const discountPercentage = 10;

        // Create discount code in database
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        await db.insert(discountCodes).values({
          code: discountCode,
          description: `Abandoned cart recovery for ${submission.customerEmail}`,
          discountType: "percentage",
          discountValue: discountPercentage.toString(),
          validFrom: new Date(),
          validUntil: expiresAt,
          isActive: 1,
        });

        // Generate resume token
        const resumeToken = generateResumeToken();

        // Calculate estimated rental matches (this would normally come from your AI search)
        const estimatedMatches = 100;

        // Create abandoned cart record
        await db.insert(abandonedCarts).values({
          submissionId: submission.id,
          customerName: submission.customerName,
          customerEmail: submission.customerEmail,
          location: `${submission.city}, ${submission.state}`,
          rentalMatches: estimatedMatches,
          resumeToken,
          discountCode,
          discountPercentage,
          status: "pending",
          expiresAt,
        });

        // Build resume link
        const resumeLink = `https://secondchance-3gdukdvh.manus.space/results?resume=${resumeToken}`;

        // Send abandoned cart recovery email
        const emailSent = await sendAbandonedCartEmail(
          submission.customerEmail,
          submission.customerName,
          `${submission.city}, ${submission.state}`,
          estimatedMatches,
          resumeLink,
          discountCode,
          discountPercentage
        );

        if (emailSent) {
          // Update abandoned cart status
          await db
            .update(abandonedCarts)
            .set({
              emailSentAt: new Date(),
              status: "email_sent",
            })
            .where(eq(abandonedCarts.resumeToken, resumeToken));

          console.log(
            `[AbandonedCart] Email sent to ${submission.customerEmail} with code ${discountCode}`
          );
        } else {
          console.error(
            `[AbandonedCart] Failed to send email to ${submission.customerEmail}`
          );
        }
      } catch (error) {
        console.error(
          `[AbandonedCart] Error processing submission ${submission.id}:`,
          error
        );
      }
    }

    console.log("[AbandonedCart] Abandoned cart recovery job completed");
  } catch (error) {
    console.error("[AbandonedCart] Error in abandoned cart job:", error);
  }
}

/**
 * Clean up expired abandoned carts (older than 24 hours)
 */
export async function cleanupExpiredAbandonedCarts(): Promise<void> {
  try {
    console.log("[AbandonedCart] Cleaning up expired abandoned carts");

    const db = await getDb();
    if (!db) {
      console.error("[AbandonedCart] Database not available");
      return;
    }

    const now = new Date();
    const expiredCarts = await db
      .select()
      .from(abandonedCarts)
      .where(
        and(
          lt(abandonedCarts.expiresAt, now),
          eq(abandonedCarts.status, "email_sent")
        )
      );

    for (const cart of expiredCarts) {
      await db
        .update(abandonedCarts)
        .set({ status: "expired" })
        .where(eq(abandonedCarts.id, cart.id));
    }

    console.log(
      `[AbandonedCart] Marked ${expiredCarts.length} carts as expired`
    );
  } catch (error) {
    console.error("[AbandonedCart] Error cleaning up expired carts:", error);
  }
}

/**
 * Resume abandoned cart by token
 */
export async function resumeAbandonedCart(
  resumeToken: string
): Promise<{ submissionId: number; discountCode: string } | null> {
  try {
    const db = await getDb();
    if (!db) {
      console.error("[AbandonedCart] Database not available");
      return null;
    }

    const cart = await db
      .select()
      .from(abandonedCarts)
      .where(eq(abandonedCarts.resumeToken, resumeToken));

    if (cart.length === 0) {
      console.log(`[AbandonedCart] Resume token not found: ${resumeToken}`);
      return null;
    }

    const abandonedCart = cart[0];

    // Check if token has expired
    if (abandonedCart.expiresAt < new Date()) {
      console.log(
        `[AbandonedCart] Resume token expired: ${resumeToken}`
      );
      return null;
    }

    // Mark as completed
    await db
      .update(abandonedCarts)
      .set({ status: "completed" })
      .where(eq(abandonedCarts.resumeToken, resumeToken));

    return {
      submissionId: abandonedCart.submissionId,
      discountCode: abandonedCart.discountCode || "",
    };
  } catch (error) {
    console.error("[AbandonedCart] Error resuming abandoned cart:", error);
    return null;
  }
}
