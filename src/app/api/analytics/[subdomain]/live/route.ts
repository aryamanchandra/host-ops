import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-auth';
import { getLiveAnalytics } from '@/lib/analytics';

export const dynamic = 'force-dynamic';

const SNAPSHOT_INTERVAL_MS = 5000;

// Server-Sent Events stream of live analytics snapshots. EventSource cannot
// set headers, so requireAuth also accepts the JWT as a ?token= query param.
export async function GET(
  request: NextRequest,
  { params }: { params: { subdomain: string } }
) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  const { subdomain } = params;

  // Polling fallback for clients without EventSource: a single JSON snapshot.
  if (request.nextUrl.searchParams.get('poll') === '1') {
    const snapshot = await getLiveAnalytics(subdomain);
    return Response.json(snapshot, {
      headers: { 'Cache-Control': 'no-store' },
    });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let closed = false;

      const send = async () => {
        if (closed) return;
        try {
          const snapshot = await getLiveAnalytics(subdomain);
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(snapshot)}\n\n`)
          );
        } catch {
          // transient read error — skip this tick, keep the stream open
        }
      };

      await send();
      const interval = setInterval(send, SNAPSHOT_INTERVAL_MS);

      request.signal.addEventListener('abort', () => {
        closed = true;
        clearInterval(interval);
        try {
          controller.close();
        } catch {
          // already closed
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
