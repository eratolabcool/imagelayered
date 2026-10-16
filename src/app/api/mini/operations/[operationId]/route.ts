import { miniAiDispatcher } from '@/features/studio/server/mini-ai';
import {
  miniErr,
  miniOk,
  toMiniOperationPayload,
  toStudioActor,
} from '@/features/studio/server/mini-response';
import { pollOperationForActor } from '@/features/studio/server/operations';
import { getMiniActor } from '@/shared/models/mini-identity';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ operationId: string }> }
) {
  try {
    const actor = await getMiniActor(request);
    const { operationId } = await params;
    const data = await pollOperationForActor(
      toStudioActor(actor),
      operationId,
      miniAiDispatcher(actor)
    );
    return miniOk(toMiniOperationPayload(data));
  } catch (error) {
    return miniErr(error);
  }
}
