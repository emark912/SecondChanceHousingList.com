import { getDb } from "./db";
import { orders } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { sendRentalResultsEmail } from "./email-service";
import { generateRentalResultsPDF } from "./pdf-service";
import { getSearchSubmissionById } from "./db";

interface RetryJob {
  orderId: number;
  submissionId: number;
  customerEmail: string;
  customerName: string;
  retryCount: number;
  lastRetryTime: Date;
  nextRetryTime: Date;
}

const retryQueue: Map<number, RetryJob> = new Map();
const MAX_RETRIES = 3;
const RETRY_DELAYS = [5 * 60 * 1000, 15 * 60 * 1000, 60 * 60 * 1000]; // 5 min, 15 min, 1 hour

/**
 * Add a failed email to the retry queue
 */
export function addToRetryQueue(
  orderId: number,
  submissionId: number,
  customerEmail: string,
  customerName: string
) {
  console.log(`[WebhookRetry] Adding order ${orderId} to retry queue`);

  const retryJob: RetryJob = {
    orderId,
    submissionId,
    customerEmail,
    customerName,
    retryCount: 0,
    lastRetryTime: new Date(),
    nextRetryTime: new Date(Date.now() + RETRY_DELAYS[0]),
  };

  retryQueue.set(orderId, retryJob);
}

/**
 * Process retry queue - called periodically
 */
export async function processRetryQueue() {
  try {
    console.log(`[WebhookRetry] Processing retry queue (${retryQueue.size} items)`);

    const now = new Date();
    const ordersToRetry: number[] = [];

    retryQueue.forEach((job, orderId) => {
      if (job.nextRetryTime <= now) {
        ordersToRetry.push(orderId);
      }
    });

    for (const orderId of ordersToRetry) {
      const job = retryQueue.get(orderId);
      if (!job) continue;

      try {
        console.log(`[WebhookRetry] Retrying order ${orderId} (attempt ${job.retryCount + 1}/${MAX_RETRIES})`);

        const db = await getDb();
        if (!db) {
          console.error("[WebhookRetry] Database connection failed");
          continue;
        }

        // Get submission data
        const submission = await getSearchSubmissionById(job.submissionId);
        if (!submission) {
          console.warn(`[WebhookRetry] Submission ${job.submissionId} not found, removing from queue`);
          retryQueue.delete(orderId);
          continue;
        }

        // Generate PDF
        const pdfBuffer = await generateRentalResultsPDF({
          firstName: submission.customerName.split(' ')[0],
          lastName: submission.customerName.split(' ').slice(1).join(' ') || 'User',
          email: submission.customerEmail,
          phone: submission.customerPhone || '',
          location: `${submission.city}, ${submission.state}`,
          searchRadius: submission.searchRadiusMiles || 0,
          creditChallenges: submission.creditChallenges || [],
          housingTypes: submission.housingType ? [submission.housingType] : [],
          bedrooms: submission.bedrooms || 0,
          occupants: submission.occupants || 0,
          monthlyIncome: submission.monthlyTakeHomeIncome ? parseInt(submission.monthlyTakeHomeIncome) : 0,
          monthlyBudget: submission.totalHouseholdIncome ? parseInt(submission.totalHouseholdIncome) : 0,
          employmentStatus: submission.employmentDuration || 'Not specified',
          petPreferences: 'Not specified',
          smokingStatus: 'Not specified',
          moveInTimeline: 'Flexible',
          criminalHistory: submission.criminalHistoryDetails ? true : false,
          evictionsInLast5Years: false,
          createdAt: new Date(submission.createdAt),
        });

        // Attempt to send email
        const emailSent = await sendRentalResultsEmail(
          job.customerEmail,
          job.customerName.split(' ')[0],
          pdfBuffer
        );

        if (emailSent) {
          console.log(`[WebhookRetry] Successfully sent order ${orderId} on retry`);
          retryQueue.delete(orderId);
        } else {
          job.retryCount++;
          job.lastRetryTime = now;

          if (job.retryCount >= MAX_RETRIES) {
            console.error(`[WebhookRetry] Max retries reached for order ${orderId}, removing from queue`);
            retryQueue.delete(orderId);
          } else {
            job.nextRetryTime = new Date(now.getTime() + RETRY_DELAYS[job.retryCount]);
            console.log(`[WebhookRetry] Scheduling next retry for order ${orderId} at ${job.nextRetryTime}`);
          }
        }
      } catch (error) {
        console.error(`[WebhookRetry] Error retrying order ${orderId}:`, error);

        const job = retryQueue.get(orderId);
        if (job) {
          job.retryCount++;
          job.lastRetryTime = now;

          if (job.retryCount >= MAX_RETRIES) {
            console.error(`[WebhookRetry] Max retries reached for order ${orderId}, removing from queue`);
            retryQueue.delete(orderId);
          } else {
            job.nextRetryTime = new Date(now.getTime() + RETRY_DELAYS[job.retryCount]);
          }
        }
      }
    }

    console.log(`[WebhookRetry] Retry queue processing complete (${retryQueue.size} items remaining)`);
  } catch (error) {
    console.error("[WebhookRetry] Error processing retry queue:", error);
  }
}

/**
 * Get retry queue status
 */
export function getRetryQueueStatus() {
  const items = Array.from(retryQueue.values()).map(job => ({
    orderId: job.orderId,
    customerEmail: job.customerEmail,
    retryCount: job.retryCount,
    nextRetryTime: job.nextRetryTime,
  }));

  return {
    queueSize: retryQueue.size,
    items,
  };
}
