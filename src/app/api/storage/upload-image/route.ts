import { md5 } from '@/shared/lib/hash';
import { respData } from '@/shared/lib/resp';
import { getStorageService } from '@/shared/services/storage';

import { detectImageType, isAllowedImageType } from '../_lib/image-security';

const MAX_FILE_BYTES = 25 * 1024 * 1024;
const MAX_TOTAL_BYTES = 50 * 1024 * 1024;
const MAX_FILES = 8;

function uploadError(message: string, status: number) {
  return Response.json({ code: -1, message }, { status });
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

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return uploadError('No files provided', 400);
    }
    if (files.length > MAX_FILES)
      return uploadError(
        `A maximum of ${MAX_FILES} images can be uploaded at once`,
        400
      );
    if (files.some((file) => file.size <= 0 || file.size > MAX_FILE_BYTES))
      return uploadError('Each image must be between 1 byte and 25 MB', 413);
    if (files.reduce((total, file) => total + file.size, 0) > MAX_TOTAL_BYTES)
      return uploadError('The combined upload exceeds the 50 MB limit', 413);

    const storageService = await getStorageService();
    const uploadResults = [];

    for (const file of files) {
      // Validate file type
      if (!isAllowedImageType(file.type))
        return uploadError(
          `File ${file.name} uses an unsupported image type`,
          415
        );

      // Convert file to buffer
      const arrayBuffer = await file.arrayBuffer();
      const body = new Uint8Array(arrayBuffer);
      const detectedType = detectImageType(body);
      if (!detectedType || detectedType !== file.type.toLowerCase())
        return uploadError(
          `File ${file.name} does not match its declared image type`,
          415
        );

      const digest = md5(body);
      const ext = extFromMime(file.type) || file.name.split('.').pop() || 'bin';
      const key = `${digest}.${ext}`;

      // If the same image already exists, reuse its URL to save storage space.
      // (Still depends on provider supporting signed HEAD + public url generation.)
      const exists = await storageService.exists({ key });
      if (exists) {
        const publicUrl = storageService.getPublicUrl({ key });
        if (publicUrl) {
          uploadResults.push({
            url: publicUrl,
            key,
            filename: file.name,
            deduped: true,
          });
          continue;
        }
      }

      // Upload to storage
      const result = await storageService.uploadFile({
        body,
        key: key,
        contentType: file.type,
        disposition: 'inline',
      });

      if (!result.success) {
        console.error('[API] Upload failed:', result.error);
        return uploadError(result.error || 'Upload failed', 502);
      }

      uploadResults.push({
        url: result.url,
        key: result.key,
        filename: file.name,
        deduped: false,
      });
    }

    return respData({
      urls: uploadResults.map((r) => r.url),
      results: uploadResults,
    });
  } catch (e) {
    console.error('upload image failed:', e);
    return uploadError('upload image failed', 500);
  }
}
