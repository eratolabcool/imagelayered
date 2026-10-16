import { handleImageUpload } from '@/shared/services/image-upload';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: Request) {
  return handleImageUpload(req);
}
