import { getDb } from "./db";
import { searchSubmissions, orders } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { generateRentalResultsPDF } from "./pdf-service";
import { sendRentalResultsEmail } from "./email-service";
import { trackEmailSent } from "./db";

/**
 * Resend orders to all paid customers who haven't received their emails
 */
export async function resendPaidOrders() {
  try {
    console.log("[ResendOrders] Starting to resend orders to paid customers...");
    
    const db = await getDb();
    if (!db) {
      console.error("[ResendOrders] Failed to connect to database");
      return { success: false, message: "Database connection failed" };
    }

    // Get all completed orders
    const paidOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.paymentStatus, "completed"));

    console.log(`[ResendOrders] Found ${paidOrders.length} paid orders`);

    let successCount = 0;
    let failureCount = 0;

    for (const order of paidOrders) {
      try {
        console.log(`\n[ResendOrders] Processing order ${order.id} for ${order.customerEmail}`);

        // Get the submission data
        const submissions = await db
          .select()
          .from(searchSubmissions)
          .where(eq(searchSubmissions.id, order.submissionId));

        const submission = submissions[0];
        if (!submission) {
          console.warn(`[ResendOrders] No submission found for order ${order.id}`);
          failureCount++;
          continue;
        }

        // Generate PDF
        console.log(`[ResendOrders] Generating PDF for ${order.customerName}...`);
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

        // Send email
        console.log(`[ResendOrders] Sending email to ${submission.customerEmail}...`);
        const emailSent = await sendRentalResultsEmail(
          submission.customerEmail,
          submission.customerName.split(' ')[0],
          pdfBuffer
        );

        if (emailSent) {
          // Track the email send
          await trackEmailSent({
            submissionId: order.submissionId,
            emailType: "payment_confirmation",
            recipientEmail: submission.customerEmail,
            status: "sent",
          });

          console.log(`[ResendOrders] ✓ Order resent to ${order.customerEmail}`);
          successCount++;
        } else {
          console.warn(`[ResendOrders] ✗ Failed to send email to ${order.customerEmail}`);
          failureCount++;
        }
      } catch (error) {
        console.error(`[ResendOrders] Error processing order ${order.id}:`, error);
        failureCount++;
      }
    }

    console.log(`\n[ResendOrders] Completed: ${successCount} successful, ${failureCount} failed`);
    return {
      success: true,
      message: `Resent orders to ${successCount} customers. ${failureCount} failed.`,
      successCount,
      failureCount,
      totalOrders: paidOrders.length,
    };
  } catch (error) {
    console.error("[ResendOrders] Error:", error);
    return { success: false, message: "Error resending orders", error };
  }
}
