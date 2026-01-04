'use client';

import { ChevronRight, Home } from 'lucide-react';
import Link from 'next/link';

import { cn } from '@/shared/lib/utils';

export interface BreadcrumbItem {
  name: string;
  href?: string;
  current?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
  schema?: boolean;
}

export function Breadcrumb({ items, className, schema = true }: BreadcrumbProps) {
  // Generate JSON-LD structured data for breadcrumbs
  const generateBreadcrumbSchema = () => {
    if (!schema) return null;

    const itemList = items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.href ? `${process.env.NEXT_PUBLIC_APP_URL}${item.href}` : undefined,
    }));

    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: itemList,
          }),
        }}
      />
    );
  };

  return (
    <>
      {generateBreadcrumbSchema()}
      <nav aria-label="Breadcrumb" className={cn('w-full', className)}>
        <ol className="flex items-center space-x-1 text-sm">
          {/* Home icon as first breadcrumb */}
          {items.length > 0 && items[0].name !== 'Home' && (
            <li className="flex items-center">
              <Link
                href="/"
                className="flex items-center hover:text-foreground/80 text-foreground/60 transition-colors"
                aria-label="Home"
              >
                <Home className="h-4 w-4" />
              </Link>
            </li>
          )}

          {items.map((item, index) => (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="h-4 w-4 text-foreground/40 mx-1" />
              )}
              {item.href ? (
                <Link
                  href={item.href}
                  className={cn(
                    'hover:text-foreground/80 transition-colors',
                    item.current
                      ? 'font-medium text-foreground'
                      : 'text-foreground/60'
                  )}
                  aria-current={item.current ? 'page' : undefined}
                >
                  {item.name}
                </Link>
              ) : (
                <span
                  className={cn(
                    'font-medium',
                    item.current ? 'text-foreground' : 'text-foreground/60'
                  )}
                  aria-current={item.current ? 'page' : undefined}
                >
                  {item.name}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}

/**
 * Helper to generate breadcrumb items from pathname
 */
export function generateBreadcrumbsFromPath(
  pathname: string,
  locale: string,
  translations?: Record<string, string>
): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [];
  const pathParts = pathname
    .replace(`/${locale}`, '')
    .split('/')
    .filter(Boolean);

  let currentPath = '';

  // Add Home
  items.push({
    name: translations?.home || 'Home',
    href: '/',
  });

  // Add each path segment
  pathParts.forEach((part, index) => {
    currentPath += `/${part}`;
    const isLast = index === pathParts.length - 1;

    // Convert slug to readable name
    const name = translations?.[part] || formatSlugToTitle(part);

    items.push({
      name,
      href: isLast ? undefined : currentPath,
      current: isLast,
    });
  });

  return items;
}

function formatSlugToTitle(slug: string): string {
  return slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, letter => letter.toUpperCase());
}
