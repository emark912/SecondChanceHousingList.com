import { Request, Response } from "express";
import Stripe from "stripe";
import * as db from "./db";
import { sendDonationConfirmation } from "./email-service";
import { ENV } from "./_core/env";

const stripe = new Stripe(ENV.stripeSecretKey);

export async function handleStripeWebhook(req: Request, res: Response) {
  const sig = req.headers["stripe-signature"] as string;
  const webhookSecret = ENV.stripeWebhookSecret;

  if (!sig || !webhookSecret) {
    console.error("[Webhook] Missing signature or webhook secret");
    return res.status(400).json({ error: "Missing signature" });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      webhookSecret
    );
  } catch (error) {
    console.error("[Webhook] Signature verification failed:", error);
    return res.status(400).json({ error: "Invalid signature" });
  }

  // Handle test events
  if (event.id.startsWith("evt_test_")) {
    console.log("[Webhook] Test event detected, returning verification response");
    return res.json({ verified: true });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log("[Webhook] Checkout session completed:", session.id);

        if (!session.client_reference_id || !session.customer_email) {
          console.warn("[Webhook] Missing client_reference_id or customer_email");
          return res.status(400).json({ error: "Missing required fields" });
        }

        // Check if we've already processed this session (idempotency)
        const existingDonation = await db.getDonationBySessionId(session.id);
        if (existingDonation && existingDonation.status === "completed") {
          console.log("[Webhook] Donation already processed:", session.id);
          return res.json({ received: true, alreadyProcessed: true });
        }

        const metadata = session.metadata || {};
        const userEmail = session.customer_email;
        const userName = metadata.customer_name || "Donor";
        const amountCents = session.amount_total || 0;
        const amountDollars = amountCents / 100;

        console.log(`[Webhook] Processing donation for ${userEmail} - $${amountDollars}`);

        try {
          // Record the donation in database
          await db.saveDonation({
            userEmail,
            userName,
            amountCents,
            stripeSessionId: session.id,
          });

          // Grant list access
          const donation = await db.getDonationBySessionId(session.id);
          if (!donation) {
            throw new Error("Failed to retrieve saved donation");
          }

          await db.grantListAccess(donation.id);
          console.log(`[Webhook] Access granted to ${userEmail}`);

          // Send confirmation email only after access is confirmed
          try {
            await sendDonationConfirmation({
              recipientEmail: userEmail,
              recipientName: userName,
              amountDollars,
            });
            console.log(`[Webhook] Confirmation email sent to ${userEmail}`);
          } catch (emailError) {
            console.error("[Webhook] Failed to send confirmation email:", emailError);
            // Log but don't fail - user still has access
          }
        } catch (error) {
          console.error("[Webhook] Failed to process donation:", error);
          return res.status(500).json({ error: "Failed to process donation" });
        }

        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log("[Webhook] Payment intent succeeded:", paymentIntent.id);
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log("[Webhook] Payment intent failed:", paymentIntent.id);
        break;
      }

      default:
        console.log(`[Webhook] Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error("[Webhook] Error processing event:", error);
    res.status(500).json({ error: "Webhook processing failed" });
  }
}
