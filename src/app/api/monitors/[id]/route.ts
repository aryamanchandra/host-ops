import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { requireAuth } from '@/lib/api-auth';
import { getDb } from '@/lib/mongodb';
import { Monitor } from '@/lib/models';

function oid(id: string): ObjectId | null {
  try {
    return new ObjectId(id);
  } catch {
    return null;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;
  const id = oid(params.id);
  if (!id) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const db = await getDb();
  const monitor = await db
    .collection<Monitor>('monitors')
    .findOne({ _id: id as any, userId: auth.userId });
  if (!monitor) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ monitor });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;
  const id = oid(params.id);
  if (!id) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = await request.json();
  const set: Record<string, any> = { updatedAt: new Date() };
  for (const k of ['targetUrl', 'intervalMinutes', 'certWarnDays', 'isActive'] as const) {
    if (body[k] !== undefined) set[k] = body[k];
  }
  const db = await getDb();
  const res = await db
    .collection('monitors')
    .updateOne({ _id: id, userId: auth.userId }, { $set: set });
  if (!res.matchedCount) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ success: true });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;
  const id = oid(params.id);
  if (!id) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const db = await getDb();
  await db.collection('monitors').deleteOne({ _id: id, userId: auth.userId });
  await db.collection('monitor_checks').deleteMany({ monitorId: params.id });
  return NextResponse.json({ success: true });
}
