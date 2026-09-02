import {
  getProjectForActor,
  saveProjectForActor,
} from '@/features/studio/server/projects';
import {
  miniErr,
  miniOk,
  toStudioActor,
} from '@/features/studio/server/mini-response';
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
    const data = await getProjectForActor(toStudioActor(actor), projectId);
    return miniOk(data);
  } catch (error) {
    return miniErr(error);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const actor = await getMiniActor(request);
    const { projectId } = await params;
    const input = await request.json();
    const data = await saveProjectForActor(toStudioActor(actor), projectId, input);
    return miniOk(data);
  } catch (error) {
    return miniErr(error);
  }
}
