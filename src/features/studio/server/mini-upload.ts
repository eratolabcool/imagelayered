import { getMiniActor, MiniAuthError, miniErrorResponse } from '@/shared/models/mini-identity';
import {
  handleImageUpload,
  ImageUploadStorage,
} from '@/shared/services/image-upload';
import { getStorageService } from '@/shared/services/storage';

/**
 * Bearer-authenticated Mini Program upload. Reuses the shared image-upload
 * implementation (security, magic bytes, size limits, md5 dedupe, R2).
 *
 * A rate-limit hook is intentionally reserved here — wire a per-user limiter
 * in a later step without changing the upload contract.
 */
export async function handleMiniUpload(
  request: Request,
  getStorage: () => Promise<ImageUploadStorage> = () => getStorageService()
): Promise<Response> {
  try {
    await getMiniActor(request);
  } catch (error) {
    if (error instanceof MiniAuthError) {
      return miniErrorResponse(error);
    }
    throw error;
  }

  // Reserved: rate-limit hook (per-user) goes here.

  return handleImageUpload(request, getStorage);
}
