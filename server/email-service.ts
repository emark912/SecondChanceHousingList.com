import nodemailer from "nodemailer";
import { ENV } from "./_core/env";
import * as db from "./db";

// Configure email transporter
const createTransporter = () => {
  // Using Gmail as example - can be configured for other services
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: ENV.emailFromAddress,
      pass: ENV.emailServicePassword,
    },
  });
};

export async function sendDonationConfirmation(input: {
  recipientEmail: string;
  recipientName: string;
  amountDollars: number;
}) {
  try {
    const transporter = createTransporter();

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 5px; }
            .content { padding: 20px; border: 1px solid #ddd; border-radius: 5px; margin-top: 20px; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
            .highlight { background-color: #f0f9ff; padding: 15px; border-left: 4px solid #2563eb; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Thank You for Your Donation!</h1>
            </div>
            
            <div class="content">
              <p>Dear ${input.recipientName},</p>
              
              <p>We sincerely appreciate your generous donation of <strong>$${input.amountDollars.toFixed(2)}</strong> to Second Chance Housing List.</p>
              
              <div class="highlight">
                <strong>✓ Your Access is Now Active</strong>
                <p>You now have full access to landlord and property manager contact information for all rental properties in our database. This access is permanent and never expires.</p>
              </div>
              
              <p><strong>What You Can Do Now:</strong></p>
              <ul>
                <li>View landlord phone numbers and email addresses</li>
                <li>Contact property managers directly</li>
                <li>Apply to properties that match your needs</li>
                <li>Save your favorite listings</li>
              </ul>
              
              <p>Your donation directly supports our mission to help renters with credit challenges, eviction history, criminal records, and other barriers find quality housing.</p>
              
              <p>If you have any questions or need assistance, please don't hesitate to reach out to us.</p>
              
              <p>Best regards,<br><strong>The Second Chance Housing List Team</strong></p>
            </div>
            
            <div class="footer">
              <p>© 2026 Second Chance Housing List. All rights reserved.</p>
              <p>This is an automated message. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const mailOptions = {
      from: ENV.emailFromAddress,
      to: input.recipientEmail,
      subject: "Thank You for Your Donation - Your Access is Confirmed",
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    
    // Log email sending
    await db.logEmail(input.recipientEmail, "donation_confirmation", "sent");
    
    console.log(`[Email] Donation confirmation sent to ${input.recipientEmail}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("[Email] Failed to send donation confirmation:", error);
    
    // Log email failure
    await db.logEmail(input.recipientEmail, "donation_confirmation", "failed");
    
    throw error;
  }
}

export async function sendPropertyInquiryNotification(input: {
  landlordEmail: string;
  landlordName: string;
  tenantName: string;
  tenantEmail: string;
  propertyAddress: string;
}) {
  try {
    const transporter = createTransporter();

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 5px; }
            .content { padding: 20px; border: 1px solid #ddd; border-radius: 5px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>New Inquiry for Your Property</h1>
            </div>
            
            <div class="content">
              <p>Dear ${input.landlordName},</p>
              
              <p>You have received a new inquiry for your property at:</p>
              <p><strong>${input.propertyAddress}</strong></p>
              
              <p><strong>Tenant Information:</strong></p>
              <ul>
                <li>Name: ${input.tenantName}</li>
                <li>Email: ${input.tenantEmail}</li>
              </ul>
              
              <p>Please contact the tenant directly to discuss the rental application.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const mailOptions = {
      from: ENV.emailFromAddress,
      to: input.landlordEmail,
      subject: `New Inquiry for ${input.propertyAddress}`,
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
    
    await db.logEmail(input.landlordEmail, "property_inquiry", "sent");
    
    console.log(`[Email] Property inquiry notification sent to ${input.landlordEmail}`);
    return { success: true };
  } catch (error) {
    console.error("[Email] Failed to send property inquiry notification:", error);
    
    await db.logEmail(input.landlordEmail, "property_inquiry", "failed");
    
    throw error;
  }
}
