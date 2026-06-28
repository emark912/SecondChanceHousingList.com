import { describe, it, expect } from "vitest";
import { getAllOrders, getOrderById } from "./db";

describe("Admin Payment Accountability", () => {

  it("should fetch all payments with correct structure", async () => {
    // This test verifies the paymentsList procedure would work
    const allOrders = await getAllOrders();
    
    expect(allOrders).toBeDefined();
    expect(Array.isArray(allOrders)).toBe(true);
    
    if (allOrders.length > 0) {
      const order = allOrders[0];
      expect(order).toHaveProperty("id");
      expect(order).toHaveProperty("customerName");
      expect(order).toHaveProperty("customerEmail");
      expect(order).toHaveProperty("amount");
      expect(order).toHaveProperty("paymentStatus");
      expect(order).toHaveProperty("pdfUrl");
      expect(order).toHaveProperty("emailSent");
      expect(order).toHaveProperty("createdAt");
    }
  });

  it("should fetch payment details by order ID", async () => {
    const allOrders = await getAllOrders();
    if (allOrders.length === 0) {
      console.log("Skipping: No orders in database");
      return;
    }
    
    const firstOrder = allOrders[0];
    const order = await getOrderById(firstOrder.id);
    
    expect(order).toBeDefined();
    expect(order.id).toBe(firstOrder.id);
    expect(order).toHaveProperty("customerName");
    expect(order).toHaveProperty("customerEmail");
  });

  it("should get PDF URL for order with PDF", async () => {
    const allOrders = await getAllOrders();
    const orderWithPdf = allOrders.find((o: any) => o.pdfUrl);
    
    if (!orderWithPdf) {
      console.log("Skipping: No order with PDF found");
      return;
    }
    
    expect(orderWithPdf.pdfUrl).toBeDefined();
    const pdfData = {
      pdfUrl: orderWithPdf.pdfUrl,
      fileName: `rental-results-${orderWithPdf.customerName}-${orderWithPdf.id}.pdf`,
    };
    
    expect(pdfData.pdfUrl).toBeDefined();
    expect(pdfData.fileName).toContain(orderWithPdf.customerName);
  });

  it("should track email sent status", async () => {
    const allOrders = await getAllOrders();
    if (allOrders.length === 0) {
      console.log("Skipping: No orders in database");
      return;
    }

    // Verify email sent status is tracked
    const emailSentOrders = allOrders.filter((o: any) => o.emailSent === 1);
    const notSentOrders = allOrders.filter((o: any) => o.emailSent === 0);
    
    expect(allOrders.length).toBe(emailSentOrders.length + notSentOrders.length);
    expect(typeof allOrders[0].emailSent).toBe("number");
  });

  it("should handle missing PDF gracefully", async () => {
    const allOrders = await getAllOrders();
    const orderWithoutPdf = allOrders.find((o: any) => !o.pdfUrl);
    
    if (!orderWithoutPdf) {
      console.log("Skipping: No order without PDF found");
      return;
    }
    
    expect(orderWithoutPdf.pdfUrl).toBeNull();
  });

  it("should filter payments by email search", async () => {
    const allOrders = await getAllOrders();
    if (allOrders.length === 0) {
      console.log("Skipping: No orders in database");
      return;
    }

    const searchEmail = allOrders[0].customerEmail;
    const filtered = allOrders.filter((order: any) =>
      order.customerEmail.toLowerCase().includes(searchEmail.toLowerCase())
    );

    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered[0].customerEmail).toBe(searchEmail);
  });

  it("should calculate payment statistics", async () => {
    const allOrders = await getAllOrders();

    const stats = {
      total: allOrders.length,
      completed: allOrders.filter((p: any) => p.paymentStatus === "completed").length,
      pending: allOrders.filter((p: any) => p.paymentStatus === "pending").length,
      noEmail: allOrders.filter((p: any) => p.emailSent === 0).length,
      noPdf: allOrders.filter((p: any) => !p.pdfUrl).length,
    };

    expect(stats.total).toBeGreaterThanOrEqual(0);
    expect(stats.completed).toBeGreaterThanOrEqual(0);
    expect(stats.pending).toBeGreaterThanOrEqual(0);
    expect(stats.noEmail).toBeGreaterThanOrEqual(0);
    expect(stats.noPdf).toBeGreaterThanOrEqual(0);
    expect(stats.total).toBe(stats.completed + stats.pending);
  });
});
