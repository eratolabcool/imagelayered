# Integrate to Shipany

将任意前端项目完整集成到 Shipany SaaS 平台，保留原项目 100% 的界面和体验。

## 功能特性

集成完成后，您的项目将获得：
- ✅ 右上角增加登录、主题、语言切换
- ✅ 真实的 AI 能力（集成到 Shipany AI Provider 系统）
- ✅ 积分系统和支付功能
- ✅ 任务历史记录
- ✅ 多语言支持
- ✅ 完整的用户认证系统（Better Auth）
- ✅ 支付集成（Stripe/PayPal/Creem）
- ✅ 积分管理
- ✅ 后台管理系统
- ✅ 数据持久化（Drizzle ORM）
- ✅ 文件存储（S3/Cloudflare R2/本地）
- ✅ 多语言和主题切换

## 工作流程

本 Skill 会自动执行以下步骤：

### 阶段 1: 项目分析
1. 分析源项目结构和技术栈
2. 识别核心组件和样式
3. 确定 AI 功能需求
4. 提取路由和状态管理逻辑

### 阶段 2: AI Provider 扩展
1. 在 Shipany 中扩展 AI Media Type
2. 在对应的 Provider（kie/replicate/gemini/fal）中添加新方法
3. 实现异步任务处理和 Webhook 回调
4. 集成文件存储服务

### 阶段 3: API 路由创建
1. 扩展 `/api/ai/generate` 路由以支持新的媒体类型
2. 配置积分消耗逻辑
3. 创建文件上传 API（如需要）
4. 实现任务查询和状态追踪

### 阶段 4: 前端组件迁移
1. 创建独立页面（不使用 Shipany 的 Header/Footer）
2. 创建自定义 Header（Logo + 主题/语言/登录）
3. 迁移所有核心组件（100% 保留原代码）
4. 仅修改 API 调用部分（改用 Shipany API）
5. 保留所有样式和动画效果

### 阶段 5: 后台管理扩展
1. 在 AI 任务管理页面添加新的媒体类型筛选
2. 添加任务详情查看
3. 添加用户统计功能

### 阶段 6: 配置和部署
1. 配置环境变量
2. 更新路由配置
3. 添加导航菜单项
4. 设置权限（如需要）

## 使用示例

### 示例 1: 集成音频隔离项目

```
请使用 integrate-to-shipany skill 将 ClearVoice 项目集成到 Shipany

项目信息：
- 项目名称: ClearVoice
- 项目类型: audio-isolation
- AI Provider: kie
- AI 模型: elevenlabs/audio-isolation
- 积分消耗: 5
- 源项目路径: ./clearvoice-src
- 目标路径: ./shipany
```

### 示例 2: 集成图像生成项目

```
请使用 integrate-to-shipany skill 将 ImageGen 项目集成到 Shipany

项目信息：
- 项目名称: ImageGen
- 项目类型: image-generation
- AI Provider: replicate
- AI 模型: black-forest-labs/flux-schnell
- 积分消耗: 3
- 源项目路径: ./imagegen-src
- 目标路径: ./shipany
```

### 示例 3: 集成视频生成项目

```
请使用 integrate-to-shipany skill 将 VideoCreator 项目集成到 Shipany

项目信息：
- 项目名称: VideoCreator
- 项目类型: video-generation
- AI Provider: kie
- AI 模型: luma/video-generation
- 积分消耗: 10
- 源项目路径: ./video-creator-src
- 目标路径: ./shipany
```

## 输入参数

在使用此 Skill 时，请提供以下信息：

| 参数 | 类型 | 必需 | 描述 | 示例 |
|------|------|------|------|------|
| `project_name` | string | ✅ | 项目名称（PascalCase） | `ClearVoice` |
| `project_type` | string | ✅ | 项目类型（kebab-case） | `audio-isolation` |
| `ai_provider` | string | ✅ | AI Provider 名称 | `kie`, `replicate`, `gemini`, `fal` |
| `ai_model` | string | ✅ | AI 模型标识符 | `elevenlabs/audio-isolation` |
| `credits_cost` | number | ✅ | 每次任务消耗积分 | `5` |
| `source_path` | string | ✅ | 源项目相对路径 | `./clearvoice-src` |
| `target_path` | string | ✅ | Shipany 项目相对路径 | `./shipany` |
| `enable_file_upload` | boolean | ❌ | 是否需要文件上传 | `true`（默认） |
| `custom_processing_steps` | string[] | ❌ | 自定义处理步骤 | `["Uploading", "Processing", "Downloading"]` |

## 支持的 AI Provider

| Provider | 描述 | 文档 |
|----------|------|------|
| `kie` | Kie.ai 平台（支持 ElevenLabs、Luma 等） | https://kie.ai/ |
| `replicate` | Replicate 通用 AI 模型平台 | https://replicate.com |
| `gemini` | Google Gemini AI | https://ai.google.dev/ |
| `fal` | FAL AI 平台 | https://fal.ai/ |

## 支持的项目类型

| 类型 | 描述 | Media Type |
|------|------|------------|
| `audio-isolation` | 音频隔离/降噪 | `audio-isolation` |
| `image-generation` | 图像生成 | `image` |
| `video-generation` | 视频生成 | `video` |
| `music-generation` | 音乐生成 | `music` |
| `text-generation` | 文本生成 | `text` |
| `speech-synthesis` | 语音合成 | `speech` |

## 生成的文件结构

集成完成后，将在 Shipany 项目中生成以下结构：

```
shipany/
├── src/
│   ├── extensions/
│   │   └── ai/
│   │       ├── types.ts                    [修改] 扩展 AI Media Type
│   │       ├── kie.ts                      [修改] 添加生成方法
│   │       └── index.ts                    [修改] 导出 Provider
│   ├── app/
│   │   ├── [locale]/
│   │   │   ├── {project-type}/
│   │   │   │   └── page.tsx                [新建] 独立页面
│   │   └── api/
│   │       ├── ai/
│   │       │   └── generate/
│   │       │       └── route.ts            [修改] 添加积分逻辑
│   │       └── storage/
│   │           └── upload-{media}/
│   │               └── route.ts            [新建] 文件上传 API
│   ├── components/
│   │   └── {project-type}/
│   │       ├── {Project}Header.tsx         [新建] 自定义 Header
│   │       ├── {Project}App.tsx            [新建] 主应用组件
│   │       ├── Component1.tsx              [新建] 迁移的组件
│   │       ├── Component2.tsx              [新建] 迁移的组件
│   │       └── styles.css                  [新建] 样式文件
│   └── app/
│       └── [locale]/
│           └── (admin)/
│               └── admin/
│                   └── ai-tasks/
│                       └── page.tsx        [修改] 扩展后台管理
```

## 关键特性

### 1. 100% 界面保留
- 所有组件、样式、动画完全保留
- 仅修改 API 调用部分
- 用户体验无感知切换

### 2. 自定义 Header
```
┌─────────────────────────────────────────────────────┐
│  [Logo] Project Name        [🌙] [🌐] [Sign In]     │
└─────────────────────────────────────────────────────┘
```
- 不使用 Shipany 的标准 Header 和 Footer
- 仅保留品牌 Logo + 功能按钮

### 3. API 调用转换
将原项目的 API 调用转换为 Shipany API：

**原代码**：
```typescript
const response = await fetch('https://api.example.com/generate', {
  method: 'POST',
  body: JSON.stringify({ input: userInput }),
});
```

**转换后**：
```typescript
// 1. 上传文件（如需要）
const uploadRes = await fetch('/api/storage/upload-audio', {
  method: 'POST',
  body: formData,
});
const { url } = await uploadRes.json();

// 2. 调用 AI 生成
const genRes = await fetch('/api/ai/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    provider: 'kie',
    mediaType: 'audio-isolation',
    model: 'elevenlabs/audio-isolation',
    options: { audioUrl: url },
  }),
});
const { taskId } = await genRes.json();

// 3. 轮询任务状态
const pollStatus = setInterval(async () => {
  const statusRes = await fetch(`/api/ai/query?taskId=${taskId}`);
  const { taskStatus, taskInfo } = await statusRes.json();

  if (taskStatus === 'success') {
    clearInterval(pollStatus);
    setResult(taskInfo.result);
  }
}, 2000);
```

### 4. 积分系统集成
- 任务创建时自动扣除积分
- 任务失败自动退还积分
- 实时显示剩余积分

## 环境变量配置

Skill 会自动添加以下环境变量到 `.env` 文件：

```bash
# AI Provider API Keys（已存在则跳过）
KIE_API_KEY=your_kie_api_key
REPLICATE_API_TOKEN=your_replicate_token
GEMINI_API_KEY=your_gemini_key

# 项目特定配置
{PROJECT_TYPE}_CREDITS_COST=5
```

## 后台管理功能

集成后，管理员可以在后台：
1. 查看所有 AI 任务记录
2. 按媒体类型筛选任务
3. 查看任务详情（包括输入/输出文件）
4. 查看用户统计
5. 管理用户积分

## 注意事项

1. **源项目要求**：
   - 建议使用 React/Next.js
   - 其他框架也可以，但需要手动调整

2. **AI Provider 选择**：
   - 优先选择支持该模型的 Provider
   - 如果都不支持，Skill 会提示创建新 Provider

3. **文件存储**：
   - Shipany 支持多种存储后端（S3、Cloudflare R2、本地）
   - 自动配置存储路径

4. **权限控制**：
   - 默认需要用户登录才能使用
   - 可配置为公开访问（Skill 会询问）

## 故障排除

### 问题 1: 组件样式丢失
**解决方案**: 检查 `styles.css` 是否正确导入，确保 Tailwind 配置包含项目路径

### 问题 2: API 调用失败
**解决方案**:
1. 检查环境变量是否正确配置
2. 查看 Shipany 后台日志
3. 验证 AI Provider API Key 是否有效

### 问题 3: 积分未扣除
**解决方案**: 检查 `/api/ai/generate/route.ts` 中的积分消耗逻辑是否正确添加

## 最佳实践

1. **先在测试环境验证**：确保所有功能正常后再部署到生产环境
2. **保留原项目备份**：集成前备份源项目
3. **渐进式迁移**：可以先迁移核心功能，再逐步完善
4. **测试 AI 调用**：确保 AI Provider API Key 有效且有足够额度

## 进阶功能

### 添加 Webhook 处理
对于异步任务，Skill 会自动创建 Webhook 处理器：

```typescript
// shipany/src/app/api/ai/notify/{provider}/route.ts
export async function POST(request: Request) {
  const { taskId, status, result } = await request.json();

  // 更新任务状态
  await updateAITaskById(taskId, { status, taskInfo: result });

  // 下载并保存文件到自定义存储
  if (status === 'success') {
    await saveFilesToStorage(result);
  }

  return Response.json({ success: true });
}
```

### 添加批处理功能
如果项目支持批量处理，Skill 会添加：
- 批量任务创建 API
- 批量状态查询
- 批量结果下载

## 相关 Skills

- `setup-shipany`: 初始化 Shipany 项目
- `add-ai-provider`: 添加新的 AI Provider
- `deploy-to-vercel`: 部署到 Vercel

## 更新日志

### v1.0.0 (2024-12-24)
- ✅ 初始版本
- ✅ 支持 kie、replicate、gemini、fal 四大 Provider
- ✅ 自动组件迁移
- ✅ 自定义 Header 生成
- ✅ 积分系统集成
- ✅ 后台管理扩展

---

**准备好了吗？请提供项目信息，我将开始集成！**
