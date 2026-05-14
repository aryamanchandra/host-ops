import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { requireAuth } from '@/lib/api-auth';
import { getDb } from '@/lib/mongodb';
import { Monitor } from '@/lib/models';
import { runCheck } from '@/lib/monitor';

export const dynamic = 'force-dynamic';

// POST: run an on-demand check for a monitor.
export async function POST(
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
  const monitor = (await db
    .collection<Monitor>('monitors')
    .findOne({ _id: id as any, userId: auth.userId })) as Monitor | null;
  if (!monitor) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const result = await runCheck(monitor);
  return NextResponse.json({ status: result.status, ssl: result.ssl });
}
