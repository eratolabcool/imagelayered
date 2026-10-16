import { respData, respErr } from '@/shared/lib/resp';
import { AITaskStatus } from '@/extensions/ai';
import {
  findAITaskById,
  UpdateAITask,
  updateAITaskById,
} from '@/shared/models/ai_task';
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

export async function POST(req: Request) {
  try {
    const { taskId, model } = await req.json();
    if (!taskId) {
      return respErr('invalid params');
    }

    const user = await getUserInfo();
    if (!user) {
      return respErr('no auth, please sign in');
    }

    const task = await findAITaskById(taskId);
    if (!task || !task.taskId) {
      return respErr('task not found');
    }

    if (!user || task.userId !== user.id) {
      return respErr('no permission');
    }

    if (
      [AITaskStatus.SUCCESS, AITaskStatus.FAILED, AITaskStatus.CANCELED].includes(
        task.status as AITaskStatus
      )
    ) {
      return respData(task);
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
