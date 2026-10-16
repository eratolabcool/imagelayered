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
      priceCurrency: 'USD',
      description: 'AI operations use credits; local upload and project setup are free.',
    },
  };
}
