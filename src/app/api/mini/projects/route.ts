import {
  createProjectForActor,
  listProjectsForActor,
} from '@/features/studio/server/projects';
import {
  miniErr,
  miniOk,
  toStudioActor,
} from '@/features/studio/server/mini-response';
import { getMiniActor } from '@/shared/models/mini-identity';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const actor = await getMiniActor(request);
    const input = await request.json();
    const data = await createProjectForActor(toStudioActor(actor), input);
    return miniOk(data);
  } catch (error) {
    return miniErr(error);
  }
}

export async function GET(request: Request) {
  try {
    const actor = await getMiniActor(request);
    const data = await listProjectsForActor(toStudioActor(actor));
    return miniOk(data);
  } catch (error) {
    return miniErr(error);
  }
}
