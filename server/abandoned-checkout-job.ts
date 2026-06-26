import { sendEmail } from "./email-service";
import { eq, and, gte, lte } from "drizzle-orm";
import { getDb, hasEmailBeenSent, trackEmailSent, getDefaultEmailTemplate } from "./db";
import { formSubmissions, orders } from "../drizzle/schema";

/**
 * Check for abandoned checkouts and send appropriate reminder emails
 * - 20 minutes after submission: first reminder with discount
 * - 3 days after submission: final reminder before offer expires
 */
export async function checkAndSendAbandonedCheckoutEmails() {
  try {
    const db = await getDb();
    if (!db) {
      console.warn("[Abandoned Checkout Job] Database not available");
      return;
    }

    // Get submissions from 18-22 minutes ago (for 20-minute reminder) - wider window for reliability
    const twentyMinutesAgo = new Date(Date.now() - 20 * 60 * 1000);
    const eighteenMinutesAgo = new Date(Date.now() - 18 * 60 * 1000);

    const submissionsFor20MinReminder = await db
      .select()
      .from(formSubmissions)
      .where(
        and(
          gte(formSubmissions.createdAt, eighteenMinutesAgo),
          lte(formSubmissions.createdAt, twentyMinutesAgo)
        )
      );

    for (const submission of submissionsFor20MinReminder) {
      // Check if this submission has a paid order
      const paidOrder = await db
        .select()
        .from(orders)
        .where(
          and(
            eq(orders.submissionId, submission.id),
            eq(orders.paymentStatus, "completed")
          )
        )
        .limit(1);

      // If no paid order and email hasn't been sent yet
      if (paidOrder.length === 0) {
        const alreadySent = await hasEmailBeenSent(submission.id, "abandoned_checkout_20min");
        if (!alreadySent) {
          await sendAbandonedCheckoutEmail(submission, "abandoned_checkout_20min");
        }
      }
    }

    // Get submissions from 2.95-3.05 days ago (for 3-day final reminder) - wider window for reliability
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    const twoPointNineEightDaysAgo = new Date(Date.now() - (3 * 24 * 60 * 60 * 1000 - 15 * 60 * 1000)); // 15 minutes before

    const submissionsFor3DayReminder = await db
      .select()
      .from(formSubmissions)
      .where(
        and(
          gte(formSubmissions.createdAt, threeDaysAgo),
          lte(formSubmissions.createdAt, twoPointNineEightDaysAgo)
        )
      );

    for (const submission of submissionsFor3DayReminder) {
      // Check if this submission has a paid order
      const paidOrder = await db
        .select()
        .from(orders)
        .where(
          and(
            eq(orders.submissionId, submission.id),
            eq(orders.paymentStatus, "completed")
          )
        )
        .limit(1);

      // If no paid order and email hasn't been sent yet
      if (paidOrder.length === 0) {
        const alreadySent = await hasEmailBeenSent(submission.id, "abandoned_checkout_3day");
        if (!alreadySent) {
          await sendAbandonedCheckoutEmail(submission, "abandoned_checkout_3day");
        }
      }
    }
  } catch (error) {
    console.error("[Abandoned Checkout Job] Error:", error);
  }
}

async function sendAbandonedCheckoutEmail(submission: any, templateType: "abandoned_checkout_20min" | "abandoned_checkout_3day") {
  try {
    // Get the default email template
    const template = await getDefaultEmailTemplate(templateType);
    if (!template) {
      console.warn(`[Abandoned Checkout Job] No default template found for ${templateType}`);
      return;
    }

    // Extract city from location (format: "City, State")
    const locationParts = submission.location.split(",");
    const city = locationParts[0]?.trim() || submission.location;

    // Create checkout link to customer's personal checkout page
    const checkoutLink = `${process.env.FRONTEND_URL || "https://www.secondchancehousinglocator.com"}/checkout?submissionId=${submission.id}&abandoned=true`;

    // Prepare personalization variables
    const personalizationVars: Record<string, string> = {
      customerName: submission.fullName,
      city: city,
      checkoutLink: checkoutLink,
      monthlyBudget: String(submission.monthlyBudget),
      monthlyIncome: String(submission.monthlyIncome),
      bedrooms: String(submission.bedrooms || "Not specified"),
      creditChallenges: submission.creditChallenges?.join(", ") || "Not specified",
      housingTypes: submission.housingTypes?.join(", ") || "Not specified",
    };

    // Replace template variables with actual values
    let subject = template.subject;
    let bodyHtml = template.bodyHtml;

    Object.entries(personalizationVars).forEach(([key, value]) => {
      const regex = new RegExp(`\\{${key}\\}`, "g");
      subject = subject.replace(regex, value);
      bodyHtml = bodyHtml.replace(regex, value);
    });

    // Send email using template
    const success = await sendEmail({
      to: submission.email,
      subject: subject,
      html: bodyHtml,
    });

    if (success) {
      // Track that email was sent
      await trackEmailSent(submission.id);
      console.log(`[Abandoned Checkout Job] Email sent to ${submission.email} for ${templateType}`);
    } else {
      console.error(`[Abandoned Checkout Job] Failed to send email to ${submission.email}`);
    }
  } catch (error) {
    console.error("[Abandoned Checkout Job] Error sending email:", error);
  }
}
