import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-auth';
import { getUserOrgs, createOrganization } from '@/lib/orgs';

// GET: organizations the caller belongs to
export async function GET(request: NextRequest) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  const orgs = await getUserOrgs(auth.userId);
  return NextResponse.json({ orgs });
}

// POST: create a new organization (caller becomes owner)
export async function POST(request: NextRequest) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  const { name } = await request.json();
  if (!name || typeof name !== 'string' || !name.trim()) {
    return NextResponse.json({ error: 'Organization name is required' }, { status: 400 });
  }

  const org = await createOrganization(name.trim(), auth.userId, false);
  return NextResponse.json({ org }, { status: 201 });
}
