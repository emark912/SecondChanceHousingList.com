/**
 * Payment Reminder Job - Sends payment reminders before scheduled payment dates
 * Runs as a cron job to send reminders 7, 3, and 1 day before each payment
 */

import { sendEmail } from "./email-service";
import { getDb } from "./db";
import { scheduledPayments } from "../drizzle/schema";
import { eq, and, gte, lte } from "drizzle-orm";

export async function sendPaymentReminders() {
  try {
    console.log("[PaymentReminder] Starting payment reminder job...");

    const db = await getDb();
    if (!db) {
      console.warn("[PaymentReminder] Database not available");
      return;
    }

    // Define reminder windows (in days)
    const reminderWindows = [
      { days: 7, label: "7_days_before" },
      { days: 3, label: "3_days_before" },
      { days: 1, label: "1_day_before" },
    ];

    for (const window of reminderWindows) {
      try {
        // Get payments that are due in this window
        const targetDate = new Date(Date.now() + window.days * 24 * 60 * 60 * 1000);
        const windowStart = new Date(targetDate.getTime() - 12 * 60 * 60 * 1000); // 12 hours before
        const windowEnd = new Date(targetDate.getTime() + 12 * 60 * 60 * 1000); // 12 hours after

        const paymentsInWindow = await db
          .select()
          .from(scheduledPayments)
          .where(
            and(
              gte(scheduledPayments.scheduledDate, windowStart),
              lte(scheduledPayments.scheduledDate, windowEnd),
              eq(scheduledPayments.status, "pending")
            )
          );

        console.log(
          `[PaymentReminder] Found ${paymentsInWindow.length} payments due in ${window.days} days`
        );

        for (const payment of paymentsInWindow) {
          try {
            // Check if reminder was already sent
            const reminderKey = `payment_reminder_${window.label}`;
            // For now, we'll send all reminders (can add tracking later)

            // Send reminder email
            const subject = `Payment Reminder: Your ${window.days}-Day Payment is Due Soon`;
            const html = `
              <h2>Payment Reminder</h2>
              <p>Hi,</p>
              <p>This is a friendly reminder that your next scheduled payment of <strong>$${(payment.paymentAmount / 100).toFixed(2)}</strong> is due in <strong>${window.days} day${window.days > 1 ? "s" : ""}</strong>.</p>
              <p><strong>Payment Details:</strong></p>
              <ul>
                <li>Amount: $${(payment.paymentAmount / 100).toFixed(2)}</li>
                <li>Due Date: ${new Date(payment.scheduledDate).toLocaleDateString()}</li>
                <li>Payment ID: ${payment.id}</li>
              </ul>
              <p>Your payment will be automatically processed on the scheduled date using your saved payment method.</p>
              <p>If you have any questions or need to update your payment information, please contact us.</p>
              <p>Thank you!</p>
            `;

            const success = await sendEmail({
              to: payment.customerEmail,
              subject: subject,
              html: html,
            });

            if (success) {
              console.log(
                `[PaymentReminder] Sent ${window.label} reminder to ${payment.customerEmail} for payment ${payment.id}`
              );
            } else {
              console.warn(
                `[PaymentReminder] Failed to send ${window.label} reminder to ${payment.customerEmail}`
              );
            }
          } catch (error) {
            console.error(
              `[PaymentReminder] Error sending reminder for payment ${payment.id}:`,
              error
            );
          }
        }
      } catch (error) {
        console.error(
          `[PaymentReminder] Error processing ${window.days}-day reminders:`,
          error
        );
      }
    }

    console.log("[PaymentReminder] Payment reminder job completed");
  } catch (error) {
    console.error("[PaymentReminder] Fatal error:", error);
  }
}
