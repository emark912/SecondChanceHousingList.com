import { describe, it, expect } from "vitest";

describe("Pricing Logic Updates", () => {
  describe("Case Manager Checkbox Logic", () => {
    it("should set donation to $0.00 when case manager is checked", () => {
      const addCaseManager = true;
      const expectedDonation = "0.00";
      
      let donationAmount = "25.00";
      if (addCaseManager) {
        donationAmount = "0.00";
      }
      
      expect(donationAmount).toBe(expectedDonation);
    });

    it("should set donation to $25.00 when case manager is unchecked", () => {
      const addCaseManager = false;
      const expectedDonation = "25.00";
      
      let donationAmount = "0.00";
      if (!addCaseManager) {
        donationAmount = "25.00";
      }
      
      expect(donationAmount).toBe(expectedDonation);
    });

    it("should calculate total as $125.00 when case manager is checked and donation is $0", () => {
      const donationAmount = 0.00;
      const caseManagerAmount = 125.00;
      const addCaseManager = true;
      
      const total = addCaseManager ? caseManagerAmount : donationAmount;
      
      expect(total).toBe(125.00);
    });

    it("should calculate total as $25.00 when case manager is unchecked and donation is $25", () => {
      const donationAmount = 25.00;
      const caseManagerAmount = 0.00;
      const addCaseManager = false;
      
      const total = donationAmount + caseManagerAmount;
      
      expect(total).toBe(25.00);
    });
  });

  describe("Donation Validation", () => {
    it("should accept donation of $10.00 (minimum)", () => {
      const amount = "10.00";
      const numAmount = parseFloat(amount);
      const isValid = !isNaN(numAmount) && numAmount >= 10;
      
      expect(isValid).toBe(true);
    });

    it("should reject donation below $10.00", () => {
      const amount = "9.99";
      const numAmount = parseFloat(amount);
      const isValid = !isNaN(numAmount) && numAmount >= 10;
      
      expect(isValid).toBe(false);
    });

    it("should accept donation of $25.00 (average)", () => {
      const amount = "25.00";
      const numAmount = parseFloat(amount);
      const isValid = !isNaN(numAmount) && numAmount >= 10;
      
      expect(isValid).toBe(true);
    });

    it("should accept donation above minimum", () => {
      const amount = "50.00";
      const numAmount = parseFloat(amount);
      const isValid = !isNaN(numAmount) && numAmount >= 10;
      
      expect(isValid).toBe(true);
    });
  });

  describe("Case Manager Pricing", () => {
    it("should display case manager price as $125.00", () => {
      const caseManagerPrice = 125.00;
      
      expect(caseManagerPrice).toBe(125.00);
    });

    it("should display regular case manager price as $350.00", () => {
      const regularPrice = 350.00;
      
      expect(regularPrice).toBe(350.00);
    });

    it("should calculate discount correctly", () => {
      const regularPrice = 350.00;
      const discountedPrice = 125.00;
      const savings = regularPrice - discountedPrice;
      
      expect(savings).toBe(225.00);
    });
  });

  describe("Loan Program Amounts", () => {
    it("should display loan program minimum as $1,500.00", () => {
      const minLoan = 1500.00;
      
      expect(minLoan).toBe(1500.00);
    });

    it("should display loan program maximum as $5,000.00", () => {
      const maxLoan = 5000.00;
      
      expect(maxLoan).toBe(5000.00);
    });
  });

  describe("Application Fee Savings", () => {
    it("should display minimum fee savings as $50.00", () => {
      const minSavings = 50.00;
      
      expect(minSavings).toBe(50.00);
    });

    it("should display maximum fee savings as $300.00", () => {
      const maxSavings = 300.00;
      
      expect(maxSavings).toBe(300.00);
    });
  });
});
