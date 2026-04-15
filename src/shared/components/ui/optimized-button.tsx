/**
 * [INPUT]: 依赖 React 和 framer-motion
 * [OUTPUT]: 对外提供性能优化的按钮组件
 * [POS]: shared/components/ui 的优化按钮模块，提供快速响应的按钮
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

'use client';

import { forwardRef, ButtonHTMLAttributes, useCallback } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/shared/lib/utils';
import { Slot } from '@radix-ui/react-slot';
import { useFastClick } from '@/shared/lib/hooks/performance';

export interface OptimizedButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLMotionProps<'button'> {
  asChild?: boolean;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'md' | 'lg' | 'icon';
  loading?: boolean;
  fastClick?: boolean; // 启用快速点击防护
  clickDelay?: number; // 点击间隔（毫秒）
}

const variantStyles = {
  default: 'bg-primary text-primary-foreground hover:bg-primary/90',
  destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
  outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
  ghost: 'hover:bg-accent hover:text-accent-foreground',
  link: 'text-primary underline-offset-4 hover:underline',
};

const sizeStyles = {
  default: 'h-10 px-4 py-2',
  sm: 'h-9 rounded-md px-3',
  md: 'h-11 rounded-md px-8',
  lg: 'h-14 rounded-lg px-10 text-lg',
  icon: 'h-10 w-10',
};

/**
 * 性能优化的按钮组件
 * 特性：
 * 1. 快速点击防护 - 防止重复提交
 * 2. 优化的动画 - 使用 GPU 加速
 * 3. 减少重渲染 - 使用 useCallback 和 memo
 * 4. 懒加载动画 - 使用 whileTap 代替 onTap
 */
export const OptimizedButton = forwardRef<HTMLButtonElement, OptimizedButtonProps>(
  (
    {
      className,
      variant = 'default',
      size = 'default',
      asChild = false,
      loading = false,
      fastClick = false,
      clickDelay = 300,
      onClick,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    // 使用快速点击防护
    const [isPending, wrappedOnClick] = useFastClick(
      useCallback(
        (e: React.MouseEvent<HTMLButtonElement>) => {
          if (onClick && !loading && !disabled) {
            onClick(e);
          }
        },
        [onClick, loading, disabled]
      ),
      clickDelay
    );

    const handleClick = fastClick ? wrappedOnClick : onClick;
    const isDisabled = disabled || loading || (fastClick && isPending);

    // 使用 GPU 加速的动画属性
    const motionProps: HTMLMotionProps<'button'> = {
      whileHover: !isDisabled ? { scale: 1.02 } : undefined,
      whileTap: !isDisabled ? { scale: 0.98 } : undefined,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 17,
        mass: 0.8, // 减少质量，提升响应速度
      },
    };

    const Comp = asChild ? Slot : motion.button;

    return (
      <Comp
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
          variantStyles[variant],
          sizeStyles[size],
          loading && 'cursor-wait',
          className
        )}
        disabled={isDisabled}
        onClick={handleClick as any}
        {...motionProps}
        {...props}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg
              className="h-4 w-4 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Loading...
          </span>
        ) : (
          children
        )}
      </Comp>
    );
  }
);

OptimizedButton.displayName = 'OptimizedButton';
