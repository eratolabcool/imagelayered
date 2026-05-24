import { eq } from 'drizzle-orm';
import { db } from '@/core/db';
import { project } from '@/config/db/schema';
import { respData, respErr } from '@/shared/lib/resp';

/**
 * GET: Retrieve public project details (layers, name) by ID.
 * This endpoint does not require authentication and is used for viral sharing loops.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('id');

    if (!projectId) {
      return respErr('Project ID is required');
    }

    // Query project details (any user can fetch a project if they have the direct share ID)
    const [existing] = await db()
      .select({
        id: project.id,
        name: project.name,
        layers: project.layers,
        previewUrl: project.previewUrl,
        createdAt: project.createdAt,
      })
      .from(project)
      .where(eq(project.id, projectId))
      .limit(1);

    if (!existing) {
      return new Response(
        JSON.stringify({
          code: -1,
          message: 'Project not found or sharing has been disabled',
        }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Parse layers to verify it's valid JSON
    let parsedLayers = [];
    try {
      parsedLayers = JSON.parse(existing.layers);
    } catch (e) {
      console.error('[GET /api/projects/share] Failed to parse layers:', e);
    }

    return respData({
      id: existing.id,
      name: existing.name,
      layers: parsedLayers,
      previewUrl: existing.previewUrl,
      createdAt: existing.createdAt,
    });
  } catch (err: any) {
    console.error('[GET /api/projects/share] Failed:', err);
    return respErr('Failed to retrieve shared project details');
  }
}
