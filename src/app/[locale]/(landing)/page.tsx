import { getTranslations, setRequestLocale } from 'next-intl/server';

import { getThemePage } from '@/core/theme';
import { getMetadata } from '@/shared/lib/seo';
import { DynamicPage } from '@/shared/types/blocks/landing';

export const revalidate = 3600;

// Generate metadata for SEO
export const generateMetadata = getMetadata({
  metadataKey: 'pages.index.metadata',
  canonicalUrl: '/',
  additionalKeywords: [
    'image layer editor',
    'AI photo editing',
    'RGB layer separation',
    'free design tool',
    'computer vision',
    'object detection',
    'smart image editing',
    'automated masking',
    'product photography',
    'graphic design',
    'content creation',
    'AI image decomposition',
    'RGBA layer editor',
    'zero-drift editing',
    'Photoshop alternative free',
  ],
});

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('pages.index');

  // get page data
  const page: DynamicPage = t.raw('page');

  // load page component
  const Page = await getThemePage('dynamic-page');

  return <Page locale={locale} page={page} />;
}
