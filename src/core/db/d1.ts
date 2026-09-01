import { getCloudflareContext } from '@opennextjs/cloudflare';
import { drizzle } from 'drizzle-orm/d1';
import type { AnyD1Database } from 'drizzle-orm/d1';

declare global {
  interface CloudflareEnv {
    DB?: AnyD1Database;
  }
}

let d1DbInstance: ReturnType<typeof drizzle> | null = null;

/**
 * Return the D1-backed Drizzle client for the current Cloudflare request.
 *
 * D1 is a Worker binding rather than a URL-based database. OpenNext exposes
 * that binding through the request-scoped Cloudflare context.
 */
export function getD1Db() {
  const binding = getCloudflareContext().env.DB;
  if (!binding) {
    throw new Error('Cloudflare D1 binding DB is not configured');
  }

  if (!d1DbInstance) {
    d1DbInstance = drizzle(binding);
  }

  return d1DbInstance;
}
