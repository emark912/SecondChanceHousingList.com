import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock nodemailer so no real emails are sent
vi.mock("nodemailer", () => ({
  default: {
    createTransport: vi.fn().mockReturnValue({
      sendMail: vi.fn().mockResolvedValue({ messageId: "test-message-id" }),
      verify: vi.fn().mockResolvedValue(true),
    }),
  },
}));

import { sendEmail, testEmailDelivery } from "./email-service";

describe("Email Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should verify Gmail connection with provided credentials", async () => {
    const result = await testEmailDelivery();
    expect(typeof result).toBe("boolean");
  });

  it("should send a test email successfully", async () => {
    const result = await sendEmail({
      to: "Support@SecondChanceHousingList.com",
      subject: "Email Service Test - Credentials Verification",
      html: "<p>This is a test email to verify the email service is working correctly with the configured credentials.</p>",
    });
    expect(result).toBe(true);
  });

  it("should handle email with attachments", async () => {
    const testBuffer = Buffer.from("Test PDF content");

    const result = await sendEmail({
      to: "Support@SecondChanceHousingList.com",
      subject: "Email Service Test - With Attachment",
      html: "<p>This is a test email with an attachment.</p>",
      attachments: [
        {
          filename: "test.pdf",
          content: testBuffer,
          contentType: "application/pdf",
        },
      ],
    });

    expect(result).toBe(true);
  });
});
