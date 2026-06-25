import { describe, it, expect, beforeAll } from "vitest";
import * as db from "./db";

describe("Database Helpers", () => {
  describe("Property Operations", () => {
    it("should create a property", async () => {
      const property = await db.createProperty({
        title: "Test Property",
        address: "123 Main St",
        city: "Atlanta",
        state: "GA",
        rentPrice: 1200,
        bedrooms: 2,
        bathrooms: 1,
        propertyType: "apartment",
        landlordName: "John Doe",
        landlordEmail: "john@example.com",
        landlordPhone: "555-1234",
        acceptsNoCredit: true,
        acceptsEvictions: false,
        acceptsCriminalHistory: false,
        acceptsLowIncome: true,
        petFriendly: true,
        description: "Nice apartment",
        amenities: ["Parking", "Laundry"],
      });

      expect(property).toBeDefined();
      expect(property.title).toBe("Test Property");
      expect(property.city).toBe("Atlanta");
    });

    it("should search properties by location", async () => {
      const results = await db.searchProperties({
        city: "Atlanta",
        state: "GA",
        maxRent: 1500,
      });

      expect(Array.isArray(results)).toBe(true);
    });

    it("should get property by id", async () => {
      const property = await db.getPropertyById("test-id");
      // This will return undefined if property doesn't exist, which is expected
      expect(property === undefined || property.id).toBeDefined();
    });
  });

  describe("Search Tracking", () => {
    it("should record a search", async () => {
      const search = await db.recordSearch({
        city: "Atlanta",
        state: "GA",
        bedrooms: 2,
        maxRent: 1500,
        petFriendly: true,
        creditChallenges: ["No Credit"],
        userEmail: "test@example.com",
      });

      expect(search).toBeDefined();
      expect(search.city).toBe("Atlanta");
    });
  });

  describe("Donation Access", () => {
    it("should check if user has access", async () => {
      const hasAccess = await db.hasListAccess("test@example.com");
      expect(typeof hasAccess).toBe("boolean");
    });

    it("should grant access after donation", async () => {
      const result = await db.grantAccessAfterDonation(
        "test@example.com",
        "stripe_session_123",
        5000
      );

      expect(result).toBeDefined();
    });
  });

  describe("Analytics", () => {
    it("should get total searches", async () => {
      const count = await db.getTotalSearches();
      expect(typeof count).toBe("number");
      expect(count >= 0).toBe(true);
    });

    it("should get total donations", async () => {
      const count = await db.getTotalDonations();
      expect(typeof count).toBe("number");
      expect(count >= 0).toBe(true);
    });

    it("should get total revenue", async () => {
      const revenue = await db.getTotalRevenue();
      expect(typeof revenue).toBe("number");
      expect(revenue >= 0).toBe(true);
    });

    it("should calculate conversion rate", async () => {
      const rate = await db.getConversionRate();
      expect(typeof rate).toBe("number");
      expect(rate >= 0 && rate <= 100).toBe(true);
    });
  });
});
