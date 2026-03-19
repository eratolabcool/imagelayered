import { setRequestLocale } from 'next-intl/server';

import { getMetadata } from '@/shared/lib/seo';

import LandingHeroExperience from './LandingHeroExperience';

export const revalidate = 3600;

export const generateMetadata = getMetadata({
  metadataKey: 'pages.index.metadata',
  canonicalUrl: '/',
  additionalKeywords: [
    'product view generator',
    'different angle product photos',
    'layered image editor',
    'product image cleanup',
    'ai background separation',
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
