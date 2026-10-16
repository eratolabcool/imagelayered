import type { MetadataRoute } from 'next';

import { envConfigs } from '@/config';
import { defaultLocale, locales } from '@/config/locale';

export default function robots(): MetadataRoute.Robots {
  const appUrl = envConfigs.app_url || 'http://localhost:3000';
  const privateRoutes = [
    '/admin',
    '/settings',
    '/activity',
    '/sign-in',
    '/sign-up',
    '/verify-email',
    '/no-permission',
  ];
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        ...[
          '',
          ...locales
            .filter((locale) => locale !== defaultLocale)
            .map((locale) => `/${locale}`),
        ].flatMap((prefix) =>
          privateRoutes.map((route) => `${prefix}${route}`)
        ),
        '/*?*q=',
      ],
    },
    sitemap: `${appUrl}/sitemap.xml`,
    host: appUrl,
  };
}
