import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-auth';
import { markRead } from '@/lib/forms';

// PATCH: mark a submission as read.
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  await markRead(params.id, auth.userId);
  return NextResponse.json({ success: true });
}
