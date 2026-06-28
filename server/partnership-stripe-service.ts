/**
 * Partnership Stripe Service
 * Handles Stripe payment processing for lead packages
 */

import Stripe from "stripe";
import { ENV } from "./_core/env";
import { 
  createLeadPackage,
  updateLeadPackage,
  getPartnerById,
} from "./partner-db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2026-02-25.clover",
});

export interface LeadPackageOption {
  leadCount: number;
  bonusLeads: number;
  pricePerLead: number;
  totalPrice: number;
}

const LEAD_PACKAGES: Record<number, LeadPackageOption> = {
  10: { leadCount: 10, bonusLeads: 5, pricePerLead: 5.0, totalPrice: 50.0 },
  50: { leadCount: 50, bonusLeads: 5, pricePerLead: 5.0, totalPrice: 250.0 },
  100: { leadCount: 100, bonusLeads: 5, pricePerLead: 5.0, totalPrice: 500.0 },
  200: { leadCount: 200, bonusLeads: 5, pricePerLead: 5.0, totalPrice: 1000.0 },
  400: { leadCount: 400, bonusLeads: 5, pricePerLead: 5.0, totalPrice: 2000.0 },
  800: { leadCount: 800, bonusLeads: 5, pricePerLead: 5.0, totalPrice: 4000.0 },
};

/**
 * Create a Stripe checkout session for a lead package
 */
export async function createPartnershipCheckoutSession(
  partnerId: number,
  leadCount: number,
  origin: string
): Promise<{ sessionId: string; url: string } | null> {
  try {
    const partner = await getPartnerById(partnerId);
    if (!partner) {
      console.error("[Partnership Stripe] Partner not found:", partnerId);
      return null;
    }

    const packageOption = LEAD_PACKAGES[leadCount];
    if (!packageOption) {
      console.error("[Partnership Stripe] Invalid lead count:", leadCount);
      return null;
    }

    // Get or create Stripe customer
    let customerId = partner.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: partner.email,
        name: partner.businessName,
        metadata: {
          partnerId: partner.id.toString(),
          partnerName: partner.partnerName,
        },
      });
      customerId = customer.id;
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${leadCount} Leads + ${packageOption.bonusLeads} Bonus Leads`,
              description: `Lead package for ${partner.businessName}. Includes ${packageOption.bonusLeads} bonus leads at no extra cost.`,
              metadata: {
                partnerId: partner.id.toString(),
                leadCount: leadCount.toString(),
                bonusLeads: packageOption.bonusLeads.toString(),
              },
            },
            unit_amount: Math.round(packageOption.totalPrice * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/partnership/dashboard?partnerId=${partnerId}&payment=success`,
      cancel_url: `${origin}/partnership/dashboard?partnerId=${partnerId}&payment=cancelled`,
      metadata: {
        partnerId: partner.id.toString(),
        leadCount: leadCount.toString(),
        bonusLeads: packageOption.bonusLeads.toString(),
        totalLeads: (leadCount + packageOption.bonusLeads).toString(),
        packagePrice: packageOption.totalPrice.toFixed(2),
      },
    });

    console.log("[Partnership Stripe] Checkout session created:", session.id);

    return {
      sessionId: session.id,
      url: session.url || "",
    };
  } catch (error) {
    console.error("[Partnership Stripe] Error creating checkout session:", error);
    return null;
  }
}

/**
 * Handle Stripe webhook event for payment success
 */
export async function handlePaymentSuccess(event: Stripe.Event): Promise<{ partnerId: number; leadPackageId: number } | null> {
  try {
    const session = event.data.object as Stripe.Checkout.Session;

    const partnerId = parseInt(session.metadata?.partnerId || "0");
    const leadCount = parseInt(session.metadata?.leadCount || "0");
    const bonusLeads = parseInt(session.metadata?.bonusLeads || "0");
    const totalLeads = parseInt(session.metadata?.totalLeads || "0");
    const packagePrice = parseFloat(session.metadata?.packagePrice || "0");

    if (!partnerId || !leadCount) {
      console.error("[Partnership Stripe] Invalid metadata in session:", session.id);
      return null;
    }

    const partner = await getPartnerById(partnerId);
    if (!partner) {
      console.error("[Partnership Stripe] Partner not found:", partnerId);
      return null;
    }

    // Create lead package in database
    const leadPackage = await createLeadPackage({
      partnerId,
      packageName: `${leadCount} Leads Package`,
      leadCount,
      bonusLeads,
      totalLeads,
      pricePerLead: (packagePrice / leadCount).toString(),
      totalPrice: packagePrice.toString(),
      stripePaymentIntentId: session.payment_intent as string,
      paymentStatus: "completed",
      paidAt: new Date(),
      leadsRemaining: totalLeads,
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
    });

    if (leadPackage) {
      console.log("[Partnership Stripe] Lead package created:", leadPackage.id);

      // Update partner's Stripe customer ID
      if (!partner.stripeCustomerId && session.customer) {
        await updatePartner(partnerId, {
          stripeCustomerId: session.customer as string,
        });
      }

      return { partnerId, leadPackageId: leadPackage.id };
    }
    return null;
  } catch (error) {
    console.error("[Partnership Stripe] Error handling payment success:", error);
    return null;
  }
}

/**
 * Get Stripe session details
 */
export async function getStripeSession(sessionId: string): Promise<Stripe.Checkout.Session | null> {
  try {
    return await stripe.checkout.sessions.retrieve(sessionId);
  } catch (error) {
    console.error("[Partnership Stripe] Error retrieving session:", error);
    return null;
  }
}

/**
 * Create a Stripe SetupIntent so the partner can save their card
 * The card is required to activate the 20-lead free trial
 */
export async function createPartnerSetupIntent(
  partnerId: number
): Promise<{ clientSecret: string; customerId: string } | null> {
  try {
    const partner = await getPartnerById(partnerId);
    if (!partner) return null;

    // Get or create Stripe customer
    let customerId = partner.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: partner.email,
        name: partner.businessName,
        metadata: { partnerId: partner.id.toString(), partnerName: partner.partnerName },
      });
      customerId = customer.id;
      await updatePartner(partnerId, { stripeCustomerId: customerId });
    }

    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ["card"],
      usage: "off_session",
      metadata: { partnerId: partnerId.toString() },
    });

    console.log("[Partnership Stripe] SetupIntent created:", setupIntent.id);
    return { clientSecret: setupIntent.client_secret!, customerId };
  } catch (error) {
    console.error("[Partnership Stripe] Error creating SetupIntent:", error);
    return null;
  }
}

/**
 * Activate the partner's 20-lead free trial after they save their card
 */
export async function activatePartnerTrial(
  partnerId: number,
  paymentMethodId: string,
  setupIntentId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const partner = await getPartnerById(partnerId);
    if (!partner) return { success: false, message: "Partner not found" };
    if (partner.trialActivated) return { success: false, message: "Trial already activated" };

    // Attach the payment method to the customer and set as default
    if (partner.stripeCustomerId) {
      await stripe.paymentMethods.attach(paymentMethodId, { customer: partner.stripeCustomerId });
      await stripe.customers.update(partner.stripeCustomerId, {
        invoice_settings: { default_payment_method: paymentMethodId },
      });
    }

    // Save payment method and activate trial
    await updatePartner(partnerId, {
      stripePaymentMethodId: paymentMethodId,
      trialActivated: 1,
      trialStartedAt: new Date(),
      trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: "active",
    });

    // Create the 20-lead trial package
    await createLeadPackage({
      partnerId,
      packageName: "Free Trial Package",
      leadCount: 20,
      bonusLeads: 0,
      totalLeads: 20,
      leadsRemaining: 20,
      pricePerLead: "0.00",
      totalPrice: "0.00",
      paymentStatus: "completed",
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    console.log("[Partnership Stripe] Trial activated for partner:", partnerId);
    return { success: true, message: "Trial activated with 20 free leads!" };
  } catch (error) {
    console.error("[Partnership Stripe] Error activating trial:", error);
    return { success: false, message: "Failed to activate trial" };
  }
}

/**
 * Charge the partner's saved card for a lead package (no redirect needed)
 * Falls back to checkout session if no saved card on file
 */
export async function chargePartnerForLeads(
  partnerId: number,
  leadCount: number
): Promise<{ success: boolean; message: string; packageId?: number; fallbackToCheckout?: boolean }> {
  try {
    const partner = await getPartnerById(partnerId);
    if (!partner) return { success: false, message: "Partner not found" };

    const packageOption = LEAD_PACKAGES[leadCount];
    if (!packageOption) return { success: false, message: "Invalid lead count" };

    // If no saved card, fall back to Stripe Checkout
    if (!partner.stripePaymentMethodId || !partner.stripeCustomerId) {
      return { success: false, fallbackToCheckout: true, message: "No saved card on file" };
    }

    const amountCents = Math.round(packageOption.totalPrice * 100);

    // Create and confirm a PaymentIntent using the saved card
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: "usd",
      customer: partner.stripeCustomerId,
      payment_method: partner.stripePaymentMethodId,
      confirm: true,
      off_session: true,
      description: `${leadCount} Leads + ${packageOption.bonusLeads} Bonus Leads — ${partner.businessName}`,
      metadata: {
        partnerId: partnerId.toString(),
        leadCount: leadCount.toString(),
        bonusLeads: packageOption.bonusLeads.toString(),
        totalLeads: (leadCount + packageOption.bonusLeads).toString(),
        packagePrice: packageOption.totalPrice.toFixed(2),
      },
    });

    if (paymentIntent.status !== "succeeded") {
      return { success: false, message: `Payment failed: ${paymentIntent.status}` };
    }

    // Create the lead package in the database
    const totalLeads = leadCount + packageOption.bonusLeads;
    const leadPackage = await createLeadPackage({
      partnerId,
      packageName: `${leadCount} Leads Package`,
      leadCount,
      bonusLeads: packageOption.bonusLeads,
      totalLeads,
      pricePerLead: (packageOption.totalPrice / leadCount).toString(),
      totalPrice: packageOption.totalPrice.toString(),
      stripePaymentIntentId: paymentIntent.id,
      paymentStatus: "completed",
      paidAt: new Date(),
      leadsRemaining: totalLeads,
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    });

    console.log("[Partnership Stripe] Lead package charged and created:", leadPackage?.id);

    // Send confirmation email
    try {
      const { sendPackagePurchasedEmail } = await import("./partner-email-service");
      await sendPackagePurchasedEmail(
        partner.partnerName,
        partner.email,
        `${leadCount} Leads Package`,
        leadCount,
        packageOption.bonusLeads,
        packageOption.totalPrice,
        partner.id
      );
    } catch (emailError) {
      console.error("[Partnership Stripe] Failed to send confirmation email:", emailError);
    }

    return {
      success: true,
      message: `Payment of $${packageOption.totalPrice} successful! ${totalLeads} leads activated.`,
      packageId: leadPackage?.id,
    };
  } catch (error: any) {
    console.error("[Partnership Stripe] Error charging for leads:", error);
    // Handle card authentication required
    if (error.code === "authentication_required" || error.code === "requires_action") {
      return { success: false, fallbackToCheckout: true, message: "Card requires authentication" };
    }
    return { success: false, message: error.message || "Payment failed" };
  }
}

import { updatePartner } from "./partner-db";
