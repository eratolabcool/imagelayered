import { desc, eq } from 'drizzle-orm';

import { credit } from '@/config/db/schema';
import { db } from '@/core/db';
import { respData, respErr } from '@/shared/lib/resp';
import { getRemainingCredits } from '@/shared/models/credit';
import {
  getMiniActor,
  MiniAuthError,
  miniErrorResponse,
} from '@/shared/models/mini-identity';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/mini/credits
 * Read-only view of the existing credit ledger. The client never consumes
 * credits directly — charging only happens server-side on AI operations.
 */
export async function GET(request: Request) {
  try {
    const actor = await getMiniActor(request);

    const balance = await getRemainingCredits(actor.userId);
    const recent = await db()
      .select()
      .from(credit)
      .where(eq(credit.userId, actor.userId))
      .orderBy(desc(credit.createdAt))
      .limit(10);

    return respData({
      balance,
      currency: 'credits',
      recentTransactions: recent.map((row: any) => ({
        id: row.id,
        transactionType: row.transactionType,
        transactionScene: row.transactionScene,
        credits: row.credits,
        remainingCredits: row.remainingCredits,
        description: row.description,
        createdAt: row.createdAt,
      })),
    });
  } catch (error: any) {
    if (error instanceof MiniAuthError) {
      return miniErrorResponse(error);
    }
    console.error('[mini] credits failed', error);
    return respErr(error?.message || 'mini credits failed');
  }
}
