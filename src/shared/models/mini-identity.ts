import { and, eq } from 'drizzle-orm';

import { envConfigs } from '@/config';
import {
  credit,
  miniProgramIdentity,
  miniProgramSession,
  user,
} from '@/config/db/schema';
import { db } from '@/core/db';
import { getUuid } from '@/shared/lib/hash';

import { getRemainingCredits } from './credit';

const WELCOME_SCENE = 'mini_program_welcome';
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export const MINI_ERROR = {
  AUTH_TOKEN_MISSING: 40001,
  AUTH_TOKEN_INVALID: 40002,
  AUTH_TOKEN_EXPIRED: 40003,
  WECHAT_CODE_INVALID: 40010,
  WECHAT_API_ERROR: 40011,
  CREDIT_INSUFFICIENT: 40100,
  OPERATION_INVALID_TYPE: 40200,
  OPERATION_NOT_FOUND: 40201,
  PROJECT_NOT_FOUND: 40202,
  REVISION_INVALID: 40203,
  INTERNAL: 50000,
} as const;

export type MiniAuthErrorCode = (typeof MINI_ERROR)[keyof typeof MINI_ERROR];

export class MiniAuthError extends Error {
  code: MiniAuthErrorCode;
  status: number;

  constructor(code: MiniAuthErrorCode, status: number, message?: string) {
    super(message || String(code));
    this.name = 'MiniAuthError';
    this.code = code;
    this.status = status;
  }
}

export function miniErrorResponse(error: MiniAuthError): Response {
  return Response.json(
    { code: error.code, message: error.message },
    { status: error.status }
  );
}

export type MiniActor = {
  userId: string;
  actorKey: string;
  identityId: string;
};

export type MiniIdentity = typeof miniProgramIdentity.$inferSelect;

export type Code2SessionResult = {
  openid: string;
  unionid?: string;
};

export type Code2SessionFn = (code: string) => Promise<Code2SessionResult>;

// ---------------------------------------------------------------------------
// crypto / token helpers (WebCrypto only, portable across Node and Workers)
// ---------------------------------------------------------------------------

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, '0')
  ).join('');
}

const BASE64URL_ALPHABET =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

function base64UrlEncode(bytes: Uint8Array): string {
  let out = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = bytes[i];
    const b1 = i + 1 < bytes.length ? bytes[i + 1] : 0;
    const b2 = i + 2 < bytes.length ? bytes[i + 2] : 0;
    out += BASE64URL_ALPHABET[b0 >> 2];
    out += BASE64URL_ALPHABET[((b0 & 3) << 4) | (b1 >> 4)];
    if (i + 1 < bytes.length) {
      out += BASE64URL_ALPHABET[((b1 & 15) << 2) | (b2 >> 6)];
    }
    if (i + 2 < bytes.length) {
      out += BASE64URL_ALPHABET[b2 & 63];
    }
  }
  return out;
}

function randomToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return `min_${base64UrlEncode(bytes)}`;
}

/**
 * Deterministic, legal-form synthetic email for WeChat users. Never exposes
 * the openid and always maps the same (appId, openid) to the same address.
 */
export async function syntheticWechatEmail(
  appId: string,
  openid: string
): Promise<string> {
  const digest = await sha256Hex(`${appId}:${openid}`);
  return `mp_${digest}@wechat.local`;
}

// ---------------------------------------------------------------------------
// identity + unified user
// ---------------------------------------------------------------------------

export async function findMiniIdentity(
  appId: string,
  openid: string
): Promise<MiniIdentity | undefined> {
  const [row] = await db()
    .select()
    .from(miniProgramIdentity)
    .where(
      and(
        eq(miniProgramIdentity.appId, appId),
        eq(miniProgramIdentity.openid, openid)
      )
    )
    .limit(1);
  return row;
}

/**
 * Find-or-create the unified user + identity for a WeChat openid. The
 * deterministic synthetic email makes user creation idempotent and the
 * unique(appId, openid) index guards the identity race.
 */
export async function ensureMiniIdentity({
  appId,
  openid,
  unionid,
}: {
  appId: string;
  openid: string;
  unionid?: string;
}): Promise<{ identity: MiniIdentity; created: boolean }> {
  const existing = await findMiniIdentity(appId, openid);
  if (existing) return { identity: existing, created: false };

  const email = await syntheticWechatEmail(appId, openid);

  const [existingUser] = await db()
    .select()
    .from(user)
    .where(eq(user.email, email))
    .limit(1);

  let userId = existingUser?.id;
  if (!userId) {
    const [createdUser] = await db()
      .insert(user)
      .values({ id: getUuid(), name: '微信用户', email })
      .returning({ id: user.id });
    userId = createdUser.id;
  }

  const inserted = await db()
    .insert(miniProgramIdentity)
    .values({
      id: getUuid(),
      userId,
      appId,
      openid,
      unionid: unionid || null,
    })
    .onConflictDoNothing()
    .returning({ id: miniProgramIdentity.id });

  if (inserted.length) {
    return {
      identity: {
        id: inserted[0].id,
        userId,
        appId,
        openid,
        unionid: unionid || null,
      } as MiniIdentity,
      created: true,
    };
  }

  // Lost a concurrent creation race; re-read the winning row.
  const won = await findMiniIdentity(appId, openid);
  if (!won) {
    throw new MiniAuthError(MINI_ERROR.INTERNAL, 500, 'identity creation failed');
  }
  return { identity: won, created: false };
}

// ---------------------------------------------------------------------------
// sessions
// ---------------------------------------------------------------------------

export async function createMiniSession({
  userId,
  identityId,
}: {
  userId: string;
  identityId: string;
}): Promise<{ token: string; expiresAt: Date }> {
  const token = randomToken();
  const tokenHash = await sha256Hex(token);
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await db().insert(miniProgramSession).values({
    id: getUuid(),
    userId,
    identityId,
    tokenHash,
    expiresAt,
    createdAt: new Date(),
  });

  return { token, expiresAt };
}

export async function verifyMiniToken(
  token: string
): Promise<{ userId: string; identityId: string }> {
  if (typeof token !== 'string' || !token.startsWith('min_')) {
    throw new MiniAuthError(MINI_ERROR.AUTH_TOKEN_INVALID, 401);
  }

  const tokenHash = await sha256Hex(token);
  const [row] = await db()
    .select()
    .from(miniProgramSession)
    .where(eq(miniProgramSession.tokenHash, tokenHash))
    .limit(1);

  if (!row) {
    throw new MiniAuthError(MINI_ERROR.AUTH_TOKEN_INVALID, 401);
  }
  if (row.revokedAt) {
    throw new MiniAuthError(MINI_ERROR.AUTH_TOKEN_INVALID, 401);
  }
  if (row.expiresAt.getTime() <= Date.now()) {
    throw new MiniAuthError(MINI_ERROR.AUTH_TOKEN_EXPIRED, 401);
  }

  // best-effort last-used tracking; never block auth on this write
  await db()
    .update(miniProgramSession)
    .set({ lastUsedAt: new Date() })
    .where(eq(miniProgramSession.id, row.id));

  return { userId: row.userId, identityId: row.identityId };
}

export async function revokeMiniSession(token: string): Promise<void> {
  const tokenHash = await sha256Hex(token);
  await db()
    .update(miniProgramSession)
    .set({ revokedAt: new Date() })
    .where(eq(miniProgramSession.tokenHash, tokenHash));
}

export async function getMiniActor(request: Request): Promise<MiniActor> {
  const header = request.headers.get('authorization') || '';
  const match = header.match(/^Bearer\s+(.+)$/i);
  const token = match ? match[1].trim() : null;

  if (!token) {
    throw new MiniAuthError(MINI_ERROR.AUTH_TOKEN_MISSING, 401);
  }

  const session = await verifyMiniToken(token);
  return {
    userId: session.userId,
    actorKey: `user:${session.userId}`,
    identityId: session.identityId,
  };
}

// ---------------------------------------------------------------------------
// welcome credits (reuses the existing credit ledger, idempotent)
// ---------------------------------------------------------------------------

export async function getMiniWelcomeCreditsAmount(): Promise<number> {
  const parsed = parseInt(envConfigs.mini_program_welcome_credits, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 15;
}

export async function grantMiniWelcomeCredits({
  userId,
  userEmail,
  identityId,
}: {
  userId: string;
  userEmail?: string | null;
  identityId: string;
}): Promise<{ granted: boolean; amount: number }> {
  const amount = await getMiniWelcomeCreditsAmount();
  const transactionNo = `mini_welcome:${identityId}`;

  const inserted = await db()
    .insert(credit)
    .values({
      id: getUuid(),
      userId,
      userEmail: userEmail || null,
      transactionNo,
      transactionType: 'grant',
      transactionScene: WELCOME_SCENE,
      credits: amount,
      remainingCredits: amount,
      description: '微信小程序新用户赠送额度',
      expiresAt: null,
      status: 'active',
      metadata: JSON.stringify({
        source: WELCOME_SCENE,
        identityId,
      }),
    })
    .onConflictDoNothing()
    .returning({ id: credit.id });

  return { granted: inserted.length > 0, amount };
}

export async function hasMiniWelcomeGrant(identityId: string): Promise<boolean> {
  const [row] = await db()
    .select({ id: credit.id })
    .from(credit)
    .where(eq(credit.transactionNo, `mini_welcome:${identityId}`))
    .limit(1);
  return !!row;
}

// ---------------------------------------------------------------------------
// code2Session + login orchestration
// ---------------------------------------------------------------------------

/**
 * Real WeChat code2Session. The returned `session_key` is intentionally
 * discarded (never returned, stored, or logged) — the MVP only needs openid.
 */
export async function wechatCode2Session(code: string): Promise<Code2SessionResult> {
  const appId = envConfigs.wechat_mini_app_id;
  const secret = envConfigs.wechat_mini_app_secret;

  if (!appId || !secret) {
    throw new MiniAuthError(
      MINI_ERROR.WECHAT_API_ERROR,
      502,
      'wechat mini program is not configured'
    );
  }

  const url = new URL('https://api.weixin.qq.com/sns/jscode2session');
  url.searchParams.set('appid', appId);
  url.searchParams.set('secret', secret);
  url.searchParams.set('js_code', code);
  url.searchParams.set('grant_type', 'authorization_code');

  const resp = await fetch(url);
  if (!resp.ok) {
    throw new MiniAuthError(MINI_ERROR.WECHAT_API_ERROR, 502);
  }

  const data = await resp.json();
  if (data.errcode) {
    throw new MiniAuthError(
      MINI_ERROR.WECHAT_CODE_INVALID,
      400,
      data.errmsg || 'wechat code invalid'
    );
  }
  if (!data.openid) {
    throw new MiniAuthError(
      MINI_ERROR.WECHAT_API_ERROR,
      502,
      'wechat code2session returned no openid'
    );
  }

  return { openid: data.openid, unionid: data.unionid || undefined };
}

export async function authenticateWechatCode(
  code: string,
  code2SessionFn: Code2SessionFn = wechatCode2Session
): Promise<{
  token: string;
  expiresAt: string;
  isNewUser: boolean;
  welcomeGranted: boolean;
  user: { id: string; name: string };
  credits: { balance: number };
}> {
  if (!code || typeof code !== 'string') {
    throw new MiniAuthError(MINI_ERROR.WECHAT_CODE_INVALID, 400, 'code is required');
  }

  const { openid, unionid } = await code2SessionFn(code);
  const appId = envConfigs.wechat_mini_app_id || 'wechat-mini';

  const { identity, created } = await ensureMiniIdentity({ appId, openid, unionid });

  const [userRow] = await db()
    .select()
    .from(user)
    .where(eq(user.id, identity.userId))
    .limit(1);

  await grantMiniWelcomeCredits({
    userId: identity.userId,
    userEmail: userRow?.email,
    identityId: identity.id,
  });

  const { token, expiresAt } = await createMiniSession({
    userId: identity.userId,
    identityId: identity.id,
  });

  const balance = await getRemainingCredits(identity.userId);

  return {
    token,
    expiresAt: expiresAt.toISOString(),
    isNewUser: created,
    welcomeGranted: true,
    user: { id: identity.userId, name: userRow?.name ?? '微信用户' },
    credits: { balance },
  };
}
