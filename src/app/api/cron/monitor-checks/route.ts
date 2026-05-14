import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { Monitor } from '@/lib/models';
import { runCheck } from '@/lib/monitor';

export const dynamic = 'force-dynamic';

// Runs due monitor checks. Guarded by CRON_SECRET (Bearer or ?secret=).
export async function GET(request: NextRequest) {
  const secret =
    request.headers.get('authorization')?.replace('Bearer ', '') ||
    request.nextUrl.searchParams.get('secret') ||
    '';
  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
    return new Response('Unauthorized', { status: 401 });
  }

  const db = await getDb();
  const now = Date.now();
  const monitors = await db
    .collection<Monitor>('monitors')
    .find({ isActive: true })
    .toArray();

  const due = monitors.filter(
    (m) =>
      !m.lastCheckedAt ||
      now - new Date(m.lastCheckedAt).getTime() >= (m.intervalMinutes || 15) * 60_000
  );

  let checked = 0;
  for (const m of due) {
    try {
      await runCheck(m as Monitor);
      checked++;
    } catch {
      // skip failed check; next run retries
    }
  }

  return NextResponse.json({ checked, due: due.length });
}
