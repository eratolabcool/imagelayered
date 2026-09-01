import { and, eq, sql } from 'drizzle-orm';

import { credit } from '@/config/db/schema';
import { db } from '@/core/db';
import { envConfigs } from '@/config';
import { refundStudioCreditsWithD1 } from './d1-studio-credit';

const ACTIVE = 'active';
const DELETED = 'deleted';
const CONSUME = 'consume';

/**
 * Restore the exact grant buckets consumed by a Studio AI task.
 * The consume record is atomically moved out of active state first, making
 * retries/idempotent polling safe. A transaction rollback restores that state
 * if any grant restoration fails.
 */
export async function refundStudioConsumedCredits(
  creditId: string,
  userId: string,
  reason = 'studio_ai_failed'
) {
  if (envConfigs.database_provider === 'd1') {
    return refundStudioCreditsWithD1(creditId, userId, reason);
  }

  return db().transaction(async (tx: any) => {
    const [consumed] = await tx
      .update(credit)
      .set({
        status: DELETED,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(credit.id, creditId),
          eq(credit.userId, userId),
          eq(credit.transactionType, CONSUME),
          eq(credit.status, ACTIVE)
        )
      )
      .returning();

    if (!consumed) return false;

    let details: Array<{ creditId?: string; creditsConsumed?: number }> = [];
    try {
      details = JSON.parse(consumed.consumedDetail || '[]');
    } catch {
      throw new Error('Unable to refund Studio credits: invalid consumption detail');
    }

    for (const item of details) {
      const amount = Number(item.creditsConsumed || 0);
      if (!item.creditId || !Number.isFinite(amount) || amount <= 0) continue;

      await tx
        .update(credit)
        .set({
          remainingCredits: sql`${credit.remainingCredits} + ${amount}`,
          updatedAt: new Date(),
        })
        .where(
          and(eq(credit.id, item.creditId), eq(credit.userId, userId))
        );
    }

    let metadata: Record<string, unknown> = {};
    try {
      metadata = consumed.metadata ? JSON.parse(consumed.metadata) : {};
    } catch {
      metadata = {};
    }

    await tx
      .update(credit)
      .set({
        metadata: JSON.stringify({
          ...metadata,
          refunded: true,
          refundReason: reason,
          refundedAt: new Date().toISOString(),
        }),
      })
      .where(eq(credit.id, creditId));

    return true;
  });
}
