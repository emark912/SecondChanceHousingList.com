import Stripe from "stripe";
import { getDb } from "./db";
import { searchSubmissions, orders } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { generateRentalResultsPDF } from "./pdf-service";
import { sendRentalResultsEmail } from "./email-service";
import { trackEmailSent, createOrder } from "./db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2026-01-28.clover" as any,
});

/**
 * Query Stripe for all completed payments and resend orders to customers
 */
export async function recoverMissingOrders(daysBack: number = 7) {
  try {
    console.log(`[StripeRecovery] Fetching completed payments from the last ${daysBack} days...`);
    
    const db = await getDb();
    if (!db) {
      console.error("[StripeRecovery] Failed to connect to database");
      return { success: false, message: "Database connection failed" };
    }

    // Calculate timestamp for daysBack
    const startTime = Math.floor((Date.now() - daysBack * 24 * 60 * 60 * 1000) / 1000);

    // Fetch all successful payment intents from Stripe
    const paymentIntents = await stripe.paymentIntents.list({
      created: { gte: startTime },
    } as any);

    console.log(`[StripeRecovery] Found ${paymentIntents.data.length} successful payments`);

    let ordersCreated = 0;
    let ordersSent = 0;
    let errors = 0;
    const results: any[] = [];

    for (const paymentIntent of paymentIntents.data) {
      try {
        const customerEmail = paymentIntent.receipt_email || (paymentIntent as any).billing_details?.email;
        if (!customerEmail) {
          console.warn(`[StripeRecovery] Payment ${paymentIntent.id} has no customer email, skipping`);
          continue;
        }

        console.log(`\n[StripeRecovery] Processing payment ${paymentIntent.id} for ${customerEmail}`);

        // Check if order already exists for this payment intent
        const existingOrders = await db
          .select()
          .from(orders)
          .where(eq(orders.stripePaymentIntentId, paymentIntent.id));

        if (existingOrders.length > 0) {
          console.log(`[StripeRecovery] Order already exists for payment ${paymentIntent.id}`);
          results.push({
            paymentIntentId: paymentIntent.id,
            customerEmail,
            status: "already_exists",
            orderId: existingOrders[0].id,
          });
          continue;
        }

        // Get metadata from payment intent
        const metadata = paymentIntent.metadata || {};
        const submissionId = metadata.submissionId ? parseInt(metadata.submissionId) : null;
        const customerName = metadata.customerName || (paymentIntent as any).billing_details?.name || "Customer";

        if (!submissionId) {
          console.warn(`[StripeRecovery] Payment ${paymentIntent.id} has no submissionId, skipping`);
          results.push({
            paymentIntentId: paymentIntent.id,
            customerEmail,
            status: "no_submission_id",
          });
          continue;
        }

        // Verify submission exists
        const submissions = await db
          .select()
          .from(searchSubmissions)
          .where(eq(searchSubmissions.id, submissionId));

        if (submissions.length === 0) {
          console.warn(`[StripeRecovery] Submission ${submissionId} not found for payment ${paymentIntent.id}`);
          results.push({
            paymentIntentId: paymentIntent.id,
            customerEmail,
            status: "submission_not_found",
            submissionId,
          });
          continue;
        }

        const submission = submissions[0];

        // Create order
        console.log(`[StripeRecovery] Creating order for ${customerEmail}...`);
        const orderId = await createOrder({
          submissionId,
          customerName,
          customerEmail,
          amount: (paymentIntent.amount / 100).toFixed(2),
          originalPrice: (paymentIntent.amount / 100).toFixed(2),
          paymentStatus: "completed",
          stripePaymentIntentId: paymentIntent.id,
        });

        ordersCreated++;
        console.log(`[StripeRecovery] Created order ${orderId}`);

        // Generate PDF
        console.log(`[StripeRecovery] Generating PDF for ${customerName}...`);
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
        console.log(`[StripeRecovery] Sending email to ${customerEmail}...`);
        const emailSent = await sendRentalResultsEmail(
          customerEmail,
          submission.customerName.split(' ')[0],
          pdfBuffer
        );

        if (emailSent) {
          await trackEmailSent({
            submissionId,
            emailType: "payment_confirmation",
            recipientEmail: customerEmail,
            status: "sent",
          });

          ordersSent++;
          console.log(`[StripeRecovery] Order sent to ${customerEmail}`);
          results.push({
            paymentIntentId: paymentIntent.id,
            customerEmail,
            status: "sent",
            orderId,
            amount: (paymentIntent.amount / 100).toFixed(2),
          });
        } else {
          console.warn(`[StripeRecovery] Failed to send email to ${customerEmail}`);
          results.push({
            paymentIntentId: paymentIntent.id,
            customerEmail,
            status: "email_failed",
            orderId,
          });
          errors++;
        }
      } catch (error) {
        console.error(`[StripeRecovery] Error processing payment:`, error);
        errors++;
        results.push({
          paymentIntentId: paymentIntent.id,
          status: "error",
          error: String(error),
        });
      }
    }

    console.log(`\n[StripeRecovery] Recovery complete:`);
    console.log(`  - Orders created: ${ordersCreated}`);
    console.log(`  - Orders sent: ${ordersSent}`);
    console.log(`  - Errors: ${errors}`);

    return {
      success: true,
      message: `Recovery complete: ${ordersSent} orders sent, ${errors} errors`,
      ordersCreated,
      ordersSent,
      errors,
      results,
    };
  } catch (error) {
    console.error("[StripeRecovery] Error:", error);
    return { success: false, message: "Error during recovery", error };
  }
}
