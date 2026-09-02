import { envConfigs } from '@/config';
import { AIMediaType, AITaskStatus, type AIManager } from '@/extensions/ai';
import {
  IMAGE_LAYERED_CAPABILITIES,
  LEGACY_IMAGE_LAYERED_MODELS,
} from '@/shared/lib/image-layered-capabilities';
import { getUuid } from '@/shared/lib/hash';
import {
  createAITask,
  findAITaskById,
  updateAITaskById,
} from '@/shared/models/ai_task';
import { getAllConfigs, type Configs } from '@/shared/models/config';
import { getRemainingCredits } from '@/shared/models/credit';
import { refundStudioConsumedCredits } from '@/shared/models/studio-credit';
import { getAIService } from '@/shared/services/ai';

const STUDIO_SCENES = new Set([
  'image-decomposition',
  'image-recolor',
  'image-replace',
  'image-remove',
]);

function isFailureStatus(status?: string | null) {
  const value = status?.toLowerCase();
  return (
    value === 'failed' ||
    value === 'error' ||
    value === 'cancelled' ||
    value === 'canceled'
  );
}

/**
 * Server-side image capability routing (extracted from /api/ai/generate so
 * the Mini Program adapter reuses the exact same routing instead of a copy).
 */
export function resolveImageCapability({
  scene,
  provider,
  model,
  configs,
  aiService,
}: {
  scene: string;
  provider?: string;
  model?: string;
  configs: Configs;
  aiService: AIManager;
}): { provider?: string; model?: string } {
  let resolvedProvider = provider;
  let resolvedModel = model;

  if (scene === 'image-decomposition') {
    const configuredModel = configs.layer_decomposition_model;
    const usePreferredCapability =
      !configuredModel ||
      configuredModel === LEGACY_IMAGE_LAYERED_MODELS.decompose;
    resolvedProvider =
      resolvedProvider ||
      (usePreferredCapability
        ? IMAGE_LAYERED_CAPABILITIES.decompose.provider
        : configs.layer_decomposition_provider ||
          IMAGE_LAYERED_CAPABILITIES.decompose.provider);
    resolvedModel =
      resolvedModel ||
      (usePreferredCapability
        ? IMAGE_LAYERED_CAPABILITIES.decompose.model
        : configuredModel);
  } else if (
    ['image-recolor', 'image-replace', 'image-remove', 'lookbook-generate'].includes(
      scene
    )
  ) {
    const configuredModel = configs.poster_edit_model;
    const usePreferredCapability =
      !configuredModel ||
      configuredModel === LEGACY_IMAGE_LAYERED_MODELS.editLayer;
    resolvedProvider =
      resolvedProvider ||
      (usePreferredCapability
        ? IMAGE_LAYERED_CAPABILITIES.editLayer.provider
        : configs.poster_edit_provider ||
          IMAGE_LAYERED_CAPABILITIES.editLayer.provider);
    resolvedModel =
      resolvedModel ||
      (usePreferredCapability
        ? IMAGE_LAYERED_CAPABILITIES.editLayer.model
        : configuredModel);
  }

  // Preferred decomposition provider unavailable -> verified FAL fallback.
  if (
    scene === 'image-decomposition' &&
    resolvedProvider === IMAGE_LAYERED_CAPABILITIES.decompose.provider &&
    resolvedModel === IMAGE_LAYERED_CAPABILITIES.decompose.model &&
    !aiService.getProvider(IMAGE_LAYERED_CAPABILITIES.decompose.provider) &&
    aiService.getProvider('fal')
  ) {
    resolvedProvider = 'fal';
    resolvedModel = LEGACY_IMAGE_LAYERED_MODELS.decompose;
    console.warn(
      '[generate] Preferred decomposition provider is unavailable; using fallback capability'
    );
  }

  return { provider: resolvedProvider, model: resolvedModel };
}

/**
 * Image scene -> credit cost (extracted from /api/ai/generate so pricing stays
 * single-sourced).
 */
export function getImageSceneCost(scene: string): number {
  if (scene === 'image-decomposition') return 5;
  if (scene === 'image-recolor') return 3;
  if (scene === 'image-replace') return 4;
  if (scene === 'image-remove') return 3;
  if (scene === 'lookbook-generate') return 8;
  if (scene === 'image-to-image') return 4;
  if (scene === 'text-to-image') return 2;
  throw new Error('invalid scene');
}

export function hasGeneratedImages(result: any) {
  if ((result?.taskInfo?.images?.length ?? 0) > 0) return true;

  const rawTaskResult = result?.taskResult;
  if (!rawTaskResult) return false;

  try {
    const taskResult =
      typeof rawTaskResult === 'string'
        ? JSON.parse(rawTaskResult)
        : rawTaskResult;

    return (
      (Array.isArray(taskResult?.images) && taskResult.images.length > 0) ||
      (Array.isArray(taskResult?.output) && taskResult.output.length > 0) ||
      !!taskResult?.image?.url ||
      !!taskResult?.image_url ||
      !!taskResult?.url
    );
  } catch {
    return false;
  }
}

/**
 * Server-side image Studio generation for a known userId. Reuses the same
 * capability routing, credit charge (createAITask) and providers as the Web
 * /api/ai/generate route — no Better Auth cookie involved.
 */
export async function generateStudioAiTask({
  userId,
  scene,
  prompt,
  options = {},
  layeringMode = 'studio',
}: {
  userId: string;
  scene: string;
  prompt?: string;
  options?: Record<string, unknown>;
  layeringMode?: string;
}) {
  const configs = await getAllConfigs();
  const aiService = await getAIService(configs);

  const { provider, model } = resolveImageCapability({
    scene,
    configs,
    aiService,
  });

  if (!provider || !model) throw new Error('invalid params');
  if (!aiService.getMediaTypes().includes(AIMediaType.IMAGE)) {
    throw new Error('invalid mediaType');
  }

  const aiProvider = aiService.getProvider(provider);
  if (!aiProvider) throw new Error('invalid provider');

  const costCredits = getImageSceneCost(scene);

  const remainingCredits = await getRemainingCredits(userId);
  if (remainingCredits < costCredits) throw new Error('insufficient credits');

  const callbackUrl = `${envConfigs.app_url}/api/ai/notify/${provider}`;
  const params: any = {
    mediaType: AIMediaType.IMAGE,
    model,
    prompt,
    callbackUrl,
    options: { ...options, scene, layeringMode },
  };

  const result = await aiProvider.generate({ params });

  if (!result?.taskId) {
    throw new Error(
      `ai generate failed, mediaType: image, provider: ${provider}, model: ${model}`
    );
  }

  if (['image-recolor', 'image-replace', 'image-remove'].includes(scene)) {
    if (
      !hasGeneratedImages(result) &&
      result.taskStatus === AITaskStatus.SUCCESS
    ) {
      throw new Error(`Image editing failed: no image generated for scene ${scene}`);
    }
  }

  if (
    scene === 'image-decomposition' &&
    result.taskStatus === AITaskStatus.SUCCESS &&
    !hasGeneratedImages(result)
  ) {
    throw new Error('Image decomposition failed: no layers generated');
  }

  const newAITask = {
    id: getUuid(),
    userId,
    mediaType: AIMediaType.IMAGE,
    provider,
    model,
    prompt: prompt ?? '',
    scene,
    options: options ? JSON.stringify({ ...options, layeringMode }) : null,
    status: result.taskStatus,
    costCredits,
    taskId: result.taskId,
    taskInfo: result.taskInfo ? JSON.stringify(result.taskInfo) : null,
    taskResult: result.taskResult ? JSON.stringify(result.taskResult) : null,
  };

  // createAITask owns the transactional credit consume and records creditId.
  return createAITask(newAITask);
}

/**
 * Server-side Studio task query for a known userId. Mirrors /api/ai/query's
 * user path and reuses the same refund (refundStudioConsumedCredits).
 */
export async function queryStudioAiTask({
  userId,
  taskId,
}: {
  userId: string;
  taskId: string;
  model?: string;
}) {
  const task = await findAITaskById(taskId);
  if (!task || !task.taskId) throw new Error('task not found');
  if (task.userId !== userId) throw new Error('no permission');

  const aiService = await getAIService();
  const aiProvider = aiService.getProvider(task.provider);
  if (!aiProvider) throw new Error('invalid ai provider');

  const result = await aiProvider?.query?.({
    taskId: task.taskId,
    mediaType: task.mediaType,
    model: task.model,
  });

  if (!result?.taskStatus) throw new Error('query ai task failed');

  const updateAITask: any = {
    status: result.taskStatus,
    taskInfo: result.taskInfo ? JSON.stringify(result.taskInfo) : null,
    taskResult: result.taskResult ? JSON.stringify(result.taskResult) : null,
    creditId: task.creditId,
  };

  if (
    task.creditId &&
    STUDIO_SCENES.has(task.scene) &&
    isFailureStatus(result.taskStatus)
  ) {
    await refundStudioConsumedCredits(
      task.creditId,
      task.userId,
      `studio_${task.scene}_failed`
    );
  }

  if (
    updateAITask.taskInfo !== task.taskInfo ||
    updateAITask.taskResult !== task.taskResult ||
    updateAITask.status !== task.status
  ) {
    await updateAITaskById(task.id, updateAITask);
  }

  task.status = updateAITask.status || '';
  task.taskInfo = updateAITask.taskInfo || null;
  task.taskResult = updateAITask.taskResult || null;

  return task;
}
