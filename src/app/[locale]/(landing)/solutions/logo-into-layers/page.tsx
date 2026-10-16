import { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle2,
  Download,
  Layers,
  Shapes,
  Sparkles,
  Target,
  Type,
  Zap,
} from 'lucide-react';

export const metadata: Metadata = {
  title:
    'Convert Logo into Layers Online — Separate Icon, Text & Background | Image Layered',
  description:
    'Deconstruct flat logos, badges, and icons into separate, editable layers. Isolate symbols, wordmarks, and background textures with AI. Export to multi-layer PSD or transparent PNG.',
  keywords: [
    'convert logo into layers',
    'separate icon into layers',
    'logo layer separation ai',
    'extract logo from background online',
    'separate elements from image',
    'vector logo decomposition',
    'split logo text and icon',
  ],
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
    canonical: '/solutions/logo-into-layers',
  },
  openGraph: {
    type: 'website',
    url: '/solutions/logo-into-layers',
    title: 'Convert Logo & Icons into Editable Layers Online',
    description:
      'Separate logo symbols, typographic slogans, and background art into clean transparent layers without the original vector file.',
    siteName: 'Image Layered',
  },
};

const structuredSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'Image Layered - Logo into Layers',
      applicationCategory: 'DesignApplication',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
    {
      '@type': 'HowTo',
      name: 'How to separate a logo into layers',
      step: [
        {
          '@type': 'HowToStep',
          position: 1,
          name: 'Upload flat logo or icon',
          text: 'Upload any PNG, JPG, or WebP logo file, app icon, or brand badge.',
        },
        {
          '@type': 'HowToStep',
          position: 2,
          name: 'AI Element Separation',
          text: 'The model isolates the emblem/icon, brand name typography, secondary tagline, and background.',
        },
        {
          '@type': 'HowToStep',
          position: 3,
          name: 'Download transparent assets or PSD',
          text: 'Export individual elements as transparent PNGs or download the full multi-layer PSD file.',
        },
      ],
    },
  ],
};

export default function LogoIntoLayersPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-amber-600 selection:text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-zinc-800/80 bg-gradient-to-b from-zinc-900/80 via-zinc-950 to-zinc-950 px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(245,158,11,0.15),transparent_70%)]" />
        <div className="mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-amber-400">
            <Target className="size-3.5" />
            Brand Asset Extraction Engine
          </div>
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            Convert Any Logo into{' '}
            <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 bg-clip-text text-transparent">
              Editable Layers
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-zinc-400 sm:text-lg">
            No original vector AI or PSD file? Split flat emblems, app icons, and
            brand logos into clean, isolated layers: icon glyph, brand lettering,
            tagline, and backdrop.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
            <Link
              href="/studio"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-amber-600/25 transition-all hover:bg-amber-500"
            >
              Separate Logo Free
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/image-to-psd"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/80 px-6 py-3.5 text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-700 hover:text-white"
            >
              Export PSD Layers
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-emerald-400" />
              <span>Transparent PNG & PSD</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-emerald-400" />
              <span>Isolated Typography & Icon</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-emerald-400" />
              <span>Clean Vector-Ready Edges</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="px-4 py-16 text-center sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Extract and remaster your logo assets
          </h2>
          <p className="mt-4 text-sm text-zinc-400">
            Upload your logo in Studio and inspect the separated layers right
            now.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              href="/studio"
              className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-8 py-3.5 text-sm font-semibold text-white shadow-xl shadow-amber-600/25 transition hover:bg-amber-500"
            >
              Open Studio for Logo Separation
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredSchema) }}
      />
    </main>
  );
}
