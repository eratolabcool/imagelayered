import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { mkdtempSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { after, before, test } from 'node:test';

import { and, eq, sql } from 'drizzle-orm';

// ---------------------------------------------------------------------------
// env must be set before any `@/` module import (all app imports are dynamic).
// ---------------------------------------------------------------------------
const tmpDir = mkdtempSync(path.join(os.tmpdir(), 'studio-step-b-'));
process.env.DATABASE_PROVIDER = 'sqlite';
process.env.DATABASE_URL = `file:${path.join(tmpDir, 'test.db')}`;
process.env.DB_SINGLETON_ENABLED = 'true';
(process.env as any).NODE_ENV = 'development';
process.env.FAL_API_KEY = 'test-fal-key';
// KIE intentionally left unset so fallback preconditions are observable.

let db: any;
let schema: any;
let projects: any;
let operations: any;
let revisions: any;
let creditModel: any;
let studioCreditModel: any;
let aiTaskModel: any;
let aiServiceMod: any;
let capabilities: any;

const signedActor = (userId: string) => ({
  userId,
  actorKey: `user:${userId}`,
  guestId: null,
});
const guestActor = () => ({
  userId: null as string | null,
  actorKey: 'guest:g-1',
  guestId: 'g-1',
});

async function createUser(email: string) {
  const id = randomUUID();
  await db()
    .insert(schema.user)
    .values({ id, name: 'Test User', email });
  return id;
}

async function grantCredits(userId: string, amount: number) {
  await db().insert(schema.credit).values({
    id: randomUUID(),
    userId,
    transactionNo: `grant-${randomUUID()}`,
    transactionType: 'grant',
    transactionScene: 'payment',
    credits: amount,
    remainingCredits: amount,
    description: 'test grant',
    status: 'active',
  });
}

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function urlString(input: any): string {
  if (typeof input === 'string') return input;
  if (input instanceof URL) return input.toString();
  return String(input?.url || input);
}

before(async () => {
  db = (await import('@/core/db')).db;
  schema = await import('@/config/db/schema');
  projects = await import('@/features/studio/server/projects');
  operations = await import('@/features/studio/server/operations');
  revisions = await import('@/features/studio/server/revisions');
  creditModel = await import('@/shared/models/credit');
  studioCreditModel = await import('@/shared/models/studio-credit');
  aiTaskModel = await import('@/shared/models/ai_task');
  aiServiceMod = await import('@/shared/services/ai');
  capabilities = await import('@/shared/lib/image-layered-capabilities');

  const d = db();

  await d.run(sql`CREATE TABLE IF NOT EXISTS "user" (
    "id" text PRIMARY KEY NOT NULL,
    "name" text NOT NULL,
    "email" text NOT NULL UNIQUE,
    "email_verified" integer DEFAULT false NOT NULL,
    "image" text,
    "created_at" integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
    "updated_at" integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
    "utm_source" text DEFAULT '' NOT NULL,
    "ip" text DEFAULT '' NOT NULL,
    "locale" text DEFAULT '' NOT NULL
  )`);

  await d.run(sql`CREATE TABLE IF NOT EXISTS "credit" (
    "id" text PRIMARY KEY NOT NULL,
    "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
    "user_email" text,
    "order_no" text,
    "subscription_no" text,
    "transaction_no" text NOT NULL UNIQUE,
    "transaction_type" text NOT NULL,
    "transaction_scene" text,
    "credits" integer NOT NULL,
    "remaining_credits" integer DEFAULT 0 NOT NULL,
    "description" text,
    "expires_at" integer,
    "status" text NOT NULL,
    "created_at" integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
    "updated_at" integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
    "deleted_at" integer,
    "consumed_detail" text,
    "metadata" text
  )`);

  await d.run(sql`CREATE TABLE IF NOT EXISTS "ai_task" (
    "id" text PRIMARY KEY NOT NULL,
    "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
    "media_type" text NOT NULL,
    "provider" text NOT NULL,
    "model" text NOT NULL,
    "prompt" text NOT NULL,
    "options" text,
    "status" text NOT NULL,
    "created_at" integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
    "updated_at" integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
    "deleted_at" integer,
    "task_id" text,
    "task_info" text,
    "task_result" text,
    "cost_credits" integer DEFAULT 0 NOT NULL,
    "scene" text DEFAULT '' NOT NULL,
    "credit_id" text
  )`);

  await d.run(sql`CREATE TABLE IF NOT EXISTS "project" (
    "id" text PRIMARY KEY NOT NULL,
    "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
    "name" text NOT NULL,
    "layers" text NOT NULL,
    "preview_url" text,
    "created_at" integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
    "updated_at" integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL
  )`);

  await d.run(sql`CREATE TABLE IF NOT EXISTS "studio_operation" (
    "id" text PRIMARY KEY NOT NULL,
    "project_id" text NOT NULL,
    "actor_key" text NOT NULL,
    "type" text NOT NULL,
    "input_revision_id" text,
    "output_revision_id" text,
    "target_layer_ids" text DEFAULT '[]' NOT NULL,
    "prompt" text,
    "provider" text,
    "model" text,
    "status" text NOT NULL,
    "ai_task_id" text,
    "cost_credits" integer,
    "credit_state" text DEFAULT 'none' NOT NULL,
    "result" text,
    "error_code" text,
    "created_at" integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
    "updated_at" integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
    "completed_at" integer
  )`);

  await d.run(sql`CREATE TABLE IF NOT EXISTS "studio_revision" (
    "id" text PRIMARY KEY NOT NULL,
    "project_id" text NOT NULL,
    "actor_key" text NOT NULL,
    "parent_revision_id" text,
    "operation_id" text,
    "snapshot" text NOT NULL,
    "created_at" integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL
  )`);
});

after(() => {
  rmSync(tmpDir, { recursive: true, force: true });
});

// ---------------------------------------------------------------------------

test('1. web signed user create project persists', async () => {
  const userId = await createUser('signed@test.local');
  const data = await projects.createProjectForActor(signedActor(userId), {
    title: 'My project',
    width: 512,
    height: 512,
    originalAssetId: 'asset-key-1',
  });

  assert.ok(data.project.id);
  assert.equal(data.project.title, 'My project');
  assert.equal(data.project.userId, userId);
  assert.equal(data.layers.length, 1);
  assert.equal(data.layers[0].source, 'original');

  const rows = await db()
    .select()
    .from(schema.project)
    .where(eq(schema.project.userId, userId));
  assert.equal(rows.length, 1);
  assert.equal(rows[0].name, 'My project');
});

test('2. web guest create project returns in-memory only', async () => {
  const data = await projects.createProjectForActor(guestActor(), {
    title: 'Guest project',
    width: 512,
    height: 512,
    originalAssetId: 'asset-key-2',
  });

  assert.ok(data.project.id);
  assert.equal(data.project.userId, null);
  assert.equal(data.project.title, 'Guest project');

  const rows = await db()
    .select()
    .from(schema.project)
    .where(eq(schema.project.id, data.project.id));
  assert.equal(rows.length, 0);
});

test('3. user A cannot read or modify user B project', async () => {
  const userA = await createUser('a@test.local');
  const userB = await createUser('b@test.local');

  const created = await projects.createProjectForActor(signedActor(userA), {
    title: 'A project',
    width: 256,
    height: 256,
    originalAssetId: 'asset-key-a',
  });

  await assert.rejects(
    () => projects.getProjectForActor(signedActor(userB), created.project.id),
    /Project not found/
  );
  await assert.rejects(
    () =>
      projects.saveProjectForActor(signedActor(userB), created.project.id, {
        layers: [],
      }),
    /Project not found/
  );
});

test('4. createOperation success records charged creditState once', async (t) => {
  const userId = await createUser('charge@test.local');
  const projectId = randomUUID();

  t.mock.method(globalThis, 'fetch', async () =>
    jsonResponse({
      code: 0,
      message: 'ok',
      data: {
        id: 'ai-task-1',
        status: 'success',
        costCredits: 5,
        provider: 'fal',
        model: 'bytedance/seedream/v5/pro/edit',
      },
    })
  );

  const data = await operations.createOperationForActor(
    signedActor(userId),
    projectId,
    { type: 'replace', targetLayerIds: ['layer-1'] },
    { baseUrl: 'http://localhost', cookie: null }
  );

  assert.equal(data.status, 'succeeded');
  assert.equal(data.creditState, 'charged');
  assert.equal(data.costCredits, 5);
  assert.equal(data.provider, 'fal');
  assert.equal(data.model, 'bytedance/seedream/v5/pro/edit');

  const [op] = await db()
    .select()
    .from(schema.studioOperation)
    .where(eq(schema.studioOperation.id, data.id))
    .limit(1);
  assert.equal(op.creditState, 'charged');
  assert.equal(op.costCredits, 5);
});

test('5. createOperation sync failure refunds once (idempotent)', async (t) => {
  const userId = await createUser('refund@test.local');
  await grantCredits(userId, 15);

  // simulate /api/ai/generate having consumed 5 credits
  const consumed = await creditModel.consumeCredits({
    userId,
    credits: 5,
    scene: 'image-replace',
    description: 'generate image',
  });
  const creditId = consumed.id;

  t.mock.method(globalThis, 'fetch', async () =>
    jsonResponse({
      code: 0,
      message: 'ok',
      data: { id: 'ai-task-fail', status: 'failed', creditId, costCredits: 5 },
    })
  );

  const data = await operations.createOperationForActor(
    signedActor(userId),
    randomUUID(),
    { type: 'replace', targetLayerIds: [] },
    { baseUrl: 'http://localhost', cookie: null }
  );

  assert.equal(data.status, 'failed');
  assert.equal(data.creditState, 'refunded');

  // consume marked deleted + grant restored
  const [consumeRow] = await db()
    .select()
    .from(schema.credit)
    .where(eq(schema.credit.id, creditId))
    .limit(1);
  assert.equal(consumeRow.status, 'deleted');

  const grants = await db()
    .select()
    .from(schema.credit)
    .where(
      and(
        eq(schema.credit.userId, userId),
        eq(schema.credit.transactionType, 'grant')
      )
    );
  assert.equal(grants[0].remainingCredits, 15);

  // second refund is a no-op
  const again = await studioCreditModel.refundStudioConsumedCredits(
    creditId,
    userId,
    'studio_image-replace_failed'
  );
  assert.equal(again, false);
  const grantsAfter = await db()
    .select()
    .from(schema.credit)
    .where(
      and(
        eq(schema.credit.userId, userId),
        eq(schema.credit.transactionType, 'grant')
      )
    );
  assert.equal(grantsAfter[0].remainingCredits, 15);
});

test('6. poll async failure sets refunded creditState + errorCode', async (t) => {
  const userId = await createUser('poll-fail@test.local');

  // create a queued operation whose AI task is still running
  t.mock.method(globalThis, 'fetch', async (input: any) => {
    const url = urlString(input);
    if (url.includes('/api/ai/generate')) {
      return jsonResponse({
        code: 0,
        message: 'ok',
        data: { id: 'ai-task-poll', status: 'queued', costCredits: 5 },
      });
    }
    if (url.includes('/api/ai/query')) {
      return jsonResponse({
        code: 0,
        message: 'ok',
        data: {
          status: 'failed',
          taskInfo: JSON.stringify({ errorCode: 'prov_fail' }),
        },
      });
    }
    throw new Error(`unexpected fetch: ${url}`);
  });

  const created = await operations.createOperationForActor(
    signedActor(userId),
    randomUUID(),
    { type: 'recolor', targetLayerIds: [] },
    { baseUrl: 'http://localhost', cookie: null }
  );
  assert.equal(created.status, 'queued');

  const polled = await operations.pollOperationForActor(
    signedActor(userId),
    created.id,
    { baseUrl: 'http://localhost', cookie: null }
  );

  assert.equal(polled.status, 'failed');
  assert.equal(polled.creditState, 'refunded');
  assert.equal(polled.errorCode, 'prov_fail');
});

test('7. repeated poll short-circuits on terminal state (no double refund)', async (t) => {
  const userId = await createUser('poll-twice@test.local');
  let queryCalls = 0;

  t.mock.method(globalThis, 'fetch', async (input: any) => {
    const url = urlString(input);
    if (url.includes('/api/ai/generate')) {
      return jsonResponse({
        code: 0,
        message: 'ok',
        data: { id: 'ai-task-twice', status: 'queued' },
      });
    }
    if (url.includes('/api/ai/query')) {
      queryCalls += 1;
      return jsonResponse({
        code: 0,
        message: 'ok',
        data: { status: 'failed', taskInfo: JSON.stringify({ errorCode: 'e' }) },
      });
    }
    throw new Error(`unexpected fetch: ${url}`);
  });

  const created = await operations.createOperationForActor(
    signedActor(userId),
    randomUUID(),
    { type: 'remove', targetLayerIds: [] },
    { baseUrl: 'http://localhost', cookie: null }
  );

  await operations.pollOperationForActor(signedActor(userId), created.id, {
    baseUrl: 'http://localhost',
    cookie: null,
  });
  const second = await operations.pollOperationForActor(
    signedActor(userId),
    created.id,
    { baseUrl: 'http://localhost', cookie: null }
  );

  assert.equal(queryCalls, 1);
  assert.equal(second.status, 'failed');
  assert.equal(second.creditState, 'refunded');
});

test('8. decomposition fallback precondition: KIE absent -> FAL present', async () => {
  const aiService = await aiServiceMod.getAIService({ fal_api_key: 'test-fal-key' });

  assert.equal(aiService.getProvider('kie'), undefined);
  assert.ok(aiService.getProvider('fal'));

  assert.equal(capabilities.IMAGE_LAYERED_CAPABILITIES.decompose.provider, 'kie');
  assert.equal(
    capabilities.LEGACY_IMAGE_LAYERED_MODELS.decompose,
    'fal-ai/qwen-image-layered'
  );
});

test('9. operation type -> scene mapping unchanged', async (t) => {
  const userId = await createUser('scene@test.local');
  const scenes: Record<string, string> = {};

  t.mock.method(globalThis, 'fetch', async (input: any, init: any) => {
    const url = urlString(input);
    if (url.includes('/api/ai/generate')) {
      const body = JSON.parse(init.body);
      scenes[body.scene] = body.scene;
      return jsonResponse({
        code: 0,
        message: 'ok',
        data: { id: 'ai-task-scene', status: 'queued' },
      });
    }
    throw new Error(`unexpected fetch: ${url}`);
  });

  for (const type of ['decompose', 'replace', 'recolor', 'remove'] as const) {
    await operations.createOperationForActor(
      signedActor(userId),
      randomUUID(),
      { type, targetLayerIds: [] },
      { baseUrl: 'http://localhost', cookie: null }
    );
  }

  assert.deepEqual(scenes, {
    'image-decomposition': 'image-decomposition',
    'image-replace': 'image-replace',
    'image-recolor': 'image-recolor',
    'image-remove': 'image-remove',
  });
});

test('10. revision create and list (newest first, actor isolated)', async () => {
  const userId = await createUser('rev@test.local');
  const projectId = randomUUID();

  const first = await revisions.createRevisionForActor(
    signedActor(userId),
    projectId,
    { snapshot: { version: 1 } }
  );
  // ensure distinct timestamp_ms ordering (list is newest-first by createdAt)
  await new Promise((resolve) => setTimeout(resolve, 5));
  const second = await revisions.createRevisionForActor(
    signedActor(userId),
    projectId,
    { parentRevisionId: first.id, snapshot: { version: 2 } }
  );

  const list = await revisions.listRevisionsForActor(
    signedActor(userId),
    projectId
  );
  assert.equal(list.length, 2);
  assert.equal(list[0].id, second.id); // newest first
  assert.equal(list[0].parentRevisionId, first.id);
  assert.deepEqual(list[0].snapshot, { version: 2 });
});

test('11. createRevision links operation -> outputRevisionId', async () => {
  const userId = await createUser('link@test.local');
  const projectId = randomUUID();
  const operationId = randomUUID();

  await db().insert(schema.studioOperation).values({
    id: operationId,
    projectId,
    actorKey: `user:${userId}`,
    type: 'replace',
    status: 'queued',
    targetLayerIds: '[]',
    creditState: 'none',
  });

  const revision = await revisions.createRevisionForActor(
    signedActor(userId),
    projectId,
    { operationId, snapshot: { version: 3 } }
  );

  assert.equal(revision.operationId, operationId);

  const [op] = await db()
    .select()
    .from(schema.studioOperation)
    .where(eq(schema.studioOperation.id, operationId))
    .limit(1);
  assert.equal(op.outputRevisionId, revision.id);
});

test('12. shared functions preserve the Studio payload contract', async () => {
  const userId = await createUser('contract@test.local');

  // project create
  const created = await projects.createProjectForActor(signedActor(userId), {
    title: 'Contract',
    width: 100,
    height: 200,
    originalAssetId: 'asset-c',
  });
  assert.deepEqual(Object.keys(created.project).sort(), [
    'activeRevisionId',
    'createdAt',
    'height',
    'id',
    'originalAssetId',
    'schemaVersion',
    'status',
    'title',
    'updatedAt',
    'userId',
    'width',
  ].sort());

  // project get/save
  const fetched = await projects.getProjectForActor(
    signedActor(userId),
    created.project.id
  );
  assert.deepEqual(Object.keys(fetched).sort(), ['layers', 'project'].sort());
  assert.equal(fetched.project.id, created.project.id);

  const saved = await projects.saveProjectForActor(
    signedActor(userId),
    created.project.id,
    { layers: created.layers, project: { title: 'Renamed' } }
  );
  assert.equal(saved.project.title, 'Renamed');

  // revision payload
  const revision = await revisions.createRevisionForActor(
    signedActor(userId),
    created.project.id,
    { snapshot: { width: 100, height: 200, layerIds: [], layerState: {} } }
  );
  assert.deepEqual(Object.keys(revision).sort(), [
    'createdAt',
    'id',
    'operationId',
    'parentRevisionId',
    'projectId',
    'snapshot',
  ].sort());
});
