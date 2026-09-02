import { miniAiDispatcher } from '@/features/studio/server/mini-ai';
import {
  MiniError,
  miniErr,
  miniOk,
  toMiniOperationPayload,
  toStudioActor,
} from '@/features/studio/server/mini-response';
import { createOperationForActor } from '@/features/studio/server/operations';
import {
  getMiniActor,
  MINI_ERROR,
} from '@/shared/models/mini-identity';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const ALLOWED_TYPES = ['decompose', 'replace', 'recolor', 'remove'] as const;
const FORBIDDEN_FIELDS = [
  'provider',
  'model',
  'userId',
  'actorKey',
  'creditState',
  'costCredits',
];

export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const actor = await getMiniActor(request);
    const { projectId } = await params;
    const body = await request.json();

    const forbidden = FORBIDDEN_FIELDS.find((key) => key in body);
    if (forbidden) {
      throw new MiniError(40000, 400, `forbidden field: ${forbidden}`);
    }

    if (!ALLOWED_TYPES.includes(body?.type)) {
      throw new MiniError(
        MINI_ERROR.OPERATION_INVALID_TYPE,
        400,
        'unsupported studio operation'
      );
    }

    const { type, targetLayerIds, prompt, baseRevisionId, options } = body;
    const data = await createOperationForActor(
      toStudioActor(actor),
      projectId,
      { type, targetLayerIds, prompt, baseRevisionId, options },
      miniAiDispatcher(actor)
    );

    return miniOk(toMiniOperationPayload(data));
  } catch (error) {
    return miniErr(error);
  }
}
