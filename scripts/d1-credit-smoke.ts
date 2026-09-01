import { and, eq } from 'drizzle-orm';
import { getPlatformProxy } from 'wrangler';

import { credit, user } from '@/config/db/schema';
import { getD1Db } from '@/core/db/d1';
import { getUuid } from '@/shared/lib/hash';
import {
  createAITaskWithD1Credits,
  refundStudioCreditsWithD1,
} from '@/shared/models/d1-studio-credit';
import { updateAITaskById } from '@/shared/models/ai_task';

const TEST_EMAIL = 'preview-d1-smoke-20260901@image-layered.invalid';

async function main() {
  if (process.env.ALLOW_REMOTE_D1_SMOKE !== 'true') {
    throw new Error('Set ALLOW_REMOTE_D1_SMOKE=true to use the remote Preview D1');
  }

  const proxy = await getPlatformProxy({
    configPath: 'wrangler.preview.jsonc',
    remoteBindings: true,
  });
  (globalThis as any)[Symbol.for('__cloudflare-context__')] = {
    env: proxy.env,
    cf: undefined,
    ctx: proxy.ctx,
  };

  try {
    const d1 = getD1Db();
    const [testUser] = await d1
      .select({ id: user.id })
      .from(user)
      .where(eq(user.email, TEST_EMAIL));
    if (!testUser) throw new Error(`Missing Preview fixture user ${TEST_EMAIL}`);

    const task = await createAITaskWithD1Credits({
      id: getUuid(),
      userId: testUser.id,
      mediaType: 'image',
      provider: 'd1-smoke',
      model: 'atomic-batch',
      prompt: 'D1 atomic credit smoke test',
      status: 'processing',
      scene: 'image-replace',
      costCredits: 4,
      taskId: `d1-smoke-${Date.now()}`,
    });

    const [afterCharge] = await d1
      .select({ remaining: credit.remainingCredits })
      .from(credit)
      .where(eq(credit.id, 'preview-grant-20260901'));
    if (afterCharge?.remaining !== 16 || !task.creditId) {
      throw new Error('D1 charge smoke failed');
    }

    const firstRefund = await refundStudioCreditsWithD1(
      task.creditId,
      testUser.id,
      'd1_preview_smoke'
    );
    const secondRefund = await refundStudioCreditsWithD1(
      task.creditId,
      testUser.id,
      'd1_preview_smoke_retry'
    );
    const updatedTask = await updateAITaskById(task.id, {
      status: 'failed',
      creditId: task.creditId,
    });

    const [[afterRefund], [consumed]] = await Promise.all([
      d1
        .select({ remaining: credit.remainingCredits })
        .from(credit)
        .where(eq(credit.id, 'preview-grant-20260901')),
      d1
        .select({ status: credit.status })
        .from(credit)
        .where(
          and(eq(credit.id, task.creditId), eq(credit.userId, testUser.id))
        ),
    ]);

    if (
      !firstRefund ||
      secondRefund ||
      afterRefund?.remaining !== 20 ||
      consumed?.status !== 'deleted' ||
      updatedTask?.status !== 'failed'
    ) {
      throw new Error('D1 refund/idempotency smoke failed');
    }

    console.log(
      JSON.stringify({
        chargedBalance: 16,
        refundedBalance: 20,
        firstRefund,
        secondRefund,
        consumeStatus: consumed.status,
        taskStatus: updatedTask.status,
        taskId: task.id,
      })
    );
  } finally {
    await proxy.dispose();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
