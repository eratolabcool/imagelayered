import { Metadata } from 'next';
import { CrookedApp } from '@/shared/blocks/crooked';
import '@/shared/blocks/crooked/styles/crooked.css';

// SEO Metadata optimized for target keywords
export const metadata: Metadata = {
  title: 'Qwen Image Layered - Free AI Image Layer Editor | Automatic Image Decomposition & RGBA Layer Separation',
  description: 'Free AI-powered image layer editor using Qwen Image Layered model. Automatically decompose images into RGBA layers, separate visual elements, and edit with AI. Photoshop alternative for automatic layer separation and image segmentation.',
  keywords: 'qwen image layered, image layer decomposition, RGBA layers, AI image editing, Photoshop alternative, image segmentation, automatic layer separation, free image editing, layer separation AI, image to layers, AI image decomposer',
  authors: [{ name: 'Qwen Image Layered Team' }],
  creator: 'Qwen Image Layered',
  publisher: 'Qwen Image Layered',
  applicationName: 'Qwen Image Layered Editor',
  category: 'Design Application',
  classification: 'Image Editing Software',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://your-domain.com/qwenimagelayered',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://your-domain.com/qwenimagelayered',
    title: 'Qwen Image Layered - Free AI Image Layer Decomposition Tool',
    description: 'Decompose images into editable RGBA layers automatically using Qwen AI. Free online image layer editor and Photoshop alternative.',
    siteName: 'Qwen Image Layered',
    images: [
      {
        url: 'https://your-domain.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Qwen Image Layered Editor Interface',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Qwen Image Layered - Free AI Image Layer Editor',
    description: 'Automatic image decomposition and RGBA layer separation powered by Qwen AI. Free online tool.',
    images: ['https://your-domain.com/og-image.jpg'],
  },
};

// Structured Data for SoftwareApplication
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Qwen Image Layered Editor',
  description: 'Free AI-powered image layer editor using Qwen Image Layered model for automatic image decomposition and RGBA layer separation.',
  applicationCategory: 'DesignApplication',
  operatingSystem: 'Web Browser',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  featureList: [
    'Automatic image layer decomposition',
    'RGBA layer separation',
    'AI-powered image editing',
    'Hierarchical layer management',
    'Image recoloring with AI',
    'Object replacement and removal',
    'High-resolution export',
    'Free to use',
  ],
  keywords: 'qwen image layered, image layer decomposition, RGBA layers, AI image editing, Photoshop alternative, image segmentation, automatic layer separation, free image editing',
  author: {
    '@type': 'Organization',
    name: 'Qwen Image Layered Team',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    ratingCount: '1250',
    bestRating: '5',
    worstRating: '1',
  },
};

export default function QwenImageLayeredPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CrookedApp />
    </>
  );
}
