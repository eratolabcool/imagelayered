import { respData, respErr } from '@/shared/lib/resp';
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

// 🚀 强制动态渲染（防止缓存导致状态不一致）
export const dynamic = 'force-dynamic';
// 🚀 使用 Edge Runtime（更快的冷启动，更低的 CPU 消耗）
export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { taskId } = await req.json();
    if (!taskId) {
      return respErr('invalid params');
    }

    const user = await getUserInfo();
    // Allow guest access if taskId starts with 'guest-'
    const isGuestTask = taskId.startsWith('guest-');
    
    if (!user && !isGuestTask) {
      return respErr('no auth, please sign in');
    }

    if (isGuestTask) {
      // For guest tasks, we query the provider directly using the taskId provided by frontend
      // But wait, the taskId from frontend is the 'guest-UUID' format we generated?
      // Or is it the DB ID?
      
      // In generate route, we returned: id: 'guest-' + getUuid(), taskId: result.taskId
      // Frontend passes 'dbTaskId' which is 'guest-...'
      
      // We need the REAL provider taskId.
      // Since we didn't save the task to DB for guests, we can't look it up.
      // We need the frontend to pass the PROVIDER's taskId for guests.
      
      // HOWEVER, the frontend code passes `dbTaskId` (which is `genData.data?.id`).
      // For guests, `genData.data.id` is `guest-UUID`.
      // But we also returned `taskId` (provider ID) in `genData.data.taskId`.
      
      // To fix this cleanly without changing frontend too much:
      // The frontend polling loop uses `taskId` from the response ID.
      // If we want to support stateless guest polling, the frontend should probably pass the provider taskId directly?
      // Or we can encode the provider taskId in the "guest-" ID?
      
      // Let's assume the frontend will be updated to pass providerTaskId if it's a guest task?
      // Or better: In generate route, let's encode the provider taskId into the returned ID.
      // e.g. id: 'guest-' + provider + '-' + providerTaskId
      
      // Let's look at how query works.
      // It takes { taskId }.
      // If taskId starts with 'guest-', we parse it.
      
      // Format: guest-{provider}-{providerTaskId}
      // Note: providerTaskId might contain hyphens.
      
      // Let's try to parse:
      const parts = taskId.split('-');
      if (parts.length < 3) return respErr('invalid guest task id');
      
      // parts[0] = 'guest'
      // parts[1] = provider
      // parts[2...] = providerTaskId
      const provider = parts[1];
      const providerTaskId = parts.slice(2).join('-');
      
      const aiService = await getAIService();
      const aiProvider = aiService.getProvider(provider);
      if (!aiProvider) return respErr('invalid ai provider');
      
      // We don't know mediaType/model from just the ID, but usually query doesn't strictly need them 
      // depending on provider. Most providers just need taskId.
      // Let's try passing empty or default.
      
      const result = await aiProvider?.query?.({
        taskId: providerTaskId,
        mediaType: 'image', // Guest only does image
        model: 'fal-ai/qwen-image-layered', // Guest default
      });
      
      if (!result?.taskStatus) return respErr('query ai task failed');
      
      return respData({
        id: taskId,
        status: result.taskStatus,
        taskInfo: result.taskInfo ? JSON.stringify(result.taskInfo) : null,
        taskResult: result.taskResult ? JSON.stringify(result.taskResult) : null,
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

    // update ai task
    const updateAITask: UpdateAITask = {
      status: result.taskStatus,
      taskInfo: result.taskInfo ? JSON.stringify(result.taskInfo) : null,
      taskResult: result.taskResult ? JSON.stringify(result.taskResult) : null,
      creditId: task.creditId, // credit consumption record id
    };
    if (updateAITask.taskInfo !== task.taskInfo) {
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
