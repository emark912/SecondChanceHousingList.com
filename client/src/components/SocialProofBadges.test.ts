import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import SocialProofBadges from "./SocialProofBadges";

describe("SocialProofBadges Component", () => {
  it("renders all social proof badges", () => {
    render(<SocialProofBadges />);
    
    expect(screen.getByText("Trusted by 10,000+ Renters")).toBeDefined();
    expect(screen.getByText("95% Approval Success Rate")).toBeDefined();
    expect(screen.getByText("Industry-Leading Results")).toBeDefined();
    expect(screen.getByText("Secure & Confidential Process")).toBeDefined();
  });

  it("renders four badge elements", () => {
    const { container } = render(<SocialProofBadges />);
    
    const badges = container.querySelectorAll("[class*='rounded-full']");
    expect(badges.length).toBeGreaterThanOrEqual(4);
  });

  it("applies correct styling classes to badges", () => {
    const { container } = render(<SocialProofBadges />);
    
    const badgeContainer = container.querySelector("[class*='flex']");
    expect(badgeContainer).toBeDefined();
    expect(badgeContainer?.className).toContain("flex");
    expect(badgeContainer?.className).toContain("gap");
  });

  it("renders icons for each badge", () => {
    const { container } = render(<SocialProofBadges />);
    
    const icons = container.querySelectorAll("svg");
    expect(icons.length).toBeGreaterThanOrEqual(4);
  });

  it("has hover effects on badges", () => {
    const { container } = render(<SocialProofBadges />);
    
    const badges = container.querySelectorAll("[class*='hover']");
    expect(badges.length).toBeGreaterThan(0);
  });
});
