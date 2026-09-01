-- Image Layered Studio P0 persistence schema.
-- Apply before enabling /studio in an environment whose database has not been
-- synchronized with src/config/db/schema.ts. This file is intentionally plain
-- SQL so it can be reviewed independently of Drizzle push/generate behavior.

CREATE TABLE IF NOT EXISTS studio_revision (
  id TEXT PRIMARY KEY NOT NULL,
  project_id TEXT NOT NULL,
  actor_key TEXT NOT NULL,
  parent_revision_id TEXT,
  operation_id TEXT,
  snapshot TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer))
);

CREATE INDEX IF NOT EXISTS idx_studio_revision_project_created
  ON studio_revision(project_id, created_at);
CREATE INDEX IF NOT EXISTS idx_studio_revision_actor
  ON studio_revision(actor_key);

CREATE TABLE IF NOT EXISTS studio_operation (
  id TEXT PRIMARY KEY NOT NULL,
  project_id TEXT NOT NULL,
  actor_key TEXT NOT NULL,
  type TEXT NOT NULL,
  input_revision_id TEXT,
  output_revision_id TEXT,
  target_layer_ids TEXT NOT NULL DEFAULT '[]',
  prompt TEXT,
  provider TEXT,
  model TEXT,
  status TEXT NOT NULL,
  ai_task_id TEXT,
  cost_credits INTEGER,
  credit_state TEXT NOT NULL DEFAULT 'none',
  result TEXT,
  error_code TEXT,
  created_at INTEGER NOT NULL DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)),
  updated_at INTEGER NOT NULL DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)),
  completed_at INTEGER
);

CREATE INDEX IF NOT EXISTS idx_studio_operation_project_created
  ON studio_operation(project_id, created_at);
CREATE INDEX IF NOT EXISTS idx_studio_operation_actor_status
  ON studio_operation(actor_key, status);
CREATE INDEX IF NOT EXISTS idx_studio_operation_ai_task
  ON studio_operation(ai_task_id);

CREATE TABLE IF NOT EXISTS studio_guest_usage (
  id TEXT PRIMARY KEY NOT NULL,
  actor_key TEXT NOT NULL,
  day_key TEXT NOT NULL,
  ai_operations INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)),
  updated_at INTEGER NOT NULL DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer))
);

CREATE INDEX IF NOT EXISTS idx_studio_guest_usage_actor_day
  ON studio_guest_usage(actor_key, day_key);
