import Stripe from "stripe";
import { sendPaymentReceipt } from "./email-receipt-service";

function getPaymentMethodName(methodType?: string): string {
  if (!methodType) return "Credit/Debit Card";
  const names: Record<string, string> = {
    card: "Credit/Debit Card",
    link: "Stripe Link",
  };
  return names[methodType] || methodType.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2026-01-28.clover" as any,
});

export interface CheckoutSessionParams {
  amount: number; // in cents
  customerEmail: string;
  customerName: string;
  orderId: number;
  submissionId: number;
  successUrl: string;
  cancelUrl: string;
  isFlexiblePayment?: boolean;
  isPaymentPlan?: boolean; // True if payment plan is selected
  searchData?: any;
  donationAmount?: number;
  includeCorporateLeasing?: boolean;
}

export async function createCheckoutSession(
  params: CheckoutSessionParams
): Promise<{ url: string; sessionId: string } | null> {
  try {
    console.log("[Stripe] Creating session with params:", {
      amount: params.amount,
      donationAmount: params.donationAmount,
      includeCorporateLeasing: params.includeCorporateLeasing,
    });

    const lineItems = [
      ...(params.donationAmount && params.donationAmount > 0 ? [{
        price_data: {
          currency: "usd",
          product_data: {
            name: "Donation to Support Second Chance Housing",
            description:
              "Support our mission to help credit-challenged renters find housing",
            images: [],
          },
          unit_amount: params.donationAmount, // Already in cents from client
        },
        quantity: 1,
      }] : []),
      ...(params.includeCorporateLeasing ? [{
        price_data: {
          currency: "usd",
          product_data: {
            name: params.isPaymentPlan ? "In-House Corporate Leasing Program - Payment Plan Down Payment" : "In-House Corporate Leasing Program - Down Payment",
            description: params.isPaymentPlan 
              ? "Corporate leasing using our business credit + build your rental history. Down payment of $500 (flexible payment plan: $250 after property selection + $500/month for 10 months)"
              : "Corporate leasing using our business credit + build your rental history. Down payment of $1,000 (final payment of $250 after property selection)",
            images: [],
          },
          unit_amount: params.amount, // Use the amount passed from frontend
        },
        quantity: 1,
      }] : []),
    ];

    if (lineItems.length === 0) {
      throw new Error("No line items to charge");
    }

    console.log("[Stripe] Line items:", lineItems.length, "items");

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card", "link"],
      line_items: lineItems,
      mode: "payment",
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      customer_email: params.customerEmail,
      metadata: {
        orderId: params.orderId ? params.orderId.toString() : "0",
        submissionId: params.submissionId ? params.submissionId.toString() : "0",
        customerName: params.customerName,
        isFlexiblePayment: params.isFlexiblePayment ? "true" : "false",
        isPaymentPlan: params.isPaymentPlan ? "true" : "false",
        searchData: params.searchData ? JSON.stringify(params.searchData) : "{}",
        donationAmount: params.donationAmount?.toString() || "0",
        includeCorporateLeasing: params.includeCorporateLeasing ? "true" : "false",
      },
      payment_intent_data: {
        metadata: {
          orderId: params.orderId ? params.orderId.toString() : "0",
          submissionId: params.submissionId ? params.submissionId.toString() : "0",
          customerName: params.customerName,
        isFlexiblePayment: params.isFlexiblePayment ? "true" : "false",
        isPaymentPlan: params.isPaymentPlan ? "true" : "false",
        searchData: params.searchData ? JSON.stringify(params.searchData) : "{}",
        donationAmount: params.donationAmount?.toString() || "0",
        includeCorporateLeasing: params.includeCorporateLeasing ? "true" : "false",
      },
      },
    } as any);

    console.log("[Stripe] Session created successfully:", { sessionId: session.id, hasUrl: !!session.url });
    return { url: session.url || "", sessionId: session.id };
  } catch (error) {
    console.error("[Stripe] Error creating checkout session:", error);
    throw error;
  }
}

export async function retrieveSession(
  sessionId: string
): Promise<Stripe.Checkout.Session | null> {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    return session;
  } catch (error) {
    console.error("Error retrieving session:", error);
    return null;
  }
}

export async function handleWebhookEvent(
  event: Stripe.Event
): Promise<{ success: boolean; message: string }> {
  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log("Payment successful:", session.id);
        console.log("Customer email:", session.customer_email);
        console.log("Metadata:", session.metadata);
        console.log("Payment method types:", session.payment_method_types);

        // Send payment receipt email
        if (session.customer_email && session.metadata) {
          const receiptData = {
            email: session.customer_email,
            fullName: session.metadata.customerName || "Valued Customer",
            orderId: session.metadata.orderId || session.id,
            amount: (session.amount_total || 0) / 100,
            paymentMethod: getPaymentMethodName(session.payment_method_types?.[0]),
            date: new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            }),
            pdfUrl: `/api/download-housing-list?orderId=${session.metadata.orderId}`,
            itemsCount: 50,
          };
          await sendPaymentReceipt(receiptData).catch((err) => {
            console.error("Failed to send payment receipt:", err);
          });
        }

        // Return success - the webhook handler will update the order
        return {
          success: true,
          message: "Payment processed successfully",
        };
      }

      case "charge.succeeded": {
        const charge = event.data.object as Stripe.Charge;
        console.log("Charge succeeded:", charge.id);
        console.log("Payment method:", charge.payment_method_details?.type);
        return {
          success: true,
          message: "Charge processed",
        };
      }

      case "charge.failed": {
        const charge = event.data.object as Stripe.Charge;
        console.error("Charge failed:", charge.id);
        console.error("Payment method:", charge.payment_method_details?.type);
        return {
          success: false,
          message: "Charge failed",
        };
      }

      default:
        console.log("Unhandled event type:", event.type);
        return {
          success: true,
          message: "Event received",
        };
    }
  } catch (error) {
    console.error("Error handling webhook event:", error);
    return {
      success: false,
      message: "Error processing webhook",
    };
  }
}

export function constructWebhookEvent(
  body: string,
  signature: string
): Stripe.Event | null {
  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    return event;
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return null;
  }
}
