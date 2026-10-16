# Image Layered 微信小程序 V1.1 — 后端接入审计与设计

> 阶段：审计 + 设计（不修改生产代码，不部署，不迁移生产库，不调用真实 AI，不真实支付）。
> 仓库：`eratolabcool/imagelayered`，审计基线：`feat/layer-studio-p0`（= `main` 当前内容）。

---

## 0. 结论摘要（TL;DR）

1. **现有 Studio 后端已经完成了小程序需要的 90% 能力**：Project / Operation / Revision / AI Router / credit ledger / charge-refund-idempotency / R2 storage / FAL-KIE 能力路由全部已存在且经过 P0 验证。
2. **唯一真正缺失的是「微信身份 → 现有 user/actor 体系」的桥接**，以及一个**不依赖 Cookie 的令牌（Bearer token）认证通道**。其余都应通过「复用现有 server 函数 + 薄 adapter 路由」实现，而不是重写。
3. **绝对不需要**：第二套 credits ledger、第二套 AI provider 抽象、第二套 Studio operation 系统、客户端可信余额、小程序专属 AI billing。审计确认现有能力可以直接承载这些职责。
4. 关键风险点：
   - `user.email` 是 `NOT NULL UNIQUE`，微信用户没有邮箱 → 需要合成占位邮箱。
   - 现有欢迎额度 3 与现有单次 decompose 成本 5 存在**数量级冲突**（详见 §3）。
   - 现有 AI 生命周期是**轮询式**（`/api/ai/query`），`callbackUrl` 指向的 `/api/ai/notify/[provider]` 路由**在当前代码中不存在**（死链路）。小程序应走轮询，不依赖回调。

---

## 1. STEP 1 — 现有真实 API 审计

### 1.1 运行时与基础设施

| 组件 | 现状 |
|---|---|
| 框架 | Next.js 16 + OpenNext Cloudflare adapter |
| 生产 DB | `DATABASE_PROVIDER=turso`（libSQL，URL + auth token），`wrangler.jsonc` |
| 预览 DB | `DATABASE_PROVIDER=d1`（`wrangler.preview.jsonc`，D1 binding `DB`） |
| DB 抽象 | `db()` 返回 any，带 sqlite(turso)/d1/mysql/pg 兼容 shim；D1 走 `getD1Db()` + `batch` 原子写入 |
| 认证 | Better Auth（drizzle adapter），Cookie 会话 `better-auth.session_token`，邮箱/密码 + Google/GitHub OAuth |
| 存储 | `StorageManager`：Local(dev) / `R2Provider`(S3 API + aws4fetch) / `CloudflareR2Provider`(D1 模式 STORAGE binding) / S3 |
| AI | `AIManager`：Kie / Replicate / Fal / Gemini / OpenRouter |
| 能力路由 | `IMAGE_LAYERED_CAPABILITIES` + config 表 `layer_decomposition_provider/model`、`poster_edit_provider/model` |
| Credit | 单表 `credit` ledger（grant/consume，FIFO），`getRemainingCredits` / `consumeCredits` / `refundStudioConsumedCredits`，D1 变体 `d1-studio-credit.ts` |

### 1.2 Studio / AI / Storage / Credit API 清单

| # | 端点 | 鉴权 | 说明 |
|---|---|---|---|
| 1 | `POST /api/studio/projects` | guest 或 user | 创建 project（`userId=null` 时仅内存返回不落库） |
| 2 | `GET /api/studio/projects/:id` | user（`getSignUser`） | 读取 project + layers |
| 3 | `PATCH /api/studio/projects/:id` | user | 保存 layers（≤250 层） |
| 4 | `POST /api/studio/projects/:id/operations` | guest 或 user（`getStudioActor`） | 创建 AI operation → 内部转发 `/api/ai/generate` → 记 `studio_operation` |
| 5 | `GET /api/studio/operations/:id` | guest 或 user | 轮询 operation，内部转发 `/api/ai/query` |
| 6 | `GET /api/studio/projects/:id/revisions` | guest 或 user | 列 revisions |
| 7 | `POST /api/studio/projects/:id/revisions` | guest 或 user | 建 revision（snapshot ≤ 2MB） |
| 8 | `POST /api/ai/generate` | user 或 guest-quota | 建 AI task；user 路径校验余额 → generate → `createAITask` 事务扣费；guest 走 `consumeStudioGuestAIQuota` |
| 9 | `POST /api/ai/query` | user（或 `guest-` 前缀） | 轮询 AI task；失败时 `refundStudioConsumedCredits` |
| 10 | `POST /api/storage/upload-image` | 无鉴权 | multipart `files[]`，md5 去重，R2，25MB/文件、50MB/批、8 文件上限 |
| 11 | `GET /api/storage/files/[...key]` | 无鉴权 | 一/三方 URL 读取（Cloudflare binding / 公开域） |
| 12 | `POST|GET /api/storage/proxy-image` | 无鉴权 | 远程图片转 dataURI / 直返 |
| 13 | `POST /api/credits/consume` | user（Cookie） | FIFO 消费（**仅供服务端/管理使用，小程序绝不可用**） |
| 14 | `GET|POST /api/credits` | user（Cookie） | 余额 + 最近交易 / 手动 grant |
| 15 | `POST /api/user/get-user-credits` | user（Cookie） | 返回 `remainingCredits` |
| 16 | `GET /api/projects` | user（Cookie） | 列 legacy projects |
| 17 | `POST /api/projects` | user（Cookie） | legacy project upsert |
| 18 | `GET /api/projects/share?id=` | 无鉴权 | 公开分享 project |

### 1.3 Studio 身份模型

- `getStudioActor()`（`src/features/studio/server/identity.ts`）：
  - 已登录 → `{ actorKey: 'user:<id>', userId, guestId: null }`
  - 未登录 → `{ actorKey: 'guest:<uuid>', userId: null, guestId }`（Cookie `image_layered_studio_guest`）
- `getSignUser()`：`getAuth().api.getSession({ headers })` → `session.user`（Better Auth Cookie）。

### 1.4 现有 credit 计费单价（`/api/ai/generate` 硬编码）

| scene | costCredits |
|---|---|
| image-decomposition（decompose） | **5** |
| image-recolor（recolor） | 3 |
| image-replace（replace） | 4 |
| image-remove（remove） | 3 |

### 1.5 能力路由（已实现，无需新增）

- decompose → `IMAGE_LAYERED_CAPABILITIES.decompose` = `kie` / `seedream/5-pro-layer-decomposition`；若 `configs.layer_decomposition_model` 未配置或为 legacy 值，则用首选；若首选 provider 未注册且 fal 可用，**自动回退** `fal` / `fal-ai/qwen-image-layered`（见 `/api/ai/generate` 的回退逻辑，已存在）。
- replace/recolor/remove → `IMAGE_LAYERED_CAPABILITIES.editLayer` = `fal` / `bytedance/seedream/v5/pro/edit`（`poster_edit_provider/model` 可覆盖）。

### 1.6 Existing API → Mini Program requirement 映射

| 现有能力 | 小程序需求 | 直接复用 | 需要 adapter | 需要新增 |
|---|---|---|---|---|
| Studio Project（project 表 + `/api/studio/projects`） | 小程序建/读/存 project | ✅ 数据与 payload 逻辑 | ✅ token→user 上下文 | — |
| Studio Operation（studio_operation + operation 生命周期） | 小程序发起/轮询 AI 编辑 | ✅ 模型与编排 | ✅ 抽出共享 server 函数 | — |
| Studio Revision | 历史/撤销 | ✅ 模型与路由逻辑 | ✅ 同 operation | — |
| `/api/ai/generate` + capability router | 语义化 decompose/replace/recolor/remove | ✅ 全量复用 | ✅ 从共享函数直调（去掉 Cookie hop） | — |
| `/api/ai/query` | 轮询 | ✅ 全量复用 | ✅ 同上 | — |
| `/api/storage/upload-image`（R2） | 小程序上传 | ✅ 直接复用（`wx.uploadFile` multipart） | — | — |
| Better Auth user 模型 | 统一 user | ✅ 复用 user 表 | ✅ 合成邮箱创建 | ✅ `mini_program_identity` + `mini_program_session` |
| credit ledger（grant/consume/refund + idempotency） | 余额 + 欢迎额度 + 扣费 | ✅ 全量复用 | ✅ 欢迎 grant 复用 `transactionNo` 唯一约束做幂等 | — |
| R2 provider（R2 / CloudflareR2Provider） | 图床 | ✅ 全量复用 | — | — |
| guest/auth identity（`getStudioActor`） | 小程序身份 | ✅ actor 语义复用 | ✅ 新增 token→actor 解析 | ✅ token 会话表 |
| capability router | provider/model 由服务端决定 | ✅ 全量复用 | — | — |

**结论**：没有任何「需要全新实现」的业务能力，只有 3 个「新增数据/认证」件（identity、session、welcome grant 幂等键）和 1 个「抽取共享 server 函数」的 refactor。

---

## 2. STEP 2 — 微信身份模型

### 2.1 表设计 `mini_program_identity`

```sql
CREATE TABLE mini_program_identity (
  id         TEXT PRIMARY KEY NOT NULL,
  user_id    TEXT NOT NULL,              -- FK -> user.id
  app_id     TEXT NOT NULL,
  openid     TEXT NOT NULL,
  unionid    TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch_ms()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch_ms()),
  UNIQUE(app_id, openid),
  FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);
CREATE INDEX idx_mini_identity_user ON mini_program_identity(user_id);
CREATE INDEX idx_mini_identity_unionid ON mini_program_identity(unionid);
```

Drizzle 字段（对齐现有 `schema.studio.sqlite.ts` 风格，`integer({mode:'timestamp_ms'})`）：

```ts
export const miniProgramIdentity = sqliteTable('mini_program_identity', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  appId: text('app_id').notNull(),
  openid: text('openid').notNull(),
  unionid: text('unionid'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).default(sqliteNowMs).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).default(sqliteNowMs).$onUpdate(() => new Date()).notNull(),
}, (t) => [
  uniqueIndex('idx_mini_identity_app_openid').on(t.appId, t.openid),
  index('idx_mini_identity_user').on(t.userId),
  index('idx_mini_identity_unionid').on(t.unionid),
]);
```

- `unique(appId, openid)` 保证同一小程序同一微信用户唯一。
- `unionid` 可空，用于未来跨小程序/公众号绑定；同一开放平台账号下 unionid 一致。

### 2.2 会话表 `mini_program_session`

```sql
CREATE TABLE mini_program_session (
  id          TEXT PRIMARY KEY NOT NULL,
  user_id     TEXT NOT NULL,
  identity_id TEXT NOT NULL,
  token_hash  TEXT NOT NULL UNIQUE,       -- SHA-256(token)，永不存明文
  expires_at  INTEGER NOT NULL,
  created_at  INTEGER NOT NULL DEFAULT (unixepoch_ms()),
  last_used_at INTEGER,
  revoked_at  INTEGER,
  FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
  FOREIGN KEY (identity_id) REFERENCES mini_program_identity(id) ON DELETE CASCADE
);
CREATE INDEX idx_mini_session_user ON mini_program_session(user_id);
CREATE INDEX idx_mini_session_expires ON mini_program_session(expires_at);
```

- token 形如 `min_<base64url(32B random)>`，只返回一次，落库只存 SHA-256。
- 校验：查 `token_hash` → 检查 `revoked_at IS NULL` 且 `expires_at > now` → 更新 `last_used_at`。

### 2.3 微信登录流（`POST /api/mini/auth/wechat`）

```
小程序 wx.login() → code
  → POST /api/mini/auth/wechat  { code }
  → server GET https://api.weixin.qq.com/sns/jscode2session
      ?appid=<WECHAT_MINI_APP_ID>&secret=<WECHAT_MINI_APP_SECRET>
      &js_code=<code>&grant_type=authorization_code
  → { openid, session_key, unionid? } 或 { errcode, errmsg }
  → 查 mini_program_identity WHERE (app_id, openid)
      ├─ 有 → 取 userId
      └─ 无 → 创建统一 user（合成邮箱）→ 创建 identity → 发 welcome grant（幂等）
  → 创建 mini_program_session → 返回 { token, user, credits }
```

**关键点**：

- **绝不返回 `session_key`**。MVP 只依赖 openid，`session_key` 直接丢弃；若未来要解密手机号/`getUserProfile` 加密数据，需将其加密落库（本期不做，列为后续项）。
- **统一 user 的合成邮箱**：`user.email` 是 `NOT NULL UNIQUE`，微信无邮箱。用确定性占位地址：
  `miniprogram:<appId>:<openid>@wechat.local`
  - 优点：确定性（同 openid 重登录幂等）、唯一、永不与真实邮箱冲突、不会被 Better Auth 邮件流程命中（我们走 drizzle 直插，不触发 `databaseHooks.user.create`）。
  - 备注：该邮箱不对外展示，不做验证。
- **创建 user 直插 drizzle**，绕过 Better Auth（不触发其 create hook），因此 welcome grant / role 由小程序侧代码显式处理。
- `name`：`微信用户`（或 `微信用户-<openid 后 6 位>`）。
- **未来 Web ↔ WeChat bind**：`mini_program_identity.user_id` 本就可指向任意 user。绑定流 = 已登录 Web user（Better Auth session）调用 `POST /api/mini/bind` 带上 `code`，把该 identity 的 `user_id` 更新为当前 Web user（需校验该 identity 未被他人绑定）。`unionid` 用于跨应用合并身份。本期仅预留，不实现。

---

## 3. STEP 3 — 新用户 3 次额度（welcome grant）

### 3.1 规则

- 客户端 `localStorage` **不再发额度**（现有 `qwen_guest_usage` / `studio_guest_usage` 与小程序无关，且小程序走的是真实 user，不走 guest 配额）。
- 首次创建 `mini_program_identity` 后，服务端发放 welcome grant，`transaction_scene = 'mini_program_welcome'`，metadata 记录 `{ source:'mini_program_welcome', identityId, appId, openid }`。
- **幂等**：复用 credit 表已有的 `transaction_no UNIQUE` 约束，用**确定性 transactionNo** 实现幂等，无需新列、无需第二套账本：

```ts
const transactionNo = `mini_welcome:${identityId}`;
await db().insert(credit).values({
  id: getUuid(),
  userId,
  userEmail: user.email,
  transactionNo,                       // 唯一约束 → 天然幂等
  transactionType: 'grant',
  transactionScene: 'mini_program_welcome',
  credits: WELCOME_CREDITS,
  remainingCredits: WELCOME_CREDITS,
  description: '微信小程序新用户赠送额度',
  expiresAt: null,                     // 永不失效（或按产品策略设窗口）
  status: 'active',
  metadata: JSON.stringify({ source: 'mini_program_welcome', identityId }),
}).onConflictDoNothing();              // 冲突 = 已领过，静默跳过
```

- 同一微信 identity 永远只能领一次（`transactionNo` 以 identityId 为键）。

### 3.2 ⚠️ 数量级冲突（必须在编码前决策）

现有单次 **decompose = 5 credits**，而需求说「welcome grant = 3」。**3 credits 连一次 decompose 都不够**（首次体验 = 直接 `insufficient credits`）。

建议（三选一，推荐 A）：

- **A（推荐）**：welcome grant 数量改为可配置 `MINI_PROGRAM_WELCOME_CREDITS`，默认 **15**（= 3 × 最贵的 decompose），兑现「3 次」承诺；replace/recolor/remove 便宜时自然可多试。
- **B**：保持 3，但产品语义改为「3 次轻量操作（recolor/remove）」；decompose 需要额外充值。
- **C**：引入「3 次免费操作券」机制 —— 但这是第二套额度，违反约束，**不采纳**。

本设计按 **A** 落地，量值通过 config/env 可调，不在代码硬编码 3。

### 3.3 与现有 `initial_credits_enabled` 的关系

- 现有 `grantCreditsForNewUser`（Better Auth `user.create.after` hook）对小程序直插 user 不生效（绕过 hook），因此 welcome grant 由小程序创建流程**显式调用**，两者互不干扰。
- 若产品同时想给小程序用户叠加「初始额度」，应显式调用 `grantCreditsForUser`，但仍复用同一 ledger。

---

## 4. STEP 4 — Mini Program API Adapter

### 4.1 设计原则

- **不机械照抄路径**。凡现有 Studio 路由可安全复用，就直接复用；只有需要「token 认证」或「裁剪返回」的地方才加薄 adapter。
- 小程序全部请求带 `Authorization: Bearer <token>`，服务端统一 `getMiniActor(request)` → `{ userId, actorKey: 'user:<id>' }`。
- **关键 refactor**：把 operation 编排从现有路由抽出为共享 server 函数，cookie 路由与 mini 路由共用一份实现，消除「内部 HTTP 转发 + Cookie 传递」这条脆弱链路。

### 4.2 建议暴露的路由

| 方法 | 路径 | 认证 | 实现方式 |
|---|---|---|---|
| POST | `/api/mini/auth/wechat` | 无 | 新增（code2Session + 建身份 + 建会话 + welcome） |
| GET | `/api/mini/me` | Bearer | 新增（薄读 user + identity + credits） |
| GET | `/api/mini/credits` | Bearer | 新增（薄读 `getRemainingCredits` + 最近交易，**只读**） |
| POST | `/api/mini/uploads` | Bearer | 薄包装 `/api/storage/upload-image` 逻辑（token 校验 + 复用 `getStorageService`） |
| POST | `/api/mini/projects` | Bearer | 复用 `createStudioProject` 逻辑（actor=user） |
| GET | `/api/mini/projects` | Bearer | 列项目（复用 project 查询） |
| GET | `/api/mini/projects/:id` | Bearer | 复用 `toStudioPayload` |
| PATCH | `/api/mini/projects/:id` | Bearer | 复用保存逻辑 |
| POST | `/api/mini/projects/:id/operations` | Bearer | 复用 `createStudioOperation`（共享函数） |
| GET | `/api/mini/operations/:id` | Bearer | 复用 `pollStudioOperation`（共享函数） |
| GET | `/api/mini/projects/:id/revisions` | Bearer | 复用 revision 查询 |
| POST | `/api/mini/projects/:id/revisions` | Bearer | 复用 revision 创建 |

**不需要小程序专用**：`/api/credits/consume`（客户端禁止）、`/api/credits` POST（手动 grant，管理端）、`/api/projects`（legacy，已有）。

### 4.3 与现有 `/api/studio/*` 的关系

- 现有 `/api/studio/*` 路由**保持不变**（Web 端继续用 Cookie/guest）。
- 新增 `src/features/studio/server/operations.ts`（或 `studio-actions.ts`）承载：
  - `createProjectForActor(actor, input)`
  - `saveProjectForActor(actor, projectId, body)`
  - `createOperationForActor(actor, projectId, body)` ← 现 `operations/route.ts` 的 POST 主体
  - `pollOperationForActor(actor, operationId)` ← 现 `operations/[operationId]/route.ts` 的 GET 主体
  - revision 列表/创建
- 现有 `/api/studio/*` 与 `/api/mini/*` 都调用这些函数；差异只在「如何得到 actor」（cookie vs token）。

---

## 5. STEP 5 — AI（能力路由）

- **小程序不传 provider/model**，只传语义 `type ∈ { decompose, replace, recolor, remove }`（对齐 `sceneByOperation`）。
- 后端 `/api/ai/generate` 已有能力路由：
  - decompose：首选 `kie / seedream/5-pro-layer-decomposition`；**KIE 缺失时已自动回退** `fal / fal-ai/qwen-image-layered`（代码已实现，见 `image-decomposition` 分支 + fallback 分支）。
  - replace/recolor/remove：`fal / bytedance/seedream/v5/pro/edit`。
- **不需要新建第二套 Seedream provider**。`FalProvider` 已支持该模型（`formatInput` 有专门分支，`getQueryModel` 处理了版本化提交 vs 规范查询路径的差异）。
- 因此 STEP 5 无需新代码，只需保证 mini operation 请求里 `type` 正确映射到 `scene`，且**不透传任何 provider/model 字段**给客户端选择。

---

## 6. STEP 6 — Credits（charge / refund / idempotency）

复用现有已验证链路，客户端**不执行 consume**：

```
POST /api/mini/projects/:id/operations
  → 校验 actor（user）
  → createStudioOperationRecord(..., creditState='none')   // 先记账
  → 调共享 AI 编排（等价于现有 /api/ai/generate 非 guest 路径）：
        getRemainingCredits(user.id) < costCredits → 抛 insufficient credits
        aiProvider.generate(...)
        createAITask(...)  ← 事务内 consumeCredits + 记 creditId（SQLite/PG 事务；D1 走 batch 原子）
  → 若同步失败 → refundStudioConsumedCredits(creditId, userId, 'studio_<scene>_failed')
  → 更新 studio_operation(creditState: charged / refunded / released)
```

轮询：

```
GET /api/mini/operations/:id
  → findStudioOperationForActor
  → 未完成 → 查询 provider task → 若 FAILED 且 creditId → refundStudioConsumedCredits
  → 幂等：refund 内部先把 consume 记录置 deleted，重试/重复轮询安全（现有逻辑已验证）
```

**明确禁止**：小程序客户端调用 `/api/credits/consume`；余额仅服务端 `getRemainingCredits` 权威。

---

## 7. STEP 7 — Storage（小程序上传）

### 7.1 推荐：直接复用第一方 multipart 上传（**不要 presigned PUT**）

- 现有 `POST /api/storage/upload-image` 就是 `multipart/form-data`（字段名 `files`），与微信 `wx.uploadFile` 原生对齐。
- 后端已做：类型校验（`isAllowedImageType` + magic bytes）、大小限制（25MB/文件、50MB/批、8 文件）、md5 去重、R2 上传。
- **推荐 contract**：小程序用 `wx.uploadFile({ url: '<app_url>/api/storage/upload-image', name: 'files', filePath })`，无需签名、无需 PUT。

### 7.2 是否要 `/api/mini/uploads` wrapper

- 纯功能上**不需要**，可直接复用 `/api/storage/upload-image`（当前无鉴权）。
- 建议加 `/api/mini/uploads`（Bearer）的理由：上传与用户/额度审计绑定、防止匿名刷图床。wrapper 内部复用同一 `getStorageService` + `_lib/image-security`，不复制逻辑。

### 7.3 上传返回（现有一致）

```json
{ "code": 0, "message": "ok", "data": {
    "urls": ["https://.../uploads/<md5>.png"],
    "results": [{ "url": "...", "key": "<md5>.png", "filename": "x.png", "deduped": false }]
} }
```

小程序拿到 `results[0].url` 作为 `originalUrl` / `originalAssetId` 传给 `POST /api/mini/projects`。

---

## 8. STEP 8 — 真实契约

### 8.1 通用信封

```json
{ "code": 0, "message": "ok", "data": <T> }
```

- `code === 0` 成功；非 0 失败。
- 认证失败返回 HTTP 401 + `code=40001..40003`；业务错误通常 HTTP 200 + 负 `code`（对齐现有 `respErr`），额度不足 HTTP 402。

### 8.2 Auth / Session

#### `POST /api/mini/auth/wechat`

请求（无鉴权）：

```json
{ "code": "0a3..." }
```

响应 200：

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "token": "min_xxxx",
    "expiresAt": "2026-02-01T00:00:00.000Z",
    "isNewUser": true,
    "user": { "id": "uuid", "name": "微信用户" },
    "credits": { "balance": 15 }
  }
}
```

后续请求统一头：`Authorization: Bearer min_xxxx`。

#### `GET /api/mini/me`

```json
{
  "code": 0, "message": "ok",
  "data": {
    "user": { "id": "uuid", "name": "微信用户" },
    "identity": { "appId": "wx123", "openid": "oXXXX", "unionid": null },
    "credits": { "balance": 15 },
    "welcomeGranted": true
  }
}
```

#### `GET /api/mini/credits`

```json
{
  "code": 0, "message": "ok",
  "data": {
    "balance": 15,
    "currency": "credits",
    "recentTransactions": [
      { "transactionType": "grant", "transactionScene": "mini_program_welcome",
        "credits": 15, "description": "微信小程序新用户赠送额度", "createdAt": "..." }
    ]
  }
}
```

### 8.3 Upload

#### `POST /api/storage/upload-image`（或 `POST /api/mini/uploads`）

- `wx.uploadFile`，`name='files'`，单文件即可。
- 返回见 §7.3。

### 8.4 Project

#### `POST /api/mini/projects`

```json
{
  "title": "未命名项目",
  "width": 1024,
  "height": 1024,
  "originalAssetId": "<storage key>",
  "originalUrl": "https://.../<md5>.png"
}
```

响应（与现有 `POST /api/studio/projects` 一致）：

```json
{
  "code": 0, "message": "ok",
  "data": {
    "project": { "id": "uuid", "userId": "uuid", "title": "...", "width": 1024,
                 "height": 1024, "originalAssetId": "<key>", "status": "ready",
                 "schemaVersion": 1, "createdAt": "...", "updatedAt": "..." },
    "layers": [ { "id": "uuid", "projectId": "uuid", "name": "Original", "type": "raster",
                  "semanticType": "background", "assetId": "<url-or-key>", "storageKey": "<key>",
                  "x": 0, "y": 0, "width": 1024, "height": 1024, "scaleX": 1, "scaleY": 1,
                  "rotation": 0, "opacity": 1, "visible": true, "locked": false, "zIndex": 0,
                  "source": "original", "createdAt": "..." } ]
  }
}
```

#### `GET /api/mini/projects`

```json
{ "code": 0, "message": "ok", "data": [
  { "id": "uuid", "name": "...", "previewUrl": "...", "createdAt": "...", "updatedAt": "..." }
] }
```

#### `GET /api/mini/projects/:id` / `PATCH /api/mini/projects/:id`

- GET 返回 `{ project, layers }`（`toStudioPayload`）。
- PATCH body：`{ "project": { "title": "...", "previewUrl": "..." }, "layers": [...] }`，返回同上。

### 8.5 Operation

#### `POST /api/mini/projects/:id/operations`

```json
{
  "type": "decompose",          // decompose | replace | recolor | remove
  "targetLayerIds": ["layer-id"],
  "prompt": "可选自然语言指令",
  "baseRevisionId": "可选",
  "options": {}
}
```

响应（对齐现有 `POST /api/studio/projects/:id/operations`）：

```json
{
  "code": 0, "message": "ok",
  "data": {
    "id": "uuid", "projectId": "uuid", "type": "decompose",
    "inputRevisionId": "", "targetLayerIds": ["..."], "prompt": "...",
    "provider": "kie", "model": "seedream/5-pro-layer-decomposition",
    "status": "queued",              // queued | running | succeeded | failed
    "aiTaskId": "provider-task-id",
    "costCredits": 5,
    "creditState": "charged",        // none | guest | charged | refunded | released
    "createdAt": "...",
    "result": { "images": ["https://..."], "taskInfo": {}, "taskResult": {} }
  }
}
```

#### `GET /api/mini/operations/:id`

- 返回同上（轮询到 `succeeded`/`failed` 终态）。
- 若 provider 侧失败，服务端自动 refund，`creditState: 'refunded'`。

### 8.6 Revision（如需）

- `GET /api/mini/projects/:id/revisions` → `[{ id, projectId, parentRevisionId?, operationId?, snapshot, createdAt }]`
- `POST /api/mini/projects/:id/revisions` → body `{ parentRevisionId?, operationId?, snapshot }`（snapshot ≤ 2MB）

### 8.7 Error codes

| code | 含义 | HTTP |
|---|---|---|
| 0 | ok | 200 |
| -1 | 通用错误（对齐 `respErr`） | 200 |
| 40001 | `AUTH_TOKEN_MISSING` | 401 |
| 40002 | `AUTH_TOKEN_INVALID` | 401 |
| 40003 | `AUTH_TOKEN_EXPIRED` | 401 |
| 40010 | `WECHAT_CODE_INVALID`（code2Session errcode） | 400 |
| 40011 | `WECHAT_API_ERROR` | 502 |
| 40100 | `CREDIT_INSUFFICIENT` | 402 |
| 40101 | `WELCOME_ALREADY_GRANTED`（幂等 no-op，非错误） | 200 |
| 40200 | `OPERATION_INVALID_TYPE` | 400 |
| 40201 | `OPERATION_NOT_FOUND` | 404 |
| 40202 | `PROJECT_NOT_FOUND` | 404 |
| 40203 | `REVISION_INVALID` | 400 |
| 41300 | `UPLOAD_TOO_LARGE` | 413 |
| 41500 | `UNSUPPORTED_IMAGE_TYPE` | 415 |
| 50000 | `INTERNAL` | 500 |

映射建议：现有 `respErr(message)` 保持 `code=-1`；mini 路由统一用一个 `respMini(code, message, data?)` helper 产生上表。

---

## 9. 数据库 Migration（仅列，不执行）

1. 新增 `mini_program_identity` 表 + 索引。
2. 新增 `mini_program_session` 表 + 索引。
3. credit 表**无需改**（welcome grant 幂等用 `transaction_no` 唯一约束）。
4. 无对现有生产表结构的破坏性变更。

> D1 预览环境同样需要上述两表（`scripts/d1/migrations` 追加新 migration；生产 Turso 用 drizzle 生成/手写 SQL）。

---

## 10. 需要修改/新增的后端文件

**新增**

- `src/config/db/schema.mini.sqlite.ts` — `miniProgramIdentity` + `miniProgramSession`（并导出到 `schema.ts`）
- `src/shared/models/mini-identity.ts` — identity/session 的 CRUD + `getMiniActor(request)` + token 生成/校验 + welcome grant
- `src/features/studio/server/operations.ts` — 从现有路由抽取的共享编排（project/operation/revision）
- `src/app/api/mini/auth/wechat/route.ts`
- `src/app/api/mini/me/route.ts`
- `src/app/api/mini/credits/route.ts`
- `src/app/api/mini/uploads/route.ts`
- `src/app/api/mini/projects/route.ts`、`[id]/route.ts`、`[id]/operations/route.ts`、`[id]/revisions/route.ts`、`operations/[id]/route.ts`
- `scripts/migrations/mini-program.sqlite.sql`（或 drizzle migration）

**修改**

- `src/config/db/schema.ts` — 导出 mini schema
- `src/app/api/studio/projects/[projectId]/operations/route.ts` — 改调用共享 `operations.ts`（行为不变）
- `src/app/api/studio/operations/[operationId]/route.ts` — 同上
- `src/shared/services/settings.ts` — 新增 `wechat_mini_app_id`/`wechat_mini_app_secret`/`mini_program_welcome_credits` 配置项（或仅 env，见 §12）
- `src/config/index.ts` — 增加 `wechat_mini_app_id`/`wechat_mini_app_secret`/`mini_program_welcome_credits` 的 env 读取
- `.env.example` / `.env.production` / `wrangler.jsonc` `vars` — 增加 `WECHAT_MINI_APP_ID`、`WECHAT_MINI_APP_SECRET`（`MINI_PROGRAM_WELCOME_CREDITS` 可选）

---

## 11. 小程序客户端需要相应修改的文件（client adapter）

（客户端仓库不在本仓库内，以下为对接清单，供客户端 adapter 修改）

1. **API base / token 层**：`wx.login()` 换取 `min_` token 并持久化（`wx.setStorageSync`）；`wx.request` 统一注入 `Authorization: Bearer`；401 时重新登录。
2. **上传**：由「假定 presigned PUT」改为 `wx.uploadFile` → `/api/storage/upload-image`（`name='files'`），取 `data.results[0].url`。
3. **项目**：创建/读取/保存改走 `/api/mini/projects*`（或保持现有 Studio 语义但改用 Bearer）。
4. **操作**：`type` 只发 `decompose/replace/recolor/remove`，**删除任何 provider/model 字段**；轮询 `/api/mini/operations/:id`。
5. **额度**：删除 `localStorage` 发额度逻辑；余额从 `GET /api/mini/credits` 读取；**删除任何 `consume` 调用**。
6. **错误处理**：按 §8.7 错误码做 UI 提示（尤其 40100 余额不足、40010 登录失败）。

---

## 12. 安全风险

1. **`session_key` 泄露**：绝不返回客户端；MVP 直接丢弃。若未来需解密，须加密落库（AES-GCM，密钥走 env/secret）。
2. **合成邮箱**：`miniprogram:<appId>:<openid>@wechat.local` 存在被猜测/枚举风险，仅作内部唯一键，绝不在任何日志/页面/响应中暴露 openid/unionid 明文到无关方（`/api/mini/me` 可返回 openid，但需确认产品是否必要）。
3. **token 安全**：只存 SHA-256 哈希；常量时间比较；过期 + 撤销；刷新策略（滑动过期或定期重登）。
4. **AppSecret 泄露**：`WECHAT_MINI_APP_SECRET` 只走服务端 env/secret，不进客户端、不进前端 bundle、不进 `getPublicConfigs`。
5. **客户端可信余额**：客户端显示的任何余额仅用于展示，一切扣费以服务端 `getRemainingCredits` + 事务扣费为准。
6. **匿名刷图床**：建议 `/api/mini/uploads` 加 Bearer + 频率限制；`/api/storage/upload-image` 无鉴权，保留 Web 使用但可加全局限流。
7. **重放 code**：微信 `js_code` 一次性、5 分钟有效；服务端 code2Session 后立即失效，无需额外防重，但应校验 `errcode`。
8. **CSRF/越权**：mini 路由一律从 token 取 userId，绝不信任 body 中的 `userId`/`actorKey`；`findStudioOperationForActor` 的 `actorKey` 由服务端拼接 `user:<id>`。
9. **provider/model 注入**：小程序请求中若携带 provider/model，服务端必须忽略（用 capability router 决定），防止绕过计费/路由。

---

## 13. 测试计划（第一阶段：无生产、无真实 AI、无支付）

**单元/集成（本地 sqlite / D1 preview，mock AI provider 与 code2Session）**

1. `POST /api/mini/auth/wechat`：
   - 首次登录 → 建 user + identity + session + welcome grant（balance=配置值）。
   - 重复登录同 openid → 复用 user，**不重复**发 welcome（幂等）。
   - 无效 code → 40010。
2. welcome grant 幂等：并发两次同 identity 创建，只有一条 grant（`transaction_no` 唯一）。
3. `GET /api/mini/credits`：余额 = welcome - 已扣；`consume` 端点对 mini token 拒绝/不可达。
4. operation 计费：mock AI 成功 → charged；mock AI 失败 → refunded；重复轮询 → 不重复退款（幂等）。
5. operation 语义路由：`decompose` 无 KIE key → 回退 fal；`replace` 走 fal/seedream edit；请求带 provider/model → 被忽略。
6. upload：`wx.uploadFile` 模拟 multipart → 返回 `url/key`；非法类型 → 41500；超大 → 41300。
7. 越权：token A 读 token B 的 project/operation → 404/403。

**契约冒烟（对小程序 adapter）**

8. 用 §8 JSON 契约逐字段断言（me/credits/project/operation/revision/upload/error codes）。

**安全回归**

9. `session_key` 不出现在任何响应；token 明文不落库；openid 不在公共日志。

---

## 14. 本阶段明确不做（Guardrails）

- ❌ 不修改生产代码（本阶段仅产出设计文档）。
- ❌ 不部署、不改生产 bindings/domain。
- ❌ 不迁移生产 DB（Turso / D1 均不动）。
- ❌ 不 Turso → D1（维持现状）。
- ❌ 不真实支付、不调用真实 AI、不调用真实微信 code2Session。
- ❌ 不新建第二套 credits ledger / AI provider 抽象 / Studio operation 系统 / 客户端可信余额 / 小程序专属 AI billing。
- ❌ 不实现 Web↔WeChat bind（仅预留字段与设计）。
- ❌ 不存储 `session_key`（MVP 丢弃）。
