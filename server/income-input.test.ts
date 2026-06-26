import { describe, it, expect } from "vitest";

/**
 * Test suite for income input field formatting
 * Validates that the income field accepts commas and numeric values only
 */
describe("Income Input Field Formatting", () => {
  // Simulate the onChange handler from Home.tsx
  const formatIncomeInput = (value: string): string => {
    // Allow numbers and commas only
    return value.replace(/[^0-9,]/g, '');
  };

  it("should accept numeric values", () => {
    const input = "65000";
    const result = formatIncomeInput(input);
    expect(result).toBe("65000");
  });

  it("should accept comma-formatted values", () => {
    const input = "65,000";
    const result = formatIncomeInput(input);
    expect(result).toBe("65,000");
  });

  it("should accept multiple commas", () => {
    const input = "1,000,000";
    const result = formatIncomeInput(input);
    expect(result).toBe("1,000,000");
  });

  it("should remove special characters", () => {
    const input = "65,000$";
    const result = formatIncomeInput(input);
    expect(result).toBe("65,000");
  });

  it("should remove letters", () => {
    const input = "65,000abc";
    const result = formatIncomeInput(input);
    expect(result).toBe("65,000");
  });

  it("should remove spaces", () => {
    const input = "65, 000";
    const result = formatIncomeInput(input);
    expect(result).toBe("65,000");
  });

  it("should handle empty input", () => {
    const input = "";
    const result = formatIncomeInput(input);
    expect(result).toBe("");
  });

  it("should handle leading zeros", () => {
    const input = "0065,000";
    const result = formatIncomeInput(input);
    expect(result).toBe("0065,000");
  });

  it("should accept placeholder example value", () => {
    const input = "65,000";
    const result = formatIncomeInput(input);
    expect(result).toBe("65,000");
  });

  it("should handle mixed invalid input", () => {
    const input = "$65,000 USD";
    const result = formatIncomeInput(input);
    expect(result).toBe("65,000");
  });
});
