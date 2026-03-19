import { Metadata } from 'next';

import CrookedAppWrapper from './CrookedAppWrapper';

export const metadata: Metadata = {
  title: 'Qwen Image Layered Tool | ProductViews',
  description: 'Upload one image, split it into editable layers, and refine removal, replacement, or recolor workflows in a simplified image layered workspace.',
  alternates: {
    canonical: '/qwenimagelayered',
  },
  openGraph: {
    title: 'Qwen Image Layered Tool | ProductViews',
    description: 'A simplified image layered workspace for upload, decomposition, and prompt-based editing.',
    type: 'website',
    url: '/qwenimagelayered',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'ProductViews Image Layered Tool',
  applicationCategory: 'DesignApplication',
  operatingSystem: 'Web Browser',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  description:
    'Upload one image, split it into editable layers, and refine object cleanup or replacement with prompt-based controls.',
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
