import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import TrustIndicators from "./TrustIndicators";

describe("TrustIndicators Component", () => {
  it("renders all trust indicator metrics", () => {
    render(<TrustIndicators />);
    
    // Check for approval rate
    expect(screen.getByText("95%")).toBeDefined();
    expect(screen.getByText("Approval Rate")).toBeDefined();
    
    // Check for states covered
    expect(screen.getByText("50")).toBeDefined();
    expect(screen.getByText("States Covered")).toBeDefined();
    
    // Check for AI search time
    expect(screen.getByText("20 sec")).toBeDefined();
    expect(screen.getByText("AI Search")).toBeDefined();
    
    // Check for options
    expect(screen.getByText("100+")).toBeDefined();
    expect(screen.getByText("Options")).toBeDefined();
  });

  it("renders descriptions for each indicator", () => {
    render(<TrustIndicators />);
    
    expect(screen.getByText("Credit-challenged renters approved")).toBeDefined();
    expect(screen.getByText("Serving all United States")).toBeDefined();
    expect(screen.getByText("Get results instantly")).toBeDefined();
    expect(screen.getByText("Rental programs per search")).toBeDefined();
  });

  it("renders four indicator cards", () => {
    const { container } = render(<TrustIndicators />);
    
    const cards = container.querySelectorAll("[class*='rounded-xl']");
    expect(cards.length).toBeGreaterThanOrEqual(4);
  });

  it("applies correct styling classes", () => {
    const { container } = render(<TrustIndicators />);
    
    const indicatorContainer = container.querySelector("[class*='grid']");
    expect(indicatorContainer).toBeDefined();
    expect(indicatorContainer?.className).toContain("grid");
  });
});
