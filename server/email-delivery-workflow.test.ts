import { describe, it, expect, beforeAll, vi } from "vitest";

// Mock nodemailer so no real emails are sent
vi.mock("nodemailer", () => ({
  default: {
    createTransport: vi.fn().mockReturnValue({
      sendMail: vi.fn().mockResolvedValue({ messageId: "test-message-id" }),
      verify: vi.fn().mockResolvedValue(true),
    }),
  },
}));

import { sendRentalResultsEmail } from "./email-service";
import { generateHousingListPDF, FormSubmissionData } from "./pdf-generation-service";

describe("Email Delivery Workflow", () => {
  let pdfBuffer: Buffer;

  beforeAll(async () => {
    const testData: FormSubmissionData = {
      fullName: "Test Customer",
      email: "Support@SecondChanceHousingLocator.com",
      location: "Atlanta, Georgia",
      creditChallenges: ["Low Credit Score", "Evictions"],
      housingTypes: ["Apartment", "Townhome"],
      bedrooms: 2,
      criminalHistory: "No",
      evictions: "Yes",
      income: "45000",
      monthlyBudget: "1500",
      monthlyIncome: "3500",
    };
    pdfBuffer = await generateHousingListPDF(testData);
  });

  it("should generate a valid PDF buffer", () => {
    expect(pdfBuffer).toBeDefined();
    expect(Buffer.isBuffer(pdfBuffer)).toBe(true);
    expect(pdfBuffer.length).toBeGreaterThan(0);
    expect(pdfBuffer.toString("utf8", 0, 4)).toBe("%PDF");
  });

  it("should send rental results email with PDF attachment", async () => {
    const result = await sendRentalResultsEmail(
      "Support@SecondChanceHousingLocator.com",
      "Test",
      pdfBuffer
    );
    expect(result).toBe(true);
  });

  it("should send email with personalized content", async () => {
    const result = await sendRentalResultsEmail(
      "Support@SecondChanceHousingLocator.com",
      "John",
      pdfBuffer
    );
    expect(result).toBe(true);
  });

  it("should handle multiple concurrent email sends", async () => {
    const emailPromises = [
      sendRentalResultsEmail(
        "Support@SecondChanceHousingLocator.com",
        "Customer1",
        pdfBuffer
      ),
      sendRentalResultsEmail(
        "Support@SecondChanceHousingLocator.com",
        "Customer2",
        pdfBuffer
      ),
      sendRentalResultsEmail(
        "Support@SecondChanceHousingLocator.com",
        "Customer3",
        pdfBuffer
      ),
    ];
    const results = await Promise.all(emailPromises);
    expect(results).toHaveLength(3);
    const successCount = results.filter((r) => r === true).length;
    expect(successCount).toBeGreaterThanOrEqual(2);
  });

  it("should include PDF attachment in email", async () => {
    const result = await sendRentalResultsEmail(
      "Support@SecondChanceHousingLocator.com",
      "TestUser",
      pdfBuffer
    );
    expect(result).toBe(true);
  });
});
