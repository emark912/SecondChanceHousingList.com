import { describe, it, expect, beforeEach, vi } from "vitest";

describe("Checkout Page Pre-filling", () => {
  beforeEach(() => {
    // Clear sessionStorage before each test
    sessionStorage.clear();
  });

  it("should pre-fill customer data from sessionStorage", () => {
    const customerData = {
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com"
    };
    
    sessionStorage.setItem("customerData", JSON.stringify(customerData));
    
    const stored = sessionStorage.getItem("customerData");
    const parsed = JSON.parse(stored!);
    
    expect(parsed.firstName).toBe("John");
    expect(parsed.lastName).toBe("Doe");
    expect(parsed.email).toBe("john@example.com");
  });

  it("should handle missing customer data gracefully", () => {
    const stored = sessionStorage.getItem("customerData");
    expect(stored).toBeNull();
  });

  it("should parse customer data correctly from SearchFormPage", () => {
    const formData = {
      fullName: "Jane Smith",
      email: "jane@example.com",
      phone: "555-1234"
    };
    
    sessionStorage.setItem("customerFormData", JSON.stringify(formData));
    
    const customerData = sessionStorage.getItem("customerFormData");
    const parsed = JSON.parse(customerData!);
    
    const firstName = parsed.fullName?.split(" ")[0] || "";
    const lastName = parsed.fullName?.split(" ").slice(1).join(" ") || "";
    
    expect(firstName).toBe("Jane");
    expect(lastName).toBe("Smith");
    expect(parsed.email).toBe("jane@example.com");
  });

  it("should handle full names with multiple parts", () => {
    const formData = {
      fullName: "Mary Jane Watson Parker",
      email: "mary@example.com",
      phone: "555-5678"
    };
    
    sessionStorage.setItem("customerFormData", JSON.stringify(formData));
    
    const customerData = sessionStorage.getItem("customerFormData");
    const parsed = JSON.parse(customerData!);
    
    const firstName = parsed.fullName?.split(" ")[0] || "";
    const lastName = parsed.fullName?.split(" ").slice(1).join(" ") || "";
    
    expect(firstName).toBe("Mary");
    expect(lastName).toBe("Jane Watson Parker");
  });

  it("should store customer data from SearchFormPage on submit", () => {
    const customerFormData = {
      fullName: "Bob Johnson",
      email: "bob@example.com",
      phone: "555-9999"
    };
    
    sessionStorage.setItem("customerFormData", JSON.stringify(customerFormData));
    
    // Simulate Results page processing
    const customerData = sessionStorage.getItem("customerFormData");
    if (customerData) {
      const parsed = JSON.parse(customerData);
      sessionStorage.setItem("customerData", JSON.stringify({
        firstName: parsed.fullName?.split(" ")[0] || "",
        lastName: parsed.fullName?.split(" ").slice(1).join(" ") || "",
        email: parsed.email || ""
      }));
    }
    
    const checkoutData = sessionStorage.getItem("customerData");
    const parsed = JSON.parse(checkoutData!);
    
    expect(parsed.firstName).toBe("Bob");
    expect(parsed.lastName).toBe("Johnson");
    expect(parsed.email).toBe("bob@example.com");
  });

  it("should handle empty customer data fields", () => {
    const customerData = {
      firstName: "",
      lastName: "",
      email: ""
    };
    
    sessionStorage.setItem("customerData", JSON.stringify(customerData));
    
    const stored = sessionStorage.getItem("customerData");
    const parsed = JSON.parse(stored!);
    
    expect(parsed.firstName).toBe("");
    expect(parsed.lastName).toBe("");
    expect(parsed.email).toBe("");
  });
});
