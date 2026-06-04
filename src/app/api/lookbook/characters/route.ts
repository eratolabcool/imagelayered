import { desc, eq } from 'drizzle-orm';

import { db } from '@/core/db';
import { lookbookCharacter } from '@/config/db/schema';
import { getUuid } from '@/shared/lib/hash';
import { respData, respErr } from '@/shared/lib/resp';
import { getSignUser } from '@/shared/models/user';

async function requireUser() {
  const user = await getSignUser();
  if (!user?.id) throw new Error('Authentication required');
  return user;
}

export async function GET() {
  try {
    const user = await requireUser();
    const characters = await db()
      .select()
      .from(lookbookCharacter)
      .where(eq(lookbookCharacter.userId, user.id))
      .orderBy(desc(lookbookCharacter.updatedAt));

    return respData(characters);
  } catch (error) {
    return respErr(error instanceof Error ? error.message : 'Failed to load Character IDs');
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const { name, faceImageUrl, fullBodyImageUrl, characterProfile } =
      await request.json();

    if (!faceImageUrl || !fullBodyImageUrl || !characterProfile) {
      return respErr('Face image, full-body image, and character profile are required');
    }

    const [character] = await db()
      .insert(lookbookCharacter)
      .values({
        id: getUuid(),
        userId: user.id,
        name: String(name || 'My Fashion Persona').trim(),
        faceImageUrl,
        fullBodyImageUrl,
        characterProfile:
          typeof characterProfile === 'string'
            ? characterProfile
            : JSON.stringify(characterProfile),
      })
      .returning();

    return respData(character);
  } catch (error) {
    console.error('[POST /api/lookbook/characters] Failed:', error);
    return respErr(error instanceof Error ? error.message : 'Failed to save Character ID');
  }
}
