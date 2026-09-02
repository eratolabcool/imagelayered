import { getStudioActor } from '@/features/studio/server/identity';
import {
  createOperationForActor,
  webAiDispatcher,
} from '@/features/studio/server/operations';
import { respData, respErr } from '@/shared/lib/resp';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const actor = await getStudioActor();
    const body = await request.json();
    const ai = webAiDispatcher(
      { baseUrl: request.url, cookie: request.headers.get('cookie') },
      actor.guestId
    );
    const data = await createOperationForActor(actor, projectId, body, ai);
    return respData(data);
  } catch (error: any) {
    return respErr(error.message);
  }
}
