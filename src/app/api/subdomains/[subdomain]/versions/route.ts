import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-auth';
import { getDb } from '@/lib/mongodb';
import { listVersions } from '@/lib/versions';

// GET: version history for a subdomain owned by the caller.
export async function GET(
  request: NextRequest,
  { params }: { params: { subdomain: string } }
) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  const db = await getDb();
  const owned = await db
    .collection('subdomains')
    .findOne({ subdomain: params.subdomain, userId: auth.userId });
  if (!owned) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const versions = await listVersions(params.subdomain);
  return NextResponse.json({ versions });
}
