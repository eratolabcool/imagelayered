import { getUuid } from '@/shared/lib/hash';
import { respData, respErr } from '@/shared/lib/resp';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const { title, width, height, originalAssetId } = await request.json();

    if (!width || !height || !originalAssetId) {
      throw new Error('width, height and originalAssetId are required');
    }

    const now = new Date().toISOString();

    // P0 contract first: persistence is wired in the next Studio DB slice.
    // Keeping this route separate from /api/ai/generate establishes the
    // product boundary without changing the existing AI task infrastructure.
    return respData({
      id: getUuid(),
      userId: null,
      title: title || 'Untitled project',
      width,
      height,
      originalAssetId,
      activeRevisionId: null,
      status: 'ready',
      schemaVersion: 1,
      createdAt: now,
      updatedAt: now,
    });
  } catch (error: any) {
    return respErr(error.message);
  }
}
