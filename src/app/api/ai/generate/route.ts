import { envConfigs } from '@/config';
import { AIMediaType, AITaskStatus } from '@/extensions/ai';
import { getUuid } from '@/shared/lib/hash';
import { respData, respErr } from '@/shared/lib/resp';
import { createAITask, NewAITask } from '@/shared/models/ai_task';
import { getAllConfigs } from '@/shared/models/config';
import { consumeCredits, getRemainingCredits } from '@/shared/models/credit';
import { getUserInfo } from '@/shared/models/user';
import { getAIService } from '@/shared/services/ai';

/**
 * [INPUT]: 依赖配置、AI类型、UUID生成、响应工具、AI任务模型、积分模型、用户模型、AI服务
 * [OUTPUT]: 对外提供 POST 接口创建 AI 任务
 * [POS]: API路由层的 AI 任务创建处理器，被前端调用生成内容
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

// 🚀 强制动态渲染（需要实时创建任务）
export const dynamic = 'force-dynamic';
// 🚀 使用 Node.js Runtime（需要数据库连接）
export const runtime = 'nodejs';

function hasGeneratedImages(result: any) {
  if ((result?.taskInfo?.images?.length ?? 0) > 0) {
    return true;
  }

  const rawTaskResult = result?.taskResult;
  if (!rawTaskResult) {
    return false;
  }

  try {
    const taskResult = typeof rawTaskResult === 'string'
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
    let { provider, mediaType, model, prompt, options, scene } =
      await request.json();

    if (!mediaType) {
      throw new Error('invalid params');
    }

    if (!prompt && !options) {
      throw new Error('prompt or options is required');
    }

    const configs = await getAllConfigs();
    const aiService = await getAIService(configs);

    if (mediaType === AIMediaType.IMAGE) {
      if (scene === 'image-decomposition') {
        provider = provider || configs.layer_decomposition_provider || 'fal';
        model = model || configs.layer_decomposition_model || 'fal-ai/qwen-image-layered';
      } else if (['image-recolor', 'image-replace', 'image-remove', 'lookbook-generate'].includes(scene)) {
        provider = provider || configs.poster_edit_provider || 'fal';
        model = model || configs.poster_edit_model || 'openai/gpt-image-2/edit';
      }
    }

    if (!provider || !model) {
      throw new Error('invalid params');
    }

    // check generate type
    if (!aiService.getMediaTypes().includes(mediaType)) {
      throw new Error('invalid mediaType');
    }

    // check ai provider
    const aiProvider = aiService.getProvider(provider);
    if (!aiProvider) {
      throw new Error('invalid provider');
    }

    // get current user
    const user = await getUserInfo();

    // todo: get cost credits from settings
    let costCredits = 2;

    if (mediaType === AIMediaType.IMAGE) {
      // Qwen Image Layered-specific scenes
      if (scene === 'image-decomposition') {
        costCredits = 5;
      } else if (scene === 'image-recolor') {
        costCredits = 3;
      } else if (scene === 'image-replace') {
        costCredits = 4;
      } else if (scene === 'image-remove') {
        costCredits = 3;
      } else if (scene === 'lookbook-generate') {
        costCredits = 8;
      } else if (scene === 'image-to-image') {
        costCredits = 4;
      } else if (scene === 'text-to-image') {
        costCredits = 2;
      } else {
        throw new Error('invalid scene');
      }
    } else if (mediaType === AIMediaType.VIDEO) {
      // generate video
      if (scene === 'text-to-video') {
        costCredits = 6;
      } else if (scene === 'image-to-video') {
        costCredits = 8;
      } else if (scene === 'video-to-video') {
        costCredits = 10;
      } else {
        throw new Error('invalid scene');
      }
    } else if (mediaType === AIMediaType.MUSIC) {
      // generate music
      costCredits = 10;
      scene = 'text-to-music';
    } else {
      throw new Error('invalid mediaType');
    }

    if (!user) {
      // Special handling for Guest users (no auth)
      // Only allow image-decomposition for guests
      if (scene !== 'image-decomposition' && scene !== 'image-recolor' && scene !== 'image-replace' && scene !== 'image-remove') {
        throw new Error('no auth, please sign in');
      }
      
      // For guests, we skip credit check and credit consumption
      // But we still create a task record (with null userId or special guest ID if model allows)
      // Since createAITask requires userId, we might need a workaround or skip task recording
      
      const callbackUrl = `${envConfigs.app_url}/api/ai/notify/${provider}`;
      const params: any = {
        mediaType,
        model,
        prompt,
        callbackUrl,
        options: { ...options, scene }, 
      };

      console.log('AI generate params (GUEST):', params);
      const result = await aiProvider.generate({ params });

      if (!result?.taskId) {
        throw new Error(`ai generate failed, mediaType: ${mediaType}, provider: ${provider}`);
      }
      
      // Return a partial task object since we can't save to DB without userId
      // Encode provider and taskId into the ID for stateless polling
      return respData({
        id: `guest-${provider}-${result.taskId}`,
        status: result.taskStatus,
        taskId: result.taskId,
        taskInfo: result.taskInfo ? JSON.stringify(result.taskInfo) : null,
        taskResult: result.taskResult ? JSON.stringify(result.taskResult) : null,
      });
    }

    // check credits
    const remainingCredits = await getRemainingCredits(user.id);
    if (remainingCredits < costCredits) {
      throw new Error('insufficient credits');
    }

    const callbackUrl = `${envConfigs.app_url}/api/ai/notify/${provider}`;

    const params: any = {
      mediaType,
      model,
      prompt,
      callbackUrl,
      options: { ...options, scene }, // Pass scene in options
    };

    console.log('AI generate params:', params);

    // generate content
    const result = await aiProvider.generate({ params });

    // Debug log
    console.log('[generate] AI provider result:', JSON.stringify(result, null, 2));
    console.log('[generate] taskStatus:', result.taskStatus);
    console.log('[generate] taskId:', result.taskId);
    console.log('[generate] taskInfo:', JSON.stringify(result.taskInfo, null, 2));
    console.log('[generate] taskResult keys:', result.taskResult ? Object.keys(result.taskResult) : 'null');

    if (!result?.taskId) {
      throw new Error(
        `ai generate failed, mediaType: ${mediaType}, provider: ${provider}, model: ${model}`
      );
    }

    // Validate result for image editing scenes
    // For recolor/replace/remove, we must have an image in the result
    if (['image-recolor', 'image-replace', 'image-remove'].includes(scene)) {
      if (!hasGeneratedImages(result) && result.taskStatus === AITaskStatus.SUCCESS) {
        console.error('[generate] Image editing task completed but no image returned:', {
          scene,
          taskInfo: result.taskInfo,
          taskResult: result.taskResult
        });
        throw new Error(`Image editing failed: no image generated for scene ${scene}`);
      }
    }

    // Validate result for decomposition
    if (scene === 'image-decomposition' && result.taskStatus === AITaskStatus.SUCCESS) {
      if (!hasGeneratedImages(result)) {
        console.error('[generate] Decomposition completed but no layers returned:', {
          taskInfo: result.taskInfo,
          taskResult: result.taskResult
        });
        throw new Error('Image decomposition failed: no layers generated');
      }
    }

    // create ai task
    const newAITask: NewAITask = {
      id: getUuid(),
      userId: user.id,
      mediaType,
      provider,
      model,
      prompt,
      scene,
      options: options ? JSON.stringify(options) : null,
      status: result.taskStatus,
      costCredits,
      taskId: result.taskId,
      taskInfo: result.taskInfo ? JSON.stringify(result.taskInfo) : null,
      taskResult: result.taskResult ? JSON.stringify(result.taskResult) : null,
    };
    await createAITask(newAITask);

    // consume credits (pre-deduct)
    try {
      await consumeCredits({
        userId: user.id,
        credits: costCredits,
        scene: scene,
        description: `AI ${mediaType} ${scene} - ${model}`,
        metadata: JSON.stringify({
          taskId: newAITask.id,
          aiTaskId: result.taskId,
          provider,
          model,
          scene,
        }),
      });
      console.log(`[generate] Consumed ${costCredits} credits from user ${user.id}`);
    } catch (creditError: any) {
      console.error('[generate] Failed to consume credits:', creditError);
      // Note: We don't rollback the task creation here because:
      // 1. The task was already submitted to AI provider
      // 2. We can handle credit discrepancies in admin dashboard
      // 3. The credit check earlier should have prevented this
    }

    return respData(newAITask);
  } catch (e: any) {
    console.log('generate failed', e);
    return respErr(e.message);
  }
}
