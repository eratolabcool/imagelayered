CREATE TABLE IF NOT EXISTS project (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  layers TEXT NOT NULL,
  preview_url TEXT,
  created_at INTEGER NOT NULL DEFAULT (cast((julianday('now') - 2440587.5) * 86400000 as integer)),
  updated_at INTEGER NOT NULL DEFAULT (cast((julianday('now') - 2440587.5) * 86400000 as integer))
);

CREATE INDEX IF NOT EXISTS idx_project_user_id ON project(user_id);
CREATE INDEX IF NOT EXISTS idx_project_created_at ON project(created_at);
