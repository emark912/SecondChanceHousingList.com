import { getDb } from "./db";
import { eq, and, gte, lte, isNull } from "drizzle-orm";
import { searchSubmissions, orders, emailLogs } from "../drizzle/schema";
import { sendEmail } from "./email-service";

/**
 * Email Cron Job - Runs every 5 minutes
 * 
 * Responsibilities:
 * 1. Process email queue - send emails that are scheduled for now
 * 2. Trigger 15-minute lead notification emails (if no payment)
 * 3. Trigger 3-day lead follow-up emails (if no payment)
 * 4. Trigger 10-day lead follow-up emails (if no payment)
 * 5. Trigger 3-day corporate leasing follow-up emails (after payment)
 * 6. Cancel lead nurture emails if customer makes a payment
 */

interface SubmissionWithPayment {
  submission: any;
  hasPaid: boolean;
  paymentType?: "rental_results" | "corporate_leasing";
  paymentDate?: Date;
}

/**
 * Check if a submission has made a payment
 */
async function checkSubmissionPayment(submissionId: number): Promise<{
  hasPaid: boolean;
  paymentType?: "rental_results" | "corporate_leasing";
  paymentDate?: Date;
}> {
  try {
    const db = await getDb();
    if (!db) return { hasPaid: false };

    // Check for any completed orders
    const completedOrders = await db
      .select()
      .from(orders)
      .where(
        and(
          eq(orders.submissionId, submissionId),
          eq(orders.paymentStatus, "completed")
        )
      )
      .limit(1);

    if (completedOrders.length === 0) {
      return { hasPaid: false };
    }

    const order = completedOrders[0];
    const amountNum = typeof order.amount === 'string' ? parseFloat(order.amount) : order.amount;
    const paymentType = amountNum === 25 ? "rental_results" : "corporate_leasing";

    return {
      hasPaid: true,
      paymentType,
      paymentDate: order.updatedAt || order.createdAt,
    };
  } catch (error) {
    console.error(`[Email Cron] Error checking payment for submission ${submissionId}:`, error);
    return { hasPaid: false };
  }
}

/**
 * Check if an email has already been sent for this submission and type
 */
async function hasEmailBeenSent(submissionId: number, emailType: string): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) return false;

    const existingEmail = await db
      .select()
      .from(emailLogs)
      .where(
        and(
          eq(emailLogs.submissionId, submissionId),
          eq(emailLogs.emailType, emailType as any)
        )
      )
      .limit(1);

    return existingEmail.length > 0;
  } catch (error) {
    console.error(`[Email Cron] Error checking if email was sent:`, error);
    return false;
  }
}

/**
 * Send 15-minute lead notification email
 */
async function send15MinLeadNotification(submission: any): Promise<void> {
  try {
    const alreadySent = await hasEmailBeenSent(submission.id, "lead_notification_15min");
    if (alreadySent) return;

    const success = await sendEmail({ to: submission.email, subject: "Your Housing Search Results Are Ready", html: `<p>Hi ${submission.fullName}, your housing search results are ready. Visit our website to view them.</p>` });

    if (success) {
      console.log(`[Email Cron] Sent 15-min lead notification to ${submission.email}`);
    }
  } catch (error) {
    console.error(`[Email Cron] Error sending 15-min notification:`, error);
  }
}

/**
 * Send 3-day lead follow-up email
 */
async function send3DayLeadFollowup(submission: any): Promise<void> {
  try {
    const alreadySent = await hasEmailBeenSent(submission.id, "lead_followup_3days");
    if (alreadySent) return;

    const success = await sendEmail({ to: submission.email, subject: "Follow Up: Your Housing Search", html: `<p>Hi ${submission.fullName}, following up on your housing search. Visit our website for updates.</p>` });

    if (success) {
      console.log(`[Email Cron] Sent 3-day lead follow-up to ${submission.email}`);
    }
  } catch (error) {
    console.error(`[Email Cron] Error sending 3-day follow-up:`, error);
  }
}

/**
 * Send 10-day lead follow-up email
 */
async function send10DayLeadFollowup(submission: any): Promise<void> {
  try {
    const alreadySent = await hasEmailBeenSent(submission.id, "lead_followup_10days");
    if (alreadySent) return;

    const success = await sendEmail({ to: submission.email, subject: "Final Follow Up: Your Housing Search", html: `<p>Hi ${submission.fullName}, this is our final follow up. Visit our website for updates.</p>` });

    if (success) {
      console.log(`[Email Cron] Sent 10-day lead follow-up to ${submission.email}`);
    }
  } catch (error) {
    console.error(`[Email Cron] Error sending 10-day follow-up:`, error);
  }
}

/**
 * Send 3-day corporate leasing follow-up email
 */
async function send3DayCorporateLeasingFollowup(
  submission: any,
  paymentDate: Date,
  paymentType: string
): Promise<void> {
  try {
    const alreadySent = await hasEmailBeenSent(submission.id, "corporate_leasing_followup_3days");
    if (alreadySent) return;

    const followupMessage =
      paymentType === "corporate_leasing"
        ? "We're processing your application and will have updates soon."
        : "Thank you for your payment. Your case manager will contact you shortly.";

    const success = await sendEmail({ to: submission.email, subject: "Update on Your Corporate Leasing Application", html: `<p>Please visit our website for updates on your housing search.</p>` });

    if (success) {
      console.log(`[Email Cron] Sent 3-day corporate leasing follow-up to ${submission.email}`);
    }
  } catch (error) {
    console.error(`[Email Cron] Error sending 3-day corporate leasing follow-up:`, error);
  }
}

/**
 * Main cron job function - runs every 5 minutes
 */
export async function processEmailCronJob(): Promise<void> {
  try {
    const db = await getDb();
    if (!db) {
      console.warn("[Email Cron] Database not available");
      return;
    }

    console.log("[Email Cron] Starting email processing cycle...");

    // Get all submissions from the last 10 days
    const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
    const recentSubmissions = await db
      .select()
      .from(searchSubmissions)
      .where(gte(searchSubmissions.createdAt, tenDaysAgo));

    console.log(`[Email Cron] Found ${recentSubmissions.length} recent submissions to process`);

    // Also process pending orders that haven't been sent yet
    const pendingOrders = await db
      .select()
      .from(orders)
      .where(
        and(
          eq(orders.paymentStatus, "completed"),
          eq(orders.emailSent, 0)
        )
      );

    console.log(`[Email Cron] Found ${pendingOrders.length} pending orders to send`);

// Fixed section for email cron job - send pending orders with PDF attachments
for (const order of pendingOrders) {
  try {
    const { sendRentalResultsEmail } = await import('./email-service');
    const { generateRentalResultsPDF } = await import('./pdf-service');
    
    // Fetch the full rental profile data from searchSubmissions
    const submission = await db
      .select()
      .from(searchSubmissions)
      .where(eq(searchSubmissions.id, order.submissionId))
      .limit(1);
    
    if (!submission || submission.length === 0) {
      console.error(`[Email Cron] Submission not found for order ${order.id}`);
      continue;
    }
    
    const profileData = submission[0];
    const firstName = order.customerName.split(' ')[0] || 'Valued';
    const lastName = order.customerName.split(' ')[1] || 'Customer';
    
    // Parse JSON fields safely
    let creditChallenges: string[] = [];
    let housingTypes: string[] = [];
    let petPreferences = 'None';
    try {
      if (profileData.creditChallenges) {
        creditChallenges = JSON.parse(profileData.creditChallenges as any);
      }
      // housingTypes field not in schema, using housingType instead
      if (profileData.housingType) {
        housingTypes = [profileData.housingType];
      }
    } catch (e) {
      console.warn('[Email Cron] Error parsing JSON fields:', e);
    }
    
    // Generate PDF for this customer
    const pdfBuffer = await generateRentalResultsPDF({
      firstName,
      lastName,
      email: order.customerEmail,
      phone: profileData.customerPhone || '',
      location: `${profileData.city}, ${profileData.state}`,
      searchRadius: profileData.searchRadiusMiles || 25,
      creditChallenges,
      housingTypes,
      bedrooms: profileData.bedrooms || 1,
      occupants: profileData.occupants || 1,
      monthlyIncome: parseInt(profileData.totalHouseholdIncome) || 0,
      monthlyBudget: 0,
      employmentStatus: profileData.employmentDuration || '',
      petPreferences,
      smokingStatus: 'Non-smoker',
      moveInTimeline: 'Flexible',
      criminalHistory: profileData.criminalHistoryDetails ? true : false,
      criminalHistoryType: profileData.criminalHistoryDetails || undefined,
      evictionsInLast5Years: false,
      createdAt: profileData.createdAt || new Date(),
    });
    
    // Send email with PDF attachment
    const result = await sendRentalResultsEmail(
      order.customerEmail,
      order.customerName,
      pdfBuffer
    );
    
    if (result) {
      await db.update(orders).set({ emailSent: 1 }).where(eq(orders.id, order.id));
      console.log(`[Email Cron] Sent rental results with PDF to ${order.customerEmail}`);
    }
  } catch (error) {
    console.error(`[Email Cron] Error sending to ${order.customerEmail}:`, error);
  }
}

    for (const submission of recentSubmissions) {
      // Check if submission has made a payment
      const paymentInfo = await checkSubmissionPayment(submission.id);

      if (paymentInfo.hasPaid) {
        // If paid, only send corporate leasing follow-up (3 days after payment)
        if (paymentInfo.paymentDate) {
          const threeDaysAfterPayment = new Date(paymentInfo.paymentDate.getTime() + 3 * 24 * 60 * 60 * 1000);
          const now = new Date();

          // Check if 3 days have passed since payment
          if (now >= threeDaysAfterPayment) {
            await send3DayCorporateLeasingFollowup(
              submission,
              paymentInfo.paymentDate,
              paymentInfo.paymentType || "corporate_leasing"
            );
          }
        }
      } else {
        // If NOT paid, send lead nurture sequence
        const createdAt = new Date(submission.createdAt);
        const now = new Date();

        // Calculate time elapsed since submission
        const timeElapsedMs = now.getTime() - createdAt.getTime();
        const timeElapsedMinutes = timeElapsedMs / (1000 * 60);
        const timeElapsedDays = timeElapsedMs / (1000 * 60 * 60 * 24);

        // 15-minute notification (with 5-minute window: 10-20 minutes)
        if (timeElapsedMinutes >= 10 && timeElapsedMinutes <= 20) {
          await send15MinLeadNotification(submission);
        }

        // 3-day follow-up (with 2-hour window: 2.9-3.1 days)
        if (timeElapsedDays >= 2.9 && timeElapsedDays <= 3.1) {
          await send3DayLeadFollowup(submission);
        }

        // 10-day follow-up (with 2-hour window: 9.9-10.1 days)
        if (timeElapsedDays >= 9.9 && timeElapsedDays <= 10.1) {
          await send10DayLeadFollowup(submission);
        }
      }
    }

    console.log("[Email Cron] Email processing cycle completed");
  } catch (error) {
    console.error("[Email Cron] Error in email cron job:", error);
  }
}

/**
 * Initialize the email cron job - runs every 5 minutes
 */
export function initializeEmailCronJob(): void {
  console.log("[Email Cron] Initializing email cron job (runs every 5 minutes)");

  // Run immediately on startup
  processEmailCronJob().catch(console.error);

  // Run every 5 minutes
  setInterval(() => {
    processEmailCronJob().catch(console.error);
  }, 5 * 60 * 1000);
}
