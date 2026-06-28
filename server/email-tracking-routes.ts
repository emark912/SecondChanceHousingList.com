import { Express, Request, Response } from 'express';
import { createEmailTrackingOpen, getEmailTrackingOpen, createEmailTrackingClick } from './db';

/**
 * Register email tracking routes
 */
export function registerEmailTrackingRoutes(app: Express) {
  // Tracking pixel endpoint for email opens
  app.get('/api/email/track/open/:trackingPixelId', async (req: Request, res: Response) => {
    try {
      const { trackingPixelId } = req.params;
      const userAgent = req.headers['user-agent'] || '';
      const ipAddress = req.headers['x-forwarded-for']?.toString().split(',')[0] || req.socket?.remoteAddress || '';

      // Check if already tracked
      const existing = await getEmailTrackingOpen(trackingPixelId);
      if (!existing) {
        // Extract emailLogId from trackingPixelId format: {emailLogId}-{uuid}
        const emailLogId = parseInt(trackingPixelId.split('-')[0], 10);
        if (!isNaN(emailLogId)) {
          await createEmailTrackingOpen({
            emailLogId,
            trackingPixelId,
            userAgent,
            ipAddress,
          });
        }
      }

      // Return 1x1 transparent pixel
      const pixel = Buffer.from([
        0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00, 0x80, 0x00,
        0x00, 0xFF, 0xFF, 0xFF, 0x00, 0x00, 0x00, 0x21, 0xF9, 0x04, 0x01, 0x0A,
        0x00, 0x01, 0x00, 0x2C, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00,
        0x00, 0x02, 0x02, 0x4C, 0x01, 0x00, 0x3B,
      ]);

      res.setHeader('Content-Type', 'image/gif');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.send(pixel);
    } catch (error) {
      console.error('Email open tracking error:', error);
      // Still return pixel even on error
      const pixel = Buffer.from([
        0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00, 0x80, 0x00,
        0x00, 0xFF, 0xFF, 0xFF, 0x00, 0x00, 0x00, 0x21, 0xF9, 0x04, 0x01, 0x0A,
        0x00, 0x01, 0x00, 0x2C, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00,
        0x00, 0x02, 0x02, 0x4C, 0x01, 0x00, 0x3B,
      ]);
      res.setHeader('Content-Type', 'image/gif');
      res.send(pixel);
    }
  });

  // Click tracking endpoint
  app.get('/api/email/track/click/:clickTrackingId', async (req: Request, res: Response) => {
    try {
      const { clickTrackingId } = req.params;
      const { redirect } = req.query;
      const userAgent = req.headers['user-agent'] || '';
      const ipAddress = req.headers['x-forwarded-for']?.toString().split(',')[0] || req.socket?.remoteAddress || '';

      // Extract emailLogId from clickTrackingId format: {emailLogId}-{uuid}
      const emailLogId = parseInt(clickTrackingId.split('-')[0], 10);
      if (!isNaN(emailLogId)) {
        await createEmailTrackingClick({
          emailLogId,
          clickTrackingId,
          linkUrl: redirect ? decodeURIComponent(redirect as string) : '',
          userAgent,
          ipAddress,
        });
      }

      // Redirect to original URL if provided
      if (redirect && typeof redirect === 'string') {
        res.redirect(decodeURIComponent(redirect));
      } else {
        res.status(200).json({ tracked: true });
      }
    } catch (error) {
      console.error('Email click tracking error:', error);
      const { redirect } = req.query;
      if (redirect && typeof redirect === 'string') {
        res.redirect(decodeURIComponent(redirect));
      } else {
        res.status(500).json({ error: 'Tracking failed' });
      }
    }
  });
}
