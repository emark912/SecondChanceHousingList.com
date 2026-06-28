import nodemailer from 'nodemailer';
import { randomUUID } from 'crypto';
import { ENV } from './_core/env';

// Create Gmail transporter using app password
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: ENV.gmailEmail,
    pass: ENV.gmailAppPassword,
  },
});

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  attachments?: Array<{
    filename: string;
    content: Buffer;
    contentType: string;
  }>;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    await transporter.sendMail({
      from: ENV.gmailEmail,
      to: options.to,
      subject: options.subject,
      html: options.html,
      attachments: options.attachments,
    });
    console.log('[Email Service] Email sent successfully to:', options.to);
    return true;
  } catch (error) {
    console.error('[Email Service] Failed to send email:', error);
    return false;
  }
}

/**
 * Test Gmail connection
 */
export async function testEmailDelivery(): Promise<boolean> {
  try {
    await transporter.verify();
    console.log('[Email Service] Gmail connection verified');
    return true;
  } catch (error) {
    console.error('[Email Service] Gmail connection failed:', error);
    return false;
  }
}

/**
 * Generate unique tracking ID
 */
export function generateTrackingId(emailLogId: number): string {
  return `${emailLogId}-${randomUUID()}`;
}

/**
 * Generate tracking pixel for email opens
 */
export function generateTrackingPixel(trackingPixelId: string): string {
  return `<img src="https://secondchance-3gdukdvh.manus.space/api/email/track/open/${trackingPixelId}" width="1" height="1" alt="" style="display:none;" />`;
}

/**
 * Generate tracked link for click tracking
 */
export function generateTrackedLink(originalUrl: string, clickTrackingId: string): string {
  return `https://secondchance-3gdukdvh.manus.space/api/email/track/click/${clickTrackingId}?redirect=${encodeURIComponent(originalUrl)}`;
}

/**
 * Send payment reminder email
 */
export async function sendPaymentReminder(
  customerEmail: string,
  customerName: string,
  paymentLink: string,
  reminderNumber: number,
  trackingPixelId?: string,
  clickTrackingId?: string
): Promise<boolean> {
  const reminderMessages = {
    1: 'Your personalized rental list is ready! Support our mission with a donation.',
    2: "Don\'t forget! Complete your donation to access your rental list.",
    3: 'Final reminder: Get your personalized Second Chance Housing list today!',
  };

  const message = reminderMessages[reminderNumber as keyof typeof reminderMessages] || reminderMessages[1];
  
  // Use tracked link if click tracking ID provided
  const trackedPaymentLink = clickTrackingId ? generateTrackedLink(paymentLink, clickTrackingId) : paymentLink;

  const html = `
    <h2>Complete Your Second Chance Housing Search</h2>
    <p>Hi ${customerName},</p>
    <p>${message}</p>
    <p>You saved your rental profile on SecondChanceHousingLocator.com, but haven't completed your purchase yet.</p>
    <p><strong>Your list is FREE.</strong> We accept donations to support our mission. The average donation is $25.00, but you decide what works for your budget (minimum $10.00).</p>
    <p><strong>Optional:</strong> Add a Second Chance Housing Consultant for just $125.00 (regularly $350.00) to help you get approved!</p>
    <p style="text-align: center; margin: 30px 0;">
      <a href="${trackedPaymentLink}" style="background-color: #0891b2; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
        Complete Payment & Download Your Results
      </a>
    </p>
    <p>This link is unique to you and will allow you to complete payment and immediately download your personalized Second Chance Housing List.</p>
    <p>Questions? Contact us at support@secondchancehousinglocator.com</p>
    <p>Best regards,<br/>SecondChanceHousingLocator.com Team</p>
    ${trackingPixelId ? generateTrackingPixel(trackingPixelId) : ''}
  `;

  return sendEmail({
    to: customerEmail,
    subject: `${message} - Complete Your Search Now`,
    html,
  });
}

/**
 * Send personalized PDF to customer after payment
 */
export async function sendRentalResultsEmail(
  email: string,
  firstName: string,
  pdfBuffer: Buffer,
  trackingPixelId?: string
): Promise<boolean> {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #003366; color: white; padding: 20px; text-align: center; border-radius: 5px; }
          .content { padding: 20px; background-color: #f9f9f9; margin: 20px 0; border-radius: 5px; }
          .cta-button { display: inline-block; background-color: #0066cc; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
          .footer { text-align: center; font-size: 12px; color: #666; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Your Rental Search Results Are Ready!</h1>
          </div>

          <div class="content">
            <p>Hi ${firstName},</p>

            <p>Thank you for using SecondChance Housing Locator! We've completed your personalized rental search and found matches that fit your profile.</p>

            <h2>What's Included in Your Results:</h2>
            <ul>
              <li><strong>100+ Rental Properties</strong> - Apartments, houses, and townhomes in your area</li>
              <li><strong>Second Chance Programs</strong> - Specifically designed for renters with credit challenges</li>
              <li><strong>Corporate Leasing Programs</strong> - Companies that work with credit-challenged renters</li>
              <li><strong>Private Landlords</strong> - Willing to work with your situation</li>
              <li><strong>Complete Contact Information</strong> - Direct phone numbers, emails, and websites</li>
            </ul>

            <h2>About Our Service:</h2>
            <p>SecondChanceHousingLocator.com is a donation-supported service. We believe everyone deserves a second chance and access to quality housing. Your personalized rental list is FREE. We accept donations to support our mission (average donation: $25.00, but you decide what works for your budget).</p>

            <p><strong>Optional: Second Chance Housing Consultant - PREMIUM SERVICE</strong></p>
            <p>Add a dedicated housing consultant for just $125.00 (regularly $350.00 - limited time discount!) who will work with you until you\'re approved into a rental property of your choice. They will help negotiate with property managers, set tour appointments, and facilitate the approval process.</p>
            <p><strong>Exclusive Consultant Perks:</strong></p>
            <ul style="margin-left: 20px; margin-top: 10px;">
              <li>Access to credit challenge loan programs for moving expenses</li>
              <li>Application fee waivers for select second chance programs</li>
            </ul>
            <p style="margin-top: 10px;"><strong>Donation Only Option:</strong> If you prefer to apply independently, you\'ll receive your personalized rental list with 100+ matching Second Chance Rental Properties and Programs in your area.</p>

            <p><strong>Your Approval Rate: 95%</strong></p>
            <p>Based on your profile, you have a 95% approval rate with our matched landlords and programs.</p>

            <h2>Next Steps:</h2>
            <ol>
              <li>Download and review the attached PDF with your complete search results</li>
              <li>Review the matched properties and programs</li>
              <li>Contact landlords and programs directly using the provided information</li>
              <li>Prepare your rental application</li>
              <li>Apply to properties that match your needs and budget</li>
            </ol>

            <p>Your detailed search results are attached to this email as a PDF. Please keep this file for your records.</p>

            <p><strong>30-Day Money Back Guarantee:</strong> If you are not approved into a rental property within 30 days from one of our recommendations, we will refund 100% of your donation or case manager fee. No questions asked.</p>
          </div>

          <div style="text-align: center;">
            <p style="color: #666; font-size: 14px;">
              Questions? Contact us at support@secondchancehousing.com
            </p>
          </div>

          <div class="footer">
            <p>© 2026 SecondChance Housing Locator. All rights reserved.</p>
            <p>This email was sent to ${email} because you completed a rental profile search on our platform.</p>
          </div>
        </div>
        ${trackingPixelId ? generateTrackingPixel(trackingPixelId) : ''}
      </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: 'Your SecondChance Housing Search Results Are Ready!',
    html: htmlContent,
    attachments: [
      {
        filename: 'rental-search-results.pdf',
        content: pdfBuffer,
        contentType: 'application/pdf',
      },
    ],
  });
}


/**
 * Send abandoned cart recovery email with personalized matches and discount code
 */
export async function sendAbandonedCartEmail(
  customerEmail: string,
  customerName: string,
  location: string,
  rentalMatches: number,
  resumeLink: string,
  discountCode: string,
  discountPercentage: number,
  trackingPixelId?: string,
  clickTrackingId?: string
): Promise<boolean> {
  const trackedResumeLink = clickTrackingId ? generateTrackedLink(resumeLink, clickTrackingId) : resumeLink;
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #003366; color: white; padding: 20px; text-align: center; border-radius: 5px; }
          .content { padding: 20px; background-color: #f9f9f9; margin: 20px 0; border-radius: 5px; }
          .highlight { background-color: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0; border-radius: 3px; }
          .discount-box { background-color: #d4edda; padding: 15px; border-left: 4px solid #28a745; margin: 20px 0; border-radius: 3px; text-align: center; }
          .discount-code { font-size: 24px; font-weight: bold; color: #155724; font-family: monospace; }
          .cta-button { display: inline-block; background-color: #0891b2; color: white; padding: 14px 35px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
          .footer { text-align: center; font-size: 12px; color: #666; margin-top: 20px; }
          .matches-count { font-size: 32px; font-weight: bold; color: #0891b2; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Don't Miss Out! Your Second Chance Housing List is Ready</h1>
          </div>

          <div class="content">
            <p>Hi ${customerName},</p>

            <p>We noticed you started your Second Chance Housing search in <strong>${location}</strong> but didn't complete your order. We've found some great matches for you!</p>

            <div style="text-align: center; margin: 30px 0;">
              <p style="color: #666; font-size: 14px; margin: 5px 0;">Personalized Matches Found</p>
              <p class="matches-count">${rentalMatches}+</p>
              <p style="color: #666; font-size: 14px; margin: 5px 0;">Second Chance Rental Properties & Programs</p>
            </div>

            <h2>Your Search Includes:</h2>
            <ul>
              <li>✓ <strong>${rentalMatches}+ Verified Rental Listings</strong> matched to your credit profile</li>
              <li>✓ <strong>Second Chance Programs</strong> specifically designed for renters with credit challenges</li>
              <li>✓ <strong>Corporate Leasing Options</strong> for credit-challenged renters</li>
              <li>✓ <strong>Private Landlords</strong> willing to work with your situation</li>
              <li>✓ <strong>Complete Contact Information</strong> for immediate outreach</li>
              <li>✓ <strong>Personalized PDF Report</strong> for easy reference</li>
            </ul>

            <div class="highlight">
              <p><strong>🎉 Limited Time Offer!</strong></p>
              <p>Complete your order today and get <strong>${discountPercentage}% off</strong> with code: <span style="font-weight: bold; color: #0891b2;">${discountCode}</span></p>
              <p style="font-size: 12px; color: #666; margin: 10px 0 0 0;">This offer expires in 24 hours!</p>
            </div>

            <h2>Two Options to Get Your Results:</h2>
            
            <div style="border: 1px solid #ddd; padding: 15px; margin: 15px 0; border-radius: 5px;">
              <h3 style="margin-top: 0; color: #333;">Option 1: Donation Only (Recommended for Budget-Conscious Renters)</h3>
              <p><strong>Price:</strong> Your choice donation (minimum $10.00, average $25.00)</p>
              <p><strong>What You Get:</strong></p>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>Personalized PDF with ${rentalMatches}+ rental matches</li>
                <li>Instant digital delivery</li>
                <li>Apply to properties independently</li>
                <li>Access to our support team for questions</li>
              </ul>
            </div>

            <div style="border: 2px solid #0891b2; padding: 15px; margin: 15px 0; border-radius: 5px; background-color: #f0f9fb;">
              <h3 style="margin-top: 0; color: #0891b2;">✨ Option 2: Add a Second Chance Housing Consultant (Premium)</h3>
              <p><strong>Price:</strong> $125.00 (regularly $350.00 - limited time discount!)</p>
              <p><strong>What You Get:</strong></p>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>Everything in Option 1, PLUS:</li>
                <li>✓ Dedicated Second Chance Housing Consultant</li>
                <li>✓ Personal guidance through the entire approval process</li>
                <li>✓ Help with applications and landlord negotiations</li>
                <li>✓ Tour appointment scheduling</li>
                <li>✓ Access to credit challenge loan programs ($1,500-$5,000 for moving expenses)</li>
                <li>✓ Application fee waivers for select programs (save $50-$300)</li>
              </ul>
              <p style="font-size: 12px; color: #666; margin-top: 10px;"><strong>Your Consultant Will:</strong> Work with you until you're approved into a rental property of your choice. They'll ensure you get approved and help facilitate the entire process.</p>
            </div>

            <p style="text-align: center;">
              <a href="${trackedResumeLink}" class="cta-button">
                Complete Your Order Now
              </a>
            </p>

            <p style="text-align: center; color: #666; font-size: 12px;">
              <strong>Use code ${discountCode} at checkout for your discount</strong>
            </p>

            <h2>Why Choose Us?</h2>
            <ul>
              <li>🎯 AI-Powered Matching: We use advanced AI to find properties that will actually approve you</li>
              <li>💯 95% Approval Rate: Based on your profile, you have a 95% approval rate with our matched landlords</li>
              <li>🔒 30-Day Money-Back Guarantee: Not approved? Get a full refund, no questions asked</li>
              <li>🤝 Mission-Driven: We believe everyone deserves a second chance and access to quality housing</li>
            </ul>

            <p><strong>This offer expires in 24 hours.</strong> Don't miss out on your personalized Second Chance Housing list!</p>

            <p>Questions? Contact us at support@secondchancehousinglocator.com or call our support team 24/7.</p>

            <p>Best regards,<br/><strong>SecondChanceHousingLocator.com Team</strong></p>
          </div>

          <div class="footer">
            <p>© 2026 SecondChance Housing Locator. All rights reserved.</p>
            <p>This email was sent to ${customerEmail} because you started a rental profile search on our platform.</p>
            <p><a href="${trackedResumeLink}" style="color: #0891b2;">Resume Your Order</a></p>
          </div>
        </div>
        ${trackingPixelId ? generateTrackingPixel(trackingPixelId) : ''}
      </body>
    </html>
  `;

  return sendEmail({
    to: customerEmail,
    subject: `${customerName}, Your list Second Chance Rentals in ${location} Order`,
    html,
  });
}


/**
 * Send monthly payment setup email for corporate leasing program
 */
export async function sendMonthlyPaymentSetupEmail(
  customerEmail: string,
  customerName: string,
  monthlyAmount: number,
  monthlyCount: number,
  paymentPlanId: number
): Promise<boolean> {
  const trackingPixelId = generateTrackingId(paymentPlanId);
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
          .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
          .footer { background: #f0f0f0; padding: 15px; text-align: center; font-size: 12px; color: #666; }
          .cta-button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 15px 0; font-weight: bold; }
          .highlight { background: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 15px 0; border-radius: 4px; }
          .payment-schedule { background: white; padding: 15px; border: 1px solid #ddd; border-radius: 5px; margin: 15px 0; }
          .payment-schedule table { width: 100%; border-collapse: collapse; }
          .payment-schedule th, .payment-schedule td { padding: 10px; text-align: left; border-bottom: 1px solid #eee; }
          .payment-schedule th { background: #f5f5f5; font-weight: bold; }
          .success-badge { display: inline-block; background: #28a745; color: white; padding: 8px 12px; border-radius: 4px; font-size: 12px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Your Down Payment Received!</h1>
            <p>Monthly Payment Plan Setup Instructions</p>
          </div>
          
          <div class="content">
            <p>Dear ${customerName},</p>
            
            <p>Thank you for your <strong>$1,000.00 down payment</strong> for our Corporate Leasing Program! We're excited to help you find the perfect rental property.</p>
            
            <div class="highlight">
              <h3 style="margin-top: 0;">🎉 What's Next?</h3>
              <p>Your down payment has been processed successfully. Now it's time to set up your monthly payment arrangement for the remaining balance.</p>
            </div>
            
            <h2>Your Payment Plan Summary</h2>
            <div class="payment-schedule">
              <table>
                <tr>
                  <th>Payment Stage</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
                <tr>
                  <td>Down Payment (Completed)</td>
                  <td>$1,000.00</td>
                  <td><span class="success-badge">✓ PAID</span></td>
                </tr>
                <tr>
                  <td>After Property Selection</td>
                  <td>$250.00</td>
                  <td>Pending</td>
                </tr>
                <tr>
                  <td>Monthly Installments (${monthlyCount} months)</td>
                  <td>$${monthlyAmount.toFixed(2)}/month</td>
                  <td>Pending Setup</td>
                </tr>
              </table>
            </div>
            
            <h2>Set Up Your Monthly Payments</h2>
            <p>To complete your monthly payment setup and ensure uninterrupted service, please click the button below:</p>
            
            <p style="text-align: center;">
              <a href="https://secondchance-3gdukdvh.manus.space/corporate-leasing/setup-monthly-payments?planId=${paymentPlanId}" class="cta-button">
                Set Up Monthly Payments Now
              </a>
            </p>
            
            <h2>How It Works</h2>
            <ol>
              <li><strong>Complete Your Profile:</strong> Finish your rental profile to get matched with properties</li>
              <li><strong>Select a Property:</strong> Choose a property you're interested in</li>
              <li><strong>Make Property Selection Payment:</strong> Pay $250.00 when you've selected your property</li>
              <li><strong>Monthly Payments:</strong> Pay $${monthlyAmount.toFixed(2)}/month for ${monthlyCount} months</li>
              <li><strong>Get Approved:</strong> Our consultants will work with you until you're approved</li>
            </ol>
            
            <div class="highlight">
              <h3 style="margin-top: 0;">💡 Why Monthly Payments?</h3>
              <p>We understand that large upfront payments can be challenging. Our flexible monthly payment plan allows you to:</p>
              <ul>
                <li>✓ Spread payments over time</li>
                <li>✓ Budget more easily</li>
                <li>✓ Get professional guidance throughout the process</li>
                <li>✓ Access our full suite of support services</li>
              </ul>
            </div>
            
            <h2>Questions?</h2>
            <p>If you have any questions about your payment plan or need assistance setting up your monthly payments, please don't hesitate to contact us:</p>
            <ul>
              <li>📧 Email: support@secondchancehousinglocator.com</li>
              <li>📞 Phone: 24/7 Support Available</li>
              <li>💬 Live Chat: Available on our website</li>
            </ul>
            
            <p>We're here to help you succeed!</p>
            <p>Best regards,<br/><strong>SecondChanceHousingLocator.com Team</strong></p>
          </div>
          
          <div class="footer">
            <p>© 2026 SecondChance Housing Locator. All rights reserved.</p>
            <p>You received this email because you enrolled in our Corporate Leasing Program.</p>
            <p><a href="https://secondchance-3gdukdvh.manus.space/corporate-leasing/setup-monthly-payments?planId=${paymentPlanId}" style="color: #667eea;">Set Up Payments</a></p>
          </div>
        </div>
        ${trackingPixelId ? generateTrackingPixel(trackingPixelId) : ''}
      </body>
    </html>
  `;
  
  return sendEmail({
    to: customerEmail,
    subject: `${customerName}, Set Up Your Monthly Payment Plan - SecondChanceHousingLocator.com`,
    html,
  });
}
