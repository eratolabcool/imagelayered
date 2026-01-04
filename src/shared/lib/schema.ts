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

/**
 * Generate BreadcrumbList schema data
 */
export function generateBreadcrumbSchemaData(breadcrumbs: Array<{ name: string; url: string }>) {
  const itemList = breadcrumbs.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: item.url,
  }));

  return {
    '@type': 'BreadcrumbList',
    itemListElement: itemList,
  };
}

/**
 * Generate FAQPage schema data
 */
export function generateFAQSchemaData(faqs: Array<{ question: string; answer: string }>) {
  const itemList = faqs.map(faq => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  }));

  return {
    '@type': 'FAQPage',
    mainEntity: itemList,
  };
}

/**
 * Generate Article schema data (for blog posts)
 */
export function generateArticleSchemaData(data: {
  title: string;
  description: string;
  publishDate: string;
  modifiedDate?: string;
  authorName: string;
  url: string;
  imageUrl?: string;
  appUrl: string;
  appName: string;
}) {
  return {
    '@type': 'Article',
    headline: data.title,
    description: data.description,
    image: data.imageUrl || `${data.appUrl}/og-image.png`,
    datePublished: data.publishDate,
    dateModified: data.modifiedDate || data.publishDate,
    author: {
      '@type': 'Person',
      name: data.authorName,
    },
    publisher: {
      '@type': 'Organization',
      name: data.appName,
      logo: {
        '@type': 'ImageObject',
        url: `${data.appUrl}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': data.url,
    },
  };
}
