import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-auth';
import { getDb } from '@/lib/mongodb';
import { Monitor } from '@/lib/models';
import { ensureMonitorIndexes } from '@/lib/monitor';

// GET: the caller's monitors.
export async function GET(request: NextRequest) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;
  const db = await getDb();
  const monitors = await db
    .collection<Monitor>('monitors')
    .find({ userId: auth.userId })
    .sort({ createdAt: -1 })
    .toArray();
  return NextResponse.json({ monitors });
}

// POST: create a monitor for a host.
export async function POST(request: NextRequest) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  const body = await request.json();
  const host = String(body.host || '').trim().toLowerCase();
  if (!host || !/^[a-z0-9.-]+\.[a-z]{2,}$/.test(host)) {
    return NextResponse.json({ error: 'A valid host is required' }, { status: 400 });
  }

  await ensureMonitorIndexes();
  const db = await getDb();
  const now = new Date();
  const monitor = {
    userId: auth.userId,
    subdomain: body.subdomain || undefined,
    host,
    targetUrl: body.targetUrl || `https://${host}`,
    intervalMinutes: Number(body.intervalMinutes) || 15,
    certWarnDays: Number(body.certWarnDays) || 14,
    isActive: true,
    lastStatus: 'unknown' as const,
    createdAt: now,
    updatedAt: now,
  };

  try {
    const res = await db.collection('monitors').insertOne(monitor as any);
    return NextResponse.json({ monitor: { ...monitor, _id: res.insertedId.toString() } }, { status: 201 });
  } catch (e: any) {
    if (e?.code === 11000) {
      return NextResponse.json({ error: 'You already monitor this host' }, { status: 409 });
    }
    throw e;
  }
}
