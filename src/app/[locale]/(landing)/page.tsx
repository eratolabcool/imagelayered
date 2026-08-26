import { setRequestLocale } from 'next-intl/server';

import { getMetadata } from '@/shared/lib/seo';
import ImageLayeredSeoGuide from '@/shared/blocks/crooked/components/ImageLayeredSeoGuide';

import LandingHeroExperience from './LandingHeroExperience';
import SeoTopicLinks from './SeoTopicLinks';

export const revalidate = 3600;

export const generateMetadata = getMetadata({
  metadataKey: 'pages.index.metadata',
  canonicalUrl: '/',
});

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <LandingHeroExperience />
      <ImageLayeredSeoGuide locale={locale} surface="home" />
      {locale !== 'zh' && <SeoTopicLinks />}
    </>
  );
}
