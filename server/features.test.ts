import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

function createAdminContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "admin-user",
    email: "admin@example.com",
    name: "Admin User",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

function createUserContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 2,
    openId: "regular-user",
    email: "user@example.com",
    name: "Regular User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

// Mock database functions
vi.mock("./db", () => ({
  createSearchSubmission: vi.fn().mockResolvedValue(1),
  getSearchSubmissionById: vi.fn().mockResolvedValue({
    id: 1,
    customerName: "Test User",
    customerEmail: "test@example.com",
    city: "Houston",
    state: "Texas",
    searchRadiusMiles: 25,
    creditChallenges: ["Low Credit Score"],
    housingType: "Apartment",
    bedrooms: 2,
    occupants: 2,
    totalHouseholdIncome: "$45,000",
    monthlyTakeHomeIncome: "$3,200",
    employmentDuration: "1 - 2 years",
    needsMovingLoan: "no",
    status: "completed",
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
  updateSearchSubmissionStatus: vi.fn().mockResolvedValue(undefined),
  updateSearchSubmissionAiSummary: vi.fn().mockResolvedValue(undefined),
  getAllSearchSubmissions: vi.fn().mockResolvedValue([]),
  createOrder: vi.fn().mockResolvedValue(1),
  getOrderById: vi.fn().mockResolvedValue({
    id: 1,
    submissionId: 1,
    customerName: "Test User",
    customerEmail: "test@example.com",
    amount: "39.99",
    originalPrice: "99.99",
    paymentStatus: "pending",
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
  getOrderBySubmissionId: vi.fn().mockResolvedValue(null),
  updateOrderPayment: vi.fn().mockResolvedValue(undefined),
  updateOrderPdf: vi.fn().mockResolvedValue(undefined),
  updateOrderEmailSent: vi.fn().mockResolvedValue(undefined),
  getAllOrders: vi.fn().mockResolvedValue([]),
  getTodayOrders: vi.fn().mockResolvedValue([]),
  getTodaySalesTotal: vi.fn().mockResolvedValue({ total: "0.00", count: 0, totalOrders: 0 }),
  getAllNationalResults: vi.fn().mockResolvedValue([]),
  createNationalResult: vi.fn().mockResolvedValue(1),
  updateNationalResult: vi.fn().mockResolvedValue(undefined),
  deleteNationalResult: vi.fn().mockResolvedValue(undefined),
  createContactMessage: vi.fn().mockResolvedValue(1),
  getAllContactMessages: vi.fn().mockResolvedValue([]),
  markContactMessageRead: vi.fn().mockResolvedValue(undefined),
  upsertUser: vi.fn().mockResolvedValue(undefined),
  getUserByOpenId: vi.fn().mockResolvedValue(undefined),
}));

// Mock LLM
vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn().mockResolvedValue({
    choices: [{ message: { content: "AI summary of housing needs." } }],
  }),
}));

describe("search.submit", () => {
  it("creates a search submission and order", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.search.submit({
      customerName: "John Doe",
      customerEmail: "john@example.com",
      customerPhone: "555-1234",
      city: "Houston",
      state: "Texas",
      searchRadiusMiles: 25,
      creditChallenges: ["Low Credit Score", "Evictions"],
      housingType: "Apartment",
      bedrooms: 2,
      occupants: 3,
      totalHouseholdIncome: "$45,000/year",
      monthlyTakeHomeIncome: "$3,200/month",
      employmentDuration: "1 - 2 years",
      needsMovingLoan: "no",
      additionalInfo: "Need pet-friendly housing",
    });

    expect(result).toHaveProperty("submissionId");
    expect(result).toHaveProperty("orderId");
    expect(result.submissionId).toBe(1);
    expect(result.orderId).toBe(1);
  });

  it("validates required fields", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.search.submit({
        customerName: "",
        customerEmail: "invalid",
        city: "Houston",
        state: "Texas",
        searchRadiusMiles: 25,
        creditChallenges: ["Low Credit Score"],
        housingType: "Apartment",
        bedrooms: 2,
        occupants: 2,
        totalHouseholdIncome: "$45,000",
        monthlyTakeHomeIncome: "$3,200",
        employmentDuration: "1 - 2 years",
        needsMovingLoan: "no",
      })
    ).rejects.toThrow();
  });
});

describe("search.getSubmission", () => {
  it("returns a submission by id", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.search.getSubmission({ id: 1 });
    expect(result).toHaveProperty("customerName", "Test User");
    expect(result).toHaveProperty("city", "Houston");
  });
});

describe("contact.submit", () => {
  it("creates a contact message", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.contact.submit({
      name: "Jane Doe",
      email: "jane@example.com",
      subject: "Question about service",
      message: "I have a question about your housing search.",
    });

    expect(result).toHaveProperty("success", true);
    expect(result).toHaveProperty("id", 1);
  });

  it("validates required fields", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.contact.submit({
        name: "",
        email: "invalid-email",
        subject: "Test",
        message: "Test message",
      })
    ).rejects.toThrow();
  });
});

describe("order.completePayment", () => {
  it("marks an order as completed", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.order.completePayment({
      orderId: 1,
      paymentIntentId: "pi_test_123",
      sessionId: "cs_test_123",
    });

    expect(result).toEqual({ success: true });
  });
});

describe("admin procedures", () => {
  it("rejects non-admin users from dashboard", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.admin.dashboard()).rejects.toThrow();
  });

  it("rejects unauthenticated users from dashboard", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.admin.dashboard()).rejects.toThrow();
  });

  it("allows admin users to access dashboard", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.dashboard();
    expect(result).toHaveProperty("todaySales");
    expect(result).toHaveProperty("todayOrders");
    expect(result).toHaveProperty("allOrders");
  });

  it("allows admin to add national result", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.addNationalResult({
      companyName: "Test Housing Program",
      category: "program",
      description: "A test second chance housing program",
    });

    expect(result).toHaveProperty("id", 1);
  });

  it("allows admin to delete national result", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.deleteNationalResult({ id: 1 });
    expect(result).toEqual({ success: true });
  });

  it("allows admin to view contact messages", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.contactMessages();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("auth.me", () => {
  it("returns null for unauthenticated users", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.me();
    expect(result).toBeNull();
  });

  it("returns user for authenticated users", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.me();
    expect(result).toHaveProperty("name", "Admin User");
    expect(result).toHaveProperty("role", "admin");
  });
});
