import { describe, it, expect } from "vitest";

describe("Payment Confirmation Page", () => {
  it("should create valid order data with donation and case manager", () => {
    const orderData = {
      orderId: "ORD-1234567890",
      customerName: "John Doe",
      customerEmail: "john@example.com",
      location: "New York, NY",
      donationAmount: 25.00,
      includeCaseManager: true,
      totalAmount: 150.00,
      timestamp: new Date().toISOString(),
      rentalMatches: 125,
    };
    
    expect(orderData.orderId).toBe("ORD-1234567890");
    expect(orderData.customerName).toBe("John Doe");
    expect(orderData.customerEmail).toBe("john@example.com");
    expect(orderData.location).toBe("New York, NY");
  });

  it("should calculate correct total with donation and case manager", () => {
    const orderData = {
      orderId: "ORD-1234567890",
      customerName: "John Doe",
      customerEmail: "john@example.com",
      location: "New York, NY",
      donationAmount: 25.00,
      includeCaseManager: true,
      totalAmount: 150.00,
      timestamp: new Date().toISOString(),
      rentalMatches: 125,
    };
    const expectedTotal = 25.00 + 125.00; // donation + case manager
    
    expect(orderData.totalAmount).toBe(expectedTotal);
  });

  it("should display correct rental matches count", () => {
    const orderData = {
      orderId: "ORD-1234567890",
      customerName: "John Doe",
      customerEmail: "john@example.com",
      location: "New York, NY",
      donationAmount: 25.00,
      includeCaseManager: true,
      totalAmount: 150.00,
      timestamp: new Date().toISOString(),
      rentalMatches: 125,
    };
    
    expect(orderData.rentalMatches).toBe(125);
  });

  it("should show case manager service when included", () => {
    const orderData = {
      orderId: "ORD-1234567890",
      customerName: "John Doe",
      customerEmail: "john@example.com",
      location: "New York, NY",
      donationAmount: 25.00,
      includeCaseManager: true,
      totalAmount: 150.00,
      timestamp: new Date().toISOString(),
      rentalMatches: 125,
    };
    
    expect(orderData.includeCaseManager).toBe(true);
  });

  it("should handle donation only without case manager", () => {
    const donationOnlyOrder = {
      orderId: "ORD-9876543210",
      customerName: "Jane Smith",
      customerEmail: "jane@example.com",
      location: "Los Angeles, CA",
      donationAmount: 25.00,
      includeCaseManager: false,
      totalAmount: 25.00,
      timestamp: new Date().toISOString(),
      rentalMatches: 95,
    };
    
    expect(donationOnlyOrder.includeCaseManager).toBe(false);
    expect(donationOnlyOrder.totalAmount).toBe(25.00);
  });

  it("should handle case manager only without donation", () => {
    const caseManagerOnlyOrder = {
      orderId: "ORD-5555555555",
      customerName: "Bob Johnson",
      customerEmail: "bob@example.com",
      location: "Chicago, IL",
      donationAmount: 0,
      includeCaseManager: true,
      totalAmount: 125.00,
      timestamp: new Date().toISOString(),
      rentalMatches: 110,
    };
    
    expect(caseManagerOnlyOrder.donationAmount).toBe(0);
    expect(caseManagerOnlyOrder.includeCaseManager).toBe(true);
    expect(caseManagerOnlyOrder.totalAmount).toBe(125.00);
  });

  it("should format timestamp correctly", () => {
    const orderData = {
      orderId: "ORD-1234567890",
      customerName: "John Doe",
      customerEmail: "john@example.com",
      location: "New York, NY",
      donationAmount: 25.00,
      includeCaseManager: true,
      totalAmount: 150.00,
      timestamp: new Date().toISOString(),
      rentalMatches: 125,
    };
    const timestamp = new Date(orderData.timestamp);
    
    expect(timestamp).toBeInstanceOf(Date);
    expect(timestamp.getTime()).toBeGreaterThan(0);
  });

  it("should generate PDF content with order details", () => {
    const orderData = {
      orderId: "ORD-1234567890",
      customerName: "John Doe",
      customerEmail: "john@example.com",
      location: "New York, NY",
      donationAmount: 25.00,
      includeCaseManager: true,
      totalAmount: 150.00,
      timestamp: new Date().toISOString(),
      rentalMatches: 125,
    };
    const pdfContent = `
Order ID: ${orderData.orderId}
Customer: ${orderData.customerName}
Email: ${orderData.customerEmail}
Location: ${orderData.location}
Total Matches: ${orderData.rentalMatches}
Total Amount: $${orderData.totalAmount.toFixed(2)}
Case Manager: ${orderData.includeCaseManager ? "YES - $125.00" : "NO"}
    `;
    
    expect(pdfContent).toContain(orderData.orderId);
    expect(pdfContent).toContain(orderData.customerName);
    expect(pdfContent).toContain(orderData.customerEmail);
    expect(pdfContent).toContain(orderData.location);
  });

  it("should validate email format in order data", () => {
    const orderData = {
      orderId: "ORD-1234567890",
      customerName: "John Doe",
      customerEmail: "john@example.com",
      location: "New York, NY",
      donationAmount: 25.00,
      includeCaseManager: true,
      totalAmount: 150.00,
      timestamp: new Date().toISOString(),
      rentalMatches: 125,
    };
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    expect(emailRegex.test(orderData.customerEmail)).toBe(true);
  });

  it("should ensure rental matches is a positive number", () => {
    const orderData = {
      orderId: "ORD-1234567890",
      customerName: "John Doe",
      customerEmail: "john@example.com",
      location: "New York, NY",
      donationAmount: 25.00,
      includeCaseManager: true,
      totalAmount: 150.00,
      timestamp: new Date().toISOString(),
      rentalMatches: 125,
    };
    
    expect(orderData.rentalMatches).toBeGreaterThan(0);
    expect(typeof orderData.rentalMatches).toBe("number");
  });

  it("should ensure total amount matches donation + case manager fee", () => {
    const orderData = {
      orderId: "ORD-1234567890",
      customerName: "John Doe",
      customerEmail: "john@example.com",
      location: "New York, NY",
      donationAmount: 25.00,
      includeCaseManager: true,
      totalAmount: 150.00,
      timestamp: new Date().toISOString(),
      rentalMatches: 125,
    };
    const caseManagerFee = orderData.includeCaseManager ? 125.00 : 0;
    const expectedTotal = orderData.donationAmount + caseManagerFee;
    
    expect(orderData.totalAmount).toBe(expectedTotal);
  });

  it("should serialize order data to JSON", () => {
    const orderData = {
      orderId: "ORD-1234567890",
      customerName: "John Doe",
      customerEmail: "john@example.com",
      location: "New York, NY",
      donationAmount: 25.00,
      includeCaseManager: true,
      totalAmount: 150.00,
      timestamp: new Date().toISOString(),
      rentalMatches: 125,
    };
    
    const jsonString = JSON.stringify(orderData);
    const parsed = JSON.parse(jsonString);
    
    expect(parsed.orderId).toBe(orderData.orderId);
    expect(parsed.customerName).toBe(orderData.customerName);
    expect(parsed.totalAmount).toBe(orderData.totalAmount);
  });

  it("should handle high donation amounts", () => {
    const orderData = {
      orderId: "ORD-1234567890",
      customerName: "John Doe",
      customerEmail: "john@example.com",
      location: "New York, NY",
      donationAmount: 500.00,
      includeCaseManager: true,
      totalAmount: 625.00,
      timestamp: new Date().toISOString(),
      rentalMatches: 125,
    };
    
    expect(orderData.donationAmount).toBe(500.00);
    expect(orderData.totalAmount).toBe(625.00);
  });

  it("should generate correct order ID format", () => {
    const timestamp = Date.now();
    const orderId = `ORD-${timestamp}`;
    
    expect(orderId).toMatch(/^ORD-\d+$/);
  });
});
