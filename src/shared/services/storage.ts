import { R2Provider, S3Provider, StorageManager } from '@/extensions/storage';
import { Configs, getAllConfigs } from '@/shared/models/config';

/**
 * get storage service with configs
 */
export async function getStorageServiceWithConfigs(configs: Configs) {
  const storageManager = new StorageManager();

  const useLocalStorage =
    process.env.NODE_ENV === 'development' &&
    process.env.DATABASE_URL?.startsWith('file:');

  if (useLocalStorage) {
    const { LocalStorageProvider } = await import('@/extensions/storage/local');
    storageManager.addProvider(new LocalStorageProvider(), true);
  }

  // Add R2 provider if configured
  if (
    configs.r2_access_key &&
    configs.r2_secret_key &&
    configs.r2_bucket_name
  ) {
    // r2_region in settings stores the Cloudflare Account ID
    // For R2, region is typically "auto" but can be customized
    const accountId = configs.r2_account_id || '';

    storageManager.addProvider(
      new R2Provider({
        accountId: accountId,
        accessKeyId: configs.r2_access_key,
        secretAccessKey: configs.r2_secret_key,
        bucket: configs.r2_bucket_name,
        uploadPath: configs.r2_upload_path,
        region: 'auto', // R2 uses "auto" as region
        endpoint: configs.r2_endpoint, // Optional custom endpoint
        publicDomain: configs.r2_domain,
      }),
      !useLocalStorage // Keep local storage as the development default.
    );
  }

  // Add S3 provider if configured (future support)
  if (configs.s3_access_key && configs.s3_secret_key && configs.s3_bucket) {
    storageManager.addProvider(
      new S3Provider({
        endpoint: configs.s3_endpoint,
        region: configs.s3_region,
        accessKeyId: configs.s3_access_key,
        secretAccessKey: configs.s3_secret_key,
        bucket: configs.s3_bucket,
        publicDomain: configs.s3_domain,
      })
    );
  }

  return storageManager;
}

/**
 * global storage service
 */
let storageService: StorageManager | null = null;

/**
 * get storage service instance
 */
export async function getStorageService(
  configs?: Configs
): Promise<StorageManager> {
  if (!configs) {
    const useLocalStorage =
      process.env.NODE_ENV === 'development' &&
      process.env.DATABASE_URL?.startsWith('file:');
    configs = useLocalStorage ? {} : await getAllConfigs();
  }
  storageService = await getStorageServiceWithConfigs(configs);

  return storageService;
}
