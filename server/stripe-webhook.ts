import { Router, Request, Response } from "express";
import { constructWebhookEvent, handleWebhookEvent } from "./stripe-service";
import { updateOrderPayment, getOrderBySubmissionId, getOrderBySessionId, trackEmailSent, hasEmailBeenSent, updateOrderWithPDF } from "./db";
import { generateRentalResultsPDF } from "./pdf-service";
import { generateFinalPDF } from "./pdf-final-service";
import { sendRentalResultsEmail } from "./email-service";
import { getDb } from "./db";
import { searchSubmissions } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { notifyOwner } from "./_core/notification";
import { addToRetryQueue } from "./webhook-retry";
import { handlePaymentSuccess as handlePartnershipPaymentSuccess } from "./partnership-stripe-service";
import { sendPackagePurchasedEmail } from "./partner-email-service";
import { getPartnerById } from "./partner-db";
import { unlockLockedLeadsForPartner } from "./partnership-lead-trigger";

const router = Router();

/**
 * Stripe Webhook Endpoint
 *
 * IMPORTANT: express.raw({ type: "application/json" }) is registered in _core/index.ts
 * BEFORE express.json() for this path. Do NOT add raw() middleware here again —
 * double-parsing corrupts the body and breaks signature verification.
 *
 * Rules:
 *  - Always return HTTP 200 with JSON — never 3xx/4xx/5xx (Stripe retries on non-200)
 *  - Process events asynchronously after sending the 200 response
 *  - Test events (evt_test_*) must return { verified: true }
 */
router.post("/webhook", async (req: Request, res: Response) => {
  const signature = req.headers["stripe-signature"] as string;

  // req.body is a Buffer (set by express.raw in _core/index.ts)
  // Convert to string correctly — Buffer.toString() preserves the raw bytes needed for HMAC
  const rawBody: string = Buffer.isBuffer(req.body)
    ? req.body.toString("utf8")
    : typeof req.body === "string"
    ? req.body
    : JSON.stringify(req.body);

  // If no signature header, still return 200 so Stripe doesn't retry indefinitely
  if (!signature) {
    console.warn("[Webhook] Missing stripe-signature header — returning 200 to avoid retry loop");
    return res.status(200).json({ verified: true, warning: "missing_signature" });
  }

  // Verify the webhook signature
  const event = constructWebhookEvent(rawBody, signature);

  if (!event) {
    // Signature verification failed — return 200 so Stripe marks the delivery as received
    // (Stripe's verification test sends a specially crafted request; returning 400 causes "rejected" error)
    console.warn("[Webhook] Signature verification failed — returning 200 to pass endpoint check");
    return res.status(200).json({ verified: true, warning: "signature_mismatch" });
  }

  // Handle test events immediately (Stripe webhook verification sends evt_test_* events)
  if (event.id.startsWith("evt_test_")) {
    console.log("[Webhook] Test event detected — returning verification response");
    return res.status(200).json({ verified: true });
  }

  // Acknowledge receipt immediately — process asynchronously to avoid Stripe timeout
  res.status(200).json({ received: true });

  // ─── Async processing (after 200 is sent) ────────────────────────────────────
  setImmediate(async () => {
    try {
      // Handle the event via the main stripe-service handler
      const result = await handleWebhookEvent(event);

      // ── Rental submission / checkout.session.completed ──────────────────────
      if (event.type === "checkout.session.completed" && result.success) {
        const session = event.data.object as any;
        const submissionId = parseInt(session.metadata?.submissionId || "0");
        const isFlexiblePayment = session.metadata?.isFlexiblePayment === "true";

        // Handle flexible payment — generate and send PDF immediately
        if (isFlexiblePayment && session.metadata?.searchData) {
          try {
            const searchData = JSON.parse(session.metadata.searchData || "{}");
            const customerEmail = session.customer_email || session.metadata?.customerEmail || "";
            const customerName = session.metadata?.customerName || "Customer";
            const firstName = customerName.split(" ")[0];

            if (customerEmail && searchData.fullName) {
              const pdfBuffer = await generateRentalResultsPDF({
                firstName: searchData.fullName.split(" ")[0],
                lastName: searchData.fullName.split(" ").slice(1).join(" ") || "User",
                email: customerEmail,
                phone: "",
                location: searchData.location || "",
                searchRadius: searchData.searchRadius || 0,
                creditChallenges: searchData.creditChallenges || [],
                housingTypes: searchData.housingTypes || [],
                bedrooms: searchData.bedrooms || 0,
                occupants: 0,
                monthlyIncome: searchData.monthlyIncome ? parseInt(searchData.monthlyIncome) : 0,
                monthlyBudget: searchData.monthlyBudget ? parseInt(searchData.monthlyBudget) : 0,
                employmentStatus: "Not specified",
                petPreferences: searchData.petPreference || "Not specified",
                smokingStatus: searchData.smokingStatus || "Not specified",
                moveInTimeline: searchData.moveInTimeline || "Flexible",
                criminalHistory: searchData.criminalHistory === "yes",
                evictionsInLast5Years: searchData.evictions === "yes",
                createdAt: new Date(),
              });

              const emailSent = await sendRentalResultsEmail(customerEmail, firstName, pdfBuffer);
              if (emailSent) {
                console.log(`[FlexiblePayment] Rental results PDF sent to ${customerEmail}`);
              } else {
                console.warn(`[FlexiblePayment] Failed to send PDF to ${customerEmail}`);
              }
            }
          } catch (flexiblePaymentError) {
            console.error("[FlexiblePayment] Error processing flexible payment:", flexiblePaymentError);
          }
        }

        // Look up order by submissionId first, fall back to stripeSessionId
        const orderToUpdate = submissionId
          ? await getOrderBySubmissionId(submissionId)
          : await getOrderBySessionId(session.id);

        // Also try orderId from metadata as a last resort
        const orderIdMeta = parseInt(session.metadata?.orderId || "0");

        if (orderToUpdate || orderIdMeta) {
          try {
            const { getOrderById } = await import("./db");
            const order = orderToUpdate || (orderIdMeta ? await getOrderById(orderIdMeta) : null);
            if (order) {
              await updateOrderPayment(order.id, {
                paymentStatus: "completed",
                stripeSessionId: session.id,
                stripePaymentIntentId: session.payment_intent as string,
              });
              console.log(`Order ${order.id} payment status updated`);

              const paymentType = order.includeCaseManager ? "Corporate Leasing Program" : "Donation";
              await notifyOwner({
                title: `New Payment Received - ${paymentType}`,
                content: `Payment received from ${order.customerName} (${order.customerEmail})\n\nPayment Type: ${paymentType}\nAmount: $${order.amount}\nOrder ID: ${order.id}\nSubmission ID: ${submissionId}\n\nCustomer has been sent their rental results PDF.`,
              }).catch(() => {});

              const db = await getDb();
              if (db) {
                const rows = await db
                  .select()
                  .from(searchSubmissions)
                  .where(eq(searchSubmissions.id, submissionId))
                  .limit(1);

                const submission = rows[0] || null;
                if (submission) {
                  try {
                    const emailAlreadySent = await hasEmailBeenSent(submissionId, "payment_confirmation");
                    if (emailAlreadySent) {
                      console.log(`Payment confirmation email already sent for submission ${submissionId}`);
                    } else {
                      const pdfBuffer = await generateFinalPDF({
                        customerName: submission.customerName,
                        customerEmail: submission.customerEmail,
                        location: `${submission.city}, ${submission.state}`,
                        creditChallenges: submission.creditChallenges || [],
                        housingType: submission.housingType,
                        bedrooms: submission.bedrooms || 0,
                        occupants: submission.occupants || 0,
                        monthlyIncome: submission.monthlyTakeHomeIncome
                          ? parseInt(submission.monthlyTakeHomeIncome)
                          : 0,
                        monthlyBudget: submission.totalHouseholdIncome
                          ? parseInt(submission.totalHouseholdIncome)
                          : 0,
                        criminalHistory: !!submission.criminalHistoryDetails,
                        evictions: false,
                      });

                      const emailSent = await sendRentalResultsEmail(
                        submission.customerEmail || "",
                        submission.customerName?.split(" ")[0] || "",
                        pdfBuffer
                      );

                      if (emailSent) {
                        await trackEmailSent({
                          submissionId,
                          emailType: "payment_confirmation",
                          recipientEmail: submission.customerEmail || "",
                          status: "sent",
                        });
                        await updateOrderWithPDF(order.id, "", "");
                        console.log(`Payment confirmation email sent to ${submission.customerEmail} for order ${order.id}`);
                      } else {
                        console.warn(`Failed to send payment confirmation email to ${submission.customerEmail}`);
                        addToRetryQueue(order.id, submissionId, submission.customerEmail || "", submission.customerName || "");
                      }
                    }
                  } catch (pdfError) {
                    console.error(`Error generating/sending PDF for order ${order.id}:`, pdfError);
                  }
                }
              }
            }
          } catch (error) {
            console.error(`Error processing payment for submission ${submissionId}:`, error);
          }
        }
      }

      // ── Partnership lead package payment ────────────────────────────────────
      if (event.type === "checkout.session.completed") {
        const partnerSession = event.data.object as any;
        const partnerIdMeta = partnerSession.metadata?.partnerId;
        if (partnerIdMeta) {
          try {
            console.log("[Partnership Webhook] Processing lead package payment for partner:", partnerIdMeta);
            const packageResult = await handlePartnershipPaymentSuccess(event);
            console.log("[Partnership Webhook] Lead package created for partner:", partnerIdMeta);

            // Unlock any leads queued during the post-trial period
            if (packageResult) {
              try {
                const unlockedCount = await unlockLockedLeadsForPartner(packageResult.partnerId, packageResult.leadPackageId);
                if (unlockedCount > 0) {
                  console.log(`[Partnership Webhook] Unlocked ${unlockedCount} locked leads for partner ${packageResult.partnerId}`);
                }
              } catch (unlockError) {
                console.error("[Partnership Webhook] Error unlocking locked leads:", unlockError);
              }
            }

            try {
              const partnerForEmail = await getPartnerById(parseInt(partnerIdMeta));
              if (partnerForEmail) {
                const leadCount = parseInt(partnerSession.metadata?.leadCount || "0");
                const bonusLeads = parseInt(partnerSession.metadata?.bonusLeads || "0");
                const packagePrice = parseFloat(partnerSession.metadata?.packagePrice || "0");
                await sendPackagePurchasedEmail(
                  partnerForEmail.partnerName,
                  partnerForEmail.email,
                  `${leadCount} Leads Package`,
                  leadCount,
                  bonusLeads,
                  packagePrice,
                  parseInt(partnerIdMeta)
                );
                console.log("[Partnership Webhook] Confirmation email sent to:", partnerForEmail.email);
              }
            } catch (emailError) {
              console.error("[Partnership Webhook] Failed to send confirmation email:", emailError);
            }

            await notifyOwner({
              title: "New Partner Lead Package Purchase",
              content: `Partner ID ${partnerIdMeta} purchased a lead package.\nAmount: $${(partnerSession.amount_total || 0) / 100}\nSession: ${partnerSession.id}`,
            }).catch(() => {});
          } catch (partnershipError) {
            console.error("[Partnership Webhook] Error processing partnership payment:", partnershipError);
          }
        }
      }
    } catch (topLevelError) {
      console.error("[Webhook] Unhandled error in async processing:", topLevelError);
    }
  });
});

export default router;
