import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-auth';
import { listSubmissions } from '@/lib/forms';

// GET: submissions for a subdomain the caller owns (?subdomain=).
export async function GET(request: NextRequest) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  const subdomain = request.nextUrl.searchParams.get('subdomain') || '';
  if (!subdomain) {
    return NextResponse.json({ error: 'subdomain is required' }, { status: 400 });
  }

  const submissions = await listSubmissions(subdomain, auth.userId);
  return NextResponse.json({ submissions });
}
