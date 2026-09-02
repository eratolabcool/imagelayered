import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtempSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { after, before, test } from 'node:test';

import { and, eq, sql } from 'drizzle-orm';

// ---------------------------------------------------------------------------
// env must be set before any `@/` import (all app imports are dynamic).
// ---------------------------------------------------------------------------
const tmpDir = mkdtempSync(path.join(os.tmpdir(), 'mini-step-c-'));
process.env.DATABASE_PROVIDER = 'sqlite';
process.env.DATABASE_URL = `file:${path.join(tmpDir, 'test.db')}`;
process.env.DB_SINGLETON_ENABLED = 'true';
(process.env as any).NODE_ENV = 'development';
process.env.FAL_API_KEY = 'test-fal-key';
process.env.MINI_PROGRAM_WELCOME_CREDITS = '15';
process.env.WECHAT_MINI_APP_ID = 'wx_test_app';
process.env.WECHAT_MINI_APP_SECRET = 'test_secret';
// KIE intentionally unset -> decomposition falls back to FAL.

let db: any;
let schema: any;
let models: any;
let projects: any;
let revisions: any;
let operations: any;
let studioModels: any;
let creditModel: any;
let miniProjectsRoute: any;
let miniProjectRoute: any;
let miniOperationsRoute: any;
let miniOperationRoute: any;
let miniRevisionsRoute: any;

function urlString(input: any): string {
  if (typeof input === 'string') return input;
  if (input instanceof URL) return input.toString();
  return String(input?.url || input);
}

const sha256Hex = (value: string) =>
  createHash('sha256').update(value).digest('hex');

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function bearer(url: string, token: string, init: RequestInit = {}) {
  return new Request(url, {
    ...init,
    headers: { ...(init.headers || {}), authorization: `Bearer ${token}` },
  });
}

async function createMiniToken(openid: string) {
  return models.authenticateWechatCode(`code-${openid}`, async () => ({ openid }));
}

function installFalMock(
  t: any,
  opts: { statuses?: string[]; resultImages?: unknown[] } = {}
) {
  const statuses = opts.statuses ?? ['COMPLETED'];
  const resultImages = opts.resultImages ?? [];
  let statusIdx = 0;
  const calls: Array<{ url: string; method: string }> = [];

  t.mock.method(globalThis, 'fetch', async (input: any, init: any) => {
    const url = urlString(input);
    const method = init?.method || 'GET';
    calls.push({ url, method });

    if (url.includes('/requests/') && url.endsWith('/status')) {
      const status = statuses[Math.min(statusIdx++, statuses.length - 1)];
      return jsonResponse({ status });
    }
    if (url.includes('/requests/')) {
      return jsonResponse({ images: resultImages });
    }
    // provider generate (POST to the model endpoint)
    return jsonResponse({ request_id: `fal-req-${calls.length}` });
  });

  return calls;
}

before(async () => {
  db = (await import('@/core/db')).db;
  schema = await import('@/config/db/schema');
  models = await import('@/shared/models/mini-identity');
  projects = await import('@/features/studio/server/projects');
  revisions = await import('@/features/studio/server/revisions');
  operations = await import('@/features/studio/server/operations');
  studioModels = await import('@/shared/models/studio');
  creditModel = await import('@/shared/models/credit');
  miniProjectsRoute = await import('@/app/api/mini/projects/route');
  miniProjectRoute = await import('@/app/api/mini/projects/[projectId]/route');
  miniOperationsRoute = await import(
    '@/app/api/mini/projects/[projectId]/operations/route'
  );
  miniOperationRoute = await import('@/app/api/mini/operations/[operationId]/route');
  miniRevisionsRoute = await import(
    '@/app/api/mini/projects/[projectId]/revisions/route'
  );

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

  await d.run(sql`CREATE TABLE IF NOT EXISTS "mini_program_identity" (
    "id" text PRIMARY KEY NOT NULL,
    "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
    "app_id" text NOT NULL,
    "openid" text NOT NULL,
    "unionid" text,
    "created_at" integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
    "updated_at" integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
    UNIQUE("app_id", "openid")
  )`);

  await d.run(sql`CREATE TABLE IF NOT EXISTS "mini_program_session" (
    "id" text PRIMARY KEY NOT NULL,
    "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
    "identity_id" text NOT NULL REFERENCES "mini_program_identity"("id") ON DELETE CASCADE,
    "token_hash" text NOT NULL UNIQUE,
    "expires_at" integer NOT NULL,
    "created_at" integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
    "last_used_at" integer,
    "revoked_at" integer
  )`);
});

after(() => {
  rmSync(tmpDir, { recursive: true, force: true });
});

// ---------------------------------------------------------------------------
// C6 authorization
// ---------------------------------------------------------------------------

test('1. mini token A creates project', async () => {
  const a = await createMiniToken('auth-a');
  const resp = await miniProjectsRoute.POST(
    bearer('http://localhost/api/mini/projects', a.token, {
      method: 'POST',
      body: JSON.stringify({
        title: 'A project',
        width: 100,
        height: 100,
        originalAssetId: 'asset-a',
      }),
    })
  );
  const body = await resp.json();
  assert.equal(resp.status, 200);
  assert.equal(body.code, 0);
  assert.equal(body.data.project.userId, a.user.id);
});

test('2. mini token A lists only own projects', async () => {
  const a = await createMiniToken('list-a');
  const b = await createMiniToken('list-b');

  await miniProjectsRoute.POST(
    bearer('http://localhost/api/mini/projects', a.token, {
      method: 'POST',
      body: JSON.stringify({
        title: 'A1',
        width: 10,
        height: 10,
        originalAssetId: 'a1',
      }),
    })
  );
  await miniProjectsRoute.POST(
    bearer('http://localhost/api/mini/projects', b.token, {
      method: 'POST',
      body: JSON.stringify({
        title: 'B1',
        width: 10,
        height: 10,
        originalAssetId: 'b1',
      }),
    })
  );

  const resp = await miniProjectsRoute.GET(
    bearer('http://localhost/api/mini/projects', a.token)
  );
  const body = await resp.json();
  assert.equal(body.code, 0);
  assert.equal(body.data.length, 1);
  assert.equal(body.data[0].name, 'A1');
});

test('3. token A cannot GET/PATCH token B project', async () => {
  const a = await createMiniToken('iso-a');
  const b = await createMiniToken('iso-b');

  const created = await miniProjectsRoute.POST(
    bearer('http://localhost/api/mini/projects', b.token, {
      method: 'POST',
      body: JSON.stringify({
        title: 'B secret',
        width: 10,
        height: 10,
        originalAssetId: 'b-secret',
      }),
    })
  );
  const projectId = (await created.json()).data.project.id;

  const getResp = await miniProjectRoute.GET(
    bearer(`http://localhost/api/mini/projects/${projectId}`, a.token),
    { params: Promise.resolve({ projectId }) }
  );
  const getBody = await getResp.json();
  assert.equal(getResp.status, 404);
  assert.equal(getBody.code, 40202);

  const patchResp = await miniProjectRoute.PATCH(
    bearer(`http://localhost/api/mini/projects/${projectId}`, a.token, {
      method: 'PATCH',
      body: JSON.stringify({ layers: [] }),
    }),
    { params: Promise.resolve({ projectId }) }
  );
  assert.equal(patchResp.status, 404);
});

test('4. token A cannot access token B operation', async () => {
  const a = await createMiniToken('op-a');
  const b = await createMiniToken('op-b');

  const op = await studioModels.createStudioOperationRecord({
    projectId: 'p1',
    actorKey: `user:${b.user.id}`,
    type: 'replace',
    status: 'queued',
  });

  const resp = await miniOperationRoute.GET(
    bearer(`http://localhost/api/mini/operations/${op.id}`, a.token),
    { params: Promise.resolve({ operationId: op.id }) }
  );
  const body = await resp.json();
  assert.equal(resp.status, 404);
  assert.equal(body.code, 40201);
});

test('5. token A cannot access token B revisions', async () => {
  const a = await createMiniToken('rev-a');
  const b = await createMiniToken('rev-b');

  await revisions.createRevisionForActor(
    { userId: b.user.id, actorKey: `user:${b.user.id}`, guestId: null },
    'proj-b',
    { snapshot: { version: 1 } }
  );

  const resp = await miniRevisionsRoute.GET(
    bearer('http://localhost/api/mini/projects/proj-b/revisions', a.token),
    { params: Promise.resolve({ projectId: 'proj-b' }) }
  );
  const body = await resp.json();
  assert.equal(body.code, 0);
  assert.equal(body.data.length, 0);
});

test('6. forged userId/actorKey in body is ignored', async () => {
  const a = await createMiniToken('forge-a');
  const resp = await miniProjectsRoute.POST(
    bearer('http://localhost/api/mini/projects', a.token, {
      method: 'POST',
      body: JSON.stringify({
        title: 'Forged',
        width: 10,
        height: 10,
        originalAssetId: 'forged',
        userId: 'someone-else',
        actorKey: 'user:someone-else',
      }),
    })
  );
  const body = await resp.json();
  assert.equal(body.code, 0);
  assert.equal(body.data.project.userId, a.user.id);
});

test('7. provider/model injection is rejected', async () => {
  const a = await createMiniToken('inj-a');
  const resp = await miniOperationsRoute.POST(
    bearer('http://localhost/api/mini/projects/p1/operations', a.token, {
      method: 'POST',
      body: JSON.stringify({
        type: 'replace',
        provider: 'fal',
        model: 'bytedance/seedream/v5/pro/edit',
      }),
    }),
    { params: Promise.resolve({ projectId: 'p1' }) }
  );
  const body = await resp.json();
  assert.equal(resp.status, 400);
  assert.equal(body.code, 40000);
});

test('8. no token returns 401 on all routes', async () => {
  const routes = [
    miniProjectsRoute.GET,
    miniProjectsRoute.POST,
    miniProjectRoute.GET,
    miniOperationsRoute.POST,
    miniOperationRoute.GET,
    miniRevisionsRoute.GET,
  ];
  for (const handler of routes) {
    const resp = await handler(
      new Request('http://localhost/api/mini/x', { method: 'GET' }),
      { params: Promise.resolve({ projectId: 'x', operationId: 'y' }) }
    );
    assert.equal(resp.status, 401, `expected 401 for ${handler.name}`);
  }
});

test('9. expired/revoked token returns 401', async () => {
  // expired token
  const a = await createMiniToken('exp-a');
  const identity = await models.findMiniIdentity(
    process.env.WECHAT_MINI_APP_ID,
    'exp-a'
  );
  const sess = await models.createMiniSession({
    userId: identity.userId,
    identityId: identity.id,
  });
  await db()
    .update(schema.miniProgramSession)
    .set({ expiresAt: new Date(Date.now() - 1000) })
    .where(eq(schema.miniProgramSession.tokenHash, sha256Hex(sess.token)));

  await assert.rejects(
    () => models.verifyMiniToken(sess.token),
    (e: any) => e.code === 40003
  );
  const expiredResp = await miniProjectsRoute.GET(
    bearer('http://localhost/api/mini/projects', sess.token)
  );
  assert.equal(expiredResp.status, 401);

  // revoked token
  const a2 = await createMiniToken('rev-r');
  await models.revokeMiniSession(a2.token);
  const revokedResp = await miniProjectsRoute.GET(
    bearer('http://localhost/api/mini/projects', a2.token)
  );
  assert.equal(revokedResp.status, 401);
  assert.equal((await revokedResp.json()).code, 40002);
});

test('10. invalid operation type returns 400', async () => {
  const a = await createMiniToken('type-a');
  const resp = await miniOperationsRoute.POST(
    bearer('http://localhost/api/mini/projects/p1/operations', a.token, {
      method: 'POST',
      body: JSON.stringify({ type: 'upscale', targetLayerIds: [] }),
    }),
    { params: Promise.resolve({ projectId: 'p1' }) }
  );
  const body = await resp.json();
  assert.equal(resp.status, 400);
  assert.equal(body.code, 40200);
});

// ---------------------------------------------------------------------------
// C7 operation contract (mock FAL, no real AI)
// ---------------------------------------------------------------------------

test('11. decompose create -> queued -> running -> succeeded', async (t) => {
  const a = await createMiniToken('lifecycle-a');
  const projectId = 'proj-lifecycle';

  installFalMock(t, { statuses: ['IN_PROGRESS', 'COMPLETED'], resultImages: [] });

  const createResp = await miniOperationsRoute.POST(
    bearer(`http://localhost/api/mini/projects/${projectId}/operations`, a.token, {
      method: 'POST',
      body: JSON.stringify({
        type: 'decompose',
        targetLayerIds: [],
        options: { image_input: ['https://example.com/img.png'] },
      }),
    }),
    { params: Promise.resolve({ projectId }) }
  );
  const created = (await createResp.json()).data;
  assert.equal(created.status, 'queued');
  assert.equal(created.type, 'decompose');

  const runResp = await miniOperationRoute.GET(
    bearer(`http://localhost/api/mini/operations/${created.id}`, a.token),
    { params: Promise.resolve({ operationId: created.id }) }
  );
  assert.equal((await runResp.json()).data.status, 'running');

  const doneResp = await miniOperationRoute.GET(
    bearer(`http://localhost/api/mini/operations/${created.id}`, a.token),
    { params: Promise.resolve({ operationId: created.id }) }
  );
  assert.equal((await doneResp.json()).data.status, 'succeeded');
});

test('12. replace maps to the seedream edit scene', async (t) => {
  const a = await createMiniToken('scene-replace');
  const calls = installFalMock(t, { statuses: ['COMPLETED'], resultImages: [] });

  await miniOperationsRoute.POST(
    bearer('http://localhost/api/mini/projects/p-replace/operations', a.token, {
      method: 'POST',
      body: JSON.stringify({
        type: 'replace',
        targetLayerIds: ['l1'],
        prompt: 'replace it',
        options: { image_input: ['https://example.com/img.png'] },
      }),
    }),
    { params: Promise.resolve({ projectId: 'p-replace' }) }
  );

  const generateUrl = calls.find((c) => c.method === 'POST')?.url || '';
  assert.ok(generateUrl.includes('bytedance/seedream/v5/pro/edit'));
});

test('13. recolor maps to the seedream edit scene', async (t) => {
  const a = await createMiniToken('scene-recolor');
  const calls = installFalMock(t, { statuses: ['COMPLETED'], resultImages: [] });

  await miniOperationsRoute.POST(
    bearer('http://localhost/api/mini/projects/p-recolor/operations', a.token, {
      method: 'POST',
      body: JSON.stringify({
        type: 'recolor',
        targetLayerIds: ['l1'],
        prompt: 'make it blue',
        options: { image_input: ['https://example.com/img.png'] },
      }),
    }),
    { params: Promise.resolve({ projectId: 'p-recolor' }) }
  );

  const generateUrl = calls.find((c) => c.method === 'POST')?.url || '';
  assert.ok(generateUrl.includes('bytedance/seedream/v5/pro/edit'));
});

test('14. remove maps to the seedream edit scene', async (t) => {
  const a = await createMiniToken('scene-remove');
  const calls = installFalMock(t, { statuses: ['COMPLETED'], resultImages: [] });

  await miniOperationsRoute.POST(
    bearer('http://localhost/api/mini/projects/p-remove/operations', a.token, {
      method: 'POST',
      body: JSON.stringify({
        type: 'remove',
        targetLayerIds: ['l1'],
        prompt: 'remove the object',
        options: { image_input: ['https://example.com/img.png'] },
      }),
    }),
    { params: Promise.resolve({ projectId: 'p-remove' }) }
  );

  const generateUrl = calls.find((c) => c.method === 'POST')?.url || '';
  assert.ok(generateUrl.includes('bytedance/seedream/v5/pro/edit'));
});

test('15. insufficient credits returns 402', async () => {
  const a = await createMiniToken('poor-a');
  await db()
    .update(schema.credit)
    .set({ remainingCredits: 0 })
    .where(
      and(
        eq(schema.credit.userId, a.user.id),
        eq(schema.credit.transactionType, 'grant')
      )
    );

  const resp = await miniOperationsRoute.POST(
    bearer('http://localhost/api/mini/projects/p-poor/operations', a.token, {
      method: 'POST',
      body: JSON.stringify({
        type: 'decompose',
        targetLayerIds: [],
        options: { image_input: ['https://example.com/img.png'] },
      }),
    }),
    { params: Promise.resolve({ projectId: 'p-poor' }) }
  );
  const body = await resp.json();
  assert.equal(resp.status, 402);
  assert.equal(body.code, 40100);
});

test('16. sync failure refunds once (shared orchestration path)', async (t) => {
  const a = await createMiniToken('syncfail-a');

  // simulate a charged task that failed synchronously
  const consumed = await creditModel.consumeCredits({
    userId: a.user.id,
    credits: 5,
    scene: 'image-replace',
    description: 'generate image',
  });

  t.mock.method(globalThis, 'fetch', async () =>
    jsonResponse({
      code: 0,
      message: 'ok',
      data: {
        id: 'ai-syncfail',
        status: 'failed',
        creditId: consumed.id,
        costCredits: 5,
      },
    })
  );

  const data = await operations.createOperationForActor(
    { userId: a.user.id, actorKey: `user:${a.user.id}`, guestId: null },
    'p-syncfail',
    { type: 'replace', targetLayerIds: [] },
    operations.webAiDispatcher({ baseUrl: 'http://localhost', cookie: null })
  );

  assert.equal(data.creditState, 'refunded');

  const [consumeRow] = await db()
    .select()
    .from(schema.credit)
    .where(eq(schema.credit.id, consumed.id))
    .limit(1);
  assert.equal(consumeRow.status, 'deleted');

  const grants = await db()
    .select()
    .from(schema.credit)
    .where(
      and(
        eq(schema.credit.userId, a.user.id),
        eq(schema.credit.transactionType, 'grant')
      )
    );
  assert.equal(grants[0].remainingCredits, 15);
});

test('17. async failure poll refunds once', async (t) => {
  const a = await createMiniToken('asyncfail-a');
  installFalMock(t, { statuses: ['FAILED'], resultImages: [] });

  const createResp = await miniOperationsRoute.POST(
    bearer('http://localhost/api/mini/projects/p-asyncfail/operations', a.token, {
      method: 'POST',
      body: JSON.stringify({
        type: 'decompose',
        targetLayerIds: [],
        options: { image_input: ['https://example.com/img.png'] },
      }),
    }),
    { params: Promise.resolve({ projectId: 'p-asyncfail' }) }
  );
  const created = (await createResp.json()).data;

  const pollResp = await miniOperationRoute.GET(
    bearer(`http://localhost/api/mini/operations/${created.id}`, a.token),
    { params: Promise.resolve({ operationId: created.id }) }
  );
  const polled = (await pollResp.json()).data;
  assert.equal(polled.status, 'failed');
  assert.equal(polled.creditState, 'refunded');

  const grants = await db()
    .select()
    .from(schema.credit)
    .where(
      and(
        eq(schema.credit.userId, a.user.id),
        eq(schema.credit.transactionType, 'grant')
      )
    );
  assert.equal(grants[0].remainingCredits, 15);
});

test('18. repeated poll does not double refund', async (t) => {
  const a = await createMiniToken('re-poll-a');
  let queryCalls = 0;

  t.mock.method(globalThis, 'fetch', async (input: any) => {
    const url = urlString(input);
    if (url.includes('/requests/') && url.endsWith('/status')) {
      queryCalls += 1;
      return jsonResponse({ status: 'FAILED' });
    }
    if (url.includes('/requests/')) return jsonResponse({ images: [] });
    return jsonResponse({ request_id: 'fal-req-x' });
  });

  const createResp = await miniOperationsRoute.POST(
    bearer('http://localhost/api/mini/projects/p-repoll/operations', a.token, {
      method: 'POST',
      body: JSON.stringify({
        type: 'decompose',
        targetLayerIds: [],
        options: { image_input: ['https://example.com/img.png'] },
      }),
    }),
    { params: Promise.resolve({ projectId: 'p-repoll' }) }
  );
  const created = (await createResp.json()).data;

  await miniOperationRoute.GET(
    bearer(`http://localhost/api/mini/operations/${created.id}`, a.token),
    { params: Promise.resolve({ operationId: created.id }) }
  );
  await miniOperationRoute.GET(
    bearer(`http://localhost/api/mini/operations/${created.id}`, a.token),
    { params: Promise.resolve({ operationId: created.id }) }
  );

  assert.equal(queryCalls, 1);

  const grants = await db()
    .select()
    .from(schema.credit)
    .where(
      and(
        eq(schema.credit.userId, a.user.id),
        eq(schema.credit.transactionType, 'grant')
      )
    );
  assert.equal(grants[0].remainingCredits, 15);
});

test('19. success result is returned and provider/model are stripped', async (t) => {
  const a = await createMiniToken('success-a');
  installFalMock(t, { statuses: ['COMPLETED'], resultImages: [] });

  const createResp = await miniOperationsRoute.POST(
    bearer('http://localhost/api/mini/projects/p-success/operations', a.token, {
      method: 'POST',
      body: JSON.stringify({
        type: 'replace',
        targetLayerIds: ['l1'],
        prompt: 'replace it',
        options: { image_input: ['https://example.com/img.png'] },
      }),
    }),
    { params: Promise.resolve({ projectId: 'p-success' }) }
  );
  const created = (await createResp.json()).data;
  assert.ok(!('provider' in created), 'provider must be stripped');
  assert.ok(!('model' in created), 'model must be stripped');

  const pollResp = await miniOperationRoute.GET(
    bearer(`http://localhost/api/mini/operations/${created.id}`, a.token),
    { params: Promise.resolve({ operationId: created.id }) }
  );
  const polled = (await pollResp.json()).data;
  assert.equal(polled.status, 'succeeded');
  assert.ok(polled.result, 'result should be present');
  assert.ok(!('provider' in polled));
  assert.ok(!('model' in polled));
});

test('20. operation -> revision link works via mini routes', async () => {
  const a = await createMiniToken('link-a');
  const projectId = 'proj-link';

  const op = await studioModels.createStudioOperationRecord({
    projectId,
    actorKey: `user:${a.user.id}`,
    type: 'replace',
    status: 'succeeded',
  });

  const revResp = await miniRevisionsRoute.POST(
    bearer(`http://localhost/api/mini/projects/${projectId}/revisions`, a.token, {
      method: 'POST',
      body: JSON.stringify({ operationId: op.id, snapshot: { version: 1 } }),
    }),
    { params: Promise.resolve({ projectId }) }
  );
  const revision = (await revResp.json()).data;
  assert.equal(revision.operationId, op.id);

  const [updatedOp] = await db()
    .select()
    .from(schema.studioOperation)
    .where(eq(schema.studioOperation.id, op.id))
    .limit(1);
  assert.equal(updatedOp.outputRevisionId, revision.id);
});
