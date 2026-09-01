import { respData, respErr } from '@/shared/lib/resp';
import {
  authenticateWechatCode,
  MiniAuthError,
  miniErrorResponse,
} from '@/shared/models/mini-identity';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST /api/mini/auth/wechat
 * body: { code: string }
 *
 * Exchanges a wx.login() code for a Mini Program bearer session. `session_key`
 * is discarded by wechatCode2Session and never returned or stored.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await authenticateWechatCode(body?.code);
    return respData(result);
  } catch (error: any) {
    if (error instanceof MiniAuthError) {
      return miniErrorResponse(error);
    }
    console.error('[mini] wechat auth failed', error);
    return respErr(error?.message || 'wechat auth failed');
  }
}
