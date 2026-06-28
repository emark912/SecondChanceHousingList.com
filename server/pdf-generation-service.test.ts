import { describe, it, expect } from "vitest";
import { generateHousingListPDF, FormSubmissionData } from "./pdf-generation-service";

describe("PDF Generation Service", () => {
  it("should generate a PDF buffer from form submission data", async () => {
    const testData: FormSubmissionData = {
      fullName: "John Doe",
      email: "john@example.com",
      location: "Atlanta, Georgia",
      creditChallenges: ["Low Credit Score", "Evictions"],
      housingTypes: ["Apartment", "Townhome"],
      bedrooms: 2,
      criminalHistory: "Yes",
      evictions: "Yes",
      income: "45000",
      monthlyBudget: "1500",
      monthlyIncome: "3500",
    };

    const pdfBuffer = await generateHousingListPDF(testData);

    expect(pdfBuffer).toBeDefined();
    expect(Buffer.isBuffer(pdfBuffer)).toBe(true);
    expect(pdfBuffer.length).toBeGreaterThan(0);
    // PDF should start with PDF header
    expect(pdfBuffer.toString("utf8", 0, 4)).toBe("%PDF");
  });

  it("should handle missing optional fields", async () => {
    const testData: FormSubmissionData = {
      fullName: "Jane Smith",
      email: "jane@example.com",
      location: "New York, New York",
      creditChallenges: [],
      housingTypes: [],
    };

    const pdfBuffer = await generateHousingListPDF(testData);

    expect(pdfBuffer).toBeDefined();
    expect(Buffer.isBuffer(pdfBuffer)).toBe(true);
    expect(pdfBuffer.length).toBeGreaterThan(0);
    expect(pdfBuffer.toString("utf8", 0, 4)).toBe("%PDF");
  });

  it("should generate PDF with substantial content for program information", async () => {
    const testData: FormSubmissionData = {
      fullName: "Test User",
      email: "test@example.com",
      location: "Chicago, Illinois",
      creditChallenges: ["Bad Credit"],
      housingTypes: ["House"],
      bedrooms: 3,
    };

    const pdfBuffer = await generateHousingListPDF(testData);

    // PDF should be valid and contain multiple pages with program information
    expect(pdfBuffer).toBeDefined();
    expect(Buffer.isBuffer(pdfBuffer)).toBe(true);
    // PDF should be at least 9KB (contains substantial content with programs)
    expect(pdfBuffer.length).toBeGreaterThan(9000);
    expect(pdfBuffer.toString("utf8", 0, 4)).toBe("%PDF");
  });

  it("should generate PDF successfully with customer name", async () => {
    const customerName = "Alice Johnson";
    const testData: FormSubmissionData = {
      fullName: customerName,
      email: "alice@example.com",
      location: "Los Angeles, California",
      creditChallenges: ["Bankruptcy"],
      housingTypes: ["Apartment"],
    };

    const pdfBuffer = await generateHousingListPDF(testData);

    // PDF should be generated successfully
    expect(pdfBuffer).toBeDefined();
    expect(Buffer.isBuffer(pdfBuffer)).toBe(true);
    expect(pdfBuffer.length).toBeGreaterThan(0);
    expect(pdfBuffer.toString("utf8", 0, 4)).toBe("%PDF");
  });

  it("should generate PDF with customer location data", async () => {
    const location = "Denver, Colorado";
    const testData: FormSubmissionData = {
      fullName: "Bob Wilson",
      email: "bob@example.com",
      location,
      creditChallenges: ["Evictions"],
      housingTypes: ["Townhome"],
    };

    const pdfBuffer = await generateHousingListPDF(testData);

    // PDF should be generated successfully with substantial content
    expect(pdfBuffer).toBeDefined();
    expect(Buffer.isBuffer(pdfBuffer)).toBe(true);
    expect(pdfBuffer.length).toBeGreaterThan(5000);
    expect(pdfBuffer.toString("utf8", 0, 4)).toBe("%PDF");
  });

  it("should generate PDF with financial information", async () => {
    const testData: FormSubmissionData = {
      fullName: "Carol Davis",
      email: "carol@example.com",
      location: "Miami, Florida",
      creditChallenges: ["Low Credit Score"],
      housingTypes: ["Apartment"],
      income: "50000",
      monthlyBudget: "1800",
      monthlyIncome: "4000",
    };

    const pdfBuffer = await generateHousingListPDF(testData);

    // PDF should be generated successfully with financial information
    expect(pdfBuffer).toBeDefined();
    expect(Buffer.isBuffer(pdfBuffer)).toBe(true);
    // PDF with financial info should be larger
    expect(pdfBuffer.length).toBeGreaterThan(7000);
    expect(pdfBuffer.toString("utf8", 0, 4)).toBe("%PDF");
  });
});
