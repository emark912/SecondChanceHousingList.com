/**
 * Payment Status Routes
 * Provides endpoints for tracking payment status and history
 */

import { Router, Request, Response } from "express";
import { getFlexiblePaymentPlan, getPendingScheduledPayments } from "./db";

const router = Router();

/**
 * GET /api/payment-status/:planId
 * Get the status of a flexible payment plan
 */
router.get("/status/:planId", async (req: Request, res: Response) => {
  try {
    const planId = parseInt(req.params.planId);

    if (isNaN(planId)) {
      return res.status(400).json({ error: "Invalid plan ID" });
    }

    const plan = await getFlexiblePaymentPlan(planId);

    if (!plan) {
      return res.status(404).json({ error: "Payment plan not found" });
    }

    // Calculate payment progress
    const totalAmount = plan.totalAmount;
    const downPaymentAmount = plan.downPaymentAmount;
    const remainingBalance = plan.remainingBalance;
    const paidAmount = totalAmount - remainingBalance;

    const response = {
      id: plan.id,
      customerEmail: plan.customerEmail,
      customerName: plan.customerName,
      status: plan.status,
      downPaymentStatus: plan.downPaymentStatus,
      paymentFrequency: plan.paymentFrequency,
      
      // Financial summary
      totalAmount: totalAmount / 100,
      downPaymentAmount: downPaymentAmount / 100,
      remainingBalance: remainingBalance / 100,
      paidAmount: paidAmount / 100,
      percentageComplete: ((paidAmount / totalAmount) * 100).toFixed(1),
      
      // Payment schedule
      paymentSchedule: (plan.paymentSchedule as Array<{ date: string; amount: number }>).map(p => ({
        date: p.date,
        amount: p.amount / 100,
      })),
      
      // Timestamps
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt,
    };

    res.json(response);
  } catch (error) {
    console.error("[PaymentStatus] Error getting payment status:", error);
    res.status(500).json({ error: "Failed to get payment status" });
  }
});

/**
 * GET /api/payment-status/pending
 * Get all pending payments due for processing (admin only)
 */
router.get("/pending", async (req: Request, res: Response) => {
  try {
    const pendingPayments = await getPendingScheduledPayments(new Date());

    const response = {
      count: pendingPayments.length,
      payments: pendingPayments.map(p => ({
        id: p.id,
        flexiblePaymentPlanId: p.flexiblePaymentPlanId,
        customerEmail: p.customerEmail,
        paymentAmount: p.paymentAmount / 100,
        scheduledDate: p.scheduledDate,
        status: p.status,
        retryCount: p.retryCount,
        maxRetries: p.maxRetries,
      })),
    };

    res.json(response);
  } catch (error) {
    console.error("[PaymentStatus] Error getting pending payments:", error);
    res.status(500).json({ error: "Failed to get pending payments" });
  }
});

export default router;
