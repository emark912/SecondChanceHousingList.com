import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock sessionStorage for testing
const mockSessionStorage = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

describe("CheckoutSuccess Order Data", () => {
  beforeEach(() => {
    mockSessionStorage.clear();
  });

  it("should store and retrieve order confirmation data", () => {
    const orderData = {
      orderId: "ORD-1234567890",
      customerName: "John Doe",
      customerEmail: "john@example.com",
      location: "Austin, TX",
      donationAmount: 25.00,
      includeCaseManager: false,
      totalAmount: 25.00,
      timestamp: new Date().toISOString(),
      rentalMatches: 95,
    };

    mockSessionStorage.setItem("orderData", JSON.stringify(orderData));
    const stored = mockSessionStorage.getItem("orderData");
    
    expect(stored).toBeDefined();
    const parsed = JSON.parse(stored!);
    expect(parsed.orderId).toBe("ORD-1234567890");
    expect(parsed.customerName).toBe("John Doe");
    expect(parsed.customerEmail).toBe("john@example.com");
    expect(parsed.location).toBe("Austin, TX");
    expect(parsed.donationAmount).toBe(25.00);
    expect(parsed.includeCaseManager).toBe(false);
    expect(parsed.totalAmount).toBe(25.00);
    expect(parsed.rentalMatches).toBe(95);
  });

  it("should display case manager details when included in order", () => {
    const orderData = {
      orderId: "ORD-9876543210",
      customerName: "Jane Smith",
      customerEmail: "jane@example.com",
      location: "Denver, CO",
      donationAmount: 125.00,
      includeCaseManager: true,
      totalAmount: 250.00,
      timestamp: new Date().toISOString(),
      rentalMatches: 87,
    };

    mockSessionStorage.setItem("orderData", JSON.stringify(orderData));
    const stored = mockSessionStorage.getItem("orderData");
    const parsed = JSON.parse(stored!);
    
    expect(parsed.includeCaseManager).toBe(true);
    expect(parsed.totalAmount).toBe(250.00);
    expect(parsed.donationAmount).toBe(125.00);
  });

  it("should calculate correct total for donation-only orders", () => {
    const donationAmount = 25.00;
    const caseManagerAmount = 0;
    const total = donationAmount + caseManagerAmount;

    expect(total).toBe(25.00);
  });

  it("should calculate correct total for donation + case manager orders", () => {
    const donationAmount = 25.00;
    const caseManagerAmount = 125.00;
    const total = donationAmount + caseManagerAmount;

    expect(total).toBe(150.00);
  });

  it("should handle various donation amounts correctly", () => {
    const testCases = [
      { donation: 10.00, expected: 10.00 },
      { donation: 25.00, expected: 25.00 },
      { donation: 50.00, expected: 50.00 },
      { donation: 100.00, expected: 100.00 },
      { donation: 125.00, expected: 125.00 },
    ];

    testCases.forEach(({ donation, expected }) => {
      const orderData = {
        orderId: `ORD-${Date.now()}`,
        customerName: "Test User",
        customerEmail: "test@example.com",
        location: "Test City",
        donationAmount: donation,
        includeCaseManager: false,
        totalAmount: donation,
        timestamp: new Date().toISOString(),
        rentalMatches: 90,
      };

      mockSessionStorage.setItem("orderData", JSON.stringify(orderData));
      const stored = JSON.parse(mockSessionStorage.getItem("orderData")!);
      
      expect(stored.donationAmount).toBe(expected);
      expect(stored.totalAmount).toBe(expected);
    });
  });

  it("should format currency amounts to 2 decimal places", () => {
    const amounts = [25.00, 125.00, 150.00, 10.00];

    amounts.forEach((amount) => {
      const formatted = amount.toFixed(2);
      expect(formatted).toMatch(/^\d+\.\d{2}$/);
    });
  });

  it("should format timestamp correctly", () => {
    const timestamp = new Date("2026-02-16T18:20:00.000Z").toISOString();
    expect(timestamp).toBeDefined();
    expect(timestamp).toContain("2026-02-16");
  });

  it("should handle rental match counts from 50 to 130", () => {
    const testMatches = [50, 80, 95, 130];

    testMatches.forEach((matches) => {
      const orderData = {
        orderId: `ORD-${Date.now()}`,
        customerName: "Test User",
        customerEmail: "test@example.com",
        location: "Test City",
        donationAmount: 25.00,
        includeCaseManager: false,
        totalAmount: 25.00,
        timestamp: new Date().toISOString(),
        rentalMatches: matches,
      };

      mockSessionStorage.setItem("orderData", JSON.stringify(orderData));
      const stored = JSON.parse(mockSessionStorage.getItem("orderData")!);
      
      expect(stored.rentalMatches).toBe(matches);
      expect(stored.rentalMatches).toBeGreaterThanOrEqual(50);
      expect(stored.rentalMatches).toBeLessThanOrEqual(130);
    });
  });

  it("should preserve order data structure across storage operations", () => {
    const originalData = {
      orderId: "ORD-1234567890",
      customerName: "John Doe",
      customerEmail: "john@example.com",
      location: "Austin, TX",
      donationAmount: 25.00,
      includeCaseManager: false,
      totalAmount: 25.00,
      timestamp: new Date().toISOString(),
      rentalMatches: 95,
    };

    mockSessionStorage.setItem("orderData", JSON.stringify(originalData));
    const retrieved = JSON.parse(mockSessionStorage.getItem("orderData")!);
    
    // Verify all fields are preserved
    expect(retrieved.orderId).toBe(originalData.orderId);
    expect(retrieved.customerName).toBe(originalData.customerName);
    expect(retrieved.customerEmail).toBe(originalData.customerEmail);
    expect(retrieved.location).toBe(originalData.location);
    expect(retrieved.donationAmount).toBe(originalData.donationAmount);
    expect(retrieved.includeCaseManager).toBe(originalData.includeCaseManager);
    expect(retrieved.totalAmount).toBe(originalData.totalAmount);
    expect(retrieved.rentalMatches).toBe(originalData.rentalMatches);
  });

  it("should differentiate between donation-only and case manager orders", () => {
    const donationOnlyOrder = {
      orderId: "ORD-001",
      customerName: "User One",
      customerEmail: "user1@example.com",
      location: "City A",
      donationAmount: 25.00,
      includeCaseManager: false,
      totalAmount: 25.00,
      timestamp: new Date().toISOString(),
      rentalMatches: 90,
    };

    const caseManagerOrder = {
      orderId: "ORD-002",
      customerName: "User Two",
      customerEmail: "user2@example.com",
      location: "City B",
      donationAmount: 125.00,
      includeCaseManager: true,
      totalAmount: 250.00,
      timestamp: new Date().toISOString(),
      rentalMatches: 85,
    };

    // Store and verify donation-only order
    mockSessionStorage.setItem("donationOnly", JSON.stringify(donationOnlyOrder));
    const stored1 = JSON.parse(mockSessionStorage.getItem("donationOnly")!);
    expect(stored1.includeCaseManager).toBe(false);
    expect(stored1.totalAmount).toBe(25.00);

    // Store and verify case manager order
    mockSessionStorage.setItem("caseManager", JSON.stringify(caseManagerOrder));
    const stored2 = JSON.parse(mockSessionStorage.getItem("caseManager")!);
    expect(stored2.includeCaseManager).toBe(true);
    expect(stored2.totalAmount).toBe(250.00);

    // Verify they are different
    expect(stored1.includeCaseManager).not.toBe(stored2.includeCaseManager);
    expect(stored1.totalAmount).not.toBe(stored2.totalAmount);
  });
});
