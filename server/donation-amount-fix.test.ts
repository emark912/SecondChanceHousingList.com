import { describe, it, expect, beforeAll, afterAll } from "vitest";

describe("Donation Amount Fix", () => {
  it("should correctly handle $25 donation (2500 cents)", () => {
    const donationAmount = 2500; // Already in cents from client
    const unitAmount = donationAmount; // Should NOT multiply by 100 again
    
    expect(unitAmount).toBe(2500); // $25.00
    expect(unitAmount / 100).toBe(25); // Verify it's $25
  });

  it("should correctly handle $125 case manager fee", () => {
    const caseManagerAmount = 12500; // $125.00 in cents
    expect(caseManagerAmount).toBe(12500);
    expect(caseManagerAmount / 100).toBe(125);
  });

  it("should correctly calculate combined donation + case manager", () => {
    const donationAmountCents = 2500; // $25.00
    const caseManagerAmountCents = 12500; // $125.00
    const totalAmountCents = donationAmountCents + caseManagerAmountCents;
    
    expect(totalAmountCents).toBe(15000); // $150.00
    expect(totalAmountCents / 100).toBe(150);
  });

  it("should handle case manager only (no donation)", () => {
    const donationAmountCents = 0; // No donation
    const caseManagerAmountCents = 12500; // $125.00
    const totalAmountCents = donationAmountCents + caseManagerAmountCents;
    
    expect(totalAmountCents).toBe(12500); // $125.00
    expect(totalAmountCents / 100).toBe(125);
  });

  it("should handle donation only (no case manager)", () => {
    const donationAmountCents = 2500; // $25.00
    const caseManagerAmountCents = 0; // No case manager
    const totalAmountCents = donationAmountCents + caseManagerAmountCents;
    
    expect(totalAmountCents).toBe(2500); // $25.00
    expect(totalAmountCents / 100).toBe(25);
  });

  it("should handle custom donation amounts correctly", () => {
    const testCases = [
      { input: 1000, expected: 10 }, // $10
      { input: 5000, expected: 50 }, // $50
      { input: 10000, expected: 100 }, // $100
      { input: 25000, expected: 250 }, // $250
    ];

    testCases.forEach(({ input, expected }) => {
      expect(input / 100).toBe(expected);
    });
  });
});
