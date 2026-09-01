import { detectImageType, isAllowedImageType } from '@/app/api/storage/_lib/image-security';
import type {
  StorageUploadOptions,
  StorageUploadResult,
} from '@/extensions/storage';
import { md5 } from '@/shared/lib/hash';
import { respData } from '@/shared/lib/resp';
import { getStorageService } from '@/shared/services/storage';

const MAX_FILE_BYTES = 25 * 1024 * 1024;
const MAX_TOTAL_BYTES = 50 * 1024 * 1024;
const MAX_FILES = 8;

export type ImageUploadResult = {
  url: string;
  key: string;
  filename: string;
  deduped: boolean;
};

/**
 * Structural subset shared by StorageManager and StorageProvider so the upload
 * implementation can be reused by both the web and mini-program routes.
 */
export type ImageUploadStorage = {
  exists?: (options: { key: string; bucket?: string }) => Promise<boolean>;
  getPublicUrl?: (options: { key: string; bucket?: string }) => string | undefined;
  uploadFile: (options: StorageUploadOptions) => Promise<StorageUploadResult>;
};

export class UploadError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'UploadError';
    this.status = status;
  }
}

const extFromMime = (mimeType: string) => {
  const map: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'image/avif': 'avif',
  };
  return map[mimeType] || '';
};

export function uploadErrorResponse(message: string, status: number): Response {
  return Response.json({ code: -1, message }, { status });
}

/**
 * Shared first-party image upload: type + magic-byte validation, size limits,
 * md5 dedupe and storage upload. Reused verbatim by the anonymous web route
 * and the Bearer-authenticated mini-program route.
 */
export async function uploadImages(
  files: File[],
  storageService: ImageUploadStorage
): Promise<{ urls: string[]; results: ImageUploadResult[] }> {
  if (!files || files.length === 0) {
    throw new UploadError('No files provided', 400);
  }
  if (files.length > MAX_FILES) {
    throw new UploadError(
      `A maximum of ${MAX_FILES} images can be uploaded at once`,
      400
    );
  }
  if (files.some((file) => file.size <= 0 || file.size > MAX_FILE_BYTES)) {
    throw new UploadError('Each image must be between 1 byte and 25 MB', 413);
  }
  if (files.reduce((total, file) => total + file.size, 0) > MAX_TOTAL_BYTES) {
    throw new UploadError('The combined upload exceeds the 50 MB limit', 413);
  }

  const results: ImageUploadResult[] = [];

  for (const file of files) {
    if (!isAllowedImageType(file.type)) {
      throw new UploadError(`File ${file.name} uses an unsupported image type`, 415);
    }

    const arrayBuffer = await file.arrayBuffer();
    const body = new Uint8Array(arrayBuffer);
    const detectedType = detectImageType(body);
    if (!detectedType || detectedType !== file.type.toLowerCase()) {
      throw new UploadError(
        `File ${file.name} does not match its declared image type`,
        415
      );
    }

    const digest = md5(body);
    const ext = extFromMime(file.type) || file.name.split('.').pop() || 'bin';
    const key = `${digest}.${ext}`;

    // Reuse existing objects to save storage (still depends on provider
    // supporting signed HEAD + public URL generation).
    if (storageService.exists) {
      const exists = await storageService.exists({ key });
      if (exists) {
        const publicUrl = storageService.getPublicUrl?.({ key });
        if (publicUrl) {
          results.push({ url: publicUrl, key, filename: file.name, deduped: true });
          continue;
        }
      }
    }

    const result = await storageService.uploadFile({
      body,
      key,
      contentType: file.type,
      disposition: 'inline',
    });

    if (!result.success) {
      throw new UploadError(result.error || 'Upload failed', 502);
    }

    results.push({
      url: result.url ?? '',
      key: result.key ?? key,
      filename: file.name,
      deduped: false,
    });
  }

  return { urls: results.map((result) => result.url), results };
}

/**
 * Shared web upload handler (no auth) — preserves the original
 * /api/storage/upload-image contract exactly.
 */
export async function handleImageUpload(
  request: Request,
  getStorage: () => Promise<ImageUploadStorage> = () => getStorageService()
): Promise<Response> {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const storageService = await getStorage();
    const result = await uploadImages(files, storageService);
    return respData(result);
  } catch (error) {
    if (error instanceof UploadError) {
      return uploadErrorResponse(error.message, error.status);
    }
    console.error('upload image failed:', error);
    return uploadErrorResponse('upload image failed', 500);
  }
}
