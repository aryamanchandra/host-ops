import { NextRequest, NextResponse } from 'next/server';
import { trackPageView } from '@/lib/analytics';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subdomain, path, landingUrl } = body;

    if (!subdomain) {
      return NextResponse.json(
        { error: 'Subdomain is required' },
        { status: 400 }
      );
    }

    // Get visitor info from headers
    const ip = getClientIp(request);

    // Throttle anonymous tracking writes per IP (120/min).
    const limited = rateLimit(`track:${ip}`, 120, 60_000);
    if (!limited.allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }
    const userAgent = request.headers.get('user-agent') || '';
    const referer = request.headers.get('referer') || '';

    await trackPageView({
      subdomain,
      path: path || '/',
      ip,
      userAgent,
      referer,
      landingUrl,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Analytics tracking error:', error);
    return NextResponse.json(
      { error: 'Failed to track page view' },
      { status: 500 }
    );
  }
}

