import { getStudioActor } from '@/features/studio/server/identity';
import {
  pollOperationForActor,
  webAiDispatcher,
} from '@/features/studio/server/operations';
import { respData, respErr } from '@/shared/lib/resp';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ operationId: string }> }
) {
  try {
    const { operationId } = await params;
    const actor = await getStudioActor();
    const ai = webAiDispatcher({
      baseUrl: request.url,
      cookie: request.headers.get('cookie'),
    });
    const data = await pollOperationForActor(actor, operationId, ai);
    return respData(data);
  } catch (error: any) {
    return respErr(error.message);
  }
}
