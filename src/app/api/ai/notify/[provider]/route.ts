import { NextResponse } from 'next/server';

import { AITaskStatus } from '@/extensions/ai';
import {
  findAITaskByProviderTaskId,
  updateAITaskById,
} from '@/shared/models/ai_task';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function firstString(...values: unknown[]) {
  return values.find((value): value is string => typeof value === 'string' && value.length > 0);
}

function normalizeStatus(value: unknown) {
  const status = typeof value === 'string' ? value.toLowerCase() : '';
  if (['success', 'succeeded', 'completed', 'complete'].includes(status)) return AITaskStatus.SUCCESS;
  if (['failed', 'failure', 'error'].includes(status)) return AITaskStatus.FAILED;
  if (['cancelled', 'canceled'].includes(status)) return AITaskStatus.CANCELED;
  if (['running', 'processing', 'in_progress'].includes(status)) return AITaskStatus.PROCESSING;
  return AITaskStatus.PENDING;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params;
  const body = await request.json().catch(() => ({}));
  const nested = body?.data?.data || body?.data || {};
  const providerTaskId = firstString(
    body?.taskId,
    body?.task_id,
    body?.data?.taskId,
    body?.data?.task_id,
    nested?.taskId,
    nested?.task_id
  );

  if (!providerTaskId) return NextResponse.json({ ok: true, ignored: true });
  const task = await findAITaskByProviderTaskId(provider, providerTaskId);
  if (!task) return NextResponse.json({ ok: true, ignored: true });

  const result = body?.result || body?.data?.result || nested?.result || body?.output || body?.data?.output;
  const rawStatus = body?.status || body?.state || body?.data?.status || body?.data?.state || nested?.status;
  const status = rawStatus ? normalizeStatus(rawStatus) : result ? AITaskStatus.SUCCESS : AITaskStatus.PROCESSING;
  // A provider retry must never move a terminal task back to pending/running,
  // and terminal callbacks are safe to receive more than once.
  if (
    [AITaskStatus.SUCCESS, AITaskStatus.FAILED, AITaskStatus.CANCELED].includes(task.status as any) &&
    status !== task.status
  ) {
    return NextResponse.json({ ok: true, idempotent: true });
  }

  const taskInfo = {
    ...(body?.errorCode ? { errorCode: body.errorCode } : {}),
    ...(body?.errorMessage ? { errorMessage: body.errorMessage } : {}),
    ...(body?.message ? { message: body.message } : {}),
  };
  const taskResult = result ?? body?.data ?? body;
  const nextInfo = JSON.stringify(taskInfo);
  const nextResult = JSON.stringify(taskResult);
  if (task.status === status && task.taskInfo === nextInfo && task.taskResult === nextResult) {
    return NextResponse.json({ ok: true, idempotent: true });
  }

  await updateAITaskById(task.id, {
    status,
    taskInfo: nextInfo,
    taskResult: nextResult,
    creditId: task.creditId,
  });
  return NextResponse.json({ ok: true });
}
