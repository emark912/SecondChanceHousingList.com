import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import OrderSummaryBenefits from "./OrderSummaryBenefits";

describe("OrderSummaryBenefits Component", () => {
  it("renders all four benefit items", () => {
    render(<OrderSummaryBenefits city="New York" />);
    
    expect(screen.getByText(/Custom New York Second Chance Rentals List/i)).toBeDefined();
    expect(screen.getByText(/Dedicated Support Agent/i)).toBeDefined();
    expect(screen.getByText(/100% Money Back Guarantee/i)).toBeDefined();
    expect(screen.getByText(/24\/7 Email & Chat Support/i)).toBeDefined();
  });

  it("displays custom city name in first benefit", () => {
    render(<OrderSummaryBenefits city="Los Angeles" />);
    
    expect(screen.getByText(/Custom Los Angeles Second Chance Rentals List/i)).toBeDefined();
  });

  it("uses default city name when not provided", () => {
    render(<OrderSummaryBenefits />);
    
    expect(screen.getByText(/Custom your area Second Chance Rentals List/i)).toBeDefined();
  });

  it("displays benefit descriptions", () => {
    render(<OrderSummaryBenefits city="Chicago" />);
    
    expect(screen.getByText(/personalized list of Second Chance Apartments/i)).toBeDefined();
    expect(screen.getByText(/support agent who works directly with you/i)).toBeDefined();
    expect(screen.getByText(/refund your entire purchase/i)).toBeDefined();
    expect(screen.getByText(/Round-the-clock email and chat support/i)).toBeDefined();
  });

  it("displays risk-free purchase guarantee badge", () => {
    render(<OrderSummaryBenefits />);
    
    expect(screen.getByText(/Risk-Free Purchase/i)).toBeDefined();
    expect(screen.getByText(/no questions asked/i)).toBeDefined();
  });

  it("renders without errors with various city names", () => {
    const cities = ["New York", "San Francisco", "Miami", "Denver"];
    
    cities.forEach(city => {
      const { unmount } = render(<OrderSummaryBenefits city={city} />);
      expect(screen.getByText(new RegExp(`Custom ${city}`, "i"))).toBeDefined();
      unmount();
    });
  });
});
