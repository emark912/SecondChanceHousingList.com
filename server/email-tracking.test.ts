import { describe, it, expect } from 'vitest';
import { generateTrackingId, generateTrackingPixel, generateTrackedLink } from './email-service';

describe('Email Tracking System', () => {
  describe('generateTrackingId', () => {
    it('should generate unique tracking IDs with emailLogId prefix', () => {
      const emailLogId = 123;
      const trackingId1 = generateTrackingId(emailLogId);
      const trackingId2 = generateTrackingId(emailLogId);

      expect(trackingId1).toMatch(/^123-/);
      expect(trackingId2).toMatch(/^123-/);
      expect(trackingId1).not.toBe(trackingId2);

      const parts = trackingId1.split('-');
      expect(parts.length).toBe(6);
      expect(parts[0]).toBe('123');
    });

    it('should work with different emailLogIds', () => {
      const id1 = generateTrackingId(1);
      const id2 = generateTrackingId(999);

      expect(id1).toMatch(/^1-/);
      expect(id2).toMatch(/^999-/);
    });

    it('should extract emailLogId from tracking ID', () => {
      const emailLogId = 555;
      const trackingId = generateTrackingId(emailLogId);
      const extractedId = parseInt(trackingId.split('-')[0], 10);
      expect(extractedId).toBe(emailLogId);
    });
  });

  describe('generateTrackingPixel', () => {
    it('should generate valid tracking pixel HTML', () => {
      const trackingPixelId = '123-abc-def-ghi-jkl';
      const pixel = generateTrackingPixel(trackingPixelId);

      expect(pixel).toContain('<img');
      expect(pixel).toContain('src="https://secondchance-3gdukdvh.manus.space/api/email/track/open/');
      expect(pixel).toContain(trackingPixelId);
      expect(pixel).toContain('width="1"');
      expect(pixel).toContain('height="1"');
      expect(pixel).toContain('style="display:none;"');
    });

    it('should properly encode tracking pixel ID in URL', () => {
      const trackingPixelId = '456-xyz-123';
      const pixel = generateTrackingPixel(trackingPixelId);

      expect(pixel).toContain(`/api/email/track/open/${trackingPixelId}`);
    });
  });

  describe('generateTrackedLink', () => {
    it('should generate valid tracked link with redirect parameter', () => {
      const originalUrl = 'https://example.com/payment';
      const clickTrackingId = '789-abc-def-ghi-jkl';
      const trackedLink = generateTrackedLink(originalUrl, clickTrackingId);

      expect(trackedLink).toContain('https://secondchance-3gdukdvh.manus.space/api/email/track/click/');
      expect(trackedLink).toContain(clickTrackingId);
      expect(trackedLink).toContain('redirect=');
      expect(trackedLink).toContain(encodeURIComponent(originalUrl));
    });

    it('should properly encode special characters in redirect URL', () => {
      const originalUrl = 'https://example.com/payment?id=123&token=abc+def';
      const clickTrackingId = '789-test-id';
      const trackedLink = generateTrackedLink(originalUrl, clickTrackingId);

      expect(trackedLink).toContain(encodeURIComponent(originalUrl));
      expect(trackedLink).toContain('redirect=');
    });

    it('should handle URLs with query parameters', () => {
      const originalUrl = 'https://checkout.example.com/pay?amount=9.99&currency=USD';
      const clickTrackingId = '100-test';
      const trackedLink = generateTrackedLink(originalUrl, clickTrackingId);

      expect(trackedLink).toContain('https://secondchance-3gdukdvh.manus.space/api/email/track/click/100-test');
      expect(trackedLink).toContain('redirect=');
    });
  });

  describe('Tracking ID Format Validation', () => {
    it('should maintain consistent format for database storage', () => {
      const emailLogId = 42;
      const trackingId = generateTrackingId(emailLogId);

      const extractedId = parseInt(trackingId.split('-')[0], 10);
      expect(extractedId).toBe(emailLogId);
      expect(trackingId).toMatch(/^42-[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/);
    });

    it('should support large emailLogIds', () => {
      const largeId = 999999;
      const trackingId = generateTrackingId(largeId);

      expect(trackingId).toMatch(/^999999-/);
      const extractedId = parseInt(trackingId.split('-')[0], 10);
      expect(extractedId).toBe(largeId);
      expect(trackingId).toMatch(/^999999-[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/);
    });
  });

  describe('Integration Scenarios', () => {
    it('should generate different tracking IDs for same email log', () => {
      const emailLogId = 50;
      const ids = Array.from({ length: 5 }, () => generateTrackingId(emailLogId));

      ids.forEach(id => {
        expect(id).toMatch(/^50-/);
        expect(id).toMatch(/^50-[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/);
      });

      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(5);
    });

    it('should work together for complete email tracking flow', () => {
      const emailLogId = 77;
      const trackingPixelId = generateTrackingId(emailLogId);
      const clickTrackingId = generateTrackingId(emailLogId);
      const paymentUrl = 'https://checkout.example.com/pay?id=123';

      const pixel = generateTrackingPixel(trackingPixelId);
      const trackedLink = generateTrackedLink(paymentUrl, clickTrackingId);

      expect(trackingPixelId).toMatch(/^77-/);
      expect(clickTrackingId).toMatch(/^77-/);
      expect(trackingPixelId).toMatch(/^77-[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/);
      expect(clickTrackingId).toMatch(/^77-[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/);

      expect(pixel).toContain('<img');
      expect(pixel).toContain(trackingPixelId);

      expect(trackedLink).toContain('https://');
      expect(trackedLink).toContain(clickTrackingId);
      expect(trackedLink).toContain('redirect=');
    });
  });
});
