import {
  IMAGE_LAYERED_CAPABILITIES,
  LEGACY_IMAGE_LAYERED_MODELS,
} from '@/shared/lib/image-layered-capabilities';
import { respData, respErr } from '@/shared/lib/resp';
import {
  findAITaskById,
  UpdateAITask,
  updateAITaskById,
} from '@/shared/models/ai_task';
import { refundStudioConsumedCredits } from '@/shared/models/studio-credit';
import { getUserInfo } from '@/shared/models/user';
import { getAIService } from '@/shared/services/ai';

/**
 * [INPUT]: 依赖 respData/respErr 工具、AI任务模型、用户模型、AI服务
 * [OUTPUT]: 对外提供 POST 接口查询 AI 任务状态
 * [POS]: API路由层的 AI 任务查询处理器，被客户端轮询调用
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const GUEST_IMAGE_MODELS = new Set<string>([
  IMAGE_LAYERED_CAPABILITIES.decompose.model,
  IMAGE_LAYERED_CAPABILITIES.editLayer.model,
  LEGACY_IMAGE_LAYERED_MODELS.decompose,
  LEGACY_IMAGE_LAYERED_MODELS.editLayer,
]);

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

export async function POST(req: Request) {
  try {
    const { taskId, model } = await req.json();
    if (!taskId) {
      return respErr('invalid params');
    }

    const user = await getUserInfo();
    const isGuestTask = taskId.startsWith('guest-');

    if (!user && !isGuestTask) {
      return respErr('no auth, please sign in');
    }

    if (isGuestTask) {
      const parts = taskId.split('-');
      if (parts.length < 3) return respErr('invalid guest task id');

      const provider = parts[1];
      const providerTaskId = parts.slice(2).join('-');

      const aiService = await getAIService();
      const aiProvider = aiService.getProvider(provider);
      if (!aiProvider) return respErr('invalid ai provider');

      let requestedModel =
        typeof model === 'string' && GUEST_IMAGE_MODELS.has(model)
          ? model
          : IMAGE_LAYERED_CAPABILITIES.decompose.model;

      if (
        provider === 'fal' &&
        requestedModel === IMAGE_LAYERED_CAPABILITIES.decompose.model
      ) {
        requestedModel = LEGACY_IMAGE_LAYERED_MODELS.decompose;
      }

      const result = await aiProvider?.query?.({
        taskId: providerTaskId,
        mediaType: 'image',
        model: requestedModel,
      });

      if (!result?.taskStatus) return respErr('query ai task failed');

      return respData({
        id: taskId,
        status: result.taskStatus,
        taskInfo: result.taskInfo ? JSON.stringify(result.taskInfo) : null,
        taskResult: result.taskResult
          ? JSON.stringify(result.taskResult)
          : null,
      });
    }

    const task = await findAITaskById(taskId);
    if (!task || !task.taskId) {
      return respErr('task not found');
    }

    if (!user || task.userId !== user.id) {
      return respErr('no permission');
    }

    const aiService = await getAIService();
    const aiProvider = aiService.getProvider(task.provider);
    if (!aiProvider) {
      return respErr('invalid ai provider');
    }

    const result = await aiProvider?.query?.({
      taskId: task.taskId,
      mediaType: task.mediaType,
      model: task.model,
    });

    if (!result?.taskStatus) {
      return respErr('query ai task failed');
    }

    const updateAITask: UpdateAITask = {
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

    return respData(task);
  } catch (e: any) {
    console.log('ai query failed', e);
    return respErr(e.message);
  }
}
