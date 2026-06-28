/**
 * Partnership Stripe Webhook Handler
 * Processes Stripe events for partnership lead package payments
 */

import Stripe from "stripe";
import { handlePaymentSuccess } from "./partnership-stripe-service";
import { sendPackagePurchasedEmail } from "./partner-email-service";
import { getPartnerById, getLeadPackageById } from "./partner-db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2026-02-25.clover",
});

/**
 * Handle Stripe webhook event
 */
export async function handlePartnershipWebhook(
  body: Buffer,
  signature: string
): Promise<{ received: boolean }> {
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ""
    );
  } catch (error) {
    console.error("[Partnership Webhook] Signature verification failed:", error);
    return { received: false };
  }

  console.log("[Partnership Webhook] Received event:", event.type);

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(event);
        break;

      case "payment_intent.succeeded":
        await handlePaymentIntentSucceeded(event);
        break;

      case "payment_intent.payment_failed":
        await handlePaymentIntentFailed(event);
        break;

      default:
        console.log("[Partnership Webhook] Unhandled event type:", event.type);
    }
  } catch (error) {
    console.error("[Partnership Webhook] Error handling event:", error);
  }

  return { received: true };
}

/**
 * Handle checkout.session.completed event
 */
async function handleCheckoutSessionCompleted(event: Stripe.Event): Promise<void> {
  const session = event.data.object as Stripe.Checkout.Session;

  console.log("[Partnership Webhook] Processing checkout session:", session.id);

  // Handle payment success
  await handlePaymentSuccess(event);

  // Send confirmation email to partner
  const partnerId = parseInt(session.metadata?.partnerId || "0");
  const leadCount = parseInt(session.metadata?.leadCount || "0");
  const bonusLeads = parseInt(session.metadata?.bonusLeads || "0");

  if (partnerId && leadCount) {
    const partner = await getPartnerById(partnerId);
    if (partner) {
      await sendPackagePurchasedEmail(
        partner.partnerName,
        partner.email,
        `${leadCount} Leads Package`,
        leadCount,
        bonusLeads,
        parseFloat(session.metadata?.packagePrice || "0"),
        partnerId
      );
    }
  }
}

/**
 * Handle payment_intent.succeeded event
 */
async function handlePaymentIntentSucceeded(event: Stripe.Event): Promise<void> {
  const paymentIntent = event.data.object as Stripe.PaymentIntent;

  console.log("[Partnership Webhook] Payment intent succeeded:", paymentIntent.id);

  // Additional processing if needed
  // This is a backup in case checkout.session.completed doesn't fire
}

/**
 * Handle payment_intent.payment_failed event
 */
async function handlePaymentIntentFailed(event: Stripe.Event): Promise<void> {
  const paymentIntent = event.data.object as Stripe.PaymentIntent;

  console.log("[Partnership Webhook] Payment intent failed:", paymentIntent.id);

  // TODO: Send failure email to partner
  // TODO: Log failed payment attempt
}
