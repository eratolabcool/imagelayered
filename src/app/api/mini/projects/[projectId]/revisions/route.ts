import {
  miniErr,
  miniOk,
  toStudioActor,
} from '@/features/studio/server/mini-response';
import {
  createRevisionForActor,
  listRevisionsForActor,
} from '@/features/studio/server/revisions';
import { getMiniActor } from '@/shared/models/mini-identity';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const actor = await getMiniActor(request);
    const { projectId } = await params;
    const data = await listRevisionsForActor(toStudioActor(actor), projectId);
    return miniOk(data);
  } catch (error) {
    return miniErr(error);
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const actor = await getMiniActor(request);
    const { projectId } = await params;
    const input = await request.json();
    const data = await createRevisionForActor(
      toStudioActor(actor),
      projectId,
      input
    );
    return miniOk(data);
  } catch (error) {
    return miniErr(error);
  }
}
