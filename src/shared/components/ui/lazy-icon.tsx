'use client';

import { memo, forwardRef } from 'react';
import { LucideIcon } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

interface LazyIconProps {
  name: keyof typeof LucideIcons;
  className?: string;
  size?: number;
}

// Create a memoized component for lazy icon loading
export const LazyIcon = memo(
  forwardRef<SVGSVGElement, LazyIconProps>(
    ({ name, className, size = 24, ...props }, ref) => {
      // Dynamically get the icon component
      const IconComponent = LucideIcons[name] as LucideIcon;

      if (!IconComponent) {
        return null;
      }

      return <IconComponent ref={ref} className={className} size={size} {...props} />;
    }
  )
);

LazyIcon.displayName = 'LazyIcon';
