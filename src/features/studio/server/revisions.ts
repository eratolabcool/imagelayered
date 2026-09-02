import {
  createStudioRevisionRecord,
  listStudioRevisions,
  updateStudioOperationRecord,
} from '@/shared/models/studio';

import type { StudioActor } from './identity';

export type CreateRevisionInput = {
  parentRevisionId?: string | null;
  operationId?: string | null;
  snapshot: unknown;
};

function toPayload(row: any) {
  let snapshot: unknown = {};
  try {
    snapshot = JSON.parse(row.snapshot);
  } catch {
    snapshot = {};
  }

  return {
    id: row.id,
    projectId: row.projectId,
    parentRevisionId: row.parentRevisionId || undefined,
    operationId: row.operationId || undefined,
    snapshot,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function listRevisionsForActor(
  actor: StudioActor,
  projectId: string
) {
  const rows = await listStudioRevisions(projectId, actor.actorKey);
  return rows.map(toPayload);
}

export async function createRevisionForActor(
  actor: StudioActor,
  projectId: string,
  input: CreateRevisionInput
) {
  const { parentRevisionId, operationId, snapshot } = input;

  if (!snapshot || typeof snapshot !== 'object') {
    throw new Error('revision snapshot is required');
  }

  const encoded = JSON.stringify(snapshot);
  if (encoded.length > 2_000_000) {
    throw new Error('revision snapshot is too large');
  }

  const row = await createStudioRevisionRecord({
    projectId,
    actorKey: actor.actorKey,
    parentRevisionId: parentRevisionId || null,
    operationId: operationId || null,
    snapshot,
  });

  if (operationId) {
    await updateStudioOperationRecord(operationId, actor.actorKey, {
      outputRevisionId: row.id,
    });
  }

  return toPayload(row);
}
