import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { Subdomain } from '@/lib/models';
import { isWithinWindow } from '@/lib/schedule';

// Public: minimal resolution payload so a caller can decide page vs redirect
// without fetching full content.
export async function GET(
  _request: NextRequest,
  { params }: { params: { subdomain: string } }
) {
  const db = await getDb();
  const doc = (await db
    .collection<Subdomain>('subdomains')
    .findOne({ subdomain: params.subdomain })) as Subdomain | null;

  if (!doc || !isWithinWindow(doc)) {
    return NextResponse.json({ found: false }, { status: 404 });
  }

  if (doc.type === 'redirect' && doc.redirectUrl) {
    return NextResponse.json({
      found: true,
      type: 'redirect',
      redirectUrl: doc.redirectUrl,
      redirectType: doc.redirectType || 302,
    });
  }

  return NextResponse.json({ found: true, type: 'page' });
}
