import { getStudioActor } from '@/features/studio/server/identity';
import { respData, respErr } from '@/shared/lib/resp';
import {
  createStudioRevisionRecord,
  listStudioRevisions,
} from '@/shared/models/studio';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function toPayload(row: any) {
  let snapshot: unknown = {};
  try {
    snapshot = JSON.parse(row.snapshot);
  } catch {
    snapshot = {};
  }

  return {
    id: row.id,
    projectId: row.projectId,
    parentRevisionId: row.parentRevisionId || undefined,
    operationId: row.operationId || undefined,
    snapshot,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const actor = await getStudioActor();
    const rows = await listStudioRevisions(projectId, actor.actorKey);
    return respData(rows.map(toPayload));
  } catch (error: any) {
    return respErr(error.message);
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const actor = await getStudioActor();
    const { parentRevisionId, operationId, snapshot } = await request.json();

    if (!snapshot || typeof snapshot !== 'object') {
      throw new Error('revision snapshot is required');
    }

    const encoded = JSON.stringify(snapshot);
    if (encoded.length > 2_000_000) {
      throw new Error('revision snapshot is too large');
    }

    const row = await createStudioRevisionRecord({
      projectId,
      actorKey: actor.actorKey,
      parentRevisionId: parentRevisionId || null,
      operationId: operationId || null,
      snapshot,
    });

    return respData(toPayload(row));
  } catch (error: any) {
    return respErr(error.message);
  }
}
