import { AIMediaType } from '@/extensions/ai';
import { respData, respErr } from '@/shared/lib/resp';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const sceneByOperation = {
  decompose: 'image-decomposition',
  replace: 'image-replace',
  recolor: 'image-recolor',
  remove: 'image-remove',
} as const;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const body = await request.json();
    const { type, targetLayerIds = [], prompt, baseRevisionId, options = {} } = body;

    if (!type || !(type in sceneByOperation)) {
      throw new Error('unsupported studio operation');
    }

    const scene = sceneByOperation[type as keyof typeof sceneByOperation];
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    const cookie = request.headers.get('cookie');
    if (cookie) headers.cookie = cookie;

    const generateResponse = await fetch(new URL('/api/ai/generate', request.url), {
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
    });

    const generated = await generateResponse.json();

    if (!generateResponse.ok || generated?.code !== 0) {
      throw new Error(
        generated?.message || generated?.error || 'AI operation failed'
      );
    }

    const task = generated.data;
    const aiTaskId = task?.id || task?.taskId;
    if (!aiTaskId) throw new Error('AI operation did not return a task id');

    return respData({
      id: aiTaskId,
      projectId,
      type,
      inputRevisionId: baseRevisionId || '',
      targetLayerIds,
      prompt,
      provider: task?.provider,
      model: task?.model,
      status: task?.status === 'success' ? 'succeeded' : 'running',
      aiTaskId,
      costCredits: task?.costCredits,
      createdAt: new Date().toISOString(),
    });
  } catch (error: any) {
    return respErr(error.message);
  }
}
