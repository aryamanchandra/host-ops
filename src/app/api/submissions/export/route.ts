import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-auth';
import { listSubmissions, toCsv } from '@/lib/forms';

// GET: CSV export of a subdomain's submissions (?subdomain=).
export async function GET(request: NextRequest) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  const subdomain = request.nextUrl.searchParams.get('subdomain') || '';
  if (!subdomain) {
    return NextResponse.json({ error: 'subdomain is required' }, { status: 400 });
  }

  const rows = await listSubmissions(subdomain, auth.userId);
  const csv = toCsv(rows);

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${subdomain}-submissions.csv"`,
    },
  });
}
