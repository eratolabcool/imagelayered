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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ operationId: string }> }
) {
  try {
    const { operationId } = await params;
    const headers: HeadersInit = {};
    const cookie = request.headers.get('cookie');
    if (cookie) headers.cookie = cookie;

    const queryUrl = new URL('/api/ai/query', request.url);
    queryUrl.searchParams.set('id', operationId);
    const response = await fetch(queryUrl, { headers, cache: 'no-store' });
    const payload = await response.json();

    if (!response.ok || payload?.code !== 0) {
      throw new Error(payload?.message || 'Unable to query Studio operation');
    }

    const task = payload.data || {};
    return respData({
      id: operationId,
      projectId: '',
      type: task.scene || 'replace',
      inputRevisionId: '',
      targetLayerIds: [],
      prompt: task.prompt,
      provider: task.provider,
      model: task.model,
      status: mapStatus(task.status),
      aiTaskId: operationId,
      costCredits: task.costCredits,
      createdAt:
        typeof task.createdAt === 'string'
          ? task.createdAt
          : new Date(task.createdAt || Date.now()).toISOString(),
      completedAt:
        mapStatus(task.status) === 'succeeded' || mapStatus(task.status) === 'failed'
          ? new Date().toISOString()
          : undefined,
      result: task.taskResult || task.taskInfo,
    });
  } catch (error: any) {
    return respErr(error.message);
  }
}
