import { getStudioActor } from '@/features/studio/server/identity';
import {
  createRevisionForActor,
  listRevisionsForActor,
} from '@/features/studio/server/revisions';
import { respData, respErr } from '@/shared/lib/resp';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const actor = await getStudioActor();
    const data = await listRevisionsForActor(actor, projectId);
    return respData(data);
  } catch (error: any) {
    return respErr(error.message);
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const actor = await getStudioActor();
    const body = await request.json();
    const data = await createRevisionForActor(actor, projectId, body);
    return respData(data);
  } catch (error: any) {
    return respErr(error.message);
  }
}
