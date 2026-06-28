import { Router } from "express";
import { getDb } from "./db";
import { emailLogs, searchSubmissions, orders } from "../drizzle/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import { processEmailCronJob } from "./email-cron-job";

const router = Router();

/**
 * GET /api/email-admin/status
 * Get current status of email cron job and queue statistics
 */
router.get("/status", async (req, res) => {
  try {
    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: "Database not available" });
    }

    // Get email statistics
    const totalEmails = await db.select().from(emailLogs);
    const sentEmails = totalEmails.filter(e => e.status === "sent").length;
    const failedEmails = totalEmails.filter(e => e.status === "failed").length;
    const bouncedEmails = totalEmails.filter(e => e.status === "bounced").length;

    // Get last 24 hours statistics
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const last24HourEmails = totalEmails.filter(
      e => new Date(e.sentAt) >= oneDayAgo
    );

    // Get pending submissions (no payment)
    const allSubmissions = await db.select().from(searchSubmissions);
    let pendingSubmissions = 0;

    for (const submission of allSubmissions) {
      const completedOrders = await db
        .select()
        .from(orders)
        .where(
          and(
            eq(orders.submissionId, submission.id),
            eq(orders.paymentStatus, "completed")
          )
        )
        .limit(1);

      if (completedOrders.length === 0) {
        pendingSubmissions++;
      }
    }

    const status = {
      cronJobStatus: "running",
      lastRun: new Date(),
      nextRun: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes from now
      statistics: {
        totalEmailsSent: sentEmails,
        totalEmailsFailed: failedEmails,
        totalEmailsBounced: bouncedEmails,
        totalEmailsAll: totalEmails.length,
        last24Hours: {
          total: last24HourEmails.length,
          sent: last24HourEmails.filter(e => e.status === "sent").length,
          failed: last24HourEmails.filter(e => e.status === "failed").length,
        },
        pendingSubmissions,
      },
    };

    res.json(status);
  } catch (error) {
    console.error("[Email Admin] Error getting status:", error);
    res.status(500).json({ error: "Failed to get status" });
  }
});

/**
 * GET /api/email-admin/logs
 * Get email logs with filtering and pagination
 * Query params: limit=50, offset=0, status=sent, emailType=lead_notification_15min
 */
router.get("/logs", async (req, res) => {
  try {
    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: "Database not available" });
    }

    const limit = Math.min(parseInt(req.query.limit as string) || 50, 500);
    const offset = parseInt(req.query.offset as string) || 0;
    const status = req.query.status as string;
    const emailType = req.query.emailType as string;

    // Build query with filters
    const filters = [];
    if (status) {
      filters.push(eq(emailLogs.status, status as any));
    }
    if (emailType) {
      filters.push(eq(emailLogs.emailType, emailType as any));
    }

    let query = db.select().from(emailLogs);
    if (filters.length > 0) {
      query = (query as any).where(and(...filters));
    }

    // Get total count
    const allLogs = await (query as any);
    const total = allLogs.length;

    // Get paginated results
    const logs = allLogs
      .sort((a: any, b: any) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime())
      .slice(offset, offset + limit);

    res.json({
      logs,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error("[Email Admin] Error getting logs:", error);
    res.status(500).json({ error: "Failed to get logs" });
  }
});

/**
 * GET /api/email-admin/logs/:submissionId
 * Get all email logs for a specific submission
 */
router.get("/logs/:submissionId", async (req, res) => {
  try {
    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: "Database not available" });
    }

    const submissionId = parseInt(req.params.submissionId);
    if (isNaN(submissionId)) {
      return res.status(400).json({ error: "Invalid submission ID" });
    }

    const logs = await db
      .select()
      .from(emailLogs)
      .where(eq(emailLogs.submissionId, submissionId))
      .orderBy(desc(emailLogs.sentAt));

    res.json(logs);
  } catch (error) {
    console.error("[Email Admin] Error getting submission logs:", error);
    res.status(500).json({ error: "Failed to get logs" });
  }
});

/**
 * POST /api/email-admin/process-queue
 * Manually trigger email queue processing (admin only)
 */
router.post("/process-queue", async (req, res) => {
  try {
    // In production, add authentication check here
    // if (!req.user || req.user.role !== 'admin') {
    //   return res.status(403).json({ error: 'Forbidden' });
    // }

    console.log("[Email Admin] Manual queue processing triggered");
    await processEmailCronJob();

    res.json({
      success: true,
      message: "Email queue processing completed",
      timestamp: new Date(),
    });
  } catch (error) {
    console.error("[Email Admin] Error processing queue:", error);
    res.status(500).json({ error: "Failed to process queue" });
  }
});

/**
 * GET /api/email-admin/pending-emails
 * Get pending emails that should be sent soon
 */
router.get("/pending-emails", async (req, res) => {
  try {
    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: "Database not available" });
    }

    const pendingEmails = [];

    // Get all submissions from the last 10 days
    const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
    const recentSubmissions = await db
      .select()
      .from(searchSubmissions)
      .where(gte(searchSubmissions.createdAt, tenDaysAgo));

    for (const submission of recentSubmissions) {
      // Check if submission has made a payment
      const completedOrders = await db
        .select()
        .from(orders)
        .where(
          and(
            eq(orders.submissionId, submission.id),
            eq(orders.paymentStatus, "completed")
          )
        )
        .limit(1);

      const hasPaid = completedOrders.length > 0;

      if (!hasPaid) {
        const createdAt = new Date(submission.createdAt);
        const now = new Date();
        const timeElapsedMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60);
        const timeElapsedDays = timeElapsedMinutes / (60 * 24);

        // Check which emails are pending
        if (timeElapsedMinutes >= 10 && timeElapsedMinutes <= 20) {
          const alreadySent = await db
            .select()
            .from(emailLogs)
            .where(
              and(
                eq(emailLogs.submissionId, submission.id),
                eq(emailLogs.emailType, "lead_notification_15min" as any)
              )
            )
            .limit(1);

          if (alreadySent.length === 0) {
            pendingEmails.push({
              submissionId: submission.id,
              customerName: submission.customerName,
              email: submission.customerEmail,
              emailType: "lead_notification_15min",
              reason: "15-minute lead notification",
              timeElapsed: `${Math.round(timeElapsedMinutes)} minutes`,
            });
          }
        }

        if (timeElapsedDays >= 2.9 && timeElapsedDays <= 3.1) {
          const alreadySent = await db
            .select()
            .from(emailLogs)
            .where(
              and(
                eq(emailLogs.submissionId, submission.id),
                eq(emailLogs.emailType, "lead_followup_3days" as any)
              )
            )
            .limit(1);

          if (alreadySent.length === 0) {
            pendingEmails.push({
              submissionId: submission.id,
              customerName: submission.customerName,
              email: submission.customerEmail,
              emailType: "lead_followup_3days",
              reason: "3-day lead follow-up",
              timeElapsed: `${timeElapsedDays.toFixed(1)} days`,
            });
          }
        }

        if (timeElapsedDays >= 9.9 && timeElapsedDays <= 10.1) {
          const alreadySent = await db
            .select()
            .from(emailLogs)
            .where(
              and(
                eq(emailLogs.submissionId, submission.id),
                eq(emailLogs.emailType, "lead_followup_10days" as any)
              )
            )
            .limit(1);

          if (alreadySent.length === 0) {
            pendingEmails.push({
              submissionId: submission.id,
              customerName: submission.customerName,
              email: submission.customerEmail,
              emailType: "lead_followup_10days",
              reason: "10-day lead follow-up",
              timeElapsed: `${timeElapsedDays.toFixed(1)} days`,
            });
          }
        }
      }
    }

    res.json({
      pendingEmails,
      total: pendingEmails.length,
    });
  } catch (error) {
    console.error("[Email Admin] Error getting pending emails:", error);
    res.status(500).json({ error: "Failed to get pending emails" });
  }
});

/**
 * GET /api/email-admin/email-types
 * Get statistics by email type
 */
router.get("/email-types", async (req, res) => {
  try {
    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: "Database not available" });
    }

    const allLogs = await db.select().from(emailLogs);

    // Group by email type
    const byType: Record<string, any> = {};

    allLogs.forEach(log => {
      if (!byType[log.emailType]) {
        byType[log.emailType] = {
          total: 0,
          sent: 0,
          failed: 0,
          bounced: 0,
          opened: 0,
          clicked: 0,
        };
      }

      byType[log.emailType].total++;
      byType[log.emailType][log.status]++;
    });

    res.json(byType);
  } catch (error) {
    console.error("[Email Admin] Error getting email type stats:", error);
    res.status(500).json({ error: "Failed to get statistics" });
  }
});

export default router;
