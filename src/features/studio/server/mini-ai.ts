import type { MiniActor } from '@/shared/models/mini-identity';

import { generateStudioAiTask, queryStudioAiTask } from './ai-service';
import type { AiDispatcher } from './operations';

/**
 * Server-side AI dispatcher for the Mini Program. Unlike the Web dispatcher
 * (which forwards to /api/ai/* with the caller's cookie), this calls the
 * shared AI service directly with the authenticated userId — no Better Auth
 * cookie, no legacy AI route exposure.
 */
export function miniAiDispatcher(actor: MiniActor): AiDispatcher {
  return {
    async generateAI(body) {
      const task = await generateStudioAiTask({
        userId: actor.userId,
        scene: body.scene,
        prompt: body.prompt,
        options: body.options,
        layeringMode: body.layeringMode,
      });
      return { code: 0, data: task };
    },
    async queryAI(body) {
      const task = await queryStudioAiTask({
        userId: actor.userId,
        taskId: body.taskId,
        model: body.model,
      });
      return { code: 0, data: task };
    },
  };
}
