import { getDb } from './mongodb';
import { parseUserAgent } from './userAgent';
import { lookupGeo } from './geo';

export interface PageView {
  _id?: string;
  subdomain: string;
  orgId?: string; // Owning organization (multi-tenant scoping)
  path: string;
  timestamp: Date;
  ip?: string;
  userAgent?: string;
  referer?: string;
  country?: string;
  countryCode?: string;
  region?: string;
  city?: string;
  device?: string;
  browser?: string;
  browserVersion?: string;
  os?: string;
  osVersion?: string;
}

export interface AnalyticsSummary {
  totalViews: number;
  uniqueVisitors: number;
  topPages: Array<{ path: string; views: number }>;
  topReferers: Array<{ referer: string; views: number }>;
  deviceBreakdown: Array<{ device: string; count: number }>;
  browserBreakdown: Array<{ browser: string; count: number }>;
  osBreakdown?: Array<{ os: string; count: number }>;
  browserVersionBreakdown?: Array<{ browser: string; version: string; count: number }>;
  countryBreakdown?: Array<{ country: string; countryCode: string; count: number }>;
  topCities?: Array<{ city: string; countryCode: string; count: number }>;
  viewsByDate: Array<{ date: string; views: number }>;
}

export async function trackPageView(data: {
  subdomain: string;
  path: string;
  ip?: string;
  userAgent?: string;
  referer?: string;
}): Promise<void> {
  const db = await getDb();
  
  // Classify the visitor's user agent (device/browser/OS) via ua-parser-js.
  const { device, browser, browserVersion, os, osVersion } = parseUserAgent(
    data.userAgent
  );

  // Resolve coarse geo from the visitor IP (null for private/unresolved).
  const geo = lookupGeo(data.ip);

  const pageView = {
    subdomain: data.subdomain,
    path: data.path,
    timestamp: new Date(),
    ip: data.ip,
    userAgent: data.userAgent,
    referer: data.referer,
    country: geo?.country,
    countryCode: geo?.countryCode,
    region: geo?.region,
    city: geo?.city,
    device,
    browser,
    browserVersion,
    os,
    osVersion,
  };
  
  await db.collection('pageviews').insertOne(pageView as any);
}

export async function getAnalytics(
  subdomain: string,
  days: number = 30
): Promise<AnalyticsSummary> {
  const db = await getDb();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const views = await db.collection<PageView>('pageviews')
    .find({
      subdomain,
      timestamp: { $gte: startDate }
    })
    .toArray();
  
  // Total views
  const totalViews = views.length;
  
  // Unique visitors (by IP)
  const uniqueVisitors = new Set(views.map(v => v.ip).filter(Boolean)).size;
  
  // Top pages
  const pageMap = new Map<string, number>();
  views.forEach(v => {
    pageMap.set(v.path, (pageMap.get(v.path) || 0) + 1);
  });
  const topPages = Array.from(pageMap.entries())
    .map(([path, views]) => ({ path, views }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 10);
  
  // Top referers
  const refererMap = new Map<string, number>();
  views.forEach(v => {
    if (v.referer && v.referer !== '') {
      refererMap.set(v.referer, (refererMap.get(v.referer) || 0) + 1);
    }
  });
  const topReferers = Array.from(refererMap.entries())
    .map(([referer, views]) => ({ referer, views }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 10);
  
  // Device breakdown
  const deviceMap = new Map<string, number>();
  views.forEach(v => {
    deviceMap.set(v.device || 'Unknown', (deviceMap.get(v.device || 'Unknown') || 0) + 1);
  });
  const deviceBreakdown = Array.from(deviceMap.entries())
    .map(([device, count]) => ({ device, count }))
    .sort((a, b) => b.count - a.count);
  
  // Browser breakdown
  const browserMap = new Map<string, number>();
  views.forEach(v => {
    browserMap.set(v.browser || 'Unknown', (browserMap.get(v.browser || 'Unknown') || 0) + 1);
  });
  const browserBreakdown = Array.from(browserMap.entries())
    .map(([browser, count]) => ({ browser, count }))
    .sort((a, b) => b.count - a.count);

  // OS breakdown
  const osMap = new Map<string, number>();
  views.forEach(v => {
    osMap.set(v.os || 'Unknown', (osMap.get(v.os || 'Unknown') || 0) + 1);
  });
  const osBreakdown = Array.from(osMap.entries())
    .map(([os, count]) => ({ os, count }))
    .sort((a, b) => b.count - a.count);

  // Browser version breakdown (browser + major version), top 10
  const browserVersionMap = new Map<string, number>();
  views.forEach(v => {
    const browser = v.browser || 'Unknown';
    // Legacy pageviews (recorded before ua-parser-js) and zero/blank values
    // have no version — bucket them as Unknown rather than dropping them.
    const raw = (v.browserVersion || '').trim();
    const version = raw && raw !== '0' ? raw : 'Unknown';
    const key = `${browser}|${version}`;
    browserVersionMap.set(key, (browserVersionMap.get(key) || 0) + 1);
  });
  const browserVersionBreakdown = Array.from(browserVersionMap.entries())
    .map(([key, count]) => {
      const [browser, version] = key.split('|');
      return { browser, version, count };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Country breakdown (resolved geo only)
  const countryMap = new Map<string, { country: string; count: number }>();
  views.forEach(v => {
    if (!v.countryCode) return;
    const entry = countryMap.get(v.countryCode) || {
      country: v.country || v.countryCode,
      count: 0,
    };
    entry.count += 1;
    countryMap.set(v.countryCode, entry);
  });
  const countryBreakdown = Array.from(countryMap.entries())
    .map(([countryCode, { country, count }]) => ({ country, countryCode, count }))
    .sort((a, b) => b.count - a.count);

  // Top cities
  const cityMap = new Map<string, { city: string; countryCode: string; count: number }>();
  views.forEach(v => {
    if (!v.city) return;
    const key = `${v.city}|${v.countryCode || ''}`;
    const entry = cityMap.get(key) || {
      city: v.city,
      countryCode: v.countryCode || '',
      count: 0,
    };
    entry.count += 1;
    cityMap.set(key, entry);
  });
  const topCities = Array.from(cityMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Views by date
  const dateMap = new Map<string, number>();
  views.forEach(v => {
    const date = v.timestamp.toISOString().split('T')[0];
    dateMap.set(date, (dateMap.get(date) || 0) + 1);
  });
  const viewsByDate = Array.from(dateMap.entries())
    .map(([date, views]) => ({ date, views }))
    .sort((a, b) => a.date.localeCompare(b.date));
  
  return {
    totalViews,
    uniqueVisitors,
    topPages,
    topReferers,
    deviceBreakdown,
    browserBreakdown,
    osBreakdown,
    browserVersionBreakdown,
    countryBreakdown,
    topCities,
    viewsByDate,
  };
}

export async function getAllSubdomainsAnalytics(days: number = 30): Promise<Map<string, AnalyticsSummary>> {
  const db = await getDb();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const views = await db.collection<PageView>('pageviews')
    .find({ timestamp: { $gte: startDate } })
    .toArray();
  
  const subdomainMap = new Map<string, PageView[]>();
  views.forEach(v => {
    if (!subdomainMap.has(v.subdomain)) {
      subdomainMap.set(v.subdomain, []);
    }
    subdomainMap.get(v.subdomain)!.push(v);
  });
  
  const analyticsMap = new Map<string, AnalyticsSummary>();
  
  for (const [subdomain] of subdomainMap) {
    const analytics = await getAnalytics(subdomain, days);
    analyticsMap.set(subdomain, analytics);
  }
  
  return analyticsMap;
}

