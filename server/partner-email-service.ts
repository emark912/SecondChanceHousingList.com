/**
 * Partnership Program Email Service
 * Handles all email communications with partner programs
 */

import nodemailer from "nodemailer";
import { ENV } from "./_core/env";
import { logPartnerEmail } from "./partner-db";

// Create Gmail transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: ENV.gmailEmail,
    pass: ENV.gmailAppPassword,
  },
});

export interface PartnerEmailOptions {
  to: string;
  subject: string;
  html: string;
  partnerId?: number;
  emailType?: string;
}

export async function sendPartnerEmail(options: PartnerEmailOptions): Promise<boolean> {
  try {
    await transporter.sendMail({
      from: ENV.gmailEmail,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    // Log the email
    if (options.partnerId && options.emailType) {
      await logPartnerEmail({
        partnerId: options.partnerId,
        emailType: options.emailType as any,
        recipientEmail: options.to,
        subject: options.subject,
        body: options.html,
        status: "sent",
      });
    }

    console.log("[Partner Email] Email sent successfully to:", options.to);
    return true;
  } catch (error) {
    console.error("[Partner Email] Failed to send email:", error);
    
    // Log the failed email
    if (options.partnerId && options.emailType) {
      await logPartnerEmail({
        partnerId: options.partnerId,
        emailType: options.emailType as any,
        recipientEmail: options.to,
        subject: options.subject,
        body: options.html,
        status: "failed",
        failureReason: String(error),
      });
    }

    return false;
  }
}

/**
 * Send signup confirmation email to new partner
 */
export async function sendSignupConfirmationEmail(
  partnerName: string,
  businessName: string,
  email: string,
  verificationCode: string,
  partnerId: number
): Promise<boolean> {
  const verificationLink = `https://secondchance-3gdukdvh.manus.space/partnership/verify?code=${verificationCode}&email=${encodeURIComponent(email)}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #003366; color: white; padding: 20px; text-align: center; border-radius: 5px; }
          .content { padding: 20px; background-color: #f9f9f9; margin: 20px 0; border-radius: 5px; }
          .cta-button { display: inline-block; background-color: #0066cc; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 10px 0; font-weight: bold; }
          .code { background-color: #e8f4f8; padding: 15px; border-radius: 5px; font-family: monospace; font-size: 18px; text-align: center; letter-spacing: 2px; }
          .footer { text-align: center; font-size: 12px; color: #666; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Our Partnership Program!</h1>
          </div>

          <div class="content">
            <p>Hi ${partnerName},</p>

            <p>Thank you for signing up for our Second Chance Program Partnership Program! We're excited to work with <strong>${businessName}</strong> to help credit-challenged renters find housing solutions.</p>

            <h2>Verify Your Email Address</h2>
            <p>To activate your account and start receiving leads, please verify your email address by clicking the button below:</p>

            <div style="text-align: center;">
              <a href="${verificationLink}" class="cta-button">Verify Email Address</a>
            </div>

            <p>Or use this verification code:</p>
            <div class="code">${verificationCode}</div>

            <h2>What Happens Next?</h2>
            <ol>
              <li><strong>Email Verification:</strong> Click the link above to verify your email</li>
              <li><strong>Free Trial:</strong> You'll receive 20 FREE leads to test our service</li>
              <li><strong>Lead Packages:</strong> After the trial, purchase lead packages to continue receiving leads</li>
              <li><strong>Instant Delivery:</strong> Leads are sent to you as soon as renters submit their profiles</li>
            </ol>

            <h2>Partnership Program Benefits</h2>
            <ul>
              <li>✓ Access to hot leads from credit-challenged renters actively seeking housing</li>
              <li>✓ Detailed rental profile data (without direct contact info until purchased)</li>
              <li>✓ Affordable lead packages starting at \$5 per lead</li>
              <li>✓ Bonus leads: Get 5 extra leads with every package to account for bad leads</li>
              <li>✓ Instant notifications when new leads match your criteria</li>
              <li>✓ Easy-to-use partner dashboard</li>
            </ul>

            <h2>Questions?</h2>
            <p>If you have any questions about the partnership program, please reply to this email or contact our support team.</p>

            <p>Best regards,<br/>
            Second Chance Housing List Partnership Team</p>
          </div>

          <div class="footer">
            <p>© 2026 Second Chance Housing List. All rights reserved.</p>
            <p>This email was sent to ${email} because you signed up for our partnership program.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendPartnerEmail({
    to: email,
    subject: "Welcome to Second Chance Housing List Partnership Program - Verify Your Email",
    html,
    partnerId,
    emailType: "signup_confirmation",
  });
}

/**
 * Send trial started email
 */
export async function sendTrialStartedEmail(
  partnerName: string,
  email: string,
  partnerId: number
): Promise<boolean> {
  const dashboardLink = `https://secondchance-3gdukdvh.manus.space/partnership/dashboard`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #003366; color: white; padding: 20px; text-align: center; border-radius: 5px; }
          .content { padding: 20px; background-color: #f9f9f9; margin: 20px 0; border-radius: 5px; }
          .cta-button { display: inline-block; background-color: #0066cc; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 10px 0; font-weight: bold; }
          .highlight { background-color: #fff3cd; padding: 15px; border-radius: 5px; border-left: 4px solid #ffc107; }
          .footer { text-align: center; font-size: 12px; color: #666; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Your Free Trial Has Started!</h1>
          </div>

          <div class="content">
            <p>Hi ${partnerName},</p>

            <p>Congratulations! Your email has been verified and your <strong>20 FREE leads trial</strong> is now active.</p>

            <div class="highlight">
              <strong>🎉 You're all set!</strong><br/>
              You will now receive leads as soon as renters submit their rental profiles. Check your email regularly for new lead notifications.
            </div>

            <h2>Your Trial Includes:</h2>
            <ul>
              <li>✓ 20 FREE leads with full rental profile data</li>
              <li>✓ Leads delivered instantly via email</li>
              <li>✓ Contact information (phone & email) included for trial leads</li>
              <li>✓ 30-day trial period</li>
            </ul>

            <h2>What You'll Receive in Lead Emails:</h2>
            <p>Each lead email will include:</p>
            <ul>
              <li>Customer name and contact information</li>
              <li>Location and move-in timeline</li>
              <li>Monthly income and rental budget</li>
              <li>Housing type and bedroom preferences</li>
              <li>Credit challenges and background information</li>
              <li>Lead number (e.g., "Lead 1 of 20")</li>
            </ul>

            <h2>Next Steps</h2>
            <p>Visit your partner dashboard to:</p>
            <ul>
              <li>View all leads received</li>
              <li>Track lead delivery status</li>
              <li>Purchase additional lead packages when trial ends</li>
            </ul>

            <div style="text-align: center;">
              <a href="${dashboardLink}" class="cta-button">Go to Partner Dashboard</a>
            </div>

            <h2>Ready to Purchase More Leads?</h2>
            <p>When your trial ends or you want more leads, you can purchase lead packages at any time:</p>
            <ul>
              <li>10 Leads for \$50.00</li>
              <li>50 Leads for \$250.00</li>
              <li>100 Leads for \$500.00</li>
              <li>200 Leads for \$1,000.00</li>
              <li>400 Leads for \$2,000.00</li>
              <li>800 Leads for \$4,000.00</li>
            </ul>
            <p><em>Bonus: Every package includes 5 extra leads to account for bad leads!</em></p>

            <p>Best regards,<br/>
            Second Chance Housing List Partnership Team</p>
          </div>

          <div class="footer">
            <p>© 2026 Second Chance Housing List. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendPartnerEmail({
    to: email,
    subject: "Your Free Trial Has Started - 20 Leads Ready!",
    html,
    partnerId,
    emailType: "trial_started",
  });
}

/**
 * Send lead delivery email (with or without contact info based on package)
 */
export async function sendLeadDeliveryEmail(
  partnerName: string,
  email: string,
  leadData: any,
  leadNumber: number,
  totalLeads: number,
  hasFullContact: boolean,
  partnerId: number
): Promise<boolean> {
  const buyLeadLink = `https://secondchance-3gdukdvh.manus.space/partnership/buy-lead`;

  let contactSection = "";
  if (hasFullContact) {
    contactSection = `
      <div style="background-color: #e8f4f8; padding: 15px; border-radius: 5px; margin: 15px 0;">
        <h3 style="margin-top: 0;">📞 Contact Information</h3>
        <p><strong>Phone:</strong> ${leadData.customerPhone}</p>
        <p><strong>Email:</strong> ${leadData.customerEmail}</p>
      </div>
    `;
  } else {
    contactSection = `
      <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #ffc107;">
        <h3 style="margin-top: 0;">🔒 Contact Information Locked</h3>
        <p>This lead's phone number and email address are hidden. To get their full contact information, purchase a lead package.</p>
        <div style="text-align: center; margin-top: 15px;">
          <a href="${buyLeadLink}" style="display: inline-block; background-color: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">BUY THIS LEAD</a>
        </div>
        <p style="font-size: 12px; color: #666; margin-top: 10px;">To purchase this lead's full contact information, click the button above and select a lead package deal.</p>
      </div>
    `;
  }

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #003366; color: white; padding: 20px; text-align: center; border-radius: 5px; }
          .content { padding: 20px; background-color: #f9f9f9; margin: 20px 0; border-radius: 5px; }
          .lead-badge { display: inline-block; background-color: #28a745; color: white; padding: 5px 10px; border-radius: 3px; font-size: 12px; font-weight: bold; }
          .section { margin: 20px 0; }
          .section-title { font-size: 14px; font-weight: bold; color: #003366; border-bottom: 2px solid #003366; padding-bottom: 5px; margin-bottom: 10px; }
          .footer { text-align: center; font-size: 12px; color: #666; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔥 New Lead Available!</h1>
            <p><span class="lead-badge">Lead ${leadNumber} of ${totalLeads}</span></p>
          </div>

          <div class="content">
            <p>Hi ${partnerName},</p>

            <p>A new lead matching your criteria has just submitted their rental profile! Here are their details:</p>

            <div class="section">
              <div class="section-title">👤 Personal Information</div>
              <p><strong>Name:</strong> ${leadData.customerName}</p>
              <p><strong>Location:</strong> ${leadData.city}, ${leadData.state}</p>
              <p><strong>Move-In Timeline:</strong> ${leadData.moveInTimeline || "Not specified"}</p>
            </div>

            <div class="section">
              <div class="section-title">💰 Financial Information</div>
              <p><strong>Monthly Income:</strong> $${leadData.monthlyIncome || "Not specified"}</p>
              <p><strong>Monthly Rental Budget:</strong> $${leadData.monthlyBudget || "Not specified"}</p>
            </div>

            <div class="section">
              <div class="section-title">🏠 Housing Preferences</div>
              <p><strong>Housing Type:</strong> ${leadData.housingType || "Not specified"}</p>
              <p><strong>Bedrooms:</strong> ${leadData.bedrooms || "Not specified"}</p>
            </div>

            <div class="section">
              <div class="section-title">⚠️ Background Information</div>
              <p><strong>Credit Challenges:</strong> ${leadData.creditChallenges?.join(", ") || "None specified"}</p>
              <p><strong>Criminal History:</strong> ${leadData.criminalHistory || "None specified"}</p>
            </div>

            ${contactSection}

            <p style="font-size: 12px; color: #666; margin-top: 20px;">
              <strong>Note:</strong> This is a HOT lead! The renter submitted their profile just moments ago. Contact them quickly to maximize your chances of approval.
            </p>
          </div>

          <div class="footer">
            <p>© 2026 Second Chance Housing List. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendPartnerEmail({
    to: email,
    subject: `🔥 New Lead: ${leadData.customerName} in ${leadData.city}, ${leadData.state}`,
    html,
    partnerId,
    emailType: "lead_delivery",
  });
}

/**
 * Send package purchased confirmation email
 */
export async function sendPackagePurchasedEmail(
  partnerName: string,
  email: string,
  packageName: string,
  leadCount: number,
  bonusLeads: number,
  totalPrice: number,
  partnerId: number
): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #003366; color: white; padding: 20px; text-align: center; border-radius: 5px; }
          .content { padding: 20px; background-color: #f9f9f9; margin: 20px 0; border-radius: 5px; }
          .order-summary { background-color: #e8f4f8; padding: 15px; border-radius: 5px; margin: 15px 0; }
          .footer { text-align: center; font-size: 12px; color: #666; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Lead Package Purchased!</h1>
          </div>

          <div class="content">
            <p>Hi ${partnerName},</p>

            <p>Thank you for your purchase! Your lead package has been activated and you'll start receiving leads immediately.</p>

            <div class="order-summary">
              <h3 style="margin-top: 0;">📦 Order Summary</h3>
              <p><strong>Package:</strong> ${packageName}</p>
              <p><strong>Leads Included:</strong> ${leadCount}</p>
              <p><strong>Bonus Leads:</strong> +${bonusLeads} (free!)</p>
              <p><strong>Total Leads:</strong> ${leadCount + bonusLeads}</p>
              <p style="margin-bottom: 0;"><strong>Total Price:</strong> \$${totalPrice.toFixed(2)}</p>
            </div>

            <h2>What Happens Next?</h2>
            <ol>
              <li>You'll receive leads via email as soon as renters submit their profiles</li>
              <li>Each lead email will show your lead count (e.g., "Lead 1 of ${leadCount + bonusLeads}")</li>
              <li>Contact information is included with each lead</li>
              <li>When you've received all ${leadCount + bonusLeads} leads, you can purchase another package</li>
            </ol>

            <h2>Bonus Leads Explained</h2>
            <p>We include 5 extra leads with every package to account for bad leads. This means if you purchase a 50-lead package, you'll receive 55 leads total at no extra cost!</p>

            <h2>Need More Leads?</h2>
            <p>When your current package runs out, simply purchase another package from your partner dashboard. Leads are delivered instantly!</p>

            <p>Best regards,<br/>
            Second Chance Housing List Partnership Team</p>
          </div>

          <div class="footer">
            <p>© 2026 Second Chance Housing List. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendPartnerEmail({
    to: email,
    subject: `Purchase Confirmed: ${packageName} - ${leadCount + bonusLeads} Leads`,
    html,
    partnerId,
    emailType: "package_purchased",
  });
}

/**
 * Send package expired email
 */
export async function sendPackageExpiredEmail(
  partnerName: string,
  email: string,
  packageName: string,
  partnerId: number
): Promise<boolean> {
  const purchaseLink = `https://secondchance-3gdukdvh.manus.space/partnership/purchase`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #dc3545; color: white; padding: 20px; text-align: center; border-radius: 5px; }
          .content { padding: 20px; background-color: #f9f9f9; margin: 20px 0; border-radius: 5px; }
          .cta-button { display: inline-block; background-color: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 10px 0; font-weight: bold; }
          .footer { text-align: center; font-size: 12px; color: #666; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Lead Package Expired</h1>
          </div>

          <div class="content">
            <p>Hi ${partnerName},</p>

            <p>Your <strong>${packageName}</strong> lead package has expired. You've received all the leads included in this package.</p>

            <h2>Ready for More Leads?</h2>
            <p>To continue receiving leads, purchase another lead package. Our available packages are:</p>
            <ul>
              <li>10 Leads for \$50.00</li>
              <li>50 Leads for \$250.00</li>
              <li>100 Leads for \$500.00</li>
              <li>200 Leads for \$1,000.00</li>
              <li>400 Leads for \$2,000.00</li>
              <li>800 Leads for \$4,000.00</li>
            </ul>
            <p><em>Every package includes 5 bonus leads at no extra cost!</em></p>

            <div style="text-align: center;">
              <a href="${purchaseLink}" class="cta-button">Purchase More Leads</a>
            </div>

            <p>Best regards,<br/>
            Second Chance Housing List Partnership Team</p>
          </div>

          <div class="footer">
            <p>© 2026 Second Chance Housing List. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendPartnerEmail({
    to: email,
    subject: "Your Lead Package Has Expired - Purchase More Leads",
    html,
    partnerId,
    emailType: "package_expired",
  });
}

/**
 * Send password reset email to partner
 */
export async function sendPasswordResetEmail(
  partnerName: string,
  email: string,
  resetCode: string
): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; }
          .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { padding: 20px; }
          .code-box { background-color: #f0f4ff; border: 2px solid #2563eb; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
          .code { font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #2563eb; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <p>Hello ${partnerName},</p>
            <p>We received a request to reset your password. Use the code below to reset it:</p>
            <div class="code-box">
              <div class="code">${resetCode}</div>
            </div>
            <p>This code expires in 1 hour. If you did not request a password reset, please ignore this email.</p>
            <p>Best regards,<br/>Second Chance Housing List Partnership Team</p>
          </div>
          <div class="footer">
            <p>© 2026 Second Chance Housing List. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
  return sendPartnerEmail({
    to: email,
    subject: "Password Reset Code - Second Chance Housing List",
    html,
    emailType: "password_reset",
  });
}


/**
 * Send a low-leads warning email when a partner remaining leads drop below 5.
 */
export async function sendLowLeadsWarningEmail(
  partnerName: string,
  email: string,
  partnerId: number,
  leadsRemaining: number,
  hasCardOnFile: boolean
): Promise<boolean> {
  const dashboardUrl = `https://secondchancehousinglocator.com/partnership/dashboard?partnerId=${partnerId}`;
  const rechargeNote = hasCardOnFile
    ? `<p>Because you have a card on file, you can <strong>recharge instantly</strong> with one click directly from your dashboard.</p>`
    : `<p>To avoid interruption, <a href="${dashboardUrl}" style="color:#003366;">log in to your dashboard</a> and save a payment card to enable instant recharging.</p>`;

  const html = `
    <!DOCTYPE html><html><head><style>
      body{font-family:Arial,sans-serif;line-height:1.6;color:#333}
      .container{max-width:600px;margin:0 auto;padding:20px}
      .header{background-color:#c0392b;color:white;padding:20px;text-align:center;border-radius:5px}
      .alert-box{background-color:#fdf2f2;border:2px solid #e74c3c;border-radius:8px;padding:20px;margin:20px 0;text-align:center}
      .leads-count{font-size:48px;font-weight:bold;color:#c0392b}
      .content{padding:20px;background-color:#f9f9f9;margin:20px 0;border-radius:5px}
      .cta-button{display:inline-block;background-color:#003366;color:white;padding:14px 28px;border-radius:5px;text-decoration:none;font-weight:bold;font-size:16px;margin:15px 0}
      .footer{text-align:center;font-size:12px;color:#666;margin-top:20px}
    </style></head><body>
      <div class="container">
        <div class="header"><h1>Low Leads Warning</h1><p>Second Chance Housing List Partnership Program</p></div>
        <div class="alert-box">
          <p style="margin:0;font-size:16px;color:#c0392b;font-weight:bold;">You only have</p>
          <div class="leads-count">${leadsRemaining}</div>
          <p style="margin:0;font-size:16px;color:#c0392b;font-weight:bold;">lead${leadsRemaining !== 1 ? "s" : ""} remaining</p>
        </div>
        <div class="content">
          <p>Hi ${partnerName},</p>
          <p>This is an automated alert: your lead balance is running low. When leads run out, you will stop receiving new tenant referrals.</p>
          ${rechargeNote}
          <p>Our most popular top-up is the <strong>10 Leads package at $50</strong> (includes 5 bonus leads).</p>
          <div style="text-align:center;"><a href="${dashboardUrl}" class="cta-button">Go to My Dashboard</a></div>
          <p style="font-size:13px;color:#666;">Questions? Contact support@secondchancehousinglocator.com.</p>
        </div>
        <div class="footer"><p>2026 Second Chance Housing List. All rights reserved.</p></div>
      </div>
    </body></html>
  `;

  return sendPartnerEmail({
    to: email,
    subject: `Low Leads Alert: Only ${leadsRemaining} Lead${leadsRemaining !== 1 ? "s" : ""} Remaining - Second Chance Housing List`,
    html,
    partnerId,
    emailType: "low_leads_warning",
  });
}
