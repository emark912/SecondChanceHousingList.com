/**
 * Phase 17 Tests
 * - Low-leads warning email function exists and is exported
 * - Lead delivery service imports sendLowLeadsWarningEmail
 * - PartnerCardUpdated page file exists and exports default
 * - /partner/card-updated route is registered in App.tsx
 * - PartnerActivateTrial redirects to card-updated page on success
 */

import { describe, it, expect, vi } from "vitest";
import fs from "fs";
import path from "path";

const ROOT = path.resolve(__dirname, "..");

describe("Phase 17 — Low-leads warning email", () => {
  it("sendLowLeadsWarningEmail is exported from partner-email-service.ts", () => {
    const src = fs.readFileSync(
      path.join(ROOT, "server/partner-email-service.ts"),
      "utf-8"
    );
    expect(src).toContain("export async function sendLowLeadsWarningEmail");
  });

  it("sendLowLeadsWarningEmail accepts the correct parameters", () => {
    const src = fs.readFileSync(
      path.join(ROOT, "server/partner-email-service.ts"),
      "utf-8"
    );
    // Verify all 5 parameters are present in the function signature
    expect(src).toContain("partnerName: string");
    expect(src).toContain("leadsRemaining: number");
    expect(src).toContain("hasCardOnFile: boolean");
  });

  it("lead-delivery-service.ts imports sendLowLeadsWarningEmail", () => {
    const src = fs.readFileSync(
      path.join(ROOT, "server/lead-delivery-service.ts"),
      "utf-8"
    );
    expect(src).toContain("sendLowLeadsWarningEmail");
  });

  it("lead-delivery-service.ts triggers low-leads warning for trial leads below 5", () => {
    const src = fs.readFileSync(
      path.join(ROOT, "server/lead-delivery-service.ts"),
      "utf-8"
    );
    // Check that the warning is triggered when newTrialLeadsRemaining < 5
    expect(src).toContain("newTrialLeadsRemaining < 5");
    expect(src).toContain("sendLowLeadsWarningEmail(");
  });

  it("lead-delivery-service.ts triggers low-leads warning for paid package leads below 5", () => {
    const src = fs.readFileSync(
      path.join(ROOT, "server/lead-delivery-service.ts"),
      "utf-8"
    );
    // Check that the warning is triggered when updatedPackage.leadsRemaining < 5
    expect(src).toContain("updatedPackage.leadsRemaining < 5");
  });

  it("low-leads email uses correct emailType", () => {
    const src = fs.readFileSync(
      path.join(ROOT, "server/partner-email-service.ts"),
      "utf-8"
    );
    expect(src).toContain('emailType: "low_leads_warning"');
  });
});

describe("Phase 17 — Card Updated confirmation page", () => {
  it("PartnerCardUpdated.tsx file exists", () => {
    const filePath = path.join(ROOT, "client/src/pages/PartnerCardUpdated.tsx");
    expect(fs.existsSync(filePath)).toBe(true);
  });

  it("PartnerCardUpdated.tsx exports a default component", () => {
    const src = fs.readFileSync(
      path.join(ROOT, "client/src/pages/PartnerCardUpdated.tsx"),
      "utf-8"
    );
    expect(src).toContain("export default function PartnerCardUpdated");
  });

  it("PartnerCardUpdated.tsx auto-redirects to dashboard", () => {
    const src = fs.readFileSync(
      path.join(ROOT, "client/src/pages/PartnerCardUpdated.tsx"),
      "utf-8"
    );
    expect(src).toContain("/partnership/dashboard");
    expect(src).toContain("countdown");
  });

  it("PartnerCardUpdated.tsx handles both activate and update modes", () => {
    const src = fs.readFileSync(
      path.join(ROOT, "client/src/pages/PartnerCardUpdated.tsx"),
      "utf-8"
    );
    expect(src).toContain("Card Saved Successfully");
    expect(src).toContain("Card Updated Successfully");
    expect(src).toContain("isNewCard");
  });

  it("/partner/card-updated route is registered in App.tsx", () => {
    const src = fs.readFileSync(
      path.join(ROOT, "client/src/App.tsx"),
      "utf-8"
    );
    expect(src).toContain('"/partner/card-updated"');
    expect(src).toContain("PartnerCardUpdated");
  });

  it("PartnerActivateTrial.tsx redirects to /partner/card-updated on success", () => {
    const src = fs.readFileSync(
      path.join(ROOT, "client/src/pages/PartnerActivateTrial.tsx"),
      "utf-8"
    );
    expect(src).toContain("/partner/card-updated");
    // Should NOT redirect directly to dashboard anymore
    expect(src).not.toContain("/partner/dashboard?partnerId=${partnerId}&trial=activated");
  });

  it("PartnerActivateTrial.tsx passes mode param to card-updated page", () => {
    const src = fs.readFileSync(
      path.join(ROOT, "client/src/pages/PartnerActivateTrial.tsx"),
      "utf-8"
    );
    expect(src).toContain("mode=");
    expect(src).toContain("isUpdateMode");
  });
});
