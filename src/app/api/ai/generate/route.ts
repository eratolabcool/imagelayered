import { envConfigs } from '@/config';
import { AIMediaType, AITaskStatus } from '@/extensions/ai';
import { getStudioActor } from '@/features/studio/server/identity';
import { getUuid } from '@/shared/lib/hash';
import {
  IMAGE_LAYERED_CAPABILITIES,
  LEGACY_IMAGE_LAYERED_MODELS,
} from '@/shared/lib/image-layered-capabilities';
import { respData, respErr } from '@/shared/lib/resp';
import { createAITask, NewAITask } from '@/shared/models/ai_task';
import { getAllConfigs } from '@/shared/models/config';
import { getRemainingCredits } from '@/shared/models/credit';
import { consumeStudioGuestAIQuota } from '@/shared/models/studio';
import { getUserInfo } from '@/shared/models/user';
import { getAIService } from '@/shared/services/ai';

/**
 * [INPUT]: 依赖配置、AI类型、UUID生成、响应工具、AI任务模型、积分模型、用户模型、AI服务
 * [OUTPUT]: 对外提供 POST 接口创建 AI 任务
 * [POS]: API路由层的 AI 任务创建处理器，被前端调用生成内容
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function hasGeneratedImages(result: any) {
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

export async function POST(request: Request) {
  try {
    let { provider, mediaType, model, prompt, options, scene, layeringMode } =
      await request.json();

    if (!mediaType) throw new Error('invalid params');
    if (!prompt && !options) throw new Error('prompt or options is required');

    const configs = await getAllConfigs();
    const aiService = await getAIService(configs);

    if (mediaType === AIMediaType.IMAGE) {
      if (scene === 'image-decomposition') {
        const configuredModel = configs.layer_decomposition_model;
        const usePreferredCapability =
          !configuredModel ||
          configuredModel === LEGACY_IMAGE_LAYERED_MODELS.decompose;
        provider =
          provider ||
          (usePreferredCapability
            ? IMAGE_LAYERED_CAPABILITIES.decompose.provider
            : configs.layer_decomposition_provider ||
              IMAGE_LAYERED_CAPABILITIES.decompose.provider);
        model =
          model ||
          (usePreferredCapability
            ? IMAGE_LAYERED_CAPABILITIES.decompose.model
            : configuredModel);
      } else if (
        [
          'image-recolor',
          'image-replace',
          'image-remove',
          'lookbook-generate',
        ].includes(scene)
      ) {
        const configuredModel = configs.poster_edit_model;
        const usePreferredCapability =
          !configuredModel ||
          configuredModel === LEGACY_IMAGE_LAYERED_MODELS.editLayer;
        provider =
          provider ||
          (usePreferredCapability
            ? IMAGE_LAYERED_CAPABILITIES.editLayer.provider
            : configs.poster_edit_provider ||
              IMAGE_LAYERED_CAPABILITIES.editLayer.provider);
        model =
          model ||
          (usePreferredCapability
            ? IMAGE_LAYERED_CAPABILITIES.editLayer.model
            : configuredModel);
      }
    }

    if (
      mediaType === AIMediaType.IMAGE &&
      scene === 'image-decomposition' &&
      provider === IMAGE_LAYERED_CAPABILITIES.decompose.provider &&
      model === IMAGE_LAYERED_CAPABILITIES.decompose.model &&
      !aiService.getProvider(IMAGE_LAYERED_CAPABILITIES.decompose.provider) &&
      aiService.getProvider('fal')
    ) {
      console.warn(
        '[generate] Preferred decomposition provider is unavailable; using fallback capability'
      );
      provider = 'fal';
      model = LEGACY_IMAGE_LAYERED_MODELS.decompose;
    }

    if (!provider || !model) throw new Error('invalid params');
    if (!aiService.getMediaTypes().includes(mediaType)) {
      throw new Error('invalid mediaType');
    }

    const aiProvider = aiService.getProvider(provider);
    if (!aiProvider) throw new Error('invalid provider');

    const user = await getUserInfo();
    let costCredits = 2;

    if (mediaType === AIMediaType.IMAGE) {
      if (scene === 'image-decomposition') costCredits = 5;
      else if (scene === 'image-recolor') costCredits = 3;
      else if (scene === 'image-replace') costCredits = 4;
      else if (scene === 'image-remove') costCredits = 3;
      else if (scene === 'lookbook-generate') costCredits = 8;
      else if (scene === 'image-to-image') costCredits = 4;
      else if (scene === 'text-to-image') costCredits = 2;
      else throw new Error('invalid scene');
    } else if (mediaType === AIMediaType.VIDEO) {
      if (scene === 'text-to-video') costCredits = 6;
      else if (scene === 'image-to-video') costCredits = 8;
      else if (scene === 'video-to-video') costCredits = 10;
      else throw new Error('invalid scene');
    } else if (mediaType === AIMediaType.MUSIC) {
      costCredits = 10;
      scene = 'text-to-music';
    } else {
      throw new Error('invalid mediaType');
    }

    if (!user) {
      if (
        scene !== 'image-decomposition' &&
        scene !== 'image-recolor' &&
        scene !== 'image-replace' &&
        scene !== 'image-remove'
      ) {
        throw new Error('no auth, please sign in');
      }

      // Cost protection lives at the generation boundary so direct calls to
      // the legacy AI endpoint cannot bypass Studio's anonymous quota.
      const actor = await getStudioActor();
      await consumeStudioGuestAIQuota(actor.actorKey);

      const callbackUrl = `${envConfigs.app_url}/api/ai/notify/${provider}`;
      const params: any = {
        mediaType,
        model,
        prompt,
        callbackUrl,
        options: { ...options, scene, layeringMode },
      };

      const result = await aiProvider.generate({ params });
      if (!result?.taskId) {
        throw new Error(
          `ai generate failed, mediaType: ${mediaType}, provider: ${provider}`
        );
      }

      return respData({
        id: `guest-${provider}-${result.taskId}`,
        status: result.taskStatus,
        taskId: result.taskId,
        taskInfo: result.taskInfo ? JSON.stringify(result.taskInfo) : null,
        taskResult: result.taskResult
          ? JSON.stringify(result.taskResult)
          : null,
      });
    }

    const remainingCredits = await getRemainingCredits(user.id);
    if (remainingCredits < costCredits) throw new Error('insufficient credits');

    const callbackUrl = `${envConfigs.app_url}/api/ai/notify/${provider}`;
    const params: any = {
      mediaType,
      model,
      prompt,
      callbackUrl,
      options: { ...options, scene, layeringMode },
    };

    const result = await aiProvider.generate({ params });

    if (!result?.taskId) {
      throw new Error(
        `ai generate failed, mediaType: ${mediaType}, provider: ${provider}, model: ${model}`
      );
    }

    if (['image-recolor', 'image-replace', 'image-remove'].includes(scene)) {
      if (
        !hasGeneratedImages(result) &&
        result.taskStatus === AITaskStatus.SUCCESS
      ) {
        throw new Error(
          `Image editing failed: no image generated for scene ${scene}`
        );
      }
    }

    if (
      scene === 'image-decomposition' &&
      result.taskStatus === AITaskStatus.SUCCESS &&
      !hasGeneratedImages(result)
    ) {
      throw new Error('Image decomposition failed: no layers generated');
    }

    const newAITask: NewAITask = {
      id: getUuid(),
      userId: user.id,
      mediaType,
      provider,
      model,
      prompt,
      scene,
      options: options ? JSON.stringify({ ...options, layeringMode }) : null,
      status: result.taskStatus,
      costCredits,
      taskId: result.taskId,
      taskInfo: result.taskInfo ? JSON.stringify(result.taskInfo) : null,
      taskResult: result.taskResult ? JSON.stringify(result.taskResult) : null,
    };

    // createAITask owns credit consumption transactionally and records creditId.
    // Do not consume credits again here.
    const createdTask = await createAITask(newAITask);
    return respData(createdTask);
  } catch (e: any) {
    console.log('generate failed', e);
    return respErr(e.message);
  }
}
