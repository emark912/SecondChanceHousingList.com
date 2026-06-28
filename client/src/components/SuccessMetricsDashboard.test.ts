import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import SuccessMetricsDashboard from "./SuccessMetricsDashboard";

// Mock the trpc hook
vi.mock("@/lib/trpc", () => ({
  trpc: {
    metrics: {
      getSuccessMetrics: {
        useQuery: () => ({
          data: {
            rentersApprovedThisMonth: 247,
            totalRentersApproved: 5432,
            totalRentalOptions: 15000,
            uniqueCustomersThisMonth: 89,
          },
          isLoading: false,
        }),
      },
    },
  },
}));

describe("SuccessMetricsDashboard Component", () => {
  it("renders the dashboard title and description", () => {
    render(<SuccessMetricsDashboard />);
    
    expect(screen.getByText("Our Success Metrics")).toBeDefined();
    expect(screen.getByText(/Real-time stats showing the impact/)).toBeDefined();
  });

  it("renders all metric labels", () => {
    render(<SuccessMetricsDashboard />);
    
    expect(screen.getByText("Renters Approved This Month")).toBeDefined();
    expect(screen.getByText("Total Renters Approved")).toBeDefined();
    expect(screen.getByText("Total Rental Options")).toBeDefined();
    expect(screen.getByText("New Customers This Month")).toBeDefined();
  });

  it("renders metric values", async () => {
    render(<SuccessMetricsDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText(/247/)).toBeDefined();
      expect(screen.getByText(/5432/)).toBeDefined();
      expect(screen.getByText(/15000/)).toBeDefined();
      expect(screen.getByText(/89/)).toBeDefined();
    }, { timeout: 3000 });
  });

  it("renders four metric cards", () => {
    const { container } = render(<SuccessMetricsDashboard />);
    
    const cards = container.querySelectorAll("[class*='rounded-lg']");
    expect(cards.length).toBeGreaterThanOrEqual(4);
  });

  it("renders the real-time update message", () => {
    render(<SuccessMetricsDashboard />);
    
    expect(screen.getByText(/These metrics update in real-time/)).toBeDefined();
  });

  it("applies correct styling classes", () => {
    const { container } = render(<SuccessMetricsDashboard />);
    
    const dashboard = container.querySelector("[class*='py-8']");
    expect(dashboard).toBeDefined();
  });
});
