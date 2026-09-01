import { getCloudflareContext } from '@opennextjs/cloudflare';

import { envConfigs } from '@/config';

import type {
  StorageConfigs,
  StorageDownloadUploadOptions,
  StorageProvider,
  StorageUploadOptions,
  StorageUploadResult,
} from '.';

interface R2ObjectBodyLike {
  body: ReadableStream;
  httpEtag: string;
  httpMetadata?: { contentType?: string; contentDisposition?: string };
}

export interface R2BucketLike {
  head(key: string): Promise<unknown | null>;
  get(key: string): Promise<R2ObjectBodyLike | null>;
  put(
    key: string,
    value: Uint8Array,
    options?: {
      httpMetadata?: { contentType?: string; contentDisposition?: string };
    }
  ): Promise<unknown>;
}

declare global {
  interface CloudflareEnv {
    STORAGE?: R2BucketLike;
  }
}

export function getCloudflareStorageBucket() {
  const bucket = getCloudflareContext().env.STORAGE;
  if (!bucket) throw new Error('Cloudflare R2 binding STORAGE is not configured');
  return bucket;
}

export class CloudflareR2Provider implements StorageProvider {
  readonly name = 'cloudflare-r2-binding';
  configs: StorageConfigs = {};

  getPublicUrl = ({ key }: { key: string }) =>
    `${envConfigs.app_url}/api/storage/files/${key
      .split('/')
      .map(encodeURIComponent)
      .join('/')}`;

  exists = async ({ key }: { key: string }) =>
    !!(await getCloudflareStorageBucket().head(key));

  async uploadFile(options: StorageUploadOptions): Promise<StorageUploadResult> {
    try {
      const body =
        options.body instanceof Buffer
          ? new Uint8Array(options.body)
          : options.body;
      await getCloudflareStorageBucket().put(options.key, body, {
        httpMetadata: {
          contentType: options.contentType || 'application/octet-stream',
          contentDisposition: options.disposition || 'inline',
        },
      });

      return {
        success: true,
        location: options.key,
        key: options.key,
        filename: options.key.split('/').pop(),
        url: this.getPublicUrl({ key: options.key }),
        provider: this.name,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        provider: this.name,
      };
    }
  }

  async downloadAndUpload(
    options: StorageDownloadUploadOptions
  ): Promise<StorageUploadResult> {
    try {
      const response = await fetch(options.url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return this.uploadFile({
        body: new Uint8Array(await response.arrayBuffer()),
        key: options.key,
        contentType:
          options.contentType ||
          response.headers.get('content-type') ||
          'application/octet-stream',
        disposition: options.disposition,
      });
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        provider: this.name,
      };
    }
  }
}
