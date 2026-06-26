/**
 * Stripe Customer Portal Service
 * Handles creation of Stripe Customer Portal sessions for partner billing management
 */

import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

/**
 * Create a Stripe Customer Portal session
 * Allows partners to manage their billing, payment methods, and subscriptions
 */
export async function createCustomerPortalSession(
  stripeCustomerId: string,
  returnUrl: string
): Promise<{ url: string | null }> {
  try {
    if (!stripeCustomerId) {
      console.error("[CustomerPortal] No Stripe customer ID provided");
      return { url: null };
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: returnUrl,
    } as Parameters<typeof stripe.billingPortal.sessions.create>[0]);

    return { url: session.url };
  } catch (error) {
    console.error("[CustomerPortal] Error creating portal session:", error);
    return { url: null };
  }
}

/**
 * Get partner's Stripe customer ID from database
 */
export async function getPartnerStripeCustomerId(
  partnerId: number
): Promise<string | null> {
  try {
    const { getPartnerById } = await import("./partner-db");
    const partner = await getPartnerById(partnerId);

    if (!partner) {
      console.error("[CustomerPortal] Partner not found:", partnerId);
      return null;
    }

    return partner.stripeCustomerId || null;
  } catch (error) {
    console.error("[CustomerPortal] Error fetching partner Stripe ID:", error);
    return null;
  }
}
