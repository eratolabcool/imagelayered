import { getStudioActor } from '@/features/studio/server/identity';
import { respData, respErr } from '@/shared/lib/resp';
import {
  findStudioOperationForActor,
  updateStudioOperationRecord,
} from '@/shared/models/studio';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function mapStatus(status?: string) {
  const normalized = status?.toLowerCase();
  if (normalized === 'success' || normalized === 'succeeded') return 'succeeded';
  if (normalized === 'failed' || normalized === 'error') return 'failed';
  if (normalized === 'pending' || normalized === 'queued') return 'queued';
  return 'running';
}

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

function parseTargetLayerIds(value: string) {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ operationId: string }> }
) {
  try {
    const { operationId } = await params;
    const actor = await getStudioActor();
    const operation = await findStudioOperationForActor(
      operationId,
      actor.actorKey
    );
    if (!operation) throw new Error('Studio operation not found');

    if (operation.status === 'succeeded' || operation.status === 'failed') {
      return respData({
        id: operation.id,
        projectId: operation.projectId,
        type: operation.type,
        inputRevisionId: operation.inputRevisionId || '',
        targetLayerIds: parseTargetLayerIds(operation.targetLayerIds),
        prompt: operation.prompt || undefined,
        provider: operation.provider || undefined,
        model: operation.model || undefined,
        status: operation.status,
        aiTaskId: operation.aiTaskId || undefined,
        costCredits: operation.costCredits || undefined,
        errorCode: operation.errorCode || undefined,
        result: parseJson(operation.result),
        createdAt: operation.createdAt.toISOString(),
        completedAt: operation.completedAt?.toISOString(),
      });
    }

    if (!operation.aiTaskId) {
      throw new Error('Studio operation has no AI task id');
    }

    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    const cookie = request.headers.get('cookie');
    if (cookie) headers.cookie = cookie;

    const response = await fetch(new URL('/api/ai/query', request.url), {
      method: 'POST',
      headers,
      cache: 'no-store',
      body: JSON.stringify({
        taskId: operation.aiTaskId,
        model: operation.model || undefined,
      }),
    });
    const payload = await response.json();
    if (!response.ok || payload?.code !== 0) {
      throw new Error(payload?.message || 'Unable to query Studio operation');
    }

    const task = payload.data || {};
    const taskInfo = parseJson(task.taskInfo);
    const taskResult = parseJson(task.taskResult);
    const status = mapStatus(task.status);
    const result = {
      images: extractImages(taskInfo, taskResult),
      taskInfo,
      taskResult,
    };
    const completedAt =
      status === 'succeeded' || status === 'failed' ? new Date() : null;

    await updateStudioOperationRecord(operation.id, actor.actorKey, {
      status,
      provider: task.provider || operation.provider,
      model: task.model || operation.model,
      costCredits: task.costCredits ?? operation.costCredits,
      result: JSON.stringify(result),
      errorCode:
        status === 'failed'
          ? taskInfo?.errorCode || taskInfo?.errorMessage || 'ai_task_failed'
          : null,
      completedAt,
    });

    return respData({
      id: operation.id,
      projectId: operation.projectId,
      type: operation.type,
      inputRevisionId: operation.inputRevisionId || '',
      targetLayerIds: parseTargetLayerIds(operation.targetLayerIds),
      prompt: operation.prompt || undefined,
      provider: task.provider || operation.provider || undefined,
      model: task.model || operation.model || undefined,
      status,
      aiTaskId: operation.aiTaskId,
      costCredits: task.costCredits ?? operation.costCredits ?? undefined,
      errorCode:
        status === 'failed'
          ? taskInfo?.errorCode || taskInfo?.errorMessage || 'ai_task_failed'
          : undefined,
      result,
      createdAt: operation.createdAt.toISOString(),
      completedAt: completedAt?.toISOString(),
    });
  } catch (error: any) {
    return respErr(error.message);
  }
}
