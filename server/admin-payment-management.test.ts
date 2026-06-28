import { describe, it, expect, beforeEach, vi } from "vitest";
import * as db from "./db";

vi.mock("./db");

describe("Admin Payment Management", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should get all flexible payment plans", async () => {
    const mockPlans = [
      {
        id: 1,
        customerName: "John Doe",
        customerEmail: "john@example.com",
        downPaymentAmount: 2500,
        totalAmount: 10000,
        remainingBalance: 7500,
        paymentFrequency: "weekly",
        paymentSchedule: [],
        stripeCustomerId: "cus_123",
        stripePaymentMethodId: "pm_123",
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    vi.mocked(db.getAllFlexiblePaymentPlans).mockResolvedValue(mockPlans as any);

    const result = await db.getAllFlexiblePaymentPlans();
    expect(result).toHaveLength(1);
    expect(result[0].customerName).toBe("John Doe");
  });

  it("should get failed scheduled payments", async () => {
    const mockFailedPayments = [
      {
        id: 1,
        flexiblePaymentPlanId: 1,
        customerEmail: "john@example.com",
        paymentAmount: 2500,
        scheduledDate: new Date(),
        stripePaymentIntentId: null,
        status: "failed",
        failureReason: "Card declined",
        retryCount: 2,
        maxRetries: 3,
        lastRetryAt: new Date(),
        processedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    vi.mocked(db.getFailedScheduledPayments).mockResolvedValue(mockFailedPayments as any);

    const result = await db.getFailedScheduledPayments();
    expect(result).toHaveLength(1);
    expect(result[0].status).toBe("failed");
  });

  it("should get dashboard statistics", async () => {
    const mockStats = {
      totalPlans: 10,
      activePlans: 7,
      completedPlans: 2,
      pausedPlans: 1,
      failedPayments: 3,
      totalCollected: 50000,
      totalScheduled: 75000,
    };

    vi.mocked(db.getPaymentDashboardStats).mockResolvedValue(mockStats);

    const result = await db.getPaymentDashboardStats();
    expect(result.totalPlans).toBe(10);
    expect(result.activePlans).toBe(7);
    expect(result.failedPayments).toBe(3);
  });

  it("should retry a failed payment", async () => {
    vi.mocked(db.retryScheduledPayment).mockResolvedValue(true);

    const result = await db.retryScheduledPayment(1);
    expect(result).toBe(true);
  });

  it("should cancel a payment plan", async () => {
    vi.mocked(db.cancelFlexiblePaymentPlan).mockResolvedValue(true);

    const result = await db.cancelFlexiblePaymentPlan(1, "Customer requested cancellation");
    expect(result).toBe(true);
  });

  it("should get scheduled payments for a plan", async () => {
    const mockPayments = [
      {
        id: 1,
        flexiblePaymentPlanId: 1,
        customerEmail: "john@example.com",
        paymentAmount: 2500,
        scheduledDate: new Date(),
        stripePaymentIntentId: null,
        status: "pending",
        failureReason: null,
        retryCount: 0,
        maxRetries: 3,
        lastRetryAt: null,
        processedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    vi.mocked(db.getScheduledPaymentsForPlan).mockResolvedValue(mockPayments as any);

    const result = await db.getScheduledPaymentsForPlan(1);
    expect(result).toHaveLength(1);
    expect(result[0].status).toBe("pending");
  });
});
