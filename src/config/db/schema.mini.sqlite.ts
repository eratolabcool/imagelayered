import { sql } from 'drizzle-orm';
import {
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core';

import { user } from './schema.sqlite';

const sqliteNowMs = sql`(cast((julianday('now') - 2440587.5)*86400000 as integer))`;

/**
 * WeChat Mini Program identity.
 *
 * Maps a WeChat openid (scoped by appId) onto a unified `user` row so the
 * Studio credit ledger, projects and operations keep a single owner. A unique
 * (appId, openid) guarantees one identity per WeChat account, while `unionid`
 * is reserved for future cross-app / Web<->WeChat binding.
 */
export const miniProgramIdentity = sqliteTable(
  'mini_program_identity',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    appId: text('app_id').notNull(),
    openid: text('openid').notNull(),
    unionid: text('unionid'),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .default(sqliteNowMs)
      .notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .default(sqliteNowMs)
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex('idx_mini_identity_app_openid').on(table.appId, table.openid),
    index('idx_mini_identity_user').on(table.userId),
    index('idx_mini_identity_unionid').on(table.unionid),
  ]
);

/**
 * WeChat Mini Program session.
 *
 * Only the SHA-256 hash of the bearer token is persisted; the plaintext token
 * is returned exactly once at login and never stored. `session_key` from
 * code2Session is never stored either.
 */
export const miniProgramSession = sqliteTable(
  'mini_program_session',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    identityId: text('identity_id')
      .notNull()
      .references(() => miniProgramIdentity.id, { onDelete: 'cascade' }),
    tokenHash: text('token_hash').notNull().unique(),
    expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .default(sqliteNowMs)
      .notNull(),
    lastUsedAt: integer('last_used_at', { mode: 'timestamp_ms' }),
    revokedAt: integer('revoked_at', { mode: 'timestamp_ms' }),
  },
  (table) => [
    index('idx_mini_session_user').on(table.userId),
    index('idx_mini_session_expires').on(table.expiresAt),
  ]
);
