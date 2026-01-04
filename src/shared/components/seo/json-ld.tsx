'use client';

interface JsonLdProps {
  data: Record<string, any>;
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          ...data,
        }),
      }}
    />
  );
}

/**
 * Generate WebSite schema data
 */
export function generateWebSiteSchemaData(locale: string, appUrl: string, appName: string) {
  return {
    '@type': 'WebSite',
    name: appName,
    url: appUrl,
    description: 'AI-powered image layer decomposition and editing tool',
    inLanguage: locale,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${appUrl}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * Generate Organization schema data
 */
export function generateOrganizationSchemaData(appUrl: string, appName: string) {
  return {
    '@type': 'Organization',
    name: appName,
    url: appUrl,
    logo: `${appUrl}/logo.png`,
    description: 'AI-powered image editing platform',
    sameAs: [
      'https://github.com/QwenLM/Qwen-Image-Layered',
      'https://modelscope.cn/models/Qwen/Qwen-Image-Layered',
    ],
  };
}

/**
 * Generate SoftwareApplication schema data
 */
export function generateSoftwareApplicationSchemaData(appName: string) {
  return {
    '@type': 'SoftwareApplication',
    name: appName,
    applicationCategory: 'DesignApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '1250',
    },
  };
}
