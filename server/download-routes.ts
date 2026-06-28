import { Express, Request, Response } from "express";
import { getOrderBySubmissionId, getFormSubmissionById, getOrderById, getDb } from "./db";
import { generateHousingListPDF } from "./pdf-generation-service";
import { orders } from "../drizzle/schema";
import { eq } from "drizzle-orm";

export function registerDownloadRoutes(app: Express) {
  // Download housing list by order ID
  app.get("/api/download-housing-list", async (req: Request, res: Response) => {
    try {
      const { orderId, sessionId } = req.query;

      if (!orderId && !sessionId) {
        return res.status(400).json({ error: "orderId or sessionId required" });
      }

      let order;

      // If sessionId is provided, we need to find the order by sessionId
      if (sessionId) {
        const db = await getDb();
        if (!db) {
          return res.status(500).json({ error: "Database not available" });
        }
        
        const result = await db
          .select()
          .from(orders)
          .where(eq(orders.stripeSessionId, sessionId as string))
          .limit(1);
        
        if (result.length === 0) {
          return res.status(404).json({ error: "Order not found" });
        }
        
        order = result[0];
      }

      // Get order by order ID
      if (orderId) {
        const orderIdNum = parseInt(orderId as string);
        order = await getOrderById(orderIdNum);

        if (!order) {
          return res.status(404).json({ error: "Order not found" });
        }
      }

      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      // Get the form submission data
      const formSubmission = await getFormSubmissionById(order.submissionId);

      if (!formSubmission) {
        return res.status(404).json({ error: "Form submission not found" });
      }

      // Generate PDF
      const pdfBuffer = await generateHousingListPDF({
        fullName: formSubmission.fullName,
        email: formSubmission.email,
        location: formSubmission.location,
        creditChallenges: formSubmission.creditChallenges,
        housingTypes: formSubmission.housingTypes,
        bedrooms: formSubmission.bedrooms || undefined,
        criminalHistory: formSubmission.criminalHistory || undefined,
        evictions: formSubmission.evictions || undefined,
        income: formSubmission.income || undefined,
        monthlyBudget: formSubmission.monthlyBudget || undefined,
        monthlyIncome: formSubmission.monthlyIncome || undefined,
      });

      // Send PDF to client
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        'attachment; filename="second-chance-housing-list.pdf"'
      );
      res.send(pdfBuffer);
    } catch (error) {
      console.error("Download error:", error);
      res.status(500).json({ error: "Failed to generate PDF" });
    }
  });

  // Download by Stripe session ID (for thank you page)
  app.get("/api/download-by-session", async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.query;

      if (!sessionId) {
        return res.status(400).json({ error: "sessionId required" });
      }

      // This endpoint would need to query orders by stripeSessionId
      // For now, return error - will be implemented if needed
      return res.status(501).json({
        error: "This endpoint needs database query implementation",
      });
    } catch (error) {
      console.error("Download error:", error);
      res.status(500).json({ error: "Failed to generate PDF" });
    }
  });
}
