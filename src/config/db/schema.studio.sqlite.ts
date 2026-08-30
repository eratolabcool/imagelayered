import { sql } from 'drizzle-orm';
import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

const sqliteNowMs = sql`(cast((julianday('now') - 2440587.5)*86400000 as integer))`;

export const studioRevision = sqliteTable(
  'studio_revision',
  {
    id: text('id').primaryKey(),
    projectId: text('project_id').notNull(),
    actorKey: text('actor_key').notNull(),
    parentRevisionId: text('parent_revision_id'),
    operationId: text('operation_id'),
    snapshot: text('snapshot').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .default(sqliteNowMs)
      .notNull(),
  },
  (table) => [
    index('idx_studio_revision_project_created').on(
      table.projectId,
      table.createdAt
    ),
    index('idx_studio_revision_actor').on(table.actorKey),
  ]
);

export const studioOperation = sqliteTable(
  'studio_operation',
  {
    id: text('id').primaryKey(),
    projectId: text('project_id').notNull(),
    actorKey: text('actor_key').notNull(),
    type: text('type').notNull(),
    inputRevisionId: text('input_revision_id'),
    targetLayerIds: text('target_layer_ids').notNull().default('[]'),
    prompt: text('prompt'),
    provider: text('provider'),
    model: text('model'),
    status: text('status').notNull(),
    aiTaskId: text('ai_task_id'),
    costCredits: integer('cost_credits'),
    result: text('result'),
    errorCode: text('error_code'),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .default(sqliteNowMs)
      .notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .default(sqliteNowMs)
      .$onUpdate(() => new Date())
      .notNull(),
    completedAt: integer('completed_at', { mode: 'timestamp_ms' }),
  },
  (table) => [
    index('idx_studio_operation_project_created').on(
      table.projectId,
      table.createdAt
    ),
    index('idx_studio_operation_actor_status').on(
      table.actorKey,
      table.status
    ),
    index('idx_studio_operation_ai_task').on(table.aiTaskId),
  ]
);

export const studioGuestUsage = sqliteTable(
  'studio_guest_usage',
  {
    id: text('id').primaryKey(),
    actorKey: text('actor_key').notNull(),
    dayKey: text('day_key').notNull(),
    aiOperations: integer('ai_operations').notNull().default(0),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .default(sqliteNowMs)
      .notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .default(sqliteNowMs)
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index('idx_studio_guest_usage_actor_day').on(table.actorKey, table.dayKey),
  ]
);
