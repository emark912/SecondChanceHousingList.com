/**
 * 15-Minute Lead Notification Email Template
 * 
 * Sent 15 minutes after form submission if no payment has been made
 * Subject: "Congratulations {{customerName}}! You have been approved for Second Chance Housing"
 */

export const leadNotification15MinTemplate = {
  templateType: "lead_notification_15min",
  templateName: "15-Minute Lead Notification - Approval",
  subject: "Congratulations {{customerName}}! You have been approved for Second Chance Housing",
  preheader: "Your personalized rental matches are ready in {{city}}",
  
  bodyHtml: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Congratulations - Second Chance Housing Approval</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f5f5f5;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .header {
            background: linear-gradient(135deg, #0066cc 0%, #004499 100%);
            color: white;
            padding: 40px 20px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
        }
        .header p {
            margin: 10px 0 0 0;
            font-size: 16px;
            opacity: 0.95;
        }
        .content {
            padding: 40px 30px;
        }
        .greeting {
            font-size: 18px;
            font-weight: 600;
            color: #0066cc;
            margin-bottom: 20px;
        }
        .approval-badge {
            background-color: #e8f5e9;
            border-left: 4px solid #4caf50;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .approval-badge p {
            margin: 0;
            color: #2e7d32;
            font-weight: 600;
        }
        .section {
            margin: 25px 0;
        }
        .section-title {
            font-size: 16px;
            font-weight: 700;
            color: #0066cc;
            margin-bottom: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .section-content {
            font-size: 14px;
            color: #555;
            line-height: 1.8;
        }
        .highlight {
            background-color: #fff3cd;
            padding: 15px;
            border-radius: 4px;
            margin: 15px 0;
            border-left: 4px solid #ffc107;
        }
        .highlight strong {
            color: #856404;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #0066cc 0%, #004499 100%);
            color: white;
            text-decoration: none;
            padding: 14px 32px;
            border-radius: 6px;
            font-weight: 600;
            font-size: 16px;
            margin: 20px 0;
            transition: transform 0.2s, box-shadow 0.2s;
        }
        .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 102, 204, 0.3);
        }
        .benefits-list {
            list-style: none;
            padding: 0;
            margin: 15px 0;
        }
        .benefits-list li {
            padding: 10px 0;
            padding-left: 30px;
            position: relative;
            font-size: 14px;
            color: #555;
        }
        .benefits-list li:before {
            content: "✓";
            position: absolute;
            left: 0;
            color: #4caf50;
            font-weight: bold;
            font-size: 16px;
        }
        .footer {
            background-color: #f9f9f9;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #eee;
            font-size: 12px;
            color: #999;
        }
        .footer a {
            color: #0066cc;
            text-decoration: none;
        }
        .urgency-box {
            background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
            color: white;
            padding: 20px;
            border-radius: 6px;
            margin: 20px 0;
            text-align: center;
        }
        .urgency-box strong {
            font-size: 18px;
            display: block;
            margin-bottom: 8px;
        }
        .timer {
            font-size: 14px;
            opacity: 0.95;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1>🎉 Congratulations!</h1>
            <p>You Have Been Approved for Second Chance Housing</p>
        </div>

        <!-- Main Content -->
        <div class="content">
            <div class="greeting">Hi {{customerName}},</div>

            <p>Great news! We're excited to inform you that <strong>you have been pre-approved</strong> for our Second Chance Housing program. Your personalized rental search results for <strong>{{city}}</strong> are ready and waiting for you.</p>

            <!-- Approval Badge -->
            <div class="approval-badge">
                <p>✓ Your Application Has Been Approved</p>
            </div>

            <!-- What You Get Section -->
            <div class="section">
                <div class="section-title">What You Get Access To:</div>
                <ul class="benefits-list">
                    <li>100+ verified rental properties in {{city}}</li>
                    <li>Properties specifically matched to your credit profile</li>
                    <li>Direct contact information for landlords</li>
                    <li>Second chance programs and corporate leasing options</li>
                    <li>Complete application guidance</li>
                    <li>24/7 support from our team</li>
                </ul>
            </div>

            <!-- Urgency Box -->
            <div class="urgency-box">
                <strong>⏰ Limited Time Offer</strong>
                <div class="timer">Your approval is valid for the next 24 hours. Complete your order now to lock in your results.</div>
            </div>

            <!-- Next Steps -->
            <div class="section">
                <div class="section-title">Next Steps:</div>
                <div class="section-content">
                    <p>1. <strong>Review Your Matches</strong> - See all properties matched to your profile</p>
                    <p>2. <strong>Contact Properties</strong> - Reach out to landlords directly</p>
                    <p>3. <strong>Apply with Confidence</strong> - We'll guide you through the application process</p>
                </div>
            </div>

            <!-- CTA Button -->
            <div style="text-align: center;">
                <a href="{{checkoutLink}}" class="cta-button">View Your Approved Matches Now</a>
            </div>

            <!-- Highlight Box -->
            <div class="highlight">
                <strong>Why Second Chance Housing?</strong>
                <p style="margin: 10px 0 0 0;">We specialize in helping renters with credit challenges find quality housing. Our AI-powered matching system connects you with landlords who accept second chance applications. Your approval means we've already verified that properties in our network are willing to work with your credit profile.</p>
            </div>

            <!-- Support Section -->
            <div class="section">
                <div class="section-title">Need Help?</div>
                <div class="section-content">
                    <p>Our support team is available 24/7 to answer any questions:</p>
                    <p>📧 Email: support@secondchancehousinglocator.com<br>
                    📞 Phone: Available in your account dashboard<br>
                    💬 Chat: Live chat support on our website</p>
                </div>
            </div>

            <!-- Closing -->
            <p style="margin-top: 30px; color: #666;">We believe everyone deserves a second chance and access to quality housing. Let's find you the perfect home!</p>
            <p style="margin-top: 5px; color: #999; font-size: 14px;">Best regards,<br><strong>The Second Chance Housing Locator Team</strong></p>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p style="margin: 0 0 10px 0;">© 2026 Second Chance Housing Locator. All rights reserved.</p>
            <p style="margin: 0;">
                <a href="https://www.secondchancehousinglocator.com/privacy">Privacy Policy</a> | 
                <a href="https://www.secondchancehousinglocator.com/terms">Terms of Service</a> | 
                <a href="https://www.secondchancehousinglocator.com/unsubscribe">Unsubscribe</a>
            </p>
            <p style="margin: 10px 0 0 0; color: #ccc;">This is an automated message. Please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>
  `,

  bodyText: `
CONGRATULATIONS! YOU HAVE BEEN APPROVED FOR SECOND CHANCE HOUSING

Hi {{customerName}},

Great news! We're excited to inform you that you have been pre-approved for our Second Chance Housing program. Your personalized rental search results for {{city}} are ready and waiting for you.

✓ YOUR APPLICATION HAS BEEN APPROVED

WHAT YOU GET ACCESS TO:
- 100+ verified rental properties in {{city}}
- Properties specifically matched to your credit profile
- Direct contact information for landlords
- Second chance programs and corporate leasing options
- Complete application guidance
- 24/7 support from our team

⏰ LIMITED TIME OFFER
Your approval is valid for the next 24 hours. Complete your order now to lock in your results.

NEXT STEPS:
1. Review Your Matches - See all properties matched to your profile
2. Contact Properties - Reach out to landlords directly
3. Apply with Confidence - We'll guide you through the application process

VIEW YOUR APPROVED MATCHES NOW:
{{checkoutLink}}

WHY SECOND CHANCE HOUSING?
We specialize in helping renters with credit challenges find quality housing. Our AI-powered matching system connects you with landlords who accept second chance applications. Your approval means we've already verified that properties in our network are willing to work with your credit profile.

NEED HELP?
Our support team is available 24/7 to answer any questions:
📧 Email: support@secondchancehousinglocator.com
📞 Phone: Available in your account dashboard
💬 Chat: Live chat support on our website

We believe everyone deserves a second chance and access to quality housing. Let's find you the perfect home!

Best regards,
The Second Chance Housing Locator Team

© 2026 Second Chance Housing Locator. All rights reserved.
Privacy Policy: https://www.secondchancehousinglocator.com/privacy
Terms of Service: https://www.secondchancehousinglocator.com/terms
Unsubscribe: https://www.secondchancehousinglocator.com/unsubscribe
  `,

  includeCustomerName: true,
  includeCartValue: false,
  includeCartItems: false,
  includeCountdown: true,
  countdownHours: 24,
  ctaText: "View Your Approved Matches Now",
  ctaButtonColor: "#0066cc",
  isActive: true,
};
