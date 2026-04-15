/**
 * [INPUT]: 依赖 React 的优化 hooks 和 framer-motion
 * [OUTPUT]: 对外提供性能优化相关的 hooks 和工具函数
 * [POS]: shared/lib/hooks 的性能优化模块，减少重渲染和提升响应速度
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useCallback, useRef, useEffect } from 'react';
import { debounce, throttle } from 'lodash-es';

/**
 * 防抖 Hook - 优化频繁触发的事件（如输入、滚动）
 * @param fn 要防抖的函数
 * @param delay 延迟时间（毫秒）
 * @returns 防抖后的函数
 */
export function useDebounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  const debouncedFn = useRef(debounce(fn, delay));

  useEffect(() => {
    debouncedFn.current = debounce(fn, delay);
    return () => {
      debouncedFn.current.cancel();
    };
  }, [fn, delay]);

  return useCallback((...args: Parameters<T>) => {
    debouncedFn.current(...args);
  }, []);
}

/**
 * 节流 Hook - 优化高频触发的事件（如拖拽、resize）
 * @param fn 要节流的函数
 * @param limit 时间间隔（毫秒）
 * @returns 节流后的函数
 */
export function useThrottle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  const throttledFn = useRef(throttle(fn, limit));

  useEffect(() => {
    throttledFn.current = throttle(fn, limit);
    return () => {
      throttledFn.current.cancel();
    };
  }, [fn, limit]);

  return useCallback((...args: Parameters<T>) => {
    throttledFn.current(...args);
  }, []);
}

/**
 * 快速点击防护 Hook - 防止按钮重复点击
 * @param delay 点击间隔（毫秒，默认300ms）
 * @returns [isPending, wrappedFn] - 是否正在处理，包装后的函数
 */
export function useFastClick<T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 300
): [isPending: boolean, wrappedFn: (...args: Parameters<T>) => void] {
  const isPendingRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const wrappedFn = useCallback(
    (...args: Parameters<T>) => {
      if (isPendingRef.current) return;

      isPendingRef.current = true;

      // 清除之前的定时器
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // 执行函数
      const result = fn(...args);

      // 处理 Promise
      if (result instanceof Promise) {
        result.finally(() => {
          timeoutRef.current = setTimeout(() => {
            isPendingRef.current = false;
          }, delay);
        });
      } else {
        timeoutRef.current = setTimeout(() => {
          isPendingRef.current = false;
        }, delay);
      }
    },
    [fn, delay]
  );

  const isPending = isPendingRef.current;

  return [isPending, wrappedFn];
}

/**
 * 优化的异步状态 Hook - 减少不必要的状态更新
 * @param asyncFn 异步函数
 * @returns [execute, data, error, isPending] - 执行函数、数据、错误、是否正在处理
 */
export function useOptimizedAsync<T, Args extends any[] = any[]>(
  asyncFn: (...args: Args) => Promise<T>
) {
  const isPendingRef = useRef(false);
  const dataRef = useRef<T | null>(null);
  const errorRef = useRef<Error | null>(null);

  const execute = useCallback(
    async (...args: Args) => {
      // 防止重复请求
      if (isPendingRef.current) {
        return { data: dataRef.current, error: errorRef.current, isPending: true };
      }

      isPendingRef.current = true;
      errorRef.current = null;

      try {
        const result = await asyncFn(...args);
        dataRef.current = result;
        return { data: result, error: null, isPending: false };
      } catch (error) {
        errorRef.current = error as Error;
        return { data: null, error: error as Error, isPending: false };
      } finally {
        isPendingRef.current = false;
      }
    },
    [asyncFn]
  );

  return {
    execute,
    data: dataRef.current,
    error: errorRef.current,
    isPending: isPendingRef.current,
  };
}

/**
 * 优动的滚动位置 Hook - 使用 passive event listener 提升滚动性能
 * @param callback 滚动回调
 * @param delay 节流延迟（毫秒）
 */
export function useOptimizedScroll(
  callback: () => void,
  delay: number = 100
) {
  const throttledCallback = useThrottle(callback, delay);

  useEffect(() => {
    // 使用 passive listener 提升滚动性能
    window.addEventListener('scroll', throttledCallback, { passive: true });
    return () => {
      window.removeEventListener('scroll', throttledCallback);
    };
  }, [throttledCallback]);
}

/**
 * Intersection Observer Hook - 懒加载图片和组件
 * @param callback 当元素进入视口时的回调
 * @param options Intersection Observer 选项
 */
export function useIntersectionObserver(
  callback: IntersectionObserverCallback,
  options: IntersectionObserverInit = {}
) {
  const targetRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(callback, {
      threshold: 0.1,
      rootMargin: '50px',
      ...options,
    });

    const currentTarget = targetRef.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [callback, options]);

  return targetRef;
}

/**
 * 优动的 Resize Observer Hook - 监听元素尺寸变化
 * @param callback 尺寸变化回调
 */
export function useOptimizedResize(callback: () => void) {
  const throttledCallback = useThrottle(callback, 200);

  useEffect(() => {
    // 使用 ResizeObserver 代替 window.resize
    let resizeObserver: ResizeObserver | null = null;

    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(throttledCallback);
      resizeObserver.observe(document.body);

      return () => {
        if (resizeObserver) {
          resizeObserver.disconnect();
        }
      };
    } else {
      // 降级到 window.resize
      window.addEventListener('resize', throttledCallback);
      return () => {
        window.removeEventListener('resize', throttledCallback);
      };
    }
  }, [throttledCallback]);
}

/**
 * 预加载资源 Hook - 预加载关键资源
 * @param urls 要预加载的 URL 列表
 * @param as 资源类型（image, script, style, etc.）
 */
export function usePreloadResources(urls: string[], as: string = 'image') {
  useEffect(() => {
    urls.forEach((url) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = url;
      link.as = as;

      // 只在支持的浏览器中使用
      if ('relList' in document) {
        document.head.appendChild(link);
      }
    });

    return () => {
      // 清理预加载的链接
      const links = document.querySelectorAll(`link[href][as="${as}"]`);
      links.forEach((link) => {
        if (urls.includes((link as HTMLLinkElement).href)) {
          link.remove();
        }
      });
    };
  }, [urls, as]);
}

/**
 * DNS 预解析 Hook - 预解析外部域名
 * @param domains 要预解析的域名列表
 */
export function useDnsPrefetch(domains: string[]) {
  useEffect(() => {
    domains.forEach((domain) => {
      const link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = domain;

      if ('relList' in document) {
        document.head.appendChild(link);
      }
    });

    return () => {
      const links = document.querySelectorAll('link[rel="dns-prefetch"]');
      links.forEach((link) => {
        const href = (link as HTMLLinkElement).href;
        if (domains.some((d) => href.includes(d))) {
          link.remove();
        }
      });
    };
  }, [domains]);
}

/**
 * 优动的动画帧 Hook - 使用 requestAnimationFrame
 * @param callback 动画回调
 * @param fps 目标帧率（默认60fps）
 */
export function useOptimizedAnimation(
  callback: () => void,
  fps: number = 60
) {
  const requestRef = useRef<number>();
  const previousTimeRef = useRef<number>();
  const interval = 1000 / fps;

  const animate = useCallback(
    (time: number) => {
      if (previousTimeRef.current !== undefined) {
        const deltaTime = time - previousTimeRef.current;

        if (deltaTime >= interval) {
          callback();
          previousTimeRef.current = time - (deltaTime % interval);
        }
      }

      requestRef.current = requestAnimationFrame(animate);
    },
    [callback, interval]
  );

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [animate]);
}
