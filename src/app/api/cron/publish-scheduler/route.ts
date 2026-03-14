import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

// Per-minute scheduler: flips isActive on subdomains whose publish/unpublish
// boundary has passed. Guarded by CRON_SECRET (Vercel cron sends it as a
// Bearer token; a ?secret= query is also accepted for manual runs).
export async function GET(request: NextRequest) {
  const secret =
    request.headers.get('authorization')?.replace('Bearer ', '') ||
    request.nextUrl.searchParams.get('secret') ||
    '';
  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
    return new Response('Unauthorized', { status: 401 });
  }

  const db = await getDb();
  const now = new Date();

  const activated = await db.collection('subdomains').updateMany(
    { publishAt: { $lte: now }, isActive: false },
    { $set: { isActive: true, lastScheduledFlipAt: now } }
  );
  const deactivated = await db.collection('subdomains').updateMany(
    { unpublishAt: { $lte: now }, isActive: true },
    { $set: { isActive: false, lastScheduledFlipAt: now } }
  );

  return NextResponse.json({
    activated: activated.modifiedCount,
    deactivated: deactivated.modifiedCount,
  });
}
