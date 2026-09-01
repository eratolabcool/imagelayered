-- WeChat Mini Program V1.1 Step A: identity + session foundation.
-- Applies to SQLite / Turso. Run manually before enabling /api/mini/* routes
-- in any environment whose database has not been synchronized with
-- src/config/db/schema.ts. No destructive changes to existing tables.

CREATE TABLE IF NOT EXISTS mini_program_identity (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  app_id TEXT NOT NULL,
  openid TEXT NOT NULL,
  unionid TEXT,
  created_at INTEGER NOT NULL DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)),
  updated_at INTEGER NOT NULL DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)),
  UNIQUE(app_id, openid)
);

CREATE INDEX IF NOT EXISTS idx_mini_identity_user
  ON mini_program_identity(user_id);
CREATE INDEX IF NOT EXISTS idx_mini_identity_unionid
  ON mini_program_identity(unionid);

CREATE TABLE IF NOT EXISTS mini_program_session (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  identity_id TEXT NOT NULL REFERENCES mini_program_identity(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)),
  last_used_at INTEGER,
  revoked_at INTEGER
);

CREATE INDEX IF NOT EXISTS idx_mini_session_user
  ON mini_program_session(user_id);
CREATE INDEX IF NOT EXISTS idx_mini_session_expires
  ON mini_program_session(expires_at);
