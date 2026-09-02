import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { after, before, test } from 'node:test';

import { and, eq, sql } from 'drizzle-orm';

// ---------------------------------------------------------------------------
// env MUST be set before any `@/` module is imported (all app imports below
// are dynamic so they run after this block).
// ---------------------------------------------------------------------------
const tmpDir = mkdtempSync(path.join(os.tmpdir(), 'mini-step-a-'));
process.env.DATABASE_PROVIDER = 'sqlite';
process.env.DATABASE_URL = `file:${path.join(tmpDir, 'test.db')}`;
process.env.DB_SINGLETON_ENABLED = 'true';
(process.env as any).NODE_ENV = 'development';
process.env.MINI_PROGRAM_WELCOME_CREDITS = '15';
process.env.WECHAT_MINI_APP_ID = 'wx_test_app';
process.env.WECHAT_MINI_APP_SECRET = 'test_secret';

const sha256Hex = (value: string) =>
  createHash('sha256').update(value).digest('hex');
const md5Hex = (bytes: Uint8Array) => createHash('md5').update(bytes).digest('hex');

// Minimal valid PNG magic bytes (upload logic validates header + type only).
const TEST_PNG = new Uint8Array([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x00,
]);

let db: any;
let schema: any;
let envConfigs: any;
let models: any;
let meRoute: any;
let creditsRoute: any;
let miniUploadRoute: any;
let webUploadRoute: any;

const FIRST_OPENID = 'openid-unit-1';
let firstAuth: any = null;

async function login(openid: string, code = 'test-code') {
  return models.authenticateWechatCode(code, async () => ({ openid }));
}

function bearerRequest(url: string, token: string, init?: RequestInit) {
  return new Request(url, {
    ...init,
    headers: { ...(init?.headers || {}), authorization: `Bearer ${token}` },
  });
}

before(async () => {
  db = (await import('@/core/db')).db;
  schema = await import('@/config/db/schema');
  envConfigs = (await import('@/config')).envConfigs;
  models = await import('@/shared/models/mini-identity');
  meRoute = await import('@/app/api/mini/me/route');
  creditsRoute = await import('@/app/api/mini/credits/route');
  miniUploadRoute = await import('@/app/api/mini/uploads/route');
  webUploadRoute = await import('@/app/api/storage/upload-image/route');

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
  // Clean up the local upload file written by tests 10/11.
  const key = `${md5Hex(TEST_PNG)}.png`;
  const uploadPath = path.join(process.cwd(), 'public', 'uploads', key);
  if (existsSync(uploadPath)) rmSync(uploadPath, { force: true });

  rmSync(tmpDir, { recursive: true, force: true });
});

// ---------------------------------------------------------------------------

test('1. first wechat login creates user, identity, session and welcome 15', async () => {
  firstAuth = await login(FIRST_OPENID);

  assert.ok(firstAuth.token.startsWith('min_'));
  assert.equal(firstAuth.isNewUser, true);
  assert.equal(firstAuth.credits.balance, 15);
  assert.equal(firstAuth.welcomeGranted, true);

  // identity exists
  const identity = await models.findMiniIdentity(
    envConfigs.wechat_mini_app_id,
    FIRST_OPENID
  );
  assert.ok(identity, 'identity should exist');
  assert.equal(identity.userId, firstAuth.user.id);

  // user row exists with a synthetic (non-openid-exposing) email
  const [userRow] = await db()
    .select()
    .from(schema.user)
    .where(eq(schema.user.id, firstAuth.user.id))
    .limit(1);
  assert.ok(userRow);
  assert.match(userRow.email, /^mp_[0-9a-f]{64}@wechat\.local$/);
  assert.ok(!userRow.email.includes(FIRST_OPENID));

  // session row exists and stores a hash, not the raw token
  const [session] = await db()
    .select()
    .from(schema.miniProgramSession)
    .where(eq(schema.miniProgramSession.tokenHash, sha256Hex(firstAuth.token)))
    .limit(1);
  assert.ok(session, 'session should exist');
});

test('2. same openid second login reuses user, new session, no second welcome grant', async () => {
  const second = await login(FIRST_OPENID);

  assert.equal(second.user.id, firstAuth.user.id);
  assert.equal(second.isNewUser, false);
  assert.equal(second.credits.balance, 15);
  assert.ok(second.token !== firstAuth.token);

  // two sessions now exist for the same user
  const sessions = await db()
    .select()
    .from(schema.miniProgramSession)
    .where(eq(schema.miniProgramSession.userId, firstAuth.user.id));
  assert.equal(sessions.length, 2);

  // exactly one welcome grant
  const grants = await db()
    .select()
    .from(schema.credit)
    .where(
      and(
        eq(schema.credit.userId, firstAuth.user.id),
        eq(schema.credit.transactionScene, 'mini_program_welcome')
      )
    );
  assert.equal(grants.length, 1);
});

test('3. concurrent welcome grants produce a single transaction', async () => {
  const { identity } = await models.ensureMiniIdentity({
    appId: envConfigs.wechat_mini_app_id,
    openid: 'openid-concurrent-1',
  });

  const [a, b] = await Promise.all([
    models.grantMiniWelcomeCredits({
      userId: identity.userId,
      identityId: identity.id,
    }),
    models.grantMiniWelcomeCredits({
      userId: identity.userId,
      identityId: identity.id,
    }),
  ]);

  assert.equal([a, b].filter((r) => r.granted).length, 1);

  const grants = await db()
    .select()
    .from(schema.credit)
    .where(eq(schema.credit.transactionNo, `mini_welcome:${identity.id}`));
  assert.equal(grants.length, 1);
});

test('4. session DB stores only the token hash', async () => {
  const [session] = await db()
    .select()
    .from(schema.miniProgramSession)
    .where(eq(schema.miniProgramSession.tokenHash, sha256Hex(firstAuth.token)))
    .limit(1);

  assert.ok(session);
  assert.equal(session.tokenHash, sha256Hex(firstAuth.token));
  assert.notEqual(session.tokenHash, firstAuth.token);
  assert.ok(!JSON.stringify(session).includes(firstAuth.token));
});

test('5. expired token is rejected', async () => {
  const identity = await models.findMiniIdentity(
    envConfigs.wechat_mini_app_id,
    FIRST_OPENID
  );
  const { token } = await models.createMiniSession({
    userId: identity.userId,
    identityId: identity.id,
  });

  await db()
    .update(schema.miniProgramSession)
    .set({ expiresAt: new Date(Date.now() - 1000) })
    .where(eq(schema.miniProgramSession.tokenHash, sha256Hex(token)));

  await assert.rejects(
    () => models.verifyMiniToken(token),
    (error: any) => error.code === 40003
  );
});

test('6. revoked token is rejected', async () => {
  const identity = await models.findMiniIdentity(
    envConfigs.wechat_mini_app_id,
    FIRST_OPENID
  );
  const { token } = await models.createMiniSession({
    userId: identity.userId,
    identityId: identity.id,
  });

  await models.revokeMiniSession(token);

  await assert.rejects(
    () => models.verifyMiniToken(token),
    (error: any) => error.code === 40002
  );
});

test('7. /api/mini/me does not expose openid, unionid or session_key', async () => {
  const resp = await meRoute.GET(
    bearerRequest('http://localhost/api/mini/me', firstAuth.token)
  );
  const body = await resp.json();
  const raw = JSON.stringify(body);

  assert.equal(resp.status, 200);
  assert.equal(body.code, 0);
  assert.ok(!raw.includes('openid'));
  assert.ok(!raw.includes('unionid'));
  assert.ok(!raw.includes('session_key'));
  assert.equal(body.data.user.id, firstAuth.user.id);
  assert.ok(body.data.user.name);
  assert.equal(body.data.credits.balance, 15);
  assert.equal(body.data.welcomeGranted, true);
});

test('8. /api/mini/credits reads the existing credit ledger', async () => {
  const resp = await creditsRoute.GET(
    bearerRequest('http://localhost/api/mini/credits', firstAuth.token)
  );
  const body = await resp.json();

  assert.equal(resp.status, 200);
  assert.equal(body.code, 0);
  assert.equal(body.data.currency, 'credits');

  const grants = await db()
    .select()
    .from(schema.credit)
    .where(
      and(
        eq(schema.credit.userId, firstAuth.user.id),
        eq(schema.credit.transactionType, 'grant'),
        eq(schema.credit.status, 'active')
      )
    );
  const ledgerBalance = grants.reduce(
    (total: number, grant: any) => total + grant.remainingCredits,
    0
  );

  assert.equal(body.data.balance, ledgerBalance);
  assert.ok(body.data.recentTransactions.length >= 1);
  assert.equal(
    body.data.recentTransactions[0].transactionScene,
    'mini_program_welcome'
  );
});

test('9. mini upload without token returns 401', async () => {
  const formData = new FormData();
  formData.append(
    'files',
    new File([TEST_PNG], 'no-token.png', { type: 'image/png' })
  );

  const resp = await miniUploadRoute.POST(
    new Request('http://localhost/api/mini/uploads', {
      method: 'POST',
      body: formData,
    })
  );

  assert.equal(resp.status, 401);
});

test('10. mini upload with valid token passes (local storage)', async () => {
  const formData = new FormData();
  formData.append(
    'files',
    new File([TEST_PNG], 'mini.png', { type: 'image/png' })
  );

  const resp = await miniUploadRoute.POST(
    bearerRequest('http://localhost/api/mini/uploads', firstAuth.token, {
      method: 'POST',
      body: formData,
    })
  );

  assert.equal(resp.status, 200);
  const body = await resp.json();
  assert.equal(body.code, 0);
  assert.equal(body.data.urls.length, 1);
  assert.ok(body.data.results[0].url);
  assert.ok(body.data.results[0].key.endsWith('.png'));
});

test('11. web /api/storage/upload-image still works (no regression)', async () => {
  const formData = new FormData();
  formData.append(
    'files',
    new File([TEST_PNG], 'web.png', { type: 'image/png' })
  );

  const resp = await webUploadRoute.POST(
    new Request('http://localhost/api/storage/upload-image', {
      method: 'POST',
      body: formData,
    })
  );

  assert.equal(resp.status, 200);
  const body = await resp.json();
  assert.equal(body.code, 0);
  assert.equal(body.data.urls.length, 1);
  assert.ok(body.data.results[0].key.endsWith('.png'));
  assert.ok(body.data.results[0].url);
});
