import { access, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import type {
  StorageDownloadUploadOptions,
  StorageProvider,
  StorageUploadOptions,
  StorageUploadResult,
} from '.';

export interface LocalStorageConfigs {
  rootDirectory?: string;
  publicPath?: string;
}

export class LocalStorageProvider implements StorageProvider {
  readonly name = 'local';
  configs: LocalStorageConfigs;

  constructor(configs: LocalStorageConfigs = {}) {
    this.configs = configs;
  }

  private getRootDirectory() {
    return path.resolve(
      this.configs.rootDirectory ||
        path.join(process.cwd(), 'public', 'uploads')
    );
  }

  private getSafeKey(key: string) {
    const normalized = key.replaceAll('\\', '/').replace(/^\/+/, '');
    if (!normalized || normalized.split('/').includes('..')) {
      throw new Error('Invalid local storage key');
    }
    return normalized;
  }

  private getFilePath(key: string) {
    const root = this.getRootDirectory();
    const filePath = path.resolve(root, this.getSafeKey(key));
    if (filePath !== root && !filePath.startsWith(`${root}${path.sep}`)) {
      throw new Error('Invalid local storage path');
    }
    return filePath;
  }

  getPublicUrl = ({ key }: { key: string }) => {
    const publicPath = (this.configs.publicPath || '/uploads').replace(
      /\/$/,
      ''
    );
    const encodedKey = this.getSafeKey(key)
      .split('/')
      .map(encodeURIComponent)
      .join('/');
    return `${publicPath}/${encodedKey}`;
  };

  exists = async ({ key }: { key: string }) => {
    try {
      await access(this.getFilePath(key));
      return true;
    } catch {
      return false;
    }
  };

  async uploadFile(
    options: StorageUploadOptions
  ): Promise<StorageUploadResult> {
    try {
      const filePath = this.getFilePath(options.key);
      await mkdir(path.dirname(filePath), { recursive: true });
      await writeFile(filePath, options.body);

      return {
        success: true,
        location: filePath,
        key: options.key,
        filename: path.basename(filePath),
        url: this.getPublicUrl({ key: options.key }),
        provider: this.name,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Local upload failed',
        provider: this.name,
      };
    }
  }

  async downloadAndUpload(
    options: StorageDownloadUploadOptions
  ): Promise<StorageUploadResult> {
    try {
      const sourceUrl = new URL(
        options.url,
        process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      );
      const response = await fetch(sourceUrl);
      if (!response.ok) {
        throw new Error(`Download failed with status ${response.status}`);
      }

      return this.uploadFile({
        body: new Uint8Array(await response.arrayBuffer()),
        key: options.key,
        contentType: options.contentType,
        disposition: options.disposition,
      });
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Local download failed',
        provider: this.name,
      };
    }
  }
}
