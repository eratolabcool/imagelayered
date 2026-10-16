import { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle2,
  Clapperboard,
  Download,
  Film,
  Layers,
  MoveHorizontal,
  Sparkles,
  Zap,
} from 'lucide-react';

export const metadata: Metadata = {
  title:
    'AI Animator Prep — Decompose Images into Parallax & Motion Layers | Image Layered',
  description:
    'Deconstruct flat artwork, landscapes, and scenes into clean 2.5D depth layers for After Effects, LoopFlow, and motion graphics. Automated foreground, midground, and background separation with occlusion filling.',
  keywords: [
    'animator prep ai',
    'layering images animations',
    'aescripts loopflow layer prep',
    'decompose image into layers',
    'parallax layer separation',
    '2.5d animation layer prep',
    'image to layers after effects',
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
    canonical: '/solutions/animator-prep',
  },
  openGraph: {
    type: 'website',
    url: '/solutions/animator-prep',
    title: 'AI Animator Prep — Separate Scenes for After Effects & Parallax',
    description:
      'Prepare flat illustrations for 2.5D camera push-ins, parallax depth, and loop animations. Export multi-layer PSD or ZIP for Adobe After Effects.',
    siteName: 'Image Layered',
  },
};

const structuredSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'Image Layered - Animator Prep',
      applicationCategory: 'DesignApplication',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
    {
      '@type': 'HowTo',
      name: 'How to prepare flat images for 2.5D motion and After Effects',
      step: [
        {
          '@type': 'HowToStep',
          position: 1,
          name: 'Upload scene or background',
          text: 'Upload any flat illustration, painting, landscape, or concept art in high resolution.',
        },
        {
          '@type': 'HowToStep',
          position: 2,
          name: 'Depth Layer Decomposition',
          text: 'Our AI model separates foreground elements, subject characters, midground architecture, and deep backgrounds.',
        },
        {
          '@type': 'HowToStep',
          position: 3,
          name: 'Occlusion Synthesis',
          text: 'Surfaces hidden behind moving foreground props are automatically filled and extended so camera moves do not expose gaps.',
        },
        {
          '@type': 'HowToStep',
          position: 4,
          name: 'Import to After Effects or Blender',
          text: 'Download as a multi-layer PSD or ZIP of transparent PNGs to set up 3D camera parallax or looping shaders.',
        },
      ],
    },
  ],
};

export default function AnimatorPrepPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-purple-600 selection:text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-zinc-800/80 bg-gradient-to-b from-zinc-900/80 via-zinc-950 to-zinc-950 px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(168,85,247,0.15),transparent_70%)]" />
        <div className="mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-purple-400">
            <Film className="size-3.5" />
            Motion Graphics & Parallax Preparation
          </div>
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            Prepare Flat Art for{' '}
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">
              2.5D Parallax & Motion
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-zinc-400 sm:text-lg">
            Effortlessly split single-layer paintings, concept art, and landscapes
            into depth planes for Adobe After Effects, LoopFlow, and Blender.
            Automated occluded background filling guarantees seamless camera
            camera pans.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
            <Link
              href="/studio"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-purple-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-purple-600/25 transition-all hover:bg-purple-500"
            >
              Start Decomposing for Motion
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/image-to-psd"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/80 px-6 py-3.5 text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-700 hover:text-white"
            >
              Export PSD Format
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-emerald-400" />
              <span>After Effects PSD Ready</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-emerald-400" />
              <span>Full Occlusion Filling</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-emerald-400" />
              <span>Parallax Depth Planes</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-emerald-400" />
              <span>LoopFlow Compatible</span>
            </div>
          </div>
        </div>
      </section>

      {/* Parallax Use Cases */}
      <section className="border-b border-zinc-800/80 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Turn Still Images into Cinematic Movement
            </h2>
            <p className="mt-2 text-sm text-zinc-400">
              Designed for motion designers, video editors, and game trailer
              artists.
            </p>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
              <MoveHorizontal className="size-6 text-purple-400" />
              <h3 className="mt-4 font-semibold text-white">2.5D Camera Parallax</h3>
              <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                Push your camera into the scene with genuine parallax. Foreground
                trees and props move faster than distant mountains.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
              <Clapperboard className="size-6 text-pink-400" />
              <h3 className="mt-4 font-semibold text-white">LoopFlow & Particle VFX</h3>
              <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                Isolate clouds, flowing rivers, or fog layers to apply looping
                flow maps without corrupting static landscape elements.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
              <Sparkles className="size-6 text-indigo-400" />
              <h3 className="mt-4 font-semibold text-white">Dynamic Animated Wallpapers</h3>
              <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                Generate high-framerate interactive wallpapers for Wallpaper
                Engine and mobile home screens from any AI render.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="px-4 py-16 text-center sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Speed up your animation pipeline
          </h2>
          <p className="mt-4 text-sm text-zinc-400">
            Open Studio now, decompose your first scene, and bring still art to
            life.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              href="/studio"
              className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-8 py-3.5 text-sm font-semibold text-white shadow-xl shadow-purple-600/25 transition hover:bg-purple-500"
            >
              Open Studio for Animator Prep
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
