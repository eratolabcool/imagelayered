import { respData, respErr } from '@/shared/lib/resp';

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

  return [...new Set(candidates.filter((value): value is string => typeof value === 'string'))];
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ operationId: string }> }
) {
  try {
    const { operationId } = await params;
    const url = new URL(request.url);
    const model = url.searchParams.get('model') || undefined;
    const type = url.searchParams.get('type') || 'replace';
    const projectId = url.searchParams.get('projectId') || '';
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    const cookie = request.headers.get('cookie');
    if (cookie) headers.cookie = cookie;

    const response = await fetch(new URL('/api/ai/query', request.url), {
      method: 'POST',
      headers,
      cache: 'no-store',
      body: JSON.stringify({ taskId: operationId, model }),
    });
    const payload = await response.json();

    if (!response.ok || payload?.code !== 0) {
      throw new Error(payload?.message || 'Unable to query Studio operation');
    }

    const task = payload.data || {};
    const taskInfo = parseJson(task.taskInfo);
    const taskResult = parseJson(task.taskResult);
    const status = mapStatus(task.status);

    return respData({
      id: operationId,
      projectId,
      type,
      inputRevisionId: '',
      targetLayerIds: [],
      prompt: task.prompt,
      provider: task.provider,
      model: task.model || model,
      status,
      aiTaskId: operationId,
      costCredits: task.costCredits,
      createdAt:
        typeof task.createdAt === 'string'
          ? task.createdAt
          : new Date(task.createdAt || Date.now()).toISOString(),
      completedAt:
        status === 'succeeded' || status === 'failed'
          ? new Date().toISOString()
          : undefined,
      result: {
        images: extractImages(taskInfo, taskResult),
        taskInfo,
        taskResult,
      },
    });
  } catch (error: any) {
    return respErr(error.message);
  }
}
