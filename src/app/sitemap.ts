import type { MetadataRoute } from 'next';

import { postsSource } from '@/core/docs/source';
import { envConfigs } from '@/config';
import { defaultLocale, locales } from '@/config/locale';
import { imageLayeredSeoPages } from '@/shared/seo/image-layered-pages';

export default function sitemap(): MetadataRoute.Sitemap {
  const appUrl = envConfigs.app_url.replace(/\/$/, '');
  const localizedUrl = (path: string, locale: string) =>
    `${appUrl}${locale === defaultLocale ? '' : `/${locale}`}${path}`;
  // Only public, canonical routes. Omit lastModified when no reliable date exists.
  const routes = [
    '',
    '/pricing',
    '/docs',
    '/blog',
    '/seo',
    '/updates',
    '/privacy-policy',
    '/terms-of-service',
    '/studio',
    '/studio/guide',
    '/studio/workflows',
    '/image-to-psd',
    '/image-to-layers',
    '/poster-to-psd',
    '/ai-image-editing',
    '/solutions/character-into-layers',
    '/solutions/animator-prep',
    '/solutions/logo-into-layers',
  ];
  const entries: MetadataRoute.Sitemap = [];
  for (const path of routes) {
    const languages = Object.fromEntries(
      locales.map((locale) => [locale, localizedUrl(path, locale)])
    );
    languages['x-default'] = localizedUrl(path, defaultLocale);
    for (const locale of locales) {
      entries.push({
        url: localizedUrl(path, locale),
        alternates: { languages },
      });
    }
  }
  // The MDX source knows which translations actually exist; don't invent /zh copies.
  for (const locale of locales) {
    for (const post of postsSource.getPages(locale)) {
      entries.push({
        url: localizedUrl(`/blog/${post.slugs.join('/')}`, locale),
      });
    }
  }
  for (const page of imageLayeredSeoPages) {
    entries.push({ url: `${appUrl}/seo/${page.market}/${page.slug}` });
  }
  for (const market of new Set(
    imageLayeredSeoPages.map((page) => page.market)
  )) {
    entries.push({ url: `${appUrl}/seo/${market}` });
  }
  return entries;
}
