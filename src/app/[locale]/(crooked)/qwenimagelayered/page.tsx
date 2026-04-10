import { Metadata } from 'next';

import CrookedAppWrapper from './CrookedAppWrapper';

export const metadata: Metadata = {
  title: 'AI Image Layering Tool | Split Photos into Layers',
  description: 'Free online tool to automatically split images into editable layers. Perfect for product photos, design, and marketing. Export in PNG, PSD, JPG formats.',
  keywords: 'image layering, AI image editor, split image layers, product photo editor, background removal, transparent layers, PSD export',
  alternates: {
    canonical: '/qwenimagelayered',
  },
  openGraph: {
    title: 'AI Image Layering Tool - Free Online',
    description: 'Automatically split images into editable layers. Perfect for e-commerce, design, and marketing. Export in PNG, PSD formats.',
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
