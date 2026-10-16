import {
  getProjectForActor,
  saveProjectForActor,
} from '@/features/studio/server/projects';
import { respData, respErr } from '@/shared/lib/resp';
import { getSignUser } from '@/shared/models/user';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function resolveActor(user: Awaited<ReturnType<typeof getSignUser>>) {
  return {
    userId: user?.id ?? null,
    actorKey: user?.id ? `user:${user.id}` : 'guest',
    guestId: null,
  };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const user = await getSignUser();
    const data = await getProjectForActor(resolveActor(user), projectId);
    return respData(data);
  } catch (error: any) {
    return respErr(error.message);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const user = await getSignUser();
    const body = await request.json();
    const data = await saveProjectForActor(resolveActor(user), projectId, body);
    return respData(data);
  } catch (error: any) {
    console.error('[Studio] save project failed', error);
    return respErr(error.message);
  }
}
