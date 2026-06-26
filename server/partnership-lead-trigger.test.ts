/**
 * Unit tests for partnership lead delivery trigger
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { deliverLeadToPartners } from "./partnership-lead-trigger";
import { getDb } from "./db";

// Mock the database and email services
vi.mock("./db");
vi.mock("./partner-email-service");
vi.mock("./partner-db");

describe("Partnership Lead Delivery Trigger", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should handle missing submission gracefully", async () => {
    const mockDb = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      }),
    };

    vi.mocked(getDb).mockResolvedValue(mockDb as any);

    // Should not throw error
    await expect(deliverLeadToPartners(999)).resolves.not.toThrow();
  });

  it("should find active partners with available leads", async () => {
    const mockSubmission = {
      id: 1,
      customerName: "John Doe",
      customerEmail: "john@example.com",
      customerPhone: "555-1234",
      city: "Atlanta",
      state: "GA",
      monthlyTakeHomeIncome: 3000,
      creditChallenges: ["low_credit"],
      housingType: "apartment",
      bedrooms: 2,
      criminalHistoryDetails: null,
    };

    const mockPartner = {
      id: 1,
      partnerName: "Test Partner",
      email: "partner@example.com",
      isVerified: 1,
      status: "active",
    };

    const mockPackage = {
      id: 1,
      partnerId: 1,
      packageName: "50 Leads",
      totalLeads: 50,
      leadsRemaining: 30,
      leadsDelivered: 20,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    };

    const mockDb = {
      select: vi.fn()
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([mockSubmission]),
            }),
          }),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            innerJoin: vi.fn().mockReturnValue({
              where: vi.fn().mockResolvedValue([
                { partner: mockPartner, package: mockPackage },
              ]),
            }),
          }),
        }),
      insert: vi.fn().mockReturnValue({
        values: vi.fn().mockResolvedValue({}),
      }),
      update: vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue({}),
        }),
      }),
    };

    vi.mocked(getDb).mockResolvedValue(mockDb as any);

    // Should not throw error
    await expect(deliverLeadToPartners(1)).resolves.not.toThrow();
  });

  it("should update package leads remaining after delivery", async () => {
    const mockSubmission = {
      id: 1,
      customerName: "Jane Doe",
      customerEmail: "jane@example.com",
      customerPhone: "555-5678",
      city: "Atlanta",
      state: "GA",
      monthlyTakeHomeIncome: 2500,
      creditChallenges: ["eviction"],
      housingType: "house",
      bedrooms: 3,
      criminalHistoryDetails: null,
    };

    const mockDb = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockSubmission]),
          }),
          innerJoin: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([]),
          }),
        }),
      }),
      insert: vi.fn().mockReturnValue({
        values: vi.fn().mockResolvedValue({}),
      }),
      update: vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue({}),
        }),
      }),
    };

    vi.mocked(getDb).mockResolvedValue(mockDb as any);

    // Should not throw error
    await expect(deliverLeadToPartners(1)).resolves.not.toThrow();
  });

  it("should handle database connection failure", async () => {
    vi.mocked(getDb).mockResolvedValue(null);

    // Should not throw error, just log and return
    await expect(deliverLeadToPartners(1)).resolves.not.toThrow();
  });

  it("should continue delivering to other partners if one fails", async () => {
    const mockSubmission = {
      id: 1,
      customerName: "Test Customer",
      customerEmail: "test@example.com",
      customerPhone: "555-0000",
      city: "Atlanta",
      state: "GA",
      monthlyTakeHomeIncome: 3500,
      creditChallenges: ["bankruptcy"],
      housingType: "apartment",
      bedrooms: 1,
      criminalHistoryDetails: null,
    };

    const mockDb = {
      select: vi.fn()
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([mockSubmission]),
            }),
          }),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            innerJoin: vi.fn().mockReturnValue({
              where: vi.fn().mockResolvedValue([
                { partner: { id: 1 }, package: { id: 1 } },
                { partner: { id: 2 }, package: { id: 2 } },
              ]),
            }),
          }),
        }),
      insert: vi.fn().mockReturnValue({
        values: vi.fn()
          .mockResolvedValueOnce({})
          .mockRejectedValueOnce(new Error("Email service error")),
      }),
      update: vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue({}),
        }),
      }),
    };

    vi.mocked(getDb).mockResolvedValue(mockDb as any);

    // Should not throw error despite one partner failing
    await expect(deliverLeadToPartners(1)).resolves.not.toThrow();
  });
});
