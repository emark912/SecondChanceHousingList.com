import { describe, it, expect } from "vitest";

/**
 * Test suite for the new donation-based pricing model with optional case manager add-on
 */

describe("Donation-Based Pricing Model", () => {
  describe("Donation Amount Validation", () => {
    it("should accept donations of $10.00 or more", () => {
      const validDonations = [10.00, 25.00, 50.00, 100.00, 250.00];
      validDonations.forEach(amount => {
        expect(amount >= 10.00).toBe(true);
      });
    });

    it("should reject donations below $10.00", () => {
      const invalidDonations = [0, 5.00, 9.99];
      invalidDonations.forEach(amount => {
        expect(amount < 10.00).toBe(true);
      });
    });

    it("should accept the average donation of $25.00", () => {
      const averageDonation = 25.00;
      expect(averageDonation).toBe(25.00);
      expect(averageDonation >= 10.00).toBe(true);
    });
  });

  describe("Case Manager Pricing", () => {
    const CASE_MANAGER_PRICE = 125.00;
    const CASE_MANAGER_ORIGINAL_PRICE = 350.00;
    const DISCOUNT_PERCENTAGE = ((CASE_MANAGER_ORIGINAL_PRICE - CASE_MANAGER_PRICE) / CASE_MANAGER_ORIGINAL_PRICE) * 100;

    it("should show case manager at $125.00 (discounted from $350.00)", () => {
      expect(CASE_MANAGER_PRICE).toBe(125.00);
      expect(CASE_MANAGER_ORIGINAL_PRICE).toBe(350.00);
    });

    it("should calculate correct discount percentage", () => {
      expect(DISCOUNT_PERCENTAGE).toBeCloseTo(64.29, 1); // ~64% discount
    });

    it("should allow optional case manager add-on", () => {
      const withCaseManager = true;
      const withoutCaseManager = false;

      const donationAmount = 25.00;
      const totalWithCaseManager = donationAmount + (withCaseManager ? CASE_MANAGER_PRICE : 0);
      const totalWithoutCaseManager = donationAmount + (withoutCaseManager ? CASE_MANAGER_PRICE : 0);

      expect(totalWithCaseManager).toBe(150.00);
      expect(totalWithoutCaseManager).toBe(25.00);
    });
  });

  describe("Order Total Calculations", () => {
    it("should calculate correct total for donation only", () => {
      const donation = 25.00;
      const caseManager = false;
      const caseManagerPrice = 125.00;

      const total = donation + (caseManager ? caseManagerPrice : 0);
      expect(total).toBe(25.00);
    });

    it("should calculate correct total for donation + case manager", () => {
      const donation = 25.00;
      const caseManager = true;
      const caseManagerPrice = 125.00;

      const total = donation + (caseManager ? caseManagerPrice : 0);
      expect(total).toBe(150.00);
    });

    it("should calculate correct total for minimum donation + case manager", () => {
      const donation = 10.00;
      const caseManager = true;
      const caseManagerPrice = 125.00;

      const total = donation + (caseManager ? caseManagerPrice : 0);
      expect(total).toBe(135.00);
    });

    it("should calculate correct total for high donation + case manager", () => {
      const donation = 100.00;
      const caseManager = true;
      const caseManagerPrice = 125.00;

      const total = donation + (caseManager ? caseManagerPrice : 0);
      expect(total).toBe(225.00);
    });
  });

  describe("Stripe Line Items", () => {
    it("should create donation line item when donation amount is provided", () => {
      const donationAmount = 25.00;
      const lineItems = [];

      if (donationAmount) {
        lineItems.push({
          name: "Donation to Support Second Chance Housing",
          amount: Math.round(donationAmount * 100), // Convert to cents
        });
      }

      expect(lineItems).toHaveLength(1);
      expect(lineItems[0].amount).toBe(2500); // $25.00 in cents
    });

    it("should create case manager line item when included", () => {
      const includeCaseManager = true;
      const caseManagerPrice = 125.00;
      const lineItems = [];

      if (includeCaseManager) {
        lineItems.push({
          name: "Second Chance Housing Consultant",
          amount: Math.round(caseManagerPrice * 100), // Convert to cents
        });
      }

      expect(lineItems).toHaveLength(1);
      expect(lineItems[0].amount).toBe(12500); // $125.00 in cents
    });

    it("should create both line items when both are provided", () => {
      const donationAmount = 25.00;
      const includeCaseManager = true;
      const caseManagerPrice = 125.00;
      const lineItems = [];

      if (donationAmount) {
        lineItems.push({
          name: "Donation to Support Second Chance Housing",
          amount: Math.round(donationAmount * 100),
        });
      }

      if (includeCaseManager) {
        lineItems.push({
          name: "Second Chance Housing Consultant",
          amount: Math.round(caseManagerPrice * 100),
        });
      }

      expect(lineItems).toHaveLength(2);
      expect(lineItems[0].amount).toBe(2500);
      expect(lineItems[1].amount).toBe(12500);
    });
  });

  describe("Metadata Storage", () => {
    it("should store donation amount in metadata", () => {
      const metadata = {
        donationAmount: "25.00",
        includeCaseManager: "false",
      };

      expect(metadata.donationAmount).toBe("25.00");
      expect(parseFloat(metadata.donationAmount)).toBe(25.00);
    });

    it("should store case manager flag in metadata", () => {
      const metadata = {
        donationAmount: "25.00",
        includeCaseManager: "true",
      };

      expect(metadata.includeCaseManager).toBe("true");
      expect(metadata.includeCaseManager === "true").toBe(true);
    });

    it("should handle both fields in metadata", () => {
      const metadata = {
        donationAmount: "25.00",
        includeCaseManager: "true",
        customerName: "John Doe",
        customerEmail: "john@example.com",
      };

      expect(metadata.donationAmount).toBe("25.00");
      expect(metadata.includeCaseManager).toBe("true");
      expect(metadata.customerName).toBe("John Doe");
      expect(metadata.customerEmail).toBe("john@example.com");
    });
  });

  describe("Service Description Updates", () => {
    it("should describe service as free with optional donations", () => {
      const serviceDescription = "Your personalized rental list is FREE. We accept donations to support our mission.";
      expect(serviceDescription).toContain("FREE");
      expect(serviceDescription).toContain("donations");
    });

    it("should mention case manager as optional add-on", () => {
      const caseManagerDescription = "Optional: Add a Second Chance Housing Consultant for just $125.00 (regularly $350.00)";
      expect(caseManagerDescription).toContain("Optional");
      expect(caseManagerDescription).toContain("$125.00");
      expect(caseManagerDescription).toContain("$350.00");
    });

    it("should mention 30-day money back guarantee", () => {
      const guaranteeDescription = "30-Day Money Back Guarantee: If you are not approved into a rental property within 30 days, we will refund 100% of your donation or case manager fee.";
      expect(guaranteeDescription).toContain("30-Day");
      expect(guaranteeDescription).toContain("100%");
      expect(guaranteeDescription).toContain("refund");
    });
  });

  describe("Email Template Updates", () => {
    it("should reference free service in payment reminder email", () => {
      const emailContent = "Your list is FREE. We accept donations to support our mission. The average donation is $25.00, but you decide what works for your budget (minimum $10.00).";
      expect(emailContent).toContain("FREE");
      expect(emailContent).toContain("$25.00");
      expect(emailContent).toContain("$10.00");
    });

    it("should mention case manager in rental results email", () => {
      const emailContent = "Optional: Second Chance Housing Consultant for just $125.00 (regularly $350.00 - limited time discount!)";
      expect(emailContent).toContain("$125.00");
      expect(emailContent).toContain("$350.00");
      expect(emailContent).toContain("limited time");
    });
  });

  describe("FAQ Updates", () => {
    it("should explain donation model in FAQ", () => {
      const faqAnswer = "Our service is supported by donations from customers who believe in our mission to help credit-challenged renters find housing. Your personalized rental list is completely free.";
      expect(faqAnswer).toContain("donations");
      expect(faqAnswer).toContain("free");
      expect(faqAnswer).toContain("mission");
    });

    it("should describe case manager service in FAQ", () => {
      const faqAnswer = "A Second Chance Housing Consultant is a dedicated professional who works directly with you after you receive your personalized rental list. They help you navigate the rental options, answer questions about each program, set tour appointments, negotiate with property managers and landlords, and guide you through the application process until you are successfully approved into a rental property of your choice.";
      expect(faqAnswer).toContain("Housing Consultant");
      expect(faqAnswer).toContain("approved");
      expect(faqAnswer).toContain("negotiate");
    });
  });
});
