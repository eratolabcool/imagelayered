import { and, desc, eq, lt, lte } from 'drizzle-orm';

import {
  studioGuestUsage,
  studioOperation,
  studioRevision,
} from '@/config/db/schema';
import { db } from '@/core/db';
import { getUuid } from '@/shared/lib/hash';

export const STUDIO_GUEST_DAILY_AI_LIMIT = 3;
export const STUDIO_GUEST_OPERATION_COOLDOWN_MS = 10_000;

export type NewStudioOperation = {
  projectId: string;
  actorKey: string;
  type: string;
  inputRevisionId?: string | null;
  targetLayerIds?: string[];
  prompt?: string;
  provider?: string | null;
  model?: string | null;
  status?: string;
  creditState?: string;
};

export async function createStudioOperationRecord(input: NewStudioOperation) {
  const [row] = await db()
    .insert(studioOperation)
    .values({
      id: getUuid(),
      projectId: input.projectId,
      actorKey: input.actorKey,
      type: input.type,
      inputRevisionId: input.inputRevisionId || null,
      targetLayerIds: JSON.stringify(input.targetLayerIds || []),
      prompt: input.prompt || null,
      provider: input.provider || null,
      model: input.model || null,
      status: input.status || 'queued',
      creditState: input.creditState || 'none',
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  return row;
}

export async function findStudioOperationForActor(
  id: string,
  actorKey: string
) {
  const [row] = await db()
    .select()
    .from(studioOperation)
    .where(and(eq(studioOperation.id, id), eq(studioOperation.actorKey, actorKey)))
    .limit(1);
  return row;
}

export async function updateStudioOperationRecord(
  id: string,
  actorKey: string,
  patch: Partial<typeof studioOperation.$inferInsert>
) {
  const [row] = await db()
    .update(studioOperation)
    .set({ ...patch, updatedAt: new Date() })
    .where(and(eq(studioOperation.id, id), eq(studioOperation.actorKey, actorKey)))
    .returning();
  return row;
}

export async function createStudioRevisionRecord(input: {
  projectId: string;
  actorKey: string;
  parentRevisionId?: string | null;
  operationId?: string | null;
  snapshot: unknown;
}) {
  const [row] = await db()
    .insert(studioRevision)
    .values({
      id: getUuid(),
      projectId: input.projectId,
      actorKey: input.actorKey,
      parentRevisionId: input.parentRevisionId || null,
      operationId: input.operationId || null,
      snapshot: JSON.stringify(input.snapshot),
      createdAt: new Date(),
    })
    .returning();
  return row;
}

export async function listStudioRevisions(projectId: string, actorKey: string) {
  return db()
    .select()
    .from(studioRevision)
    .where(
      and(
        eq(studioRevision.projectId, projectId),
        eq(studioRevision.actorKey, actorKey)
      )
    )
    .orderBy(desc(studioRevision.createdAt));
}

export async function consumeStudioGuestAIQuota(actorKey: string) {
  if (!actorKey.startsWith('guest:')) return;

  const now = new Date();
  const dayKey = now.toISOString().slice(0, 10);
  const id = `${actorKey}:${dayKey}`;
  const cutoff = new Date(now.getTime() - STUDIO_GUEST_OPERATION_COOLDOWN_MS);

  const [updated] = await db()
    .update(studioGuestUsage)
    .set({
      aiOperations: studioGuestUsage.aiOperations + 1,
      updatedAt: now,
    })
    .where(
      and(
        eq(studioGuestUsage.id, id),
        lt(studioGuestUsage.aiOperations, STUDIO_GUEST_DAILY_AI_LIMIT),
        lte(studioGuestUsage.updatedAt, cutoff)
      )
    )
    .returning();

  if (updated) return;

  const [current] = await db()
    .select()
    .from(studioGuestUsage)
    .where(eq(studioGuestUsage.id, id))
    .limit(1);

  if (current) {
    if (current.aiOperations >= STUDIO_GUEST_DAILY_AI_LIMIT) {
      throw new Error(
        `Guest AI limit reached (${STUDIO_GUEST_DAILY_AI_LIMIT}/day). Sign in to continue.`
      );
    }
    throw new Error('Please wait a few seconds before starting another AI edit.');
  }

  const inserted = await db()
    .insert(studioGuestUsage)
    .values({
      id,
      actorKey,
      dayKey,
      aiOperations: 1,
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoNothing()
    .returning();

  if (inserted.length) return;

  // Another request won the first-use insert race. Re-run the atomic check.
  return consumeStudioGuestAIQuota(actorKey);
}
