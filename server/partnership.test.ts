import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// ─── Mock database ────────────────────────────────────────────────────────────
vi.mock("./db", () => ({
  getDb: vi.fn().mockResolvedValue(null),
}));

vi.mock("./partner-auth-service", () => ({
  getPartnerById: vi.fn().mockResolvedValue({
    id: 1,
    email: "partner@test.com",
    partnerName: "Test Partner",
    businessName: "Test Business",
    isVerified: true,
    isActive: true,
    trialLeadsRemaining: 10,
    trialLeadsUsed: 15,
    stripeCustomerId: null,
    loginAttempts: 0,
    lockedUntil: null,
    createdAt: new Date(),
  }),
  hashPassword: vi.fn().mockResolvedValue("hashed_password"),
  verifyPassword: vi.fn().mockResolvedValue(true),
}));

vi.mock("./partner-db", () => ({
  createPartner: vi.fn().mockResolvedValue(1),
  getPartnerWithPackages: vi.fn().mockResolvedValue({
    partner: {
      id: 1,
      email: "partner@test.com",
      partnerName: "Test Partner",
      businessName: "Test Business",
      isVerified: true,
      trialLeadsRemaining: 10,
      trialLeadsUsed: 15,
    },
    packages: [],
  }),
  getDeliveredLeadsForPartner: vi.fn().mockResolvedValue([]),
  getPartnerAnalytics: vi.fn().mockResolvedValue({
    leadsReceived: 5,
    leadsPurchased: 2,
    conversionRate: 40.0,
    avgResponseHours: 3.5,
    totalSpent: 100,
    estimatedRevenue: 1000,
    roi: 900.0,
    packages: [],
    dailyLeads: [],
  }),
  getLeadPurchasesForPartner: vi.fn().mockResolvedValue([]),
  getActivePackages: vi.fn().mockResolvedValue([]),
  createRentalSubmission: vi.fn().mockResolvedValue(42),
  getRentalSubmission: vi.fn().mockResolvedValue(null),
  markLeadViewed: vi.fn().mockResolvedValue(undefined),
  markLeadClicked: vi.fn().mockResolvedValue(undefined),
  purchaseLead: vi.fn().mockResolvedValue(1),
  getAllPartnersWithStats: vi.fn().mockResolvedValue([]),
}));

vi.mock("./partner-email-service", () => ({
  sendVerificationEmail: vi.fn().mockResolvedValue(undefined),
  sendTrialLeadEmail: vi.fn().mockResolvedValue(undefined),
  sendPurchasedLeadEmail: vi.fn().mockResolvedValue(undefined),
  sendPurchaseConfirmationEmail: vi.fn().mockResolvedValue(undefined),
  sendPasswordResetEmail: vi.fn().mockResolvedValue(undefined),
  sendExpirationReminderEmail: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("./lead-delivery-service", () => ({
  deliverLeadToAllPartners: vi.fn().mockResolvedValue(undefined),
  runLeadExpirationJob: vi.fn().mockResolvedValue(undefined),
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────

function createPublicCtx(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
      cookies: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
      cookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

function createAdminCtx(): TrpcContext {
  return {
    user: {
      id: 99,
      openId: "admin-open-id",
      email: "admin@test.com",
      name: "Admin User",
      loginMethod: "manus",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: "https",
      headers: {},
      cookies: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
      cookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

function createUserCtx(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "user-open-id",
      email: "user@test.com",
      name: "Regular User",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: "https",
      headers: {},
      cookies: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
      cookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("auth.logout", () => {
  it("clears session cookie and returns success", async () => {
    const { ctx } = { ctx: createAdminCtx() };
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result).toEqual({ success: true });
  });
});

describe("auth.me", () => {
  it("returns null for unauthenticated user", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const result = await caller.auth.me();
    expect(result).toBeNull();
  });

  it("returns user for authenticated session", async () => {
    const caller = appRouter.createCaller(createAdminCtx());
    const result = await caller.auth.me();
    expect(result).not.toBeNull();
    expect(result?.email).toBe("admin@test.com");
  });
});

describe("stripeCheckout.packages", () => {
  it("returns all 6 lead package options", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const packages = await caller.stripeCheckout.packages();
    expect(packages).toHaveLength(6);
    expect(packages[0]).toHaveProperty("id");
    expect(packages[0]).toHaveProperty("price");
    expect(packages[0]).toHaveProperty("leads");
  });

  it("packages are ordered by price ascending", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const packages = await caller.stripeCheckout.packages();
    for (let i = 1; i < packages.length; i++) {
      expect(packages[i].price).toBeGreaterThanOrEqual(packages[i - 1].price);
    }
  });
});

describe("partnership.submitRental", () => {
  it("accepts a valid rental submission", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const result = await caller.partnership.submitRental({
      firstName: "Jane",
      lastName: "Doe",
      email: "jane@example.com",
      phone: "555-1234",
      city: "Atlanta",
      state: "GA",
      budgetMin: 800,
      budgetMax: 1200,
    });
    expect(result.success).toBe(true);
    expect(result.submissionId).toBe(42);
  });

  it("rejects submission without required fields", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    await expect(
      caller.partnership.submitRental({
        firstName: "",
        lastName: "Doe",
        email: "jane@example.com",
        phone: "555-1234",
      })
    ).rejects.toThrow();
  });
});

describe("adminPartnership.overview", () => {
  it("requires admin role", async () => {
    const caller = appRouter.createCaller(createUserCtx());
    await expect(caller.adminPartnership.overview()).rejects.toThrow("You do not have required permission (10002)");
  });
});

describe("adminPartnership.allPartners", () => {
  it("requires admin role", async () => {
    const caller = appRouter.createCaller(createUserCtx());
    await expect(caller.adminPartnership.allPartners()).rejects.toThrow("You do not have required permission (10002)");
  });

  it("returns partner list for admin", async () => {
    const caller = appRouter.createCaller(createAdminCtx());
    const partners = await caller.adminPartnership.allPartners();
    expect(Array.isArray(partners)).toBe(true);
  });
});

describe("LEAD_PACKAGES constants", () => {
  it("all packages have valid price and lead counts", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const packages = await caller.stripeCheckout.packages();
    for (const pkg of packages) {
      expect(pkg.price).toBeGreaterThan(0);
      expect(pkg.leads).toBeGreaterThan(0);
      expect(pkg.bonusLeads).toBeGreaterThanOrEqual(0);
      expect(pkg.pricePerLead).toBeGreaterThan(0);
    }
  });

  it("enterprise package has more leads than starter", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const packages = await caller.stripeCheckout.packages();
    const starter = packages.find((p) => p.id === "starter");
    const enterprise = packages.find((p) => p.id === "enterprise");
    expect(enterprise!.leads).toBeGreaterThan(starter!.leads);
  });
});
describe("adminPartnership.grantLeads", () => {
  it("requires admin role", async () => {
    const caller = appRouter.createCaller(createUserCtx());
    await expect(
      caller.adminPartnership.grantLeads({ partnerId: 1, leadsToAdd: 10 })
    ).rejects.toThrow("You do not have required permission (10002)");
  });

  it("rejects leadsToAdd of 0 (below minimum)", async () => {
    const caller = appRouter.createCaller(createAdminCtx());
    await expect(
      caller.adminPartnership.grantLeads({ partnerId: 1, leadsToAdd: 0 })
    ).rejects.toThrow();
  });

  it("rejects leadsToAdd of 501 (above maximum)", async () => {
    const caller = appRouter.createCaller(createAdminCtx());
    await expect(
      caller.adminPartnership.grantLeads({ partnerId: 1, leadsToAdd: 501 })
    ).rejects.toThrow();
  });

  it("throws when db is unavailable (getDb returns null)", async () => {
    const caller = appRouter.createCaller(createAdminCtx());
    await expect(
      caller.adminPartnership.grantLeads({ partnerId: 1, leadsToAdd: 5 })
    ).rejects.toThrow();
  });
});

describe("adminPartnership.getPartnerEmailLogs", () => {
  it("requires admin role", async () => {
    const caller = appRouter.createCaller(createUserCtx());
    await expect(
      caller.adminPartnership.getPartnerEmailLogs({ partnerId: 1 })
    ).rejects.toThrow("You do not have required permission (10002)");
  });

  it("throws when db is unavailable (getDb returns null)", async () => {
    const caller = appRouter.createCaller(createAdminCtx());
    await expect(
      caller.adminPartnership.getPartnerEmailLogs({ partnerId: 1 })
    ).rejects.toThrow();
  });

  it("rejects limit above maximum (51)", async () => {
    const caller = appRouter.createCaller(createAdminCtx());
    await expect(
      caller.adminPartnership.getPartnerEmailLogs({ partnerId: 1, limit: 51 })
    ).rejects.toThrow();
  });
});

describe("adminPartnership.resendPartnerEmail", () => {
  it("requires admin role", async () => {
    const caller = appRouter.createCaller(createUserCtx());
    await expect(
      caller.adminPartnership.resendPartnerEmail({ emailLogId: 1 })
    ).rejects.toThrow("You do not have required permission (10002)");
  });

  it("throws when db is unavailable (getDb returns null)", async () => {
    const caller = appRouter.createCaller(createAdminCtx());
    await expect(
      caller.adminPartnership.resendPartnerEmail({ emailLogId: 1 })
    ).rejects.toThrow();
  });

  it("rejects non-integer emailLogId", async () => {
    const caller = appRouter.createCaller(createAdminCtx());
    await expect(
      // @ts-expect-error testing invalid input
      caller.adminPartnership.resendPartnerEmail({ emailLogId: "abc" })
    ).rejects.toThrow();
  });
});
