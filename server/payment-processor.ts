/**
 * Payment Processor - Handles automated scheduled payment processing
 * Runs as a cron job to process pending payments on their scheduled dates
 */

import Stripe from "stripe";
import {
  getPendingScheduledPayments,
  updateScheduledPaymentStatus,
  getFlexiblePaymentPlan,
  logPaymentProcessing,
  updateFlexiblePaymentPlanStatus,
} from "./db";
import { sendEmail } from "./email-service";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2026-01-28.clover" as any,
});

export interface PaymentProcessingResult {
  success: boolean;
  processedCount: number;
  failedCount: number;
  errors: string[];
}

/**
 * Process all pending scheduled payments that are due
 */
export async function processScheduledPayments(): Promise<PaymentProcessingResult> {
  const result: PaymentProcessingResult = {
    success: true,
    processedCount: 0,
    failedCount: 0,
    errors: [],
  };

  try {
    console.log("[PaymentProcessor] Starting scheduled payment processing...");

    // Get all pending payments due for processing (up to now)
    const now = new Date();
    const pendingPayments = await getPendingScheduledPayments(now);

    if (pendingPayments.length === 0) {
      console.log("[PaymentProcessor] No pending payments to process");
      return result;
    }

    console.log(`[PaymentProcessor] Found ${pendingPayments.length} pending payments to process`);

    // Process each payment
    for (const payment of pendingPayments) {
      try {
        await processIndividualPayment(payment);
        result.processedCount++;
      } catch (error) {
        result.failedCount++;
        const errorMsg = error instanceof Error ? error.message : String(error);
        result.errors.push(`Payment ${payment.id}: ${errorMsg}`);
        console.error(`[PaymentProcessor] Error processing payment ${payment.id}:`, error);
      }
    }

    console.log(
      `[PaymentProcessor] Processing complete. Processed: ${result.processedCount}, Failed: ${result.failedCount}`
    );

    return result;
  } catch (error) {
    result.success = false;
    const errorMsg = error instanceof Error ? error.message : String(error);
    result.errors.push(`Fatal error: ${errorMsg}`);
    console.error("[PaymentProcessor] Fatal error:", error);
    return result;
  }
}

/**
 * Process an individual scheduled payment
 */
async function processIndividualPayment(payment: any): Promise<void> {
  const { id: paymentId, flexiblePaymentPlanId, customerEmail, paymentAmount, retryCount, maxRetries } = payment;

  console.log(`[PaymentProcessor] Processing payment ${paymentId} for ${customerEmail} (${paymentAmount / 100} USD)`);

  // Check if max retries exceeded
  if (retryCount >= maxRetries) {
    console.warn(`[PaymentProcessor] Payment ${paymentId} exceeded max retries (${maxRetries})`);
    await updateScheduledPaymentStatus(paymentId, "failed", {
      failureReason: `Exceeded maximum retry attempts (${maxRetries})`,
    });
    return;
  }

  // Get the flexible payment plan
  const plan = await getFlexiblePaymentPlan(flexiblePaymentPlanId);
  if (!plan) {
    throw new Error(`Flexible payment plan ${flexiblePaymentPlanId} not found`);
  }

  // Log processing attempt
  await logPaymentProcessing({
    scheduledPaymentId: paymentId,
    flexiblePaymentPlanId,
    customerEmail,
    paymentAmount,
    status: "initiated",
    retryAttempt: retryCount + 1,
  });

  // Update status to processing
  await updateScheduledPaymentStatus(paymentId, "processing");

  try {
    // Create a payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: paymentAmount,
      currency: "usd",
      customer: plan.stripeCustomerId || undefined,
      payment_method: plan.stripePaymentMethodId || undefined,
      off_session: true, // This is an off-session payment (recurring)
      confirm: true, // Automatically confirm the payment
      metadata: {
        flexiblePaymentPlanId: flexiblePaymentPlanId.toString(),
        scheduledPaymentId: paymentId.toString(),
        customerEmail,
        paymentType: "scheduled_flexible_payment",
      },
    });

    if (paymentIntent.status === "succeeded") {
      console.log(`[PaymentProcessor] Payment ${paymentId} succeeded. Intent: ${paymentIntent.id}`);

      // Update payment status to completed
      await updateScheduledPaymentStatus(paymentId, "completed", {
        stripePaymentIntentId: paymentIntent.id,
        processedAt: new Date(),
      });

      // Log success
      await logPaymentProcessing({
        scheduledPaymentId: paymentId,
        flexiblePaymentPlanId,
        customerEmail,
        paymentAmount,
        status: "succeeded",
        stripeEventId: paymentIntent.id,
        retryAttempt: retryCount + 1,
      });

      // Send confirmation email
      try {
        await sendEmail({
          to: customerEmail,
          subject: `Payment Received - Flexible Payment Plan`,
          html: `
            <h2>Payment Received</h2>
            <p>Your scheduled payment of $${(paymentAmount / 100).toFixed(2)} has been successfully processed.</p>
            <p><strong>Payment Details:</strong></p>
            <ul>
              <li>Amount: $${(paymentAmount / 100).toFixed(2)}</li>
              <li>Date: ${new Date().toLocaleDateString()}</li>
              <li>Transaction ID: ${paymentIntent.id}</li>
            </ul>
            <p>Thank you for your payment. Your next scheduled payment will be processed on the date specified in your payment plan.</p>
          `,
        });
      } catch (emailError) {
        console.warn(`[PaymentProcessor] Failed to send email for payment ${paymentId}:`, emailError);
      }

      // Check if all payments are completed
      const allPayments = plan.paymentSchedule as Array<{ date: string; amount: number }>;
      const totalScheduled = allPayments.reduce((sum, p) => sum + p.amount, 0) + plan.downPaymentAmount;
      if (totalScheduled === plan.totalAmount) {
        // All payments completed
        await updateFlexiblePaymentPlanStatus(flexiblePaymentPlanId, "completed");
        console.log(`[PaymentProcessor] All payments completed for plan ${flexiblePaymentPlanId}`);
      }
    } else if (paymentIntent.status === "requires_action" || paymentIntent.status === "requires_payment_method") {
      console.warn(`[PaymentProcessor] Payment ${paymentId} requires additional action. Status: ${paymentIntent.status}`);

      // Update status to failed and increment retry count
      await updateScheduledPaymentStatus(paymentId, "failed", {
        failureReason: `Payment requires additional action: ${paymentIntent.status}`,
        retryCount: retryCount + 1,
        lastRetryAt: new Date(),
      });

      // Log failure
      await logPaymentProcessing({
        scheduledPaymentId: paymentId,
        flexiblePaymentPlanId,
        customerEmail,
        paymentAmount,
        status: "failed",
        errorMessage: `Payment requires additional action: ${paymentIntent.status}`,
        retryAttempt: retryCount + 1,
      });
    } else {
      console.warn(`[PaymentProcessor] Payment ${paymentId} has unexpected status: ${paymentIntent.status}`);

      // Update status to failed
      await updateScheduledPaymentStatus(paymentId, "failed", {
        failureReason: `Unexpected payment status: ${paymentIntent.status}`,
        retryCount: retryCount + 1,
        lastRetryAt: new Date(),
      });

      // Log failure
      await logPaymentProcessing({
        scheduledPaymentId: paymentId,
        flexiblePaymentPlanId,
        customerEmail,
        paymentAmount,
        status: "failed",
        errorMessage: `Unexpected payment status: ${paymentIntent.status}`,
        retryAttempt: retryCount + 1,
      });
    }
  } catch (stripeError) {
    console.error(`[PaymentProcessor] Stripe error for payment ${paymentId}:`, stripeError);

    const errorMessage = stripeError instanceof Error ? stripeError.message : String(stripeError);

    // Determine if this is a retryable error
    const isRetryable = isRetryableError(stripeError);

    if (isRetryable && retryCount < maxRetries - 1) {
      // Update status to failed but allow retry
      await updateScheduledPaymentStatus(paymentId, "failed", {
        failureReason: errorMessage,
        retryCount: retryCount + 1,
        lastRetryAt: new Date(),
      });

      console.log(`[PaymentProcessor] Payment ${paymentId} will be retried (attempt ${retryCount + 2}/${maxRetries})`);
    } else {
      // Permanent failure
      await updateScheduledPaymentStatus(paymentId, "failed", {
        failureReason: errorMessage,
        retryCount: retryCount + 1,
      });

      console.warn(`[PaymentProcessor] Payment ${paymentId} permanently failed: ${errorMessage}`);
    }

    // Log failure
    await logPaymentProcessing({
      scheduledPaymentId: paymentId,
      flexiblePaymentPlanId,
      customerEmail,
      paymentAmount,
      status: "failed",
      errorMessage,
      retryAttempt: retryCount + 1,
    });

    throw new Error(errorMessage);
  }
}

/**
 * Determine if an error is retryable
 */
function isRetryableError(error: unknown): boolean {
  if (!error) return false;
  const retryableCodes = ["rate_limit", "api_connection_error", "api_error", "authentication_error", "timeout", "card_error"];
  const errorType = (error as any).type || "api_error";
  return retryableCodes.includes(errorType);
}

/**
 * Get payment processing statistics
 */
export async function getPaymentProcessingStats(): Promise<{
  pending: number;
  processing: number;
  completed: number;
  failed: number;
}> {
  try {
    const pending = await getPendingScheduledPayments(new Date());

    return {
      pending: pending.length,
      processing: 0, // Would need additional query
      completed: 0, // Would need additional query
      failed: 0, // Would need additional query
    };
  } catch (error) {
    console.error("[PaymentProcessor] Error getting stats:", error);
    return { pending: 0, processing: 0, completed: 0, failed: 0 };
  }
}
