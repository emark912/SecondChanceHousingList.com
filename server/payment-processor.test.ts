import { describe, it, expect, beforeEach, vi } from "vitest";
import { processScheduledPayments, getPaymentProcessingStats } from "./payment-processor";
import * as db from "./db";

vi.mock("./db");
vi.mock("./email-service", () => ({
  sendEmail: vi.fn().mockResolvedValue(true),
}));
vi.mock("stripe", () => {
  return {
    default: vi.fn(() => ({
      paymentIntents: {
        create: vi.fn().mockResolvedValue({
          id: "pi_test123",
          status: "succeeded",
          amount: 2500,
          currency: "usd",
        }),
      },
    })),
  };
});

describe("Payment Processor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should handle no pending payments", async () => {
    vi.mocked(db.getPendingScheduledPayments).mockResolvedValue([]);
    const result = await processScheduledPayments();
    expect(result.success).toBe(true);
    expect(result.processedCount).toBe(0);
    expect(result.failedCount).toBe(0);
  });

  it("should get payment processing stats", async () => {
    vi.mocked(db.getPendingScheduledPayments).mockResolvedValue([]);
    const stats = await getPaymentProcessingStats();
    expect(stats.pending).toBe(0);
    expect(stats.processing).toBe(0);
  });
});
