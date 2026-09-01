import { AIMediaType } from '@/extensions/ai';
import {
  getStudioActor,
  STUDIO_GUEST_COOKIE,
} from '@/features/studio/server/identity';
import { persistStudioResultImages } from '@/features/studio/server/persist-result';
import { IMAGE_LAYERED_CAPABILITIES } from '@/shared/lib/image-layered-capabilities';
import { respData, respErr } from '@/shared/lib/resp';
import { refundStudioConsumedCredits } from '@/shared/models/studio-credit';
import {
  createStudioOperationRecord,
  updateStudioOperationRecord,
} from '@/shared/models/studio';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const sceneByOperation = {
  decompose: 'image-decomposition',
  replace: 'image-replace',
  recolor: 'image-recolor',
  remove: 'image-remove',
} as const;

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

export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  let actor: Awaited<ReturnType<typeof getStudioActor>> | null = null;
  let operationId: string | null = null;

  try {
    actor = await getStudioActor();
    const { projectId } = await params;
    const body = await request.json();
    const {
      type,
      targetLayerIds = [],
      prompt,
      baseRevisionId,
      options = {},
    } = body;

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
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    const incomingCookie = request.headers.get('cookie');
    if (incomingCookie) {
      headers.cookie = incomingCookie;
    } else if (actor.guestId) {
      headers.cookie = `${STUDIO_GUEST_COOKIE}=${encodeURIComponent(actor.guestId)}`;
    }

    const generateResponse = await fetch(
      new URL('/api/ai/generate', request.url),
      {
        method: 'POST',
        headers,
        body: JSON.stringify({
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
        }),
      }
    );

    const generated = await generateResponse.json();
    if (!generateResponse.ok || generated?.code !== 0) {
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

    return respData({
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
    });
  } catch (error: any) {
    if (operationId && actor) {
      await updateStudioOperationRecord(operationId, actor.actorKey, {
        status: 'failed',
        creditState: actor.userId ? 'released' : 'guest',
        errorCode: error.message || 'studio_operation_failed',
        completedAt: new Date(),
      }).catch(() => undefined);
    }
    return respErr(error.message);
  }
}
