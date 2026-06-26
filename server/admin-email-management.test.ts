import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the DB module
vi.mock("./db", () => ({
  getDb: vi.fn().mockResolvedValue(null),
}));

describe("Admin Email Management Router", () => {
  it("EMAIL_WORKFLOWS catalogue is complete", async () => {
    const { EMAIL_WORKFLOWS } = await import("./routers/admin-email-management");
    expect(EMAIL_WORKFLOWS.length).toBeGreaterThan(0);
    // Every workflow has steps
    for (const wf of EMAIL_WORKFLOWS) {
      expect(wf.steps.length).toBeGreaterThan(0);
      expect(["lead", "customer", "partner"]).toContain(wf.audience);
    }
  });

  it("covers all three audiences", async () => {
    const { EMAIL_WORKFLOWS } = await import("./routers/admin-email-management");
    const audiences = new Set(EMAIL_WORKFLOWS.map(w => w.audience));
    expect(audiences.has("lead")).toBe(true);
    expect(audiences.has("customer")).toBe(true);
    expect(audiences.has("partner")).toBe(true);
  });

  it("every step has a non-empty templateType", async () => {
    const { EMAIL_WORKFLOWS } = await import("./routers/admin-email-management");
    for (const wf of EMAIL_WORKFLOWS) {
      for (const step of wf.steps) {
        expect(step.templateType).toBeTruthy();
        expect(step.label).toBeTruthy();
        expect(step.timing).toBeTruthy();
      }
    }
  });
});
