import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-auth';
import { getDb } from '@/lib/mongodb';
import { Subdomain } from '@/lib/models';
import { getRecentVisitors } from '@/lib/analytics';

export const dynamic = 'force-dynamic';

// GET: recent geolocated visitors across the caller's subdomains (or one).
export async function GET(request: NextRequest) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  const sub = request.nextUrl.searchParams.get('subdomain') || undefined;

  let subdomains: string[] | undefined;
  if (!sub) {
    const db = await getDb();
    const owned = await db
      .collection<Subdomain>('subdomains')
      .find({ userId: auth.userId }, { projection: { subdomain: 1 } })
      .toArray();
    subdomains = owned.map((s) => s.subdomain);
  }

  const data = await getRecentVisitors({
    subdomain: sub,
    subdomains,
    windowSeconds: 600,
  });
  return NextResponse.json(data);
}
