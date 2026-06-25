import Stripe from "stripe";

type StripeEvent = Stripe.Event;
import { ENV } from "./_core/env";
import * as db from "./db";

const stripe = new Stripe(ENV.stripeSecretKey || "");

export async function createCheckoutSession(input: {
  userEmail: string;
  userName: string;
  amountDollars: number;
  userId: number;
  origin: string;
}) {
  if (input.amountDollars < 20) {
    throw new Error("Minimum donation is $20");
  }

  const amountCents = Math.round(input.amountDollars * 100);

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Donation - Access to Landlord Information",
              description: "Support Second Chance Housing List and unlock landlord contact details",
            },
            unit_amount: amountCents,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${input.origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${input.origin}/payment-failed`,
      customer_email: input.userEmail,
      client_reference_id: input.userId.toString(),
      metadata: {
        user_id: input.userId.toString(),
        customer_email: input.userEmail,
        customer_name: input.userName,
      },
      allow_promotion_codes: true,
    });

    // Save donation record
    await db.saveDonation({
      userEmail: input.userEmail,
      userName: input.userName,
      amountCents,
      stripeSessionId: session.id,
    });

    return {
      sessionId: session.id,
      url: session.url,
    };
  } catch (error) {
    console.error("Stripe checkout session error:", error);
    throw error;
  }
}

export async function verifyPaymentSession(sessionId: string) {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "paid") {
      const donation = await db.getDonationBySessionId(sessionId);

      if (donation) {
        await db.grantListAccess(donation.id);
        return {
          success: true,
          userEmail: session.customer_email,
          amount: (session.amount_total || 0) / 100,
        };
      }
    }

    return {
      success: false,
      message: "Payment not completed or donation not found",
    };
  } catch (error) {
    console.error("Verify payment session error:", error);
    throw error;
  }
}

export async function handleWebhookEvent(event: StripeEvent) {
  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.payment_status === "paid") {
          const donation = await db.getDonationBySessionId(session.id);
          if (donation) {
            await db.grantListAccess(donation.id);
            console.log(`[Webhook] Payment completed for ${session.customer_email}`);
          }
        }
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        console.log(`[Webhook] Charge refunded: ${charge.id}`);
        break;
      }

      default:
        console.log(`[Webhook] Unhandled event type: ${event.type}`);
    }

    return { received: true };
  } catch (error) {
    console.error("Webhook event handling error:", error);
    throw error;
  }
}

export { stripe };
