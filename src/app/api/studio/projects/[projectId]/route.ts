import { and, eq } from 'drizzle-orm';

import { project } from '@/config/db/schema';
import { db } from '@/core/db';
import { respData, respErr } from '@/shared/lib/resp';
import { getSignUser } from '@/shared/models/user';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function parseLayers(value: string) {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function toStudioPayload(row: typeof project.$inferSelect) {
  const layers = parseLayers(row.layers);
  const original = layers.find((layer: any) => layer?.source === 'original') || layers[0];
  const now = row.updatedAt.toISOString();

  return {
    project: {
      id: row.id,
      userId: row.userId,
      title: row.name,
      width: Number(original?.width || 0),
      height: Number(original?.height || 0),
      originalAssetId: original?.storageKey || original?.assetId || '',
      activeRevisionId: null,
      status: 'ready',
      schemaVersion: 1,
      createdAt: row.createdAt.toISOString(),
      updatedAt: now,
    },
    layers,
  };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const user = await getSignUser();
    if (!user?.id) throw new Error('Authentication required');

    const [row] = await db()
      .select()
      .from(project)
      .where(and(eq(project.id, projectId), eq(project.userId, user.id)))
      .limit(1);

    if (!row) throw new Error('Project not found');
    return respData(toStudioPayload(row));
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
    if (!user?.id) throw new Error('Authentication required');

    const body = await request.json();
    if (!Array.isArray(body.layers)) throw new Error('layers are required');
    if (body.layers.length > 250) throw new Error('too many layers');

    const [existing] = await db()
      .select()
      .from(project)
      .where(and(eq(project.id, projectId), eq(project.userId, user.id)))
      .limit(1);

    if (!existing) throw new Error('Project not found');

    const [updated] = await db()
      .update(project)
      .set({
        name: body.project?.title?.trim() || existing.name,
        layers: JSON.stringify(body.layers),
        previewUrl: body.project?.previewUrl || existing.previewUrl,
        updatedAt: new Date(),
      })
      .where(and(eq(project.id, projectId), eq(project.userId, user.id)))
      .returning();

    return respData(toStudioPayload(updated));
  } catch (error: any) {
    console.error('[Studio] save project failed', error);
    return respErr(error.message);
  }
}
