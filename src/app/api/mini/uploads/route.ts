import { handleMiniUpload } from '@/features/studio/server/mini-upload';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: Request) {
  return handleMiniUpload(request);
}
