import { getDb } from "./db";
import { searchSubmissions, orders } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { generateRentalResultsPDF } from "./pdf-service";
import { sendRentalResultsEmail } from "./email-service";
import { trackEmailSent } from "./db";

/**
 * Manually send an order to a customer by email address
 */
export async function manualSendOrderByEmail(customerEmail: string) {
  try {
    console.log(`[ManualSend] Sending order to ${customerEmail}...`);
    
    const db = await getDb();
    if (!db) {
      console.error("[ManualSend] Failed to connect to database");
      return { success: false, message: "Database connection failed" };
    }

    // Find the order by customer email
    const orderResults = await db
      .select()
      .from(orders)
      .where(eq(orders.customerEmail, customerEmail));

    if (orderResults.length === 0) {
      console.warn(`[ManualSend] No order found for ${customerEmail}`);
      return { success: false, message: `No order found for ${customerEmail}` };
    }

    const order = orderResults[0];
    console.log(`[ManualSend] Found order ${order.id} for ${customerEmail}`);

    // Get the submission data
    const submissions = await db
      .select()
      .from(searchSubmissions)
      .where(eq(searchSubmissions.id, order.submissionId));

    const submission = submissions[0];
    if (!submission) {
      console.warn(`[ManualSend] No submission found for order ${order.id}`);
      return { success: false, message: "No submission data found" };
    }

    // Generate PDF
    console.log(`[ManualSend] Generating PDF for ${order.customerName}...`);
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
    console.log(`[ManualSend] Sending email to ${submission.customerEmail}...`);
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

      console.log(`[ManualSend] Order sent to ${customerEmail}`);
      return {
        success: true,
        message: `Order sent to ${customerEmail}`,
        orderId: order.id,
        customerName: order.customerName,
      };
    } else {
      console.warn(`[ManualSend] Failed to send email to ${customerEmail}`);
      return { success: false, message: "Failed to send email" };
    }
  } catch (error) {
    console.error("[ManualSend] Error:", error);
    return { success: false, message: "Error sending order", error };
  }
}
