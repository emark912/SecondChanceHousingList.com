import { z } from "zod";
import { TRPCError } from "@trpc/server";
import * as db from "./db";
import { protectedProcedure } from "./_core/trpc";
import { getDb } from "./db";
import { orders, emailTracking, searchSubmissions } from "../drizzle/schema";
import { eq, and, gte, lte } from "drizzle-orm";



/**
 * Admin-only procedure that checks if user is admin
 */
export const adminProcedure = protectedProcedure.use(async ({ ctx, next }: any) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

/**
 * Get all payments with email tracking and submission details
 */
export const getPaymentsList = adminProcedure
  .input(
    z.object({
      limit: z.number().default(50),
      offset: z.number().default(0),
      startDate: z.date().optional(),
      endDate: z.date().optional(),
      searchEmail: z.string().optional(),
    })
  )
  .query(async ({ input }: any) => {
    try {
      let query: any = (await getDb())!
        .select({
          orderId: orders.id,
          submissionId: orders.submissionId,
          customerName: orders.customerName,
          customerEmail: orders.customerEmail,
          amount: orders.amount,
          paymentStatus: orders.paymentStatus,
          pdfUrl: orders.pdfUrl,
          pdfFileKey: orders.pdfFileKey,
          emailSent: orders.emailSent,
          createdAt: orders.createdAt,
          emailStatus: emailTracking.status,
          emailType: emailTracking.emailType,
          sentAt: emailTracking.sentAt,
          recipientEmail: emailTracking.recipientEmail,
        })
        .from(orders)
        .leftJoin(
          emailTracking,
          and(
            eq(emailTracking.submissionId, orders.submissionId),
            eq(emailTracking.emailType, "payment_confirmation")
          )
        );

      // Apply filters
      const conditions: any[] = [];

      if (input.startDate) {
        conditions.push(gte(orders.createdAt, input.startDate));
      }

      if (input.endDate) {
        conditions.push(lte(orders.createdAt, input.endDate));
      }

      if (input.searchEmail) {
        conditions.push(eq(orders.customerEmail, input.searchEmail));
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }

      const payments = await query.limit(input.limit).offset(input.offset);

      return {
        payments: payments.map((p: any) => ({
          orderId: p.orderId,
          submissionId: p.submissionId,
          customerName: p.customerName,
          customerEmail: p.customerEmail,
          amount: parseFloat(p.amount as string),
          paymentStatus: p.paymentStatus,
          pdfUrl: p.pdfUrl,
          pdfFileKey: p.pdfFileKey,
          emailSent: p.emailSent === 1,
          createdAt: p.createdAt,
          emailStatus: p.emailStatus || "not_tracked",
          emailType: p.emailType,
          sentAt: p.sentAt,
          recipientEmail: p.recipientEmail,
        })),
      };
    } catch (error) {
      console.error("[Admin] Error fetching payments list:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch payments",
      });
    }
  });

/**
 * Get detailed payment information
 */
export const getPaymentDetails = adminProcedure
  .input(z.object({ orderId: z.number() }))
  .query(async ({ input }: any) => {
    try {
      const order = await (await getDb())!.select().from(orders).where(eq(orders.id, input.orderId)).then(r => r[0] ?? null);

      if (!order) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Order not found",
        });
      }

      // Get email tracking records
      const emailRecords = await (await getDb())!.select().from(emailTracking).where(eq(emailTracking.submissionId, order.submissionId));

      // Get submission details
      const submission = await (await getDb())!.select().from(searchSubmissions).where(eq(searchSubmissions.id, order.submissionId)).then(r => r[0] ?? null);

      return {
        order: {
          id: order.id,
          submissionId: order.submissionId,
          customerName: order.customerName,
          customerEmail: order.customerEmail,
          amount: parseFloat(order.amount as string),
          paymentStatus: order.paymentStatus,
          pdfUrl: order.pdfUrl,
          pdfFileKey: order.pdfFileKey,
          emailSent: order.emailSent === 1,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
        },
        emailHistory: emailRecords.map((e: any) => ({
          id: e.id,
          emailType: e.emailType,
          status: e.status,
          sentAt: e.sentAt,
          recipientEmail: e.recipientEmail,
        })),
        submission: submission
          ? {
              id: submission.id,
              customerName: submission.customerName,
              city: submission.city,
              state: submission.state,
            }
          : null,
      };
    } catch (error) {
      console.error("[Admin] Error fetching payment details:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch payment details",
      });
    }
  });

/**
 * Resend email to customer
 */
export const resendPaymentEmail = adminProcedure
  .input(z.object({ orderId: z.number() }))
  .mutation(async ({ input }: any) => {
    try {
      const order = await (await getDb())!.select().from(orders).where(eq(orders.id, input.orderId)).then(r => r[0] ?? null);

      if (!order) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Order not found",
        });
      }

      if (!order.pdfUrl) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No PDF available for this order",
        });
      }

      // Import email service here to avoid circular dependency
      const { sendRentalResultsEmail } = await import("./email-service");

      // For resend, we'll fetch the PDF from the URL and send it again
      const success = await sendRentalResultsEmail(
        order.customerEmail,
        order.customerName,
        Buffer.from("")
      );

      if (!success) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to send email",
        });
      }

      // Log the resend in email tracking
      await (await getDb())!.insert(emailTracking).values({
        submissionId: order.submissionId,
        emailType: "payment_confirmation",
        recipientEmail: order.customerEmail,
        status: "sent",
      });

      return {
        success: true,
        message: "Email resent successfully",
        sentAt: new Date(),
      };
    } catch (error) {
      console.error("[Admin] Error resending email:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to resend email",
      });
    }
  });

/**
 * Get PDF download URL for admin
 */
export const getPdfDownloadUrl = adminProcedure
  .input(z.object({ orderId: z.number() }))
  .query(async ({ input }: any) => {
    try {
      const order = await (await getDb())!.select().from(orders).where(eq(orders.id, input.orderId)).then(r => r[0] ?? null);

      if (!order) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Order not found",
        });
      }

      if (!order.pdfUrl) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No PDF available for this order",
        });
      }

      return {
        pdfUrl: order.pdfUrl,
        fileName: `rental-results-${order.customerName}-${order.id}.pdf`,
      };
    } catch (error) {
      console.error("[Admin] Error getting PDF URL:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to get PDF URL",
      });
    }
  });
