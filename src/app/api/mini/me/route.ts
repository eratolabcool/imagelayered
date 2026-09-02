import { eq } from 'drizzle-orm';

import { user } from '@/config/db/schema';
import { db } from '@/core/db';
import { respData, respErr } from '@/shared/lib/resp';
import { getRemainingCredits } from '@/shared/models/credit';
import {
  getMiniActor,
  hasMiniWelcomeGrant,
  MiniAuthError,
  miniErrorResponse,
} from '@/shared/models/mini-identity';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/mini/me
 * Bearer authenticated. Deliberately does not expose openid/unionid/session_key.
 */
export async function GET(request: Request) {
  try {
    const actor = await getMiniActor(request);

    const [userRow] = await db()
      .select()
      .from(user)
      .where(eq(user.id, actor.userId))
      .limit(1);

    const balance = await getRemainingCredits(actor.userId);
    const welcomeGranted = await hasMiniWelcomeGrant(actor.identityId);

    return respData({
      user: {
        id: actor.userId,
        name: userRow?.name ?? '微信用户',
      },
      credits: { balance },
      welcomeGranted,
    });
  } catch (error: any) {
    if (error instanceof MiniAuthError) {
      return miniErrorResponse(error);
    }
    console.error('[mini] me failed', error);
    return respErr(error?.message || 'mini me failed');
  }
}
