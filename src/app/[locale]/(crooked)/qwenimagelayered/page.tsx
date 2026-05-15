import { Metadata } from 'next';

import CrookedAppWrapper from './CrookedAppWrapper';

export const metadata: Metadata = {
  title: 'Image Layered | AI Photoshop for Posters',
  description: 'Upload any poster, split it into editable AI layers, edit selected objects with GPT Image 2, and export a polished redesigned poster.',
  keywords: 'Image Layered, AI Photoshop for posters, poster editor, editable AI layers, GPT Image editing, product replacement, text editing, image masks',
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
