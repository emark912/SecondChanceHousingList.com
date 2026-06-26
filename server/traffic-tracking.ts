import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import { createPageView, createTrafficEvent, getDb } from './db';

// Store session IDs in memory (in production, use Redis or similar)
const sessions = new Map<string, string>();
const SESSION_COOKIE_NAME = 'traffic_session_id';
const SESSION_DURATION = 30 * 60 * 1000; // 30 minutes

/**
 * Get or create session ID for tracking
 */
function getSessionId(req: Request, res: Response): string {
  let sessionId = req.cookies?.[SESSION_COOKIE_NAME];
  
  if (!sessionId) {
    sessionId = randomUUID();
    res.cookie(SESSION_COOKIE_NAME, sessionId, {
      maxAge: SESSION_DURATION,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
  }
  
  return sessionId;
}

/**
 * Get device type from user agent
 */
function getDeviceType(userAgent: string): string {
  if (/mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent)) {
    return 'mobile';
  }
  if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
    return 'tablet';
  }
  return 'desktop';
}

/**
 * Get client IP address
 */
function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || '';
}

/**
 * Track page view middleware
 */
export async function trackPageView(req: Request, res: Response, next: NextFunction) {
  // Skip API routes and static assets
  if (req.path.startsWith('/api') || req.path.match(/\.(js|css|png|jpg|gif|svg|ico)$/)) {
    return next();
  }

  try {
    const sessionId = getSessionId(req, res);
    const userAgent = req.headers['user-agent'] || '';
    const ipAddress = getClientIp(req);
    const deviceType = getDeviceType(userAgent);
    const referrer = req.headers['referer'] || '';

    // Extract page title from path
    const pathSegments = req.path.split('/').filter(Boolean);
    const pageTitle = pathSegments[0] || 'home';

    // Track page view asynchronously (don't block response)
    createPageView({
      pagePath: req.path,
      pageTitle: pageTitle.charAt(0).toUpperCase() + pageTitle.slice(1),
      referrer: referrer || null,
      userAgent,
      ipAddress,
      deviceType,
      sessionId,
    }).catch((err: unknown) => {
      console.error('Failed to track page view:', err);
    });
  } catch (error) {
    console.error('Error in page view tracking middleware:', error);
  }

  next();
}

/**
 * Track custom events (form submissions, button clicks, etc.)
 */
export async function trackEvent(
  eventType: string,
  eventName: string,
  pagePath: string,
  req: Request,
  eventData?: Record<string, unknown>
) {
  try {
    const sessionId = req.cookies?.[SESSION_COOKIE_NAME] || randomUUID();
    const ipAddress = getClientIp(req);

    await createTrafficEvent({
      eventType,
      eventName,
      pagePath,
      sessionId,
      ipAddress,
      eventData: eventData || {},
    });
  } catch (error) {
    console.error('Failed to track event:', error);
  }
}

/**
 * Get traffic statistics for admin dashboard
 */
export async function getTrafficStats(days: number = 7) {
  try {
    const { getDb } = await import('./db');
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    const { pageViews, trafficEvents } = await import('../drizzle/schema');
    const { gte, sql } = await import('drizzle-orm');

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get total page views
    const totalViews = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(pageViews)
      .where(gte(pageViews.viewedAt, startDate));

    // Get unique visitors (by session)
    const uniqueVisitors = await db
      .select({ count: sql<number>`COUNT(DISTINCT sessionId)` })
      .from(pageViews)
      .where(gte(pageViews.viewedAt, startDate));

    // Get page views by page
    const viewsByPage = await db
      .select({
        pagePath: pageViews.pagePath,
        pageTitle: pageViews.pageTitle,
        views: sql<number>`COUNT(*)`,
      })
      .from(pageViews)
      .where(gte(pageViews.viewedAt, startDate))
      .groupBy(pageViews.pagePath, pageViews.pageTitle)
      .orderBy(sql`COUNT(*) DESC`)
      .limit(10);

    // Get traffic by device type
    const trafficByDevice = await db
      .select({
        deviceType: pageViews.deviceType,
        views: sql<number>`COUNT(*)`,
      })
      .from(pageViews)
      .where(gte(pageViews.viewedAt, startDate))
      .groupBy(pageViews.deviceType);

    // Get top events
    const topEvents = await db
      .select({
        eventName: trafficEvents.eventName,
        eventType: trafficEvents.eventType,
        count: sql<number>`COUNT(*)`,
      })
      .from(trafficEvents)
      .where(gte(trafficEvents.occurredAt, startDate))
      .groupBy(trafficEvents.eventName, trafficEvents.eventType)
      .orderBy(sql`COUNT(*) DESC`)
      .limit(10);

    return {
      totalViews: totalViews[0]?.count || 0,
      uniqueVisitors: uniqueVisitors[0]?.count || 0,
      viewsByPage,
      trafficByDevice,
      topEvents,
      dateRange: {
        start: startDate.toISOString(),
        end: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error('Error getting traffic stats:', error);
    return {
      totalViews: 0,
      uniqueVisitors: 0,
      viewsByPage: [],
      trafficByDevice: [],
      topEvents: [],
      dateRange: { start: '', end: '' },
    };
  }
}
