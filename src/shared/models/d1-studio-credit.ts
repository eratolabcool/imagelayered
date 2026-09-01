import { and, asc, eq, gt, sql } from 'drizzle-orm';

import { aiTask, credit } from '@/config/db/schema';
import { getD1Db } from '@/core/db/d1';
import { getSnowId, getUuid } from '@/shared/lib/hash';

import type { NewAITask } from './ai_task';
import {
  CreditStatus,
  CreditTransactionType,
  type NewCredit,
} from './credit';

const mutationGuard = (d1: ReturnType<typeof getD1Db>) =>
  d1
    .select({
      ok: sql<number>`CASE WHEN changes() = 1 THEN 1 ELSE json_extract('invalid', '$') END`,
    })
    .from(credit)
    .limit(1);

/**
 * D1 rejects SQL BEGIN/COMMIT. Its batch API is atomic, so build the Studio
 * task and credit mutations as one optimistic, all-or-nothing batch instead.
 */
export async function createAITaskWithD1Credits(newAITask: NewAITask) {
  const d1 = getD1Db();
  const cost = Number(newAITask.costCredits || 0);

  if (cost <= 0) {
    const [tasks] = await d1.batch([
      d1.insert(aiTask).values(newAITask).returning(),
    ]);
    return tasks[0];
  }

  const grants = await d1
    .select()
    .from(credit)
    .where(
      and(
        eq(credit.userId, newAITask.userId),
        eq(credit.transactionType, CreditTransactionType.GRANT),
        eq(credit.status, CreditStatus.ACTIVE),
        gt(credit.remainingCredits, 0)
      )
    )
    .orderBy(asc(credit.expiresAt))
    // Keep the atomic batch comfortably below D1 statement limits and match
    // the existing libSQL path's maximum number of grant buckets per consume.
    .limit(10);

  const available = grants.reduce(
    (total, grant) => total + grant.remainingCredits,
    0
  );
  if (available < cost) {
    throw new Error(`Insufficient credits, ${available} < ${cost}`);
  }

  let remaining = cost;
  const allocations = grants.flatMap((grant) => {
    if (remaining <= 0) return [];
    const amount = Math.min(remaining, grant.remainingCredits);
    remaining -= amount;
    return [{ grant, amount }];
  });

  const consumedCredit: NewCredit = {
    id: getUuid(),
    transactionNo: getSnowId(),
    transactionType: CreditTransactionType.CONSUME,
    transactionScene: newAITask.scene,
    userId: newAITask.userId,
    status: CreditStatus.ACTIVE,
    description: `generate ${newAITask.mediaType}`,
    credits: -cost,
    consumedDetail: JSON.stringify(
      allocations.map(({ grant, amount }) => ({
        creditId: grant.id,
        transactionNo: grant.transactionNo,
        expiresAt: grant.expiresAt,
        creditsConsumed: amount,
        creditsBefore: grant.remainingCredits,
        creditsAfter: grant.remainingCredits - amount,
      }))
    ),
    metadata: JSON.stringify({
      type: 'ai-task',
      mediaType: newAITask.mediaType,
      taskId: newAITask.id,
    }),
  };

  const statements: any[] = [
    d1
      .insert(aiTask)
      .values({ ...newAITask, creditId: consumedCredit.id })
      .returning(),
  ];

  for (const { grant, amount } of allocations) {
    statements.push(
      d1
        .update(credit)
        .set({
          remainingCredits: grant.remainingCredits - amount,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(credit.id, grant.id),
            eq(credit.userId, newAITask.userId),
            eq(credit.remainingCredits, grant.remainingCredits)
          )
        ),
      mutationGuard(d1)
    );
  }

  statements.push(d1.insert(credit).values(consumedCredit));
  const [tasks] = await d1.batch(statements as any);
  const task = (tasks as any[])[0];
  if (!task) throw new Error('D1 failed to create AI task');
  return task;
}

export async function refundStudioCreditsWithD1(
  creditId: string,
  userId: string,
  reason: string
) {
  const d1 = getD1Db();
  const [consumed] = await d1
    .select()
    .from(credit)
    .where(
      and(
        eq(credit.id, creditId),
        eq(credit.userId, userId),
        eq(credit.transactionType, CreditTransactionType.CONSUME)
      )
    );

  if (!consumed || consumed.status !== CreditStatus.ACTIVE) return false;

  let details: Array<{ creditId?: string; creditsConsumed?: number }>;
  try {
    details = JSON.parse(consumed.consumedDetail || '[]');
  } catch {
    throw new Error('Unable to refund Studio credits: invalid consumption detail');
  }

  let metadata: Record<string, unknown> = {};
  try {
    metadata = consumed.metadata ? JSON.parse(consumed.metadata) : {};
  } catch {
    metadata = {};
  }

  const statements: any[] = [
    d1
      .update(credit)
      .set({
        status: CreditStatus.DELETED,
        updatedAt: new Date(),
        metadata: JSON.stringify({
          ...metadata,
          refunded: true,
          refundReason: reason,
          refundedAt: new Date().toISOString(),
        }),
      })
      .where(
        and(
          eq(credit.id, creditId),
          eq(credit.userId, userId),
          eq(credit.status, CreditStatus.ACTIVE)
        )
      ),
    mutationGuard(d1),
  ];

  for (const item of details) {
    const amount = Number(item.creditsConsumed || 0);
    if (!item.creditId || !Number.isFinite(amount) || amount <= 0) continue;
    statements.push(
      d1
        .update(credit)
        .set({
          remainingCredits: sql`${credit.remainingCredits} + ${amount}`,
          updatedAt: new Date(),
        })
        .where(and(eq(credit.id, item.creditId), eq(credit.userId, userId))),
      mutationGuard(d1)
    );
  }

  try {
    await d1.batch(statements as any);
    return true;
  } catch (error) {
    const [latest] = await d1
      .select({ status: credit.status })
      .from(credit)
      .where(and(eq(credit.id, creditId), eq(credit.userId, userId)));
    if (latest?.status === CreditStatus.DELETED) return false;
    throw error;
  }
}
