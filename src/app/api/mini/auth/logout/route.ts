import { respOk } from '@/shared/lib/resp';
import { revokeMiniSession } from '@/shared/models/mini-identity';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST /api/mini/auth/logout
 *
 * Logout is deliberately idempotent. A client may be offline or already
 * expired when it leaves the app, so an invalid token must not prevent local
 * session cleanup.
 */
export async function POST(request: Request) {
  const header = request.headers.get('authorization') || '';
  const match = header.match(/^Bearer\s+(.+)$/i);
  const token = match?.[1]?.trim() || '';

  if (token.startsWith('min_')) {
    await revokeMiniSession(token);
  }

  return respOk();
}
