import { createProjectForActor } from '@/features/studio/server/projects';
import { respData, respErr } from '@/shared/lib/resp';
import { getSignUser } from '@/shared/models/user';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const input = await request.json();
    const user = await getSignUser();
    const actor = {
      userId: user?.id ?? null,
      actorKey: user?.id ? `user:${user.id}` : 'guest',
      guestId: null,
    };
    const data = await createProjectForActor(actor, input);
    return respData(data);
  } catch (error: any) {
    console.error('[Studio] create project failed', error);
    return respErr(error.message);
  }
}
