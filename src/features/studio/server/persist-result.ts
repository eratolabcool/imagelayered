import { fetchRemoteImage } from '@/app/api/storage/_lib/image-security';
import { md5 } from '@/shared/lib/hash';
import { getStorageService } from '@/shared/services/storage';

const EXT_BY_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
};

async function persistOne(url: string) {
  if (!/^https?:\/\//i.test(url)) return url;

  const { bytes, contentType } = await fetchRemoteImage(url);
  const storage = await getStorageService();
  const ext = EXT_BY_MIME[contentType] || 'bin';
  const key = `studio/${md5(bytes)}.${ext}`;

  if (await storage.exists({ key })) {
    return storage.getPublicUrl({ key }) || url;
  }

  const uploaded = await storage.uploadFile({
    body: bytes,
    key,
    contentType,
    disposition: 'inline',
  });

  return uploaded.success && uploaded.url ? uploaded.url : url;
}

/**
 * Provider URLs can expire and frequently omit browser CORS headers. Persisting
 * successful outputs makes revisions durable and gives canvas export a stable,
 * first-party URL. Individual failures deliberately fall back to provider URLs
 * so an otherwise successful AI operation is not discarded by storage trouble.
 */
export async function persistStudioResultImages(urls: string[]) {
  return Promise.all(
    urls.map(async (url) => {
      try {
        return await persistOne(url);
      } catch (error) {
        console.warn('[Studio] unable to persist result image', error);
        return url;
      }
    })
  );
}
