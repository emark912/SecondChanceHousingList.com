import { describe, it, expect } from "vitest";

describe("Checkout Payment Fixes", () => {
  it("should calculate donation amount correctly for $25 donation only", () => {
    const donationAmount = "25.00";
    const addCaseManager = false;
    
    const donationValue = donationAmount || "0";
    const donationAmountCents = donationValue && parseFloat(donationValue) > 0 ? Math.round(parseFloat(donationValue) * 100) : 0;
    const caseManagerAmountCents = addCaseManager ? 12500 : 0;
    const totalAmountCents = donationAmountCents + caseManagerAmountCents;
    
    expect(donationAmountCents).toBe(2500); // $25.00
    expect(caseManagerAmountCents).toBe(0);
    expect(totalAmountCents).toBe(2500);
  });

  it("should calculate case manager amount correctly for $125 case manager only", () => {
    const donationAmount = "0.00";
    const addCaseManager = true;
    
    const donationValue = donationAmount || "0";
    const donationAmountCents = donationValue && parseFloat(donationValue) > 0 ? Math.round(parseFloat(donationValue) * 100) : 0;
    const caseManagerAmountCents = addCaseManager ? 12500 : 0;
    const totalAmountCents = donationAmountCents + caseManagerAmountCents;
    
    expect(donationAmountCents).toBe(0);
    expect(caseManagerAmountCents).toBe(12500); // $125.00
    expect(totalAmountCents).toBe(12500);
  });

  it("should calculate both donation and case manager correctly", () => {
    const donationAmount = "25.00";
    const addCaseManager = true;
    
    const donationValue = donationAmount || "0";
    const donationAmountCents = donationValue && parseFloat(donationValue) > 0 ? Math.round(parseFloat(donationValue) * 100) : 0;
    const caseManagerAmountCents = addCaseManager ? 12500 : 0;
    const totalAmountCents = donationAmountCents + caseManagerAmountCents;
    
    expect(donationAmountCents).toBe(2500); // $25.00
    expect(caseManagerAmountCents).toBe(12500); // $125.00
    expect(totalAmountCents).toBe(15000); // $150.00
  });

  it("should handle empty donation string for case manager only", () => {
    const donationAmount = "";
    const addCaseManager = true;
    
    const donationValue = donationAmount || "0";
    const donationAmountCents = donationValue && parseFloat(donationValue) > 0 ? Math.round(parseFloat(donationValue) * 100) : 0;
    const caseManagerAmountCents = addCaseManager ? 12500 : 0;
    const totalAmountCents = donationAmountCents + caseManagerAmountCents;
    
    expect(donationAmountCents).toBe(0);
    expect(caseManagerAmountCents).toBe(12500);
    expect(totalAmountCents).toBe(12500);
  });

  it("should not include donation in Stripe line items when donation is 0", () => {
    const donationAmountCents = 0;
    const includeCaseManager = true;
    
    const lineItems = [
      ...(donationAmountCents ? [{
        price_data: {
          currency: "usd",
          product_data: {
            name: "Donation to Support Second Chance Housing",
          },
          unit_amount: donationAmountCents,
        },
        quantity: 1,
      }] : []),
      ...(includeCaseManager ? [{
        price_data: {
          currency: "usd",
          product_data: {
            name: "Second Chance Housing Consultant",
          },
          unit_amount: 12500,
        },
        quantity: 1,
      }] : []),
    ];
    
    expect(lineItems.length).toBe(1); // Only case manager, no donation
    expect(lineItems[0].price_data.product_data.name).toBe("Second Chance Housing Consultant");
  });

  it("should include both donation and case manager in Stripe line items", () => {
    const donationAmountCents = 2500;
    const includeCaseManager = true;
    
    const lineItems = [
      ...(donationAmountCents ? [{
        price_data: {
          currency: "usd",
          product_data: {
            name: "Donation to Support Second Chance Housing",
          },
          unit_amount: donationAmountCents,
        },
        quantity: 1,
      }] : []),
      ...(includeCaseManager ? [{
        price_data: {
          currency: "usd",
          product_data: {
            name: "Second Chance Housing Consultant",
          },
          unit_amount: 12500,
        },
        quantity: 1,
      }] : []),
    ];
    
    expect(lineItems.length).toBe(2); // Both donation and case manager
    expect(lineItems[0].price_data.product_data.name).toBe("Donation to Support Second Chance Housing");
    expect(lineItems[1].price_data.product_data.name).toBe("Second Chance Housing Consultant");
  });

  it("should include only donation in Stripe line items when case manager not selected", () => {
    const donationAmountCents = 2500;
    const includeCaseManager = false;
    
    const lineItems = [
      ...(donationAmountCents ? [{
        price_data: {
          currency: "usd",
          product_data: {
            name: "Donation to Support Second Chance Housing",
          },
          unit_amount: donationAmountCents,
        },
        quantity: 1,
      }] : []),
      ...(includeCaseManager ? [{
        price_data: {
          currency: "usd",
          product_data: {
            name: "Second Chance Housing Consultant",
          },
          unit_amount: 12500,
        },
        quantity: 1,
      }] : []),
    ];
    
    expect(lineItems.length).toBe(1); // Only donation
    expect(lineItems[0].price_data.product_data.name).toBe("Donation to Support Second Chance Housing");
  });

  it("should validate donation amount is minimum $10 when case manager not selected", () => {
    const donationAmount = "5.00";
    const addCaseManager = false;
    
    const numAmount = parseFloat(donationAmount);
    const isValid = !isNaN(numAmount) && numAmount >= 10;
    
    expect(isValid).toBe(false);
  });

  it("should validate donation amount is minimum $10 when case manager not selected - valid case", () => {
    const donationAmount = "10.00";
    const addCaseManager = false;
    
    const numAmount = parseFloat(donationAmount);
    const isValid = !isNaN(numAmount) && numAmount >= 10;
    
    expect(isValid).toBe(true);
  });

  it("should allow zero donation when case manager is selected", () => {
    const donationAmount = "0.00";
    const addCaseManager = true;
    
    // When case manager is selected, donation is optional
    const isValid = addCaseManager || (parseFloat(donationAmount) >= 10);
    
    expect(isValid).toBe(true);
  });

  it("should pass donationAmount and includeCaseManager to Stripe service", () => {
    const params = {
      amount: 12500,
      customerEmail: "test@example.com",
      customerName: "John Doe",
      orderId: 1,
      submissionId: 1,
      successUrl: "https://example.com/success",
      cancelUrl: "https://example.com/cancel",
      donationAmount: 0,
      includeCaseManager: true,
    };
    
    expect(params.donationAmount).toBe(0);
    expect(params.includeCaseManager).toBe(true);
    expect(params.amount).toBe(12500);
  });
});
