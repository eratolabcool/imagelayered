import {
  MiniAuthError,
  MINI_ERROR,
  type MiniActor,
} from '@/shared/models/mini-identity';

import type { StudioActor } from './identity';

export class MiniError extends Error {
  code: number;
  status: number;

  constructor(code: number, status: number, message: string) {
    super(message);
    this.name = 'MiniError';
    this.code = code;
    this.status = status;
  }
}

export function miniOk(data: any): Response {
  return Response.json({ code: 0, message: 'ok', data });
}

/**
 * Mini actor -> Studio actor. Mini is always authenticated (no guest), so the
 * Studio guestId is null and actorKey is already `user:<id>`.
 */
export function toStudioActor(actor: MiniActor): StudioActor {
  return { userId: actor.userId, actorKey: actor.actorKey, guestId: null };
}

const MESSAGE_MAP: Array<{ pattern: RegExp; code: number; status: number }> = [
  { pattern: /insufficient credits/i, code: MINI_ERROR.CREDIT_INSUFFICIENT, status: 402 },
  { pattern: /unsupported studio operation/i, code: MINI_ERROR.OPERATION_INVALID_TYPE, status: 400 },
  { pattern: /Studio operation not found|no permission/i, code: MINI_ERROR.OPERATION_NOT_FOUND, status: 404 },
  { pattern: /Project not found/i, code: MINI_ERROR.PROJECT_NOT_FOUND, status: 404 },
  { pattern: /revision snapshot is required|revision snapshot is too large/i, code: MINI_ERROR.REVISION_INVALID, status: 400 },
  { pattern: /Authentication required/i, code: MINI_ERROR.AUTH_TOKEN_INVALID, status: 401 },
  {
    pattern: /forbidden field|invalid target layers|width, height and originalAssetId are required|layers are required|too many layers|invalid params|prompt or options is required|invalid scene|invalid mediaType|invalid provider/i,
    code: 40000,
    status: 400,
  },
];

/**
 * Uniform Mini Program error envelope. Maps both typed errors and the plain
 * Error messages thrown by the shared Studio orchestration onto the mini
 * error-code table + sensible HTTP statuses.
 */
export function miniErr(error: any): Response {
  if (error instanceof MiniAuthError) {
    return Response.json(
      { code: error.code, message: error.message },
      { status: error.status }
    );
  }
  if (error instanceof MiniError) {
    return Response.json(
      { code: error.code, message: error.message },
      { status: error.status }
    );
  }

  const message = error?.message || 'internal error';
  for (const entry of MESSAGE_MAP) {
    if (entry.pattern.test(message)) {
      return Response.json({ code: entry.code, message }, { status: entry.status });
    }
  }

  console.error('[mini] unhandled error', error);
  return Response.json({ code: MINI_ERROR.INTERNAL, message }, { status: 500 });
}

/**
 * Mini operation payload: strips provider/model/aiTaskId (internal task
 * details) but keeps the fields the client needs for polling and UI.
 */
export function toMiniOperationPayload(op: any) {
  return {
    id: op.id,
    projectId: op.projectId,
    type: op.type,
    status: op.status,
    inputRevisionId: op.inputRevisionId ?? '',
    targetLayerIds: op.targetLayerIds ?? [],
    prompt: op.prompt,
    costCredits: op.costCredits,
    creditState: op.creditState,
    outputRevisionId: op.outputRevisionId,
    errorCode: op.errorCode,
    result: op.result,
    createdAt: op.createdAt,
    completedAt: op.completedAt,
  };
}
