import { AIMediaType } from '@/extensions/ai';
import { IMAGE_LAYERED_CAPABILITIES } from '@/shared/lib/image-layered-capabilities';
import { refundStudioConsumedCredits } from '@/shared/models/studio-credit';
import {
  createStudioOperationRecord,
  findStudioOperationForActor,
  updateStudioOperationRecord,
} from '@/shared/models/studio';

import { STUDIO_GUEST_COOKIE, type StudioActor } from './identity';
import { persistStudioResultImages } from './persist-result';

const sceneByOperation = {
  decompose: 'image-decomposition',
  replace: 'image-replace',
  recolor: 'image-recolor',
  remove: 'image-remove',
} as const;

export type CreateOperationInput = {
  type: string;
  targetLayerIds?: string[];
  prompt?: string;
  baseRevisionId?: string | null;
  options?: Record<string, unknown>;
};

/**
 * AI dispatch seam. Web injects an HTTP dispatcher that forwards to
 * /api/ai/generate and /api/ai/query with the caller's cookie; Mini injects a
 * server-side dispatcher that calls the shared AI service with a userId.
 * The orchestration (credit state, refund, persistence, status) stays in one
 * place here.
 */
export type AiEnvelope = {
  code: number;
  data?: any;
  message?: string;
  error?: string;
};

export type AiDispatcher = {
  generateAI: (body: {
    mediaType: string;
    scene: string;
    prompt?: string;
    options: Record<string, unknown>;
    layeringMode: string;
  }) => Promise<AiEnvelope>;
  queryAI: (body: {
    taskId: string;
    model?: string;
  }) => Promise<AiEnvelope>;
};

export type AiRequestContext = {
  baseUrl: string;
  cookie?: string | null;
};

function parseJson(value: unknown) {
  if (!value || typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function extractImages(taskInfo: any, taskResult: any): string[] {
  const candidates = [
    ...(Array.isArray(taskInfo?.images)
      ? taskInfo.images.map((image: any) => image?.imageUrl || image?.url || image)
      : []),
    ...(Array.isArray(taskResult?.images) ? taskResult.images : []),
    ...(Array.isArray(taskResult?.output) ? taskResult.output : []),
    ...(Array.isArray(taskResult?.resultUrls) ? taskResult.resultUrls : []),
  ];

  return [
    ...new Set(
      candidates.filter((value): value is string => typeof value === 'string')
    ),
  ];
}

function normalizeStatus(status?: string) {
  const value = status?.toLowerCase();
  if (value === 'success' || value === 'succeeded') return 'succeeded';
  if (
    value === 'failed' ||
    value === 'error' ||
    value === 'cancelled' ||
    value === 'canceled'
  ) {
    return 'failed';
  }
  if (value === 'pending' || value === 'queued') return 'queued';
  return 'running';
}

function parseTargetLayerIds(value: string) {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function toStoredPayload(operation: any) {
  return {
    id: operation.id,
    projectId: operation.projectId,
    type: operation.type,
    inputRevisionId: operation.inputRevisionId || '',
    outputRevisionId: operation.outputRevisionId || undefined,
    targetLayerIds: parseTargetLayerIds(operation.targetLayerIds),
    prompt: operation.prompt || undefined,
    provider: operation.provider || undefined,
    model: operation.model || undefined,
    status: operation.status,
    aiTaskId: operation.aiTaskId || undefined,
    costCredits: operation.costCredits || undefined,
    creditState: operation.creditState || 'none',
    errorCode: operation.errorCode || undefined,
    result: parseJson(operation.result),
    createdAt: operation.createdAt.toISOString(),
    completedAt: operation.completedAt?.toISOString(),
  };
}

/**
 * Web AI dispatcher: forwards to the existing /api/ai/generate + /api/ai/query
 * routes with the caller's cookie (or a freshly-minted guest cookie). This
 * preserves the exact Web behavior including Better Auth session resolution.
 */
export function webAiDispatcher(
  ctx: AiRequestContext,
  guestId?: string | null
): AiDispatcher {
  return {
    async generateAI(body) {
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (ctx.cookie) {
        headers.cookie = ctx.cookie;
      } else if (guestId) {
        headers.cookie = `${STUDIO_GUEST_COOKIE}=${encodeURIComponent(guestId)}`;
      }

      const response = await fetch(new URL('/api/ai/generate', ctx.baseUrl), {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const parsed = await response.json().catch(() => null);
        throw new Error(
          parsed?.message || parsed?.error || 'AI operation failed'
        );
      }
      return response.json();
    },
    async queryAI(body) {
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (ctx.cookie) headers.cookie = ctx.cookie;

      const response = await fetch(new URL('/api/ai/query', ctx.baseUrl), {
        method: 'POST',
        headers,
        cache: 'no-store',
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const parsed = await response.json().catch(() => null);
        throw new Error(parsed?.message || 'Unable to query Studio operation');
      }
      return response.json();
    },
  };
}

export async function createOperationForActor(
  actor: StudioActor,
  projectId: string,
  input: CreateOperationInput,
  ai: AiDispatcher
) {
  let operationId: string | null = null;

  try {
    const {
      type,
      targetLayerIds = [],
      prompt,
      baseRevisionId,
      options = {},
    } = input;

    if (!type || !(type in sceneByOperation)) {
      throw new Error('unsupported studio operation');
    }
    if (!Array.isArray(targetLayerIds) || targetLayerIds.length > 100) {
      throw new Error('invalid target layers');
    }

    const defaultCapability =
      type === 'decompose'
        ? IMAGE_LAYERED_CAPABILITIES.decompose
        : IMAGE_LAYERED_CAPABILITIES.editLayer;

    const operation = await createStudioOperationRecord({
      projectId,
      actorKey: actor.actorKey,
      type,
      inputRevisionId: baseRevisionId || null,
      targetLayerIds,
      prompt,
      provider: defaultCapability.provider,
      model: defaultCapability.model,
      status: 'queued',
      creditState: actor.userId ? 'none' : 'guest',
    });
    operationId = operation.id;

    const scene = sceneByOperation[type as keyof typeof sceneByOperation];
    const generated = await ai.generateAI({
      mediaType: AIMediaType.IMAGE,
      scene,
      prompt:
        prompt ||
        (type === 'decompose'
          ? 'Decompose image into editable transparent layers'
          : undefined),
      options: {
        ...options,
        projectId,
        baseRevisionId,
        targetLayerIds,
      },
      layeringMode: 'studio',
    });

    if (generated?.code !== 0) {
      throw new Error(
        generated?.message || generated?.error || 'AI operation failed'
      );
    }

    const task = generated.data;
    const aiTaskId = task?.id || task?.taskId;
    if (!aiTaskId) throw new Error('AI operation did not return a task id');

    const taskInfo = parseJson(task?.taskInfo);
    const taskResult = parseJson(task?.taskResult);
    const status = normalizeStatus(task?.status);

    if (actor.userId && status === 'failed' && task?.creditId) {
      await refundStudioConsumedCredits(
        task.creditId,
        actor.userId,
        `studio_${scene}_failed`
      );
    }

    const rawImages = extractImages(taskInfo, taskResult);
    const images =
      status === 'succeeded' && rawImages.length
        ? await persistStudioResultImages(rawImages)
        : rawImages;
    const result = { images, taskInfo, taskResult };
    const creditState = actor.userId
      ? status === 'failed'
        ? 'refunded'
        : task?.costCredits
          ? 'charged'
          : 'none'
      : 'guest';

    await updateStudioOperationRecord(operation.id, actor.actorKey, {
      aiTaskId,
      provider: task?.provider || defaultCapability.provider,
      model: task?.model || defaultCapability.model,
      status,
      costCredits: task?.costCredits,
      creditState,
      result: JSON.stringify(result),
      completedAt:
        status === 'succeeded' || status === 'failed' ? new Date() : null,
    });

    return {
      id: operation.id,
      projectId,
      type,
      inputRevisionId: baseRevisionId || '',
      targetLayerIds,
      prompt,
      provider: task?.provider || defaultCapability.provider,
      model: task?.model || defaultCapability.model,
      status,
      aiTaskId,
      costCredits: task?.costCredits,
      creditState,
      createdAt: operation.createdAt.toISOString(),
      completedAt:
        status === 'succeeded' || status === 'failed'
          ? new Date().toISOString()
          : undefined,
      result,
    };
  } catch (error: any) {
    if (operationId) {
      await updateStudioOperationRecord(operationId, actor.actorKey, {
        status: 'failed',
        creditState: actor.userId ? 'released' : 'guest',
        errorCode: error.message || 'studio_operation_failed',
        completedAt: new Date(),
      }).catch(() => undefined);
    }
    throw error;
  }
}

export async function pollOperationForActor(
  actor: StudioActor,
  operationId: string,
  ai: AiDispatcher
) {
  const operation = await findStudioOperationForActor(
    operationId,
    actor.actorKey
  );
  if (!operation) throw new Error('Studio operation not found');

  if (operation.status === 'succeeded' || operation.status === 'failed') {
    return toStoredPayload(operation);
  }

  if (!operation.aiTaskId) {
    throw new Error('Studio operation has no AI task id');
  }

  const payload = await ai.queryAI({
    taskId: operation.aiTaskId,
    model: operation.model || undefined,
  });

  if (payload?.code !== 0) {
    throw new Error(payload?.message || 'Unable to query Studio operation');
  }

  const task = payload.data || {};
  const taskInfo = parseJson(task.taskInfo);
  const taskResult = parseJson(task.taskResult);
  const status = normalizeStatus(task.status);
  const rawImages = extractImages(taskInfo, taskResult);
  const images =
    status === 'succeeded' && rawImages.length
      ? await persistStudioResultImages(rawImages)
      : rawImages;
  const result = { images, taskInfo, taskResult };
  const completedAt =
    status === 'succeeded' || status === 'failed' ? new Date() : null;
  const creditState = actor.userId
    ? status === 'failed'
      ? 'refunded'
      : operation.creditState || 'charged'
    : 'guest';

  const updated = await updateStudioOperationRecord(
    operation.id,
    actor.actorKey,
    {
      status,
      provider: task.provider || operation.provider,
      model: task.model || operation.model,
      costCredits: task.costCredits ?? operation.costCredits,
      creditState,
      result: JSON.stringify(result),
      errorCode:
        status === 'failed'
          ? taskInfo?.errorCode || taskInfo?.errorMessage || 'ai_task_failed'
          : null,
      completedAt,
    }
  );

  return toStoredPayload(updated);
}
