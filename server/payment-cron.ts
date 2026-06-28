/**
 * Payment Processing Cron Job
 * Scheduled to run every hour to process pending payments
 */

import { processScheduledPayments } from "./payment-processor";
import { sendPaymentReminders } from "./payment-reminder-job";

// Track if a job is currently running to prevent concurrent executions
let isProcessing = false;
let isRemindersRunning = false;

/**
 * Initialize the payment processing cron job
 * Runs every hour at the top of the hour
 */
export function initializePaymentProcessingCron(): void {
  console.log("[PaymentCron] Initializing payment processing cron job");

  // Run immediately on startup (after a short delay)
  setTimeout(() => {
    runPaymentProcessing();
  }, 5000);

  // Schedule to run every hour
  setInterval(() => {
    runPaymentProcessing();
  }, 60 * 60 * 1000); // 1 hour

  // Also run every 15 minutes for more frequent processing
  setInterval(() => {
    runPaymentProcessing();
  }, 15 * 60 * 1000); // 15 minutes

  // Run payment reminders every 6 hours
  setTimeout(() => {
    runPaymentReminders();
  }, 10000);

  setInterval(() => {
    runPaymentReminders();
  }, 6 * 60 * 60 * 1000);
}

/**
 * Run the payment processing job
 */
async function runPaymentProcessing(): Promise<void> {
  // Prevent concurrent executions
  if (isProcessing) {
    console.log("[PaymentCron] Payment processing already in progress, skipping this run");
    return;
  }

  isProcessing = true;

  try {
    console.log(`[PaymentCron] Starting scheduled payment processing at ${new Date().toISOString()}`);

    const result = await processScheduledPayments();

    console.log(`[PaymentCron] Payment processing completed:`, {
      success: result.success,
      processed: result.processedCount,
      failed: result.failedCount,
      errors: result.errors,
      timestamp: new Date().toISOString(),
    });

    // Log any errors
    if (result.errors.length > 0) {
      console.warn("[PaymentCron] Errors during processing:", result.errors);
    }
  } catch (error) {
    console.error("[PaymentCron] Fatal error during payment processing:", error);
  } finally {
    isProcessing = false;
  }
}

/**
 * Manually trigger payment processing (for testing or manual intervention)
 */
export async function triggerPaymentProcessing(): Promise<void> {
  if (isProcessing) {
    throw new Error("Payment processing is already in progress");
  }

  await runPaymentProcessing();
}

/**
 * Get current processing status
 */
export function getPaymentProcessingStatus(): { isProcessing: boolean; timestamp: string } {
  return {
    isProcessing,
    timestamp: new Date().toISOString(),
  };
}


/**
 * Run the payment reminder job
 */
async function runPaymentReminders(): Promise<void> {
  // Prevent concurrent executions
  if (isRemindersRunning) {
    console.log("[PaymentCron] Payment reminders already in progress, skipping this run");
    return;
  }

  isRemindersRunning = true;

  try {
    console.log(`[PaymentCron] Starting payment reminders at ${new Date().toISOString()}`);
    await sendPaymentReminders();
    console.log(`[PaymentCron] Payment reminders completed at ${new Date().toISOString()}`);
  } catch (error) {
    console.error("[PaymentCron] Error sending payment reminders:", error);
  } finally {
    isRemindersRunning = false;
  }
}
