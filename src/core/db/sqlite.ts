import { createClient } from '@libsql/client/web';
import { drizzle } from 'drizzle-orm/libsql/web';

import { envConfigs } from '@/config';
import { isCloudflareWorker } from '@/shared/lib/env';

// SQLite/libsql singleton (only used when DB_SINGLETON_ENABLED === 'true' and not in Workers)
let sqliteDbInstance: ReturnType<typeof drizzle> | null = null;

type ClientOptions = Parameters<typeof createClient>[0];
type LibsqlClient = ReturnType<typeof createClient>;

let createNodeClient: ((options: ClientOptions) => LibsqlClient) | undefined;

function createSqliteClient(options: ClientOptions): LibsqlClient {
  if (!options.url.startsWith('file:')) {
    return createClient(options);
  }

  if (isCloudflareWorker) {
    throw new Error(
      'file: SQLite URLs are not supported in Cloudflare Workers'
    );
  }

  if (!createNodeClient) {
    const nodeProcess = process as typeof process & {
      getBuiltinModule?: (name: string) => {
        createRequire: (filename: string) => NodeJS.Require;
      };
    };
    const moduleApi = nodeProcess.getBuiltinModule?.('module');
    if (!moduleApi) {
      throw new Error('Local file: SQLite requires Node.js 20.16 or newer');
    }

    const nodeRequire = moduleApi.createRequire(
      `${process.cwd()}/package.json`
    );
    // Keep the native client out of Cloudflare/Turbopack's static dependency
    // graph. This branch is reached only by a local Node process using file:.
    const nodeClientModule = ['@libsql', 'client', 'node'].join('/');
    const nodeClient = nodeRequire(nodeClientModule) as {
      createClient: (clientOptions: ClientOptions) => LibsqlClient;
    };
    createNodeClient = nodeClient.createClient;
  }

  return createNodeClient(options);
}

// get sqlite db instance (works for both local sqlite file:... and turso/libsql://...)
export function getSqliteDb() {
  const databaseUrl = envConfigs.database_url;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not set');
  }

  // custom options
  const options: Record<string, string> = {};
  if (envConfigs.database_auth_token) {
    options.authToken = envConfigs.database_auth_token;
  }

  // In Cloudflare Workers, create new connection each time (avoid cross-request state)
  if (isCloudflareWorker) {
    const client = createSqliteClient({
      url: databaseUrl,
      ...options,
    });
    return drizzle({ client });
  }

  // Singleton mode: reuse existing instance
  if (envConfigs.db_singleton_enabled === 'true') {
    if (sqliteDbInstance) return sqliteDbInstance;

    const client = createSqliteClient({
      url: databaseUrl,
      ...options,
    });
    sqliteDbInstance = drizzle({ client });
    return sqliteDbInstance;
  }

  // Non-singleton mode: create new connection each time
  const client = createSqliteClient({
    url: databaseUrl,
    ...options,
  });
  return drizzle({ client });
}
