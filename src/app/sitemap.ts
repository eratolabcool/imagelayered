import { MetadataRoute } from 'next';

import { envConfigs } from '@/config';
import { defaultLocale, locales } from '@/config/locale';
import { imageLayeredSeoPages } from '@/shared/seo/image-layered-pages';

/**
 * Generate dynamic sitemap for SEO
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const appUrl = envConfigs.app_url;
  const currentDate = new Date();

  // Static routes with their priorities and update frequencies
  const staticRoutes = [
    {
      url: '',
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: '/features',
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: '/pricing',
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: '/docs',
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: '/blog',
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: '/seo',
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.85,
    },
    {
      url: '/updates',
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    },
    {
      url: '/privacy-policy',
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.3,
    },
    {
      url: '/terms-of-service',
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.3,
    },
    // AI tools pages
    {
      url: '/qwenimagelayered',
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.95,
    },
    {
      url: '/ai-lookbook',
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: '/activity',
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
  ];

  // Generate URLs for all locales
  const sitemapEntries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    const localePrefix = locale === defaultLocale ? '' : `/${locale}`;

    for (const route of staticRoutes) {
      const url = `${appUrl}${localePrefix}${route.url}`;
      sitemapEntries.push({
        url: url,
        lastModified: route.lastModified,
        changeFrequency: route.changeFrequency,
        priority: route.priority,
        alternates: {
          languages: Object.fromEntries(
            locales.map(loc => [
              loc,
              `${appUrl}${loc === defaultLocale ? '' : `/${loc}`}${route.url}`,
            ])
          ),
        },
      });
    }
  }

  for (const page of imageLayeredSeoPages) {
    sitemapEntries.push({
      url: `${appUrl}/seo/${page.market}/${page.slug}`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.72,
    });
  }

  for (const market of ['en', 'pt', 'ja', 'ru', 'es']) {
    sitemapEntries.push({
      url: `${appUrl}/seo/${market}`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: market === 'en' ? 0.82 : 0.78,
    });
  }

  return sitemapEntries;
}
