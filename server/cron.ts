/**
 * Cron Jobs for Second Chance Housing List
 * - Lead expiration: runs every 6 hours
 */

import { sendPackageExpiredReminders } from "./lead-delivery-service";
import { resetDb } from "./db";

let cronInterval: ReturnType<typeof setInterval> | null = null;

/**
 * Wrapper that resets the cached DB connection before each cron run.
 * This prevents ECONNRESET errors caused by idle MySQL connections being
 * dropped by the server after long periods of inactivity.
 */
async function runLeadExpirationJob() {
  resetDb(); // force a fresh connection for each cron run
  try {
    await sendPackageExpiredReminders();
  } catch (err) {
    console.error("[Cron] Lead expiration job failed:", err);
  }
}

export function startCronJobs() {
  if (cronInterval) return; // already running

  // Run immediately on startup
  runLeadExpirationJob();

  // Then every 6 hours
  cronInterval = setInterval(runLeadExpirationJob, 6 * 60 * 60 * 1000);

  console.log("[Cron] Lead expiration job scheduled (every 6 hours)");
}

export function stopCronJobs() {
  if (cronInterval) {
    clearInterval(cronInterval);
    cronInterval = null;
  }
}
