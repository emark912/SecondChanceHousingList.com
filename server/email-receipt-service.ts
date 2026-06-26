import { sendEmail } from "./email-service";

export interface ReceiptData {
  email: string;
  fullName: string;
  orderId: string;
  amount: number;
  paymentMethod: string;
  date: string;
  pdfUrl: string;
  itemsCount: number;
}

/**
 * Send payment receipt email to customer
 */
export async function sendPaymentReceipt(data: ReceiptData): Promise<boolean> {
  try {
    const htmlContent = generateReceiptHTML(data);

    const result = await sendEmail({
      to: data.email,
      subject: `Payment Confirmation - Your Second Chance Housing List (Order #${data.orderId})`,
      html: htmlContent,
    });

    return result;
  } catch (error) {
    console.error("Error sending payment receipt:", error);
    return false;
  }
}

/**
 * Generate HTML content for payment receipt email
 */
function generateReceiptHTML(data: ReceiptData): string {
  const formattedAmount = data.amount.toFixed(2);
  const currentYear = new Date().getFullYear();

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f9fafb;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          .header {
            background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
            color: white;
            padding: 40px 20px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: bold;
          }
          .header p {
            margin: 8px 0 0 0;
            font-size: 14px;
            opacity: 0.9;
          }
          .content {
            padding: 40px 20px;
          }
          .greeting {
            font-size: 16px;
            margin-bottom: 24px;
            color: #1f2937;
          }
          .order-details {
            background-color: #f3f4f6;
            border-left: 4px solid #2563eb;
            padding: 20px;
            margin: 24px 0;
            border-radius: 4px;
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 12px;
            font-size: 14px;
          }
          .detail-row:last-child {
            margin-bottom: 0;
          }
          .detail-label {
            color: #6b7280;
            font-weight: 500;
          }
          .detail-value {
            color: #1f2937;
            font-weight: 600;
          }
          .amount-section {
            background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
            border: 1px solid #6ee7b7;
            padding: 20px;
            border-radius: 8px;
            margin: 24px 0;
            text-align: center;
          }
          .amount-label {
            color: #059669;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 8px;
          }
          .amount-value {
            color: #047857;
            font-size: 36px;
            font-weight: bold;
          }
          .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            padding: 14px 32px;
            border-radius: 6px;
            text-decoration: none;
            font-weight: 600;
            font-size: 14px;
            margin: 24px 0;
            text-align: center;
            width: 100%;
            box-sizing: border-box;
          }
          .cta-button:hover {
            background: linear-gradient(135deg, #059669 0%, #047857 100%);
          }
          .info-section {
            background-color: #eff6ff;
            border-left: 4px solid #3b82f6;
            padding: 16px;
            border-radius: 4px;
            margin: 24px 0;
            font-size: 14px;
            color: #1e40af;
          }
          .info-section strong {
            display: block;
            margin-bottom: 8px;
            color: #1e3a8a;
          }
          .footer {
            background-color: #f9fafb;
            padding: 24px 20px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
            font-size: 12px;
            color: #6b7280;
          }
          .footer-link {
            color: #2563eb;
            text-decoration: none;
          }
          .divider {
            height: 1px;
            background-color: #e5e7eb;
            margin: 24px 0;
          }
          .checklist {
            list-style: none;
            padding: 0;
            margin: 16px 0;
          }
          .checklist li {
            padding: 8px 0;
            padding-left: 24px;
            position: relative;
            color: #374151;
            font-size: 14px;
          }
          .checklist li:before {
            content: "✓";
            position: absolute;
            left: 0;
            color: #10b981;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <!-- Header -->
          <div class="header">
            <h1>✓ Payment Confirmed</h1>
            <p>Your Second Chance Housing List is ready</p>
          </div>

          <!-- Content -->
          <div class="content">
            <div class="greeting">
              <p>Hi ${escapeHtml(data.fullName)},</p>
              <p>Thank you for your purchase! Your payment has been successfully processed. Your personalized Second Chance Housing List is ready to download.</p>
            </div>

            <!-- Order Details -->
            <div class="order-details">
              <div class="detail-row">
                <span class="detail-label">Order ID:</span>
                <span class="detail-value">${escapeHtml(data.orderId)}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Order Date:</span>
                <span class="detail-value">${escapeHtml(data.date)}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Payment Method:</span>
                <span class="detail-value">${escapeHtml(data.paymentMethod)}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Properties Found:</span>
                <span class="detail-value">${data.itemsCount}+ Verified Options</span>
              </div>
            </div>

            <!-- Amount Section -->
            <div class="amount-section">
              <div class="amount-label">Total Amount Paid</div>
              <div class="amount-value">$${formattedAmount}</div>
            </div>

            <!-- CTA Button -->
            <a href="${escapeHtml(data.pdfUrl)}" class="cta-button">
              Download Your Housing List (PDF)
            </a>

            <!-- What's Included -->
            <div>
              <strong style="color: #1f2937; font-size: 16px; display: block; margin-bottom: 12px;">What's Included in Your List:</strong>
              <ul class="checklist">
                <li>Verified rental properties that accept second chance renters</li>
                <li>Direct contact information for landlords and property managers</li>
                <li>Properties matched to your specific rental profile</li>
                <li>Application tips and guidance for success</li>
                <li>Alternative housing program recommendations</li>
              </ul>
            </div>

            <div class="divider"></div>

            <!-- Info Section -->
            <div class="info-section">
              <strong>📧 Keep This Email Safe</strong>
              Save this email for your records. It contains your order confirmation and payment details. You can always download your housing list again by clicking the button above.
            </div>

            <!-- Support Info -->
            <div class="info-section">
              <strong>❓ Need Help?</strong>
              If you have any questions about your purchase or need assistance accessing your housing list, please don't hesitate to contact our support team. We're here to help!
            </div>
          </div>

          <!-- Footer -->
          <div class="footer">
            <p>
              © ${currentYear} Second Chance Housing Locator. All rights reserved.<br>
              <a href="https://www.secondchancehousinglocator.com" class="footer-link">Visit Our Website</a> | 
              <a href="https://www.secondchancehousinglocator.com/contact" class="footer-link">Contact Us</a>
            </p>
            <p style="margin-top: 12px; color: #9ca3af;">
              This is an automated email. Please do not reply to this message.
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Escape HTML special characters to prevent injection
 */
function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}
