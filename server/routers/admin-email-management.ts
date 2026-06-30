/**
 * Admin Email Management Router
 * Provides full CRUD for email templates (all audiences) + unified log viewer + stats
 */
import { z } from "zod";
import { adminProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import {
  emailTemplates,
  emailLogs,
  partnerEmailLogs,
  searchSubmissions,
  partnerPrograms,
} from "../../drizzle/schema";
import { desc, eq, and, gte, lte, or, like, count, sql } from "drizzle-orm";
import { sendEmail } from "../email-service";
import { ENV } from "../_core/env";

// ─── Catalogue of every email workflow in the system ─────────────────────────
export const EMAIL_WORKFLOWS = [
  // ── LEAD / PROSPECT workflows ────────────────────────────────────────────
  {
    id: "lead_nurture",
    audience: "lead",
    name: "Lead Nurture Sequence",
    description: "Automated follow-up emails sent to prospects who submitted a housing search but have not yet paid.",
    steps: [
      { order: 1, templateType: "lead_notification_15min", label: "15-Minute Notification", timing: "15 minutes after submission", description: "First touch — let the prospect know their results are ready." },
      { order: 2, templateType: "lead_followup_3days", label: "3-Day Follow-Up", timing: "3 days after submission", description: "Reminder email if the prospect has not yet paid." },
      { order: 3, templateType: "lead_followup_10days", label: "10-Day Final Follow-Up", timing: "10 days after submission", description: "Final follow-up before the lead goes cold." },
    ],
  },
  // ── CUSTOMER workflows ───────────────────────────────────────────────────
  {
    id: "customer_purchase",
    audience: "customer",
    name: "Customer Purchase Flow",
    description: "Emails triggered when a customer completes a payment.",
    steps: [
      { order: 1, templateType: "order_confirmation", label: "Order Confirmation", timing: "Immediately after payment", description: "Confirms the payment and explains next steps." },
      { order: 2, templateType: "rental_results_pdf", label: "Rental Results PDF", timing: "Immediately after payment", description: "Delivers the personalised housing results PDF." },
      { order: 3, templateType: "corporate_leasing_confirmation", label: "Corporate Leasing Confirmation", timing: "Immediately after payment (plan customers)", description: "Sent to customers who chose the In-House Corporate Leasing Program." },
      { order: 4, templateType: "corporate_leasing_followup_3days", label: "Corporate Leasing 3-Day Follow-Up", timing: "3 days after payment", description: "Follow-up for corporate leasing customers." },
    ],
  },
  {
    id: "customer_payment_reminders",
    audience: "customer",
    name: "Payment Reminder Sequence",
    description: "Sent to customers who have not yet completed their donation/payment.",
    steps: [
      { order: 1, templateType: "payment_reminder_1", label: "Reminder #1", timing: "1 day after submission", description: "First payment reminder." },
      { order: 2, templateType: "payment_reminder_2", label: "Reminder #2", timing: "3 days after submission", description: "Second payment reminder." },
      { order: 3, templateType: "payment_reminder_3", label: "Reminder #3", timing: "7 days after submission", description: "Final payment reminder." },
    ],
  },
  {
    id: "customer_abandoned_checkout",
    audience: "customer",
    name: "Abandoned Checkout Recovery",
    description: "Automated emails for customers who started checkout but did not complete payment.",
    steps: [
      { order: 1, templateType: "abandoned_checkout_20min", label: "20-Minute Abandoned Cart", timing: "20 minutes after abandonment", description: "First recovery email." },
      { order: 2, templateType: "abandoned_checkout_3day", label: "3-Day Abandoned Cart", timing: "3 days after abandonment", description: "Second recovery email with urgency." },
    ],
  },
  // ── PARTNER workflows ────────────────────────────────────────────────────
  {
    id: "partner_onboarding",
    audience: "partner",
    name: "Partner Onboarding",
    description: "Emails sent when a new partner signs up and activates their account.",
    steps: [
      { order: 1, templateType: "signup_confirmation", label: "Signup Confirmation", timing: "Immediately after signup", description: "Welcome email with email verification link and code." },
      { order: 2, templateType: "trial_started", label: "Trial Started", timing: "After email verification", description: "Confirms the 20-lead free trial has begun." },
    ],
  },
  {
    id: "partner_leads",
    audience: "partner",
    name: "Lead Delivery",
    description: "Emails sent to partners each time a new lead is delivered.",
    steps: [
      { order: 1, templateType: "trial_lead", label: "Trial Lead", timing: "On each new lead (during trial)", description: "Lead notification with partial contact info during the free trial." },
      { order: 2, templateType: "lead_delivery", label: "Paid Lead", timing: "On each new lead (paid package)", description: "Full lead notification with complete contact info." },
      { order: 3, templateType: "locked_lead", label: "Locked Lead (Post-Trial)", timing: "On each new lead (trial ended, no package)", description: "Lead notification with contact info blocked — prompts upgrade." },
      { order: 4, templateType: "trial_ended", label: "Trial Ended", timing: "When last trial lead is delivered", description: "Notifies partner that their trial has ended and prompts package purchase." },
    ],
  },
  {
    id: "partner_billing",
    audience: "partner",
    name: "Partner Billing",
    description: "Billing-related emails for partners.",
    steps: [
      { order: 1, templateType: "package_purchased", label: "Package Purchased", timing: "After successful Stripe payment", description: "Confirms the lead package purchase and credits." },
      { order: 2, templateType: "package_expired", label: "Package Expired", timing: "When a package expires", description: "Notifies partner that their package has expired." },
      { order: 3, templateType: "low_leads_warning", label: "Low Leads Warning", timing: "When leads remaining < 5", description: "Warns partner they are running low on leads." },
    ],
  },
  {
    id: "partner_account",
    audience: "partner",
    name: "Partner Account",
    description: "Account management emails for partners.",
    steps: [
      { order: 1, templateType: "password_reset", label: "Password Reset", timing: "On password reset request", description: "Contains a one-time password reset link." },
      { order: 2, templateType: "account_status_change", label: "Account Status Change", timing: "When admin changes account status", description: "Notifies partner of suspension, activation, or deactivation." },
    ],
  },
];

// ─── Default HTML bodies for seeding ─────────────────────────────────────────
const DEFAULT_TEMPLATES: Record<string, { subject: string; audience: string; description: string; bodyHtml: string }> = {
  lead_notification_15min: {
    subject: "Your Second Chance Housing Search Results Are Ready!",
    audience: "lead",
    description: "Sent 15 minutes after a prospect submits a housing search form.",
    bodyHtml: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
<div style="background:#003366;color:white;padding:20px;text-align:center;border-radius:8px 8px 0 0">
  <h1 style="margin:0">Your Housing Results Are Ready!</h1>
</div>
<div style="background:#f9f9f9;padding:24px;border-radius:0 0 8px 8px">
  <p>Hi {{customerName}},</p>
  <p>Great news! We've found Second Chance housing options in <strong>{{city}}, {{state}}</strong> that match your profile.</p>
  <p>Your personalised list includes landlords and properties that work with renters who have credit challenges like yours.</p>
  <div style="text-align:center;margin:24px 0">
    <a href="{{checkoutLink}}" style="background:#0066cc;color:white;padding:14px 32px;text-decoration:none;border-radius:6px;font-weight:bold;font-size:16px">View My Results →</a>
  </div>
  <p style="font-size:13px;color:#666">This link expires in 48 hours. Don't miss your chance to find housing today.</p>
  <p>Best regards,<br/><strong>Second Chance Housing List Team</strong></p>
</div>
</div>`,
  },
  lead_followup_3days: {
    subject: "Still Looking for Housing? Your Results Are Waiting",
    audience: "lead",
    description: "Sent 3 days after submission if the prospect has not yet paid.",
    bodyHtml: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
<div style="background:#003366;color:white;padding:20px;text-align:center;border-radius:8px 8px 0 0">
  <h1 style="margin:0">Still Looking for Housing?</h1>
</div>
<div style="background:#f9f9f9;padding:24px;border-radius:0 0 8px 8px">
  <p>Hi {{customerName}},</p>
  <p>We noticed you haven't accessed your Second Chance Housing results yet. Your personalised list for <strong>{{city}}, {{state}}</strong> is still waiting for you.</p>
  <p>Don't let credit challenges stop you from finding a great place to live. Our network of landlords works with renters in your situation every day.</p>
  <div style="text-align:center;margin:24px 0">
    <a href="{{checkoutLink}}" style="background:#0066cc;color:white;padding:14px 32px;text-decoration:none;border-radius:6px;font-weight:bold;font-size:16px">Access My Results Now →</a>
  </div>
  <p>Best regards,<br/><strong>Second Chance Housing List Team</strong></p>
</div>
</div>`,
  },
  lead_followup_10days: {
    subject: "Final Notice: Your Housing Search Results Expire Soon",
    audience: "lead",
    description: "Sent 10 days after submission — final follow-up before the lead goes cold.",
    bodyHtml: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
<div style="background:#cc3300;color:white;padding:20px;text-align:center;border-radius:8px 8px 0 0">
  <h1 style="margin:0">⚠️ Final Notice — Results Expiring</h1>
</div>
<div style="background:#f9f9f9;padding:24px;border-radius:0 0 8px 8px">
  <p>Hi {{customerName}},</p>
  <p>This is our final reminder. Your Second Chance Housing results for <strong>{{city}}, {{state}}</strong> are about to expire.</p>
  <p>After today, we cannot guarantee these landlords will still have availability. Act now to secure your housing options.</p>
  <div style="text-align:center;margin:24px 0">
    <a href="{{checkoutLink}}" style="background:#cc3300;color:white;padding:14px 32px;text-decoration:none;border-radius:6px;font-weight:bold;font-size:16px">Claim My Results Before They Expire →</a>
  </div>
  <p>Best regards,<br/><strong>Second Chance Housing List Team</strong></p>
</div>
</div>`,
  },
  order_confirmation: {
    subject: "Order Confirmed — Second Chance Housing List",
    audience: "customer",
    description: "Sent immediately after a customer completes payment.",
    bodyHtml: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
<div style="background:#003366;color:white;padding:20px;text-align:center;border-radius:8px 8px 0 0">
  <h1 style="margin:0">✅ Order Confirmed!</h1>
</div>
<div style="background:#f9f9f9;padding:24px;border-radius:0 0 8px 8px">
  <p>Hi {{customerName}},</p>
  <p>Thank you for your order! Your payment has been received and your personalised Second Chance Housing results are being prepared.</p>
  <p>You will receive your results PDF shortly at this email address.</p>
  <p>Best regards,<br/><strong>Second Chance Housing List Team</strong></p>
</div>
</div>`,
  },
  signup_confirmation: {
    subject: "Welcome to the Partnership Program — Verify Your Email",
    audience: "partner",
    description: "Sent immediately when a new partner signs up. Contains email verification link.",
    bodyHtml: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
<div style="background:#003366;color:white;padding:20px;text-align:center;border-radius:8px 8px 0 0">
  <h1 style="margin:0">Welcome to the Partnership Program!</h1>
</div>
<div style="background:#f9f9f9;padding:24px;border-radius:0 0 8px 8px">
  <p>Hi {{partnerName}},</p>
  <p>Thank you for signing up for the Second Chance Housing List Partnership Program! We're excited to work with <strong>{{businessName}}</strong>.</p>
  <h3>Verify Your Email Address</h3>
  <div style="text-align:center;margin:20px 0">
    <a href="{{verificationLink}}" style="background:#0066cc;color:white;padding:14px 32px;text-decoration:none;border-radius:6px;font-weight:bold">Verify Email Address →</a>
  </div>
  <p>Or enter this code on the verification page:</p>
  <div style="background:#e8f4f8;padding:16px;border-radius:6px;font-family:monospace;font-size:24px;text-align:center;letter-spacing:4px;font-weight:bold">{{verificationCode}}</div>
  <p>After verification you will receive <strong>20 free trial leads</strong> to test our service.</p>
  <p>Best regards,<br/><strong>Second Chance Housing List Partnership Team</strong></p>
</div>
</div>`,
  },
  trial_started: {
    subject: "Your 20-Lead Free Trial Has Started!",
    audience: "partner",
    description: "Sent after a partner saves their card and activates their trial.",
    bodyHtml: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
<div style="background:#006633;color:white;padding:20px;text-align:center;border-radius:8px 8px 0 0">
  <h1 style="margin:0">🎉 Your Free Trial Has Started!</h1>
</div>
<div style="background:#f9f9f9;padding:24px;border-radius:0 0 8px 8px">
  <p>Hi {{partnerName}},</p>
  <p>Your 20-lead free trial is now active. You will start receiving leads as soon as renters submit their housing profiles in your area.</p>
  <p>Each lead includes the renter's city, state, housing type, bedroom count, income, and credit challenges — everything you need to assess fit before reaching out.</p>
  <div style="text-align:center;margin:20px 0">
    <a href="{{dashboardLink}}" style="background:#006633;color:white;padding:14px 32px;text-decoration:none;border-radius:6px;font-weight:bold">Go to My Dashboard →</a>
  </div>
  <p>Best regards,<br/><strong>Second Chance Housing List Partnership Team</strong></p>
</div>
</div>`,
  },
  trial_lead: {
    subject: "New Lead Alert — {{city}}, {{state}}",
    audience: "partner",
    description: "Sent to partners for each new lead during their free trial. Contact info is partially hidden.",
    bodyHtml: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
<div style="background:#003366;color:white;padding:20px;text-align:center;border-radius:8px 8px 0 0">
  <h1 style="margin:0">🏠 New Lead — Trial</h1>
</div>
<div style="background:#f9f9f9;padding:24px;border-radius:0 0 8px 8px">
  <p>Hi {{partnerName}},</p>
  <p>A new renter is looking for housing in <strong>{{city}}, {{state}}</strong>.</p>
  <table style="width:100%;border-collapse:collapse;margin:16px 0">
    <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold">Location</td><td style="padding:8px;border-bottom:1px solid #eee">{{city}}, {{state}}</td></tr>
    <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold">Housing Type</td><td style="padding:8px;border-bottom:1px solid #eee">{{housingType}}</td></tr>
    <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold">Bedrooms</td><td style="padding:8px;border-bottom:1px solid #eee">{{bedrooms}}</td></tr>
    <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold">Monthly Income</td><td style="padding:8px;border-bottom:1px solid #eee">{{monthlyIncome}}</td></tr>
    <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold">Name</td><td style="padding:8px;border-bottom:1px solid #eee;color:#999">🔒 Unlock with paid package</td></tr>
    <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold">Phone</td><td style="padding:8px;border-bottom:1px solid #eee;color:#999">🔒 Unlock with paid package</td></tr>
    <tr><td style="padding:8px;font-weight:bold">Email</td><td style="padding:8px;color:#999">🔒 Unlock with paid package</td></tr>
  </table>
  <p>This is trial lead <strong>#{{leadNumber}}</strong>. You have <strong>{{leadsRemaining}}</strong> trial leads remaining.</p>
  <div style="text-align:center;margin:20px 0">
    <a href="{{upgradeLink}}" style="background:#0066cc;color:white;padding:14px 32px;text-decoration:none;border-radius:6px;font-weight:bold">Upgrade to See Full Contact Info →</a>
  </div>
  <p>Best regards,<br/><strong>Second Chance Housing List Partnership Team</strong></p>
</div>
</div>`,
  },
  lead_delivery: {
    subject: "New Lead — {{city}}, {{state}} (Full Contact Info)",
    audience: "partner",
    description: "Sent to partners for each new lead on a paid package. Includes full contact information.",
    bodyHtml: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
<div style="background:#006633;color:white;padding:20px;text-align:center;border-radius:8px 8px 0 0">
  <h1 style="margin:0">🏠 New Lead — Full Details</h1>
</div>
<div style="background:#f9f9f9;padding:24px;border-radius:0 0 8px 8px">
  <p>Hi {{partnerName}},</p>
  <p>A new renter is looking for housing in <strong>{{city}}, {{state}}</strong>. Here are their full details:</p>
  <table style="width:100%;border-collapse:collapse;margin:16px 0">
    <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold">Name</td><td style="padding:8px;border-bottom:1px solid #eee">{{customerName}}</td></tr>
    <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold">Phone</td><td style="padding:8px;border-bottom:1px solid #eee">{{customerPhone}}</td></tr>
    <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold">Email</td><td style="padding:8px;border-bottom:1px solid #eee">{{customerEmail}}</td></tr>
    <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold">Location</td><td style="padding:8px;border-bottom:1px solid #eee">{{city}}, {{state}}</td></tr>
    <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold">Housing Type</td><td style="padding:8px;border-bottom:1px solid #eee">{{housingType}}</td></tr>
    <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold">Bedrooms</td><td style="padding:8px;border-bottom:1px solid #eee">{{bedrooms}}</td></tr>
    <tr><td style="padding:8px;font-weight:bold">Monthly Income</td><td style="padding:8px">{{monthlyIncome}}</td></tr>
  </table>
  <p>You have <strong>{{leadsRemaining}}</strong> leads remaining in your package.</p>
  <p>Best regards,<br/><strong>Second Chance Housing List Partnership Team</strong></p>
</div>
</div>`,
  },
  locked_lead: {
    subject: "New Lead Waiting — Upgrade to Unlock Contact Info",
    audience: "partner",
    description: "Sent after trial ends. Lead data is shown but contact info is blocked.",
    bodyHtml: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
<div style="background:#cc6600;color:white;padding:20px;text-align:center;border-radius:8px 8px 0 0">
  <h1 style="margin:0">🔒 New Lead — Contact Info Locked</h1>
</div>
<div style="background:#fff8f0;padding:24px;border:2px solid #ffcc80;border-radius:0 0 8px 8px">
  <p>Hi {{partnerName}},</p>
  <p>A new renter is looking for housing in <strong>{{city}}, {{state}}</strong> — but your free trial has ended. Activate a lead package to unlock their contact information.</p>
  <table style="width:100%;border-collapse:collapse;margin:16px 0">
    <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold">Location</td><td style="padding:8px;border-bottom:1px solid #eee">{{city}}, {{state}}</td></tr>
    <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold">Housing Type</td><td style="padding:8px;border-bottom:1px solid #eee">{{housingType}}</td></tr>
    <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold">Bedrooms</td><td style="padding:8px;border-bottom:1px solid #eee">{{bedrooms}}</td></tr>
    <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold">Name</td><td style="padding:8px;border-bottom:1px solid #eee;color:#cc6600;font-weight:bold">🔒 Locked</td></tr>
    <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold">Phone</td><td style="padding:8px;border-bottom:1px solid #eee;color:#cc6600;font-weight:bold">🔒 Locked</td></tr>
    <tr><td style="padding:8px;font-weight:bold">Email</td><td style="padding:8px;color:#cc6600;font-weight:bold">🔒 Locked</td></tr>
  </table>
  <p>You have <strong>{{lockedLeadsCount}}</strong> locked leads waiting. Activate a package to unlock all of them instantly.</p>
  <div style="text-align:center;margin:20px 0">
    <a href="{{upgradeLink}}" style="background:#cc6600;color:white;padding:14px 32px;text-decoration:none;border-radius:6px;font-weight:bold;font-size:16px">Activate Package &amp; Unlock All Leads →</a>
  </div>
  <p>Best regards,<br/><strong>Second Chance Housing List Partnership Team</strong></p>
</div>
</div>`,
  },
  trial_ended: {
    subject: "Your Free Trial Has Ended — Activate a Package to Keep Receiving Leads",
    audience: "partner",
    description: "Sent when the last trial lead is delivered and trialEnded is set to true.",
    bodyHtml: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
<div style="background:#cc3300;color:white;padding:20px;text-align:center;border-radius:8px 8px 0 0">
  <h1 style="margin:0">Your Free Trial Has Ended</h1>
</div>
<div style="background:#f9f9f9;padding:24px;border-radius:0 0 8px 8px">
  <p>Hi {{partnerName}},</p>
  <p>You have used all 20 of your free trial leads. We hope the trial gave you a good sense of the quality and volume of leads we deliver.</p>
  <p>The good news: <strong>leads will keep coming in</strong>. Activate a package today to unlock full contact information and continue growing your business.</p>
  <div style="text-align:center;margin:24px 0">
    <a href="{{upgradeLink}}" style="background:#cc3300;color:white;padding:14px 32px;text-decoration:none;border-radius:6px;font-weight:bold;font-size:16px">Activate a Lead Package →</a>
  </div>
  <p>Best regards,<br/><strong>Second Chance Housing List Partnership Team</strong></p>
</div>
</div>`,
  },
  package_purchased: {
    subject: "Lead Package Activated — You're Ready to Receive Leads!",
    audience: "partner",
    description: "Sent after a partner successfully purchases a lead package.",
    bodyHtml: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
<div style="background:#006633;color:white;padding:20px;text-align:center;border-radius:8px 8px 0 0">
  <h1 style="margin:0">✅ Package Activated!</h1>
</div>
<div style="background:#f9f9f9;padding:24px;border-radius:0 0 8px 8px">
  <p>Hi {{partnerName}},</p>
  <p>Your <strong>{{packageName}}</strong> has been activated. You now have <strong>{{leadsRemaining}}</strong> leads ready to be delivered.</p>
  <p>Leads will be sent to this email address as soon as renters submit their profiles.</p>
  <div style="text-align:center;margin:20px 0">
    <a href="{{dashboardLink}}" style="background:#006633;color:white;padding:14px 32px;text-decoration:none;border-radius:6px;font-weight:bold">Go to My Dashboard →</a>
  </div>
  <p>Best regards,<br/><strong>Second Chance Housing List Partnership Team</strong></p>
</div>
</div>`,
  },
  package_expired: {
    subject: "Your Lead Package Has Expired",
    audience: "partner",
    description: "Sent when a partner's lead package expires.",
    bodyHtml: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
<div style="background:#666;color:white;padding:20px;text-align:center;border-radius:8px 8px 0 0">
  <h1 style="margin:0">Your Package Has Expired</h1>
</div>
<div style="background:#f9f9f9;padding:24px;border-radius:0 0 8px 8px">
  <p>Hi {{partnerName}},</p>
  <p>Your lead package has expired. To continue receiving leads, please purchase a new package from your dashboard.</p>
  <div style="text-align:center;margin:20px 0">
    <a href="{{upgradeLink}}" style="background:#0066cc;color:white;padding:14px 32px;text-decoration:none;border-radius:6px;font-weight:bold">Purchase New Package →</a>
  </div>
  <p>Best regards,<br/><strong>Second Chance Housing List Partnership Team</strong></p>
</div>
</div>`,
  },
  low_leads_warning: {
    subject: "⚠️ You're Running Low on Leads",
    audience: "partner",
    description: "Sent when a partner has fewer than 5 leads remaining in their package.",
    bodyHtml: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
<div style="background:#cc6600;color:white;padding:20px;text-align:center;border-radius:8px 8px 0 0">
  <h1 style="margin:0">⚠️ Running Low on Leads</h1>
</div>
<div style="background:#fff8f0;padding:24px;border:1px solid #ffcc80;border-radius:0 0 8px 8px">
  <p>Hi {{partnerName}},</p>
  <p>You only have <strong>{{leadsRemaining}} leads</strong> remaining. Top up now to make sure you don't miss any incoming renters.</p>
  <div style="text-align:center;margin:20px 0">
    <a href="{{upgradeLink}}" style="background:#cc6600;color:white;padding:14px 32px;text-decoration:none;border-radius:6px;font-weight:bold">Top Up Leads →</a>
  </div>
  <p>Best regards,<br/><strong>Second Chance Housing List Partnership Team</strong></p>
</div>
</div>`,
  },
  password_reset: {
    subject: "Reset Your Password — Second Chance Housing List",
    audience: "partner",
    description: "Sent when a partner requests a password reset.",
    bodyHtml: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
<div style="background:#003366;color:white;padding:20px;text-align:center;border-radius:8px 8px 0 0">
  <h1 style="margin:0">Reset Your Password</h1>
</div>
<div style="background:#f9f9f9;padding:24px;border-radius:0 0 8px 8px">
  <p>Hi {{partnerName}},</p>
  <p>We received a request to reset your password. Click the button below to set a new password. This link expires in 1 hour.</p>
  <div style="text-align:center;margin:20px 0">
    <a href="{{resetLink}}" style="background:#0066cc;color:white;padding:14px 32px;text-decoration:none;border-radius:6px;font-weight:bold">Reset My Password →</a>
  </div>
  <p>If you did not request a password reset, you can safely ignore this email.</p>
  <p>Best regards,<br/><strong>Second Chance Housing List Partnership Team</strong></p>
</div>
</div>`,
  },
};

// ─── Router ───────────────────────────────────────────────────────────────────
export const adminEmailManagementRouter = router({
  /**
   * Get all email workflows (static catalogue)
   */
  getWorkflows: adminProcedure.query(() => {
    return EMAIL_WORKFLOWS;
  }),

  /**
   * Get all templates from DB; seed defaults if empty
   */
  getAllTemplates: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("DB unavailable");

    let rows = await db.select().from(emailTemplates).orderBy(emailTemplates.audience, emailTemplates.templateType);

    // Auto-seed defaults if table is empty
    if (rows.length === 0) {
      const adminUser = await db.execute(sql`SELECT id FROM users WHERE role = 'admin' LIMIT 1`);
      const adminId = (adminUser as any)[0]?.[0]?.id ?? 1;

      for (const [type, tpl] of Object.entries(DEFAULT_TEMPLATES)) {
        await db.insert(emailTemplates).ignore().values({
          templateType: type,
          audience: tpl.audience as any,
          templateName: tpl.subject.replace(/[^a-zA-Z0-9 ]/g, "").trim().slice(0, 80),
          description: tpl.description,
          subject: tpl.subject,
          bodyHtml: tpl.bodyHtml,
          isActive: true,
          isDefault: true,
          ctaText: "View Details",
          ctaButtonColor: "#0066cc",
          createdBy: adminId,
        } as any);
      }
      rows = await db.select().from(emailTemplates).orderBy(emailTemplates.audience, emailTemplates.templateType);
    }

    return rows;
  }),

  /**
   * Get single template by ID
   */
  getTemplateById: adminProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      const [row] = await db.select().from(emailTemplates).where(eq(emailTemplates.id, input.id)).limit(1);
      return row ?? null;
    }),

  /**
   * Update a template (subject, bodyHtml, bodyText, ctaText, ctaButtonColor, isActive)
   */
  updateTemplate: adminProcedure
    .input(z.object({
      id: z.number(),
      templateName: z.string().optional(),
      description: z.string().optional(),
      subject: z.string().optional(),
      preheader: z.string().optional(),
      bodyHtml: z.string().optional(),
      bodyText: z.string().optional(),
      ctaText: z.string().optional(),
      ctaButtonColor: z.string().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      const { id, ...data } = input;
      await db.update(emailTemplates).set(data as any).where(eq(emailTemplates.id, id));
      return { success: true };
    }),

  /**
   * Send a test email using a template
   */
  sendTestEmail: adminProcedure
    .input(z.object({
      templateId: z.number(),
      toEmail: z.string().email(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      const [tpl] = await db.select().from(emailTemplates).where(eq(emailTemplates.id, input.templateId)).limit(1);
      if (!tpl) throw new Error("Template not found");

      // Replace all {{variable}} placeholders with sample values
      const sampleVars: Record<string, string> = {
        customerName: "Jane Smith",
        partnerName: "Alex Johnson",
        businessName: "Premier Housing Solutions",
        city: "Atlanta",
        state: "GA",
        housingType: "Apartment",
        bedrooms: "2",
        monthlyIncome: "$3,500",
        creditChallenges: "Eviction, Low Credit Score",
        leadNumber: "5",
        leadsRemaining: "15",
        lockedLeadsCount: "3",
        verificationCode: "847291",
        verificationLink: "https://secondchancehousinglocator.com/partnership/verify?code=847291",
        resetLink: "https://secondchancehousinglocator.com/partner/reset-password?token=sample",
        checkoutLink: "https://secondchancehousinglocator.com/checkout",
        dashboardLink: "https://secondchancehousinglocator.com/partner/dashboard",
        upgradeLink: "https://secondchancehousinglocator.com/partnership/dashboard-enhanced",
        packageName: "50-Lead Package",
        renterId: "SCH-2026-001",
        caseManager: "George Williams",
        propertyAddress: "123 Main St, Atlanta, GA 30301",
        customerPhone: "(404) 555-0123",
        customerEmail: "jane.smith@example.com",
      };

      let subject = tpl.subject;
      let bodyHtml = tpl.bodyHtml;
      for (const [key, val] of Object.entries(sampleVars)) {
        const re = new RegExp(`\\{\\{${key}\\}\\}`, "g");
        subject = subject.replace(re, val);
        bodyHtml = bodyHtml.replace(re, val);
      }

      const sent = await sendEmail({ to: input.toEmail, subject, html: bodyHtml });
      if (!sent) throw new Error("Failed to send test email — check Gmail credentials");
      return { success: true, message: `Test email sent to ${input.toEmail}` };
    }),

  /**
   * Unified email log: combines email_logs (customer/lead) + partner_email_logs
   */
  getEmailLogs: adminProcedure
    .input(z.object({
      audience: z.enum(["all", "customer", "lead", "partner"]).default("all"),
      status: z.enum(["all", "sent", "failed", "bounced", "opened", "clicked"]).default("all"),
      search: z.string().optional(),
      limit: z.number().min(1).max(200).default(50),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");

      const results: any[] = [];

      // ── Customer/Lead logs from email_logs ──────────────────────────────
      if (input.audience === "all" || input.audience === "customer" || input.audience === "lead") {
        const conditions: any[] = [];
        if (input.status !== "all") conditions.push(eq(emailLogs.status, input.status as any));
        if (input.search) conditions.push(
          or(
            like(emailLogs.recipientEmail, `%${input.search}%`),
            like(emailLogs.recipientName, `%${input.search}%`),
            like(emailLogs.subject, `%${input.search}%`),
          )
        );

        const rows = await db
          .select()
          .from(emailLogs)
          .where(conditions.length > 0 ? and(...conditions) : undefined)
          .orderBy(desc(emailLogs.sentAt))
          .limit(input.limit)
          .offset(input.offset);

        for (const r of rows) {
          results.push({
            id: `el-${r.id}`,
            audience: r.emailType === "pdf_delivery" || r.emailType === "order_confirmation" ? "customer" : "lead",
            emailType: r.emailType,
            recipientEmail: r.recipientEmail,
            recipientName: r.recipientName ?? "",
            subject: r.subject,
            status: r.status,
            sentAt: r.sentAt,
            failureReason: r.failureReason ?? null,
            body: r.body ?? null,
          });
        }
      }

      // ── Partner logs from partner_email_logs ────────────────────────────
      if (input.audience === "all" || input.audience === "partner") {
        const conditions: any[] = [];
        if (input.status !== "all") {
          const validStatuses = ["sent", "failed", "bounced"];
          if (validStatuses.includes(input.status)) {
            conditions.push(eq(partnerEmailLogs.status, input.status as any));
          }
        }
        if (input.search) conditions.push(
          or(
            like(partnerEmailLogs.recipientEmail, `%${input.search}%`),
            like(partnerEmailLogs.subject, `%${input.search}%`),
          )
        );

        const rows = await db
          .select({
            log: partnerEmailLogs,
            partnerName: partnerPrograms.partnerName,
            businessName: partnerPrograms.businessName,
          })
          .from(partnerEmailLogs)
          .leftJoin(partnerPrograms, eq(partnerEmailLogs.partnerId, partnerPrograms.id))
          .where(conditions.length > 0 ? and(...conditions) : undefined)
          .orderBy(desc(partnerEmailLogs.sentAt))
          .limit(input.limit)
          .offset(input.offset);

        for (const r of rows) {
          results.push({
            id: `pel-${r.log.id}`,
            audience: "partner",
            emailType: r.log.emailType,
            recipientEmail: r.log.recipientEmail,
            recipientName: r.partnerName ?? r.businessName ?? "",
            subject: r.log.subject,
            status: r.log.status,
            sentAt: r.log.sentAt,
            failureReason: r.log.failureReason ?? null,
            body: r.log.body ?? null,
            partnerId: r.log.partnerId,
          });
        }
      }

      // Sort combined results by sentAt desc
      results.sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());

      return {
        logs: results.slice(0, input.limit),
        total: results.length,
      };
    }),

  /**
   * Email delivery statistics per template type
   */
  getEmailStats: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("DB unavailable");

    // Stats from email_logs
    const customerStats = await db
      .select({
        emailType: emailLogs.emailType,
        status: emailLogs.status,
        cnt: count(),
      })
      .from(emailLogs)
      .groupBy(emailLogs.emailType, emailLogs.status);

    // Stats from partner_email_logs
    const partnerStats = await db
      .select({
        emailType: partnerEmailLogs.emailType,
        status: partnerEmailLogs.status,
        cnt: count(),
      })
      .from(partnerEmailLogs)
      .groupBy(partnerEmailLogs.emailType, partnerEmailLogs.status);

    // Merge into a map
    const statsMap: Record<string, { sent: number; failed: number; bounced: number; opened: number; clicked: number; total: number; audience: string }> = {};

    const merge = (rows: { emailType: string; status: string; cnt: number }[], audience: string) => {
      for (const r of rows) {
        if (!statsMap[r.emailType]) {
          statsMap[r.emailType] = { sent: 0, failed: 0, bounced: 0, opened: 0, clicked: 0, total: 0, audience };
        }
        const key = r.status as keyof typeof statsMap[string];
        if (key in statsMap[r.emailType]) {
          (statsMap[r.emailType] as any)[key] += Number(r.cnt);
        }
        statsMap[r.emailType].total += Number(r.cnt);
      }
    };

    merge(customerStats.map(r => ({ emailType: String(r.emailType), status: String(r.status), cnt: Number(r.cnt) })), "customer");
    merge(partnerStats.map(r => ({ emailType: String(r.emailType), status: String(r.status), cnt: Number(r.cnt) })), "partner");

    return Object.entries(statsMap).map(([type, stats]) => ({
      emailType: type,
      ...stats,
      deliveryRate: stats.total > 0 ? Math.round((stats.sent / stats.total) * 100) : 0,
    }));
  }),
});
