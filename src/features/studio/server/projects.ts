import { and, desc, eq } from 'drizzle-orm';

import { project } from '@/config/db/schema';
import { db } from '@/core/db';
import { getUuid } from '@/shared/lib/hash';

import type { StudioActor } from './identity';

export type CreateProjectInput = {
  title?: string;
  width: number;
  height: number;
  originalAssetId: string;
  originalUrl?: string;
};

export type SaveProjectInput = {
  project?: { title?: string; previewUrl?: string };
  layers: unknown[];
};

function parseLayers(value: string) {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function toStudioPayload(row: typeof project.$inferSelect) {
  const layers = parseLayers(row.layers);
  const original =
    layers.find((layer: any) => layer?.source === 'original') || layers[0];
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

export async function createProjectForActor(
  actor: StudioActor,
  input: CreateProjectInput
) {
  const { title, width, height, originalAssetId, originalUrl } = input;

  if (!width || !height || !originalAssetId) {
    throw new Error('width, height and originalAssetId are required');
  }

  const id = getUuid();
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
    userId: actor.userId,
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

  if (actor.userId) {
    await db().insert(project).values({
      id,
      userId: actor.userId,
      name: studioProject.title,
      layers: JSON.stringify([originalLayer]),
      previewUrl: originalUrl || null,
      createdAt: now,
      updatedAt: now,
    });
  }

  return { project: studioProject, layers: [originalLayer] };
}

export async function listProjectsForActor(actor: StudioActor) {
  if (!actor.userId) throw new Error('Authentication required');

  return db()
    .select({
      id: project.id,
      name: project.name,
      previewUrl: project.previewUrl,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    })
    .from(project)
    .where(eq(project.userId, actor.userId))
    .orderBy(desc(project.createdAt));
}

export async function getProjectForActor(
  actor: StudioActor,
  projectId: string
) {
  if (!actor.userId) throw new Error('Authentication required');

  const [row] = await db()
    .select()
    .from(project)
    .where(and(eq(project.id, projectId), eq(project.userId, actor.userId)))
    .limit(1);

  if (!row) throw new Error('Project not found');
  return toStudioPayload(row);
}

export async function saveProjectForActor(
  actor: StudioActor,
  projectId: string,
  input: SaveProjectInput
) {
  if (!actor.userId) throw new Error('Authentication required');
  if (!Array.isArray(input.layers)) throw new Error('layers are required');
  if (input.layers.length > 250) throw new Error('too many layers');

  const [existing] = await db()
    .select()
    .from(project)
    .where(and(eq(project.id, projectId), eq(project.userId, actor.userId)))
    .limit(1);

  if (!existing) throw new Error('Project not found');

  const [updated] = await db()
    .update(project)
    .set({
      name: input.project?.title?.trim() || existing.name,
      layers: JSON.stringify(input.layers),
      previewUrl: input.project?.previewUrl || existing.previewUrl,
      updatedAt: new Date(),
    })
    .where(and(eq(project.id, projectId), eq(project.userId, actor.userId)))
    .returning();

  return toStudioPayload(updated);
}
