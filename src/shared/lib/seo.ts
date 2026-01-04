import { getTranslations, setRequestLocale } from 'next-intl/server';

import { envConfigs } from '@/config';
import { defaultLocale, locales } from '@/config/locale';

// get metadata for page component
export function getMetadata(
  options: {
    title?: string;
    description?: string;
    keywords?: string;
    metadataKey?: string;
    canonicalUrl?: string; // relative path or full url
    imageUrl?: string;
    appName?: string;
    noIndex?: boolean;
    noFollow?: boolean;
    additionalKeywords?: string[];
    structuredData?: Record<string, any>;
  } = {}
) {
  return async function generateMetadata({
    params,
  }: {
    params: Promise<{ locale: string }>;
  }) {
    const { locale } = await params;
    setRequestLocale(locale);

    // passed metadata
    const passedMetadata = {
      title: options.title,
      description: options.description,
      keywords: options.keywords,
    };

    // default metadata
    const defaultMetadata = await getTranslatedMetadata(
      defaultMetadataKey,
      locale
    );

    // translated metadata
    let translatedMetadata: any = {};
    if (options.metadataKey) {
      translatedMetadata = await getTranslatedMetadata(
        options.metadataKey,
        locale
      );
    }

    // canonical url
    const canonicalUrl = await getCanonicalUrl(
      options.canonicalUrl || '',
      locale || ''
    );

    const title =
      passedMetadata.title || translatedMetadata.title || defaultMetadata.title;
    const description =
      passedMetadata.description ||
      translatedMetadata.description ||
      defaultMetadata.description;

    // Combine keywords with additional long-tail keywords
    const baseKeywords =
      passedMetadata.keywords ||
      translatedMetadata.keywords ||
      defaultMetadata.keywords ||
      '';
    const additionalKeywords = options.additionalKeywords || [];
    const allKeywords = options.additionalKeywords
      ? [...baseKeywords.split(',').map((k: string) => k.trim()), ...additionalKeywords].join(', ')
      : baseKeywords;

    // image url
    let imageUrl = options.imageUrl || envConfigs.app_preview_image;
    if (imageUrl.startsWith('http')) {
      imageUrl = imageUrl;
    } else {
      imageUrl = `${envConfigs.app_url}${imageUrl}`;
    }

    // app name
    let appName = options.appName;
    if (!appName) {
      appName = envConfigs.app_name || '';
    }

    // Build alternates with hreflang
    const alternates: Record<string, string> = {
      canonical: canonicalUrl,
    };

    // Add language alternates for SEO
    for (const loc of locales) {
      const localeUrl = await getCanonicalUrl(options.canonicalUrl || '', loc);
      alternates[loc === defaultLocale ? 'x-default' : loc] = localeUrl;
    }

    return {
      title,
      description,
      keywords: allKeywords,
      alternates,

      // Explicit meta tags for better SEO
      metadataBase: new URL(envConfigs.app_url),

      openGraph: {
        type: 'website',
        locale: locale,
        url: canonicalUrl,
        title,
        description,
        siteName: appName,
        images: [
          {
            url: imageUrl.toString(),
            width: 1200,
            height: 630,
            alt: title,
          },
        ],
      },

      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [imageUrl.toString()],
        site: envConfigs.app_url,
        creator: '@' + appName.toLowerCase().replace(/\s+/g, ''),
      },

      robots: {
        index: options.noIndex ? false : true,
        follow: options.noFollow !== undefined ? options.noFollow : !options.noIndex,
        googleBot: {
          index: options.noIndex ? false : true,
          follow: options.noFollow !== undefined ? options.noFollow : !options.noIndex,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },

      verification: {
        // Add verification meta tags for search consoles
        google: envConfigs.google_site_verification || '',
        yandex: envConfigs.yandex_verification || '',
      },

      // Additional SEO tags
      category: 'technology',
      classification: 'AI Image Editing Tool',
      referrer: 'origin-when-cross-origin',

      // Structured data will be injected separately
      other: {
        'application-name': appName,
        'apple-mobile-web-app-title': appName,
        'apple-mobile-web-app-capable': 'yes',
        'mobile-web-app-capable': 'yes',
      },
    };
  };
}

const defaultMetadataKey = 'common.metadata';

async function getTranslatedMetadata(metadataKey: string, locale: string) {
  setRequestLocale(locale);
  const t = await getTranslations(metadataKey);

  return {
    title: t.has('title') ? t('title') : '',
    description: t.has('description') ? t('description') : '',
    keywords: t.has('keywords') ? t('keywords') : '',
  };
}

async function getCanonicalUrl(canonicalUrl: string, locale: string) {
  // Use a consistent base URL for canonical URLs
  const baseUrl = envConfigs.app_url || 'http://localhost:3000';

  if (!canonicalUrl) {
    canonicalUrl = '/';
  }

  if (canonicalUrl.startsWith('http')) {
    // full url - return as is
    return canonicalUrl;
  }

  // relative path - construct full URL
  if (!canonicalUrl.startsWith('/')) {
    canonicalUrl = `/${canonicalUrl}`;
  }

  // Build the full canonical URL
  const localePrefix = !locale || locale === defaultLocale ? '' : `/${locale}`;
  let fullUrl = `${baseUrl}${localePrefix}${canonicalUrl}`;

  // Remove trailing slash for non-default locales
  if (locale !== defaultLocale && fullUrl.endsWith('/')) {
    fullUrl = fullUrl.slice(0, -1);
  }

  return fullUrl;
}
