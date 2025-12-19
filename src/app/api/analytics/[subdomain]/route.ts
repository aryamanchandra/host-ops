import { NextRequest, NextResponse } from 'next/server';
import { getAnalytics } from '@/lib/analytics';
import { requireAuth } from '@/lib/api-auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { subdomain: string } }
) {
  try {
    const auth = requireAuth(request);
    if (auth instanceof NextResponse) return auth;

    const { subdomain } = params;
    const days = parseInt(request.nextUrl.searchParams.get('days') || '30');

    const analytics = await getAnalytics(subdomain, days);

    return NextResponse.json({
      success: true,
      subdomain,
      analytics,
    });
  } catch (error) {
    console.error('Analytics fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

