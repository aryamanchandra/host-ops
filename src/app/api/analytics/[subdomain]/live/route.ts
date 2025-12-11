import { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getLiveAnalytics } from '@/lib/analytics';

export const dynamic = 'force-dynamic';

const SNAPSHOT_INTERVAL_MS = 5000;

// Server-Sent Events stream of live analytics snapshots. EventSource cannot
// set headers, so the JWT is passed as a ?token= query param.
export async function GET(
  request: NextRequest,
  { params }: { params: { subdomain: string } }
) {
  const token = request.nextUrl.searchParams.get('token') || '';
  const decoded = verifyToken(token);
  if (!decoded) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { subdomain } = params;
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
