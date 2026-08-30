import { cookies } from 'next/headers';

import { getUuid } from '@/shared/lib/hash';
import { getSignUser } from '@/shared/models/user';

const GUEST_COOKIE = 'image_layered_studio_guest';
const GUEST_ID_PATTERN = /^[a-zA-Z0-9-]{8,191}$/;

export type StudioActor = {
  actorKey: string;
  userId: string | null;
  guestId: string | null;
};

export async function getStudioActor(): Promise<StudioActor> {
  const user = await getSignUser();
  if (user?.id) {
    return {
      actorKey: `user:${user.id}`,
      userId: user.id,
      guestId: null,
    };
  }

  const cookieStore = await cookies();
  let guestId = cookieStore.get(GUEST_COOKIE)?.value || '';
  if (!GUEST_ID_PATTERN.test(guestId)) {
    guestId = getUuid();
    cookieStore.set(GUEST_COOKIE, guestId, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
    });
  }

  return {
    actorKey: `guest:${guestId}`,
    userId: null,
    guestId,
  };
}
