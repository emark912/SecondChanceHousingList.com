import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import AIDiscountSearch from "./AIDiscountSearch";

describe("AIDiscountSearch Component", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it("should render the component with initial content", () => {
    render(<AIDiscountSearch />);
    
    expect(screen.getByText("AI Finding Best Discounts For You")).toBeInTheDocument();
    expect(screen.getByText(/Our AI is searching for available discount codes/)).toBeInTheDocument();
  });

  it("should display the original price of $250.00", () => {
    render(<AIDiscountSearch />);
    
    expect(screen.getByText("$250.00")).toBeInTheDocument();
  });

  it("should display all discount messages", () => {
    render(<AIDiscountSearch />);
    
    expect(screen.getByText(/Located a discount code for first time customers/)).toBeInTheDocument();
    expect(screen.getByText(/Located a coupon for renters in your area/)).toBeInTheDocument();
    expect(screen.getByText(/Found a special promotion for comprehensive rental searches/)).toBeInTheDocument();
    expect(screen.getByText(/Applied exclusive loyalty discount for new members/)).toBeInTheDocument();
  });

  it("should animate discounts and update price over time", async () => {
    render(<AIDiscountSearch />);
    
    // Initial price should be $250.00
    let priceElement = screen.getByText("$250.00");
    expect(priceElement).toBeInTheDocument();

    // Advance time by 2 seconds for first discount
    vi.advanceTimersByTime(2000);
    
    await waitFor(() => {
      // After first discount ($250 - $15 = $235)
      expect(screen.getByText("$235.00")).toBeInTheDocument();
    });

    // Advance time by 2 more seconds for second discount
    vi.advanceTimersByTime(2000);
    
    await waitFor(() => {
      // After second discount ($235 - $20 = $215)
      expect(screen.getByText("$215.00")).toBeInTheDocument();
    });
  });

  it("should stop at final price of $99.99", async () => {
    render(<AIDiscountSearch />);
    
    // Advance through all discounts (4 discounts * 2 seconds each = 8 seconds)
    vi.advanceTimersByTime(8000);
    
    await waitFor(() => {
      // Final price should be $99.99 (capped at FINAL_PRICE)
      expect(screen.getByText("$99.99")).toBeInTheDocument();
    });
  });

  it("should calculate and display total savings correctly", async () => {
    render(<AIDiscountSearch />);
    
    // Advance through all discounts
    vi.advanceTimersByTime(8000);
    
    await waitFor(() => {
      // Total savings should be $250 - $99.99 = $150.01
      expect(screen.getByText(/You save \$150.01/)).toBeInTheDocument();
    });
  });

  it("should mark completed discounts with checkmarks", async () => {
    const { container } = render(<AIDiscountSearch />);
    
    // Advance time by 2 seconds for first discount to complete
    vi.advanceTimersByTime(2000);
    
    await waitFor(() => {
      // Check that at least one discount is marked as completed
      const completedDiscounts = container.querySelectorAll(".bg-green-500\\/20");
      expect(completedDiscounts.length).toBeGreaterThan(0);
    });
  });

  it("should display discount savings amounts", async () => {
    render(<AIDiscountSearch />);
    
    // Advance time by 2 seconds for first discount to complete
    vi.advanceTimersByTime(2000);
    
    await waitFor(() => {
      // First discount saves $15
      expect(screen.getByText("Saved $15.00")).toBeInTheDocument();
    });
  });

  it("should handle responsive layout", () => {
    const { container } = render(<AIDiscountSearch />);
    
    // Check that the component renders with proper responsive classes
    const mainDiv = container.querySelector(".p-6");
    expect(mainDiv).toHaveClass("md:p-8");
  });
});
