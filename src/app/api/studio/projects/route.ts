import { project } from '@/config/db/schema';
import { db } from '@/core/db';
import { getUuid } from '@/shared/lib/hash';
import { respData, respErr } from '@/shared/lib/resp';
import { getSignUser } from '@/shared/models/user';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const { title, width, height, originalAssetId, originalUrl } =
      await request.json();

    if (!width || !height || !originalAssetId) {
      throw new Error('width, height and originalAssetId are required');
    }

    const id = getUuid();
    const user = await getSignUser();
    const now = new Date();
    const originalLayer = {
      id: getUuid(),
      projectId: id,
      name: 'Original',
      type: 'raster',
      semanticType: 'background',
      assetId: originalUrl || originalAssetId,
      storageKey: originalAssetId,
      x: 0,
      y: 0,
      width: Number(width),
      height: Number(height),
      scaleX: 1,
      scaleY: 1,
      rotation: 0,
      opacity: 1,
      visible: true,
      locked: false,
      zIndex: 0,
      source: 'original',
      createdAt: now.toISOString(),
    };

    const studioProject = {
      id,
      userId: user?.id || null,
      title: title || 'Untitled project',
      width: Number(width),
      height: Number(height),
      originalAssetId,
      activeRevisionId: null,
      status: 'ready' as const,
      schemaVersion: 1,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    if (user?.id) {
      await db().insert(project).values({
        id,
        userId: user.id,
        name: studioProject.title,
        layers: JSON.stringify([originalLayer]),
        previewUrl: originalUrl || null,
        createdAt: now,
        updatedAt: now,
      });
    }

    return respData(studioProject);
  } catch (error: any) {
    console.error('[Studio] create project failed', error);
    return respErr(error.message);
  }
}
