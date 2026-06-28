import { describe, it, expect } from "vitest";

describe("Case Manager Donation Validation", () => {
  /**
   * Simulate the validation logic from ResultsCheckout
   */
  const validateDonation = (amount: string, isCaseManagerSelected: boolean): boolean => {
    // If case manager is selected, donation is optional
    if (isCaseManagerSelected) {
      return true;
    }
    
    // If no case manager, donation is required with minimum $10
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount < 10) {
      return false;
    }
    return true;
  };

  describe("Case Manager Selected (Donation Optional)", () => {
    it("should allow empty donation when case manager is selected", () => {
      const result = validateDonation("", true);
      expect(result).toBe(true);
    });

    it("should allow zero donation when case manager is selected", () => {
      const result = validateDonation("0", true);
      expect(result).toBe(true);
    });

    it("should allow any positive donation when case manager is selected", () => {
      const result = validateDonation("5.00", true);
      expect(result).toBe(true);
    });

    it("should allow $25 donation when case manager is selected", () => {
      const result = validateDonation("25.00", true);
      expect(result).toBe(true);
    });
  });

  describe("Case Manager Not Selected (Donation Required)", () => {
    it("should reject empty donation when case manager not selected", () => {
      const result = validateDonation("", false);
      expect(result).toBe(false);
    });

    it("should reject zero donation when case manager not selected", () => {
      const result = validateDonation("0", false);
      expect(result).toBe(false);
    });

    it("should reject donation below $10 when case manager not selected", () => {
      const result = validateDonation("5.00", false);
      expect(result).toBe(false);
    });

    it("should accept $10 donation when case manager not selected", () => {
      const result = validateDonation("10.00", false);
      expect(result).toBe(true);
    });

    it("should accept $25 donation when case manager not selected", () => {
      const result = validateDonation("25.00", false);
      expect(result).toBe(true);
    });

    it("should accept $100 donation when case manager not selected", () => {
      const result = validateDonation("100.00", false);
      expect(result).toBe(true);
    });
  });

  describe("Checkout Amount Calculations", () => {
    it("should calculate total as $125 for case manager only (no donation)", () => {
      const donationValue = "";
      const donationAmountCents = Math.round(parseFloat(donationValue || "0") * 100);
      const caseManagerAmountCents = 12500; // $125.00
      const totalAmountCents = donationAmountCents + caseManagerAmountCents;
      
      expect(totalAmountCents).toBe(12500);
      expect(totalAmountCents / 100).toBe(125);
    });

    it("should calculate total as $150 for case manager + $25 donation", () => {
      const donationValue = "25.00";
      const donationAmountCents = Math.round(parseFloat(donationValue) * 100);
      const caseManagerAmountCents = 12500; // $125.00
      const totalAmountCents = donationAmountCents + caseManagerAmountCents;
      
      expect(totalAmountCents).toBe(15000);
      expect(totalAmountCents / 100).toBe(150);
    });

    it("should calculate total as $25 for donation only (no case manager)", () => {
      const donationValue = "25.00";
      const donationAmountCents = Math.round(parseFloat(donationValue) * 100);
      const caseManagerAmountCents = 0; // No case manager
      const totalAmountCents = donationAmountCents + caseManagerAmountCents;
      
      expect(totalAmountCents).toBe(2500);
      expect(totalAmountCents / 100).toBe(25);
    });

    it("should calculate total as $10 for minimum donation only", () => {
      const donationValue = "10.00";
      const donationAmountCents = Math.round(parseFloat(donationValue) * 100);
      const caseManagerAmountCents = 0; // No case manager
      const totalAmountCents = donationAmountCents + caseManagerAmountCents;
      
      expect(totalAmountCents).toBe(1000);
      expect(totalAmountCents / 100).toBe(10);
    });
  });

  describe("Edge Cases", () => {
    it("should handle NaN gracefully", () => {
      const result = validateDonation("abc", false);
      expect(result).toBe(false);
    });

    it("should handle negative numbers", () => {
      const result = validateDonation("-25.00", false);
      expect(result).toBe(false);
    });

    it("should handle very large donations", () => {
      const result = validateDonation("99999.99", false);
      expect(result).toBe(true);
    });

    it("should handle decimal precision", () => {
      const result = validateDonation("10.01", false);
      expect(result).toBe(true);
    });
  });
});
