import {
  getImageSceneCost,
  hasGeneratedImages,
  resolveImageCapability,
} from '@/features/studio/server/ai-service';

import { envConfigs } from '@/config';
import { AIMediaType, AITaskStatus } from '@/extensions/ai';
import { getUuid } from '@/shared/lib/hash';
import { respData, respErr } from '@/shared/lib/resp';
import { createAITask, NewAITask } from '@/shared/models/ai_task';
import { getAllConfigs } from '@/shared/models/config';
import { getRemainingCredits } from '@/shared/models/credit';
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

export async function POST(request: Request) {
  try {
    let { provider, mediaType, model, prompt, options, scene, layeringMode } =
      await request.json();

    if (!mediaType) throw new Error('invalid params');
    if (!prompt && !options) throw new Error('prompt or options is required');

    const user = await getUserInfo();
    if (!user) {
      throw new Error(
        'Please sign in and purchase credits to use AI features.'
      );
    }

    const configs = await getAllConfigs();
    const aiService = await getAIService(configs);

    if (mediaType === AIMediaType.IMAGE) {
      const resolved = resolveImageCapability({
        scene,
        provider,
        model,
        configs,
      });
      provider = resolved.provider;
      model = resolved.model;
    }

    if (!provider || !model) throw new Error('invalid params');
    if (!aiService.getMediaTypes().includes(mediaType)) {
      throw new Error('invalid mediaType');
    }

    const aiProvider = aiService.getProvider(provider);
    if (!aiProvider) {
      throw new Error(
        scene === 'image-decomposition' && provider === 'kie'
          ? 'Kie is not configured for Seedream layer decomposition. Add KIE_API_KEY or set the Kie API key in Admin → Settings → AI.'
          : scene === 'image-decomposition' && provider === 'fal'
            ? 'Fal is not configured for fallback layer decomposition. Add FAL_API_KEY or set the Fal API key in Admin → Settings → AI.'
            : 'The selected AI provider is not configured. Check Admin → Settings → AI.'
      );
    }

    let costCredits = 2;

    if (mediaType === AIMediaType.IMAGE) {
      costCredits = getImageSceneCost(scene);
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

    const remainingCredits = await getRemainingCredits(user.id);
    if (remainingCredits < costCredits) throw new Error('insufficient credits');

    const callbackUrl = `${envConfigs.app_url}/api/ai/notify/${provider}`;
    const effectivePrompt =
      prompt ||
      (scene === 'image-decomposition'
        ? 'Separate the image into editable semantic layers: background, subject, product, text, shadows, and lighting effects.'
        : prompt);
    const params: any = {
      mediaType,
      model,
      prompt: effectivePrompt,
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
