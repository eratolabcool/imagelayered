import { Metadata } from 'next';

import CrookedAppWrapper from './CrookedAppWrapper';

export const metadata: Metadata = {
  title: 'AI Photoshop for Posters | Edit Images Like Layers',
  description: 'The ultimate AI poster editor. Automatically split images into editable layers, replace products, and redesign posters with high-quality AI vision models.',
  keywords: 'AI Photoshop, poster editor, image layering, split image layers, product photo editor, background removal, transparent layers',
  alternates: {
    canonical: '/qwenimagelayered',
  },
  openGraph: {
    title: 'AI Photoshop for Posters - Edit Images Like Layers',
    description: 'Automatically split posters into editable layers. Replace products, change text, and redesign with professional AI.',
    type: 'website',
    url: '/qwenimagelayered',
    siteName: 'Image Layered AI',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'AI Photoshop for Posters',
  applicationCategory: 'DesignApplication',
  operatingSystem: 'Web Browser',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  description:
    'Upload a single picture, automatically split it into distinct editable layers, and seamlessly refine object cleanup or replacement.',
};

export default function QwenImageLayeredPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CrookedAppWrapper />
    </>
  );
}
