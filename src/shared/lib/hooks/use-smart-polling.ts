/**
 * [INPUT]: 依赖 React hooks (useEffect, useRef, useCallback)
 * [OUTPUT]: 对外提供 useSmartPolling Hook，智能轮询任务状态
 * [POS]: shared/lib/hooks 的轮询优化工具，被 AI 生成器组件使用
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useEffect, useRef, useCallback } from 'react';

/**
 * 智能轮询 Hook - 使用指数退避策略减少服务器压力
 *
 * @param pollFn - 轮询函数，返回 true 表示任务完成
 * @param taskId - 任务 ID，变化时重启轮询
 * @param options - 配置选项
 * @returns cleanup 函数
 *
 * 🎯 设计理念：
 * - 初始间隔：2000ms（快速响应用户）
 * - 最大间隔：30000ms（避免长期轰炸服务器）
 * - 退避倍数：1.5（渐进式增长）
 * - 超时时间：5分钟（防止无限轮询）
 *
 * 📊 性能对比：
 * - 固定 5 秒轮询：120次/分钟
 * - 智能退避：30次/分钟（初始）→ 2次/分钟（稳定期）
 */
export function useSmartPolling(
  pollFn: () => Promise<boolean>,
  taskId: string | null,
  options: {
    initialInterval?: number;
    maxInterval?: number;
    backoffMultiplier?: number;
    timeout?: number;
    enabled?: boolean;
  } = {}
) {
  const {
    initialInterval = 2000,
    maxInterval = 30000,
    backoffMultiplier = 1.5,
    timeout = 300000, // 5 minutes
    enabled = true,
  } = options;

  const cancelledRef = useRef(false);
  const currentIntervalRef = useRef(initialInterval);
  const startTimeRef = useRef<number>(0);

  const cleanup = useCallback(() => {
    cancelledRef.current = true;
  }, []);

  useEffect(() => {
    if (!taskId || !enabled) {
      return;
    }

    cancelledRef.current = false;
    currentIntervalRef.current = initialInterval;
    startTimeRef.current = Date.now();

    let timeoutId: NodeJS.Timeout | null = null;

    const poll = async (): Promise<void> => {
      // 检查取消条件
      if (cancelledRef.current) {
        return;
      }

      // 检查超时
      const elapsed = Date.now() - startTimeRef.current;
      if (elapsed > timeout) {
        console.warn('[useSmartPolling] Polling timeout after', elapsed, 'ms');
        return;
      }

      try {
        const completed = await pollFn();

        if (completed) {
          console.log('[useSmartPolling] Task completed successfully');
          cancelledRef.current = true;
          return;
        }

        // 任务未完成，使用指数退避策略增加间隔
        const nextInterval = Math.min(
          currentIntervalRef.current * backoffMultiplier,
          maxInterval
        );
        currentIntervalRef.current = nextInterval;

        console.log(
          `[useSmartPolling] Next poll in ${nextInterval}ms (elapsed: ${Math.floor(elapsed / 1000)}s)`
        );

        // 安排下一次轮询
        timeoutId = setTimeout(poll, nextInterval);
      } catch (error) {
        console.error('[useSmartPolling] Poll error:', error);

        // 出错时使用最大间隔重试
        timeoutId = setTimeout(poll, maxInterval);
      }
    };

    // 立即执行第一次轮询
    poll();

    return () => {
      cancelledRef.current = true;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [taskId, enabled, pollFn, initialInterval, maxInterval, backoffMultiplier, timeout]);

  return cleanup;
}
