import { Metadata } from 'next';

import ImageLayeredSeoGuide from '@/shared/blocks/crooked/components/ImageLayeredSeoGuide';

import CrookedAppWrapper from './CrookedAppWrapper';

export const metadata: Metadata = {
  title: 'Image Layered | AI Photoshop for Posters',
  description: 'Upload any poster, split it into editable AI layers, edit selected objects with GPT Image 2, and export a polished redesigned poster.',
  alternates: {
    canonical: '/qwenimagelayered',
  },
  openGraph: {
    title: 'Image Layered - AI Photoshop for Posters',
    description: 'Turn flat posters into editable AI layers. Replace products, rewrite text, remove objects, and export polished designs.',
    type: 'website',
    url: '/qwenimagelayered',
    siteName: 'Image Layered',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Image Layered',
  applicationCategory: 'DesignApplication',
  operatingSystem: 'Web Browser',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  description:
    'Upload a poster, automatically split it into editable AI layers, edit selected objects by prompt, and export a redesigned visual.',
};

export default async function QwenImageLayeredPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CrookedAppWrapper />
      <ImageLayeredSeoGuide locale={locale} surface="tool" />
    </>
  );
}
