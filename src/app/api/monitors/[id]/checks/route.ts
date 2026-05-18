import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { requireAuth } from '@/lib/api-auth';
import { getDb } from '@/lib/mongodb';
import { Monitor } from '@/lib/models';

// GET: recent checks for an owned monitor.
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  let id: ObjectId;
  try {
    id = new ObjectId(params.id);
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const db = await getDb();
  const monitor = await db
    .collection<Monitor>('monitors')
    .findOne({ _id: id as any, userId: auth.userId });
  if (!monitor) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const checks = await db
    .collection('monitor_checks')
    .find({ monitorId: params.id })
    .sort({ checkedAt: -1 })
    .limit(100)
    .toArray();

  return NextResponse.json({ checks });
}
