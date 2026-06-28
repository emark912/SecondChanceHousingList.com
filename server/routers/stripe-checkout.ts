import { TRPCError } from "@trpc/server";
import { z } from "zod";
import Stripe from "stripe";
import { jwtVerify } from "jose";
import { ENV } from "../_core/env";
import { publicProcedure, router } from "../_core/trpc";
import { getPartnerById } from "../partner-auth-service";
import { createLeadPackage, getActiveLeadPackage } from "../partner-db";
import { sendPackagePurchasedEmail } from "../partner-email-service";
import { getDb } from "../db";
import { partnerPrograms } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

const PARTNER_COOKIE = "partner_session";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2026-02-25.clover",
});

// Lead package definitions with Stripe pricing
export const LEAD_PACKAGES = [
  { id: "starter", name: "Starter Package", leads: 10, bonusLeads: 2, price: 5000, pricePerLead: 417 },
  { id: "growth", name: "Growth Package", leads: 25, bonusLeads: 5, price: 10000, pricePerLead: 333 },
  { id: "professional", name: "Professional Package", leads: 75, bonusLeads: 15, price: 25000, pricePerLead: 278 },
  { id: "business", name: "Business Package", leads: 175, bonusLeads: 25, price: 50000, pricePerLead: 250 },
  { id: "enterprise", name: "Enterprise Package", leads: 400, bonusLeads: 50, price: 100000, pricePerLead: 222 },
  { id: "premium", name: "Premium Package", leads: 1800, bonusLeads: 200, price: 400000, pricePerLead: 200 },
];

async function getPartnerFromCtx(ctx: { req: any }): Promise<{ id: number } | null> {
  const token = ctx.req.cookies?.[PARTNER_COOKIE];
  if (!token) return null;
  try {
    const secret = new TextEncoder().encode(ENV.cookieSecret);
    const { payload } = await jwtVerify(token, secret);
    if (payload.type !== "partner" || !payload.sub) return null;
    return { id: parseInt(payload.sub as string, 10) };
  } catch {
    return null;
  }
}

const partnerProcedure = publicProcedure.use(async ({ ctx, next }) => {
  const session = await getPartnerFromCtx(ctx);
  if (!session) throw new TRPCError({ code: "UNAUTHORIZED", message: "Partner login required." });
  const partner = await getPartnerById(session.id);
  if (!partner) throw new TRPCError({ code: "UNAUTHORIZED", message: "Partner not found." });
  return next({ ctx: { ...ctx, partner } });
});

export const stripeCheckoutRouter = router({
  // Create checkout session for a lead package
  createCheckout: partnerProcedure
    .input(z.object({ packageId: z.string(), origin: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const pkg = LEAD_PACKAGES.find((p) => p.id === input.packageId);
      if (!pkg) throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid package." });

      const partner = ctx.partner;
      const totalLeads = pkg.leads + pkg.bonusLeads;

      // Ensure Stripe customer exists
      let customerId = partner.stripeCustomerId;
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: partner.email,
          name: partner.partnerName,
          metadata: { partnerId: String(partner.id) },
        });
        customerId = customer.id;
        const db = await getDb();
        if (db) {
          await db
            .update(partnerPrograms)
            .set({ stripeCustomerId: customerId })
            .where(eq(partnerPrograms.id, partner.id));
        }
      }

      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              unit_amount: pkg.price,
              product_data: {
                name: pkg.name,
                description: `${pkg.leads} leads + ${pkg.bonusLeads} bonus leads = ${totalLeads} total leads (90-day expiration)`,
              },
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        allow_promotion_codes: true,
        client_reference_id: String(partner.id),
        metadata: {
          partner_id: String(partner.id),
          package_id: pkg.id,
          package_name: pkg.name,
          leads_included: String(totalLeads),
          partner_email: partner.email,
          partner_name: partner.partnerName,
        },
        success_url: `${input.origin}/partner/dashboard?payment=success`,
        cancel_url: `${input.origin}/partner/packages?payment=cancelled`,
      });

      return { checkoutUrl: session.url };
    }),

  // Get customer portal URL
  customerPortal: partnerProcedure
    .input(z.object({ origin: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const partner = ctx.partner;
      if (!partner.stripeCustomerId) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "No payment history found." });
      }

      const session = await stripe.billingPortal.sessions.create({
        customer: partner.stripeCustomerId,
        return_url: `${input.origin}/partner/dashboard`,
      });

      return { portalUrl: session.url };
    }),

  // Get available packages
  packages: publicProcedure.query(() => LEAD_PACKAGES),

  // Get partner's active packages
  myPackages: partnerProcedure.query(async ({ ctx }) => {
    return getActiveLeadPackage(ctx.partner.id);
  }),
});
