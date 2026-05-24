import { setRequestLocale } from 'next-intl/server';

import { getMetadata } from '@/shared/lib/seo';

import LandingHeroExperience from './LandingHeroExperience';

export const revalidate = 3600;

export const generateMetadata = getMetadata({
  metadataKey: 'pages.index.metadata',
  canonicalUrl: '/',
  additionalKeywords: [
    'edit AI image without regenerating',
    'AI image layer editor',
    'AI image revision tool',
    'edit poster without Photoshop',
    'change background of AI product image',
    'layered image editor',
    'separate text from image AI',
  ],
});

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <LandingHeroExperience />;
}
