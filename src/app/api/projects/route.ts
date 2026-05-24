import { and, desc, eq } from 'drizzle-orm';
import { db } from '@/core/db';
import { project } from '@/config/db/schema';
import { getSignUser } from '@/shared/models/user';
import { respData, respErr, respOk } from '@/shared/lib/resp';

// Helper to check authentication and return user info
async function checkAuth() {
  const user = await getSignUser();
  if (!user || !user.id) {
    throw new Error('Authentication required');
  }
  return user;
}

/**
 * GET: Retrieve all projects for the authenticated user
 */
export async function GET(req: Request) {
  try {
    const user = await checkAuth();

    const userProjects = await db()
      .select({
        id: project.id,
        name: project.name,
        previewUrl: project.previewUrl,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      })
      .from(project)
      .where(eq(project.userId, user.id))
      .orderBy(desc(project.createdAt));

    return respData(userProjects);
  } catch (err: any) {
    console.error('[GET /api/projects] Failed:', err);
    if (err.message === 'Authentication required') {
      return respJson(401, 'Please sign in first');
    }
    return respErr('Failed to retrieve projects');
  }
}

/**
 * POST: Create or update a project
 */
export async function POST(req: Request) {
  try {
    const user = await checkAuth();
    const { id, name, layers, previewUrl } = await req.json();

    if (!id || !name || !layers) {
      return respErr('Missing required project fields (id, name, layers)');
    }

    const stringifiedLayers = typeof layers === 'string' ? layers : JSON.stringify(layers);

    // Check if the project already exists and belongs to this user
    const [existing] = await db()
      .select()
      .from(project)
      .where(and(eq(project.id, id), eq(project.userId, user.id)))
      .limit(1);

    if (existing) {
      // Update existing project
      const [updated] = await db()
        .update(project)
        .set({
          name: name.trim(),
          layers: stringifiedLayers,
          previewUrl: previewUrl || null,
          updatedAt: new Date(),
        })
        .where(and(eq(project.id, id), eq(project.userId, user.id)))
        .returning();

      return respData(updated);
    } else {
      // Insert new project
      const [inserted] = await db()
        .insert(project)
        .values({
          id,
          userId: user.id,
          name: name.trim(),
          layers: stringifiedLayers,
          previewUrl: previewUrl || null,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      return respData(inserted);
    }
  } catch (err: any) {
    console.error('[POST /api/projects] Failed:', err);
    if (err.message === 'Authentication required') {
      return respJson(401, 'Please sign in first');
    }
    return respErr('Failed to save project');
  }
}

/**
 * DELETE: Remove a project by ID
 */
export async function DELETE(req: Request) {
  try {
    const user = await checkAuth();
    
    // Parse query params to get project ID
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('id');

    if (!projectId) {
      return respErr('Project ID is required');
    }

    // Verify ownership and delete
    const [existing] = await db()
      .select()
      .from(project)
      .where(and(eq(project.id, projectId), eq(project.userId, user.id)))
      .limit(1);

    if (!existing) {
      return respErr('Project not found or access denied');
    }

    await db()
      .delete(project)
      .where(and(eq(project.id, projectId), eq(project.userId, user.id)));

    return respOk();
  } catch (err: any) {
    console.error('[DELETE /api/projects] Failed:', err);
    if (err.message === 'Authentication required') {
      return respJson(401, 'Please sign in first');
    }
    return respErr('Failed to delete project');
  }
}

// Inline helper for Response.json with custom status
function respJson(status: number, message: string) {
  return new Response(
    JSON.stringify({
      code: -1,
      message,
    }),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}
