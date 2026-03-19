import { Metadata } from 'next';

import CrookedAppWrapper from './CrookedAppWrapper';

export const metadata: Metadata = {
  title: 'Qwen Image Layered | Online AI Image Decomposition Tool',
  description: 'Upload your image and instantly split it into editable transparent layers. Use our AI image layered workspace for effortless object removal, replacement, and recoloring workflows.',
  keywords: 'qwen image layered, image layer decomposition, split image into layers, AI image editor, automatic layer extraction',
  alternates: {
    canonical: '/qwenimagelayered',
  },
  openGraph: {
    title: 'Qwen Image Layered | Free Online Tool',
    description: 'Instantly split images into editable layers using advanced AI. Simplify your design workflow with automatic extraction.',
    type: 'website',
    url: '/qwenimagelayered',
    siteName: 'Image Layered AI',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Qwen Image Layered Online Tool',
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
