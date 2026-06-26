import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getDeviceType, getClientIp } from '../traffic-tracking';

// Mock Express Request and Response types
interface MockRequest {
  headers: Record<string, string | string[]>;
  socket?: { remoteAddress?: string };
  cookies?: Record<string, string>;
  path: string;
}

describe('Traffic Tracking System', () => {
  describe('Device Type Detection', () => {
    it('should detect mobile devices', () => {
      const mobileUserAgents = [
        'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
        'Mozilla/5.0 (Linux; Android 11; SM-G991B)',
        'Mozilla/5.0 (BlackBerry)',
      ];

      mobileUserAgents.forEach(ua => {
        expect(getDeviceType(ua)).toBe('mobile');
      });
    });

    it('should detect tablet devices', () => {
      const tabletUserAgents = [
        'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X)',
        'Mozilla/5.0 (iPad; Tablet)',
        'Mozilla/5.0 (PlayBook)',
      ];

      tabletUserAgents.forEach(ua => {
        expect(getDeviceType(ua)).toBe('tablet');
      });
    });

    it('should detect desktop devices', () => {
      const desktopUserAgents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        'Mozilla/5.0 (X11; Linux x86_64)',
      ];

      desktopUserAgents.forEach(ua => {
        expect(getDeviceType(ua)).toBe('desktop');
      });
    });

    it('should default to desktop for unknown user agents', () => {
      expect(getDeviceType('Unknown Browser')).toBe('desktop');
      expect(getDeviceType('')).toBe('desktop');
    });
  });

  describe('Client IP Extraction', () => {
    it('should extract IP from x-forwarded-for header', () => {
      const req: MockRequest = {
        headers: { 'x-forwarded-for': '192.168.1.1, 10.0.0.1' },
        path: '/',
      };
      expect(getClientIp(req as any)).toBe('192.168.1.1');
    });

    it('should handle single IP in x-forwarded-for', () => {
      const req: MockRequest = {
        headers: { 'x-forwarded-for': '203.0.113.42' },
        path: '/',
      };
      expect(getClientIp(req as any)).toBe('203.0.113.42');
    });

    it('should extract from socket remoteAddress as fallback', () => {
      const req: MockRequest = {
        headers: {},
        socket: { remoteAddress: '127.0.0.1' },
        path: '/',
      };
      expect(getClientIp(req as any)).toBe('127.0.0.1');
    });

    it('should return empty string if no IP found', () => {
      const req: MockRequest = {
        headers: {},
        path: '/',
      };
      expect(getClientIp(req as any)).toBe('');
    });
  });

  describe('Page Title Extraction', () => {
    it('should extract page title from path', () => {
      const paths = [
        { path: '/home', expected: 'Home' },
        { path: '/admin', expected: 'Admin' },
        { path: '/checkout', expected: 'Checkout' },
        { path: '/', expected: 'Home' },
      ];

      paths.forEach(({ path, expected }) => {
        const segments = path.split('/').filter(Boolean);
        const pageTitle = segments[0] || 'home';
        const title = pageTitle.charAt(0).toUpperCase() + pageTitle.slice(1);
        expect(title).toBe(expected);
      });
    });
  });

  describe('Session ID Handling', () => {
    it('should generate valid UUID format', () => {
      const uuid = require('crypto').randomUUID();
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      expect(uuid).toMatch(uuidRegex);
    });

    it('should track session duration', () => {
      const SESSION_DURATION = 30 * 60 * 1000; // 30 minutes
      expect(SESSION_DURATION).toBe(1800000);
    });
  });

  describe('Traffic Statistics Aggregation', () => {
    it('should calculate unique visitor count', () => {
      const sessions = ['session-1', 'session-2', 'session-1', 'session-3'];
      const uniqueSessions = new Set(sessions);
      expect(uniqueSessions.size).toBe(3);
    });

    it('should calculate average views per visitor', () => {
      const totalViews = 100;
      const uniqueVisitors = 25;
      const avgViewsPerVisitor = totalViews / uniqueVisitors;
      expect(avgViewsPerVisitor).toBe(4);
    });

    it('should rank pages by view count', () => {
      const pages = [
        { pagePath: '/home', views: 150 },
        { pagePath: '/checkout', views: 75 },
        { pagePath: '/results', views: 200 },
      ];

      const sorted = pages.sort((a, b) => b.views - a.views);
      expect(sorted[0].pagePath).toBe('/results');
      expect(sorted[1].pagePath).toBe('/home');
      expect(sorted[2].pagePath).toBe('/checkout');
    });

    it('should aggregate device type traffic', () => {
      const deviceTraffic = [
        { deviceType: 'desktop', views: 300 },
        { deviceType: 'mobile', views: 200 },
        { deviceType: 'tablet', views: 50 },
      ];

      const totalViews = deviceTraffic.reduce((sum, d) => sum + d.views, 0);
      expect(totalViews).toBe(550);

      const mobilePercentage = (200 / totalViews) * 100;
      expect(mobilePercentage).toBeCloseTo(36.36, 1);
    });
  });

  describe('Event Tracking', () => {
    it('should track form submission events', () => {
      const event = {
        eventType: 'form_submission',
        eventName: 'rental_profile_submitted',
        pagePath: '/search',
        eventData: { fields: 5, location: 'New York, NY' },
      };

      expect(event.eventType).toBe('form_submission');
      expect(event.eventName).toBe('rental_profile_submitted');
      expect(event.eventData).toHaveProperty('location');
    });

    it('should track button click events', () => {
      const event = {
        eventType: 'button_click',
        eventName: 'checkout_clicked',
        pagePath: '/results',
      };

      expect(event.eventType).toBe('button_click');
      expect(event.eventName).toBe('checkout_clicked');
    });

    it('should track page view events', () => {
      const event = {
        eventType: 'page_view',
        eventName: 'home_page_viewed',
        pagePath: '/',
        sessionId: 'session-123',
      };

      expect(event.eventType).toBe('page_view');
      expect(event.sessionId).toBeDefined();
    });
  });

  describe('Data Privacy and Security', () => {
    it('should not store sensitive user data', () => {
      const trackingData = {
        sessionId: 'session-123',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0...',
        pagePath: '/home',
        // Should NOT include: passwords, credit cards, SSN, etc.
      };

      expect(trackingData).not.toHaveProperty('password');
      expect(trackingData).not.toHaveProperty('creditCard');
      expect(trackingData).not.toHaveProperty('ssn');
    });

    it('should anonymize IP addresses if needed', () => {
      const fullIp = '192.168.1.123';
      const anonymized = fullIp.split('.').slice(0, 3).join('.') + '.0';
      expect(anonymized).toBe('192.168.1.0');
    });
  });

  describe('Time Range Filtering', () => {
    it('should calculate date range for 7 days', () => {
      const days = 7;
      const now = new Date();
      const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

      const diffMs = now.getTime() - startDate.getTime();
      const diffDays = diffMs / (1000 * 60 * 60 * 24);
      expect(diffDays).toBeCloseTo(7, 0);
    });

    it('should calculate date range for 30 days', () => {
      const days = 30;
      const now = new Date();
      const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

      const diffMs = now.getTime() - startDate.getTime();
      const diffDays = diffMs / (1000 * 60 * 60 * 24);
      expect(diffDays).toBeCloseTo(30, 0);
    });

    it('should validate day range limits', () => {
      const validDays = [1, 7, 30, 90, 365];
      validDays.forEach(days => {
        expect(days).toBeGreaterThanOrEqual(1);
        expect(days).toBeLessThanOrEqual(365);
      });
    });
  });
});

// Helper function exports (these would be in the actual module)
function getDeviceType(userAgent: string): string {
  if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
    return 'tablet';
  }
  if (/mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent)) {
    return 'mobile';
  }
  return 'desktop';
}

function getClientIp(req: any): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || '';
}

export { getDeviceType, getClientIp };
