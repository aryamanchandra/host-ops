import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-auth';
import { getBioByUser, saveBio } from '@/lib/bio';

// GET: the caller's own bio profile.
export async function GET(request: NextRequest) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;
  const profile = await getBioByUser(auth.userId);
  return NextResponse.json({ profile });
}

// PUT: create/update the caller's bio profile.
export async function PUT(request: NextRequest) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  const body = await request.json();
  if (!body.username || !/^[a-z0-9-_]+$/i.test(body.username)) {
    return NextResponse.json({ error: 'A valid username is required' }, { status: 400 });
  }

  try {
    await saveBio(auth.userId, body);
  } catch (e: any) {
    if (e?.code === 11000) {
      return NextResponse.json({ error: 'That username is taken' }, { status: 409 });
    }
    throw e;
  }
  return NextResponse.json({ success: true });
}
