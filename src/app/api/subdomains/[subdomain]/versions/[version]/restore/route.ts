import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-auth';
import { getDb } from '@/lib/mongodb';
import { Subdomain } from '@/lib/models';
import { getVersion, snapshotVersion } from '@/lib/versions';

// POST: restore a prior version into the subdomain (as a new draft).
export async function POST(
  request: NextRequest,
  { params }: { params: { subdomain: string; version: string } }
) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  const db = await getDb();
  const current = (await db
    .collection<Subdomain>('subdomains')
    .findOne({ subdomain: params.subdomain, userId: auth.userId })) as Subdomain | null;
  if (!current) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const v = await getVersion(params.subdomain, Number(params.version));
  if (!v) {
    return NextResponse.json({ error: 'Version not found' }, { status: 404 });
  }

  // Backfill status/version on legacy docs so the snapshot + increment work.
  if (current.version === undefined || current.status === undefined) {
    current.version = current.version || 1;
    current.status = current.status || 'published';
    await db
      .collection('subdomains')
      .updateOne(
        { subdomain: params.subdomain, userId: auth.userId },
        { $set: { status: current.status, version: current.version } }
      );
  }

  // Snapshot the current state, then overwrite with the restored version.
  await snapshotVersion(current, 'restore', { id: auth.userId, name: auth.username });
  await db.collection('subdomains').updateOne(
    { subdomain: params.subdomain, userId: auth.userId },
    {
      $set: {
        title: v.title,
        description: v.description,
        content: v.content,
        customCss: v.customCss,
        contentFormat: v.contentFormat,
        blocks: v.blocks,
        status: 'draft',
        version: (current.version || 1) + 1,
        updatedAt: new Date(),
      },
    }
  );

  return NextResponse.json({ success: true });
}
