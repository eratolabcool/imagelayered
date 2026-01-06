/**
 * [INPUT]: 依赖 localStorage 的浏览器存储 API
 * [OUTPUT]: 对外提供游客使用追踪和限制检查功能
 * [POS]: shared/lib 中的工具模块，被 CrookedApp 等编辑器组件消费
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

const GUEST_USAGE_KEY = 'qwen_guest_usage';
const GUEST_UPLOAD_LIMIT = 3; // 游客免费上传次数

export interface GuestUsage {
  uploadCount: number;
  lastUploadTime: number;
  firstVisitTime: number;
}

/**
 * 获取游客使用记录
 */
export function getGuestUsage(): GuestUsage {
  if (typeof window === 'undefined') {
    return { uploadCount: 0, lastUploadTime: 0, firstVisitTime: Date.now() };
  }

  try {
    const stored = localStorage.getItem(GUEST_USAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('[getGuestUsage] Failed to read localStorage:', e);
  }

  // 首次访问，初始化记录
  const initialUsage: GuestUsage = {
    uploadCount: 0,
    lastUploadTime: 0,
    firstVisitTime: Date.now()
  };

  try {
    localStorage.setItem(GUEST_USAGE_KEY, JSON.stringify(initialUsage));
  } catch (e) {
    console.error('[getGuestUsage] Failed to initialize localStorage:', e);
  }

  return initialUsage;
}

/**
 * 增加上传次数
 */
export function incrementUploadCount(): number {
  const usage = getGuestUsage();
  usage.uploadCount += 1;
  usage.lastUploadTime = Date.now();

  try {
    localStorage.setItem(GUEST_USAGE_KEY, JSON.stringify(usage));
  } catch (e) {
    console.error('[incrementUploadCount] Failed to save localStorage:', e);
  }

  return usage.uploadCount;
}

/**
 * 检查是否达到上传限制
 */
export function isUploadLimitReached(): boolean {
  const usage = getGuestUsage();
  return usage.uploadCount >= GUEST_UPLOAD_LIMIT;
}

/**
 * 获取剩余免费次数
 */
export function getRemainingUploads(): number {
  const usage = getGuestUsage();
  return Math.max(0, GUEST_UPLOAD_LIMIT - usage.uploadCount);
}

/**
 * 检查用户是否已登录
 */
export function isUserLoggedIn(): boolean {
  // 检查 better-auth session
  if (typeof document === 'undefined') return false;

  // 简单检查：是否有 session cookie
  const cookies = document.cookie.split(';');
  return cookies.some(cookie => cookie.trim().startsWith('better-auth.session_token'));
}

/**
 * 重置游客使用记录（用于测试或登录后）
 */
export function resetGuestUsage(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(GUEST_USAGE_KEY);
  } catch (e) {
    console.error('[resetGuestUsage] Failed to clear localStorage:', e);
  }
}
