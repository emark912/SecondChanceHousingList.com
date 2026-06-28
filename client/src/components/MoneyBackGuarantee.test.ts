import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import MoneyBackGuarantee from "./MoneyBackGuarantee";

describe("MoneyBackGuarantee Component", () => {
  it("should render the guarantee heading", () => {
    render(<MoneyBackGuarantee />);
    expect(screen.getByText("100% Money Back Guarantee")).toBeInTheDocument();
  });

  it("should display risk-free guarantee badge", () => {
    render(<MoneyBackGuarantee />);
    expect(screen.getByText("Risk-Free Guarantee")).toBeInTheDocument();
  });

  it("should contain the main guarantee text", () => {
    render(<MoneyBackGuarantee />);
    const guaranteeText = screen.getByText(/so confident/i);
    expect(guaranteeText).toBeInTheDocument();
  });

  it("should mention 100% Money Back Guarantee in the text", () => {
    render(<MoneyBackGuarantee />);
    const text = screen.getByText(/100% Money Back Guarantee/i);
    expect(text).toBeInTheDocument();
  });

  it("should mention 30 days approval window", () => {
    render(<MoneyBackGuarantee />);
    expect(screen.getByText(/30-Day Window/i)).toBeInTheDocument();
  });

  it("should display full refund guarantee detail", () => {
    render(<MoneyBackGuarantee />);
    expect(screen.getByText(/Full Refund/i)).toBeInTheDocument();
    expect(screen.getByText(/100% money back if not approved/i)).toBeInTheDocument();
  });

  it("should display confidence statement", () => {
    render(<MoneyBackGuarantee />);
    expect(screen.getByText(/We stand behind our AI-powered rental matching system/i)).toBeInTheDocument();
  });
});
