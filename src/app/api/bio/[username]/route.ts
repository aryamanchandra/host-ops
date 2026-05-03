import { NextResponse } from 'next/server';
import { getBioByUsername } from '@/lib/bio';

// Public: a bio profile by username.
export async function GET(
  _request: Request,
  { params }: { params: { username: string } }
) {
  const profile = await getBioByUsername(params.username);
  if (!profile) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json({ profile });
}
